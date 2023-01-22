import React, { useState } from "react";
import { ethers } from "ethers";

const Swap = ({ contract, signer, erc20 }) => {
  // * address of the account you want to swap tokens
  const [swapDetails, setSwapDetails] = useState({
    address: "",
    amount: 0,
  });

  // * token details of the selected account
  const [selectedTokenInfo, setSelectedTokenInfo] = useState({
    tokenName: "-",
    tokenSymbol: "-",
    dataFetched: false,
  });

  // * handling address input
  const handleInput = (e) => {
    let n = e.target.name;
    let v = e.target.value;
    setSwapDetails({ ...swapDetails, [n]: v });
  };

  // * to get token as user enter address
  const getSelectedTokenInfo = async () => {
    if (swapDetails.address) {
      try {
        // * fetching token address from contract
        let tokenAddress;
        try {
          tokenAddress = await contract.getTokenAddress(swapDetails.address);
        } catch (error) {
          console.error("Error fetching token address: ", error.message);
        }
        // * getting contract
        const erc20Contract = new ethers.Contract(
          tokenAddress, // * passing tokenAddress as ERC20 address as we have deployed it using factory
          erc20.abi, // * to get it's methods like balaceOf, name, symbol, etc
          signer
        );
        const name = await erc20Contract.name();
        const symbol = await erc20Contract.symbol();
        setSelectedTokenInfo({
          tokenName: name,
          tokenSymbol: symbol,
          dataFetched: true,
        });
      } catch (error) {
        console.error("Error fetching with token info: ", error.message);
      }
    } else {
      alert("Enter account adddress");
    }
  };

  // * swapping of tokens
  const swapToken = async () => {
    if (swapDetails.amount > 0 && swapDetails.amount < 50) {
      console.log("Swapping" + swapDetails.amount);
    } else {
      alert("Invalid amount: > 0 or < 50 allowed");
    }

    try {
      const tx = await contract.swapTokens(
        swapDetails.address,
        swapDetails.amount
      );
      tx.wait();
      alert("Swap successfull");
    } catch (error) {
      console.error("Error swapping: ", error.message);
    }
  };
  return (
    <>
      <div className="d-flex flex-column w-50 m-auto lh-base">
        <h3 className="text-center mb-4">Swap your s#it</h3>
        <span className="row my-2 text-end">
          <label className="col-4">Amount:</label>
          <input
            className="col-8 border-dark"
            type="number"
            name="amount"
            onChange={handleInput}
            min={1}
            max={49}
          />
        </span>

        {/* // * not needed as of now */}
        {/* <span className="row my-2 text-end">
          <label className="col-4">Max. allowed:</label>
          <input
            className="col-8 border-dark"
            type="text"
            disabled={true}
            value="49"
          />
        </span> */}

        <span className="row my-2 text-end">
          <label className="col-4">With User:</label>
          <input
            className="col-8 border-dark"
            type="text"
            name="address"
            onChange={handleInput}
            autoComplete="off"
          />
        </span>

        <span className="row my-2">
          <label className="col-4 text-end">Token Details:</label>
          <input
            disabled={true}
            className="text-center border-dark col-4"
            type="text"
            value={selectedTokenInfo.tokenName}
          />
          <input
            disabled={true}
            className="text-center border-dark col-4"
            type="text"
            value={selectedTokenInfo.tokenSymbol}
          />
        </span>

        <span className="my-2 text-center">
          {!selectedTokenInfo.dataFetched ? (
            <button
              className="btn btn-success my-2 w-50"
              onClick={getSelectedTokenInfo}
            >
              Get token Info
            </button>
          ) : (
            <button className="btn btn-danger my-2 w-50" onClick={swapToken}>
              Swap
            </button>
          )}
        </span>
      </div>
    </>
  );
};

export default Swap;
