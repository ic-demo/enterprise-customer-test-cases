'use strict';

const crypto = require('node:crypto');
const { assessRisk } = require('./riskEngine');

const MAX_FAILED_ATTEMPTS = 5;

// What the customer is allowed to do after a successful password check.
const OUTCOME_BY_RISK = {
  LOW: 'ALLOW',
  MEDIUM: 'STEP_UP_MFA',
  HIGH: 'RESTRICTED', // signed in, but outbound payments held for fraud review
};

function verifyPassword(password, { salt, hash }) {
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function login(customer, { password, session }) {
  if (customer.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    return { outcome: 'LOCKED' };
  }
  if (!verifyPassword(password, customer.credential)) {
    return { outcome: 'DENIED' };
  }
  const risk = assessRisk(customer, session);
  return { outcome: OUTCOME_BY_RISK[risk.level], risk };
}

module.exports = { login, verifyPassword, MAX_FAILED_ATTEMPTS };
