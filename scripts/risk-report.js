'use strict';

// Prints a Markdown summary of every fixture's login outcome, for the
// GitHub Actions job summary.
const { login } = require('../src/login');
const { loadCases } = require('../test/fixtures/load');

const BADGE = { ALLOW: '🟢', STEP_UP_MFA: '🟡', RESTRICTED: '🔴', DENIED: '⛔', LOCKED: '🔒' };

const results = loadCases(process.argv[2]).map((c) => ({ ...c, ...login(c.customer, c.attempt) }));

const counts = {};
for (const { outcome } of results) counts[outcome] = (counts[outcome] || 0) + 1;

console.log('## Login risk screening results\n');
console.log(Object.entries(counts).map(([o, n]) => `${BADGE[o]} **${o}**: ${n}`).join(' · ') + '\n');
console.log('| Customer | Age | Risk score | Outcome | Flags | Matches expected |');
console.log('|---|---|---|---|---|---|');
for (const { id, customer, outcome, risk, expected } of results) {
  console.log(`| ${id} | ${customer.age} | ${risk ? `${risk.score} (${risk.level})` : '–'} | ${BADGE[outcome]} ${outcome} | ${risk?.flags.join(', ') || '–'} | ${outcome === expected.outcome ? '✅' : '❌'} |`);
}
