var crypto = require("crypto");
var eccrypto = require("eccrypto");
var fs = require('fs');
var Base58 = require("base-58");
const SHA256 = require("crypto-js/sha256");
var sig64;
const CryptoEdDSAUtil = require('./cryptoEdDSAUtil');

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

class transactions{
  constructor(){
    this.transactions = [];
  }

  addRawTransaction(newTransaction){
    this.transactions.push(newTransaction);
  }

  loadFromFile(){
    var text = fs.readFileSync('transactionstest.txt','utf8');
    var transactions = JSON.parse(text);
    for(let i = 1; i < transactions.length; i++){
      this.transactions[i] = transactions[i];
    }
  }

  saveToFile(){
    fs.writeFile('transactionstest.txt', JSON.stringify(this.transactions), function (err) {
      if (err) return console.log(err);
    });
  }

  generateSig(privateKey64, msg, publicKey64){
    var publicKey = new Buffer(publicKey64, 'base64');
    var privateKey = new Buffer(privateKey64, 'base64');
    eccrypto.sign(privateKey, msg).then(function(sig) {
      sig64 = sig.toString('base64');
      console.log("sig64 " + sig64);
      eccrypto.verify(publicKey, msg, sig).then(function() {
        console.log("Signature is OK");
      }).catch(function() {
        console.log("Signature is BAD");
      });

    });
  }

  generatePrivateKey(){
    return crypto.randomBytes(32).toString('base64');
  }

  generatePublicKey(privateKey64){
    var privateKey = new Buffer(privateKey64, 'base64');
    return eccrypto.getPublic(privateKey).toString('base64');
  }

  generateMsg(from, too, amount){
    return '{"from":"' + from + '", "too":"' + too + '", "amount":"' + amount + '"}';
  }

  addTransaction(type, inputs, outputs, privateKey64){
    /*var pinputs = JSON.parse(inputs);
    for (var i = 0; i < pinputs.length; i++) {
     pinputs[i]
   }*/
    var msg = SHA256("hello").toString();
    msg = crypto.createHash("sha256").update(msg).digest();
    console.log("msg " + msg.toString('base64'));
    var publicKey = new Buffer(from, 'base64');
    var privateKey = new Buffer(privateKey64, 'base64');
    console.log("ecc" + eccrypto.sign(privateKey, msg));
    eccrypto.sign(privateKey, msg).then(function(sig) {
      sig64 = sig.toString('base64');

      console.log("sig64 " + sig64);

      eccrypto.verify(publicKey, msg, sig).then(function() {
        console.log("Signature is OK");
        var trans = new transaction(type, jdata);
        var text = fs.readFileSync('transactionstest.txt','utf8');
        fs.writeFile('transactionstest.txt', text + "\n" + JSON.stringify(trans), function (err) {
          if (err) return console.log(err);
        });
      }).catch(function() {
        console.log("Signature is BAD");
      });
      //this.transactions.push(new transaction(from, too, amount, sig64));
    });
    //saveToFile();
  }
  test(){
  }


}

const Transactions = new transactions();
module.exports = Transactions;