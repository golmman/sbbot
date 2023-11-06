const fs = require('fs');

const SB_RESULT_LOG_FILE = './logs/results0.log';

function main() {
    const resultLogs = fs
        .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
        .split('\n')
        .filter((s) => s.length > 0)
        .map((l) => JSON.parse(l));

    const p1ex = resultLogs.filter(l => l.p1name.match(/.*/ig) !== null);
    const p2ex = resultLogs.filter(l => l.p2name.match(/.*/ig) !== null);

    let p1wins = 0;
    for (const fight of p1ex) {
        if (fight.status === "1") {
          p1wins += 1;
        }
    }

    let p2wins = 0;
    for (const fight of p2ex) {
        if (fight.status === "2") {
          p2wins += 1;
        }
    }

    console.info(`p1 ex ratio: ${p1ex.length / resultLogs.length}`);
    console.info(`p2 ex ratio: ${p2ex.length / resultLogs.length}`);
    console.info(`total ex ratio: ${(p1ex.length + p2ex.length) / resultLogs.length}`);
    console.info(`p1 ex winrate: ${p1wins / p1ex.length}`);
    console.info(`p2 ex winrate: ${p2wins / p2ex.length}`);
    console.info(`total ex winrate: ${(p1wins + p2wins) / (p1ex.length + p2ex.length)}`);
}

main();
