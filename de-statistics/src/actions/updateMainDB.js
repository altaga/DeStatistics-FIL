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

const requestOptions = {
  method: "GET",
  redirect: "follow",
};

/*
{
  data: [
    {
      key: 'gdp',
      uploader: '0x4bb24Db28959248E00792aDAF04a8EB32C5AB3Ef',
      source: 'World Bank',
      release: '1738044000',
      title: 'World Bank GDP',
      description: 'GDP National accounts data and OECD National Accounts.',
      bucket: '0xff000000000000000000000000000000000000d1',
      verified: true,
    }
  ]
}
*/

export async function updateMainDB(metadata) {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await fetch(process.env.RECALL_URL, requestOptions);
      let parsed = await res.json();
      parsed.data = [...parsed.data, metadata];
      console.log(parsed);
      const content = new TextEncoder().encode(JSON.stringify(parsed));
      const file = new File([content], "data.json", {
        type: "application/json",
      });
      await bucketManager.add(
        process.env.RECALL_BUCKET,
        "datasets",
        file,
        {
          overwrite: true,
        }
      );
      resolve(true);
    } catch (e) {
      console.log(e);
      resolve(false)
    }
  });
}
