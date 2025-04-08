"use server";

const LILYPAD_URL = process.env.LILYPAD_URL;

const myHeaders = new Headers();
myHeaders.append("X-API-Key", process.env.LILYPAD_APIKEY );
myHeaders.append("Content-Type", "application/json");

export default async function verifyDB(address, context) {
  const raw = JSON.stringify({
    message: address,
    context,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return new Promise((resolve, reject) => {
    fetch(`${LILYPAD_URL}/verify_database`, requestOptions)
      .then((response) => response.json())
      .then((res) => {
        resolve(res.response.answer === "True" || res.response.answer === true);
      })
      .catch((error) => resolve("error"));
  });
}
