import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {keccak256} from "ethereum-cryptography/keccak";
import  {utf8ToBytes}  from "ethereum-cryptography/utils";


function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  function hashMessage(message) {
    console.log("Hashing message")
    const messageToBytes = utf8ToBytes(message);
    return keccak256(messageToBytes); 
  }

  async function broadcastTransaction(message, signature) {
    console.log("Brodacasting message")

    /*
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
  */

  }

  async function signMessage(message) {
    console.log("Signing message")

    // Signing message with private key
    const result = await secp.sign(message, privateKey, {recovered: true});

    return result
  }

  async function transferHelper(evt) {
    evt.preventDefault();
    console.log("Transfer Helper Function")
    // Ensure that fields are filled
    // TODO

    // Shape message and Stringify it
    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    };
    const messageToString = JSON.stringify(message);

    // Hash message
    const messageHash = hashMessage(messageToString);

    // Sign message
    const signature = await signMessage(messageHash);
    console.log(signature);

    // Brodact transaction to the network
    broadcastTransaction();
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
    <form className="container transfer" onSubmit={transfer}>
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
        <svg style={{width: "24px", height:"24px"}} viewBox="0 0 24 24">
          <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
      </button>
      <input type="submit" className="button" value="Broadcast"  disabled={true}/>
    </form>
  );
}

export default Transfer;
