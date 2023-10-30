const fs = require('fs');

const SB_RESULT_LOG_FILE = './logs/results0.log';

function main() {
    const resultLogs = fs
        .readFileSync(SB_RESULT_LOG_FILE, 'utf8')
        .split('\n')
        .filter((s) => s.length > 0)
        .map((l) => JSON.parse(l));

    const resultsWithoutTeamAB = resultLogs.filter(
        (l) =>
            l.p1name !== 'Team A' &&
            l.p1name !== 'Team B' &&
            l.p2name !== 'Team A' &&
            l.p2name !== 'Team B',
    );

    const p1names = resultsWithoutTeamAB.map((l) => l.p1name);
    const p2names = resultsWithoutTeamAB.map((l) => l.p2name);
    const allNames = p1names.concat(p2names);
    const allNamesUnique = new Set(allNames);

    const totalFights = resultsWithoutTeamAB.length;
    const charactersWithMoreThanOneFight = Math.trunc(
        100 - (100 * allNamesUnique.size) / allNames.length,
    );

    console.info(`      Total fights without 'Team A/B': ${totalFights}`);
    console.info(
        `  Characters with more than one fight: ${charactersWithMoreThanOneFight}%`,
    );
}

main();
