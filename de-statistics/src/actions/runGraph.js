"use server";

const OLLAMA_URL = process.env.OLLAMA_URL;

const myHeaders = new Headers();
myHeaders.append("X-API-Key", process.env.OLLAMA_APIKEY);
myHeaders.append("Content-Type", "application/json");

export default async function runGraph(message, tempContext = "") {
  const context =
    tempContext ===
    `{"uploader":"","description":"","columns":[""],"row":[""],"dbKey":"","data":[[0]]}`
      ? ""
      : tempContext;

  console.log(context);
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
    fetch(`${OLLAMA_URL}/run_graph`, requestOptions)
      .then((response) => response.json())
      .then((res) => resolve(res.response))
      .catch((error) => reject(error));
  });
}
