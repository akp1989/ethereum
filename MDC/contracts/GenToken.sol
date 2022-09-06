// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./oz/ERC20.sol";

contract GenToken is ERC20 {
    // constructor(string memory _name, string memory _symbol) ERC20(_name,_symbol){
        
    // }

    // function mint(address to, uint256 amount) public {
    //     _mint(to, amount);
    // }

    // function burn(address to, uint256 amount) {
    //     _burn(to,amount);
    // }

    constructor(uint256 supply) {
        _mint(msg.sender, supply);
    }  
}