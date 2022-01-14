// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./ERC20.sol";
import "./library/MinterRole.sol";

contract GenToken is ERC20,MinterRole {
    constructor(string memory _name, string memory _symbol) ERC20(_name,_symbol){
        
    }

    function mint(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }

    function burn(address to, uint256 amount)public {
        _burn(to,amount);
    }
}