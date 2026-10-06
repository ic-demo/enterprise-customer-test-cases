'use strict';

// Scam-vulnerability scoring at onboarding. Each customer is scored from three
// onboarding attributes (age, digital literacy, account activity); a score at
// or above HIGH_RISK_THRESHOLD flags the customer as high risk. A customer
// missing any attribute is reported as unable to score rather than dropped.
const ATTRIBUTES = ['age', 'digitalLiteracy', 'accountActivity'];

const ALLOWED_VALUES = {
  digitalLiteracy: ['LOW', 'MEDIUM', 'HIGH'],
  accountActivity: ['DORMANT', 'LOW', 'REGULAR'],
};

const RULES = [
  { attribute: 'age', rule: 'Age 75 or over', points: 40, test: (c) => c.age >= 75 },
  { attribute: 'age', rule: 'Age 65 to 74', points: 25, test: (c) => c.age >= 65 && c.age < 75 },
  { attribute: 'age', rule: 'Age under 21', points: 10, test: (c) => c.age < 21 },
  { attribute: 'digitalLiteracy', rule: 'Low digital literacy', points: 30, test: (c) => c.digitalLiteracy === 'LOW' },
  { attribute: 'digitalLiteracy', rule: 'Medium digital literacy', points: 15, test: (c) => c.digitalLiteracy === 'MEDIUM' },
  { attribute: 'accountActivity', rule: 'Dormant account activity', points: 20, test: (c) => c.accountActivity === 'DORMANT' },
  { attribute: 'accountActivity', rule: 'Low account activity', points: 10, test: (c) => c.accountActivity === 'LOW' },
];

const HIGH_RISK_THRESHOLD = 60;

const STATUS = { HIGH_RISK: 'HIGH_RISK', NOT_HIGH_RISK: 'NOT_HIGH_RISK', UNABLE_TO_SCORE: 'UNABLE_TO_SCORE' };

const isMissing = (value) => value === undefined || value === null || value === '';

function isValid(attribute, value) {
  if (attribute === 'age') return Number.isFinite(value) && value >= 0;
  return ALLOWED_VALUES[attribute].includes(value);
}

function assessOnboardingRisk(customer) {
  const missing = ATTRIBUTES.filter((a) => isMissing(customer[a]));
  const invalid = ATTRIBUTES.filter((a) => !missing.includes(a) && !isValid(a, customer[a]));
  if (missing.length || invalid.length) {
    return { status: STATUS.UNABLE_TO_SCORE, score: null, highRisk: null, rulesApplied: [], missing, invalid };
  }

  const rulesApplied = RULES.filter((r) => r.test(customer)).map(({ attribute, rule, points }) => ({ attribute, rule, points }));
  const score = rulesApplied.reduce((sum, r) => sum + r.points, 0);
  const highRisk = score >= HIGH_RISK_THRESHOLD;
  return {
    status: highRisk ? STATUS.HIGH_RISK : STATUS.NOT_HIGH_RISK,
    score, highRisk, rulesApplied, missing: [], invalid: [],
  };
}

// Screens every customer and keeps each one in the results, including those
// that could not be scored.
function screenCustomers(customers) {
  return customers.map((customer) => ({ ...customer, result: assessOnboardingRisk(customer) }));
}

module.exports = {
  assessOnboardingRisk, screenCustomers, ATTRIBUTES, ALLOWED_VALUES, RULES, HIGH_RISK_THRESHOLD, STATUS,
};
