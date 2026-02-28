from flask import Flask, jsonify, request
from flask_cors import CORS

from xrpl.models import EscrowCreate, EscrowFinish
from xrpl.transaction import submit_and_wait
from xrpl.utils import datetime_to_ripple_time

from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet, generate_faucet_wallet
from xrpl.models.requests import AccountInfo

import db

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")

app = Flask(__name__)
CORS(app)

JSON_RPC_URL = "https://s.altnet.rippletest.net:51234/"
client = JsonRpcClient(JSON_RPC_URL)


def fill_wallets():
    projects = db.get_all_projects()

    for project in projects:
        project_id = project['id']
        project_wallet_seed = project['project_wallet_seed']

        if project_wallet_seed is None:
            wallet = generate_faucet_wallet(client, debug=True)
            wallet_seed = wallet.seed
            if not db.update_project_wallet(project_id, wallet_seed):
                print("project wallet seed addition failed!")

# Fill all wallets for all projects / users with no wallets
fill_wallets()


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



@app.route("")
def button_press(user_id: int, project_id: int, invest_amount: str, date):
    user_wallet_seed = db.get_user_wallet_seed(user_id)
    project_wallet_seed = db.get_project_by_id(project_id)['project_wallet_seed']

    user_wallet = Wallet.from_seed(user_wallet_seed)
    project_wallet = Wallet.from_seed(project_wallet_seed)

    escrow_create = EscrowCreate(
        account = user_wallet.address,
        destination = project_wallet.address,
        amount = invest_amount, # drops of XRP
        condition = condition_hex,
        cancel_after = cancel_after_rippletime
    )
    response = submit_and_wait(escrow_create, client, user_wallet, autofill=True)

@app.route("/projects/<int:project_id>")
def project(project_id):
    data = request.json

    goal = data['goal']
    days = data['days']

    curr_project = db.get_project_by_id(project_id)

    # project wallet seed
    EXISTING_SEED = curr_project['project_wallet_seed']

    # This creates the wallet instance from the seed
    my_wallet = Wallet.from_seed(EXISTING_SEED)

    investment_account = my_wallet.classic_address
    prod_info = AccountInfo(
        account=investment_account,
        ledger_index="validated",
        strict=True,
    )

    response = client.request(prod_info)
    prod_result = response.result

    curr_investment = prod_result["account_data"]["balance"]

    ret_data = {
        "curr_investment": curr_investment,
        "goal": goal,
        "days": days
    }

    return jsonify(ret_data), 200


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
