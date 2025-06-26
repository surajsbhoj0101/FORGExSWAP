// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";


contract Token is ERC20Capped{
    constructor(string memory name, string memory symbol, uint256 totalSupply, address owner) ERC20(name,symbol) ERC20Capped(totalSupply*10**decimals()) {
        _mint(owner,totalSupply*10**decimals());
    }
}





