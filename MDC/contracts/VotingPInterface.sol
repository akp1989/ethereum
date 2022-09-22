// SPDX-License-Identifier: Open Software License 1.0
pragma solidity >=0.4.22 <0.9.0;

interface VotingPInterface {

    function getProposalDeposit() external returns (uint256);

    function getTokenTribute() external returns (uint256);

    function getProcessingReward() external returns (uint256);

    function balanceOf() external view returns (uint256);

    function allowance(address spender) external view returns (uint256);

    function approve(address spender, uint256 value) external returns (bool);

}