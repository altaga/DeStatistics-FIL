"use server";

import { parseCSVtoJSON_t1 } from "@/utils/lib";
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

function findObjectByKey(array, key, value) {
  const result = array.find((obj) => obj[key] === value);
  return result || null;
}

export async function getDB(key) {
  return new Promise(async (resolve, reject) => {
    try {
      const { result: genDB } = await bucketManager.get(
        process.env.RECALL_BUCKET,
        "datasets"
      );
      let content = new TextDecoder().decode(genDB);
      let parsed = JSON.parse(content);
      const temp = findObjectByKey(parsed.data, "key", key);
      if (temp === null) return reject("error");
      const bucketAddress = temp.bucket;
      const bucket = await bucketManager.query(bucketAddress, {
        prefix: "database",
      });
      const keys = bucket.result.objects.map((o) => o.key);
      const filteredKeys = keys.filter((key) => /\d$/.test(key));
      const sortedKeys = filteredKeys.sort((a, b) => {
        const numA = parseInt(a.match(/\d$/)[0]);
        const numB = parseInt(b.match(/\d$/)[0]);
        return numB - numA;
      });
      let values = [];
      let contents = [];
      for (const key of sortedKeys) {
        const response = await bucketManager.get(bucketAddress, key);
        const content = new TextDecoder().decode(response.result);
        contents.push(content);
        const parsed = parseCSVtoJSON_t1(content);
        values.push(parsed);
      }
      resolve({ data: values, contents, ...temp });
    } catch (e) {
      console.log(e);
      reject("error");
    }
  });
}

export async function getAllFetch() {
  return new Promise(async (resolve, reject) => {
    try {
      const { result: object } = await bucketManager.get(
        process.env.RECALL_BUCKET,
        "datasets"
      );
      const contents = new TextDecoder().decode(object);
      let parsed = JSON.parse(contents);
      resolve(parsed.data);
    } catch (e) {
      console.log(e);
      reject(null);
    }
  });
}

console.log("Server Ready");
