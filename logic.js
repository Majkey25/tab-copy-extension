export function normalizeTabs(tabs) {
  if (!Array.isArray(tabs)) {
    return [];
  }

  return tabs
    .filter((tab) => Number.isInteger(tab?.id) && Number.isInteger(tab?.index))
    .map((tab) => ({
      id: tab.id,
      index: tab.index,
      title: typeof tab.title === 'string' && tab.title.trim()
        ? tab.title.trim()
        : 'Untitled tab',
      url: typeof tab.url === 'string' && tab.url
        ? tab.url
        : typeof tab.pendingUrl === 'string'
          ? tab.pendingUrl
          : '',
    }))
    .sort((a, b) => a.index - b.index);
}

export function applyRangeSelection(
  selectedIds,
  tabs,
  anchorIndex,
  targetIndex,
  checked,
) {
  const next = new Set(selectedIds);

  if (
    !Array.isArray(tabs)
    || !Number.isInteger(anchorIndex)
    || !Number.isInteger(targetIndex)
  ) {
    return next;
  }

  const start = Math.max(0, Math.min(anchorIndex, targetIndex));
  const end = Math.min(tabs.length - 1, Math.max(anchorIndex, targetIndex));

  for (let index = start; index <= end; index += 1) {
    const tabId = tabs[index]?.id;
    if (!Number.isInteger(tabId)) {
      continue;
    }

    if (checked) {
      next.add(tabId);
    } else {
      next.delete(tabId);
    }
  }

  return next;
}

export function formatSelectedUrls(tabs, selectedIds) {
  if (!Array.isArray(tabs) || !(selectedIds instanceof Set)) {
    return '';
  }

  return tabs
    .filter((tab) => selectedIds.has(tab.id) && typeof tab.url === 'string' && tab.url)
    .map((tab) => tab.url)
    .join('\n');
}

export function parseClipboardUrls(text) {
  if (typeof text !== 'string') {
    return [];
  }
  if (text.length > 64 * 1024) {
    throw new RangeError('CLIPBOARD TOO LARGE (MAX 64K CHARACTERS)');
  }

  const entities = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  const decoded = text
    .replace(/\\u([\da-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/\\\//g, '/')
    .replace(/\\[nrt]/g, ' ')
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp|#\d+|#x[\da-f]+);/gi, (entity) => {
      const name = entity.slice(1, -1).toLowerCase();
      if (!name.startsWith('#')) {
        return entities[name];
      }
      const code = name.startsWith('#x')
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10);
      return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    });
  const domain = String.raw`(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,}`;
  const start = `(?:https?:\\/\\/|(?:\\/\\/)?${domain})`;
  const separated = decoded
    .replace(new RegExp(`[,;](?=${start})`, 'giu'), ' ')
    .replace(new RegExp(String.raw`([)\]}])(?=(?:\[[^\]\r\n]*\]\()?[(\[{]*${start})`, 'giu'), '$1 ');
  const candidates = separated.match(new RegExp(
    `(?:https?:\\/\\/|(?<![\\p{L}\\p{N}_@:/.-])(?:\\/\\/)?${domain})`
    + `(?:'(?=[\\p{L}\\p{N}])|[^\\s<>"'\x60|\\\\])*`,
    'giu',
  )) || [];
  const urls = [];

  for (let candidate of candidates) {
    candidate = candidate.replace(/^((?:(?:https?:)?\/\/)?[^/?#;,]+)[,;].*$/i, '$1');
    // shortcut: trailing punctuation is prose; percent-encode it inside a URL.
    candidate = candidate.replace(/[.,;!?]+$/g, '');
    for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
      let excess = 0;
      for (const character of candidate) {
        if (character === close) excess += 1;
        else if (character === open) excess -= 1;
      }
      let end = candidate.length;
      while (excess > 0 && candidate[end - 1] === close) { end -= 1; excess -= 1; }
      candidate = candidate.slice(0, end);
    }
    candidate = candidate.replace(/[.,;!?]+$/g, '');
    try {
      const url = new URL(/^https?:\/\//i.test(candidate)
        ? candidate : `https://${candidate.replace(/^\/\//, '')}`);
      if (['http:', 'https:'].includes(url.protocol) && url.hostname.replace(/\./g, '')) {
        urls.push(url.href);
      }
    } catch {
      // Ignore malformed URLs among the clipboard text.
    }
    if (urls.length > 100) {
      throw new RangeError('TOO MANY LINKS (MAX 100)');
    }
  }

  return urls;
}
