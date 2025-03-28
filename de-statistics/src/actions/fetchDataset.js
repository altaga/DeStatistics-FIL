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

let GeneralDB = {
  data: [],
};

function findObjectByKey(array, key, value) {
  const result = array.find((obj) => obj[key] === value);
  return result || null;
}

const RECALL_BASE_URL = "https://objects.testnet.recall.chain.love/v1/objects/";

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

async function fetchDB(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await fetch(url, requestOptions);
      let parsed = await res.text();
      resolve(parsed);
    } catch (e) {
      console.log(e);
      reject(null);
    }
  });
}

export async function updateDB() {
  return new Promise(async (resolve, reject) => {
    try {
      const { result: object } = await bucketManager.get(
        process.env.RECALL_BUCKET,
        "datasets"
      );
      const contents = new TextDecoder().decode(object);
      let parsed = JSON.parse(contents);
      GeneralDB = parsed;
      resolve("ok");
    } catch (e) {
      console.log(e);
      reject(null);
    }
  });
}

export async function getDB(key) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(GeneralDB);
      const temp1 = findObjectByKey(GeneralDB.data, "key", key);
      console.log(temp1);
      if (temp1 === null) return reject("error");
      const bucket = temp1.bucket;
      const { result: object } = await bucketManager.get(bucket, "database");
      const contents = new TextDecoder().decode(object);
      const parsed = parseCSVtoJSON_t1(contents);
      resolve({ ...parsed, ...temp1 });
    } catch (e) {
      console.log(e);
      reject("error");
    }
  });
}

export async function getAllDBs() {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(GeneralDB.data);
    } catch (e) {
      console.log(e);
      reject("error");
    }
  });
}

// updateDB() when server starts
updateDB()
  .then(() => console.log("DB updated successfully"))
  .catch((err) => console.log(err));
