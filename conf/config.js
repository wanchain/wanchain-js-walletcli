const config        = {};
config.port         = 8545;
config.useLocalNode = false;
const path          =require('path');
// log config
{
  config.loglevel     = 'info';
  //config.loglevel   = 'debug';
  config.ccLog        = path.join('logs', 'crossChainLog.log');
  config.ccErr        = path.join('logs', 'crossChainErr.log');

  config.mrLog        = path.join('logs', 'ccMonitorLog.log');
  config.mrErr        = path.join('logs', 'ccMonitorErr.log');

  config.logfileName  = config.ccLog;
  config.errfileName  = config.ccErr;

  config.logfileNameMR  = config.mrLog;
  config.errfileNameMR  = config.mrErr;
}
config.consoleColor = {
  'COLOR_FgRed'     : '\x1b[31m',
  'COLOR_FgYellow'  : '\x1b[33m',
  'COLOR_FgGreen'   : "\x1b[32m"
};

module.exports                  = config;
