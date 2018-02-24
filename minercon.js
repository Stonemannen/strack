var exec = require('child_process').exec;
var proc = exec('node miner.js', function callback(error, stdout, stderr){});

setTimeout(kill(proc), 30000);


function kill(proc){
  proc.kill;
  proc = exec('node miner.js', function callback(error, stdout, stderr){});
  setTimeout(kill(proc), 30000);
}
