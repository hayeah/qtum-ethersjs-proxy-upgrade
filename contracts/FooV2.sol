pragma solidity >=0.6.0 <0.8.0;

contract State {
  uint256 a;
  uint256 b;
  uint256 c;
}

contract FooV2 is State {
  function getA() public view returns(uint256) {
    return a + 1;
  }

  function getB() public view returns(uint256) {
    return b + 2;
  }

  function getC() public view returns(uint256) {
    return c + 3;
  }
}