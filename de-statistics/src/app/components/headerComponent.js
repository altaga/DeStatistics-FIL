"use client";
import { Button, ButtonGroup } from "@mui/material";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import React, { useEffect } from "react";
import styles from "@/app/components/headerComponent.module.css";
import { toast } from "react-toastify";
import { checkServer } from "@/actions/serverHealth";

export default function HeaderComponent() {
  const { ready, login, logout, authenticated, user } = usePrivy();
  const wallet = useWallets();

  async function checkServerCall() {
    const res = await checkServer();
    if (res === false) toast.error("Server");
    else toast.success("Server");
  }

  useEffect(() => {
    if (ready && authenticated) {
      console.log(wallet);
    }
  }, [ready]);

  useEffect(() => {
    checkServerCall();
  }, []);

  return (
    <div className={styles.headerBar}>
      <div
        className={styles.logoContainer}
        onClick={() => (window.location.href = "/")}
      >
        <img
          src="/logo.png"
          alt="App Logo"
          style={{
            height: "80%",
            width: "auto",
            objectFit: "contain",
          }}
        />
        <span className={styles.titleLogo}>DeStatistics</span>
      </div>
      <div className={styles.logoContainer}>
        {authenticated ? (
          <span className={styles.address}>
            {" "}
            {user.wallet.address?.substring(0, 6)}...
            {user.wallet.address?.substring(user.wallet.address?.length - 4)}
          </span>
        ) : (
          <span />
        )}
        <ButtonGroup
          className={styles.buttonGroup}
          variant="contained"
          aria-label="Basic button group"
        >
          {ready && authenticated ? (
            <React.Fragment>
              <Button
                className={styles.button}
                disabled={!ready}
                onClick={() => logout()}
              >
                Disconnect
              </Button>
              <Button
                className={styles.button}
                disabled={!ready}
                onClick={() => window.location.href = "/upload"}
              >
                Upload
              </Button>
              {/**
                <Button
                  className={styles.button}
                  disabled={!ready}
                  onClick={() => exportWallet()}
                >
                  Export
                </Button>
              */}
            </React.Fragment>
          ) : (
            <Button
              className={styles.button}
              disabled={!ready}
              onClick={() => login()}
            >
              Connect
            </Button>
          )}
        </ButtonGroup>
      </div>
    </div>
  );
}
