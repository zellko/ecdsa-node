const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

/******
Functions to check broadcasted transaction of the network
******/

function getAddress(publicKey) {
    // Get 0x usable address from the pub key
    const pubKeyWithoutFormat = publicKey.slice(1); // Remove first byte1
    const hash = keccak256(pubKeyWithoutFormat); // Hash PubKey
    const addressHex =  hash.slice(-20); // Keep only the last 20 bytes
  
    const address = `0x${secp.utils.bytesToHex(addressHex)}` // Final usable address
    return address;
}

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


module.exports = {
    getAddress,
    hashMessage,
    recoverKey,
    checkSignature
  };