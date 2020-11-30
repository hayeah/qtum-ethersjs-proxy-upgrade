import { promises as fs } from "fs"
import { ethers } from "ethers"

const { readFile, writeFile } = fs

interface TXReceipts {
  [key: string]: ethers.providers.TransactionReceipt
}

function jsonRevive(key: string, val: any) {
  if (val && typeof val == "object") {
    if (val["type"] == "BigNumber") {
      return ethers.BigNumber.from(val["hex"])
    }
  }

  return val
}

export class Deployer {
  static async open(filePath: string): Promise<Deployer> {
    let receipts: TXReceipts = {}

    try {
      const jsonData = await readFile(filePath, "utf8")
      receipts = JSON.parse(jsonData, jsonRevive)
    } catch (err) {
      console.log(`Cannot load file: ${filePath}:`, err)
    } finally {
      return new Deployer(receipts, filePath)
    }
  }

  public defaultConfirmations = 1
  constructor(private receipts: TXReceipts, public filePath: string) { }

  public async run(key: string, action: () => Promise<ethers.providers.TransactionResponse>): Promise<any> {
    let receipt = this.receipt(key)

    if (receipt) {
      return receipt
    }

    const res = await action()
    receipt = await res.wait(this.defaultConfirmations)

    if (receipt == null) {
      throw new Error("deployer action must return data")
    }

    this.receipts[key] = receipt

    await this.save()

    return receipt
  }

  public receipt(key: string): ethers.providers.TransactionReceipt | null {
    return this.receipts[key] || null
  }

  private async save() {
    const jsonData = JSON.stringify(this.receipts, null, 2)
    await writeFile(this.filePath, jsonData, "utf8")
  }
}