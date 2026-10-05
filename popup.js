import {
  applyRangeSelection,
  formatSelectedUrls,
  normalizeTabs,
} from './logic.js';

const elements = {
  allButton: document.querySelector('#all-button'),
  noneButton: document.querySelector('#none-button'),
  copyButton: document.querySelector('#copy-button'),
  count: document.querySelector('#count'),
  list: document.querySelector('#tab-list'),
  status: document.querySelector('#status'),
};

let tabs = [];
let selectedIds = new Set();
let anchorIndex = null;
let statusTimer = null;

function render() {
  const fragment = document.createDocumentFragment();

  if (tabs.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'NO TABS FOUND';
    fragment.append(emptyState);
  }

  tabs.forEach((tab, position) => {
    const row = document.createElement('label');
    row.className = 'tab-row';
    row.classList.toggle('is-selected', selectedIds.has(tab.id));
    row.classList.toggle('is-unavailable', !tab.url);
    row.title = tab.url || 'URL unavailable';

    const checkbox = document.createElement('input');
    checkbox.className = 'tab-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = selectedIds.has(tab.id);
    checkbox.dataset.position = String(position);
    checkbox.setAttribute('aria-label', `Select tab ${position + 1}: ${tab.title}`);
    checkbox.addEventListener('click', handleTabClick);

    const mark = document.createElement('span');
    mark.className = 'checkbox-mark';
    mark.setAttribute('aria-hidden', 'true');

    const number = document.createElement('span');
    number.className = 'tab-number';
    number.textContent = String(position + 1).padStart(2, '0');

    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title;

    row.append(checkbox, mark, number, title);
    fragment.append(row);
  });

  elements.list.replaceChildren(fragment);
  renderSelection();
}

function renderSelection() {
  for (const checkbox of elements.list.querySelectorAll('input[data-position]')) {
    const selected = selectedIds.has(tabs[Number(checkbox.dataset.position)].id);
    checkbox.checked = selected;
    checkbox.closest('.tab-row').classList.toggle('is-selected', selected);
  }
  elements.count.textContent = `${selectedIds.size} / ${tabs.length}`;

  elements.copyButton.disabled = !tabs.some((tab) => selectedIds.has(tab.id) && tab.url);
  elements.allButton.disabled = tabs.length === 0 || selectedIds.size === tabs.length;
  elements.noneButton.disabled = selectedIds.size === 0;
}

function handleTabClick(event) {
  const checkbox = event.currentTarget;
  const position = Number.parseInt(checkbox.dataset.position, 10);

  if (!Number.isInteger(position) || !tabs[position]) {
    return;
  }

  if (event.shiftKey && Number.isInteger(anchorIndex)) {
    selectedIds = applyRangeSelection(
      selectedIds,
      tabs,
      anchorIndex,
      position,
      checkbox.checked,
    );
  } else {
    if (checkbox.checked) {
      selectedIds.add(tabs[position].id);
    } else {
      selectedIds.delete(tabs[position].id);
    }
    anchorIndex = position;
  }

  renderSelection();
  checkbox.focus();
}

function selectAll() {
  selectedIds = new Set(tabs.map((tab) => tab.id));
  anchorIndex = null;
  renderSelection();
}

function selectNone() {
  selectedIds = new Set();
  anchorIndex = null;
  renderSelection();
}

async function copySelectedUrls() {
  const text = formatSelectedUrls(tabs, selectedIds);
  if (!text) {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showStatus(`COPIED ${text.split('\n').length}`);
  } catch (error) {
    console.error('Could not copy selected tab URLs.', error);
    showStatus('COPY FAILED');
  }
}

function showStatus(message) {
  window.clearTimeout(statusTimer);
  elements.status.textContent = message;
  elements.status.classList.remove('is-visible');
  void elements.status.offsetWidth;
  elements.status.classList.add('is-visible');

  statusTimer = window.setTimeout(() => {
    elements.status.textContent = '';
    elements.status.classList.remove('is-visible');
  }, 1400);
}

async function initialize() {
  try {
    const browserTabs = await chrome.tabs.query({ currentWindow: true });
    tabs = normalizeTabs(browserTabs);
    selectedIds = new Set(tabs.map((tab) => tab.id));
    render();
  } catch (error) {
    console.error('Could not read browser tabs.', error);
    elements.list.innerHTML = '<div class="empty-state">COULD NOT READ TABS</div>';
    showStatus('ERROR');
  }
}

elements.allButton.addEventListener('click', selectAll);
elements.noneButton.addEventListener('click', selectNone);
elements.copyButton.addEventListener('click', copySelectedUrls);

initialize();
