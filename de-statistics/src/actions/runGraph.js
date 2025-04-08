"use server";

import { baseStat } from "@/utils/constants";

const LILYPAD_URL = process.env.LILYPAD_URL;

const myHeaders = new Headers();
myHeaders.append("X-API-Key", process.env.LILYPAD_APIKEY);
myHeaders.append("Content-Type", "application/json");

export default async function runGraph(message, tempContext = "") {
  console.log(message);
  const context = tempContext === JSON.stringify(baseStat) ? "" : tempContext;

  const raw = JSON.stringify({
    message,
    context,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return new Promise((resolve, reject) => {
    fetch(`${LILYPAD_URL}/run_graph`, requestOptions)
      .then((response) => response.json())
      .then((res) => resolve(res.response))
      .catch((error) => reject(error));
  });
}
