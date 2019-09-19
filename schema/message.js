let _colorStart = '\x1b[33m';
let _colorEnd = '\x1b[0m';
exports.DMS = {
  'from': {
    type: 'input',
    name: 'from',
    message: _colorStart + 'Input the index or address of sender: ' + _colorEnd,
    ethMessage: _colorStart + 'Input the index or Wanchain address: ' + _colorEnd,
    wanMessage: _colorStart + 'Input the index or Ethereum address: ' + _colorEnd
  },
  'to': {
    type: 'input',
    name: 'to',
    message: _colorStart + 'Input the index or address of receiver: ' + _colorEnd,
    ethMessage: _colorStart + 'Input the index or Wanchain address: ' + _colorEnd,
    wanMessage: _colorStart + 'Input the index or Ethereum address: ' + _colorEnd
  },
  'account': {
    type: 'input',
    name: 'account',
    message: _colorStart + 'Input the index or address of account: ' + _colorEnd,
    ethMessage: _colorStart + 'Input the index or Wanchain address: ' + _colorEnd,
    wanMessage: _colorStart + 'Input the index or Ethereum address: ' + _colorEnd
  },
  'srcChain': {
    type: 'input',
    name: 'srcChain',
    message: _colorStart + 'Input the index: ' + _colorEnd
  },
  'dstChain': {
    type: 'input',
    name: 'dstChain',
    message: _colorStart + 'Input the index: ' + _colorEnd
  },
  'chainToken': {
    type: 'input',
    name: 'chainToken',
    message: _colorStart + 'Input the index: ' + _colorEnd
  },
  'StoremanGroup': {
    type: 'input',
    name: 'storeman',
    message: _colorStart + 'Input the index or address: ' + _colorEnd
  },

  'amount': {
    type: 'input',
    name: 'amount',
    message: _colorStart + 'Input transaction amount: ' + _colorEnd
  },

  'wanGasPrice': {
    type: 'input',
    name: 'gasPrice',
    message: _colorStart + 'Input gas price (Recommend %sGwin-600Gwin): ' + _colorEnd
  },

  'ethGasPrice': {
    type: 'input',
    name: 'gasPrice',
    message: _colorStart + 'Input gas price (Recommend %sGwei-60Gwei): ' + _colorEnd
  },

  'gasLimit': {
    type: 'input',
    name: 'gasLimit',
    message: _colorStart + 'Input gas limit (Recommend %s): ' + _colorEnd
  },

  'password': {
    type: 'password',
    name: 'password',
    message: _colorStart + 'Input the password: ' + _colorEnd
  },

  'wanAddress': {
    type: 'input',
    name: 'wanAddress',
    message: _colorStart + 'Input the index or Wanchain address: ' + _colorEnd
  },
  'ethAddress': {
    type: 'input',
    name: 'ethAddress',
    message: _colorStart + 'Input the index or Ethereum address: ' + _colorEnd
  },

  'txHash': {
    type: 'input',
    name: 'txHash',
    message: _colorStart + 'Input index or hashX: ' + _colorEnd
  },
  'balance': {
    type: 'input',
    name: 'balance',
    message: _colorStart + ' ' + _colorEnd
  },
  'confirmPwd': {
    type: 'password',
    name: 'password',
    message: _colorStart + 'Confirm the password: ' + _colorEnd
  },
  'publicKey': {
    type: 'input',
    name: 'publicKey',
    message: _colorStart + 'Input the public key: ' + _colorEnd
  },
  'privateKey': {
    type: 'input',
    name: 'privateKey',
    message: _colorStart + 'Input the private key (wif): ' + _colorEnd
  },
  'command': {
    type: 'input',
    name: 'command',
    message: _colorStart + 'Input the index of command: ' + _colorEnd
  },
  'account': {
    type: 'input',
    name: 'account',
    message: _colorStart + 'Input the account name: ' + _colorEnd
  },
};

function formatStr(str, ...args) {
  let strArray = str.split('%s');
  let retStr = strArray[0];
  for (let i = 1; i < strArray.length; i++) {
    retStr += args[i - 1];
    retStr += strArray[i];
  }
  return retStr;
}

exports.formatStr = formatStr;
exports.ERROR_MESSAGE = {
  INPUT_AGAIN: "Please input again. ",
  SRC_ERROR: "Get src chain list error. ",
  DST_ERROR: "Get dst chain list error. ",
  STOREMAN_ERROR: "Get storeman list error. ",
  FROM_ERROR: "Get account list error. ",
  TO_ERROR: "Get account list error. ",
  BALANCE_ERROR:"Get balance error.",
  ACCOUNT_ERROR: "Get account list error. ",
  LESS_AMOUNT: "Balance is not enough. ",
  STOREMAN_NO_FUND: "Storeman quota is not enough. ",
  NOT_NEED: "don't need this method. ",
  LOW_GAS_PRICE: "Gas price is too low.",
  LOW_GAS_LIMIT: "Gas limit is too low.",
};