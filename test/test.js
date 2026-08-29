/**
 * @file test/test.js
 * @description DevKit unit tests. Run with `npm test` => `node test/test.js`.
 *              Uses Node's built-in assert module (no frameworks).
 */
'use strict';

const { strict: assert } = require('assert');
const DevKit = require('../js/utils.js');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    failures.push({ name: name, error: e });
    console.error('  FAIL: ' + name);
    console.error('    ' + (e && e.message ? e.message : e));
  }
}

/* =====================================================================
 *  Text tools
 * ==================================================================== */
test('countWords: basic', () => {
  assert.strictEqual(DevKit.countWords('hello world'), 2);
  assert.strictEqual(DevKit.countWords(''), 0);
  assert.strictEqual(DevKit.countWords('   '), 0);
  assert.strictEqual(DevKit.countWords('one  two   three'), 3);
});

test('countChars: empty + cadence', () => {
  assert.strictEqual(DevKit.countChars('abc'), 3);
  assert.strictEqual(DevKit.countChars(''), 0);
  assert.strictEqual(DevKit.countChars('a b'), 3);
});

test('countLines: basic', () => {
  assert.strictEqual(DevKit.countLines(''), 0);
  assert.strictEqual(DevKit.countLines('a'), 1);
  assert.strictEqual(DevKit.countLines('a\nb\nc'), 3);
});

test('slugify: lowercase, spaces, symbols', () => {
  assert.strictEqual(DevKit.slugify('Hello World!'), 'hello-world');
  assert.strictEqual(DevKit.slugify('Café con Leche'), 'cafe-con-leche');
  assert.strictEqual(DevKit.slugify('  A  B  -- C  '), 'a-b-c');
  assert.strictEqual(DevKit.slugify(''), '');
});

test('camelCase', () => {
  assert.strictEqual(DevKit.camelCase('hello world'), 'helloWorld');
  assert.strictEqual(DevKit.camelCase('Hello_World'), 'helloWorld');
  assert.strictEqual(DevKit.camelCase('foo bar baz'), 'fooBarBaz');
});

test('pascalCase', () => {
  assert.strictEqual(DevKit.pascalCase('hello world'), 'HelloWorld');
  assert.strictEqual(DevKit.pascalCase('foo-bar'), 'FooBar');
});

test('snakeCase', () => {
  assert.strictEqual(DevKit.snakeCase('hello world'), 'hello_world');
  assert.strictEqual(DevKit.snakeCase('Hello World'), 'hello_world');
});

test('kebabCase', () => {
  assert.strictEqual(DevKit.kebabCase('hello world'), 'hello-world');
  assert.strictEqual(DevKit.kebabCase('Hello World'), 'hello-world');
});

test('titleCase', () => {
  assert.strictEqual(DevKit.titleCase('hello world'), 'Hello World');
  assert.strictEqual(DevKit.titleCase('LOREM IPSUM'), 'Lorem Ipsum');
});

test('reverse: handles unicode', () => {
  assert.strictEqual(DevKit.reverse('abc'), 'cba');
  assert.strictEqual(DevKit.reverse('snowman ☃'), '☃ namwons');
});

test('trimLines', () => {
  assert.strictEqual(DevKit.trimLines(' a \n  b  \nc '), 'a\nb\nc');
});

test('collapseWhitespace', () => {
  assert.strictEqual(DevKit.collapseWhitespace('  a   b   c  '), 'a b c');
});

/* =====================================================================
 *  JSON tools
 * ==================================================================== */
