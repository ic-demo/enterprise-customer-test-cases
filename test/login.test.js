'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { login } = require('../src/login');
const { loadCases } = require('./fixtures/load');
const { expectedRiskLevel } = require('../requirements/scamRisk');

// FLAGGED in a fixture means whatever level the requirement's flag label maps to.
const resolveLevel = (level) => (level === 'FLAGGED' ? expectedRiskLevel : level);

describe('Customer login with scam-risk screening', () => {
  for (const { id, description, customer, attempt, expected } of loadCases()) {
    it(`${id}: ${description}`, () => {
      const result = login(customer, attempt);

      assert.equal(result.outcome, expected.outcome);
      if (expected.level) {
        assert.equal(result.risk.score, expected.score, 'risk score');
        assert.equal(result.risk.level, resolveLevel(expected.level), 'risk level');
        assert.deepEqual(result.risk.flags, expected.flags, 'risk flags');
      } else {
        assert.equal(result.risk, undefined, 'no risk assessment without a successful password check');
      }
    });
  }
});
