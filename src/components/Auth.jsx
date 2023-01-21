// eslint-disable-next-line
import React, { useState, useEffect } from "react";

const Auth = ({ contractAddress, contract, account }) => {
  const [userInput, setUserInput] = useState({
    tkName: "",
    tkSymbol: "",
  });

  const [tkAddr, setTkAddr] = useState("0x00");

  const [tkBal, setTkBal] = useState(0);

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUserInput({ ...userInput, [name]: value });
  };

  //   const login = async () => {
  //     console.log("Logging in with: " + account);
  //   };

  const register = async () => {
    let _n = userInput.tkName;
    let _s = userInput.tkSymbol.replace(/ /g, "").toUpperCase();
    console.log("Name: " + _n + " Symbol: " + _s);

    try {
      const tx = await contract.register(_n, _s);
      tx.wait();
      console.log(tx);
    } catch (error) {
      console.error(error.message);
    }
  };

  const getTkAddr = async () => {
    try {
      const tx = await contract.getTokenAddress(account);
      setTkAddr(tx);
    } catch (error) {
      console.error("Address Error: " + error.message);
    }
  };

  const getTkBal = async () => {
    try {
      const tx = await contract.getTokenBalance();
      setTkBal(parseInt(tx._hex) / 10 ** 18);
      //   setTkBal(tx);
    } catch (error) {
      console.error("Balance Error: " + error.message);
    }
  };

  useEffect(() => {
    const getData = () => {
      getTkAddr();
      getTkBal();
    };
    getData();
  }, [account]);

  return (
    <>
      <div className="container">
        <h5 className="mt-5">Current active account: {account}</h5>
        <h5 className="mt-5">Contract Address: {contractAddress}</h5>
        <h5 className="my-5">Token address (to import tokens): {tkAddr}</h5>
        <h5 className="mt-5">Token balance: {tkBal}</h5>

        {/* Login */}
        {/* <div>
          <h3>Login user</h3>
          <button className="btn btn-primary" onClick={login}>
            Login with MetaMask
          </button>
        </div> */}
        {/* Register */}
        <div className="d-flex flex-column">
          <h3>Register</h3>
          <div className="d-flex flex-column w-50">
            <input
              name="tkName"
              className="p-2 my-2 text-center"
              type="text"
              placeholder="Select your Token Name"
              onChange={handleInput}
            />
            <input
              name="tkSymbol"
              className="p-2 my-2 text-center"
              type="text"
              placeholder="Select your Token Symbol"
              onChange={handleInput}
            />
            <button className="btn btn-success my-2" onClick={register}>
              Get 100 free tokens
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
