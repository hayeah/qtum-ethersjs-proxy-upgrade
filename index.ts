import { ethers } from "ethers"

import BasicToken from "./build/BasicToken.json"
import FooProxy from "./build/FooProxy.json"
import Foo from "./build/Foo.json"
import FooV2 from "./build/FooV2.json"

const {
  Contract,
  ContractFactory
} = ethers

import { Deployer } from "./Deployer"

async function main() {
  const oneEth = ethers.constants.WeiPerEther
  const zeroAddress = ethers.constants.AddressZero
  const oneQtum = ethers.BigNumber.from(1e8)
  const rpc = new ethers.providers.JsonRpcProvider("http://qtum:testpasswd@localhost:23889")

  const signer = rpc.getSigner()
  const signerAddress = await signer.getAddress()

  const proxyAdmin = rpc.getSigner(1)
  const proxyAdminAddress = await proxyAdmin.getAddress()

  console.log("signer:", signerAddress)
  console.log({ signerAddress, proxyAdminAddress })
  console.log("balance:", (await signer.getBalance()).div(oneQtum).toString())

  const deployer = await Deployer.open("deploy.json")

  let receipt: ethers.providers.TransactionReceipt

  receipt = await deployer.run("token contract", async () => {
    const factory = new ethers.ContractFactory(BasicToken.abi, BasicToken.evm.bytecode, signer)
    const tx = factory.getDeployTransaction(oneQtum.mul(21e6))
    return signer.sendTransaction(tx)
  })

  const tokenAddress = receipt.contractAddress as string

  receipt = await deployer.run("foo", async () => {
    const factory = new ethers.ContractFactory(Foo.abi, Foo.evm.bytecode, signer)
    const tx = factory.getDeployTransaction()
    return signer.sendTransaction(tx)
  })

  const fooAddress = receipt.contractAddress

  const foo = new Contract(fooAddress, Foo.abi, signer)
  console.log({
    a: await foo.getA(),
    b: await foo.getB(),
  })

  receipt = await deployer.run("proxy", async () => {
    const factory = new ethers.ContractFactory(FooProxy.abi, FooProxy.evm.bytecode, signer)

    // NOTE: lol cannot use the empty address to init -.-
    const tx = factory.getDeployTransaction(fooAddress, proxyAdminAddress, "0x")
    return signer.sendTransaction(tx)
  })
  // console.log(token.interface.encodeFunctionData("totalSupply"))
  // console.log(token.interface.encodeFunctionData("balanceOf", [await signer.getAddress()]))

  const proxyAddress = receipt.contractAddress

  // 0xa8189371Fcc545d35e255Baa25C1685942023ee8
  // const contractAddress = receipt.contractAddress as string
  // const token = new Contract(tokenAddress, BasicToken.abi, signer)
  // console.log({ supply: (await token.totalSupply() as ethers.BigNumber).div(oneQtum).toString() })

  // QUIRK: openzeppelin limits these two "read" methods to admins. they are not
  // "view" for some reasons.
  //
  // Futhermore, proxy admin cannot call fallback methods.
  //
  // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/acac4a7fcaeac010a420f603b9f910676ef7b223/contracts/proxy/TransparentUpgradeableProxy.sol#L61-L85
  const proxyAsAdmin = new Contract(proxyAddress, FooProxy.abi, proxyAdmin)
  console.log({
    implementation: await proxyAsAdmin.callStatic.implementation(),
    admin: await proxyAsAdmin.callStatic.admin(),
  })

  receipt = await deployer.run("foo v2", async () => {
    const factory = new ethers.ContractFactory(FooV2.abi, FooV2.evm.bytecode, signer)
    const tx = factory.getDeployTransaction()
    return signer.sendTransaction(tx)
  })
  const fooV2Address = receipt.contractAddress

  receipt = await deployer.run("upgrade proxy to v2", async () => {
    return proxyAsAdmin.upgradeTo(fooV2Address)
    // const tx = factory.getDeployTransaction()
    // return signer.sendTransaction(tx)
  })

  const fooProxy = new Contract(proxyAddress, Foo.abi, signer)
  console.log({
    a: await fooProxy.getA(),
    b: await fooProxy.getB(),
  })
}

main().catch(err => console.log("err", err))