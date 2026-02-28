import os
import hashlib
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify, request
from flask_cors import CORS

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet, generate_faucet_wallet
from xrpl.models.requests import AccountInfo
from xrpl.models import EscrowCreate
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time

import db

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

app = Flask(__name__)
CORS(app)


def generate_condition_fulfillment():
    """
    Generate a PREIMAGE-SHA-256 condition/fulfillment pair for XRPL escrow.
    Returns (condition_hex, fulfillment_hex) as uppercase hex strings.
    """
    preimage = os.urandom(32)
    fingerprint = hashlib.sha256(preimage).digest()
    cost = len(preimage).to_bytes(2, "big")  # 32 -> b'\x00\x20'

    # Fulfillment DER: A0 22 80 20 {32-byte preimage}
    fulfillment = bytes([0xA0, 0x22, 0x80, 0x20]) + preimage

    # Condition DER: A0 26 80 20 {32-byte SHA-256(preimage)} 81 02 {2-byte cost}
    condition = bytes([0xA0, 0x26, 0x80, 0x20]) + fingerprint + bytes([0x81, 0x02]) + cost

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
        # Classic addresses start with 'r' — not a usable seed
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


@app.route("/escrow", methods=["POST"])
def create_escrow():
    body = request.get_json()
    project_id      = body.get("project_id")
    user_wallet_seed = body.get("user_wallet_seed")
    amount_xrp      = body.get("amount")
    user_id         = body.get("user_id")

    if not all([project_id, user_wallet_seed, amount_xrp]):
        return jsonify({"error": "Missing required fields: project_id, user_wallet_seed, amount"}), 400

    project = db.get_project_by_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    project_seed = project.get("project_wallet_seed")
    if not project_seed:
        return jsonify({"error": "Project wallet not initialised — run fill_wallets first"}), 400

    try:
        user_wallet    = Wallet.from_seed(user_wallet_seed)
        project_wallet = Wallet.from_seed(project_seed)
        project_address = project_wallet.classic_address

        half_xrp   = float(amount_xrp) / 2
        half_drops = str(int(half_xrp * 1_000_000))

        cancel_delay = 300
        cancel_after = datetime.now(tz=timezone.utc) + timedelta(seconds=cancel_delay)
        cancel_after_rippletime = datetime_to_ripple_time(cancel_after)

        results = []
        for escrow_type in ("fund_reaching", "on_shipment"):
            condition_hex, fulfillment_hex = generate_condition_fulfillment()

            escrow_tx = EscrowCreate(
                account=user_wallet.classic_address,
                destination=project_address,
                amount=half_drops,
                condition=condition_hex,
                cancel_after=cancel_after_rippletime,
            )

            response = submit_and_wait(escrow_tx, client, user_wallet, autofill=True)
            escrow_seq = response.result["tx_json"]["Sequence"]

            escrow_id = db.create_escrow(
                user_id=user_id,
                project_id=project_id,
                amount=half_xrp,
                escrow_type=escrow_type,
                condition_hex=condition_hex,
                fulfillment_hex=fulfillment_hex,
                escrow_sequence=escrow_seq,
                escrow_account=user_wallet.classic_address,
                destination=project_address,
            )

            results.append({
                "id": escrow_id,
                "type": escrow_type,
                "amount_xrp": half_xrp,
                "sequence": escrow_seq,
            })

        return jsonify({"escrows": results}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
