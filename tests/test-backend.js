/**
 * NutriTrack Backend Test Suite
 * Comprehensive automated tests for WhatsApp Webhook NLP, Macro Calculations,
 * Meta Handshake, and Cloud Sync Endpoints.
 * 
 * Run with: node tests/test-backend.js  OR  powershell tests/run-tests.ps1
 */

const assert = require('assert');
const path = require('path');

// Load webhook handler
const webhookHandler = require('../api/whatsapp-webhook.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${description}`);
    console.error(`    \x1b[33mError: ${err.message}\x1b[0m`);
  }
}

async function testAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${description}`);
    console.error(`    \x1b[33mError: ${err.message}\x1b[0m`);
  }
}

console.log('\n======================================================');
console.log('       🥗 NUTRITRACK BACKEND TEST SUITE              ');
console.log('======================================================\n');

// -------------------------------------------------------------------
// SUITE 1: NLP Message Parsing & Meal Recognition
// -------------------------------------------------------------------
console.log('\x1b[36m[SUITE 1]\x1b[0m WhatsApp Natural Language Food Parser');

test('Parses single food with quantity: "3 eggs"', () => {
  const req = { query: { text: '3 eggs' } };
  let jsonResult = null;
  const res = {
    status: () => res,
    json: (data) => { jsonResult = data; },
    send: () => {}
  };

  webhookHandler(req, res);
  assert(jsonResult, 'Expected JSON response');
  assert.strictEqual(jsonResult.parsed.items.length, 1);
  assert.strictEqual(jsonResult.parsed.items[0].qty, 3);
  assert.strictEqual(jsonResult.parsed.items[0].cals, 216); // 72 * 3
  assert.strictEqual(jsonResult.parsed.items[0].p, 18.9); // 6.3 * 3
});

test('Detects Dinner meal category: "Dinner: 1 cup rice, chicken"', () => {
  const req = { query: { text: 'Dinner: 1 cup rice, chicken' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert.strictEqual(jsonResult.parsed.meal, 'Dinner');
  assert.strictEqual(jsonResult.parsed.items.length, 2);
});

test('Disambiguates longest multi-word matches: "Rava Dosa with masala Chai for Dinner"', () => {
  const req = { query: { text: 'Rava Dosa with masala Chai for Dinner' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert.strictEqual(jsonResult.parsed.meal, 'Dinner');
  assert.strictEqual(jsonResult.parsed.items.length, 2);

  // Must match 'Rava Dosa' (not 'Plain Dosa')
  const dosa = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('rava dosa'));
  assert(dosa, 'Expected Rava Dosa match');
  assert.strictEqual(dosa.cals, 170);

  // Must match 'Masala Chai' (not just plain 'chai')
  const chai = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('masala chai'));
  assert(chai, 'Expected Masala Chai match');
  assert.strictEqual(chai.cals, 85);
});

test('Supports multiple delimiters: comma, and, with, &, newline', () => {
  const variations = [
    '2 eggs, 1 toast',
    '2 eggs and 1 toast',
    '2 eggs with 1 toast',
    '2 eggs & 1 toast',
    '2 eggs\n1 toast'
  ];

  for (const text of variations) {
    let jsonResult = null;
    const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };
    webhookHandler({ query: { text } }, res);
    assert.strictEqual(jsonResult.parsed.items.length, 2, `Failed for text: "${text}"`);
  }
});

// -------------------------------------------------------------------
// SUITE 2: Nutritional Precision & Net Carbs Accuracy
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 2]\x1b[0m Nutritional Precision & Macro Math');

test('Sum of individual items matches total macros and calories', () => {
  const req = { query: { text: '3 eggs, 2 toast, 1 coffee' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  const { items, totalCals, totalP, totalC, totalF } = jsonResult.parsed;

  const sumCals = items.reduce((acc, i) => acc + i.cals, 0);
  const sumP = Math.round(items.reduce((acc, i) => acc + i.p, 0) * 10) / 10;
  const sumC = Math.round(items.reduce((acc, i) => acc + i.c, 0) * 10) / 10;
  const sumF = Math.round(items.reduce((acc, i) => acc + i.f, 0) * 10) / 10;

  assert.strictEqual(totalCals, sumCals, 'Calories sum mismatch');
  assert.strictEqual(totalP, sumP, 'Protein sum mismatch');
  assert.strictEqual(totalC, sumC, 'Carbs sum mismatch');
  assert.strictEqual(totalF, sumF, 'Fat sum mismatch');
});

test('Each food item contains netCarbs property for accurate UI rendering', () => {
  const req = { query: { text: '1 apple, 1 banana' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  jsonResult.parsed.items.forEach(it => {
    assert(it.netCarbs !== undefined, `Item ${it.name} is missing netCarbs property`);
    assert(typeof it.netCarbs === 'number', `netCarbs must be a number`);
  });
});

// -------------------------------------------------------------------
// SUITE 3: Meta WhatsApp Webhook Security & Verification
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 3]\x1b[0m Meta Security & Verification Handshake');

test('Valid Meta GET verification returns 200 and mirrors challenge string', () => {
  const req = {
    method: 'GET',
    query: {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'nutritrack_token',
      'hub.challenge': '987654321'
    }
  };
  let sentBody = null;
  let statusCode = null;
  const res = {
    status: (code) => { statusCode = code; return res; },
    send: (body) => { sentBody = body; }
  };

  webhookHandler(req, res);
  assert.strictEqual(statusCode, 200);
  assert.strictEqual(sentBody, '987654321');
});

test('Invalid verify token rejects verification handshake', () => {
  const req = {
    method: 'GET',
    query: {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'wrong_hacker_token',
      'hub.challenge': '12345'
    }
  };
  let sentBody = null;
  const res = {
    status: () => res,
    send: (body) => { sentBody = body; }
  };

  webhookHandler(req, res);
  assert.notStrictEqual(sentBody, '12345', 'Should NOT echo challenge on invalid token');
});

test('Handles Meta POST message payload structure without errors', () => {
  const req = {
    method: 'POST',
    body: {
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: { phone_number_id: '123456789' },
            messages: [{
              from: '19876543210',
              id: 'wamid.test',
              type: 'text',
              text: { body: '3 eggs, 1 coffee' }
            }]
          }
        }]
      }]
    }
  };
  let sentBody = null;
  const res = {
    status: () => res,
    send: (body) => { sentBody = body; }
  };

  webhookHandler(req, res);
  assert.strictEqual(sentBody, 'EVENT_RECEIVED');
});

// -------------------------------------------------------------------
// SUITE 4: Cloud Sync API (`/api/sync`) Contract Verification
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 4]\x1b[0m Cloud Sync Endpoint Contract (/api/sync)');

testAsync('Sync endpoint gracefully handles disconnected KV state', async () => {
  const syncHandler = require('../api/sync.js');
  // Temporarily unset KV env vars
  const oldUrl = process.env.KV_REST_API_URL;
  const oldToken = process.env.KV_REST_API_TOKEN;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  let jsonResult = null;
  const res = {
    setHeader: () => {},
    status: () => res,
    json: (d) => { jsonResult = d; }
  };

  await syncHandler({ method: 'GET' }, res);
  assert.strictEqual(jsonResult.connected, false);
  assert(Array.isArray(jsonResult.meals));

  // Restore
  if (oldUrl) process.env.KV_REST_API_URL = oldUrl;
  if (oldToken) process.env.KV_REST_API_TOKEN = oldToken;
});

// -------------------------------------------------------------------
// Summary
// -------------------------------------------------------------------
console.log('\n======================================================');
console.log(`  Tests Executed: ${totalTests}`);
console.log(`  Passed:         \x1b[32m${passedTests}\x1b[0m`);
console.log(`  Failed:         \x1b[31m${failedTests}\x1b[0m`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m🎉 ALL BACKEND TEST SUITES PASSED PERFECTLY!\x1b[0m\n');
}
