const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const { json } = require("express");
const port = 3042;

app.use(cors());
app.use(express.json());

/******
Functions to generate random public / private keys pairs...
... and to load them with virtual token.

!!! For the purpose of this exercice only !!!
******/

function getAddress(publicKey) {
  // Get 0x usable address from the pub key
  const pubKeyWithoutFormat = publicKey.slice(1); // Remove first byte1
  const hash = keccak256(pubKeyWithoutFormat); // Hash PubKey
  const addressHex =  hash.slice(-20); // Keep only the last 20 bytes

  const address = `0x${secp.utils.bytesToHex(addressHex)}` // Final usable address
  return address;
}

async function generateRandomPKey() {
  // This function generate three random keys pairs

  for (let index = 0; index < 3; index++) {
    const privateKey = secp.utils.randomPrivateKey(); // Generate private key
    const pubKey = await secp.getPublicKey(privateKey); // Get public key from the private key
    const address = getAddress(pubKey); // Get address (0x...) from the public key

    const privateKeyToHex = secp.utils.bytesToHex(privateKey); // Convert private key to Hex

    keysPairs[`${address}`] = privateKeyToHex; // Set balance object with keys data and some blance
  }

  console.log(keysPairs);
  setBalance(); 
}

function setBalance() {
  // Provide a balance to each generated keys

  const addressList = Object.keys(keysPairs);

  for (let index = 0; index < addressList.length; index++) {
    balances[addressList[index]] = 100 - (index * 10);
  }
}

const keysPairs = {};
const balances = {};
generateRandomPKey(); // Generate three keys pairs at the start of the server


/******
Functions to check broadcasted transaction of the network
******/

function hashMessage(message) {
  const messageToBytes = utf8ToBytes(message);
  return keccak256(messageToBytes); 
}

async function recoverKey(hash, signature, recoveryBit) {
  const pubKey = await secp.recoverPublicKey(hash, signature, recoveryBit);
  return pubKey;
}

async function checkSignature(signature, hash, publicKey) {
  const isSigned = secp.verify(signature, hash, publicKey, {strict: true});
  return isSigned;
}

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
  const { sender, recipient, amount } = message
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
  const messageToString = JSON.stringify(hashMessage(JSON.stringify(message)));

  if ( messageHashToString !== messageToString){
      res.status(400).send({ message: "Message and message hash are not matching!" });
      return
  }
  console.log("Message and Hash are matching")

  // Server check if the public address is matching sender address
  const publicKey = await recoverKey(messageHashArray, sigArray, recoveryBit);
  const publicKeyToAddress = getAddress(publicKey);

  if ( sender !== publicKeyToAddress){
    res.status(400).send({ message: "Sender addresse is not matching signed transaction address!" });
    return
  }

  console.log("Pubkey and sender are matching")

  // Server check if the signature is valid. Q: Is this check needed ?
  const isSignatureValid = await checkSignature(sigArray, messageHashArray, publicKey);
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
