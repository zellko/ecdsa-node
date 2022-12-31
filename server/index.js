const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

const start = require("./start");
const crypto = require("./crypto");

const express = require("express");
const app = express();
const cors = require("cors");
const { json } = require("express");
const port = 3042;

app.use(cors());
app.use(express.json());

/******
Functions to generate some keys pair at start of the server
******/

function setBalance() {
  // Provide a balance to each generated keys
  const addressList = Object.keys(keysPairs);

  for (let index = 0; index < addressList.length; index++) {
    balances[addressList[index]] = 100 - (index * 10);
  }
}

async function onStart() {
  // When the server is start, generate random private key...
  // .. and load them with some token

  keysPairs = await start.generateRandomPKey(); // Generate three keys pairs at the start of the server
  setBalance(keysPairs);  
}

const balances = {};
let keysPairs = {};
onStart();

/******
Functions to convert data from object to uint8 array. 
******/

function convertObjectToArray(obj) {
  let array = [];
  const objKeys= Object.keys(obj);

  for (let index = 0; index < objKeys.length; index++) {
    const keys = objKeys[index];
    const value = obj[keys];

    array.push(value);
  }

  return new Uint8Array(array);;
}

/******
Server (Network) listening functions 
******/

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/keys", (req, res) => {
  res.send(keysPairs);
});

app.post("/send",async (req, res) => {
  const { message, messageHash, signature } = req.body;
  const { sender, recipient, amount, senderPubKey } = message
  const [sig, recoveryBit] = signature;

  console.log("Network received transactions datas")

  // Set balance if address are not part of the list
  setInitialBalance(sender);
  setInitialBalance(recipient);

  // Data are provided as object and must be converted back as uint8 array...
  // ...to be usable with ethereum-cryptography library
  let messageHashArray = convertObjectToArray(messageHash);
  let sigArray = convertObjectToArray(sig);

  // Server check if the message and message hash are the same. 
  const messageHashToString = JSON.stringify(messageHashArray);
  const messageToString = JSON.stringify(crypto.hashMessage(JSON.stringify(message)));

  if ( messageHashToString !== messageToString){
      res.status(400).send({ message: "Message and message hash are not matching!" });
      return
  }
  console.log("Message and Hash are matching")

  // Server check if the public address is matching sender address
  const derivatePublicKey = await crypto.recoverKey(messageHashArray, sigArray, recoveryBit);

  if (senderPubKey !== derivatePublicKey){
    res.status(400).send({ message: "Sender pubkey do not match pubkey derivated from signature!" });
    return
  }

  console.log("Pubkey and sender are matching")

  // Server check if the signature is valid. Q: Is this check needed ?
  const isSignatureValid = await crypto.checkSignature(sigArray, messageHashArray, derivatePublicKey);
  if (!isSignatureValid){
    res.status(400).send({ message: "Invalid Signature!" });
    return
  }
  console.log("Signature is valid")

  //Update balance
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
