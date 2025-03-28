"use client";
import { getDB } from "@/actions/fetchDataset";
import SimpleCharts from "@/app/statistics/components/chart";
import Chat from "@/app/statistics/components/chat";
import styles from "@/app/statistics/page.module.css";
import { abi } from "@/contracts/contract";
import { TextField } from "@mui/material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Statistic() {
  // Contracts
  // Hooks Privy
  const wallet = useWallets();
  const { user } = usePrivy();
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT,
    abi,
    provider
  );
  // States
  const [data, setData] = useState({});
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [donation, setDonation] = useState("");
  const [loading, setLoading] = useState(false);

  async function getData(key) {
    const response = await getDB(key);
    setData(response);
  }

  const updateCryptoIndicators = async (data) => {
    const queryCounter = await contract.interactions(data.bucket);
    setQuery(queryCounter.toString());
    const amountCounter = await contract.uploaders(data.uploader);
    setAmount(ethers.utils.formatEther(amountCounter));
  };

  const donate = async () => {
    setLoading(true);
    try {
      console.log(donation);
      const walletActive = wallet.wallets.find(
        (wallet) => wallet.connectorType === user.wallet.connectorType
      );
      const ethProvider = await walletActive.getEthereumProvider();
      const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
      const signer = ethersProvider.getSigner();
      const transaction = await contract.populateTransaction.donation(
        data.uploader,
        {
          from: walletActive.address,
          value: ethers.utils.parseEther(donation),
        }
      );
      const tx = await signer.sendTransaction(transaction);
      await tx.wait();
      updateCryptoIndicators(data);
      setDonation("");
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    getData(urlParams.get("db"));
  }, []);

  return (
    <div className={styles.fullContainer}>
      <div className={styles.underContainer}>
        <div className={styles.title}>
          {" "}
          {data.title} {"->"} {data.description}
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Roboto",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            {""}
          </div>
          <div
            style={{
              width: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Open Sans",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            Ai Agent
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.chartContainer}>
            <SimpleCharts
              update={() => updateCryptoIndicators(data)}
              query={query}
              amount={amount}
              data={data}
            />
          </div>
          <div className={styles.chatContainer}>
            <Chat
              update={() => updateCryptoIndicators(data)}
              bucket={data.bucket}
            />
          </div>
        </div>
        <div className={styles.conContainer}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              height: "100%",
            }}
          >
            <span
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                width: "100%",
                height: "100%",
                marginLeft: "20px",
                marginTop: "20px",
                gap: "10px",
              }}
            >
              <img
                src={"/logo192.png"}
                style={{ width: "80px", height: "auto", resize: "contain" }}
              />
              <span
                className={styles.indicators}
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginTop: "16px",
                }}
              >
                {" "}
                altaga.eth{" "}
              </span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              padding: "20px",
            }}
          >
            <span className={styles.indicators}>
              Uploader:{" "}
              {
                <Link
                  href={
                    "https://explorer.testnet.recall.network/address/" +
                    data.uploader
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.uploader}
                </Link>
              }
            </span>
            <span className={styles.indicators}>
              Query Count: {query} | Donations: {amount}
              {" ETH (Base)"}
            </span>
            <div
              style={{
                marginRight: "10px",
                marginTop: "10px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "50%",
                height: "100%",
                backgroundColor: "white",
                gap: "10px",
              }}
            >
              <TextField
                style={{ width: "100%", fontSize: "0.6rem" }}
                id="standard-basic"
                label="Amount"
                variant="outlined"
                type="number"
                onChange={(e) => setDonation(e.target.value)}
              />
              <button
                disabled={loading}
                onClick={() => {
                  donate();
                }}
                className={styles.button}
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
