const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4,8}$/;
export const STORAGE_KEY = 'mona-bookmarks';

export function normalizeUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return null;

  const trimmed = value.trim();
  const candidate = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : /^[a-z][a-z\d+.-]*:/i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function loadBookmarks(serialized) {
  if (typeof serialized !== 'string' || serialized.trim() === '') return [];

  try {
    const value = JSON.parse(serialized);
    if (!Array.isArray(value)) return [];

    return value.flatMap((bookmark) => {
      if (!bookmark || typeof bookmark !== 'object' || Array.isArray(bookmark)) return [];

      const url = normalizeUrl(bookmark.url);
      if (!url || typeof bookmark.slug !== 'string' || !SLUG_PATTERN.test(bookmark.slug)) return [];
      return [{ url, slug: bookmark.slug }];
    });
  } catch {
    return [];
  }
}

export function formatBookmark({ url, slug }) {
  return `${url} :: ${slug}`;
}

export function createSlug(random = Math.random) {
  let suffix = '';
  for (let index = 0; index < 6; index += 1) {
    suffix += BASE62[Math.floor(random() * BASE62.length)];
  }
  return `mona-${suffix}`;
}
