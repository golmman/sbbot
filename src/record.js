const axios = require("axios");
const fs = require("fs");

const SB_STATE_URL = "https://www.saltybet.com/state.json";
//const SB_STATE_URL = 'https://httpbin.org/get';
const SB_RESULT_LOG_FILE = "./logs/results0.log";

function findMatchResults(resultLogs, p1name, p2name) {
  let namesOrdered = resultLogs.filter(
    (l) => l.p1name === p1name && l.p2name === p2name,
  );
  let namesSwapped = resultLogs.filter(
    (l) => l.p1name === p2name && l.p2name === p1name,
  );

  let namesOrderedWins = namesOrdered.filter((l) => l.status === "1").length;
  let namesOrderedLosses = namesOrdered.length - namesOrderedWins;
  let namesSwappedWins = namesSwapped.filter((l) => l.status === "2").length;
  let namesSwappedLosses = namesSwapped.length - namesSwappedWins;

  let p1wins = namesOrderedWins + namesSwappedWins;
  let p2wins = namesOrderedLosses + namesSwappedLosses;
  let count = p1wins + p2wins;
  let total = resultLogs.length;

  return {
    p1name,
    p2name,
    p1wins,
    p2wins,
    count,
    total,
  };
}

function printMatchResults(matchResults) {
  let { p1name, p2name, p1wins, p2wins, count, total } = matchResults;

  let date = new Date().toISOString();
  let color = "";
  const RED = "\x1b[31m";
  const GREEN = "\x1b[32m";
  const BOLD_YELLOW = "\x1b[1;33m";
  const RESET = "\x1b[0m";

  if (count === 0) {
    color = RED;
  } else {
    color = GREEN;
  }
  console.info(
    `${date}   ${color}SEARCHED ${total} MATCHES AND FOUND ${count} RESULTS${RESET}   ${BOLD_YELLOW}${p1name}${RESET} ${p1wins}:${p2wins} ${BOLD_YELLOW}${p2name}${RESET}`,
  );
}

async function main() {
  console.debug = () => {};
  let response = null;
  let responseData = null;
  let lastStatus = null;

  const resultLogs = fs
    .readFileSync(SB_RESULT_LOG_FILE, "utf8")
    .split("\n")
    .filter((s) => s.length > 0)
    .map((l) => JSON.parse(l));

  console.info(
    `Welcome! There are currently ${resultLogs.length} match results in the database.`,
  );

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

    if (lastStatus === "open") {
      console.debug(`status: open, skipping`);
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }

    if (responseData.status === "open") {
      console.debug("status: open");
      lastStatus = "open";

      const matchResults = findMatchResults(
        resultLogs,
        responseData.p1name,
        responseData.p2name,
      );
      printMatchResults(matchResults);

      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }

    if (lastStatus === "result") {
      console.debug(`status: result, skipping`);
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }

    {
      console.debug("status: result");
      lastStatus = "result";
      const result = { time: new Date(), ...responseData };
      const resultString = JSON.stringify(result);
      fs.appendFile(SB_RESULT_LOG_FILE, resultString + "\n", () => {});
      resultLogs.push(result);
      await new Promise((r) => setTimeout(r, Math.random() * 1000 + 5000));
      continue;
    }
  }
}

main();
