import express from "express";
import { ethers } from "ethers";
import { abi } from "./contracts/DeStatisticsToken.js";
import morgan from "morgan";

// Privy Wallet
const privKey =
  "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
// Contracts
const contract = "0xA8843d8d35BDE678c5224Ec7e2132Cf68ac27c54";
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/filecoin"
);
const wallet = new ethers.Wallet(privKey, provider);
const tokenContract = new ethers.Contract(contract, abi, wallet);

const app = express();
app.use(morgan('tiny'));
app.use(express.json());

app.get("/", async (_, response) => {
  return response.send("Hello World!");
});

// POST a JSON object and get it back
app.post("/transaction", async (request, response) => {
  const {
    to,
    value,
  } = request.body;
  const valueEther = ethers.utils.parseEther(value);
  const tx = await tokenContract.transfer(to, valueEther);
  tx.wait();
  return response.send(tx.hash);
});

app.listen(8001);
