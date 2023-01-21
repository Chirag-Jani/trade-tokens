// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply * 10**uint256(decimals));
    }

    function swap(
        address u1,
        address u2,
        uint256 amount
    ) public {
        _transfer(u1, u2, amount);
    }
}
