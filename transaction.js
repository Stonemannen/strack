var crypto = require("crypto");
var eccrypto = require("eccrypto");
var fs = require('fs');

class transaction{
  constructor(from, too, amount, sig) {
    this.from = from;
    this.too = too;
    this.amount = amount;
    this.sign = sig;
    this.msg = '{"from":"' + this.from + '", "too":"' + this.too + '", "amount":"' + this.amount + '"}'
  }
  validate(){
    eccrypto.verify(this.from, this.msg, this.sig).then(function() {
      console.log("Signature is OK");
    }).catch(function() {
      console.log("Signature is BAD");
    });
  }

  generateSig(privateKey, msg){
    eccrypto.sign(privateKey, msg).then(function(sig) {
      console.log("Signature in DER format:", sig);
      eccrypto.verify(publicKey, msg, sig).then(function() {
        console.log("Signature is OK");
      }).catch(function() {
        console.log("Signature is BAD");
      });
    });
    return sig;
  }
}

class transactions{
  constructor(){
    this.transactions = [];
  }

  addTransaction(newTransaction){
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

  generateSig(privateKey, msg){
    eccrypto.sign(privateKey, msg).then(function(sig) {
      console.log("Signature in DER format:", sig);
      eccrypto.verify(publicKey, msg, sig).then(function() {
        console.log("Signature is OK");
      }).catch(function() {
        console.log("Signature is BAD");
      });
    });
    return sig;
  }

}

const Transactions = new transactions();
module.exports = Transactions;