'use strict';

// Loads the scam-risk requirement and turns its flag label into the values the
// engines are expected to return, e.g. "very high risk" → VERY_HIGH_RISK
// (onboarding status) and VERY_HIGH (login risk level).
const requirement = require('./scam-risk.json');

const flagLabel = requirement.flagLabel;
const expectedOnboardingStatus = flagLabel.trim().toUpperCase().replace(/\s+/g, '_');
const expectedRiskLevel = expectedOnboardingStatus.replace(/_RISK$/, '');
const criterion = (ref) => requirement.acceptanceCriteria.find((ac) => ac.ref === ref)?.text;

module.exports = { requirement, flagLabel, expectedOnboardingStatus, expectedRiskLevel, criterion };
