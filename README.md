Pre-condition
-------------
	1) node version v8.11.3 or higher
	2) npm  version 5.6.0 or higher


How to install cli wallet?
--------------------------
	step1:
		mkdir -p <workspace>
		cd <workspace>
		git clone https://github.com/wanchain/wanchain-js-walletcli.git

	step2:
		cd <workspace>/wanchain-js-walletcli
		npm install


How to start cli wallet?
------------------------
	step1:
		cd <workspace>/wanchain-js-walletcli

	step2:
		node commands/cli.js
		wallet-cli$


How to use cli wallet ?
-----------------------
Help

	Commands supported by cli wallet:

    1.  help [command...]  Provides help for a given command.
    2.  exit               Exits application.
    3.  lock               lock token on source chain
    4.  redeem             redeem token on destination chain
    5.  revoke             revoke token on source chain
    6.  balance            get balance of selected account or input account for special tokens.
    7.  list               list detailed information of transaction


Examples
--------

Example 1: (Lock on ETH chain, redeem on WAN chain)

    Alice wants to cross ETH tocken from ETH chain to WAN chain. Firstly she needs lock ETH on
    the source chain(here the source chain is ETH), and redeem her ETH on the destination chain
    (here the destination chain is WAN).

    step1:
    Select source chain by input the index.
    wallet-cli$ lock
    ============================================================
    Source Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================

    step2:
    Select coin(ETH,BTC etc.) index, or ERC20 token(WCT,...) index
    ============================================================
    Token Symbol                                              Token Address
    1: ETH                                                              ETH
    2: WCT                       0xb410aa9124e5623d62cbb82b4fbe38a7230c6590
    Input the index: 1

    step3:
    Select the source account (sender account)
    ============================================================
    Sender Account(ETH)                                           ETH Balance
    1: 0xb7e3daa87ed427381b7a35255a90ebd5c72e0414                           5
    2: 0xdcba038e8453cf9f9360bfbce68766a56d32e25c                           5
    3: 0x715c9588f1f4df3a91d15822b78218273e1a5128                           0
    4: 0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38        9.411211331519999998
    Input the index or address of sender: 4

    step4:
    Select storeman, you can check the Ratio of Fee
    Storeman Group Address                                                 Quota  Fee Ratio
    1: 0x41623962c5d44565de623d53eb677e0f300467d2         326.589733350729012352       0.1%
    2: 0xa89f7702fb9f237aad805e8f99a2793f58e81242                         0.3125       0.1%
    3: 0xc27ecd85faa4ae80bf5e28daf91b605db7be1ba8                         0.2923       0.1%
    Input the index or address: 1
    ============================================================

    step5:
    Select the destination account(reciever account)
    Reciever Account(WAN)                                         WAN Balance               WETH Balance
    1: 0xe38d3a902ef40738f8d372c926a3d57381b67faa                           0                          0
    2: 0x2fb19a0e51f87e5acc0389bf9c402ade423bc6f7                           0                          0
    3: 0xc80513fd31d49a6f8fa339a977edcaee9e87554d                           0                          0
    4: 0xf491746f6ad31f8e07f8b2e99a3389c28cd10943                           0                          0
    5: 0x393e86756d8d4cf38493ce6881eb3a8f2966bb27    59014.341187945599736312                    2.32351
    Input the index or address of reciever: 5

    step6:
    Input transfer amount, and gas price , gas limit, and password

    Input transaction amount: 0.001
    Input gas price (Recommend 10Gwei-60Gwei): 12
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting...
    txHash: 0xcfe9b4c16f272d5461aeef6cd2aa00707fe2f97616402fc49ce4e699f1d022b8

    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Locked token on source chain done.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    step7:
    wallet-cli$ redeem
    No transaction for redeem found. Please try later.

    tips:
        After lock token done, Alice should wait some minutes

    step8:
    =====================================================================================
    1:
    Name:                                                                             ETH
    LockHash:          0xcfe9b4c16f272d5461aeef6cd2aa00707fe2f97616402fc49ce4e699f1d022b8
    HashX:             0xd1900bedf278c32880db6e9b0ea868ffb9be60acb584d265d1e4f05231f3c716
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                         0.001
    Status:                                                                   BuddyLocked
    Input index or hashX:1

    step9:

    Input gas price , gas limit and password

    Input index or hashX: 1
    Input gas price (Recommend 180Gwin-600Gwin): 400
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting...
    txHash:  0x436d92ec37b8cea8a3aa8dd82040e7b7700b067283d21338ae360c6b8e561c1a


     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     Redeemed token on destination chain done.
     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Example 2: (Check Alice's balance)

    step1: check token amount on source chain.

    wallet-cli$ balance
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol
    1:ETH
    2:WCT
    3:WCT_One
    4:WCT_Two
    5:WCT_Three
    Input the index: 1
    1: 0xb7e3daa87ed427381b7a35255a90ebd5c72e0414
    2: 0xdcba038e8453cf9f9360bfbce68766a56d32e25c
    3: 0x715c9588f1f4df3a91d15822b78218273e1a5128
    4: 0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    Input the index or address of account: 4
    Account                                                               ETH
    0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38           9.408083755519999998

    step2: check token amount on destination chain.
    wallet-cli$ balance
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 2
    ============================================================
    Token Symbol
    1:WETH
    2:WWCT
    3:WWCT_One
    4:WWCT_Two
    5:WWCT_Three
    6:WAN
    Input the index: 1
    1: 0xe38d3a902ef40738f8d372c926a3d57381b67faa
    2: 0x2fb19a0e51f87e5acc0389bf9c402ade423bc6f7
    3: 0xc80513fd31d49a6f8fa339a977edcaee9e87554d
    4: 0xf491746f6ad31f8e07f8b2e99a3389c28cd10943
    5: 0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Input the index or address of account: 5
    Account                                                              WETH
    0x393e86756d8d4cf38493ce6881eb3a8f2966bb27                        2.32451

Example 3 (list transaction detailed info.)

    steps: select source chain, and token symbol, list command can display all
    the transactions of the selected conditions.

    wallet-cli$ list
    ============================================================
    Source Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol                                              Token Address
    1: ETH                                                              ETH
    2: WCT                       0xb410aa9124e5623d62cbb82b4fbe38a7230c6590
    3: WCT_One                   0x7017500899433272b4088afe34c04d742d0ce7df
    4: WCT_Two                   0xce7fb657a37afa635f60a4e2c707bb47737d511c
    5: WCT_Three                 0x40e72d86819cef00172db2250cdb222041d12112
    Input the index: 1
    =====================================================================================
    Name:                                                                             ETH
    LockHash:          0x3e57e9f7347461f221963e600e150ddc507a3c11b32b96a71a4a8ecd26f4917a
    HashX:             0xf89abe31ecfd3436e2ef5a9b7286b6c5403a0c7e0267f02c7dea0ca3325391f9
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                           0.2
    Status:                                                                      Redeemed
    =====================================================================================
    Name:                                                                             ETH
    LockHash:          0xcfe9b4c16f272d5461aeef6cd2aa00707fe2f97616402fc49ce4e699f1d022b8
    HashX:             0xd1900bedf278c32880db6e9b0ea868ffb9be60acb584d265d1e4f05231f3c716
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                         0.001
    Status:                                                                      Redeemed

Example 4 (Revoke on source chain)
    After Alice lock token on source chain, she change her mind. Now ,she can revoke this
    transaction on source chain.

    step1:
    wallet-cli$ revoke
    =====================================================================================
    1:
    Name:                                                                         WCT_One
    LockHash:          0x93a3d71c9e7a73557f90b904d06bd5ef0817db3dd3e08643cff2a668cd01a4d6
    HashX:             0x1ddefc15d925ad4bcc2d5a96e554f6ae92d2eceffc4a5273a3d6f04165a53418
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                             1
    Status:                                                                   BuddyLocked
    Input index or hashX: 1

    step2:
    Input gas price, gas limit,and password.

    Input gas price (Recommend 10Gwei-60Gwei): 15
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting...
    txHash:  0x3b72a63c02a2a806fc26fdf35661d0220f6269cc08f596d9e723ef3ec2f9db65



Tips:
----

    1)  Description of some status of cross transaction

    Locked:         Alice has Locked coin or token on source chain successfully.
    BuddyLocked:    Alice can Redeem her coin or token on destination chain.
    Redeemed:       Alice has finished Redeem on destination chain.
    Revoked:        Alice has Revoked her token or coin because she want NOT continue.

    2) Some states Explanation.
    RedeemSent:     Alice has sent Redeem transaction,and this transaction has not been mined.
                    In this scenario, Alice should wait some minutes, and NOT send Redeem again.
                    If the transaction has NOT been changed to Redeemed after a long time, she
                    can try Redeem again.

    RevokeSent:     Alice has sent Revoke transaction,and this transaction has not been mined.
                    In this scenario, Alice should wait some minutes, and NOT send Revoke again.
                    If the transaction has NOT been changed to Revoked after a long time, she
                    can try Revoke again.
