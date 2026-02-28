from flask import Flask, jsonify, request
from flask_cors import CORS

import db

app = Flask(__name__)
CORS(app)

def fill_wallets():
    projects = get_all_projects()

    for project in projects:
        project_id = project['id']
        project_wallet_seed = project['project_wallet_seed']

        if project_wallet_seed is None:
            test_wallet = generate_faucet_wallet(client, debug=True)
            test_wallet_seed = test_wallet.seed
            


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/projects")
def projects():
    return jsonify(get_all_projects())


@app.route("/projects/featured")
def projects_featured():
    return jsonify(get_projects_by_flag("is_featured"))


@app.route("/projects/recommended")
def projects_recommended():
    return jsonify(get_projects_by_flag("is_recommended"))


@app.route("/projects/popular")
def projects_popular():
    return jsonify(get_projects_by_flag("is_popular"))

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
    return jsonify(get_all_users())


@app.route("/users/<int:user_id>")
def user(user_id):
    result = get_user_by_id(user_id)
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
