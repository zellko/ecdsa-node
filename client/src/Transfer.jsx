import { useState, useEffect } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {keccak256} from "ethereum-cryptography/keccak";
import  {utf8ToBytes}  from "ethereum-cryptography/utils";



function Transfer({ address, setBalance, walletKeys }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [loadingIconClass, setLoadingIconClass] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);


  async function broadcastTransaction(message, messageHash, signature) {
    console.log("Brodacasting message");

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        message,
        messageHash,
        signature,
      });

      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  function hashMessage(message) {
    console.log("Hashing message")
    const messageToBytes = utf8ToBytes(message);
    return keccak256(messageToBytes); 
  }

  async function signMessage(hash) {
    // Signing message with private key
    console.log("Signing message")
    const result = await secp.sign(hash, privateKey, {recovered: true});
    return result
  }

  async function transferHelper(evt) {
    evt.preventDefault();
    console.log("Transfer Helper Function")

    // Show loading animation
    setLoadingIconClass("show")

    // Shape message and Stringify it
    
    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
      senderPubKey: walletKeys.pubKey,
    };
    const messageToString = JSON.stringify(message);

    // Hash message
    const messageHash = hashMessage(messageToString);

    // Sign message
    const signature = await signMessage(messageHash);
    
    // Brodact transaction to the network
    await broadcastTransaction(message, messageHash, signature);

    // Hide loading animation
    setLoadingIconClass("")
  }

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer">
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder="Enter your private keys"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <button type="button" className="button" value="Sign & Transfer"  onClick={transferHelper}> 
        Sign & Transfer
        <svg style={{width: "24px", height:"24px"}} viewBox="0 0 24 24" className={loadingIconClass}>
          <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      </button>
    </form>
  );
}

export default Transfer;
