# SafeFund

<p align="center">
    <img src="https://github.com/YellowDucky123/xrpl-hackathon/blob/main/assets/logo.png" width=500>
</p>

## Quickstart
1. Clone the repo using `git clone git@github.com:YellowDucky123/xrpl-hackathon.git`
2. `cd xrpl-hackathon`
3. `docker compose up --build`
4. Open localhost:3000 (default) or whichever local port is exposted for SafeFund
5. Test with credentials "Max" with password "Test"
6. With a [Xaman Developer Wallet](https://help.xaman.app/app/learning-more-about-xaman/how-to-access-testnet-on-xrp-ledger) and a phone camera app (or QR scanner) scan the QR code after choosing a tier of USB Cypto wallet. 
7. Expect dev crypto wallets to drop.

**DO NOT SCAN THESE WITH A REAL ACTIVE WALLET**. While it shouldn't go through I wouldn't want to be responsible for a 5 XRP loss ;)

## Problem Statement
"To eliminate risk is to eliminate worry"

We love joining kickstarters, an act of paying upfront for a product that comes later, however this process of waiting comes with risks of either; the product not being delivered, the money being stolen, or promises unfulfilled. So what if we could reduce the risk and lower the barrier to entry using XRP Escrows. 

By splitting the purchase into two escrows and disolving them only when the product is fulfilled, then delivered we ensure the risk is halved. 

This works because SafeFund controls the keys to disolving the escrows.

## Feature Testing 
Hashes represent different features that can be tested by rolling back
`64016591a756b76d97d4708d1b87b49ec65533f0` - Xaman API integration with devnet
`b61d4f284dbd1cc291907fac695ca6b5da4e5126` - Basic seed to seed transfer. Not safe therefore moved to Xaman integration
