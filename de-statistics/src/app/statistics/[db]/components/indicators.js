"use client";
import { abi } from "@/contracts/contract";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import styles from "@/app/statistics/[db]/page.module.css";
import ContextModule from "@/utils/contextModule";

export default function Indicator({ data }) {
  // Context
  const myContext = React.useContext(ContextModule);
  // Crypto
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT,
    abi,
    provider
  );
  // States
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  // Functions
  const updateCryptoIndicators = async (data) => {
    const queryCounter = (await contract.interactions(data.bucket)) ?? 0;
    setQuery(queryCounter.toString());
    const amountCounter = (await contract.uploaders(data.uploader)) ?? 0;
    setAmount(ethers.utils.formatEther(amountCounter));
  };
  // Effects
  useEffect(() => {
    updateCryptoIndicators(data);
  }, [data]);

  // Update Signal
  useEffect(() => {
    if (myContext.value.update) {
      updateCryptoIndicators(data);
      myContext.setValue({ update: false });
    }
  }, [myContext.value.update]);

  return (
    <span className={styles.indicators}>
      Query Count: {query} | Donations: {amount}
      {" FIL (Filecoin Mainnet)"}
    </span>
  );
}
