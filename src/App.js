import { ethers } from "ethers";
import TokenFactory from "./artifacts/contracts/TokenFactory.sol/TokenFactory.json";
import { useState, useEffect } from "react";
import Auth from "./components/Auth";
function App() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // * current contract object
  const [contract, setContract] = useState();

  // * active account address
  const [account, setAccount] = useState("");

  const getProvider = async (provider) => {
    const signer = provider.getSigner();

    try {
      const contract = new ethers.Contract(
        contractAddress,
        TokenFactory.abi,
        signer
      );

      setContract(contract);

      console.log("Contract info:", contract);

      // * getting active account
      const addr = await signer.getAddress();

      // * setting address
      setAccount(addr);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", () => {
      window.location.reload();
    });

    // * calling function
    provider && getProvider(provider);
  }, [contractAddress]);

  return (
    <div className="container">
      <Auth
        contractAddress={contractAddress}
        contract={contract}
        account={account}
      />
    </div>
  );
}

export default App;
