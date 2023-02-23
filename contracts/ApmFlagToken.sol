// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20.sol";

/// @title  Contract implementation
/// @author apmyp-v
contract ApmFlagToken is ERC20 {
    constructor() ERC20("Apmyp Flag Token","AFT",0) {
        mint(msg.sender,1);
    }
}