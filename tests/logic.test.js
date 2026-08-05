import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyRangeSelection,
  formatSelectedUrls,
  normalizeTabs,
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
