const fs = require('fs');

const SB_RESULT_LOG_FILE = './logs/results0.log';

const START_INDEX = 10000;
const START_BUCKS = 300;
const MINES_BUCKS = 300;

function findMatchResults(resultLogs, p1name, p2name) {
  const namesOrdered = resultLogs.filter(
    (l) => l.p1name === p1name && l.p2name === p2name,
  );
  const namesSwapped = resultLogs.filter(
    (l) => l.p1name === p2name && l.p2name === p1name,
  );
  const namesOrderedWins = namesOrdered.filter((l) => l.status === '1').length;
  const namesOrderedLosses = namesOrdered.length - namesOrderedWins;
  const namesSwappedWins = namesSwapped.filter((l) => l.status === '2').length;
  const namesSwappedLosses = namesSwapped.length - namesSwappedWins;

  const p1totalOrdered = resultLogs.filter((l) => l.p1name === p1name);
  const p1totalSwapped = resultLogs.filter((l) => l.p2name === p1name);
  const p2totalOrdered = resultLogs.filter((l) => l.p2name === p2name);
  const p2totalSwapped = resultLogs.filter((l) => l.p1name === p2name);
  const p1totalOrderedWins = p1totalOrdered.filter(
    (l) => l.status === '1',
  ).length;
  const p1totalSwappedWins = p1totalSwapped.filter(
    (l) => l.status === '2',
  ).length;
  const p2totalOrderedWins = p2totalOrdered.filter(
    (l) => l.status === '2',
  ).length;
  const p2totalSwappedWins = p2totalSwapped.filter(
    (l) => l.status === '1',
  ).length;

  const p1wins = namesOrderedWins + namesSwappedWins;
  const p2wins = namesOrderedLosses + namesSwappedLosses;
  const count = p1wins + p2wins;
  const total = resultLogs.length;
  const p1total = p1totalOrdered.length + p1totalSwapped.length;
  const p2total = p2totalOrdered.length + p2totalSwapped.length;
  const p1totalWins = p1totalOrderedWins + p1totalSwappedWins;
  const p2totalWins = p2totalOrderedWins + p2totalSwappedWins;

  return {
    p1name,
    p2name,
    p1wins, // p1 wins in this particular fight constellation
    p2wins,
    count,
    total,
    p1total,
    p2total,
    p1totalWins, // p1 wins overall
    p2totalWins,
  };
}

function calculateBet(fightHistory) {
  const {
    p1name,
    p2name,
    p1wins,
    p2wins,
    count,
    total,
    p1total,
    p2total,
    p1totalWins,
    p2totalWins,
  } = fightHistory;

  let relativeAmount = 0.1;

  let p1winrate = p1totalWins / p1total;
  let p2winrate = p2totalWins / p2total;

  if (p1total === 0) {
    p1winrate = 0.5;
  }
  if (p2total === 0) {
    p2winrate = 0.5;
  }
  const betOnP1 = p1winrate >= p2winrate;

  if (Math.abs(p1winrate - p2winrate) <= 0.1) {
    relativeAmount = 0;
  }

  if (Math.abs(p1winrate - p2winrate) >= 0.5) {
    if (p1total > 5 && p2total > 5) {
      relativeAmount = 0.2;
    }
  }

  return {
    betOnP1,
    relativeAmount,
  };
}

function calculateBucks(bet, bucks, fightResult) {
  let newBucks = bucks;

  let p1bet = Number(fightResult.p1total.replaceAll(',', ''));
  let p2bet = Number(fightResult.p2total.replaceAll(',', ''));
  const myBet = Math.floor(bucks * bet.relativeAmount);

  newBucks -= myBet;

  if (bet.betOnP1) {
    p1bet += myBet;
    if (fightResult.status === '1') {
      newBucks += Math.round(myBet + (myBet * p2bet) / p1bet);
    }
  } else {
    p2bet += myBet;
    if (fightResult.status === '2') {
      newBucks += Math.round(myBet + (myBet * p1bet) / p2bet);
    }
  }

  if (newBucks < MINES_BUCKS) {
    newBucks = MINES_BUCKS;
  }

  return newBucks;
}

function main() {
  const resultLogs = fs
    .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
    .split('\n')
    .filter((s) => s.length > 0)
    .map((l) => JSON.parse(l));

  const history = resultLogs.slice(0, START_INDEX);
  const future = resultLogs.slice(START_INDEX);

  let bucks = START_BUCKS;

  for (let i = 0; i < future.length; i += 1) {
    const { p1name, p2name } = future[i];
    const fightHistory = findMatchResults(history, p1name, p2name);
    const bet = calculateBet(fightHistory);
    bucks = calculateBucks(bet, bucks, future[i]);

    const p1winrate = fightHistory.p1totalWins / fightHistory.p1total;
    const p2winrate = fightHistory.p2totalWins / fightHistory.p2total;

    console.log(
      `${bucks} -- ${p1name} ${p1winrate}:${p2winrate} ${p2name} -- ${
        bet.betOnP1 ? 'p1' : 'p2'
      }`,
    );

    history.push(future[i]);
  }
}

main();
