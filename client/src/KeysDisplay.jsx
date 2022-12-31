function copyKeyToClipboard(e) {
    navigator.clipboard.writeText(e.target.textContent);
}


function KeysDisplay({ keys }) {

    function renderKeysTable() {
        if (keys === undefined){
            return(
                <p>Oops, something went wrong generating keys.</p>
            )
        }

        const publicKeys = Object.keys(keys);

        return(
                <table>
                    <thead>
                        <tr>
                            <th>Public</th>
                            <th>Private</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td onClick={copyKeyToClipboard}>{publicKeys[0]}</td>
                          <td onClick={copyKeyToClipboard}>{keys[publicKeys[0]].privateKey}</td>
                        </tr>
                        <tr>
                          <td onClick={copyKeyToClipboard}>{publicKeys[1]}</td>
                          <td onClick={copyKeyToClipboard}>{keys[publicKeys[1]].privateKey}</td>
                        </tr>
                        <tr>
                          <td onClick={copyKeyToClipboard}>{publicKeys[2]}</td>
                          <td onClick={copyKeyToClipboard}>{keys[publicKeys[2]].privateKey}</td>
                        </tr>
                  </tbody>
                </table>
        )   
    }


  return (
    <div className="container keys">
      <h1>Random Generated keys</h1>
      <h2>⚠️ Thoses keys should not be used to generate any wallet! ⚠️</h2>
    
      {renderKeysTable()}
      <p>Click on a keys to copy it to clipboard! </p>
    </div>
  );
}

export default KeysDisplay;
