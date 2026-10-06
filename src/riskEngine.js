'use strict';

// Scam-vulnerability signals evaluated at login. Each rule adds points to the
// session's risk score; the total maps to a risk level.
const RULES = [
  { flag: 'ELDERLY_CUSTOMER', points: 35, test: (c) => c.age >= 75 },
  { flag: 'SENIOR_CUSTOMER', points: 20, test: (c) => c.age >= 65 && c.age < 75 },
  { flag: 'YOUNG_ADULT', points: 10, test: (c) => c.age < 21 },
  { flag: 'NEW_ACCOUNT', points: 10, test: (c) => c.accountAgeDays < 30 },
  { flag: 'RECENT_FAILED_ATTEMPTS', points: 15, test: (c) => c.failedAttempts >= 3 },
  { flag: 'UNRECOGNISED_DEVICE', points: 15, test: (c, s) => !c.knownDevices.includes(s.deviceId) },
  { flag: 'FOREIGN_LOGIN', points: 20, test: (c, s) => s.country !== c.homeCountry },
  { flag: 'RECENT_PASSWORD_RESET', points: 15, test: (c, s) => (s.hoursSincePasswordReset ?? Infinity) < 24 },
  { flag: 'NEW_PAYEE_ADDED', points: 15, test: (c, s) => (s.hoursSinceNewPayee ?? Infinity) < 24 },
  { flag: 'ACTIVE_PHONE_CALL', points: 25, test: (c, s) => s.onActiveCall === true },
  { flag: 'REMOTE_ACCESS_TOOL', points: 30, test: (c, s) => s.remoteAccessDetected === true },
];

const THRESHOLDS = { MEDIUM: 30, HIGH: 60 };
const MAX_SCORE = 100;

function riskLevel(score) {
  // DEMO DEVIATION: scores at or above the high threshold are labelled
  // VERY_HIGH instead of HIGH. Change back to 'HIGH' to fix.
  if (score >= THRESHOLDS.HIGH) return 'VERY_HIGH';
  if (score >= THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

function assessRisk(customer, session) {
  const matched = RULES.filter((rule) => rule.test(customer, session));
  const score = Math.min(
    MAX_SCORE,
    matched.reduce((sum, rule) => sum + rule.points, 0),
  );
  return { score, level: riskLevel(score), flags: matched.map((rule) => rule.flag) };
}

module.exports = { assessRisk, riskLevel, RULES, THRESHOLDS, MAX_SCORE };
