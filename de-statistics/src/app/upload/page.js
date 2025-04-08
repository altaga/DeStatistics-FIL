"use client";
import { updateDB } from "@/actions/fetchDataset";
import { updateMainDB } from "@/actions/updateMainDB";
import { uploadFile } from "@/actions/uploadFile";
import verifyDB from "@/actions/verifyFile";
import styles from "@/app/upload/page.module.css";
import { generateString, getUnixTimestamp, sleep } from "@/utils/lib";
import { Box, LinearProgress, TextField } from "@mui/material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Upload() {
  const router = useRouter();
  const { user } = usePrivy();
  const wallet = useWallets();
  const [stage, setStage] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [verified, setVerified] = useState(false);

  // Status
  const [status, setStatus] = useState("Uploading...");
  const [buffer, setBuffer] = useState(0);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result);
      setFile(selectedFile);
    };
    reader.readAsText(selectedFile);
  };

  const uploadAndVerify = async () => {
    const walletActive = wallet.wallets.find(
      (wallet) => wallet.connectorType === user.wallet.connectorType
    );
    const ethProvider = await walletActive.getEthereumProvider();
    const ethersProvider = new ethers.providers.Web3Provider(ethProvider);
    const signer = ethersProvider.getSigner();
    await signer.signMessage("Upload DB");
    setStage(1);
    setStatus("Uploading...");
    const bucket = await uploadFile({ key: "database", file });
    console.log(bucket);
    if (bucket === false) return;
    setBuffer(34);
    setStatus("AI Verification...");
    const verified = await verifyDB(walletActive.address, fileContent);
    setVerified(verified);
    if (verified === "error") return;
    if (verified === false) {
      setBuffer(67);
      setStatus("Finalizing...");
      await sleep(1000);
      setStage(2);
    } else {
      setBuffer(67);
      setStatus("Finalizing...");
      const metadata = {
        key: generateString(10),
        uploader: user.wallet.address,
        source,
        release: getUnixTimestamp(),
        title,
        description,
        bucket,
        verified,
      };
      await updateMainDB(metadata);
      setStage(2);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (stage === 1) {
        if (buffer < 33 && status === "Uploading...") {
          setBuffer(buffer + 1);
        } else if (buffer < 66 && status === "AI Verification...") {
          setBuffer(buffer + 1);
        } else if (buffer < 100 && status === "Finalizing...") {
          setBuffer(buffer + 1);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [buffer, stage]);

  return (
    <div className={styles.fullContainer}>
      <div className={styles.container}>
        {stage === 0 && (
          <React.Fragment>
            <div className={styles.title}>Upload your dataset</div>
            <TextField
              onChange={(e) => setTitle(e.target.value)}
              label="Title"
              id="title"
              size="small"
              fullWidth
            />
            <TextField
              onChange={(e) => setDescription(e.target.value)}
              label="Description"
              id="description"
              size="small"
              fullWidth
            />
            <TextField
              onChange={(e) => setSource(e.target.value)}
              label="Source"
              id="source"
              size="small"
              fullWidth
            />
            <input
              className={styles.input}
              type="file"
              onChange={(e) => handleFileChange(e)}
              accept="text/csv"
            />
            <div style={{ marginTop: "30px" }} />
            <button
              disabled={!file}
              className={styles.searchButton}
              onClick={() => uploadAndVerify()}
            >
              Upload and Verify
            </button>
          </React.Fragment>
        )}
        {stage === 1 && (
          <React.Fragment>
            <div className={styles.title}>{status}</div>
            <Box sx={{ width: "100%" }}>
              <LinearProgress
                variant="buffer"
                value={buffer}
                valueBuffer={100}
              />
            </Box>
          </React.Fragment>
        )}
        {stage === 2 && (
          <React.Fragment>
            <div className={styles.title}>
              {verified
                ? "Dataset uploaded successfully"
                : "Dataset verification failed"}
            </div>
            <div className={styles.title}>
              AI Verification: {verified ? "Verified" : "Not Verified"}
            </div>
            <button
              className={styles.searchButton}
              onClick={() => router.push("/")}
            >
              Go to Home
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
