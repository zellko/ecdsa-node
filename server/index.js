const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

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

  console.log(balances)
}

const keysPairs = {};
const balances = {};
generateRandomPKey(); // Generate three keys pairs at the start of the server



app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/keys", (req, res) => {

  res.send(keysPairs);
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

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
