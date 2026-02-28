import os
import hashlib
import json
import time
from datetime import datetime, timedelta, timezone

import requests as http_requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sock import Sock

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet, generate_faucet_wallet
from xrpl.models.requests import AccountInfo, AccountObjects, Tx
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time

import db

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

XAMAN_API_KEY    = os.environ.get("XAMAN_API_KEY", "")
XAMAN_API_SECRET = os.environ.get("XAMAN_API_SECRET", "")

app = Flask(__name__)
CORS(app)
sock = Sock(app)

# In-memory store for pending Xaman payloads keyed by uuid
pending_escrows: dict = {}


def generate_condition_fulfillment():
    """
    Generate a PREIMAGE-SHA-256 condition/fulfillment pair for XRPL escrow.
    Returns (condition_hex, fulfillment_hex) as uppercase hex strings.
    """
    preimage = os.urandom(32)
    fingerprint = hashlib.sha256(preimage).digest()
    cost = len(preimage).to_bytes(2, "big")

    fulfillment = bytes([0xA0, 0x22, 0x80, 0x20]) + preimage
    condition    = bytes([0xA0, 0x26, 0x80, 0x20]) + fingerprint + bytes([0x81, 0x02]) + cost

    return condition.hex().upper(), fulfillment.hex().upper()


def fill_wallets():
    projects = db.get_all_projects()
    for project in projects:
        if project["project_wallet_seed"] is None:
            wallet = generate_faucet_wallet(client, debug=True)
            if not db.update_project_wallet(project["id"], wallet.seed):
                print(f"wallet seed addition failed for project {project['id']}")


def fill_user_wallets():
    users = db.get_all_users()
    for user in users:
        seed = user.get("user_wallet_seed") or ""
        if not seed or seed.startswith("r"):
            wallet = generate_faucet_wallet(client, debug=True)
            db.update_user_wallet(user["id"], wallet.seed)
            print(f"generated faucet wallet for user {user['username']}")


fill_wallets()
fill_user_wallets()


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/projects")
def projects():
    return jsonify(db.get_all_projects())


@app.route("/projects/featured")
def projects_featured():
    return jsonify(db.get_projects_by_flag("is_featured"))


@app.route("/projects/recommended")
def projects_recommended():
    return jsonify(db.get_projects_by_flag("is_recommended"))


@app.route("/projects/popular")
def projects_popular():
    return jsonify(db.get_projects_by_flag("is_popular"))


@app.route("/projects/<int:project_id>")
def project(project_id):
    curr_project = db.get_project_by_id(project_id)
    if not curr_project:
        return jsonify({"error": "Project not found"}), 404

    EXISTING_SEED = curr_project["project_wallet_seed"]
    if not EXISTING_SEED:
        return jsonify({"error": "Project wallet not initialised"}), 400

    my_wallet = Wallet.from_seed(EXISTING_SEED)
    prod_info = AccountInfo(
        account=my_wallet.classic_address,
        ledger_index="validated",
        strict=True,
    )
    response = client.request(prod_info)
    curr_investment = response.result["account_data"]["balance"]

    return jsonify({
        "curr_investment": curr_investment,
        "goal": curr_project["goal"],
        "days": curr_project["days_left"],
    }), 200


@app.route("/escrow/payload", methods=["POST"])
def create_escrow_payload():
    """
    Create two Xaman sign payloads (fund_reaching + on_shipment).
    Returns QR code URLs and WebSocket URLs for the frontend to display.
    """
    body        = request.get_json()
    project_id  = body.get("project_id")
    amount_xrp  = body.get("amount")
    user_id     = body.get("user_id")

    if not all([project_id, amount_xrp]):
        return jsonify({"error": "Missing required fields: project_id, amount"}), 400

    project = db.get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    project_seed = project.get("project_wallet_seed")
    if not project_seed:
        return jsonify({"error": "Project wallet not initialised"}), 400

    project_wallet  = Wallet.from_seed(project_seed)
    project_address = project_wallet.classic_address

    half_xrp   = float(amount_xrp) / 2
    half_drops = str(int(half_xrp * 1_000_000))

    cancel_after = datetime.now(tz=timezone.utc) + timedelta(seconds=300)
    cancel_after_rippletime = datetime_to_ripple_time(cancel_after)

    xaman_headers = {
        "Content-Type": "application/json",
        "X-API-Key":    XAMAN_API_KEY,
        "X-API-Secret": XAMAN_API_SECRET,
    }

    payloads = []
    for escrow_type in ("fund_reaching", "on_shipment"):
        condition_hex, fulfillment_hex = generate_condition_fulfillment()

        xaman_resp = http_requests.post(
            "https://xumm.app/api/v1/platform/payload",
            json={
                "txjson": {
                    "TransactionType": "EscrowCreate",
                    "Destination":     project_address,
                    "Amount":          half_drops,
                    "Condition":       condition_hex,
                    "CancelAfter":     cancel_after_rippletime,
                }
            },
            headers=xaman_headers,
            timeout=10,
        )

        if not xaman_resp.ok:
            return jsonify({"error": f"Xaman API error: {xaman_resp.text}"}), 500

        xaman_data = xaman_resp.json()
        uuid = xaman_data["uuid"]

        # Store everything needed to create the DB record after signing
        pending_escrows[uuid] = {
            "user_id":        user_id,
            "project_id":     project_id,
            "amount":         half_xrp,
            "escrow_type":    escrow_type,
            "condition_hex":  condition_hex,
            "fulfillment_hex": fulfillment_hex,
            "destination":    project_address,
        }

        payloads.append({
            "uuid":       uuid,
            "type":       escrow_type,
            "amount_xrp": half_xrp,
            "qr_url":     xaman_data["refs"]["qr_png"],
            "ws_url":     xaman_data["refs"]["websocket_status"],
            "sign_url":   xaman_data["next"]["always"],
        })

    return jsonify({"payloads": payloads}), 201


