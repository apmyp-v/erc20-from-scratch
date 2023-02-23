// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";

/// @title  ERC-20 contract implementation
/// @author apmyp-v
/// @notice https://eips.ethereum.org/EIPS/eip-20
/// @dev    functions override interface and virtual to be overrided in a child contract
contract ERC20 is IERC20 {
    string private name_;
    string private symbol_;
    uint private totalSupply_;
    uint8 private decimals_;

    mapping(address => uint) private balances;
    mapping(address => mapping(address => uint256)) private allowances;

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name_ = _name;
        symbol_ = _symbol;
        decimals_ = _decimals;
    }

    function name() public virtual override view returns(string memory)    { return name_;     }
    function symbol() public virtual override view returns(string memory)  { return symbol_;   }
    function decimals() public virtual override view returns(uint8)        { return decimals_; }
    
    function totalSupply() public virtual override view returns(uint256) {
        return totalSupply_;
    }

    function balanceOf(address _owner) public virtual override view returns(uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint256 _amount) virtual override public returns(bool) {
        require(_to!=address(0), "zero address");
        // EIP-20: transfers of 0 values MUST be treated as normal transfers and fire the Transfer event
        // EIP-20: the function SHOULD throw if the message caller’s account balance does not have enough tokens to spend
        require(balances[msg.sender]>=_amount,"not enough balance");

        balances[msg.sender]-=_amount;
        balances[_to]+=_amount;

        emit Transfer(msg.sender,_to,_amount);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public virtual override returns(bool) {
        require(_spender!=address(0), "zero address for spender");

        // EIP-20: if this function is called again it overwrites the current allowance with _value
        allowances[msg.sender][_spender]=_value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }
    
    function allowance(address _owner, address _spender) public virtual override view returns(uint256) {
        return allowances[_owner][_spender];
    }
    
    function transferFrom(address _from, address _to, uint256 _amount) public virtual override returns(bool) {
        require(_from!=address(0),"address from is zero");
        require(_to!=address(0),"address to is zero");
        require(_from==msg.sender || allowances[_from][_to]>=_amount,"no allowance");

        // spend allowance
        if(_from!=msg.sender)
            allowances[_from][_to]-=_amount;
        // transfer
        balances[_from]-=_amount;
        balances[_to]+=_amount;

        emit Transfer(_from,_to,_amount);
        return true;
    }

    function mint(address _to, uint _amount) internal {
        balances[_to]+=_amount;
        totalSupply_+=_amount;
        
        emit Transfer(address(0), _to, _amount);
    }
}