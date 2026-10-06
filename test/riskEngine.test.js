'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { assessRisk, riskLevel, THRESHOLDS } = require('../src/riskEngine');
const { expectedRiskLevel } = require('../requirements/scamRisk');

const baseCustomer = {
  age: 40, accountAgeDays: 1000, failedAttempts: 0, homeCountry: 'GB', knownDevices: ['dev-1'],
};
const baseSession = { deviceId: 'dev-1', country: 'GB' };

const flagsFor = (customer, session = {}) =>
  assessRisk({ ...baseCustomer, ...customer }, { ...baseSession, ...session }).flags;

describe('Age boundaries', () => {
  it('flags 75 as elderly and 74 as senior', () => {
    assert.deepEqual(flagsFor({ age: 75 }), ['ELDERLY_CUSTOMER']);
    assert.deepEqual(flagsFor({ age: 74 }), ['SENIOR_CUSTOMER']);
  });

  it('flags 65 as senior and 64 as nothing', () => {
    assert.deepEqual(flagsFor({ age: 65 }), ['SENIOR_CUSTOMER']);
    assert.deepEqual(flagsFor({ age: 64 }), []);
  });

  it('flags 20 as a young adult and 21 as nothing', () => {
    assert.deepEqual(flagsFor({ age: 20 }), ['YOUNG_ADULT']);
    assert.deepEqual(flagsFor({ age: 21 }), []);
  });
});

describe('Time-window signals', () => {
  it('only counts a password reset within the last 24 hours', () => {
    assert.deepEqual(flagsFor({}, { hoursSincePasswordReset: 23 }), ['RECENT_PASSWORD_RESET']);
    assert.deepEqual(flagsFor({}, { hoursSincePasswordReset: 24 }), []);
  });

  it('only counts a new payee added within the last 24 hours', () => {
    assert.deepEqual(flagsFor({}, { hoursSinceNewPayee: 0 }), ['NEW_PAYEE_ADDED']);
    assert.deepEqual(flagsFor({}, { hoursSinceNewPayee: 48 }), []);
  });

  it('treats a missing timestamp as no recent activity', () => {
    assert.deepEqual(flagsFor({}, {}), []);
  });
});

describe('Risk levels', () => {
  it('maps scores to levels at the thresholds', () => {
    assert.equal(riskLevel(THRESHOLDS.MEDIUM - 1), 'LOW');
    assert.equal(riskLevel(THRESHOLDS.MEDIUM), 'MEDIUM');
    assert.equal(riskLevel(THRESHOLDS.HIGH - 1), 'MEDIUM');
    assert.equal(riskLevel(THRESHOLDS.HIGH), expectedRiskLevel);
  });
});
