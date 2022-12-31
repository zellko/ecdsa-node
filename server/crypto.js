const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

/******
Functions to check broadcasted transaction of the network
******/

function hashMessage(message) {
    const messageToBytes = utf8ToBytes(message);
    return keccak256(messageToBytes); 
}
  
async function recoverKey(hash, signature, recoveryBit) {
  const pubKey = await secp.recoverPublicKey(hash, signature, recoveryBit);
  return secp.utils.bytesToHex(pubKey);
}

async function checkSignature(signature, hash, publicKey) {
    const isSigned = secp.verify(signature, hash, publicKey, {strict: true});
    return isSigned;
}


module.exports = {
    hashMessage,
    recoverKey,
    checkSignature
  };