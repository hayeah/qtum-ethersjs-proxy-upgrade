pragma solidity >=0.6.0 <0.8.0;

contract State {
  uint256 a;
  uint256 b;
}

contract Foo is State {
  function getA() public view returns(uint256) {
    return a;
  }

  function getB() public view returns(uint256) {
    return b;
  }
}