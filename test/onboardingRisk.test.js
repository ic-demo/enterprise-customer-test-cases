'use strict';

// Onboarding scam-risk test cases. Test names start with "TC-<n>:" so the
// test-case reporter can list them in the pipeline summary.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { assessOnboardingRisk, screenCustomers, HIGH_RISK_THRESHOLD, STATUS } = require('../src/onboardingRisk');

const { customers } = require(path.join(__dirname, 'fixtures', 'onboarding-customers.json'));
const byId = (id) => customers.find((c) => c.id === id);

test('TC-1: Score is assigned from age, digital literacy and account activity', () => {
  const customer = byId('ONB-2003');
  const result = assessOnboardingRisk(customer);

  assert.equal(result.score, customer.expected.score, `scored ${result.score}, expected ${customer.expected.score}`);
  assert.deepEqual(
    [...new Set(result.rulesApplied.map((r) => r.attribute))].sort(),
    ['accountActivity', 'age', 'digitalLiteracy'],
    'score does not draw on all three attributes',
  );

  // Changing any one attribute on its own must change the score.
  for (const [attribute, value] of [['age', 40], ['digitalLiteracy', 'HIGH'], ['accountActivity', 'REGULAR']]) {
    const changed = assessOnboardingRisk({ ...customer, [attribute]: value });
    assert.notEqual(changed.score, result.score, `changing ${attribute} did not change the score`);
  }
});

test('TC-2: Score exactly at the threshold → flagged "high risk"', () => {
  const result = assessOnboardingRisk(byId('ONB-2003'));
  assert.equal(result.score, HIGH_RISK_THRESHOLD, `fixture scored ${result.score}, not the threshold ${HIGH_RISK_THRESHOLD}`);
  assert.equal(result.status, STATUS.HIGH_RISK, `flagged "${result.status}"`);
  assert.equal(result.highRisk, true, 'highRisk flag not set');

  const below = assessOnboardingRisk(byId('ONB-2004'));
  assert.ok(below.score < HIGH_RISK_THRESHOLD);
  assert.equal(below.status, STATUS.NOT_HIGH_RISK, `below threshold but flagged "${below.status}"`);
});

test('TC-3: Missing digital literacy → listed as unable to score, not left out', () => {
  const results = screenCustomers(customers);
  const edith = results.find((c) => c.id === 'ONB-2005');

  assert.equal(results.length, customers.length, 'customers were dropped from the results');
  assert.ok(edith, 'customer missing digital literacy was left out');
  assert.equal(edith.result.status, STATUS.UNABLE_TO_SCORE, `listed as "${edith.result.status}"`);
  assert.deepEqual(edith.result.missing, ['digitalLiteracy']);
  assert.equal(edith.result.score, null, 'a score was assigned despite missing data');
});
