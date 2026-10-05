'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_FIXTURE = path.join(__dirname, 'customers.json');

function loadCases(file = process.env.CUSTOMER_FIXTURE || DEFAULT_FIXTURE) {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')).cases;
}

module.exports = { loadCases };
