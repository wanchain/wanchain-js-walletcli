const config        = {};
config.port         = 8545;
config.useLocalNode = false;
//config.useLocalNode = true;
const path          =require('path');
// log config
{
  //config.logPathPrex      = '/home/jacob';
  config.logPathPrex      = '';
  //config.loglevel         = 'info';
  config.loglevel         = 'debug';
}
{
  //config.databasePathPrex = '/home/jacob/data';
  config.databasePathPrex = '';
}
//config.rpcIpcPath = '/home/jacob/bin/testnetData/gwan.ipc';
config.consoleColor = {
  'COLOR_FgRed'     : '\x1b[31m',
  'COLOR_FgYellow'  : '\x1b[33m',
  'COLOR_FgGreen'   : "\x1b[32m"
};
config.iWAN = {
  "url" :  global.wanchain_js_testnet ? ['apitest.wanchain.org'] : ["api.wanchain.org"],
  "port": [8443],
  "wallet": {
      "apikey": "fa5078fd834201d1d5bd57908a3069fe8ba560f329c060dffe04ccb52a9f1fcb",
      "secret": "67ab8ebd6ade75b5a9ae3761f03aa3750ce73a1d859dd070bddd72436c7d5957"
  }
}

module.exports                  = config;
