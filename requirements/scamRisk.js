'use strict';

// Loads the scam-risk requirement and turns its flag label into the status the
// onboarding scorer is expected to return, e.g. "very high risk" → VERY_HIGH_RISK.
const requirement = require('./scam-risk.json');

const flagLabel = requirement.flagLabel;
const expectedOnboardingStatus = flagLabel.trim().toUpperCase().replace(/\s+/g, '_');
const criterion = (ref) => requirement.acceptanceCriteria.find((ac) => ac.ref === ref)?.text;

module.exports = { requirement, flagLabel, expectedOnboardingStatus, criterion };
