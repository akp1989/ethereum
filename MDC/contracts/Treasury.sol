// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

import "./oz/Ownable.sol";
import "./oz/IERC20.sol";
import "./oz/SafeMath.sol";

contract Treasury is Ownable{

    using SafeMath for uint256;

    IERC20 public daoToken;

    constructor(address daoTokenAddress){
        daoToken = IERC20(daoTokenAddress);
    }

    function getBalance() public view returns (uint256){
        return daoToken.balanceOf(address(this));
    }
    
}