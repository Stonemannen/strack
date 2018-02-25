var fs = require('fs');
const SHA256 = require("crypto-js/sha256");

class Block {
  constructor(index, timestamp, data, previousHash, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = this.calculateHash();
    this.nonce = nonce;
  }

  calculateHash() {
      return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
  }

}

function validate(){
  var text = fs.readFileSync('blockchain.txt','utf8');
  var blockchain = JSON.parse(text);
  for (let i = 2; i < blockchain.length; i++){
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];
      var testblock = new Block(currentBlock.index, currentBlock.timestamp, currentBlock.data, currentBlock.previousHash, currentBlock.nonce);
      console.log("test " + testblock.calculateHash());
      console.log("real" + currentBlock.hash);

      if (testblock.calculateHash() !== currentBlock.hash) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
          console.log(i);
          return false;

      }
      var rewards = 0;
      data = currentBlock.data;
      for (var j = 0; j < data.length; j++) {
        if (data[j].type == "reward") {
          console.log("reward");
          if (data[j].data.outputs[0].amount !== 50000000) {
            return false;
          }
        }
        if (data.length > 1) {
          if (data[j].type == "reward") {
            rewards++;
          }
        }
        console.log(data[j].data);
        data[j].data
      }
      if (rewards > 1) {
        return false;
      }

  }

  return true;
}
var h = validate();
console.log(h);