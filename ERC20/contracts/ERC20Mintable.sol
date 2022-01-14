// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./ERC20.sol";
import "./library/MinterRole.sol";

abstract contract ERC20Mintable is ERC20, MinterRole {

    function mint(address to, uint256 value) public onlyMinter returns (bool) {
        _mint(to, value);
        return true;
    }

    function addMinter(address account) public override onlyMinter {
        _addMinter(account);
    }

    function renounceMinter() public override {
        _removeMinter(msg.sender);
    }
}