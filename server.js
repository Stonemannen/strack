// server.js

// BASE SETUP
// =============================================================================
"use strict"
// call the packages we need
var cluster = require('cluster');
if (cluster.isMaster) {
  cluster.fork();

  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
  });
}

if (cluster.isWorker) {
  // put your code here

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
const SHA256 = require("crypto-js/sha256");
var request = require('request');
var bodyParser = require('body-parser');
var validate = require('./validate');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));

class Block {
  constructor(index, timestamp, data, previousHash) {
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


class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2017", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    addRawBlock(newBlock) {
      this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }

    sync() {
      //var ip = [];
      let strack = new Blockchain();
      var text = fs.readFileSync('blockchain.txt','utf8');
      var blockchain = JSON.parse(text);
      for(let i = 1; i < blockchain.length; i++){
        this.chain[i] = blockchain[i];
      }
      var text = fs.readFileSync('nodelist.txt','utf8');
      var ip = text.split(",");
      var latestblock =  this.chain[this.chain.length - 1];
      var blockIndex = latestblock.index;
      console.log(blockIndex);
      console.log('bl: ', blockIndex);
      var sync = false;
      var rblockchain = '';
      for(var i = 0; i < ip.length - 1; i++){
        //console.log(ip[i]);
        var address = 'http://' + ip[i] + ':8080/api/getLatestBlock'
        var ipo = ip[i]
        request(address, function (error, response, body) {
          let stracka = new Blockchain();
          stracka.loadFromFile();
          console.log(blockIndex);
          console.log('biudy:', body);
          rblockchain = JSON.parse(body);
          console.log(rblockchain.index);
          console.log(blockIndex);
          if (Number(rblockchain.index) !== blockIndex) {
            console.log("sync");
            sync = true;

          }else{sync = false;}
          if (sync) {
            console.log(Number(rblockchain.index) < blockIndex);
            if(Number(rblockchain.index) < blockIndex){
                for (var j = Number(rblockchain.index); j < blockIndex; j++) {
                  let strackb = new Blockchain();
                  strackb.loadFromFile();
                  var addresss = 'http://'+ ipo + ':8080/api/addBlock'
                  console.log(ipo);
                  console.log(strackb.chain[j + 1]);
                  request.post({
                    headers: {'content-type' : 'application/x-www-form-urlencoded'},
                    url:     addresss,
                    body:    "block=" + JSON.stringify(strackb.chain[j + 1])
                  }, function(error, response, body){
                    console.log(body);
                  });
                }
            }
            else {
              var addressss = 'http://'+ ipo + ':8080/api/sync/'
              request(addressss, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log('body:', body); // Print the HTML for the Google homepage.
              });
            }
          }
        });


      }

    }

    loadFromFile(){
      var text = fs.readFileSync('blockchain.txt','utf8');
      var blockchain = JSON.parse(text);
      for(let i = 1; i < blockchain.length; i++){
        this.chain[i] = blockchain[i];
      }
    }

    syncip(ip){
      var latestblock =  this.chain[this.chain.length - 1];
      var blockIndex = latestblock.index;
      var adress = 'http://' + ip + ':8080/api/getBlock/' + blockIndex.toString();
      var res = '';
      request(address, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
      });
    }

    saveToFile(){
      fs.writeFile('blockchain.txt', JSON.stringify(this.chain), function (err) {
        if (err) return console.log(err);
      });
    }
}

var bc = new Blockchain();
bc.loadFromFile();
//var blockchain = require('./main.js');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    bc.loadFromFile();
    rs.send(JSON.stringify(bc.chain));

});

router.get('/downloadBlockchain', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    res.download('./blockchain.txt');

});

router.get('/addNode:ip', function(req, res) {
    var request = req.params;
    var ip = request.ip;
    var text = fs.readFileSync('nodelist.txt','utf8');
    fs.writeFile('nodelist.txt', text + ip + ",", function (err) {
      if (err) return console.log(err);
    });
    res.send("200");

});

router.get('/getBlock/:blockIndex', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    var request = req.params;
    var block = request.blockIndex;
    bc.loadFromFile();
    var sendBlock = bc.chain[block];

    res.json(sendBlock);

});

router.get('/sync', function(req, res) {
    //console.log(strack.chain);
    //res.json(blockchain.strack.chain);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.replace('::ffff:','');
    bc.sync();
    console.log(ip);
    res.send("200");

});

/*router.get('/addBlock/:block', function(req, res) {
    //bc.loadFromFile();
    var rawBlock = req.params.block;
    //bc.addRawBlock(rawBlock);
    //fs.writeFile('blockchain.txt', JSON.stringify(bc.chain), function (err) {
    if (err) return console.log(err);
    rs.send("200");
    console.log("serv", JSON.stringify(rawBlock));
});*/

router.post('/addBlock', function(req, res) {
    bc.loadFromFile();
    var tem = new Blockchain();
    tem.loadFromFile();
    var block = req.body.block;
    var rawBlock = JSON.parse(block);
    if (rawBlock.index == bc.getLatestBlock + 1) {
      tem.addRawBlock(rawBlock);
      console.log(validate.validate(tem.chain));
      if (validate.validate(tem.chain)) {
        bc.addRawBlock(rawBlock)
        bc.saveToFile();
      }

    }
    bc.sync();
    //console.log(block);
    res.send("200");
});



// more routes for our API will happen here
router.get('/getLatestBlock', function(req, res) {
  bc.loadFromFile();
  var text = JSON.stringify(bc.chain);
  var blocks = JSON.parse(text);
  res.send(blocks[blocks.length - 1]);
  //console.log("ser", blocks[blocks.length - 1]);
  /*fs.readFile('./blockchain.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
      //console.log(data);
      res.send(data);
    });*/

});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
}

//the end
