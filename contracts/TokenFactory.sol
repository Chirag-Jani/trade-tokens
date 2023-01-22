// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "contracts/ERC20Token.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// get back the token (reverse swap)
// approval shit
// reputation shit
// user struct (with name, ref. code, ref. by, earned reputation, token reputation)
// on refferals, reward with each other's tokens

interface ERC20TokenInterface {
    function swap(
        address u1,
        address u2,
        uint256 amount
    ) external;
}

contract TokenFactory {
    event UserRegistred(address indexed User, address indexed Token);

    // to hold all the tokens
    address[] allTokens;

    // instance for utility
    ERC20Token e;

    //
    mapping(address => ERC20Token) userContractAddress;

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
    function register(string memory _tokenName, string memory _tokenSymbol)
        public
    {
        // check if not already registered
        require(userExist[msg.sender] == false, "User Exist");

        // check for name and symbol
        require(nameExist[_tokenName] == false, "Name Exist");
        require(symbolExist[_tokenSymbol] == false, "Symbol Exist");

        // generate token
        generateToken(_tokenName, _tokenSymbol);

        // mark true for registered and token name & symbol
        userExist[msg.sender] = true;
        nameExist[_tokenName] = true;
        symbolExist[_tokenSymbol] = true;

        // emit event
        emit UserRegistred(msg.sender, userTokenAddress[msg.sender]);
    }

    // generating token while registration
    function generateToken(string memory _tokenName, string memory _tokenSymbol)
        internal
    {
        // new contract deployment
        e = new ERC20Token(_tokenName, _tokenSymbol, 18, 100, msg.sender);

        // setting contract address of user
        userContractAddress[msg.sender] = e;

        // converting to address type
        address tokenAddress = address(e);

        // pushing to all the tokens array
        allTokens.push(tokenAddress);

        // updating mappings
        addressTokenBalance[msg.sender][tokenAddress] = 100 * 10**18;
        userTokenAddress[msg.sender] = tokenAddress;
        tokenExist[tokenAddress] = true;
    }

    function getMyTokenBalance() public view returns (uint256) {
        address _tokenAddress = getTokenAddress(msg.sender);

        // this will return user's balance of given token address
        uint256 b1 = ERC20(_tokenAddress).balanceOf(msg.sender);
        uint256 b2 = addressTokenBalance[msg.sender][_tokenAddress];

        require(b1 == b2, "Accounts mismatch");

        return b1;
    }

    // getting balance of a user's swapped token
    function getTokenBalance(address _tokenAddress)
        public
        view
        returns (uint256)
    {
        // address _tokenAddress = getTokenAddress(msg.sender);

        // check if token created
        require(tokenExist[_tokenAddress], "Token does not exist");

        // this will return user's balance of given token address
        uint256 b1 = ERC20(_tokenAddress).balanceOf(msg.sender);
        uint256 b2 = addressTokenBalance[msg.sender][_tokenAddress];

        require(b1 == b2, "Accounts mismatch");

        return b1;
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

    // to check if user logged in or not
    function checkUserLoggedIn() public view returns (bool) {
        return userLoggedIn[msg.sender];
    }

    // swaping of tokens
    function swapTokens(address _with, uint256 _amount) public {
        require(_with != msg.sender, "Can't swap with yourself");

        // can not swap more than 50 tokens max 49
        require(_amount < 50, "Can not swap more than 50 tokens");

        _amount *= 10**18;

        // getting token addresses
        address t1 = getTokenAddress(msg.sender);
        address t2 = getTokenAddress(_with);

        // decresing own token balance
        addressTokenBalance[msg.sender][t1] -= _amount;
        addressTokenBalance[_with][t2] -= _amount;

        // adding new token balance
        addressTokenBalance[msg.sender][t2] += _amount;
        addressTokenBalance[_with][t1] += _amount;

        // transferring ERC20 here, as above is just updating variables and not real transfer
        ERC20TokenInterface(t1).swap(msg.sender, _with, _amount);
        ERC20TokenInterface(t2).swap(_with, msg.sender, _amount);
    }

    // getting your tokens back
    function reverseSwap(address _with, uint256 _amount) public {
        require(_with != msg.sender, "Can't swap with yourself");

        _amount *= 10**18;

        // getting token addresses
        address t1 = getTokenAddress(msg.sender);
        address t2 = getTokenAddress(_with);

        require(
            _amount <= addressTokenBalance[msg.sender][t2],
            "Can not get back more than swapped earlier"
        );

        // getting own token back
        addressTokenBalance[msg.sender][t1] += _amount;
        addressTokenBalance[_with][t2] += _amount;

        // decreasig swapped tokens
        addressTokenBalance[msg.sender][t2] -= _amount;
        addressTokenBalance[_with][t1] -= _amount;

        // transferring ERC20 here, as above is just updating variables and not real transfer
        ERC20TokenInterface(t1).swap(_with, msg.sender, _amount);
        ERC20TokenInterface(t2).swap(msg.sender, _with, _amount);
    }
}
