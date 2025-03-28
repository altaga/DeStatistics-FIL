"use server";

import { ethers } from "ethers";
import { RecallClient } from "@recallnet/sdk/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { testnet } from "@recallnet/chains";

const wallet = ethers.Wallet.fromMnemonic(process.env.RECALL_PRIVKEY);
const { privateKey } = wallet;
const walletClient = createWalletClient({
  account: privateKeyToAccount(privateKey),
  chain: testnet,
  transport: http(),
});
const client = new RecallClient({ walletClient });
const bucketManager = client.bucketManager();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function uploadFileDummy(object) {
  const { key, file } = object;
  return new Promise(async (resolve, reject) => {
    try {
      const bucket = "0xff000000000000000000000000000000000000d1";
      await sleep(5000);
      resolve(bucket);
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}

export async function uploadFile(object) {
  const { key, file } = object;
  return new Promise(async (resolve, reject) => {
    try {
      const {
        result: { bucket },
      } = await bucketManager.create();
      console.log(bucket);
      await bucketManager.add(bucket, key, file);
      resolve(bucket);
    } catch (e) {
      console.log(e);
      reject(false);
    }
  });
}