@app.route("/escrow/confirm", methods=["POST"])
def confirm_escrow():
    """
    Called by the frontend after the user signs a payload in Xaman.
    Fetches the signed tx from Xaman, looks up the sequence on-ledger,
    and writes the final escrow record to the DB.
    """
    body = request.get_json()
    uuid = body.get("uuid")

    pending = pending_escrows.get(uuid)
    if not pending:
        return jsonify({"error": "Payload not found or already confirmed"}), 404

    xaman_headers = {
        "Content-Type": "application/json",
        "X-API-Key":    XAMAN_API_KEY,
        "X-API-Secret": XAMAN_API_SECRET,
    }

    r = http_requests.get(
        f"https://xumm.app/api/v1/platform/payload/{uuid}",
        headers=xaman_headers,
        timeout=10,
    )
    if not r.ok:
        return jsonify({"error": "Could not fetch Xaman payload"}), 500

    xaman_data    = r.json()
    meta          = xaman_data.get("meta", {})
    response_data = xaman_data.get("response", {})

    if not meta.get("signed"):
        return jsonify({"error": "Transaction not signed yet"}), 400

    escrow_account = response_data.get("account")
    txid           = response_data.get("txid")

    # Look up the sequence number from the ledger using the txid
    escrow_sequence = None
    if txid:
        try:
            tx_info = client.request(Tx(transaction=txid))
            tx_obj  = tx_info.result.get("tx_json") or tx_info.result.get("tx", {})
            escrow_sequence = tx_obj.get("Sequence")
        except Exception:
            pass

    escrow_id = db.create_escrow(
        user_id=pending["user_id"],
        project_id=pending["project_id"],
        amount=pending["amount"],
        escrow_type=pending["escrow_type"],
        condition_hex=pending["condition_hex"],
        fulfillment_hex=pending["fulfillment_hex"],
        escrow_sequence=escrow_sequence,
        escrow_account=escrow_account or "unknown",
        destination=pending["destination"],
    )

    del pending_escrows[uuid]

    return jsonify({
        "id":         escrow_id,
        "type":       pending["escrow_type"],
        "amount_xrp": pending["amount"],
        "sequence":   escrow_sequence,
        "account":    escrow_account,
        "txid":       txid,
    }), 200


@sock.route("/ws/project/<int:project_id>")
def project_ws(ws, project_id):
    """
    WebSocket that pushes live on-chain stats every 5 seconds by querying
    the XRPL testnet directly for escrow objects destined for the project wallet.

      - raised_xrp : total XRP locked in escrows going to this project (on-chain)
      - backers    : number of those escrow objects / 2  (each backer creates 2)
    """
    project = db.get_project_by_id(project_id)
    if not project or not project.get("project_wallet_seed"):
        ws.send(json.dumps({"error": "Project not found"}))
        return

    project_wallet  = Wallet.from_seed(project["project_wallet_seed"])
    project_address = project_wallet.classic_address

    while True:
        try:
            response = client.request(AccountObjects(
                account=project_address,
                type="escrow",
                ledger_index="validated",
            ))

            escrow_objects = response.result.get("account_objects", [])

            # Keep only escrows where this project is the destination
            # (filters out any escrows the project itself might have created)
            incoming = [
                obj for obj in escrow_objects
                if obj.get("Destination") == project_address
            ]

            total_drops = sum(int(obj["Amount"]) for obj in incoming)
            total_xrp   = total_drops / 1_000_000
            backers     = len(incoming) // 2

            ws.send(json.dumps({
                "raised_xrp": total_xrp,
                "backers":    backers,
            }))
            time.sleep(5)
        except Exception:
            break


@app.route("/users")
def users():
    return jsonify(db.get_all_users())


@app.route("/users/<int:user_id>")
def user(user_id):
    result = db.get_user_by_id(user_id)
    if result is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(result)


@app.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    user = db.login_user(body.get("username", ""), body.get("password", ""))
    if user is None:
        return jsonify({"error": "Invalid credentials"}), 401
    return jsonify(user)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
