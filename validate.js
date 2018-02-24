var fs = require('fs');
const SHA256 = require("crypto-js/sha256");

function validate(){
  var text = fs.readFileSync('blockchain.txt','utf8');
  var blockchain = JSON.parse(text);
  for (let i = 1; i < blockchain.length; i++){
      const currentBlock = blockchain[i];
      const previousBlock = blockchain[i - 1];

      if (currentBlock.previousHash !== previousBlock.hash) {
          console.log(i);
          return false;

      }
  }

  return true;
}
var h = validate();
console.log(h);