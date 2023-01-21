// eslint-disable-next-line
import React, { useState, useEffect } from "react";

const Auth = ({ contractAddress, contract, account }) => {
  const [userInput, setUserInput] = useState({
    tkName: "",
    tkSymbol: "",
  });

  const [tkAddr, setTkAddr] = useState("0x00");

  const [tkBal, setTkBal] = useState(0);

  const [authButton, setAuthButton] = useState({
    text: "Register new User",
    login: true,
  });

  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const renderLoginLogoutButton = () => {
    if (userLoggedIn) {
      return (
        <div>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <button className="btn btn-primary" onClick={login}>
            Login with MetaMask
          </button>
        </div>
      );
    }
  };

  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUserInput({ ...userInput, [name]: value });
  };

  const login = async () => {
    try {
      const tx = await contract.login();
      tx.wait();
      if (tx) {
        setUserLoggedIn(true);
        window.location.reload();
      }
    } catch (error) {
      alert("Error loggin in");
      console.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const tx = await contract.logout();
      tx.wait();
      if (tx) {
        setUserLoggedIn(false);
        window.location.reload();
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const toggleAuthButton = () => {
    if (authButton.login) {
      setAuthButton({
        text: "Log in",
        login: false,
      });
    } else {
      setAuthButton({
        text: "Register new User",
        login: true,
      });
    }
  };

  const register = async () => {
    let _n = userInput.tkName;
    let _s = userInput.tkSymbol.replace(/ /g, "").toUpperCase();

    try {
      const tx = await contract.register(_n, _s);
      tx.wait();
    } catch (error) {
      alert("Error signing up with this account, try different account");
      console.error(error.message);
    }

    setUserInput({
      tkName: "",
      tkSymbol: "",
    });
  };

  useEffect(() => {
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
      } catch (error) {
        console.error("Balance Error: " + error.message);
      }
    };

    const uLi = async () => {
      try {
        const tx = await contract.checkUserLoggedIn();
        if (tx) {
          setUserLoggedIn(true);
          getTkAddr();
          getTkBal();
        } else {
          setUserLoggedIn(false);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    uLi();
  }, [account, contract]);

  return (
    <>
      <div className="container">
        <h5 className="mt-5">Current active account: {account}</h5>
        <h5 className="my-5">Token address (to import tokens): {tkAddr}</h5>
        <h5 className="mt-5">Token balance: {tkBal}</h5>

        <div>
          <button
            className="btn btn-danger px-5 py-3 my-5"
            onClick={toggleAuthButton}
          >
            {authButton.text}
          </button>
        </div>

        {authButton.login ? (
          renderLoginLogoutButton()
        ) : (
          <div className="d-flex flex-column">
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
        )}
      </div>
    </>
  );
};

export default Auth;
