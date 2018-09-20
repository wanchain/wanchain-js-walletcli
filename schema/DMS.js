let _colorStart = '\x1b[33m';
let _colorEnd = '\x1b[0m';
exports.DMS = {
  'from': {
    type: 'input',
    name: 'from',
    message: _colorStart + 'Input the index of address: ' + _colorEnd,
    ethMessage: _colorStart + 'Input the index of wanchain address: ' + _colorEnd,
    wanMessage: _colorStart + 'Input the index of ethernum address: ' + _colorEnd
  },

  'srcChain': {
    type: 'input',
    name: 'srcChain',
    message: _colorStart + 'Input the index of srcChain: ' + _colorEnd
  },
  'dstChain': {
    type: 'input',
    name: 'dstChain',
    message: _colorStart + 'Input the index of dstChain: ' + _colorEnd
  },
  'chainToken': {
    type: 'input',
    name: 'chainToken',
    message: _colorStart + 'Input the index of token: ' + _colorEnd
  },
  'StoremanGroup': {
    type: 'input',
    name: 'storeman',
    message: _colorStart + 'Input the index or StoremanGroup: ' + _colorEnd
  },
  'to': {
    type: 'input',
    name: 'to',
    message: _colorStart + 'Enter recipient\\\'s address: ' + _colorEnd
  },

  'amount': {
    type: 'input',
    name: 'amount',
    message: _colorStart + 'Input transaction amount(>=0.02): ' + _colorEnd
  },

  'gasPrice': {
    type: 'input',
    name: 'gasPrice',
    message: _colorStart + 'Input gas price (Price limit is between 180Gwin-600Gwin): ' + _colorEnd
  },

  'gasLimit': {
    type: 'input',
    name: 'gasLimit',
    message: _colorStart + 'Input gas limit: ' + _colorEnd
  },

  'password': {
    type: 'password',
    name: 'password',
    message: _colorStart + 'Input the address Password: ' + _colorEnd
  },

  'wanAddress': {
    type: 'input',
    name: 'wanAddress',
    message: _colorStart + 'Input the index of wanchain address: ' + _colorEnd
  },
  'ethAddress': {
    type: 'input',
    name: 'ethAddress',
    message: _colorStart + 'Input the index of ethernum address: ' + _colorEnd
  },

  'txHash': {
    type: 'input',
    name: 'txHash',
    message: _colorStart + 'Input the index of lockTxHash: ' + _colorEnd
  }

};

exports.ERROR_MESSAGE = {
  INPUT_AGAIN: "please input again. ",
  SRC_ERROR: "get src chain list error. ",
  DST_ERROR: "get dst chain list error. ",
  STOREMAN_ERROR: "get storeman list error. ",
  FROM_ERROR: "get from account list error. ",

  NOT_NEED: "don't need this method. ",

};