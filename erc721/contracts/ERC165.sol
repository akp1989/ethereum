// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;


import "./library/IERC165.sol";

abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}
