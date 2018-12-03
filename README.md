Pre-condition
-------------
	1) node version v8.11.3 or higher
	2) npm  version 5.6.0 or higher
    3) git


How to install cli wallet?
--------------------------
	step1:
		mkdir -p <workspace>
		cd <workspace>
		git clone https://github.com/wanchain/wanchain-js-walletcli.git
		git clone https://github.com/wanchain/wanchain-js-sdk.git

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
    3.  lock               lock token on source chain.
    4.  redeem             redeem token on destination chain.
    5.  revoke             revoke token on source chain.
    6.  balance            get balance.
    7.  transfer           transfer coin or token.
    8.  list               list transaction.
    9.  create             create account.
    10. approve            approve token to HTLC contract.


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
    Select coin(ETH,BTC etc.) index, or ERC20 token(ZRX,...) index.
    ============================================================
    Token Symbol                                              Token Address
    1: ETH                                                              ETH
    2: MKR                       0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2
    3: DAI                       0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359
    4: ZRX                       0x00f58d6d585f84b2d7267940cede30ce2fe6eae8
    5: AURA                      0xcdcfc0f66c522fd086a1b725ea3c0eeb9f9e8814
    6: LRC                       0xef68e7c694f40c8202821edf525de3782458639f
    7: LINK                      0x514910771af9ca656af840dff83e8264ecf986ca
    Input the index: 1


    step3:
    Make sure the keystore files of ETH that you need are all in the right place. 
    Select the source account (sender account).
    ============================================================
    Sender Account(ETH)                                           ETH Balance
    1: 0xb7e3daa87ed427381b7a35255a90ebd5c72e0414                  2.99912486
    2: 0xdcba038e8453cf9f9360bfbce68766a56d32e25c                  3.99978996
    3: 0x715c9588f1f4df3a91d15822b78218273e1a5128                           1
    4: 0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38        9.892408386519999998
    5: 0x7cf2f6b931c863af4607cf88b0e21d5815ccba0f                           0
    6: 0x260fb7693e4328cd33c78d83bba1ecb002c34e28                           0
    7: 0x5e8b9dc70ba14e40fb7de0562ca411aba94ada12                           0
    8: 0xe85b49579244b9cde82cfb3611fdf7954b64f549                           0
    Input the index or address of sender: 1

    step4:
    Select storeman, you can check the Ratio of Fee.
    Storeman Group Address                                                 Quota  Fee Ratio
    1: 0x41623962c5d44565de623d53eb677e0f300467d2         312.300498782837777785       0.1%
    Input the index or address: 1
    ============================================================

    step5:
    Make sure the keystore files of WAN that you need are all in the right place. 
    Select the destination account(reciever account).
    Receiver Account(WAN)                                         WAN Balance               WETH Balance
    1: 0xe38d3a902ef40738f8d372c926a3d57381b67faa                  90.9747952                          0
    2: 0x2fb19a0e51f87e5acc0389bf9c402ade423bc6f7                          30                          0
    3: 0xc80513fd31d49a6f8fa339a977edcaee9e87554d                           0                          0
    4: 0xf491746f6ad31f8e07f8b2e99a3389c28cd10943                           0                          0
    5: 0x393e86756d8d4cf38493ce6881eb3a8f2966bb27    22287.627226265599736312                    2.68251
    6: 0x884d664e92048a30a8158d0955e52c2e4ccd3636                           0                          0
    Input the index or address of receiver: 5

    step6:
    Input transfer amount, and gas price, gas limit, and password.

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
    wallet-cli$ redeem
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
    Input gas price, gas limit and password.

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
    2:MKR
    3:DAI
    4:ZRX
    5:WCTODD
    6:LRC
    7:LINK

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
    2:WMKR
    3:WDAI
    4:WZRX
    5:WWCTODD
    6:WLRC
    7:WLINK
    8:WAN

    Input the index: 1
    1: 0xe38d3a902ef40738f8d372c926a3d57381b67faa
    2: 0x2fb19a0e51f87e5acc0389bf9c402ade423bc6f7
    3: 0xc80513fd31d49a6f8fa339a977edcaee9e87554d
    4: 0xf491746f6ad31f8e07f8b2e99a3389c28cd10943
    5: 0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Input the index or address of account: 5
    Account                                                              WETH
    0x393e86756d8d4cf38493ce6881eb3a8f2966bb27                        2.32451

    tips:
        After redeem token done, Alice should wait some minutes.

