var http = require('http');
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');
const blockchain = require('./blockchain');
const blockchainb = require('./blockchain');
var crypto = require("crypto");
var text = fs.readFileSync('wallet.txt','utf8');
var settings = JSON.parse(text);
var publicKey = settings.publicKey;
var privateKey = settings.privateKey;
var sleep = require('sleep');

class transaction{
  constructor(type, data) {
    this.id = crypto.randomBytes(32).toString('hex');
    this.hash = this.calculateHash();
    this.type = type;
    this.data = data;
  }
  calculateHash() {
      return SHA256(this.id + this.data).toString();
  }
}


class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
      return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
        this.nonce++;
        this.hash = this.calculateHash();
    }

    console.log("BLOCK MINED: " + this.hash);
  }
}

var latestblock = blockchain.chain[blockchain.chain.length - 1];
blockchain.loadFromFile();

//while (true) {
blockchain.loadFromFile();

var text = fs.readFileSync('transactions.txt','utf8');
var reward = new transaction("reward", {inputs:[],outputs:[{amount:50000000,address: publicKey}]});
reward = JSON.stringify(reward);
reward = JSON.parse(reward)
var trans = JSON.parse(text);
var data = [];
data[0] = reward
for (var i = 0; i < trans.length; i++) {
  data[i + 1] = trans[i];
  trans.splice(i, 1);
}
  var latestblock = blockchain.chain[blockchain.chain.length - 1];
  blockchain.addBlock(new Block(latestblock.index + 1, Date.now(), data));
  console.log("block mined");
  blockchainb.loadFromFile();
  var latestblockb = blockchainb.chain[blockchainb.chain.length - 2];
  console.log(latestblock.index);
  console.log(latestblockb.index);
  if (latestblock.index == latestblockb.index) {
    blockchain.saveToFile();
    var address = 'http://192.168.2.132:8080/api/sync/';
    var res = '';
    console.log("sending");
    http.get({host:'127.0.0.1',path:'/api/sync',port:8080
    }, function(response) {
      console.log("sent");


    });
  }
  //blockchain.sync();

//}



