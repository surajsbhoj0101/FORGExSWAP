// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./Token.sol";

contract TokenFactory {

    mapping(address => address[]) public TokenDeployers;
    address[] public deployedTokens;

    event TokenCreated(
        address tokenAddress,
        string name,
        string symbol,
        uint256 supply,
        address owner
    );

    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) public returns (address) {
        Token token = new Token(name, symbol, totalSupply, msg.sender);
        deployedTokens.push(address(token));
        TokenDeployers[msg.sender].push(address(token));
        emit TokenCreated(
            address(token),
            name,
            symbol,
            totalSupply,
            msg.sender
        );
        return address(token);
    }

    function getAllTokens() public view returns (address[] memory) {
        return deployedTokens;
    }

    function getDeployedTokens() public view returns (address[] memory){
        return TokenDeployers[msg.sender];
    }
}
