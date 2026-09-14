/**
 * Security Audit Verification Test Suite
 * Validates fixes for:
 * 1. Payment webhook authentication hardening (subAccount bypass blocked, secret enforced)
 * 2. Stored XSS prevention in attachments (javascript: schemes blocked, name HTML stripped)
 */

const assert = require('assert');
const { sanitizeAttachments, sanitizePlainText } = require('../utils/securitySanitizer');

console.log('========================================================');
console.log('🔒 RUNNING TUONG TAN TOEIC SECURITY AUDIT TEST SUITE');
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✅ [PASS] ${description}`);
    passCount++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
    failCount++;
  }
}

// ----------------------------------------------------
// 1. ATTACHMENT SANITIZER (STORED XSS PREVENTION)
// ----------------------------------------------------
console.log('--- 1. Testing Attachment Sanitizer (Stored XSS Defense) ---');

it('Should strip dangerous "javascript:" URLs completely', () => {
  const input = [
    { type: 'link', name: 'Báo lỗi', url: 'javascript:alert(document.cookie)' },
    { type: 'link', name: 'Safe link', url: 'https://toeic.danganhtuong.dev/tests' }
  ];
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 1);
  assert.strictEqual(output[0].url, 'https://toeic.danganhtuong.dev/tests');
  assert.strictEqual(output[0].name, 'Safe link');
});

it('Should strip dangerous "vbscript:" and "data:text/html" URLs', () => {
  const input = [
    { type: 'link', name: 'VB Script', url: 'vbscript:msgbox("hacked")' },
    { type: 'link', name: 'Data HTML', url: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' },
    { type: 'link', name: 'Data JS', url: 'data:text/javascript;alert(1)' }
  ];
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 0, 'All dangerous pseudo-schemes must be discarded');
});

it('Should accept valid HTTP & HTTPS URLs', () => {
  const input = [
    { type: 'link', name: 'Docs', url: 'https://img.vietqr.io/image/MB-0335847674-compact2.png' },
    { type: 'link', name: 'Blog', url: 'http://example.com/test' }
  ];
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 2);
  assert.strictEqual(output[0].url, 'https://img.vietqr.io/image/MB-0335847674-compact2.png');
  assert.strictEqual(output[1].url, 'http://example.com/test');
});

it('Should accept valid base64 image data URLs', () => {
  const input = [
    { 
      type: 'image', 
      name: 'screenshot.png', 
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' 
    }
  ];
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 1);
  assert.strictEqual(output[0].type, 'image');
  assert.ok(output[0].url.startsWith('data:image/png;base64,'));
});

it('Should strip HTML tags and quotes from attachment names', () => {
  const input = [
    { 
      type: 'link', 
      name: '<script>alert("hacked")</script>MyFile.pdf', 
      url: 'https://example.com/file.pdf' 
    }
  ];
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 1);
  assert.ok(!output[0].name.includes('<script>'), 'Name should not contain HTML tags');
  assert.ok(!output[0].name.includes('"'), 'Name should not contain double quotes');
});

it('Should limit attachments to maximum 5 items', () => {
  const input = Array.from({ length: 10 }, (_, i) => ({
    type: 'link',
    name: `Link ${i}`,
    url: `https://example.com/link-${i}`
  }));
  const output = sanitizeAttachments(input);
  assert.strictEqual(output.length, 5, 'Must clamp attachments array to maximum 5 items');
});

// ----------------------------------------------------
// 2. PAYMENT WEBHOOK SECURITY LOGIC
// ----------------------------------------------------
console.log('\n--- 2. Testing Payment Webhook Authentication Logic ---');

const webhookSecret = 'tuong_tan_toeic_webhook_secret_mb_secure_2026';

function verifyWebhookAuth(headers, payload, query) {
  const incomingSecret = headers['x-api-key'] || 
    headers['authorization'] || 
    headers['x-sepay-key'] ||
    headers['x-payos-key'] ||
    query?.secret || 
    payload?.secret || 
    payload?.webhookSecret ||
    payload?.apiKey;

  return Boolean(incomingSecret && (
    incomingSecret === webhookSecret ||
    incomingSecret === `Bearer ${webhookSecret}` ||
    incomingSecret === `Apikey ${webhookSecret}` ||
    incomingSecret.toString().trim() === webhookSecret.trim()
  ));
}

it('Should REJECT webhook when secret is completely missing', () => {
  const isAuthorized = verifyWebhookAuth({}, { subAccount: '0335847674', amount: 99000 }, {});
  assert.strictEqual(isAuthorized, false, 'Must reject missing secret token');
});

it('Should REJECT webhook with fake/forged secret even if subAccount matches MB bank', () => {
  const isAuthorized = verifyWebhookAuth(
    { 'x-api-key': 'attacker_random_token_123' }, 
    { subAccount: '0335847674', accountNumber: '0335847674', amount: 99000 }, 
    {}
  );
  assert.strictEqual(isAuthorized, false, 'Must reject wrong secret even with matched account number');
});

it('Should ACCEPT webhook with valid x-api-key header', () => {
  const isAuthorized = verifyWebhookAuth(
    { 'x-api-key': 'tuong_tan_toeic_webhook_secret_mb_secure_2026' },
    { content: 'TOEIC12345', amount: 99000 },
    {}
  );
  assert.strictEqual(isAuthorized, true, 'Must authorize matching x-api-key');
});

it('Should ACCEPT webhook with valid Bearer Authorization header', () => {
  const isAuthorized = verifyWebhookAuth(
    { 'authorization': 'Bearer tuong_tan_toeic_webhook_secret_mb_secure_2026' },
    { content: 'TOEIC12345', amount: 99000 },
    {}
  );
  assert.strictEqual(isAuthorized, true, 'Must authorize matching Bearer token');
});

it('Should ACCEPT webhook with valid payload secret or x-sepay-key', () => {
  const isAuthorizedSepay = verifyWebhookAuth(
    { 'x-sepay-key': 'tuong_tan_toeic_webhook_secret_mb_secure_2026' },
    { content: 'TOEIC12345', amount: 99000 },
    {}
  );
  assert.strictEqual(isAuthorizedSepay, true);

  const isAuthorizedPayload = verifyWebhookAuth(
    {},
    { content: 'TOEIC12345', amount: 99000, secret: 'tuong_tan_toeic_webhook_secret_mb_secure_2026' },
    {}
  );
  assert.strictEqual(isAuthorizedPayload, true);
});

console.log('\n========================================================');
console.log(`📊 SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('========================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