test('formatJSON: pretty', () => {
  assert.strictEqual(DevKit.formatJSON('{"a":1,"b":[1,2]}', 2),
    '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
});

test('formatJSON: throws on invalid', () => {
  assert.throws(() => DevKit.formatJSON('{invalid'), /Invalid JSON|position/i);
});

test('minifyJSON', () => {
  assert.strictEqual(DevKit.minifyJSON('{ "a" : 1 , "b" : 2 }'), '{"a":1,"b":2}');
});

test('jsonTable: flat object', () => {
  const rows = DevKit.jsonTable('{"name":"sajid","age":25}');
  assert.strictEqual(rows.length, 2);
  assert.ok(rows.some(r => r.key === 'name' && r.value === 'sajid'));
  assert.ok(rows.some(r => r.key === 'age' && r.value === '25'));
});

test('jsonTable: throws on primitive', () => {
  assert.throws(() => DevKit.jsonTable('"just a string"'));
});

test('diffJSON: added/removed', () => {
  const d = DevKit.diffJSON('{"a":1,"b":2}', '{"a":1,"c":3}');
  assert.ok(d.removed.some(l => l.includes('"b"')));
  assert.ok(d.added.some(l => l.includes('"c"')));
  assert.ok(d.unchanged.some(l => l.includes('"a"')));
});

/* =====================================================================
 *  Color tools
 * ==================================================================== */
test('hexToRgb', () => {
  assert.deepStrictEqual(DevKit.hexToRgb('#ff0000'), { r: 255, g: 0, b: 0 });
  assert.deepStrictEqual(DevKit.hexToRgb('fff'), { r: 255, g: 255, b: 255 });
  assert.deepStrictEqual(DevKit.hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
  assert.throws(() => DevKit.hexToRgb('#zzz'));
});

test('rgbToHex', () => {
  assert.strictEqual(DevKit.rgbToHex(255, 0, 0), '#ff0000');
  assert.strictEqual(DevKit.rgbToHex(0, 128, 255), '#0080ff');
  assert.strictEqual(DevKit.rgbToHex(255, 255, 255), '#ffffff');
});

test('rgbToHsl / hslToRgb round trip', () => {
  const hsl = DevKit.rgbToHsl(255, 0, 0);
  assert.strictEqual(hsl.h, 0);
  const back = DevKit.hslToRgb(hsl.h, hsl.s, hsl.l);
  assert.deepStrictEqual(back, { r: 255, g: 0, b: 0 });
  const gray = DevKit.hslToRgb(0, 0, 50);
  assert.deepStrictEqual(gray, { r: 128, g: 128, b: 128 });
});

test('hexToHsl', () => {
  assert.strictEqual(DevKit.hexToHsl('#000000').l, 0);
  assert.strictEqual(DevKit.hexToHsl('#ffffff').l, 100);
});

test('contrastRatio: black/white == 21', () => {
  assert.ok(Math.abs(DevKit.contrastRatio('#000000', '#ffffff') - 21) < 0.01);
  // ratio is symmetric
  assert.ok(Math.abs(DevKit.contrastRatio('#ffffff', '#000000') - 21) < 0.01);
});

test('readabilityLevel', () => {
  assert.strictEqual(DevKit.readabilityLevel(21).level, 'AAA');
  assert.strictEqual(DevKit.readabilityLevel(4.5).level, 'AA');
  assert.strictEqual(DevKit.readabilityLevel(3).level, 'AA-Large');
  assert.strictEqual(DevKit.readabilityLevel(1).level, 'Fail');
});

/* =====================================================================
 *  Encoders
 * ==================================================================== */
test('base64Encode/Decode UTF-8 round trip', () => {
  const plain = 'Hello, 世界! 🎉';
  const enc = DevKit.base64Encode(plain);
  assert.strictEqual(DevKit.base64Decode(enc), plain);
});

test('base64Encode known values', () => {
  assert.strictEqual(DevKit.base64Encode('Hello'), 'SGVsbG8=');
  assert.strictEqual(DevKit.base64Encode('a'), 'YQ==');
  assert.strictEqual(DevKit.base64Encode('ab'), 'YWI=');
  assert.strictEqual(DevKit.base64Encode('abc'), 'YWJj');
});

test('base64Decode invalid throws', () => {
  assert.throws(() => DevKit.base64Decode('%%%'));
  assert.throws(() => DevKit.base64Decode(''));
});

test('urlEncode/Decode', () => {
  const s = 'a b&c=d/e?f';
  assert.strictEqual(DevKit.urlDecode(DevKit.urlEncode(s)), s);
  assert.strictEqual(DevKit.urlEncode(' '), '%20');
});

test('base64UrlEncode', () => {
  assert.strictEqual(DevKit.base64UrlEncode('Hello'), 'SGVsbG8');
});

/* =====================================================================
 *  UUID / tokens
 * ==================================================================== */
test('uuidV4 format + uniqueness', () => {
  const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (let i = 0; i < 100; i++) assert.ok(re.test(DevKit.uuidV4()));
  const list = DevKit.uuidList(50);
  assert.strictEqual(new Set(list).size, 50);
});

test('randomToken length + charset', () => {
  const t = DevKit.randomToken(24, 'abc');
  assert.strictEqual(t.length, 24);
  assert.ok(/^[abc]{24}$/.test(t));
});

/* =====================================================================
 *  JWT
 * ==================================================================== */
test('decodeJWT valid', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
    'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  const { header, payload } = DevKit.decodeJWT(token);
  assert.strictEqual(header.alg, 'HS256');
  assert.strictEqual(payload.name, 'Jane Doe');
});

test('decodeJWT invalid throws', () => {
  assert.throws(() => DevKit.decodeJWT('not-a-jwt'));
  assert.throws(() => DevKit.decodeJWT(''));
  assert.throws(() => DevKit.decodeJWT('a.b')); // 2 segments
});

test('jwtTimes expiry', () => {
  const now = Date.now();
  const expired = DevKit.jwtTimes({ exp: (now / 1000) - 1000 }, new Date(now));
  assert.strictEqual(expired.expired, true);
  const valid = DevKit.jwtTimes({ exp: (now / 1000) + 10000 }, new Date(now));
  assert.strictEqual(valid.expired, false);
  const notYet = DevKit.jwtTimes({ nbf: (now / 1000) + 10000 }, new Date(now));
  assert.strictEqual(notYet.notYetValid, true);
});

/* =====================================================================
 *  Regexp
 * ==================================================================== */
test('findMatches basic', () => {
  const r = DevKit.findMatches('\\d+', 'g', 'a1b22c333');
  assert.strictEqual(r.count, 3);
  assert.deepStrictEqual(r.matches[0], { match: '1', index: 1 });
  assert.deepStrictEqual(r.matches[1], { match: '22', index: 3 });
  assert.strictEqual(r.valid, true);
});

test('findMatches invalid pattern throws (returns error)', () => {
  const r = DevKit.findMatches('([a-z', 'g', 'abc');
  assert.strictEqual(r.valid, false);
  assert.ok(r.error);
});

/* =====================================================================
 *  Generators
 * ==================================================================== */
test('loremIpsum word count', () => {
  const words = DevKit.loremIpsum(50, 'words').split(' ').length;
  assert.strictEqual(words, 50);
});

test('loremIpsum sentences/paragraphs structure', () => {
  const sent = DevKit.loremIpsum(3, 'sentences').split('\n');
  assert.strictEqual(sent.length, 3);
  const paras = DevKit.loremIpsum(2, 'paragraphs').split('\n\n');
  assert.strictEqual(paras.length, 2);
});

test('generatePassword respects length', () => {
  const p = DevKit.generatePassword(20, { upper: true, lower: true, numbers: true, symbols: true });
  assert.strictEqual(p.password.length, 20);
  assert.ok(/[A-Z]/.test(p.password));
  assert.ok(/[a-z]/.test(p.password));
  assert.ok(/[0-9]/.test(p.password));
  assert.ok(/[^A-Za-z0-9]/.test(p.password));
});

test('generatePassword strength', () => {
  const p = DevKit.generatePassword(32, { upper: true, lower: true, numbers: true, symbols: true });
  assert.strictEqual(p.strength, 'Very Strong');
});

/* =====================================================================
 *  Report
 * ==================================================================== */
console.log('\nDevKit tests:');
console.log('  passed: ' + passed);
console.log('  failed: ' + failed);
if (failed > 0) {
  console.error('\nFailures:');
  failures.forEach(f => console.error('  - ' + f.name + ': ' + f.error.message));
  process.exit(1);
}
console.log('All tests passed ✔ (' + passed + ')');
