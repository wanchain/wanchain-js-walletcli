let vorpal = require('vorpal')();
let sprintf = require("sprintf-js").sprintf;
let ccUtil = require("wanchain-js-sdk").ccUtil;
let WalletCore = require("wanchain-js-sdk").walletCore;
let wanUtil = require("wanchain-util");
let ethUtil = require('ethereumjs-util');

let config = require('../config');
const Web3 = require("web3");
let web3 = new Web3(null);

let {DMS,ERROR_MESSAGE} = require('../schema/DMS');
let walletCore = new WalletCore(config);
walletCore.init();

const ACTION = {
  APPROVE: 'APPROVE',
  LOCK: 'LOCK',
  REFUND: 'REFUND',
  REVOKE: 'REVOKE'
};


vorpal
  .command('refund', 'refund')
  .cancel(function () {
    process.exit(0);
  })
  .action(function (args, callback) {
    let self = this;

    return new Promise(async function (resolve, reject) {


      args.action = ACTION.REFUND;//['approve','lock','refund','revoke']

      let ERROR = false;


      // input: { from: '0x0d8935721ced2be0d52a99f8dd8894f1ab9b517b',
      //   storeman: '0x41623962c5d44565de623d53eb677e0f300467d2',
      //   to: '0x860fb460b01d626e70dd9d95c604c0a1a9f06490',
      //   amount: '0.0012',
      //   gasPrice: '100',
      //   gasLimit: '2000000',
      //   password: '123456',
      //   chainType: 'ETH' }

      //================== txHashList   ==================
      let tx = await new Promise(function (resolve, reject) {
        loadTxHashList(self, args, resolve, reject);
      }).catch(function (err) {
        ERROR = true;
        callback(err);
      });
      if (ERROR) {
        return;
      }

      console.log("==============================");
      console.log("tx:", tx);
      //================== gasPrice ==================

      let gasPrice = await new Promise(function (resolve, reject) {
        loadGasPrice(self, args, resolve, reject);
      }).catch(function (err) {
        ERROR = true;
        callback(err);
      });
      if (ERROR) {
        return;
      }
      console.log("==============================");
      console.log("gasPrice:", gasPrice);

      //================== gasLimit ==================
      let gasLimit = await new Promise(function (resolve, reject) {
        loadGasLimit(self, args, resolve, reject);
      }).catch(function (err) {
        ERROR = true;
        callback(err);
      });
      if (ERROR) {
        return;
      }
      console.log("==============================");
      console.log("gasLimit:", gasLimit);
      //================== password ==================
      let password = await new Promise(function (resolve, reject) {
        loadPassword(self, args, resolve, reject);
      }).catch(function (err) {
        ERROR = true;
        callback(err);
      });
      if (ERROR) {
        return;
      }
      console.log("==============================");
      console.log("password:", password);
      //

      vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');

      // let lockTrans = collection.findOne({lockTxHash : lockTxHash});


      let srcChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.srcChainAddr);
      let dstChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.dstChainAddr);

      const input = {};

      // input.from = lockTrans.to;
      input.from = tx.to;
      input.x = tx.x;
      input.hashX = tx.hashX;

      input.gasPrice = gasPrice;
      input.gasLimit = gasLimit;
      input.password = password;
      console.log("srcChain:",srcChain);
      console.log("dstChain:",dstChain);

      await global.crossInvoker.invoke(srcChain, dstChain, args.action, input);

      callback();

    });
  });


vorpal.delimiter("wallet1$ ").show();

async function loadTxHashList(v, args, resolve, reject) {
  let self = v;
  let ERROR = false;

  let txHashListMsgPrompt = '';
  let txHashArray = {};

  try {
    let txHashList = global.wanDb.filterNotContains(config.crossCollection,'status',['Refunded','Revoked']);

    txHashListMsgPrompt += sprintf("%46s %26s %26s %26s %26s %26s\r\n", "hashX", "src chain", "dst chain", "from", "to", "amount");
    txHashList.forEach(function (value, index) {

      txHashArray[value.hashX] = value;
      txHashArray[index + 1] = value;

      let indexString = (index + 1) + ': ' + value.hashX;
      txHashListMsgPrompt += sprintf("%46s %26s %26s\r\n", indexString, value.srcChainType, value.dstChainType, value.from, value.to, value.contractValue);
    });

  } catch (e) {
    ERROR = true;
    reject('get txHash error. ' + e.message);
  }

  if (ERROR) {
    return;
  }

  let schema =
    {
      type: DMS.txHash.type,
      name: DMS.txHash.name,
      message: txHashListMsgPrompt + DMS.txHash.message
    };

  self.prompt([schema], function (result) {
    let txHashIndex = result[DMS.txHash.name];
    checkExit(txHashIndex);

    // validate
    let validate = false;

    let hashX;
    if (txHashIndex) {
      hashX = txHashArray[txHashIndex] ? txHashArray[txHashIndex].hashX : null;

      validate = hashX ? true : false;
    } else {
      validate = false;
    }
    // next
    if (!validate) {
      loadTxHashList(self, args, resolve, reject);
    } else {
      resolve(txHashArray[txHashIndex]);
    }
  });
};

async function loadGasPrice(v, args, resolve, reject) {
  let self = v;
  self.prompt([DMS.gasPrice], function (result) {
    let gasPrice = result[DMS.gasPrice.name];
    checkExit(gasPrice);

    // validate
    let validate = false;

    let patrn = /^\d+(\.\d{1,18})?$/;
    if (patrn.test(gasPrice)) {
      validate = true;
    }

    // next
    if (!validate) {
      vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
      loadGasPrice(self, args, resolve, reject);
    } else {
      resolve(gasPrice);
    }

  });
}


async function loadGasLimit(v, args, resolve, reject) {
  let self = v;
  self.prompt([DMS.gasLimit], function (result) {
    let gasLimit = result[DMS.gasLimit.name];
    checkExit(gasLimit);


    // validate
    let validate = false;

    let patrn = /^\d+$/;
    if (patrn.test(gasLimit)) {
      validate = true;
    }

    // next
    if (!validate) {
      vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
      loadGasLimit(self, args, resolve, reject);
    } else {
      resolve(gasLimit);
    }


  });
}

async function loadPassword(v, args, resolve, reject) {
  let self = v;
  self.prompt([DMS.password], function (result) {
    let password = result[DMS.password.name];

    resolve(password);

  });
}

function checkExit(value) {
  if (value && value === 'exit') {
    process.exit(0);
  }
}