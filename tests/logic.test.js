import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyRangeSelection,
  formatSelectedUrls,
  normalizeTabs,
  parseClipboardUrls,
} from '../logic.js';

test('normalizeTabs returns an empty array for invalid input', () => {
  assert.deepEqual(normalizeTabs(null), []);
});

test('normalizeTabs removes invalid tabs and sorts by browser index', () => {
  const result = normalizeTabs([
    { id: 9, index: 2, title: 'Third', url: 'https://third.example' },
    { id: 'invalid', index: 1, title: 'Invalid', url: 'https://invalid.example' },
    { id: 4, index: 0, title: 'First', url: 'https://first.example' },
  ]);

  assert.deepEqual(result.map((tab) => tab.id), [4, 9]);
});

test('normalizeTabs trims titles and supplies a fallback title', () => {
  const result = normalizeTabs([
    { id: 1, index: 0, title: '  Docs  ', url: 'https://docs.example' },
    { id: 2, index: 1, title: '   ', url: 'https://blank.example' },
  ]);

  assert.equal(result[0].title, 'Docs');
  assert.equal(result[1].title, 'Untitled tab');
});

test('normalizeTabs uses pendingUrl when url is unavailable', () => {
  const [tab] = normalizeTabs([
    { id: 1, index: 0, title: 'Loading', pendingUrl: 'https://pending.example' },
  ]);

  assert.equal(tab.url, 'https://pending.example');
});

test('applyRangeSelection selects every tab between the anchor and target', () => {
  const tabs = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
  ];

  const result = applyRangeSelection(new Set(), tabs, 1, 3, true);

  assert.deepEqual([...result], [2, 3, 4]);
});

test('applyRangeSelection works when the target is before the anchor', () => {
  const tabs = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
  ];

  const result = applyRangeSelection(new Set(), tabs, 3, 1, true);

  assert.deepEqual([...result], [2, 3, 4]);
});

test('applyRangeSelection removes the selected range when unchecked', () => {
  const tabs = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  const result = applyRangeSelection(new Set([1, 2, 3]), tabs, 0, 1, false);

  assert.deepEqual([...result], [3]);
});

test('formatSelectedUrls preserves tab order and skips unselected tabs', () => {
  const tabs = [
    { id: 1, url: 'https://one.example' },
    { id: 2, url: 'https://two.example' },
    { id: 3, url: 'https://three.example' },
  ];

  const result = formatSelectedUrls(tabs, new Set([3, 1]));

  assert.equal(result, 'https://one.example\nhttps://three.example');
});

test('formatSelectedUrls skips selected tabs without a readable URL', () => {
  const tabs = [
    { id: 1, url: '' },
    { id: 2, url: 'https://two.example' },
  ];

  const result = formatSelectedUrls(tabs, new Set([1, 2]));

  assert.equal(result, 'https://two.example');
});

test('parseClipboardUrls extracts mixed lists, Markdown, HTML, JSON and CSV in order', () => {
  const text = `
    1. https://one.example/a
    [Two](https://two.example/b)
    <a href="https://three.example/?a=1&amp;b=2">Three</a>
    {"urls":["https:\\/\\/four.example\\/c","https://five.example/?a=1\\u0026b=2"]}
    https://six.example,https://seven.example;https://eight.example|https://nine.example
  `;

  assert.deepEqual(parseClipboardUrls(text), [
    'https://one.example/a',
    'https://two.example/b',
    'https://three.example/?a=1&b=2',
    'https://four.example/c',
    'https://five.example/?a=1&b=2',
    'https://six.example/',
    'https://seven.example/',
    'https://eight.example/',
    'https://nine.example/',
  ]);
});

test('parseClipboardUrls supplies HTTPS for domains and keeps duplicates', () => {
  assert.deepEqual(parseClipboardUrls('www.example.com/a\texample.org\nwww.example.com/a'), [
    'https://www.example.com/a',
    'https://example.org/',
    'https://www.example.com/a',
  ]);
});

test('parseClipboardUrls preserves URL punctuation, IPv6 and balanced parentheses', () => {
  assert.deepEqual(parseClipboardUrls(
    '(https://example.com/wiki/Title_(topic)). (https://example.com/one.) <http://[::1]:8080/a> '
    + 'https://example.org/a,b;c?x=1&next=https%3A%2F%2Fexample.net#part',
  ), [
    'https://example.com/wiki/Title_(topic)',
    'https://example.com/one',
    'http://[::1]:8080/a',
    'https://example.org/a,b;c?x=1&next=https%3A%2F%2Fexample.net#part',
  ]);
});

test('parseClipboardUrls ignores empty text, malformed URLs, email and unsupported schemes', () => {
  for (const text of [null, '', 'No links here', 'https:// https://. https://[bad]',
    'user@example.com javascript:alert(1) data:text/plain,hello ftp://example.com file:///tmp/test']) {
    assert.deepEqual(parseClipboardUrls(text), []);
  }
});

test('parseClipboardUrls decodes numeric HTML entities and JSON newline separators', () => {
  assert.deepEqual(parseClipboardUrls(
    'https://example.com/?a=1&#38;b=2\\nhttps://example.org/?a=1&#x26;b=2',
  ), ['https://example.com/?a=1&b=2', 'https://example.org/?a=1&b=2']);
});

test('parseClipboardUrls accepts URL labels and unquoted CSV host fields', () => {
  assert.deepEqual(parseClipboardUrls('URL:https://one.example\nhttps://two.example,Title\nexample.org;Title'), [
    'https://one.example/',
    'https://two.example/',
    'https://example.org/',
  ]);
});

test('parseClipboardUrls accepts protocol-relative HTML links and adjacent wrapped links', () => {
  assert.deepEqual(parseClipboardUrls('<a href="//example.com/path">Example</a> (https://one.example)(https://two.example)'), [
    'https://example.com/path',
    'https://one.example/',
    'https://two.example/',
  ]);
});

test('parseClipboardUrls preserves interior apostrophes and respects surrounding quotes', () => {
  assert.deepEqual(parseClipboardUrls(
    '<a href="https://example.com/wiki/O\'Reilly">Read</a> '
    + "'https://example.org/path' https://example.net/?name='O'Reilly",
  ), [
    "https://example.com/wiki/O'Reilly",
    'https://example.org/path',
    'https://example.net/?name=%27O%27Reilly',
  ]);
});

test('parseClipboardUrls extracts adjacent Markdown links', () => {
  assert.deepEqual(parseClipboardUrls('[One](https://one.example)[Two](https://two.example)'), [
    'https://one.example/',
    'https://two.example/',
  ]);
});
