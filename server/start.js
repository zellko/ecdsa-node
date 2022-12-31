const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");

/******
Functions to generate random public / private keys pairs...
... and to load them with virtual token.

!!! For the purpose of this exercice only !!!
******/

function getAddress(publicKey) {
    // Get 0x address from the pub key
    const pubKeyWithoutFormat = publicKey.slice(1); // Remove first byte1
    const hash = keccak256(pubKeyWithoutFormat); // Hash PubKey
    const addressHex =  hash.slice(-20); // Keep only the last 20 bytes
  
    const address = `0x${secp.utils.bytesToHex(addressHex)}` // Final usable address
    return address;
}
  
async function generateRandomPKey() {
    // This function generate three random keys pairs
    const keysPairs = {};

    for (let index = 0; index < 3; index++) {
      const privateKey = secp.utils.randomPrivateKey(); // Generate private key
      const pubKey = await secp.getPublicKey(privateKey); // Get public key from the private key
      const address = getAddress(pubKey); // Get address (0x...) from the public key
  
      const privateKeyToHex = secp.utils.bytesToHex(privateKey); // Convert private key to Hex
  
      keysPairs[`${address}`] = {
        privateKey: privateKeyToHex,
        pubKey: secp.utils.bytesToHex(pubKey)
      }; // Set balance object with keys data and some blance
    }

    return keysPairs;
}

module.exports = {
    generateRandomPKey
  };