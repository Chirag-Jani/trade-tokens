// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "contracts/ERC20Token.sol";

contract TokenFactory {
    event UserRegistred(address indexed User, address indexed Token);

    // to hold all the tokens
    address[] allTokens;

    // instance for utility
    ERC20Token e;

    // to uset user's token address
    mapping(address => address) userTokenAddress;

    // to map different tokens for an user
    mapping(address => mapping(address => uint256)) addressTokenBalance;

    // user exist
    mapping(address => bool) userExist;

    // name and symbol taken
    mapping(string => bool) nameExist;
    mapping(string => bool) symbolExist;

    // token exist
    mapping(address => bool) tokenExist;

    // user logged in
    mapping(address => bool) userLoggedIn;

    // registration
    function register(string memory _n, string memory _s) public {
        // check if not already registered
        require(userExist[msg.sender] == false, "User Exist");

        // check for name and symbol
        require(nameExist[_n] == false, "Name Exist");
        require(symbolExist[_s] == false, "Symbol Exist");

        // generate token
        generateToken(_n, _s);

        // mark true for registered and token name & symbol
        userExist[msg.sender] = true;
        nameExist[_n] = true;
        symbolExist[_s] = true;

        // emit event
        emit UserRegistred(msg.sender, userTokenAddress[msg.sender]);
    }

    // generating token while registration
    function generateToken(string memory _n, string memory _s) internal {
        // new contract deployment
        e = new ERC20Token(_n, _s, 18, 100, msg.sender);

        // converting to address type
        address tokenAddress = address(e);

        // pushing to all the tokens array
        allTokens.push(tokenAddress);

        // updating mappings
        addressTokenBalance[msg.sender][tokenAddress] = 100 * 10**18;
        userTokenAddress[msg.sender] = tokenAddress;
        tokenExist[tokenAddress] = true;
    }

    // getting balance of a user's token
    function getTokenBalance() public view returns (uint256) {
        address _tokenAddress = getTokenAddress(msg.sender);

        // check if token created
        require(tokenExist[_tokenAddress], "Token does not exist");

        // this will return user's balance of given token address
        return ERC20(_tokenAddress).balanceOf(msg.sender);
    }

    function getTokenAddress(address userAddress)
        public
        view
        returns (address)
    {
        // check if user exist
        require(userExist[msg.sender], "User does not exist");

        // returning address of token
        return userTokenAddress[userAddress];
    }

    // login user
    function login() public returns (bool) {
        require(userExist[msg.sender], "User does not exist");
        userLoggedIn[msg.sender] = true;
        return true;
    }

    // logout user
    function logout() public {
        require(
            userExist[msg.sender] && userLoggedIn[msg.sender],
            "User not logged in"
        );
        userLoggedIn[msg.sender] = false;
    }
}

// swaping of tokens
// function swapTokens(address _with, uint256 _amount) public {
//     address withToken = userTokenAddress[_with];
//     address yourToken = userTokenAddress[msg.sender];

//     // transferring tokens
//     // to do

//     // updating balances
//     addressTokenBalance[msg.sender][withToken] += _amount * 10**18;
//     addressTokenBalance[msg.sender][yourToken] -= _amount * 10**18;

//     addressTokenBalance[_with][yourToken] += _amount * 10**18;
//     addressTokenBalance[_with][withToken] -= _amount * 10**18;
// }
