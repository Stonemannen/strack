var exec = require('child_process').exec;
var sleep = require('sleep');
while (true) {
  var proc = exec('node miner.js', function callback(error, stdout, stderr){});
  sleep.sleep(20);
  proc.kill;
}
