import server from "./server";
import Wallet from "./Wallet";
import Transfer from "./Transfer";
import KeysDisplay from "./KeysDisplay";

import "./App.scss";
import { useState, useEffect } from "react";




function App() {
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [keys, setKeys] = useState(undefined);

  useEffect(()=>{
    async function getKeys() {
      const data = await server.get(`keys/`);

      setKeys(data.data)
    }

    getKeys();
  }, [])

  function getWalletKeys(address) {
    if (!keys) return
    return keys[address] || 0;
  }

  return (
    <div className="app">
      <Wallet
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
      />
      <Transfer 
      setBalance={setBalance} 
      address={address} 
      walletKeys = {getWalletKeys(address)}
      />
      <KeysDisplay  keys={keys}/>
    </div>
  );
}

export default App;
