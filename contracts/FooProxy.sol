pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

contract FooProxy is TransparentUpgradeableProxy {
  constructor(address _logic, address admin_, bytes memory _data) public payable TransparentUpgradeableProxy(_logic, admin_, _data) {
  }
}