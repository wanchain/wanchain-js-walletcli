let vorpal      = require('vorpal')();
let sprintf     = require("sprintf-js").sprintf;
let ccUtil      = require("wanchain-js-sdk").ccUtil;
let WalletCore  = require("wanchain-js-sdk").walletCore;
let wanUtil     = require("wanchain-util");
let ethUtil     = require('ethereumjs-util');
let config      = require('../conf/config');
const Web3      = require("web3");
let web3        = new Web3(null);
let {DMS, ERROR_MESSAGE} = require('../schema/DMS');
let walletCore  = new WalletCore(config);
config = walletCore.config;
async function main(){
  await walletCore.init();
  const ACTION = {
    APPROVE: 'APPROVE',
    LOCK: 'LOCK',
    REFUND: 'REFUND',
    REVOKE: 'REVOKE'
  };
  vorpal
    .command('lock', 'lock')
    .cancel(function () {
      process.exit(0);
    })
    .action(function (args, callback) {
      let self = this;

      return new Promise(async function (resolve, reject) {
        args.action = ACTION.LOCK;//['approve','lock','refund','revoke']
        let ERROR = false;
        console.log("==============================");
        let chainDicItem  = await new Promise(function (resolve, reject) {
          loadSrcChainDic(self, args, resolve, reject);

        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });

        self.tokenList = chainDicItem[1];
        let srcChain;
        let dstChain;
        if(chainDicItem[0] !== 'WAN'){
          console.log("==============================");
          srcChain = await new Promise(function (resolve, reject) {
            loadTokenList(self, args, resolve, reject);
          }).catch(function (err) {
            ERROR = true;
            callback(err);
          });

          args.srcChain = srcChain;
          // console.log("==============================");
          // console.log("srcChain:", srcChain);

          // set dstChain to wan
          //console.log("config.wanTokenAddress", config.wanTokenAddress);
          args.dstChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');

          // console.log("==============================");
          // console.log("dstChain:", args.dstChain);

        }else{
          // set srcChain to wan
          console.log("config.wanTokenAddress", config.wanTokenAddress);
          args.srcChain = ccUtil.getSrcChainNameByContractAddr(config.wanTokenAddress,'WAN');
          // console.log("==============================");
          // console.log("srcChain:", args.srcChain);
          // console.log("==============================");

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
          // console.log("==============================");
          // console.log("dstChain:", dstChain);
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
        // console.log("==============================");
        // console.log("from:", from);
        // console.log("srcChain.storemanGroups===========");
        // console.log(srcChain[1].storemenGroup);
        // console.log("dstChain.storemanGroups===========");
        // dstChain = args.dstChain;
        // console.log(dstChain[1].storemenGroup);
        let storeman = await new Promise(function (resolve, reject) {
          loadStoremanGroups(self, args, resolve, reject);
        }).catch(function (err) {
          ERROR = true;
          callback(err);
        });
        if (ERROR) {
          return;
        }
        console.log("==============================");
        console.log("storeman:", storeman);
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
        console.log("==============================");
        console.log("amount:", amount);
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
        vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');
        const input = {};
        input.from = from;
        input.storeman = storeman.storemenGroupAddr;
        input.txFeeRatio = storeman.txFeeRatio;
        input.to = to;
        input.amount = amount;
        input.gasPrice = gasPrice;
        input.gasLimit = gasLimit;
        input.password = password;
        // input.srcChain = args.srcChain[1].tokenSymbol;
        // input.dstChain = args.dstChain[1].tokenSymbol;
        let ret = await global.crossInvoker.invoke(args.srcChain, args.dstChain, args.action, input);
        callback();
      });

    });
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
        let srcChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.srcChainAddr,tx.srcChainType);
        let dstChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.dstChainAddr,tx.dstChainType);
        const input = {};
        // input.from = lockTrans.to;
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
  vorpal
    .command('revoke', 'revoke')
    .cancel(function () {
      process.exit(0);
    })
    .action(function (args, callback) {
      let self = this;
      return new Promise(async function (resolve, reject) {
        args.action = ACTION.REVOKE;//['approve','lock','refund','revoke']
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
        let srcChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.srcChainAddr,tx.srcChainType);
        let dstChain = global.crossInvoker.getSrcChainNameByContractAddr(tx.dstChainAddr,tx.dstChainType);
        const input = {};
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

  // vorpal
  //   .command('transfer', 'transfer')
  //   .cancel(function () {
  //     process.exit(0);
  //   })
  //   .action(function (args, callback) {
  //     let self = this;
  //     return new Promise(async function (resolve, reject) {
  //       let ERROR = false;
  //       let srcChain = await new Promise(function (resolve, reject) {
  //         loadSrcChain(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       args.srcChain = srcChain;
  //       console.log("==============================");
  //       console.log("srcChain:", srcChain);
  //       console.log("==============================");
  //       let from = await new Promise(function (resolve, reject) {
  //         loadFromAccount(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       console.log("==============================");
  //       console.log("from:", from);
  //       let to = await new Promise(function (resolve, reject) {
  //         loadToAccountNormal(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       //================== amount   ==================
  //       let amount = await new Promise(function (resolve, reject) {
  //         loadAmount(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       console.log("==============================");
  //       console.log("amount:", amount);
  //       //================== gasPrice ==================
  //       let gasPrice = await new Promise(function (resolve, reject) {
  //         loadGasPrice(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       console.log("==============================");
  //       console.log("gasPrice:", gasPrice);
  //       //================== gasLimit ==================
  //       let gasLimit = await new Promise(function (resolve, reject) {
  //         loadGasLimit(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       console.log("==============================");
  //       console.log("gasLimit:", gasLimit);
  //       //================== password ==================
  //       let password = await new Promise(function (resolve, reject) {
  //         loadPassword(self, args, resolve, reject);
  //       }).catch(function (err) {
  //         ERROR = true;
  //         callback(err);
  //       });
  //       if (ERROR) {
  //         return;
  //       }
  //       console.log("==============================");
  //       console.log("password:", password);
  //       vorpal.log(config.consoleColor.COLOR_FgGreen, 'waiting...', '\x1b[0m');
  //       const input = {};
  //       input.from = from;
  //       input.to = to;
  //       input.amount = amount;
  //       input.gasPrice = gasPrice;
  //       input.gasLimit = gasLimit;
  //       input.password = password;
  //       await global.crossInvoker.invokeNormalTrans(args.srcChain,input);
  //       callback();
  //     });
  //   });
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
        index++;
        let keyTemp = chainDicItem[0];
        let valueTemp = chainDicItem[1];
        srcChainArray[index] = chainDicItem;
        srcChainArray[keyTemp] = chainDicItem;
        let indexString = (index) + ': ' + keyTemp;
        MsgPrompt += sprintf("%10s\r\n", indexString);
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
      MsgPrompt += sprintf("%10s\r\n", "Destination chain");
      let index = 0;
      for (let chain of srcChainMap) {
        index++;
        let keyTemp = chain[0];
        let valueTemp = chain[1];
        srcChainArray[index] = valueTemp;
        srcChainArray[keyTemp] = valueTemp;
        let indexString = (index) + ': ' + keyTemp;
        MsgPrompt += sprintf("%10s\r\n", indexString);
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
    // console.log("-----------------");
    // console.log(tokenList);
    let ERROR = false;
    let MsgPrompt = '';
    let srcChainArray = [];
    try {
      //let srcChainMap = global.crossInvoker.getSrcChainDic();
      MsgPrompt += sprintf("%10s %56s\r\n", "token symbol","token addr");
      let index = 0;
      for (let token of tokenList) {
        // console.log("token");
        // console.log(token);
        index++;
        let keyTemp = token[0];
        srcChainArray[index] = token;
        srcChainArray[keyTemp] = token;
        //let indexString = (index) + ': ' + keyTemp;
        let indexString = (index) + ': ' + token[1].tokenSymbol;
        MsgPrompt += sprintf("%10s %56s\r\n", indexString, keyTemp);
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
        loadTokenList(self, args, resolve, reject);
      } else {
        resolve(srcChain);
      }
    });
  }
  // async function loadSrcChain(v, args, resolve, reject) {
  //   let self = v;
  //   let ERROR = false;
  //   let MsgPrompt = '';
  //   let srcChainArray = [];
  //   try {
  //     let srcChainMap = global.crossInvoker.getSrcChainName();
  //     MsgPrompt += sprintf("%10s %56s\r\n", "src chain", "chain address");
  //     let index = 0;
  //     for (let chain of srcChainMap) {
  //       index++;
  //       let keyTemp = chain[0];
  //       let valueTemp = chain[1];
  //       srcChainArray[index] = chain;
  //       srcChainArray[keyTemp] = chain;
  //       let indexString = (index) + ': ' + valueTemp.tokenSymbol;
  //       MsgPrompt += sprintf("%10s %56s\r\n", indexString, keyTemp);
  //     }
  //   } catch (e) {
  //     ERROR = true;
  //     reject(ERROR_MESSAGE.SRC_ERROR + e.message);
  //   }
  //   if (ERROR) {
  //     return;
  //   }
  //   let schema =
  //     {
  //       type: DMS.srcChain.type,
  //       name: DMS.srcChain.name,
  //       message: MsgPrompt + DMS.srcChain.message
  //     };
  //   self.prompt([schema], function (result) {
  //     let srcChainIndex = result[DMS.srcChain.name];
  //     checkExit(srcChainIndex);
  //     // validate
  //     let validate = false;
  //     let srcChain;
  //     if (srcChainIndex) {
  //       srcChain = srcChainArray[srcChainIndex];
  //     }
  //     if (srcChain) {
  //       validate = true;
  //     }
  //     if (!validate) {
  //       vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
  //       loadSrcChain(self, args, resolve, reject);
  //     } else {
  //       resolve(srcChain);
  //     }
  //   });
  // }
  // async function loadDstChain(v, args, resolve, reject) {
  //   let self = v;
  //   let ERROR = false;
  //   let MsgPrompt = '';
  //   let dstChainArray = [];
  //   try {
  //     let dstChainMap = global.crossInvoker.getDstChainName(args.srcChain);
  //     MsgPrompt += sprintf("%10s %56s\r\n", "dst chain", "chain address");
  //     // console.log("dstChainMap:", dstChainMap);
  //     let index = 0;
  //     for (let chain of dstChainMap) {
  //       index++;
  //       let keyTemp = chain[0];
  //       let valueTemp = chain[1];
  //       // if (valueTemp.tokenStand === 'E20'){
  //       //   let tokenSymbol = await ccUtil.getErc20SymbolInfo(keyTemp);
  //       //   // console.log("initChainsSymbol ",tokenSymbol);
  //       //   valueTemp.tokenSymbol = tokenSymbol;
  //       // }
  //       dstChainArray[index] = chain;
  //       dstChainArray[keyTemp] = chain;
  //       let indexString = (index) + ': ' + valueTemp.tokenSymbol;
  //       MsgPrompt += sprintf("%10s %56s\r\n", indexString, keyTemp);
  //     }
  //   } catch (e) {
  //     ERROR = true;
  //     reject(ERROR_MESSAGE.DST_ERROR + e.message);
  //   }
  //   if (ERROR) {
  //     return;
  //   }
  //   let schema =
  //     {
  //       type: DMS.dstChain.type,
  //       name: DMS.dstChain.name,
  //       message: MsgPrompt + DMS.dstChain.message
  //     };
  //   self.prompt([schema], function (result) {
  //     let dstChainIndex = result[DMS.dstChain.name];
  //     checkExit(dstChainIndex);
  //     // validate
  //     let validate = false;
  //     let dstChain;
  //     if (dstChainIndex) {
  //       dstChain = dstChainArray[dstChainIndex];
  //     }
  //     if (dstChain) {
  //       validate = true;
  //     }
  //     if (!validate) {
  //       vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
  //       loadDstChain(self, args, resolve, reject);
  //     } else {
  //       resolve(dstChain);
  //     }
  //   });
  // }
  async function loadFromAccount(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED + e.message);
      return;
    }
    let fromMsgPrompt = '';
    let ethAddressArray = {};
    let wanAddressArray = {};
    if (args.srcChain[1].tokenStand === 'E20') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        let addressArr = [];
        ethAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr, args.srcChain[0], args.srcChain[1].tokenType);
        fromMsgPrompt += sprintf("%46s %26s %26s\r\n", `${args.srcChain[1].tokenSymbol} address`, "eth balance", `${args.srcChain[1].tokenSymbol} balance`);
        ethAddressList.forEach(function (value, index) {
          ethAddressArray[value.address] = [value.address, value.balance, tokenBalanceList[value.address]];
          ethAddressArray[index + 1] = [value.address, value.balance, tokenBalanceList[value.address]];
          let ethBalance = web3.fromWei(value.balance);
          let tokenBalance = web3.toBigNumber(tokenBalanceList[value.address]).div(100000000);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.srcChain[1].tokenStand === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        fromMsgPrompt += sprintf("%46s %26s\r\n", `${args.srcChain[1].tokenSymbol} address`, "eth balance");
        ethAddressList.forEach(function (value, index) {
          ethAddressArray[value.address] = [value.address, value.balance];
          ethAddressArray[index + 1] = [value.address, value.balance];
          let ethBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s\r\n", indexString, ethBalance);
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
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr, args.dstChain[1].buddy, args.srcChain[1].tokenType);
        fromMsgPrompt += sprintf("%46s %26s %26s\r\n", "WAN address", "balance", `W${args.dstChain[1].tokenSymbol} balance`);
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let tokenBalance = web3.toBigNumber(tokenBalanceList[value.address]).div(100000000);
          wanAddressArray[value.address] = [value.address, value.balance, tokenBalanceList[value.address]];
          wanAddressArray[index + 1] = [value.address, value.balance, tokenBalanceList[value.address]];
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else {
      ERROR = true;
      reject(ERROR_MESSAGE.FROM_ERROR + e.message);
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
        if (args.srcChain[1].tokenType === 'WAN') {
          fromAddress = wanAddressArray[fromIndex] ? wanAddressArray[fromIndex][0] : null;
          validate = ccUtil.isWanAddress(fromAddress);
        } else if (args.srcChain[1].tokenType === 'ETH') {
          fromAddress = ethAddressArray[fromIndex] ? ethAddressArray[fromIndex][0] : null;
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
  };
  async function loadFromAccountNormal(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED + e.message);
      return;
    }
    let fromMsgPrompt = '';
    let ethAddressArray = {};
    let wanAddressArray = {};
    if (args.srcChain[1].tokenStand === 'E20') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        let addressArr = [];
        ethAddressList.forEach(function (value, index) {
          addressArr.push(value.address);
        });
        let tokenBalanceList = await ccUtil.getMultiTokenBalanceByTokenScAddr(addressArr, args.srcChain[0], args.srcChain[1].tokenType);
        fromMsgPrompt += sprintf("%46s %26s %26s\r\n", `${args.srcChain[1].tokenSymbol} address`, "eth balance", `${args.srcChain[1].tokenSymbol} balance`);
        ethAddressList.forEach(function (value, index) {
          ethAddressArray[value.address] = [value.address, value.balance, tokenBalanceList[value.address]];
          ethAddressArray[index + 1] = [value.address, value.balance, tokenBalanceList[value.address]];
          let ethBalance = web3.fromWei(value.balance);
          let tokenBalance = web3.toBigNumber(tokenBalanceList[value.address]).div(100000000);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s %26s\r\n", indexString, ethBalance, tokenBalance);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else if (args.srcChain[1].tokenStand === 'ETH') {
      try {
        let ethAddressList = await ccUtil.getEthAccountsInfo();
        fromMsgPrompt += sprintf("%46s %26s\r\n", `${args.srcChain[1].tokenSymbol} address`, "eth balance");
        ethAddressList.forEach(function (value, index) {
          ethAddressArray[value.address] = [value.address, value.balance];
          ethAddressArray[index + 1] = [value.address, value.balance];
          let ethBalance = web3.fromWei(value.balance);
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s\r\n", indexString, ethBalance);
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
        let tokenBalanceList = await ccUtil.getMultiEthBalances(addressArr,args.srcChain[1].tokenType);
        fromMsgPrompt += sprintf("%46s %26s %26s\r\n", "WAN address", "balance", `WAN balance`);
        wanAddressList.forEach(function (value, index) {
          let wanBalance = web3.fromWei(value.balance);
          let tokenBalance = web3.toBigNumber(tokenBalanceList[value.address]).div(100000000);
          wanAddressArray[value.address] = [value.address, value.balance, tokenBalanceList[value.address]];
          wanAddressArray[index + 1] = [value.address, value.balance, tokenBalanceList[value.address]];
          let indexString = (index + 1) + ': ' + value.address;
          fromMsgPrompt += sprintf("%46s %26s %26s\r\n", indexString, wanBalance, tokenBalance);
        });
      } catch (e) {
        ERROR = true;
        reject(ERROR_MESSAGE.FROM_ERROR + e.message);
      }
    } else {
      ERROR = true;
      reject(ERROR_MESSAGE.FROM_ERROR + e.message);
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
        if (args.srcChain[1].tokenType === 'WAN') {
          fromAddress = wanAddressArray[fromIndex] ? wanAddressArray[fromIndex][0] : null;
          validate = ccUtil.isWanAddress(fromAddress);
        } else if (args.srcChain[1].tokenType === 'ETH') {
          fromAddress = ethAddressArray[fromIndex] ? ethAddressArray[fromIndex][0] : null;
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
  };
  async function loadStoremanGroups(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED + e.message);
      return;
    }
    // let storeman_obj = {
    //   wanAddress: '0x06daa9379cbe241a84a65b217a11b38fe3b4b063',
    //   ethAddress: '0x41623962c5d44565de623d53eb677e0f300467d2',
    //   deposit: '128000000000000000000000',
    //   txFeeRatio: '10',
    //   quota: '400000000000000000000',
    //   inboundQuota: '336936067918620246919',
    //   outboundQuota: '52710881343454567942',
    //   receivable: '80000000000000000',
    //   payable: '10273050737925185139',
    //   debt: '62983932081379753081'
    // };
    let smgsArray = {};
    let storemanMsgPrompt = '';
    try {
      // if (args.srcChain[1].tokenStand === 'ETH' || args.dstChain[1].tokenStand === 'ETH') {//ETH
      //
      //   smgList = await ccUtil.getEthSmgList(args.srcChain[1].tokenType);
      //
      //
      // } else if (args.srcChain[1].tokenStand === 'E20' || args.dstChain[1].tokenStand === 'E20') {
      //
      //   smgList = await ccUtil.syncErc20StoremanGroups(args.dstChain[0]);
      //
      // } else {
      //   vorpal.log("[loadStoremanGroups]::: ERROR tokenStand.");
      //   ERROR = true;
      // }
      //
      // if (ERROR) {
      //   return;
      // }
      // let smgList;
      // if (args.action === ACTION.LOCK) {
      //   smgList = args.srcChain[1].storemenGroup;
      // } else if (args.action === ACTION.REFUND) {
      //   smgList = srcChain[1].storemenGroup;
      // } else if (args.action === ACTION.REVOKE) {
      //   smgList = srcChain[1].storemenGroup;
      // } else {
      //   console.log("don't need storeman.")
      //   return;
      // }
      let smgList = global.crossInvoker.getStoremanGroupList(args.srcChain, args.dstChain);
      console.log("smgList:", smgList)
      storemanMsgPrompt += sprintf("%26s %26s\r\n", "stroeman address", "txFeeRatio");
      smgList.forEach(function (value, index) {
        smgsArray[value.storemenGroupAddr] = value;
        smgsArray[index + 1] = value;
        let indexString = (index + 1) + ': ' + value.storemenGroupAddr;
        storemanMsgPrompt += sprintf("%26s %26s\r\n", indexString, value.txFeeRatio);
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
        storemanAddr = smgsArray[storemanIndex] ? smgsArray[storemanIndex].storemenGroupAddr : null;
      }
      if (storemanAddr) {
        validate = true;
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
    let ERROR = false;
    let txHashListMsgPrompt = '';
    let txHashArray = {};
    try {
      let txHashList = global.wanDb.filterNotContains(config.crossCollection,'status',['Refunded','Revoked']);
      txHashListMsgPrompt += sprintf("%70s %10s %10s %45s %45s %15s\r\n", "hashX", "src chain", "dst chain", "from", "to", "amount");
      txHashList.forEach(function (value, index) {
        txHashArray[value.hashX] = value;
        txHashArray[index + 1] = value;
        let indexString = (index + 1) + ': ' + value.hashX;
        txHashListMsgPrompt += sprintf("%70s %10s %10s %45s %45s %15s\r\n", indexString, value.srcChainType, value.dstChainType, value.from, value.to, web3.fromWei(value.contractValue));
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
  async function loadToAccount(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED + e.message);
      return;
    }
    self.prompt([DMS.to], function (result) {
      let to = result[DMS.to.name];
      checkExit(to);
      let validate = false;
      if (args.dstChain[1].tokenType === 'WAN') {
        validate = ccUtil.isWanAddress(to);
      } else if (args.dstChain[1].tokenType === 'ETH') {
        validate = ccUtil.isEthAddress(to);
      }
      // next
      if (!validate) {
        vorpal.log(ERROR_MESSAGE.INPUT_AGAIN);
        loadToAccount(self, args, resolve, reject);
      } else {
        resolve(to);
      }
    });
  }
  async function loadToAccountNormal(v, args, resolve, reject) {
    let self = v;
    let ERROR = false;
    if (args.action === ACTION.APPROVE) {
      ERROR = true;
      reject(ERROR_MESSAGE.NOT_NEED + e.message);
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
      //valdateAmount();
      let patrn = /^\d+(\.\d{1,18})?$/;
      if (patrn.test(amount)) {
        validate = true;
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
};
main();

