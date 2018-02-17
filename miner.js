var http = require('http');
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');
const Blockchain = require('./blockchain');
var crypto = require("crypto");
var text = fs.readFileSync('wallet.txt','utf8');
var settings = JSON.parse(text);
var publicKey = settings.publicKey;
var privateKey = settings.privateKey;

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

while (true) {
  Blockchain.loadFromFile();
  var text = fs.readFileSync('transactions.txt','utf8');
  var reward = new transaction("reward", '{"inputs":[],"outputs":[{"amount":50000000,"address":"' + publicKey + '"}]}');
  var trans = JSON.parse(text);
  var data = {

  }
  Blockchain.addBlock(new Block(latestblock.index + 1, "21/07/2017", ));

  Blockchain.saveToFile();
}