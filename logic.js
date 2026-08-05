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
