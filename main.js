var exec = require('child_process').exec;
//exec('node server.js', function callback(error, stdout, stderr){
    // result
//});
var http = require('http');
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');
const Blockchain = require('./blockchain');
const Transaction = require('./transaction');
/*request('http://localhost:8080/api', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});*/
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

//let Blockchain = new Blockchain();
Blockchain.loadFromFile();
//console.log('Mining block 1...');
var latestblock = Blockchain.chain[Blockchain.chain.length - 1];
console.log(latestblock.index + 1);
Blockchain.addBlock(new Block(latestblock.index + 1, "20/07/2017", { amount: 4 }));
var latestblock = Blockchain.chain[Blockchain.chain.length - 1];
Blockchain.saveToFile();
//console.log('Mining block 2...');
//Blockchain.addBlock(new Block(latestblock.index + 1, "21/07/2017", { amount: 8 }));
Blockchain.sync();//console.log(Blockchain.chain);
//console.log(JSON.stringify(Blockchain.chain));

console.log(JSON.stringify(Blockchain.chain));


//download blockchain
/*var adressss = 'http://'+ ip + ':8080/api/downloadBlockchain';
var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
download(adressss, './blockchaintest.txt')*/

