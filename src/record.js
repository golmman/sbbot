const axios = require("axios");
const fs = require("fs");

const SB_STATE_URL = "https://www.saltybet.com/state.json";
//const SB_STATE_URL = 'https://httpbin.org/get';

async function main() {
  let response = null;
  let responseData = null;
  let lastStatus = null;

  while (true) {
    try {
      response = await axios.get(SB_STATE_URL);
      responseData = response.data;
    } catch (error) {
      console.error(error.message);
      console.error("A connection error occurred, retrying in 60 seconds...");
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 60000));
      continue;
    }

    if (responseData.status === "locked") {
      console.debug("status: locked");
      lastStatus = "locked";
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 500));
      continue;
    }

    if (lastStatus !== "locked") {
      console.debug(`status: ${lastStatus}, skipping until status 'locked'`);
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }

    if (responseData.status === "open") {
      console.debug("status: open");
      lastStatus = "open";
      // TODO: find match in result log
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }

    {
      console.debug("status: result");
      lastStatus = "result";
      const result = JSON.stringify({ time: new Date(), ...responseData });
      fs.appendFile("./logs/results0.log", result + "\n", () => {});
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }
  }
}

main();
