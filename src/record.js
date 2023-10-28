const axios = require("axios");
const fs = require("fs");

const SB_STATE_URL = "https://www.saltybet.com/state.json";
//const SB_STATE_URL = 'https://httpbin.org/get';

async function main() {
  while (true) {
    let response = await axios.get(SB_STATE_URL);
    let responseData = response.data;

    while (responseData.status !== "locked") {
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      response = await axios.get(SB_STATE_URL);
      responseData = response.data;
    }

    while (responseData.status === "locked") {
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 500));

      response = await axios.get(SB_STATE_URL);
      responseData = response.data;

      if (responseData.status !== "locked" && responseData !== "open") {
        const result = JSON.stringify({ time: new Date(), ...response.data });
        console.log(result);
        fs.appendFile("./logs/results0.log", result + "\n", () => {});
        await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      }
    }
  }
}

main();
