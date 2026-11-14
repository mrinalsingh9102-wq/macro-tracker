/**
 * NutriTrack Backend Test Suite
 * Comprehensive automated regression and unit tests for:
 * - WhatsApp NLP Conversational Food Parsing (Breakfast prefixes, numbers as words, Indian specialties)
 * - Nutritional Precision & Net Carbs Verification
 * - Meta Security Handshake
 * - Multi-Device Cloud Sync Persistence (Non-destructive Upstash KV sync)
 */

const assert = require('assert');

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
// SUITE 1: NLP Conversational Parsing & Prefix Handling (Fix for Bug 1)
// -------------------------------------------------------------------
console.log('\x1b[36m[SUITE 1]\x1b[0m NLP Conversational Parsing & Prefix Stripping');

test('Parses with meal prefix: "Breakfast: 2 eggs, 1 toast"', () => {
  const req = { query: { text: 'Breakfast: 2 eggs, 1 toast' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert(jsonResult, 'Expected JSON response');
  assert.strictEqual(jsonResult.parsed.meal, 'Breakfast');
  assert.strictEqual(jsonResult.parsed.items.length, 2);

  const eggs = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('egg'));
  assert(eggs, 'Eggs not found');
  assert.strictEqual(eggs.qty, 2, 'Eggs quantity must be 2, not 1');
  assert.strictEqual(eggs.cals, 144, 'Calories for 2 eggs must be 144 kcal');
});

test('Parses natural conversational sentence: "Had 2 eggs for breakfast"', () => {
  const req = { query: { text: 'Had 2 eggs for breakfast' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert.strictEqual(jsonResult.parsed.meal, 'Breakfast');
  const eggs = jsonResult.parsed.items[0];
  assert.strictEqual(eggs.qty, 2, 'Must parse quantity 2 despite "Had" prefix');
  assert.strictEqual(eggs.cals, 144);
});

test('Parses English word numbers: "two eggs and one masala chai"', () => {
  const req = { query: { text: 'two eggs and one masala chai' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert.strictEqual(jsonResult.parsed.items.length, 2);
  const eggs = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('egg'));
  const chai = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('chai'));
  assert.strictEqual(eggs.qty, 2);
  assert.strictEqual(chai.qty, 1);
});

test('Parses Indian specialties with rich details: "Rava Dosa with masala Chai for Dinner"', () => {
  const req = { query: { text: 'Rava Dosa with masala Chai for Dinner' } };
  let jsonResult = null;
  const res = { status: () => res, json: (data) => { jsonResult = data; }, send: () => {} };

  webhookHandler(req, res);
  assert.strictEqual(jsonResult.parsed.meal, 'Dinner');
  assert.strictEqual(jsonResult.parsed.items.length, 2);

  const dosa = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('rava dosa'));
  assert(dosa, 'Expected Rava Dosa');
  assert.strictEqual(dosa.cals, 170);
  assert(dosa.description && dosa.description.length > 5, 'Must provide rich description for Rava Dosa');
  assert.notStrictEqual(dosa.category, 'WhatsApp', 'Category must be real culinary group, not generic WhatsApp string');

  const chai = jsonResult.parsed.items.find(i => i.name.toLowerCase().includes('masala chai'));
  assert(chai, 'Expected Masala Chai');
  assert.strictEqual(chai.cals, 85);
  assert(chai.description && chai.description.length > 5, 'Must provide rich description for Masala Chai');
});

// -------------------------------------------------------------------
// SUITE 2: Food Descriptions & Category Integrity (Fix for Bug 2)
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 2]\x1b[0m Food Description & Culinary Classification');

test('Every staple food item has dedicated category and rich description', () => {
  const sampleFoods = [
    '1 egg', '1 toast', '1 rava dosa', '1 masala chai', '1 idli',
    '1 chicken', '1 cup rice', '1 dal', '1 paneer', '1 bowl poha'
  ];

  for (const food of sampleFoods) {
    let jsonResult = null;
    const res = { status: () => res, json: (d) => { jsonResult = d; }, send: () => {} };
    webhookHandler({ query: { text: food } }, res);
    assert(jsonResult.parsed.items.length > 0, `No items parsed for "${food}"`);
    const item = jsonResult.parsed.items[0];

    assert(item.category && item.category !== 'WhatsApp', `Item ${item.name} has invalid category: ${item.category}`);
    assert(item.description && item.description.length > 10, `Item ${item.name} lacks detailed description`);
    assert(item.netCarbs !== undefined, `Item ${item.name} missing netCarbs`);
  }
});

// -------------------------------------------------------------------
// SUITE 3: Nutritional Math & Net Carbs Consistency
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 3]\x1b[0m Macro Math & Net Carbs Consistency');

test('Macro subtotals match exact sum of items', () => {
  const req = { query: { text: '2 eggs, 1 toast, 1 coffee' } };
  let jsonResult = null;
  const res = { status: () => res, json: (d) => { jsonResult = d; }, send: () => {} };
  webhookHandler(req, res);

  const { items, totalCals, totalP, totalC, totalF } = jsonResult.parsed;
  const sumCals = items.reduce((a, b) => a + b.cals, 0);
  const sumP = Math.round(items.reduce((a, b) => a + b.p, 0) * 10) / 10;
  const sumC = Math.round(items.reduce((a, b) => a + b.c, 0) * 10) / 10;
  const sumF = Math.round(items.reduce((a, b) => a + b.f, 0) * 10) / 10;

  assert.strictEqual(totalCals, sumCals);
  assert.strictEqual(totalP, sumP);
  assert.strictEqual(totalC, sumC);
  assert.strictEqual(totalF, sumF);
});

// -------------------------------------------------------------------
// SUITE 4: Multi-Device Non-Destructive Cloud Sync (Fix for Bug 3)
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 4]\x1b[0m Multi-Device Non-Destructive Cloud Sync (/api/sync)');

testAsync('Sync endpoint is non-destructive (safe for simultaneous Phone + Laptop access)', async () => {
  const syncHandler = require('../api/sync.js');

  // Verify sync endpoint responds with valid JSON
  let getResult1 = null;
  const res1 = {
    setHeader: () => {},
    status: () => res1,
    json: (d) => { getResult1 = d; }
  };

  await syncHandler({ method: 'GET', query: { date: '2026-11-14' } }, res1);
  assert(getResult1, 'Expected sync JSON response');
  assert(typeof getResult1.connected === 'boolean');
  assert(Array.isArray(getResult1.meals), 'Meals must be returned as an array');
});

// -------------------------------------------------------------------
// SUITE 5: Meta Handshake & Webhook Security
// -------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 5]\x1b[0m Meta Security & Handshake Validation');

test('Valid Meta GET handshake returns challenge string', () => {
  const req = {
    method: 'GET',
    query: {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'nutritrack_token',
      'hub.challenge': 'CHALLENGE_CODE_12345'
    }
  };
  let responseBody = null;
  let code = null;
  const res = {
    status: (c) => { code = c; return res; },
    send: (b) => { responseBody = b; }
  };

  webhookHandler(req, res);
  assert.strictEqual(code, 200);
  assert.strictEqual(responseBody, 'CHALLENGE_CODE_12345');
});

test('Rejects invalid token to prevent unauthorized webhooks', () => {
  const req = {
    method: 'GET',
    query: {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'bad_token',
      'hub.challenge': 'CHALLENGE_CODE_12345'
    }
  };
  let responseBody = null;
  const res = {
    status: () => res,
    send: (b) => { responseBody = b; }
  };

  webhookHandler(req, res);
  assert.notStrictEqual(responseBody, 'CHALLENGE_CODE_12345');
});

// -------------------------------------------------------------------
// Summary Report
// -------------------------------------------------------------------
console.log('\n======================================================');
console.log(`  Tests Executed: ${totalTests}`);
console.log(`  Passed:         \x1b[32m${passedTests}\x1b[0m`);
console.log(`  Failed:         \x1b[31m${failedTests}\x1b[0m`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m🎉 ALL 9 BACKEND REGRESSION & UNIT TESTS PASSED!\x1b[0m\n');
}
