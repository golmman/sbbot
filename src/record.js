const axios = require('axios');
const fs = require('fs');

const SB_STATE_URL = 'https://www.saltybet.com/state.json';
//const SB_STATE_URL = 'https://httpbin.org/get';
const SB_RESULT_LOG_FILE = './logs/results0.log';

function findMatchResults(resultLogs, p1name, p2name) {
    const namesOrdered = resultLogs.filter(
        (l) => l.p1name === p1name && l.p2name === p2name,
    );
    const namesSwapped = resultLogs.filter(
        (l) => l.p1name === p2name && l.p2name === p1name,
    );
    const namesOrderedWins = namesOrdered.filter(
        (l) => l.status === '1',
    ).length;
    const namesOrderedLosses = namesOrdered.length - namesOrderedWins;
    const namesSwappedWins = namesSwapped.filter(
        (l) => l.status === '2',
    ).length;
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
        p1wins,
        p2wins,
        count,
        total,
        p1total,
        p2total,
        p1totalWins,
        p2totalWins,
    };
}

function printMatchResults(matchResults) {
    let {
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
    } = matchResults;

    const RED = '\x1b[31m';
    const GREEN = '\x1b[32m';
    const BLUE = '\x1b[34m';
    const WHITE = '\x1b[37m';
    const BOLD_YELLOW = '\x1b[1;33m';
    const BOLD_RED = '\x1b[1;31m';
    const BOLD_BLUE = '\x1b[1;34m';
    const BG_RED = '\x1b[41m';
    const BG_BLUE = '\x1b[44m';
    const RESET = '\x1b[0m';

    const date = new Date().toISOString();
    let color = '';
    const p1winrate = Math.trunc((100 * p1totalWins) / p1total);
    const p2winrate = Math.trunc((100 * p2totalWins) / p2total);

    if (count === 0) {
        color = WHITE;
    } else {
        color = GREEN;
    }

    const searchResult =
        `${color}${total} fights, ${count} hits${RESET}`.padStart(32);
    const matchInfoP1Wins = `${p1wins}`.padStart(3);
    const matchInfoP2Wins = `${p2wins}`.padEnd(3);
    const matchInfoP1 =
        `${BOLD_RED}${p1name} (${p1total}, ${p1winrate}%)${RESET} ${matchInfoP1Wins}`.padStart(
            60,
        );
    const matchInfoP2 = `${matchInfoP2Wins} ${BOLD_BLUE}${p2name} (${p2total}, ${p2winrate}%)${RESET}`;
    const matchInfo = `${matchInfoP1}:${matchInfoP2}`;

    console.info(`${date} | ${searchResult} | ${matchInfo}`);
}

async function main() {
    console.debug = () => {};
    let response = null;
    let responseData = null;
    let lastStatus = null;

    const resultLogs = fs
        .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
        .split('\n')
        .filter((s) => s.length > 0)
        .map((l) => JSON.parse(l));

    console.info(
        `Welcome! There are currently ${resultLogs.length} match results in the database.`,
    );

    //const mr = findMatchResults(resultLogs, "Team A-", "Team B");
    //printMatchResults(mr);
    //return;

    while (true) {
        try {
            response = await axios.get(SB_STATE_URL);
            responseData = response.data;
        } catch (error) {
            console.error(error.message);
            console.error(
                'A connection error occurred, retrying in 60 seconds...',
            );
            await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 + 60000),
            );
            continue;
        }

        if (responseData.status === 'locked') {
            console.debug('status: locked');
            lastStatus = 'locked';
            await new Promise((r) => setTimeout(r, Math.random() * 1000 + 500));
            continue;
        }

        if (lastStatus === 'open') {
            console.debug(`status: open, skipping`);
            await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 + 5000),
            );
            continue;
        }

        if (responseData.status === 'open') {
            console.debug('status: open');
            lastStatus = 'open';

            const matchResults = findMatchResults(
                resultLogs,
                responseData.p1name,
                responseData.p2name,
            );
            printMatchResults(matchResults);

            await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 + 5000),
            );
            continue;
        }

        if (lastStatus === 'result') {
            console.debug(`status: result, skipping`);
            await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 + 5000),
            );
            continue;
        }

        {
            console.debug('status: result');
            lastStatus = 'result';
            const result = { time: new Date(), ...responseData };
            const resultString = JSON.stringify(result);
            fs.appendFile(SB_RESULT_LOG_FILE, resultString + '\n', () => {});
            resultLogs.push(result);
            await new Promise((r) =>
                setTimeout(r, Math.random() * 1000 + 5000),
            );
            continue;
        }
    }
}

main();
