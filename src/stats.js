const fs = require('fs');

const SB_RESULT_LOG_FILE = './logs/results0.log';

function getFightersMap(allNames) {
    const map = new Map();
    for (const name of allNames) {
        const fights = map.get(name);
        if (fights) {
            map.set(name, fights + 1);
        } else {
            map.set(name, 1);
        }
    }

    return map;
}

function main() {
    const resultLogs = fs
        .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
        .split('\n')
        .filter((s) => s.length > 0)
        .map((l) => JSON.parse(l));

    const p1names = resultLogs.map((l) => l.p1name);
    const p2names = resultLogs.map((l) => l.p2name);
    const allNames = p1names.concat(p2names);
    const fightersMap = getFightersMap(allNames);
    const fightersEntries = Array.from(fightersMap.entries());

    const fightersEntriesSorted = fightersEntries.sort((a, b) =>
        a[1] === b[1] ? 0 : a[1] < b[1] ? 1 : -1,
    );

    let repeatedFighters = 0;
    for (const value of fightersMap.values()) {
        if (value > 1) {
            repeatedFighters += 1;
        }
    }

    const totalFighters = fightersEntries.length;
    const repeatedFightersPercent = Math.trunc(
        (100 * repeatedFighters) / totalFighters,
    );

    console.info(`     Total fights: ${resultLogs.length}`);
    console.info(`   Total fighters: ${totalFighters}`);
    console.info(`Repeated fighters: ${repeatedFightersPercent}%`);

    for (let i = 0; i < 10; i += 1) {
        console.info(
            `${fightersEntriesSorted[i][1]
                .toString()
                .padStart(4)} fights with ${fightersEntriesSorted[i][0]}`,
        );
    }
}

main();
