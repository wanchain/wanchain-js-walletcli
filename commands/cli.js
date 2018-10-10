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
      return new Promise(async function (resolve, reject) {
        args.action = ACTION.LOCK;//['approve','lock','refund','revoke']
        let ERROR = false;
        console.log("============================================================");
        let chainDicItem  = await new Promise(function (resolve, reject) {
          loadChainDic(self, args, resolve, reject);

        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        // 1. get which chain
        args.chainTypeBalance = chainDicItem[0];

        // 2. input token symbol list

        let symbolInfo = await new Promise(function (resolve, reject) {
          loadAllSymbolList(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        args.symbolInfoBalance = symbolInfo;

        // 3. input account list
        let accountAddr = await new Promise(function (resolve, reject) {
          loadAccount(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        args.accountAddr = accountAddr;
        await new Promise(function (resolve, reject) {
          displayTokenBalance(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        callback();
      });

    })
    .cancel(function () {
      vorpal.ui.cancel();
    });
  vorpal
    .command('transfer', 'transfer coin or token')
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
        }

        if (ERROR) {
          return;
        }

        let from = await new Promise(function (resolve, reject) {
          loadFromAccountNormal(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        let to = await new Promise(function (resolve, reject) {
          loadToAccountNormal(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        //================== amount   ==================
        let amount = await new Promise(function (resolve, reject) {
          loadAmountNormal(self, args, resolve, reject);
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
        let needPwd         = true;
        const input         = {};
        input.from          = from;
        input.to            = to;
        input.amount        = amount;
        input.gasPrice      = gasPrice;
        input.gasLimit      = gasLimit;

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
          ret = await global.crossInvoker.invokeNormalTrans(args.srcChain,input);
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
  vorpal
    .command('create', 'create account')
    .action(function(args, callback) {
      let self = this;
      return new Promise(async function(resolve, reject) {
        let ERROR = false;
        console.log("============================================================");
        let chainDicItem = await new Promise(function(resolve, reject) {
          loadChainDic(self, args, resolve, reject);
        }).catch(function(err) {
          ERROR = true;
          callback(err);
        });

        let chainType = chainDicItem[0];
        let password;

        let flag = true;
        while (flag) {
          password = await new Promise(function(resolve, reject) {
            loadPassword(self, args, resolve, reject);
          }).catch(function(err) {
            ERROR = true;
            callback(err);
          });
          if (ERROR) {
            return;
          }
          let confirmPwd = await new Promise(function(resolve, reject) {
            loadConfirmPwd(self, args, resolve, reject);
          }).catch(function(err) {
            ERROR = true;
            callback(err);
          });
          if (ERROR) {
            return;
          }

          if (password === confirmPwd) {
            flag = false;
          } else {
            vorpal.log("Password mismatched.");
          }
        }
        let accountAddr;
        if (chainType.toUpperCase() === 'WAN') {
          accountAddr = ccUtil.createWanAddr(password);
        } else {
          accountAddr = ccUtil.createEthAddr(password);
        }
        vorpal.log("Account:", accountAddr);
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
  async function loadChainDic(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    let MsgPrompt = '';
    let srcChainArray = [];
    try {
      let srcChainMap = global.crossInvoker.getSrcChainName();
      MsgPrompt += sprintf("%10s\r\n", "Chain");
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
        loadChainDic(self, args, resolve, reject);
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
  async function loadAllSymbolList(v, args, resolve, reject) {
    let self        = v;
    let ERROR       = false;
    let MsgPrompt   = '';
    let symbolsArr  = [];
    try {
      console.log("============================================================");
      MsgPrompt += sprintf("%-15s\r\n", "Token Symbol");
      let index = 0;

      for(let item of global.crossInvoker.chainsNameMap){
        if(item[0] === 'BTC') continue;
        let subMap = item[1];
        for(let subItem of subMap){
          if(args.chainTypeBalance === 'ETH' && subItem[1].tokenSymbol === 'WAN') continue;
          index++;
          let keyTemp = item[0]+"-"+subItem[0];
          symbolsArr[index] = subItem;
          symbolsArr[keyTemp] = subItem;
          if(args.chainTypeBalance === 'WAN' && subItem[1].tokenSymbol !== 'WAN'){
            let indexString = (index) + ':'+'W'+subItem[1].tokenSymbol;
            MsgPrompt += sprintf("%-15s\r\n", indexString);
          }else{
            let indexString = (index) + ':'+subItem[1].tokenSymbol;
            MsgPrompt += sprintf("%-15s\r\n", indexString);
          }

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
        type: DMS.chainToken.type,
        name: DMS.chainToken.name,
        message: MsgPrompt + DMS.chainToken.message
      };
    self.prompt([schema], function (result) {
      let symbolIndex = result[DMS.chainToken.name];
      checkExit(symbolIndex);
      // validate
      let validate = false;
      let symbolInfo;
      if (symbolIndex) {
        symbolInfo = symbolsArr[symbolIndex];
      }
      if (symbolInfo) {
        validate = true;
      }
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadAllSymbolList(self, args, resolve, reject);
      } else {
        resolve(symbolInfo);
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
  async function loadFromAccountNormal(v, args, resolve, reject) {
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
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Sender Account(WAN)", "WAN Balance");
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, wanBalance);
          addressArray[value.address] = [value.address,wanBalance];
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
        loadFromAccountNormal(self, args, resolve, reject);
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
    //TODO need to get decimal from chain
    let decimal = "18";
    try {
      let txHashList = global.wanDb.getCollection(config.crossCollection);
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
          txHashListMsgPrompt += "=====================================================================================\r\n";
          txHashListMsgPrompt += sprintf("%s:\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n" +
            "%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n",
            idx, "Name:", value.tokenSymbol, "LockHash:", value.lockTxHash, "HashX:", value.hashX, "From:", value.from,
            "To:", value.to, "Source Chain:",value.srcChainType,  "Destination Chain:", value.dstChainType,
            "Amount:", fromTokenWei(value.contractValue, decimal), "Status:", value.status);
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
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Receiver Account(ETH)", "ETH Balance",
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
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Receiver Account(ETH)", "ETH Balance");
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
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Receiver Account(WAN)", "WAN Balance",
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
        fromMsgPrompt += sprintf("%-46s %26s %26s\r\n", "Receiver Account(ETH)", "ETH Balance",
          `${args.srcChain[1].tokenSymbol} Balance`);
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
    } else if (args.srcChain[1].tokenStand === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Receiver Account(ETH)", "ETH Balance");
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
        console.log("============================================================");
        fromMsgPrompt += sprintf("%-46s %26s\r\n", "Receiver Account(WAN)", "WAN Balance");
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%-46s %26s\r\n", indexString, wanBalance);
          addressArray[value.address] = [value.address];
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
        //toAddress = args.to ? args.to[0] : null;
        toAddress = args.to ? args.to[0] : toIndex;
        if (args.srcChain[1].tokenType === 'WAN') {
          validate = ccUtil.isWanAddress(toAddress);
        } else if (args.srcChain[1].tokenType === 'ETH') {
          validate = ccUtil.isEthAddress(toAddress);
        }
      } else {
        validate = false;
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadToAccountNormal(self, args, resolve, reject);
      } else {
        resolve(toAddress);
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
  async function loadAmountNormal(v, args, resolve, reject) {
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
        }
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadAmountNormal(self, args, resolve, reject);
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
    let self = v;
    self.prompt([DMS.password], function (result) {
      let password = result[DMS.password.name];
      if (password.length === 0) {
        loadPassword(self, args, resolve, reject);
      } else {
        resolve(password);
      }
    });
  }
  async function loadConfirmPwd(v, args, resolve, reject) {
    v.prompt([DMS.confirmPwd], function (result) {
      let password = result[DMS.confirmPwd.name];
      if (password.length === 0) {
        loadConfirmPwd(v, args, resolve, reject);
      } else {
        resolve(password);
      }
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
    let ERROR         = false;
    let self          = v;
    let symbolInfo    = args.symbolInfoBalance;
    let accountAddr   = args.accountAddr;
    let symbolStr     = args.symbolInfoBalance[1].tokenSymbol;

    let tokenBalance;
    try{
      if(args.chainTypeBalance === 'ETH'){
        if(symbolInfo[1].tokenSymbol === 'ETH'){
          tokenBalance = await ccUtil.getEthBalance(args.accountAddr);
        }else{
          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr([args.accountAddr],
            symbolInfo[0],
            args.chainTypeBalance);
          tokenBalance = tokenBalanceList[args.accountAddr];
        }
      }
      if(args.chainTypeBalance === 'WAN'){
        if(symbolInfo[1].tokenSymbol === 'WAN'){
          // get balance, chainType wan
          tokenBalance = await ccUtil.getWanBalance(args.accountAddr);
        }else{
          symbolStr = 'W'+ symbolInfo[1].tokenSymbol;
          let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr([args.accountAddr],
            symbolInfo[1].buddy,
            args.chainTypeBalance);
          tokenBalance = tokenBalanceList[args.accountAddr];
        }
      }
    }catch(e){
      ERROR = true;
      reject(ERROR_MESSAGE.BALANCE_ERROR + e.message);
      return;
    }
    let msgPrompt = '';
    msgPrompt     += sprintf("%-46s %26s\r\n", "Account", symbolStr);
    msgPrompt     += sprintf("%-46s %26s\r\n", accountAddr,
      fromTokenWei(tokenBalance.toString(), symbolInfo[1].tokenDecimals));
    console.log(msgPrompt);
    resolve();
  }
  async function listTrans( v, args, resolve, reject) {
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
        msgPrompt += "=====================================================================================\r\n";
        msgPrompt += sprintf("%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n" +
          "%-19s%66s\r\n%-19s%66s\r\n%-19s%66s\r\n",
          "Name:", value.tokenSymbol, "LockHash:", value.lockTxHash, "HashX:", value.hashX, "From:", value.from,
          "To:", value.to, "Source Chain:",value.srcChainType,  "Destination Chain:", value.dstChainType,
          "Amount:", fromTokenWei(value.contractValue,decimal), "Status:", value.status);
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
  async function loadAccount(v, args, resolve, reject) {
    let self          = v;
    let ERROR         = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED);
      return;
    }
    let addressArray  = {};
    let addressArr    = [];
    if (args.chainTypeBalance === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccounts();
        ethAddressList.forEach(function (value, index) {
          addressArr.push(value);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.ACCOUNT_ERROR + e.message);
      }
    } else if (args.chainTypeBalance === 'WAN') {
      try {
        let wanAddressList = await ccUtil.getWanAccounts();
        wanAddressList.forEach(function (value, index) {
          addressArr.push(value);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.ACCOUNT_ERROR + e.message);
      }
    }else {
      ERROR = true;
      console.log("No support BTC in this version!");
      reject(ERROR_MESSAGE.FROM_ERROR + "Not support");
    }
    if (ERROR) {
      return;
    }
    let msgPrompt = '';
    addressArr.forEach(function (value, index) {
      let indexString = (index + 1) + ': ' + value;
      msgPrompt += sprintf("%-46s \r\n", indexString);
      addressArray[value]     = value;
      addressArray[index + 1] = value;
    });
    let schema =
      {
        type: DMS.account.type,
        name: DMS.account.name,
        message: msgPrompt + DMS.account.message
      };
    self.prompt([schema], function (result) {
      let fromIndex = result[DMS.account.name];
      checkExit(fromIndex);
      // validate
      let validate = false;
      let fromAddress;
      if (fromIndex) {
        args.accountBalance = addressArray[fromIndex];
        fromAddress = args.accountBalance ? args.accountBalance : fromIndex;
        if (args.chainTypeBalance === 'WAN') {
          validate = ccUtil.isWanAddress(fromAddress);
        } else if (args.chainTypeBalance === 'ETH') {
          validate = ccUtil.isEthAddress(fromAddress);
        }
      } else {
        validate = false;
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadAccount(self, args, resolve, reject);
      } else {
        resolve(fromAddress);
      }
    });
  }
}
main();

