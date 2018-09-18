let vorpal = require('vorpal')();
let sprintf = require("sprintf-js").sprintf;
let ccUtil = require("wanchain-js-sdk").ccUtil;

vorpal
  .command('listAccountBalance', 'get balance list')
  .cancel(function () {
    process.exit(0);
  })
  .action(function (args, callback) {
    let self = this;

    return new Promise(async function (resolve, reject) {
      // from
      let ethAddressList = [];

      // to
      let wanAddressList = [];


      // eth address list
      try {
        ethAddressList = await ccUtil.getEthAccountsInfo();
        vorpal.log(sprintf("%2s %56s", "ETH address", "balance"));

        ethAddressList.forEach(function (ethAddress, index) {
          let ethBalance = web3.fromWei(ethAddress.balance);

          ethAddress = (index + 1) + ': ' + ethAddress.address;
          vorpal.log(sprintf("%2s %26s", ethAddress, ethBalance));
        });

      } catch (e) {
        vorpal.log('get eth address balance error.', e.message);
        callback();
        return;
      }

      vorpal.log('\n');

      // wan address list
      try {
        wanAddressList = await ccUtil.getWanAccountsInfo();
        vorpal.log(sprintf("%2s %56s %26s", "WAN address", "balance", "weth balance"));

        wanAddressList.forEach(function (wanAddress, index) {
          let wanBalance = web3.fromWei(wanAddress.balance);
          let wethBalance = web3.toBigNumber(wanAddress.wethBalance).div(100000000);

          wanAddress = (index + 1) + ': ' + wanAddress.address;
          vorpal.log(sprintf("%2s %26s %26s", wanAddress, wanBalance, wethBalance));

        });


      } catch (e) {
        vorpal.log('get wan address balance error.', e.message);
        callback();
        return;
      }

    });
  });


vorpal.delimiter("wallet1$ ").show();

