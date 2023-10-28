const axios = require("axios");

async function main() {
  while (true) {
    let response = await axios.get("https://www.saltybet.com/state.json");
    let responseData = response.data;

    while (responseData.status === "open") {
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      response = await axios.get("https://www.saltybet.com/state.json");
      responseData = response.data;
    }

    while (responseData.status === "locked") {
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 500));

      response = await axios.get("https://www.saltybet.com/state.json");
      responseData = response.data;

      if (responseData.status !== "locked" && responseData !== "open") {
        console.log(JSON.stringify({ time: new Date(), ...response.data }));
        await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      }
    }
  }
}

main();
