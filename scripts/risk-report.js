'use strict';

// Prints a Markdown summary of whether each fixture customer is flagged as
// high scam risk, for the GitHub Actions job summary.
const { assessRisk, THRESHOLDS } = require('../src/riskEngine');
const { loadCases } = require('../test/fixtures/load');
const { requirement, flagLabel, expectedRiskLevel, criterion } = require('../requirements/scamRisk');

const FLAG = { HIGH: '🔴 Flagged high risk', VERY_HIGH: '🔴 Flagged very high risk' };
const NOT_FLAGGED = '🟢 Not flagged';
const flagFor = (risk) => FLAG[risk.level] ?? NOT_FLAGGED;

// FLAGGED in a fixture means whatever level the requirement's flag label maps to.
const resolveLevel = (level) => (level === 'FLAGGED' ? expectedRiskLevel : level);

const results = loadCases(process.argv[2]).map((c) => ({ ...c, risk: assessRisk(c.customer, c.attempt.session) }));

const counts = {};
for (const { risk } of results) counts[flagFor(risk)] = (counts[flagFor(risk)] || 0) + 1;

console.log('## Scam-risk flagging results\n');
console.log(`> **${requirement.reference} AC-2:** ${criterion('AC-2')}\n`);
console.log(`A customer whose risk score is **${THRESHOLDS.HIGH} or more** is flagged as ${flagLabel}.\n`);
console.log(Object.entries(counts).map(([label, n]) => `${label}: ${n}`).join(' · ') + '\n');
console.log('| Customer | Age | Risk score | Flagged | Rules triggered | Matches expected |');
console.log('|---|---|---|---|---|---|');
for (const { id, customer, risk, expected } of results) {
  const matches = expected.level === undefined ? '–' : risk.level === resolveLevel(expected.level) ? '✅' : '❌';
  console.log(`| ${id} | ${customer.age} | ${risk.score} | ${flagFor(risk)} | ${risk.flags.join(', ') || '–'} | ${matches} |`);
}
