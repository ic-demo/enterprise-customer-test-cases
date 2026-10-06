'use strict';

// Prints a Markdown summary of whether each fixture customer is flagged as
// high scam risk, for the GitHub Actions job summary.
const { assessRisk, THRESHOLDS } = require('../src/riskEngine');
const { loadCases } = require('../test/fixtures/load');

const FLAG = { true: '🔴 Flagged high risk', false: '🟢 Not flagged' };

const results = loadCases(process.argv[2]).map((c) => {
  const risk = assessRisk(c.customer, c.attempt.session);
  const expectedFlag = c.expected.level === undefined ? undefined : c.expected.level === 'HIGH';
  return { ...c, risk, flagged: risk.level === 'HIGH', expectedFlag };
});

const flaggedCount = results.filter((r) => r.flagged).length;

console.log('## Scam-risk flagging results\n');
console.log(`A customer whose risk score is **${THRESHOLDS.HIGH} or more** is flagged as high risk.\n`);
console.log(`${FLAG.true}: ${flaggedCount} · ${FLAG.false}: ${results.length - flaggedCount}\n`);
console.log('| Customer | Age | Risk score | Flagged | Rules triggered | Matches expected |');
console.log('|---|---|---|---|---|---|');
for (const { id, customer, risk, flagged, expectedFlag } of results) {
  const matches = expectedFlag === undefined ? '–' : flagged === expectedFlag ? '✅' : '❌';
  console.log(`| ${id} | ${customer.age} | ${risk.score} | ${FLAG[flagged]} | ${risk.flags.join(', ') || '–'} | ${matches} |`);
}
