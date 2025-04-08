import { getDB } from "@/actions/fetchDataset";
import SimpleCharts from "@/app/statistics/[db]/components/chart";
import Chat from "@/app/statistics/[db]/components/chat";
import styles from "@/app/statistics/[db]/page.module.css";
import Link from "next/link";
import Donation from "./components/donation";
import Indicator from "./components/indicators";

/*
// Example Ethereum address
const ethAddress = "0x4bb24Db28959248E00792aDAF04a8EB32C5AB3Ef";

// Derive the Filecoin address (f4 address) from the Ethereum address
const filecoinAddress = newDelegatedEthAddress(ethAddress);

console.log(`Ethereum Address: ${ethAddress}`);
console.log(`Filecoin Address: ${filecoinAddress.toString()}`);
*/

export const revalidate = 60 // Check every 60 seconds for updates
export const dynamicParams = true // Dynamically generate params

export async function generateStaticParams() {
  const res = await fetch(process.env.RECALL_URL);
  const posts = await res.json();
  return posts.data.map((post) => ({
    db: post.key,
  }));
}

export default async function Statistic({ params }) {
  // Get Statistic Server Side
  const { db } = await params;
  const data = await getDB(db);

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
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
        <div className={styles.subContainer2}>
          <div className={styles.chartContainer}>
            <SimpleCharts data={data} />
          </div>
          <div className={styles.chatContainer}>
            <Chat bucket={data.bucket} />
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
            {
              // Client Component
              <Indicator data={data} />
            }
            {
              // Client Component
              <Donation data={data} />
            }
            
          </div>
        </div>
      </div>
    </div>
  );
}
