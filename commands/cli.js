let vorpal      = require('vorpal')();
let sprintf     = require("sprintf-js").sprintf;
let ccUtil      = require("wanchain-js-sdk").ccUtil;
let WalletCore  = require("wanchain-js-sdk").walletCore;
let config      = require('../conf/config');
const Web3      = require("web3");
let web3        = new Web3(null);
let ret         = {
    // true: success false: error  default true
    code: true,
    // success: return the result
    // error  : return the error
    result: null
};
let wanMinGasPrice = 180;
let ethMinGasPrice = 10;
let minGasLimit = 470000;
let wrongPwdStr = "Wrong password";
let {DMS, ERROR_MESSAGE, formatStr} = require('../schema/message');
let walletCore  = new WalletCore(config);
config = walletCore.config;
async function main(){
  await walletCore.init();
  const ACTION = {
    APPROVE: 'APPROVE',
    LOCK: 'LOCK',
    REDEEM: 'REDEEM',
    REVOKE: 'REVOKE'
  };
  DMS.wanGasPrice.message = formatStr(DMS.wanGasPrice.message, wanMinGasPrice);
  DMS.ethGasPrice.message = formatStr(DMS.ethGasPrice.message, ethMinGasPrice);
  DMS.gasLimit.message = formatStr(DMS.gasLimit.message, minGasLimit);
  vorpal
    .command('lock', 'lock token on source chain')
    .action(function (args, callback) {
      let self = this;
      let chainName;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.LOCK;//['approve','lock','redeem','revoke']
        let ERROR = false;
        console.log("============================================================");
        let chainDicItem  = await new Promise(function (resolve, reject) {
          loadSrcChainDic(self, args, resolve, reject);

        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        chainName = chainDicItem[0];
        self.tokenList = chainDicItem[1];
        let srcChain;
        let dstChain;
        if(chainDicItem[0] !== 'WAN'){
          srcChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.srcChain = srcChain;
          args.dstChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');

        }else{
          args.srcChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');
          let dstTokenList = await new Promise(function (resolve, reject) {
            loadDstChainDic(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          self.tokenList = dstTokenList;
          let dstChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.dstChain = dstChain;
        }

        if (ERROR) {
          return;
        }

        let from = await new Promise(function (resolve, reject) {
          loadFromAccount(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        let storeman = await new Promise(function (resolve, reject) {
          loadStoremanGroups(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        let to = await new Promise(function (resolve, reject) {
          loadToAccount(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        //================== amount   ==================
        let amount = await new Promise(function (resolve, reject) {
          loadAmount(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        //================== gasPrice ==================
        if (chainName === 'WAN') {
          args.promptInfo = DMS.wanGasPrice;
          args.minGasPrice = wanMinGasPrice;
        } else {
          args.promptInfo = DMS.ethGasPrice;
          args.minGasPrice = ethMinGasPrice;
        }
        let gasPrice = await new Promise(function (resolve, reject) {
          loadGasPrice(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
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
        //================== password ==================
        let needPwd = true;
        const input = {};
        input.from = from;
        input.storeman = storeman.storemenGroupAddr;
        input.txFeeRatio = storeman.txFeeRatio;
        input.to = to;
        input.amount = amount;
        input.gasPrice = gasPrice;
        input.gasLimit = gasLimit;

        while (needPwd) {
          let password = await new Promise(function (resolve, reject) {
            loadPassword(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });
          if (ERROR) {
            return;
          }
          vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');
          input.password = password;
          ret = await global.crossInvoker.invoke(args.srcChain, args.dstChain, args.action, input);
          if (ret.result !== wrongPwdStr) {
            needPwd = false;
          } else {
            vorpal.log(ret.result);
          }
        }
        vorpal.log("txHash:", ret.result);
        callback();
      });

    })
    .cancel(function () {
      vorpal.ui.cancel();
    });
  vorpal
    .command('redeem', 'redeem token on destination chain')
    .action(function (args, callback) {
      this.action = 'redeem';
      let self = this;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.REDEEM;//['approve','lock','redeem','revoke']
        let ERROR = false;
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
        //================== gasPrice ==================
        if (tx.dstChainType.toUpperCase() === 'WAN') {
          args.promptInfo = DMS.wanGasPrice;
          args.minGasPrice = wanMinGasPrice;
        } else {
          args.promptInfo = DMS.ethGasPrice;
          args.minGasPrice = ethMinGasPrice;
        }
        let gasPrice = await new Promise(function (resolve, reject) {
          loadGasPrice(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
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
        //================== password ==================
        let dstChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.dstChainAddr,tx.dstChainType);
        const input = {};
        input.x = tx.x;
        input.hashX = tx.hashX;
        input.gasPrice = gasPrice;
        input.gasLimit = gasLimit;
        let needPwd = true;
        while (needPwd) {
          let password = await new Promise(function (resolve, reject) {
            loadPassword(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });
          if (ERROR) {
            return;
          }
          vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');
          let srcChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.srcChainAddr,tx.srcChainType);
          input.password = password;
          ret = await global.crossInvoker.invoke(srcChain, dstChain, args.action, input);
          if (ret.result !== wrongPwdStr) {
            needPwd = false;
          } else {
            vorpal.log(ret.result);
          }
        }
        vorpal.log("txHash: ", ret.result);
        callback();
      });
    })
    .cancel(function () {
      vorpal.ui.cancel();
    });
  vorpal
    .command('revoke', 'revoke token on source chain')
    .action(function (args, callback) {
      this.action = 'revoke';
      let self = this;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.REVOKE;//['approve','lock','redeem','revoke']
        let ERROR = false;
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
        //================== gasPrice ==================
        if (tx.srcChainType.toUpperCase() === 'WAN') {
          args.promptInfo = DMS.wanGasPrice;
          args.minGasPrice = wanMinGasPrice;
        } else {
          args.promptInfo = DMS.ethGasPrice;
          args.minGasPrice = ethMinGasPrice;
        }
        let gasPrice = await new Promise(function (resolve, reject) {
          loadGasPrice(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
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
        //================== password ==================
        let srcChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.srcChainAddr,tx.srcChainType);
        let dstChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.dstChainAddr,tx.dstChainType);
        const input = {};
        input.x = tx.x;
        input.hashX = tx.hashX;
        input.gasPrice = gasPrice;
        input.gasLimit = gasLimit;
        let needPwd = true;
        while (needPwd) {
          let password = await new Promise(function (resolve, reject) {
            loadPassword(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });
          if (ERROR) {
            return;
          }
          vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');
          input.password = password;
          ret = await global.crossInvoker.invoke(srcChain, dstChain, args.action, input);
          if (ret.result !== wrongPwdStr) {
            needPwd = false;
          } else {
            vorpal.log(ret.result);
          }
        }
        vorpal.log("txHash: ", ret.result);
        callback();
      });
    })
    .cancel(function () {
      vorpal.ui.cancel();
    });
  vorpal
    .command('balance', 'get balance')
    .action(function (args, callback) {
      let self = this;
      let chainName;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.LOCK;//['approve','lock','refund','revoke']
        let ERROR = false;
        console.log("============================================================");
        let chainDicItem  = await new Promise(function (resolve, reject) {
          loadSrcChainDic(self, args, resolve, reject);

        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        chainName = chainDicItem[0];
        self.tokenList = chainDicItem[1];
        let srcChain;
        let dstChain;
        if(chainDicItem[0] !== 'WAN'){
          srcChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.srcChain = srcChain;
          args.dstChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');

        }else{
          args.srcChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');
          let dstTokenList = await new Promise(function (resolve, reject) {
            loadDstChainDic(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          self.tokenList = dstTokenList;
          let dstChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.dstChain = dstChain;
        }

        if (ERROR) {
          return;
        }
        // display balance Token
        await new Promise(function (resolve, reject) {
          displayTokenBalance(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        callback();
      });

    })
    .cancel(function () {
      vorpal.ui.cancel();
    });

  vorpal
    .command('list', 'list transaction')
    .action(function (args, callback) {
      let self = this;
      let chainName;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.LOCK;//['approve','lock','refund','revoke']
        let ERROR = false;
        console.log("============================================================");
        let chainDicItem  = await new Promise(function (resolve, reject) {
          loadSrcChainDic(self, args, resolve, reject);

        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        chainName = chainDicItem[0];
        self.tokenList = chainDicItem[1];
        let srcChain;
        let dstChain;
        if(chainDicItem[0] !== 'WAN'){
          srcChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.srcChain = srcChain;
          args.dstChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');

        }else{
          args.srcChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');
          let dstTokenList = await new Promise(function (resolve, reject) {
            loadDstChainDic(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          self.tokenList = dstTokenList;
          let dstChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.dstChain = dstChain;
        }

        if (ERROR) {
          return;
        }
        // display balance Token
        await new Promise(function (resolve, reject) {
          listTrans(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        callback();
      });

    })
    .cancel(function () {
      vorpal.ui.cancel();
    });

  vorpal.delimiter("wallet-cli$ ").show();

  async function loadSrcChainDic(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    let MsgPrompt = '';
    let srcChainArray = [];
    try {
      let srcChainMap = global.crossInvoker.getSrcChainName();
      MsgPrompt += sprintf("%10s\r\n", "Source Chain");
      let index = 0;
      for (let chainDicItem of srcChainMap) {
        if(chainDicItem[0] !== 'BTC')
        {
          index++;
          let keyTemp = chainDicItem[0];
          srcChainArray[index] = chainDicItem;
          srcChainArray[keyTemp] = chainDicItem;
          let indexString = (index) + ': ' + keyTemp;
          MsgPrompt += sprintf("%10s\r\n", indexString);
        }
      }
    } catch (e) {
      ERROR = true;
      reject(ERROR_MESSAGE.SRC_ERROR + e.message);
    }
    if (ERROR) {
      return;
    }
    let schema =
      {
        type: DMS.srcChain.type,
        name: DMS.srcChain.name,
        message: MsgPrompt + DMS.srcChain.message
      };
    self.prompt([schema], function (result) {
      let srcChainIndex = result[DMS.srcChain.name];
      checkExit(srcChainIndex);
      // validate
      let validate = false;
      let srcChain;
      if (srcChainIndex) {
        srcChain = srcChainArray[srcChainIndex];
      }
      if (srcChain) {
        validate = true;
      }
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadSrcChainDic(self, args, resolve, reject);
      } else {
        resolve(srcChain);
      }
    });
  }
  async function loadDstChainDic(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    let MsgPrompt = '';
    let srcChainArray = [];
    try {
      let srcChainMap = global.crossInvoker.getDstChainName(args.srcChain);
      console.log("============================================================");
      MsgPrompt += sprintf("%10s\r\n", "Destination Chain");
      let index = 0;
      for (let chain of srcChainMap) {
        if(chain[0] !== 'BTC')
        {
          index++;
          let keyTemp = chain[0];
          let valueTemp = chain[1];
          srcChainArray[index] = valueTemp;
          srcChainArray[keyTemp] = valueTemp;
          let indexString = (index) + ': ' + keyTemp;
          MsgPrompt += sprintf("%10s\r\n", indexString);
        }        
      }
    } catch (e) {
      ERROR = true;
      reject(ERROR_MESSAGE.SRC_ERROR + e.message);
    }
    if (ERROR) {
      return;
    }
    let schema =
      {
        type: DMS.srcChain.type,
        name: DMS.srcChain.name,
        message: MsgPrompt + DMS.srcChain.message
      };
    self.prompt([schema], function (result) {
      let srcChainIndex = result[DMS.srcChain.name];
      checkExit(srcChainIndex);
      // validate
      let validate = false;
      let srcChain;
      if (srcChainIndex) {
        srcChain = srcChainArray[srcChainIndex];
      }
      if (srcChain) {
        validate = true;
      }
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadDstChainDic(self, args, resolve, reject);
      } else {
        resolve(srcChain);
      }
    });
  }
  async function loadTokenList(v, args, resolve, reject) {
    let self = v;
    let tokenList = self.tokenList;
    let ERROR = false;
    let MsgPrompt = '';
    let srcChainArray = [];
    try {
      console.log("============================================================");
      MsgPrompt += sprintf("%-15s%56s\r\n", "Token Symbol","Token Address");
      let index = 0;
      for (let token of tokenList) {
        index++;
        let keyTemp = token[0];
        srcChainArray[index] = token;
        srcChainArray[keyTemp] = token;
        //let indexString = (index) + ': ' + keyTemp;
        let indexString = (index) + ': ' + token[1].tokenSymbol;
        MsgPrompt += sprintf("%-15s%56s\r\n", indexString, keyTemp);
      }
    } catch (e) {
      ERROR = true;
      reject(ERROR_MESSAGE.SRC_ERROR + e.message);
    }
    if (ERROR) {
      return;
    }
    let schema =
      {
        type: DMS.srcChain.type,
        name: DMS.srcChain.name,
        message: MsgPrompt + DMS.chainToken.message
      };
    self.prompt([schema], function (result) {
      let srcChainIndex = result[DMS.srcChain.name];
      checkExit(srcChainIndex);
      // validate
      let validate = false;
      let srcChain;
      if (srcChainIndex) {
        srcChain = srcChainArray[srcChainIndex];
      }
      if (srcChain) {
        validate = true;
      }
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadTokenList(self, args, resolve, reject);
      } else {
        resolve(srcChain);
      }
    });
  }

  async function loadFromAccount(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED);
      return;
    }
    let fromMsgPrompt = '';
    let addressArray = {};
    if (args.srcChain[1].tokenStand === 'E20') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        let addressArr = [];
        ethAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
          args.srcChain[0],
          args.srcChain[1].tokenType);
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Sender Account(ETH)", "ETH Balance",
          `${args.srcChain[1].tokenSymbol} Balance`);
        ethAddressList.forEach(function (value, index) {
          let ethBalance = web3.fromWei(value.balance);
          let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.srcChain[1].tokenDecimals);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
          addressArray[value.address] = [value.address, tokenBalance, args.srcChain[1].tokenDecimals];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.srcChain[1].tokenStand === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Sender Account(ETH)", "ETH Balance");
        ethAddressList.forEach(function (value, index) {
          let ethBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, ethBalance);
          addressArray[value.address] = [value.address, ethBalance, "18"];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.srcChain[1].tokenStand === 'WAN') {
      try {
        let wanAddressList = await ccUtil.getWanAccountsInfo();
        let addressArr = [];
        wanAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
          args.dstChain[1].buddy,
          args.srcChain[1].tokenType);
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Sender Account(WAN)", "WAN Balance",
          `W${args.dstChain[1].tokenSymbol} Balance`);
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.dstChain[1].tokenDecimals);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
          addressArray[value.address] = [value.address, tokenBalance, args.dstChain[1].tokenDecimals];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else {
      ERROR = true;
      console.log("No support BTC in this version!");
      reject(ERROR_MESSAGE.FROM_ERROR + "Not support");
    }
    if (ERROR) {
      return;
    }
    let schema =
      {
        type: DMS.from.type,
        name: DMS.from.name,
        message: fromMsgPrompt + DMS.from.message
      };
    self.prompt([schema], function (result) {
      let fromIndex = result[DMS.from.name];
      checkExit(fromIndex);
      // validate
      let validate = false;
      let fromAddress;
      if (fromIndex) {
        args.from = addressArray[fromIndex];
        fromAddress = args.from ? args.from[0] : null;
        if (args.srcChain[1].tokenType === 'WAN') {
          validate = ccUtil.isWanAddress(fromAddress);
        } else if (args.srcChain[1].tokenType === 'ETH') {
          validate = ccUtil.isEthAddress(fromAddress);
        }
      } else {
        validate = false;
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadFromAccount(self, args, resolve, reject);
      } else {
        resolve(fromAddress);
      }
    });
  }
  async function loadStoremanGroups(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED);
      return;
    }
    let smgsArray = {};
    let storemanMsgPrompt = '';
    let quota;
    try {
      let smgList = global.crossInvoker.getStoremanGroupList(args.srcChain, args.dstChain);
      console.log("============================================================");
      storemanMsgPrompt += sprintf("%-45s %30s %10s\r\n", "Storeman Group Address", "Quota", "Fee Ratio");
      smgList.forEach(function (value, index) {
        smgsArray[value.storemenGroupAddr] = value;
        smgsArray[index + 1] = value;
        let indexString = (index + 1) + ': ' + value.storemenGroupAddr;

        if (args.srcChain[1].tokenType === 'WAN') {
          quota = fromTokenWei(value.outboundQuota, args.from[2]);
        } else {
          quota = fromTokenWei(value.inboundQuota, args.from[2]);
        }
        storemanMsgPrompt += sprintf("%-45s %30s %10s\r\n", indexString, quota, (Number(value.txFeeRatio)*100/10000).toString()+'%');
      });
    } catch (e) {
      ERROR = true;
      reject(ERROR_MESSAGE.STOREMAN_ERROR + e.message);
    }
    if (ERROR) {
      return;
    }
    self.prompt([
      {
        type: DMS.StoremanGroup.type,
        name: DMS.StoremanGroup.name,
        message: storemanMsgPrompt + DMS.StoremanGroup.message
      }], function (result) {
      let storemanIndex = result[DMS.StoremanGroup.name];
      checkExit(storemanIndex);
      // validate
      let validate = false;
      let storemanAddr;
      if (storemanIndex) {
        args.storeman = smgsArray[storemanIndex];
        storemanAddr = args.storeman ? args.storeman.storemenGroupAddr : null;
      }
      if (storemanAddr) {
        validate = true;
        if (args.srcChain[1].tokenType === 'WAN') {
          args.quota = fromTokenWei(args.storeman.outboundQuota, args.from[2]);
        } else {
          args.quota = fromTokenWei(args.storeman.inboundQuota, args.from[2]);
        }
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadStoremanGroups(self, args, resolve, reject);
      } else {
        resolve(smgsArray[storemanIndex]);
      }
    });
  }
  async function loadTxHashList(v, args, resolve, reject) {
    let self = v;
    let txHashListMsgPrompt = '';
    let txHashArray = {};
    let idx = 1;
    try {
      let txHashList = global.wanDb.filterContains(config.crossCollection,'status',['BuddyLocked','Locked','RedeemSent','RevokeSent','RedeemSending','RevokeSending']);
      txHashList.forEach(function (value, index) {
        let  displayOrNot = true;
        let   retCheck;
        if(self.action === 'revoke'){
          retCheck  = ccUtil.canRevoke(value);
          displayOrNot = retCheck.code;
        }else{
          if(self.action === 'redeem'){
            retCheck  = ccUtil.canRedeem(value);
            displayOrNot = retCheck.code;
          }
        }
        if(displayOrNot){
          txHashArray[value.hashX] = value;
          txHashArray[idx] = value;
          txHashListMsgPrompt += "=========================================================================\r\n";
          txHashListMsgPrompt += sprintf("%d:\r\nName:   %s\r\ntxHash: %s\r\nHashX:  %s\r\nSource Chain:      %s\r\n" +
            "Destination Chain: %s\r\nFrom:   %s\r\nTo:     %s\r\nAmount: %s\r\nStatus: %s\r\n",
            idx, value.tokenSymbol, value.lockTxHash, value.hashX, value.srcChainType, value.dstChainType, value.from,
            value.to, web3.fromWei(value.contractValue), value.status);
          idx++;
        }
      });
    } catch (e) {
      reject('get txHash error. ' + e.message);
      return;
    }
    if (txHashListMsgPrompt.length === 0) {
      reject(`No transaction for ${self.action} found. Please try later.`);
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
  }
  async function loadToAccount(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED);
      return;
    }
    let fromMsgPrompt = '';
    let addressArray = {};
    if (args.dstChain[1].tokenStand === 'E20') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        let addressArr = [];
        ethAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
          args.dstChain[0],
          args.dstChain[1].tokenType);
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Reciever Account(ETH)", "ETH Balance",
          `${args.dstChain[1].tokenSymbol} Balance`);
        ethAddressList.forEach(function (value, index) {
          let ethBalance = web3.fromWei(value.balance);
          let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.dstChain[1].tokenDecimals);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
          addressArray[value.address] = [value.address, tokenBalance, args.dstChain[1].tokenDecimals];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.dstChain[1].tokenStand === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Reciever Account(ETH)", "ETH Balance");
        ethAddressList.forEach(function (value, index) {
          let ethBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, ethBalance);
          addressArray[value.address] = [value.address, ethBalance, "18"];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.dstChain[1].tokenStand === 'WAN') {
      try {
        let wanAddressList = await ccUtil.getWanAccountsInfo();
        let addressArr = [];
        wanAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });

        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
          args.srcChain[1].buddy,
          args.dstChain[1].tokenType);
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Reciever Account(WAN)", "WAN Balance",
          `W${args.srcChain[1].tokenSymbol} Balance`);
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.srcChain[1].tokenDecimals);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
          addressArray[value.address] = [value.address, tokenBalance, args.srcChain[1].tokenDecimals];
          addressArray[index + 1] = addressArray[value.address];
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else {
      ERROR = true;
      console.log("No support BTC in this version!");
      reject(ERROR_MESSAGE.FROM_ERROR + "Not support");
    }
    if (ERROR) {
      return;
    }
    let schema =
      {
        type: DMS.to.type,
        name: DMS.to.name,
        message: fromMsgPrompt + DMS.to.message
      };
    self.prompt([schema], function (result) {
      let toIndex = result[DMS.to.name];
      checkExit(toIndex);
      // validate
      let validate = false;
      let toAddress;
      if (toIndex) {
        args.to = addressArray[toIndex];
        toAddress = args.to ? args.to[0] : null;
        if (args.dstChain[1].tokenType === 'WAN') {
          validate = ccUtil.isWanAddress(toAddress);
        } else if (args.dstChain[1].tokenType === 'ETH') {
          validate = ccUtil.isEthAddress(toAddress);
        }
      } else {
        validate = false;
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadToAccount(self, args, resolve, reject);
      } else {
        resolve(toAddress);
      }
    });
  }
  async function loadToAccountNormal(v, args, resolve, reject) {
    let self = v;
    if (args.action === ACTION.APPROVE) {
      reject(ERROR_MESSAGE.NOT_NEED);
      return;
    }
    self.prompt([DMS.to], function (result) {
      let to = result[DMS.to.name];
      checkExit(to);
      let validate = false;
      if (args.srcChain[1].tokenType === 'WAN') {
        validate = ccUtil.isWanAddress(to);
      } else if (args.srcChain[1].tokenType === 'ETH') {
        validate = ccUtil.isEthAddress(to);
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadToAccountNormal(self, args, resolve, reject);
      } else {
        resolve(to);
      }
    });
  }
  async function loadAmount(v, args, resolve, reject) {
    let self = v;
    self.prompt([DMS.amount], function (result) {
      let amount = result[DMS.amount.name];
      checkExit(amount);
      // validate
      let validate = false;
      let pattern = /^\d+(\.\d{1,18})?$/;
      if (pattern.test(amount)) {
        validate = true;
      }
      if (validate) {
        if (web3.toBigNumber(amount).gt(web3.toBigNumber(args.from[1]))) {
          vorpal.log(ERROR_MESSAGE.LESS_AMOUNT);
          validate = false;
        } else if (web3.toBigNumber(amount).gt(web3.toBigNumber(args.quota))){
          vorpal.log(ERROR_MESSAGE.STOREMAN_NO_FUND);
          validate = false;
        }
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadAmount(self, args, resolve, reject);
      } else {
        resolve(amount);
      }
    });
  }
  async function loadGasPrice(v, args, resolve, reject) {
    let self = v;
    self.prompt([args.promptInfo], function (result) {
      let gasPrice = result[args.promptInfo.name];
      checkExit(gasPrice);
      // validate
      let validate = false;
      let patrn = /^\d+(\.\d{1,18})?$/;
      if (patrn.test(gasPrice)) {
        validate = true;
      }
      if (Number(gasPrice) < args.minGasPrice) {
        vorpal.log(ERROR_MESSAGE.LOW_GAS_PRICE);
        validate = false;
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
      if (Number(gasLimit) < minGasLimit) {
        vorpal.log(ERROR_MESSAGE.LOW_GAS_LIMIT);
        validate = false;
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
    v.prompt([DMS.password], function (result) {
      let password = result[DMS.password.name];
      resolve(password);
    });
  }
  function checkExit(value) {
    if (value && value === 'exit') {
      process.exit(0);
    }
  }
  function fromTokenWei(tokenWei, decimals) {
    return web3.toBigNumber(tokenWei).dividedBy('1e' + decimals).toString(10);
  }
  function toTokenWei(token, decimals) {
    return web3.toBigNumber(token).times('1e' + decimals).toString(10);
  }
  async function displayTokenBalance(v, args, resolve, reject){
    let self = v;
    let ERROR = false;

    let fromMsgPrompt = '';
    let addressArray = {};
    if (args.dstChain[1].tokenStand === 'E20') {
      try {
        // source WAN
        {
          fromMsgPrompt = '';
          console.log("Source balance");
          let wanAddressList = await ccUtil.getWanAccountsInfo();
          let addressArr = [];
          wanAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });

          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
            args.dstChain[1].buddy,
            args.srcChain[1].tokenType);

          console.log("============================================================");

          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Source Account(WAN)", "WAN Balance",
            `W${args.dstChain[1].tokenSymbol} Balance`);
          wanAddressList.forEach(function (value, index) {
            let wanBalance = web3.fromWei(value.balance);
            let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.dstChain[1].tokenDecimals);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
          })
          console.log(fromMsgPrompt);
        }
        // destination E20
        {
          // destination token list
          fromMsgPrompt = '';
          console.log("Destination balance");
          let ethAddressList = await ccUtil.getEthAccountsInfo();
          let addressArr = [];
          ethAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });
          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
            args.dstChain[0],
            args.dstChain[1].tokenType);

          console.log("============================================================");
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Destination Account(ETH)", "ETH Balance",
            `${args.dstChain[1].tokenSymbol} Balance`);
          ethAddressList.forEach(function (value, index) {
            let ethBalance = web3.fromWei(value.balance);
            let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.dstChain[1].tokenDecimals);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
          });
          console.log(fromMsgPrompt);
        }

      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.dstChain[1].tokenStand === 'ETH') {
      try {
        // Source WAN
        {
          fromMsgPrompt = '';
          console.log("Source balance");
          let wanAddressList = await ccUtil.getWanAccountsInfo();
          let addressArr = [];
          wanAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });

          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
            args.dstChain[1].buddy,
            args.srcChain[1].tokenType);

          console.log("============================================================");

          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Source Account(WAN)", "WAN Balance",
            `W${args.dstChain[1].tokenSymbol} Balance`);
          wanAddressList.forEach(function (value, index) {
            let wanBalance = web3.fromWei(value.balance);
            let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.dstChain[1].tokenDecimals);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
          })
          console.log(fromMsgPrompt);
        }
        // Destination ETH
        {
          // destination token list
          fromMsgPrompt = '';
          console.log("Destination balance");
          let ethAddressList = await ccUtil.getEthAccountsInfo();
          let addressArr = [];
          ethAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });
          console.log("============================================================");
          fromMsgPrompt += sprintf("%-46s %26s\r\n", "Destination Account(ETH)", "ETH Balance");
          ethAddressList.forEach(function (value, index) {
            let ethBalance = web3.fromWei(value.balance);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, ethBalance);
          });
          console.log(fromMsgPrompt);
        }
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.dstChain[1].tokenStand === 'WAN') {

      {
        // ETH source
        if(args.srcChain[1].tokenStand === 'ETH')
        {
          fromMsgPrompt = '';
          console.log("Source balance");
          let ethAddressList = await ccUtil.getEthAccountsInfo();
          let addressArr = [];
          ethAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });
          console.log("============================================================");
          fromMsgPrompt += sprintf("%-46s %26s\r\n", "Source Account(ETH)", "ETH Balance");
          ethAddressList.forEach(function (value, index) {
            let ethBalance = web3.fromWei(value.balance);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, ethBalance);
          });
          console.log(fromMsgPrompt);
        }

        if(args.srcChain[1].tokenStand === 'E20')
        //E20 source
        {
          fromMsgPrompt = '';
          console.log("Source balance");
          let ethAddressList = await ccUtil.getEthAccountsInfo();
          let addressArr = [];
          ethAddressList.forEach(function (value, index) {
            addressArr.push(value.address);
          });
          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
            args.srcChain[0],
            args.srcChain[1].tokenType);

          console.log("============================================================");
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Source Account(ETH)", "ETH Balance",
            `${args.srcChain[1].tokenSymbol} Balance`);
          ethAddressList.forEach(function (value, index) {
            let ethBalance = web3.fromWei(value.balance);
            let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.srcChain[1].tokenDecimals);
            let indexString = (index + 1) + ': ' + value.address;
            fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
          });
          console.log(fromMsgPrompt);
        }
      }
      // WAN destination
      {
        fromMsgPrompt = '';
        console.log("Destination balance");
        let wanAddressList = await ccUtil.getWanAccountsInfo();
        let addressArr = [];
        wanAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });

        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr,
          args.srcChain[1].buddy,
          args.dstChain[1].tokenType);

        console.log("============================================================");

        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Source Account(WAN)", "WAN Balance",
          `W${args.srcChain[1].tokenSymbol} Balance`);
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let tokenBalance = fromTokenWei(tokenBalanceList[value.address], args.srcChain[1].tokenDecimals);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
        })
        console.log(fromMsgPrompt);
      }


    } else {
      ERROR = true;
      console.log("No support BTC in this version!");
      reject(ERROR_MESSAGE.FROM_ERROR + "Not support");
    }
    if (ERROR) {
      return;
    }
    resolve();
  }
  async function listTrans( v, args, resolve, reject) {
    let self          = v;
    let records       = {};
    let msgPrompt     ='';
    try {
      let objFilter = {};
      objFilter.srcChainType  = args.srcChain[1].tokenType;
      objFilter.dstChainType  = args.dstChain[1].tokenType;
      objFilter.tokenSymbol   = args.srcChain[1].tokenSymbol === 'WAN'? args.dstChain[1].tokenSymbol:args.srcChain[1].tokenSymbol;
      let decimal             = args.srcChain[1].tokenSymbol === 'WAN'? args.dstChain[1].tokenDecimals:args.srcChain[1].tokenDecimals;

      records = global.wanDb.getItemAll(config.crossCollection,objFilter);
      records.forEach(function (value, index) {
        msgPrompt += "=========================================================================\r\n";
        msgPrompt += sprintf("From:\t\t\t\t%s\r\nTo:\t\t\t\t%s\r\nSource Chain:\t\t\t%s\r\n" +
          "Destination Chain:\t\t%s\r\nToken Symbol:\t\t\t%s\r\nAmount:\t\t\t\t%s\r\nStatus:\t\t\t\t%s\r\n",
          value.from, value.to, value.srcChainType, value.dstChainType, value.tokenSymbol,
          fromTokenWei(value.contractValue,decimal),
          value.status);
      });
    } catch (e) {
      reject('listTrans error. ' + e.message);
      return;
    }
    if(msgPrompt.length === 0){
      msgPrompt = 'No transaction found';
      console.log(msgPrompt);
    }else{
      console.log(msgPrompt);
    }
    resolve();
  }

}
main();

