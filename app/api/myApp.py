from flask import Flask, jsonify, request
from flask_cors import CORS
from xrpl.clients import JsonRpcClient
from xrpl.wallet import generate_faucet_wallet
from xrpl.core import addresscodec
from xrpl.models.requests.account_info import AccountInfo
import json

import db

app = Flask(__name__)
CORS(app)

JSON_RPC_URL = "https://s.altnet.rippletest.net:51234/"
client = JsonRpcClient(JSON_RPC_URL)


# Create a wallet using the Testnet faucet:
# https://xrpl.org/xrp-testnet-faucet.html
print("\nCreating a test product wallet and funding it with Testnet XRP...")
test_wallet = generate_faucet_wallet(client, debug=True)
test_wallet_seed = test_wallet.seed

def fill_wallets(): 
    for i in range(13):
        test_wallet = generate_faucet_wallet(client, debug=True)
        test_wallet_seed = test_wallet.seed
    
    

@app.route("/")
def home():
    return jsonify({}), 200

@app.route("/login")
def 

@app.route('/productMVP'):
    data = request.json

    goal = data['goal']
    days = data['days']

    # hardcoded wallet for now
    EXISTING_SEED = test_wallet_seed 

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

    

@app.route('/manufacturer')

@app.route('/investor/')
def investorPage():
    

@app.route()
