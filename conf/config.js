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

module.exports                  = config;
