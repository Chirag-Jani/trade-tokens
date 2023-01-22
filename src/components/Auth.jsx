// eslint-disable-next-line
import React, { useState, useEffect } from "react";
import Swap from "./Swap";
import ERC20 from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";
import { ethers } from "ethers";

const Auth = ({ contract, account, signer }) => {
  // * state while registration
  const [userInput, setUserInput] = useState({
    tkName: "",
    tkSymbol: "",
  });

  // * to handle token info
  const [tokenInfo, setTokenInfo] = useState({
    tokenName: "-",
    tokenSymbol: "-",
    tokenAddress: "-",
    tokenBalance: 0,
    tokenOwnerAddress: "-",
  });

  // * to keep user logged in even after reload
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // * to render loging and signup pages conditionally
  const [loginPage, setLoginPage] = useState(false);

  // * to get login page
  const getLoginPage = () => {
    setLoginPage(true);
  };

  // * to get registration page
  const getRegistration = () => {
    setLoginPage(false);
  };

  // * to render login and logout button conditionally
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

  // * to render navbar with login/register features conditionally
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

  // * to set user's input while registration
  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    setUserInput({ ...userInput, [name]: value });
  };

  // * to login
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

  // * to log out
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

  // * to register
  const register = async () => {
    let _n = userInput.tkName;
    let _s = userInput.tkSymbol.replace(/ /g, "").toUpperCase();

    try {
      const tx = await contract.register(_n, _s);
      tx.wait();
      setUserInput({
        tkName: "",
        tkSymbol: "",
      });
    } catch (error) {
      alert("Registration Interrupted!!");
      console.error(error.message);
    }
  };

  // ! TO GET TOKEN INFO FROM OPENZEPPELIN
  const fetchTokenOz = async (addr = account) => {
    try {
      // * fetching token address from contract
      let tokenAddress;
      try {
        tokenAddress = await contract.getTokenAddress(addr);
      } catch (error) {
        console.error("Error fetching token address: ", error.message);
      }

      // * getting contract
      const erc20Contract = new ethers.Contract(
        tokenAddress, // * passing tokenAddress as ERC20 address as we have deployed it using factory
        ERC20.abi, // * to get it's methods like balaceOf, name, symbol, etc
        signer
      );

      try {
        // * calling methods
        let bal = await erc20Contract.balanceOf(addr);
        bal = parseInt(bal._hex / 10 ** 18);
        const name = await erc20Contract.name();
        const symbol = await erc20Contract.symbol();
        // const deci = await erc20Contract.decimals(); // * not needed yet

        // * setting state
        setTokenInfo({
          tokenName: name,
          tokenSymbol: symbol,
          tokenAddress: tokenAddress,
          tokenBalance: bal,
          tokenOwnerAddress: addr,
        });
      } catch (error) {
        console.error(error.message);
      }
    } catch (error) {
      console.error("Error fetching from OZ: ", error.message);
    }
  };

  // * checking if user is logged in or not in the contract
  const userLoggedInStatus = async () => {
    try {
      const tx = await contract.checkUserLoggedIn();
      if (tx) {
        setUserLoggedIn(true);
        fetchTokenOz();
      } else {
        setUserLoggedIn(false);
      }
    } catch (error) {
      console.error("Could not get state: ", error.message);
    }
  };

  // * to run whenever component is mounted
  useEffect(() => {
    // * calling function to get info
    userLoggedInStatus();
    // eslint-disable-next-line
  }, [account]);

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
                  autoComplete="off"
                />
                <input
                  name="tkSymbol"
                  className="p-2 text-center mx-2"
                  type="text"
                  placeholder="Select your Token Symbol"
                  onChange={handleInput}
                  autoComplete="off"
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
          <></>
        )}
        <div className="my-5">
          {userLoggedIn ? (
            <div className="d-flex align-start m-5">
              {renderLoginLogoutButton()}
            </div>
          ) : (
            <></>
          )}

          {userLoggedIn ? (
            <div>
              <h2 className="text-center my-5">Your token Details</h2>
              <div className="row">
                <span className="col-4 text-end">
                  <p>Token Owner:</p>
                </span>
                <p className="col-8">
                  <strong> {tokenInfo.tokenOwnerAddress}</strong>
                </p>
              </div>
              <div className="row">
                <span className="col-4 text-end">
                  <p>Token address:</p>
                </span>
                <p className="col-8">
                  <strong> {tokenInfo.tokenAddress}</strong>
                </p>
              </div>
              <div className="row">
                <span className="col-4 text-end">
                  <p>Token Name:</p>
                </span>
                <p className="col-8">
                  <strong> {tokenInfo.tokenName}</strong>
                </p>
              </div>
              <div className="row">
                <span className="col-4 text-end">
                  <p>Token Symbol:</p>
                </span>
                <p className="col-8">
                  <strong> {tokenInfo.tokenSymbol}</strong>
                </p>
              </div>
              <div className="row">
                <span className="col-4 text-end">
                  <p>Available Amount:</p>
                </span>
                <p className="col-8">
                  <strong> {tokenInfo.tokenBalance}</strong>
                </p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-center">
                Log in / Register to see your token Details
              </h3>
            </>
          )}
        </div>
      </div>

      {/* // * Rendering Swapping component if user logged in */}
      {userLoggedIn ? (
        <Swap contract={contract} signer={signer} erc20={ERC20} />
      ) : (
        <p></p>
      )}
    </>
  );
};

export default Auth;
