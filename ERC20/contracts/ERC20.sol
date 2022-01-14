// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./library/IERC20.sol";
import "./library/SafeMath.sol";

contract ERC20 is IERC20 {

    using SafeMath for uint256;

    //mapping(spender=>allownace)
    mapping (address=>uint256) private _balances;

    //mapping(owner=>mapping(spender,allowance))
    mapping (address=>mapping(address=>uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _symbol;
    string private _name;
    uint8 private _decimals;


    constructor(string memory name_, string memory symbol_)
    {
        _name = name_;
        _symbol=symbol_;
        _decimals=18;

    }

     function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public pure returns (uint8){
        return 18;
    }


    //returns the total supply of the tokens
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    //returns the balance of given account address
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    //return allowances of token that spender can spend on behalf of owner
    function allowance(address owner, address spender) public view override  returns (uint256) {
        return _allowances[owner][spender];
    }

    //sets the allownaces of spender as the given amount
    // emits approve event
    // ** spender cannot be zeo address
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    //Transfer to a reciepient
    // emits transfer event
    // ** recipient cannot be zero address
    // ** sender must have balance >=amount
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    //Transfer from sender to receiver
    // emits transfer event
    // emits an approval event indicating the updated allowance
    // ** sender and recipient cannot be zero address
    // ** sender must have balance >=amount
    // ** the caller(msg.sender) of the function should have allowance for sender's token
    function transferFrom(address sender, address recipient, uint256 amount ) public override returns (bool) {
        
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, msg.sender, currentAllowance.sub(amount));
        _transfer(sender, recipient, amount);
        return true;
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);
        require( _balances[sender] >= amount, "ERC20: transfer amount exceeds balance");
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }


    function _approve(address owner,  address spender,  uint256 amount ) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }


    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(msg.sender, spender, _allowances[msg.sender][spender].add(addedValue));
        return true;
    }

     function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 currentAllowance = _allowances[msg.sender][spender];
        require(currentAllowance >= subtractedValue, "ERC20: decreased allowance below zero");
        _approve(msg.sender, spender, currentAllowance.sub(subtractedValue));
 
        return true;
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), account, amount);

        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
        emit Transfer(address(0), account, amount);
       
        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");

        _beforeTokenTransfer(account, address(0), amount);
        
        require(_balances[account] >= amount, "ERC20: burn amount exceeds balance");
        _balances[account] = _balances[account].sub(amount);
        _totalSupply =_totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);

        _afterTokenTransfer(account, address(0), amount);
    }

    function _burnFrom(address account, uint256 value) internal {
        _allowances[account][msg.sender] = _allowances[account][msg.sender].sub(value);
        _burn(account, value);
        emit Approval(account, msg.sender, _allowances[account][msg.sender]);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual {}

}