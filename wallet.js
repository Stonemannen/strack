"use strict"
var fs = require('fs');
var crypto = require("crypto");
const SHA256 = require("crypto-js/sha256");
var text = fs.readFileSync('wallet.txt','utf8');
var settings = JSON.parse(text);
var publicKey = settings.publicKey;
var privateKey = settings.privateKey;
var confstate = 0;
var balance = 0;
var stdin = process.openStdin();
class transaction{
  constructor(type, data) {
    this.id = crypto.randomBytes(32).toString('base64');
    this.hash = this.calculateHash();
    this.type = type;
    this.data = data;
  }
  calculateHash() {
      return SHA256(this.id + this.data).toString();
  }
}

const CryptoEdDSAUtil = require('./cryptoEdDSAUtil');
stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that
    // with toString() and then trim()
    if (confstate == 1) {
      if (d.toString().trim() == 'y') {
        console.log("please enter a password that will be used to restore your wallet");
        confstate = 2;
      }else {
        confstate = 4;
        console.log("enter your private key");
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
    }else if (confstate == 4) {
      privateKey = d.toString().trim();
      confstate = 5;
      console.log("enter your public key");
    }else if (confstate == 5) {
      publicKey = d.toString().trim();
      fs.writeFile('wallet.txt', '{"publicKey":"' + publicKey + '","privateKey":"' + privateKey + '"}', function (err) {});
      console.log("Saving...");
      console.log("done");
    }

  });
if(process.argv[2] === "-h" || process.argv[2] === "--help"){
  console.log("this is help");
  console.log("commands:");
  console.log(" -h, --help                        Displays help message");
  console.log(" -c                                Configure wallet");
  console.log(" -b                                Balance");
  console.log(" -s [address] [amount/1000000]     Send strack to address");
  process.exit(0);
}else if (process.argv[2] === "-b") {
  console.log("Your balance is: " + checkBalance()/1000000 + " Strack");

}else if (process.argv[2] === "-s") {
  balance = checkBalance();
  if (balance >= Number(process.argv[4])) {
    var unused = unusedTransctions();
    var change = balance - Number(process.argv[4])
    var pub = publicKey;
    var keyPair = CryptoEdDSAUtil.generateKeyPairFromSecret(privateKey);
    for (var i = 0; i < unused.length; i++) {
      unused[i].signature = CryptoEdDSAUtil.signHash(keyPair, SHA256(unused[i].hash + unused[i].index + unused[i].amount + unused[i].address));
    }
    var data = {
      inputs: unused,
      outputs: [{
        amount: Number(process.argv[4]),
        address: process.argv[3]
      }, {
        amount: change,
        address: pub
      }]
    }
    console.log(data);
    var text = fs.readFileSync('transactions.txt','utf8');
    var trans = JSON.parse(text);
    trans.push(new transaction("regualar", data));
    fs.writeFile('transactions.txt', JSON.stringify(trans), function (err) {});
  }
  else {
    console.log("There are not enough strack in your account");
  }
}else if (process.argv[2] === "-c") {
  confstate = 1;
  console.log("Do you want to generate a new key pair? (y/n)");
}else {
  console.log("this is help");
  console.log("commands:");
  console.log(" -h, --help                        Displays help message");
  console.log(" -c                                Configure wallet");
  console.log(" -b                                Balance");
  console.log(" -s [address] [amount]     Send strack to address");
  process.exit(0);
}

function checkBalance(){
  var text = fs.readFileSync('blockchain.txt','utf8');
  var blockchain = JSON.parse(text);
  var unused = [];
  for (var i = 1; i < blockchain.length; i++) {
    for (var j = 0; j < blockchain[i].data.length; j++) {
      for (var k = 0; k < blockchain[i].data[j].data.outputs.length; k++) {
        if (blockchain[i].data[j].data.outputs[k].address == publicKey) {
          unused.push({hash:blockchain[i].data[j].hash, index: j, amount: blockchain[i].data[j].data.outputs[k].amount});

        }
      }
      for (var l = 0; l < blockchain[i].data[j].data.inputs.length; l++) {
        for (var m = 0; m < unused.length; m++) {
          if (blockchain[i].data[j].data.inputs[l].transaction == unused[m].hash) {
            unused.splice(m,1);
          }
        }

      }
    }
  }
  for (var i = 0; i < unused.length; i++) {
    balance += unused[i].amount
  }
  return balance;

}

function unusedTransctions(){
  var unused = [];
  var text = fs.readFileSync('blockchain.txt','utf8');
  var blockchain = JSON.parse(text);
  for (var i = 1; i < blockchain.length; i++) {
    for (var j = 0; j < blockchain[i].data.length; j++) {
      for (var k = 0; k < blockchain[i].data[j].data.outputs.length; k++) {
        if (blockchain[i].data[j].data.outputs[k].address == publicKey) {
          unused.push({hash:blockchain[i].data[j].hash, index: j, amount: blockchain[i].data[j].data.outputs[k].amount, address: blockchain[i].data[j].data.outputs[k].address});
        }
      }
      for (var l = 0; l < blockchain[i].data[j].data.inputs.length; l++) {
        for (var m = 0; m < unused.length; m++) {
          if (blockchain[i].data[j].data.inputs[l].transaction == unused[m].hash) {

            unused.splice(m,1);
          }
        }

      }
    }
  }
  return unused;
}