Example 3 (List transaction detailed info.)

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
    2: MKR                       0x54950025d1854808b09277fe082b54682b11a50b
    3: DAI                       0xdbf193627ee704d38495c2f5eb3afc3512eafa4c
    4: ZRX                       0x00f58d6d585f84b2d7267940cede30ce2fe6eae8
    5: WCTODD                    0xd5cc1810197238b06f0f333b1cb2046e0c6ece9a
    6: LRC                       0x35d957f150953a056aaf6465fd26379278324848
    7: LINK                      0x01be23585060835e02b77ef475b0cc51aa1e0709

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
    =====================================================================================
    Name:                                                                             ETH
    LockHash:          0x8850b411dcf2b97cb39d6baed8b6490cecc3cea2001779d7bdf7361906bacfdf
    HashX:             0x191d5288ca4dc31f864ef76f753398d2fc72f2caae4ce498809d7a10a4711e3c
    From:                                      0xb7e3daa87ed427381b7a35255a90ebd5c72e0414
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                           0.2
    Status:                                                                      Redeemed
    =====================================================================================
    Name:                                                                             ETH
    LockHash:          0xcd41954ece3c0563d66acad06488dd69e437d16b7934b10e18aa4df0cfff1b29
    HashX:             0x62b1b7477c33e4e4113e43fa3ade9dbffbdd655a242b000b942dce2c4166d2b5
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                          0.02
    Status:                                                                       Revoked

Example 4 (Revoke on source chain)

    After Alice lock token on source chain, she changes her mind. Alice needs to wait for 
    the Storeman timeout (HTLC), and then she can revoke this transaction on source chain.

    step1:
    wallet-cli$ revoke
    =====================================================================================
    =====================================================================================
    1:
    Name:                                                                             ETH
    LockHash:          0xcd41954ece3c0563d66acad06488dd69e437d16b7934b10e18aa4df0cfff1b29
    HashX:             0x62b1b7477c33e4e4113e43fa3ade9dbffbdd655a242b000b942dce2c4166d2b5
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                          0.02
    Status:                                                                   BuddyLocked
    =====================================================================================
    2:
    Name:                                                                             ETH
    LockHash:          0x884917db1c14ea8d646ec1ed82c3bd595341f568c7290dac5d30e71ff0336ecf
    HashX:             0x03f8dcc2fcc9d9a887b3508d8b0a4816e310778f2e66c850c6adae3fd204b1dd
    From:                                      0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    To:                                        0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    Source Chain:                                                                     WAN
    Destination Chain:                                                                ETH
    Amount:                                                                          0.01
    Status:                                                                   BuddyLocked
    =====================================================================================
    3:
    Name:                                                                             ZRX
    LockHash:          0xccaea544a9a6b5c85a4453547f8d501b9ff777f1b51b9bd42ea8b4c7fe4c5f47
    HashX:             0x4b8c5d2cce2085578deca7915df37df88e8a1ccb07942758a56a525b1d976b14
    From:                                      0xf47a8bb5c9ff814d39509591281ae31c0c7c2f38
    To:                                        0x393e86756d8d4cf38493ce6881eb3a8f2966bb27
    Source Chain:                                                                     ETH
    Destination Chain:                                                                WAN
    Amount:                                                                          0.02
    Status:                                                                   BuddyLocked
    =====================================================================================
    Input index or hashX: 3

    step2:
    Input gas price, gas limit, and password.

    Input gas price (Recommend 10Gwei-60Gwei): 15
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting...
    txHash:  0x3b72a63c02a2a806fc26fdf35661d0220f6269cc08f596d9e723ef3ec2f9db65

Example 5 (Create account on source chain)

    Alice wants to create a new account on source chain (ETH). She can check 
    this amount on source chain.

    step1:
    wallet-cli$ create
    =====================================================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    Input the password: ******
    Confirm the password: ******
    Account: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f

    step2:
    wallet-cli$ balance
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol   
    1:ETH          
    2:MKR          
    3:DAI          
    4:ZRX          
    5:WCTODD       
    6:LRC          
    7:LINK         
    Input the index: 1
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e  
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f  
    Input the index or address of account: 2
    Account                                                               ETH
    0x71ee3fdb7f49299aeb22126f538f9bfae047928f                              0

