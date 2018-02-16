
var fs = require('fs');
var text = fs.readFileSync('wallet.txt','utf8');
var settings = JSON.parse(text);
var publicKey = settings[publicKey];
var privateKey = settings[privateKey];
var confstate = 0;
var balance = 0;
var stdin = process.openStdin();
const CryptoEdDSAUtil = require('./cryptoEdDSAUtil');
stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    if (confstate == 1) {
      if (d.toString().trim() == 'y') {
        console.log("please enter a password that will be used to restore your wallet");
        confstate = 2;
      }
    }
    else if(confstate == 2){
      console.log("Generating new key pair...");
      privateKey = CryptoEdDSAUtil.generateSecret(d.toString().trim());
      var keyPair = CryptoEdDSAUtil.generateKeyPairFromSecret(privateKey);
      publicKey = CryptoEdDSAUtil.toHex(keyPair.getPublic());
      console.log("privateKey: " + privateKey);
      console.log("publicKey: " + publicKey);
      console.log("Do you want to store these in your wallet? (y/n)");
      confstate = 3;
    }else if (confstate == 3) {
      if (d.toString().trim() == 'y') {
        fs.writeFile('wallet.txt', '{"publicKey":"' + publicKey + '","privateKey":"' + privateKey + '"}', function (err) {});
      }else if (d.toString().trim() == 'n') {
        process.exit(0);
      }
    }

  });
if(process.argv[2] === "-h" || process.argv[2] === "--help"){
  console.log("this is help");
  console.log("commands:");
  console.log(" -h, --help                Displays help message");
  console.log(" -c                        Configure wallet");
  console.log(" -b                        Balance");
  console.log(" -s [address] [amount]     Send strack to address");
  process.exit(0);
}else if (process.argv[2] === "-b") {
  console.log("Your balance is: " + checkBalance()/1000000 + " Strack");

}else if (process.argv[2] === "-s") {

}else if (process.argv[2] === "-c") {
  confstate = 1;
  console.log("Do you want to generate a new key pair? (y/n)");
}else {
  console.log("this is help");
  console.log("commands:");
  console.log(" -h, --help                Displays help message");
  console.log(" -c                        Configure wallet");
  console.log(" -b                        Balance");
  console.log(" -s [address] [amount]     Send strack to address");
  process.exit(0);
}

function checkBalance(){
  var text = fs.readFileSync('blockchain.txt','utf8');
  var blockchain = JSON.parse(text);
  for (var i = 1; i < blockchain.length; i++) {
    for (var j = 0; j < blockchain[i].data.length; j++) {
      for (var k = 0; k < blockchain[i].data[j].data.outputs.length; k++) {
        if (blockchain[i].data[j].data.outputs[k].adress == publicKey) {
          balance += blockchain[i].data[j].data.outputs[k].amount;

        }
      }
    }
  }
  return balance;
}





