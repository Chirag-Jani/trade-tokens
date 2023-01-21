// eslint-disable-next-line
import React, { useState, useEffect } from "react";
import Swap from "./Swap";

const Auth = ({ contract, account }) => {
  const [userInput, setUserInput] = useState({
    tkName: "",
    tkSymbol: "",
  });

  const [tkAddr, setTkAddr] = useState("0x00");

  const [tkBal, setTkBal] = useState(0);

  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const [loginPage, setLoginPage] = useState(false);

  const getLoginPage = () => {
    setLoginPage(true);
  };

  const getRegistration = () => {
    setLoginPage(false);
  };

  const renderLoginLogoutButton = () => {
    if (userLoggedIn) {
      return (
        <div className="text-center">
          <button className="btn btn-danger py-2" onClick={logout}>
            Logout
          </button>
        </div>
      );
    } else {
      return (
        <div className="text-center">
          <button className="btn btn-primary py-2" onClick={login}>
            Login with MetaMask
          </button>
        </div>
      );
    }
  };

  const renderNav = () => {
    return (
      <div>
        <div className="d-flex text-center m-5">
          <button className="border border-dark border-4 p-2 w-50">
            <h1 onClick={getLoginPage}>Login</h1>
          </button>
          <button className="border border-dark border-4 p-2 w-50">
            <h1 onClick={getRegistration}>Register</h1>
          </button>
        </div>
      </div>
    );
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

  const register = async () => {
    let _n = userInput.tkName;
    let _s = userInput.tkSymbol.replace(/ /g, "").toUpperCase();

    try {
      const tx = await contract.register(_n, _s);
      tx.wait();
      if (tx) {
        login();
      }
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
        const tx = await contract.getTokenBalance(tkAddr);
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
          // ! it's taking time to set the address of token and that is causing an error
          if (getTkAddr()) {
            getTkBal();
          }
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
        {!userLoggedIn ? (
          loginPage ? (
            <div>
              {renderNav()}
              {renderLoginLogoutButton()}
            </div>
          ) : (
            <div>
              {renderNav()}
              <div className="d-flex justify-content-center">
                <input
                  name="tkName"
                  className="p-2 text-center mx-2"
                  type="text"
                  placeholder="Select your Token Name"
                  onChange={handleInput}
                />
                <input
                  name="tkSymbol"
                  className="p-2 text-center mx-2"
                  type="text"
                  placeholder="Select your Token Symbol"
                  onChange={handleInput}
                />
                <button
                  className="btn btn-success py-2 mx-2"
                  onClick={register}
                >
                  Get 100 free tokens
                </button>
              </div>
            </div>
          )
        ) : (
          <h1></h1>
        )}
        {userLoggedIn && renderLoginLogoutButton()}
        <div className="my-5">
          <div className="row">
            <span className="col-4 text-end">
              <p>Current active account:</p>
            </span>
            <p className="col-8">
              <strong> {account}</strong>
            </p>
          </div>
          <div className="row">
            <span className="col-4 text-end">
              <p>Token address:</p>
            </span>
            <p className="col-8">
              <strong> {tkAddr}</strong>
            </p>
          </div>
          <div className="row">
            <span className="col-4 text-end">
              <p>Token balance:</p>
            </span>
            <p className="col-8">
              <strong> {tkBal}</strong>
            </p>
          </div>
        </div>
      </div>

      {userLoggedIn ? <Swap contract={contract} account={account} /> : <p></p>}
    </>
  );
};

export default Auth;
