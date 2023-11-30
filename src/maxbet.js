const fs = require('fs');

const SB_RESULT_LOG_FILE = './logs/results0.log';

function main() {
    const resultLogs = fs
        .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
        .split('\n')
        .filter((s) => s.length > 0)
        .map((l) => JSON.parse(l));

    let maxbet = 0;
    let maxbetIndex = 0;
    for (let i = 0; i < resultLogs.length; i += 1) {
        //console.log(JSON.stringify(resultLogs[i]));
        const p1bet = Number(resultLogs[i].p1total.replaceAll(',', ''));
        const p2bet = Number(resultLogs[i].p2total.replaceAll(',', ''));
        if (p1bet > maxbet) {
            maxbet = p1bet;
            maxbetIndex = i;
        }
        if (p2bet > maxbet) {
            maxbet = p2bet;
            maxbetIndex = i;
        }
    }
    console.info(JSON.stringify(resultLogs[maxbetIndex]));
}

main();
