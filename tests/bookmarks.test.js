import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBookmark, loadBookmarks, normalizeUrl } from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https to the same saved value', () => {
  assert.equal(normalizeUrl('https://www.example.com'), 'https://www.example.com/');
  assert.equal(normalizeUrl('www.example.com'), normalizeUrl('https://www.example.com'));
  assert.equal(normalizeUrl('localhost:4321'), 'https://localhost:4321/');
  assert.equal(normalizeUrl('localhost:4321/path'), 'https://localhost:4321/path');
  assert.equal(normalizeUrl('example.com:443'), normalizeUrl('https://example.com:443'));
  assert.equal(normalizeUrl('example'), null);
});

test('recovers from empty, corrupted, legacy, and non-array storage values', () => {
  for (const serialized of ['', '   ', '{broken json', '{"url":"https://example.com"}', '"legacy value"', 'null', '42']) {
    assert.deepEqual(loadBookmarks(serialized), []);
  }
  assert.deepEqual(loadBookmarks(null), []);
});

test('drops malformed stored records and returns only validated bookmark fields', () => {
  assert.deepEqual(
    loadBookmarks(JSON.stringify([
      { url: 'www.example.com', slug: 'mona-7fk2', extra: 'ignored' },
      { url: 'javascript:alert(1)', slug: 'mona-safe' },
      { url: 'https://example.net', slug: 'not-a-slug' },
      null,
    ])),
    [{ url: 'https://www.example.com/', slug: 'mona-7fk2' }],
  );
});

test('formats a bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});
