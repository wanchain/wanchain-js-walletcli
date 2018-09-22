let _colorStart = '\x1b[33m';
let _colorEnd = '\x1b[0m';
exports.DMS = {
  'from': {
    type: 'input',
    name: 'from',
    message: _colorStart + 'Input the index or address: ' + _colorEnd,
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
  'to': {
    type: 'input',
    name: 'to',
    message: _colorStart + 'Input receiver account: ' + _colorEnd
  },

  'amount': {
    type: 'input',
    name: 'amount',
    message: _colorStart + 'Input transaction amount: ' + _colorEnd
  },

  'wanGasPrice': {
    type: 'input',
    name: 'gasPrice',
    message: _colorStart + 'Input gas price (Recommend 180Gwin-600Gwin): ' + _colorEnd
  },

  'ethGasPrice': {
    type: 'input',
    name: 'gasPrice',
    message: _colorStart + 'Input gas price (Recommend 5Gwei-50Gwei): ' + _colorEnd
  },

  'gasLimit': {
    type: 'input',
    name: 'gasLimit',
    message: _colorStart + 'Input gas limit: ' + _colorEnd
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
  }

};

exports.ERROR_MESSAGE = {
  INPUT_AGAIN: "Please input again. ",
  SRC_ERROR: "Get src chain list error. ",
  DST_ERROR: "Get dst chain list error. ",
  STOREMAN_ERROR: "Get storeman list error. ",
  FROM_ERROR: "Get account list error. ",

  NOT_NEED: "don't need this method. ",

};