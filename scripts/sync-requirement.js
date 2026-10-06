'use strict';

// Updates requirements/scam-risk.json from a sign-off sent by the requirements
// manager (the REQUIREMENT_PAYLOAD env var, a repository_dispatch payload), or
// restores the original requirement on a RESET payload or --reset. Writes a commit message to
// GITHUB_OUTPUT when running in Actions.
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'requirements', 'scam-risk.json');
const BASELINE = path.join(__dirname, '..', 'requirements', 'scam-risk.baseline.json');

// "…is flagged as high risk." / "…is flagged as 'very high risk'."
const FLAG_LABEL = /flagged as\s+['"‘’“”]?([a-z][a-z ]*?)['"‘’“”]?\s*\.?$/i;

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}: ${value}`);
}

function fail(message) {
  console.log(`::error::${message}`);
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const payload = JSON.parse(process.env.REQUIREMENT_PAYLOAD || '{}');

if (process.argv.includes('--reset') || payload.decision === 'RESET') {
  fs.copyFileSync(BASELINE, FILE);
  output('commit_message', `${current.reference}: reset requirement to original (flagged as "${JSON.parse(fs.readFileSync(BASELINE, 'utf8')).flagLabel}")`);
  process.exit(0);
}

if (payload.reference !== current.reference) {
  console.log(`::notice::Ignoring update for ${payload.reference ?? 'unknown requirement'}; this repo tests ${current.reference}.`);
  process.exit(0);
}
if (payload.decision !== 'SIGNED_OFF') {
  console.log(`::notice::Deviation was ${payload.decision ?? 'not signed off'}; requirement unchanged.`);
  process.exit(0);
}

const criteria = payload.acceptanceCriteria;
if (!Array.isArray(criteria) || !criteria.every((ac) => ac?.ref && typeof ac.text === 'string')) {
  fail('Payload acceptanceCriteria must be an array of { ref, text }.');
}
const ac2 = criteria.find((ac) => ac.ref === 'AC-2');
const flagLabel = ac2 && FLAG_LABEL.exec(ac2.text.trim())?.[1].toLowerCase();
if (!flagLabel) fail(`Could not read the flag label from AC-2: ${ac2?.text ?? '(missing)'}`);

const summary = `Deviation on MR !${payload.mrNumber} signed off by ${payload.actor ?? 'the Product Owner'}`;
fs.writeFileSync(FILE, JSON.stringify({
  ...current,
  flagLabel,
  acceptanceCriteria: criteria.map(({ ref, text }) => ({ ref, text })),
  lastChange: { summary, mrNumber: payload.mrNumber, actor: payload.actor ?? null, at: new Date().toISOString() },
}, null, 2) + '\n');

output('commit_message', `${current.reference}: ${summary} - flagged customers now "${flagLabel}"`);