Example 6 (Transfer coin or token on source chain)

    Alice wants to transfer ETH to MKR from source account to the new account
    on source chain. Then she checks the both amounts on source chain.

    step1:
    wallet-cli$ transfer
    ============================================================
    Source Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol                                              Token Address
    1: ETH                                                              ETH
    2: MKR                       0x54950025d1854808b09277fe082b54682b11a50b
    3: DAI                       0xdbf193627ee704d38495c2f5eb3afc3512eafa4c
    4: ZRX                       0x00f58d6d585f84b2d7267940cede30ce2fe6eae8
    5: WCTODD                    0xd5cc1810197238b06f0f333b1cb2046e0c6ece9a
    6: LRC                       0x35d957f150953a056aaf6465fd26379278324848
    7: LINK                      0x01be23585060835e02b77ef475b0cc51aa1e0709
    Input the index: 2
    ============================================================
    Sender Account(ETH)                                           ETH Balance                MKR Balance
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e        0.048812986595555584     484.312581828223222273
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f                           0                          0
    Input the index or address of sender: 1
    ============================================================
    Receiver Account(ETH)                                         ETH Balance                MKR Balance
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e        0.048812986595555584     484.312581828223222273
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f                           0                          0
    Input the index or address of receiver: 2
    Input transaction amount: 10
    Input gas price (Recommend 10Gwei-60Gwei): 13
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting... 
    txHash: 0x4434207de0237f8693f04fc502dcaf8e5b698167abf920465f7cc10e8b1307c7

    step2:
    wallet-cli$ balance
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol   
    1:ETH          
    2:MKR          
    3:DAI          
    4:ZRX          
    5:WCTODD       
    6:LRC          
    7:LINK         
    Input the index: 2
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e  
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f  
    Input the index or address of account: 1
    Account                                                               MKR
    0x1a3dd63f6efa425f92d1868921e3eac8df79747e         474.312581828223222273

    step3:
    wallet-cli$ balance 
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol   
    1:ETH          
    2:MKR          
    3:DAI          
    4:ZRX          
    5:WCTODD       
    6:LRC          
    7:LINK         
    Input the index: 2
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e  
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f  
    Input the index or address of account: 2
    Account                                                               MKR
    0x71ee3fdb7f49299aeb22126f538f9bfae047928f                             10

Example 7 (Approve token to HTLC contract on source chain)

    Alice wants to prepare her MKR from source account to HTLC contract on source chain. 
    At the same time the balance of her source account will not be reduced, this is 
    equivalent to assigning her account authority to the HTLC contract. Then she checks 
    the amount on source chain.

    step1:
    wallet-cli$ approve
    ============================================================
    Source Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol                                              Token Address
    1: MKR                       0x54950025d1854808b09277fe082b54682b11a50b
    2: DAI                       0xdbf193627ee704d38495c2f5eb3afc3512eafa4c
    3: ZRX                       0x00f58d6d585f84b2d7267940cede30ce2fe6eae8
    4: WCTODD                    0xd5cc1810197238b06f0f333b1cb2046e0c6ece9a
    5: LRC                       0x35d957f150953a056aaf6465fd26379278324848
    6: LINK                      0x01be23585060835e02b77ef475b0cc51aa1e0709
    Input the index: 1
    ============================================================
    Sender Account(ETH)                                           ETH Balance                MKR Balance
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e        0.048135829595555584     474.312581828223222273
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f                           0                         10
    Input the index or address of sender: 1
    Input transaction amount: 4
    Input gas price (Recommend 10Gwei-60Gwei): 12
    Input gas limit (Recommend 470000): 470000
    Input the password: ******
     waiting... 
    txHash: 0x413615edce75809fbbadbeb609b302979ef8ac813e6701c403b84787a33de3ea

    step2:
    wallet-cli$ balance
    ============================================================
         Chain
        1: ETH
        2: WAN
    Input the index: 1
    ============================================================
    Token Symbol   
    1:ETH          
    2:MKR          
    3:DAI          
    4:ZRX          
    5:WCTODD       
    6:LRC          
    7:LINK         
    Input the index: 2
    1: 0x1a3dd63f6efa425f92d1868921e3eac8df79747e  
    2: 0x71ee3fdb7f49299aeb22126f538f9bfae047928f  
    Input the index or address of account: 1
    Account                                                               MKR
    0x1a3dd63f6efa425f92d1868921e3eac8df79747e         474.312581828223222273



Tips:
----

    1)  Description of some status of cross transaction.

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
