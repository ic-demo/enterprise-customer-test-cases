'use strict';

// Prints a Markdown onboarding scam-risk report: the rules and threshold used,
// every customer's score and high-risk flag, and any customer that could not
// be scored.
const fs = require('node:fs');
const path = require('node:path');
const { screenCustomers, RULES, HIGH_RISK_THRESHOLD, STATUS } = require('../src/onboardingRisk');

const file = process.argv[2] || path.join(__dirname, '..', 'test', 'fixtures', 'onboarding-customers.json');
const results = screenCustomers(JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')).customers);

const FLAG = { HIGH_RISK: '🔴 HIGH RISK', NOT_HIGH_RISK: '🟢 Not high risk', UNABLE_TO_SCORE: '⚠️ Unable to score' };
const count = (status) => results.filter((c) => c.result.status === status).length;

console.log('## Onboarding scam-risk report\n');
console.log(`${FLAG.HIGH_RISK}: ${count(STATUS.HIGH_RISK)} · ${FLAG.NOT_HIGH_RISK}: ${count(STATUS.NOT_HIGH_RISK)} · ${FLAG.UNABLE_TO_SCORE}: ${count(STATUS.UNABLE_TO_SCORE)}\n`);

console.log('### Rules and threshold\n');
console.log(`A customer whose score is **${HIGH_RISK_THRESHOLD} or more** is flagged as high risk.\n`);
console.log('| Attribute | Rule | Points |');
console.log('|---|---|---|');
for (const { attribute, rule, points } of RULES) console.log(`| ${attribute} | ${rule} | ${points} |`);

console.log('\n### Customers\n');
console.log('| Customer | Age | Digital literacy | Account activity | Score | Flag | Matches expected |');
console.log('|---|---|---|---|---|---|---|');
for (const { id, name, age, digitalLiteracy, accountActivity, result, expected } of results) {
  const matches = result.status === expected?.status && result.score === expected?.score;
  console.log(`| ${id} ${name} | ${age ?? '–'} | ${digitalLiteracy ?? '–'} | ${accountActivity ?? '–'} | ${result.score ?? '–'} | ${FLAG[result.status]} | ${expected ? (matches ? '✅' : '❌') : '–'} |`);
}

const unscored = results.filter((c) => c.result.status === STATUS.UNABLE_TO_SCORE);
if (unscored.length) {
  console.log('\n### Unable to score\n');
  for (const { id, name, result } of unscored) {
    const reasons = [
      ...result.missing.map((a) => `missing ${a}`),
      ...result.invalid.map((a) => `invalid ${a}`),
    ];
    console.log(`- **${id} ${name}**: ${reasons.join(', ')}`);
  }
}
