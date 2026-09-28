import { SAMPLE_PROMPTS, CONTENT_NICHES, VIDEO_FORMATS, TONE_STYLES } from './data/samplePrompts.js';
import { generateSeoResults } from './seoEngine.js';

// Constants
const STORAGE_KEY = 'social_video_seo_history_v1';

// Application State
const state = {
  prompt: 'Morning skincare routine for glass skin',
  platform: 'tiktok',
  niche: 'Beauty & Skincare',
  format: 'Reels / Shorts / TikTok (<60s)',
  tone: 'Engaging & Viral',
  isLoading: false,
  isGeneratingBatch: false,
  batchCount: 1,
  currentResult: null,
  history: [],
  activeResultTab: 'youtube',
  tagFilter: '',
};

// DOM Elements
const el = {
  // Inputs
  promptInput: document.getElementById('video-prompt'),
  charCounter: document.getElementById('char-counter'),
  clearPromptBtn: document.getElementById('clear-prompt-btn'),
  sampleChipsContainer: document.getElementById('sample-chips-container'),
  platformPills: document.querySelectorAll('.platform-pill'),
  nicheSelect: document.getElementById('niche-select'),
  formatSelect: document.getElementById('format-select'),
  toneSelect: document.getElementById('tone-select'),
  generateBtn: document.getElementById('generate-btn'),
  generateBtnText: document.getElementById('generate-btn-text'),
  generateBtnSpinner: document.getElementById('generate-btn-spinner'),
  
  // Results
  resultsContainer: document.getElementById('results-container'),
  summaryTopic: document.getElementById('summary-topic'),
  summaryText: document.getElementById('summary-text'),
  discoverabilityScoreValue: document.getElementById('discoverability-score-value'),
  scoreIntent: document.getElementById('score-intent'),
  scoreAlgorithm: document.getElementById('score-algorithm'),
  scoreTrend: document.getElementById('score-trend'),
  scoreComp: document.getElementById('score-comp'),
  barIntent: document.getElementById('bar-intent'),
  barAlgorithm: document.getElementById('bar-algorithm'),
  barTrend: document.getElementById('bar-trend'),
  barComp: document.getElementById('bar-comp'),
  
  // Results Subtabs
  resultSubtabs: document.querySelectorAll('.result-subtab-btn'),
  tabContentYouTube: document.getElementById('tab-content-youtube'),
  tabContentTikTok: document.getElementById('tab-content-tiktok'),
  tabContentInstagram: document.getElementById('tab-content-instagram'),
  tabContentFacebook: document.getElementById('tab-content-facebook'),
  tabContentExport: document.getElementById('tab-content-export'),

  // YouTube tab elements
  ytTagCountBadge: document.getElementById('yt-tag-count-badge'),
  ytCharCountText: document.getElementById('yt-char-count-text'),
  ytCharProgressBar: document.getElementById('yt-char-progress-bar'),
  ytTagsGrid: document.getElementById('yt-tags-grid'),
  copyYtTagsBtn: document.getElementById('copy-yt-tags-btn'),
  generateYtBatchBtn: document.getElementById('generate-yt-batch-btn'),
  generateYtBatchBtnText: document.getElementById('generate-yt-batch-text'),
  tagFilterInput: document.getElementById('tag-filter-input'),
  addTagForm: document.getElementById('add-tag-form'),
  addTagInput: document.getElementById('add-tag-input'),
  ytTitlesContainer: document.getElementById('yt-titles-container'),
  ytKeywordsTableBody: document.getElementById('yt-keywords-table-body'),
  ytDescriptionSnippet: document.getElementById('yt-description-snippet'),
  copyYtDescBtn: document.getElementById('copy-yt-desc-btn'),
  ytCategoryPill: document.getElementById('yt-category-pill'),

  // TikTok tab elements
  copyTikTokHashtagsBtn: document.getElementById('copy-tiktok-hashtags-btn'),
  tiktokHashtagCategories: document.getElementById('tiktok-hashtag-categories'),
  tiktokSearchQueries: document.getElementById('tiktok-search-queries'),
  tiktokHooksContainer: document.getElementById('tiktok-hooks-container'),
  tiktokSoundsContainer: document.getElementById('tiktok-sounds-container'),

  // Instagram tab elements
  copyIgHashtagsBtn: document.getElementById('copy-ig-hashtags-btn'),
  igHashtagTiers: document.getElementById('ig-hashtag-tiers'),
  igExploreKeywords: document.getElementById('ig-explore-keywords'),
  igAltText: document.getElementById('ig-alt-text'),
  copyIgAltBtn: document.getElementById('copy-ig-alt-btn'),
  igCaptionHook: document.getElementById('ig-caption-hook'),
  copyIgHookBtn: document.getElementById('copy-ig-hook-btn'),

  // Facebook tab elements
  copyFbTagsBtn: document.getElementById('copy-fb-tags-btn'),
  fbTopicTags: document.getElementById('fb-topic-tags'),
  fbHashtags: document.getElementById('fb-hashtags'),
  fbVideoTitle: document.getElementById('fb-video-title'),
  copyFbTitleBtn: document.getElementById('copy-fb-title-btn'),
  fbDiscoverabilityKw: document.getElementById('fb-discoverability-kw'),

  // Export elements
  downloadReportBtn: document.getElementById('download-report-btn'),
  copyBundleBtn: document.getElementById('copy-bundle-btn'),
  copyJsonBtn: document.getElementById('copy-json-btn'),
  exportRawPreview: document.getElementById('export-raw-preview'),

  // History Modal
  historyBtn: document.getElementById('history-btn'),
  historyCountBadge: document.getElementById('history-count-badge'),
  historyModal: document.getElementById('history-modal'),
  closeHistoryBtn: document.getElementById('close-history-btn'),
  clearHistoryBtn: document.getElementById('clear-history-btn'),
  historyModalSubtitle: document.getElementById('history-modal-subtitle'),
  historyList: document.getElementById('history-list'),

  // Toast
  toast: document.getElementById('toast-notification'),
  toastMessage: document.getElementById('toast-message'),
};

// Toast notification helper
let toastTimeout = null;
function showToast(message) {
  if (!el.toast || !el.toastMessage) return;
  el.toastMessage.textContent = message;
  el.toast.classList.remove('hidden');
  el.toast.classList.add('flex', 'animate-toast');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    el.toast.classList.add('hidden');
    el.toast.classList.remove('flex', 'animate-toast');
  }, 2200);
}

// Clipboard helper with toast feedback
function copyToClipboard(text, successToast = 'Copied to clipboard!') {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successToast);
    }).catch(() => {
      fallbackCopy(text, successToast);
    });
  } else {
    fallbackCopy(text, successToast);
  }
}

function fallbackCopy(text, successToast) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successToast);
  } catch (err) {
    console.error('Copy fallback failed', err);
  }
  document.body.removeChild(textArea);
}

// Initialize Dropdowns
function initDropdowns() {
  if (el.nicheSelect) {
    el.nicheSelect.innerHTML = CONTENT_NICHES.map(
      (n) => `<option value="${n}" ${n === state.niche ? 'selected' : ''}>${n}</option>`
    ).join('');
  }
  if (el.formatSelect) {
    el.formatSelect.innerHTML = VIDEO_FORMATS.map(
      (f) => `<option value="${f}" ${f === state.format ? 'selected' : ''}>${f}</option>`
    ).join('');
  }
  if (el.toneSelect) {
    el.toneSelect.innerHTML = TONE_STYLES.map(
      (t) => `<option value="${t}" ${t === state.tone ? 'selected' : ''}>${t}</option>`
    ).join('');
  }
}

// Initialize Sample Chips
function initSampleChips() {
  if (!el.sampleChipsContainer) return;
  el.sampleChipsContainer.innerHTML = SAMPLE_PROMPTS.map(
    (sample) => `
      <button
        type="button"
        data-id="${sample.id}"
        class="sample-chip text-xs px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 hover:border-slate-500 transition-all cursor-pointer whitespace-nowrap"
      >
        ${sample.title}
      </button>
    `
  ).join('');

  el.sampleChipsContainer.querySelectorAll('.sample-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id');
      const sample = SAMPLE_PROMPTS.find((s) => s.id === id);
      if (sample) {
        state.prompt = sample.prompt;
        state.niche = sample.niche;
        state.format = sample.format;
        state.platform = sample.platform;
        if (el.promptInput) el.promptInput.value = sample.prompt;
        if (el.nicheSelect) el.nicheSelect.value = sample.niche;
        if (el.formatSelect) el.formatSelect.value = sample.format;
        updateCharCounter();
        updatePlatformPills();
        showToast(`Loaded: ${sample.title}`);
      }
    });
  });
}

// Character counter update
function updateCharCounter() {
  if (!el.promptInput || !el.charCounter) return;
  const count = el.promptInput.value.length;
  el.charCounter.textContent = `${count} chars`;
}

// Update Platform Pills active state
function updatePlatformPills() {
  el.platformPills.forEach((pill) => {
    const p = pill.getAttribute('data-platform');
    if (p === state.platform) {
      pill.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700/60');
      pill.classList.add('bg-indigo-600', 'text-white', 'font-semibold', 'border-indigo-500', 'shadow-md', 'shadow-indigo-600/30');
    } else {
      pill.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700/60');
      pill.classList.remove('bg-indigo-600', 'text-white', 'font-semibold', 'border-indigo-500', 'shadow-md', 'shadow-indigo-600/30');
    }
  });
}

// History storage handling
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.history = parsed;
        updateHistoryCountBadge();
      }
    }
  } catch (err) {
    console.warn('Could not load history from localStorage', err);
  }
}

function saveToHistory(item) {
  state.history = [item, ...state.history.filter((h) => h.id !== item.id)].slice(0, 20);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
  } catch (err) {
    console.warn('Could not save history to localStorage', err);
  }
  updateHistoryCountBadge();
}

function updateHistoryCountBadge() {
  if (!el.historyCountBadge) return;
  const count = state.history.length;
  el.historyCountBadge.textContent = count > 0 ? count : '0';
  if (count > 0) {
    el.historyCountBadge.classList.remove('hidden');
  } else {
    el.historyCountBadge.classList.add('hidden');
  }
}

// Main Generate SEO Handler
async function handleGenerate() {
  const promptVal = el.promptInput ? el.promptInput.value.trim() : '';
  if (!promptVal || state.isLoading) return;

  state.isLoading = true;
  setGenerateButtonLoading(true);

  const isSamePrompt =
    state.currentResult &&
    state.currentResult.query.trim().toLowerCase() === promptVal.toLowerCase();
  const nextIteration = isSamePrompt ? state.batchCount + 1 : 1;
  const excludeTags = isSamePrompt
    ? state.currentResult?.allGeneratedTagsHistory || state.currentResult?.youtube?.tags || []
    : [];

  let resultData = null;

  try {
    // Attempt to call server API
    const response = await fetch('/api/generate-seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptVal,
        platform: state.platform,
        niche: state.niche,
        format: state.format,
        tone: state.tone,
        excludeTags,
        iteration: nextIteration,
      }),
    });

    if (response.ok) {
      resultData = await response.json();
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (err) {
    console.info('Using algorithmic SEO engine (client fallback):', err.message);
    // Instant seamless fallback to built-in algorithmic engine
    resultData = generateSeoResults(
      promptVal,
      state.platform,
      state.niche,
      state.format,
      state.tone,
      excludeTags,
      nextIteration
    );
  }

  const allTagsAccumulated = Array.from(
    new Set([...excludeTags, ...(resultData.youtube?.tags || [])])
  );

  const enrichedResult = {
    ...resultData,
    batchIndex: nextIteration,
    allGeneratedTagsHistory: allTagsAccumulated,
  };

  state.currentResult = enrichedResult;
  state.batchCount = nextIteration;
  saveToHistory(enrichedResult);

  // Set initial active subtab based on selected platform
  state.activeResultTab = state.platform === 'all' ? 'youtube' : state.platform;

  renderResults(enrichedResult);

  // Scroll to results smoothly
  setTimeout(() => {
    el.resultsContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  state.isLoading = false;
  setGenerateButtonLoading(false);
}

// Generate New Batch of 20 YouTube Tags (zero duplicates)
async function handleGenerateNewBatch() {
  if (!state.currentResult || state.isGeneratingBatch) return;

  state.isGeneratingBatch = true;
  if (el.generateYtBatchBtnText) el.generateYtBatchBtnText.textContent = 'Generating 20 New Tags...';

  const nextIteration = state.batchCount + 1;
  const excludeTags =
    state.currentResult.allGeneratedTagsHistory || state.currentResult.youtube?.tags || [];

  let resultData = null;
  try {
    const response = await fetch('/api/generate-seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: state.currentResult.query,
        platform: state.currentResult.platform,
        niche: state.currentResult.niche,
        format: state.currentResult.format,
        tone: state.currentResult.tone,
        excludeTags,
        iteration: nextIteration,
      }),
    });

    if (response.ok) {
      resultData = await response.json();
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (err) {
    console.info('Generating batch via fallback engine:', err.message);
    resultData = generateSeoResults(
      state.currentResult.query,
      state.currentResult.platform,
      state.currentResult.niche,
      state.currentResult.format,
      state.currentResult.tone,
      excludeTags,
      nextIteration
    );
  }

  const newBatchTags = resultData.youtube?.tags || [];
  const updatedAllHistory = Array.from(new Set([...excludeTags, ...newBatchTags]));

  const updatedResult = {
    ...state.currentResult,
    batchIndex: nextIteration,
    allGeneratedTagsHistory: updatedAllHistory,
    youtube: {
      ...state.currentResult.youtube,
      tags: newBatchTags,
      totalTagsCharCount: newBatchTags.join(', ').length,
      titleSuggestions: resultData.youtube?.titleSuggestions || state.currentResult.youtube.titleSuggestions,
    },
  };

  state.currentResult = updatedResult;
  state.batchCount = nextIteration;
  saveToHistory(updatedResult);

  renderYouTubeTab(updatedResult.youtube);
  renderExportTab(updatedResult);

  showToast(`Batch #${nextIteration}: 20 completely new unique tags generated!`);

  state.isGeneratingBatch = false;
  if (el.generateYtBatchBtnText) el.generateYtBatchBtnText.textContent = `Generate 20 New Tags (Batch #${nextIteration + 1})`;
}

function setGenerateButtonLoading(isLoading) {
  if (!el.generateBtn) return;
  if (isLoading) {
    el.generateBtn.disabled = true;
    el.generateBtn.classList.add('opacity-80', 'cursor-not-allowed');
    if (el.generateBtnSpinner) el.generateBtnSpinner.classList.remove('hidden');
    if (el.generateBtnText) el.generateBtnText.textContent = 'Analyzing Algorithm & Generating Tags...';
  } else {
    el.generateBtn.disabled = false;
    el.generateBtn.classList.remove('opacity-80', 'cursor-not-allowed');
    if (el.generateBtnSpinner) el.generateBtnSpinner.classList.add('hidden');
    if (el.generateBtnText) el.generateBtnText.textContent = 'Generate SEO Tags & Metadata';
  }
}

// Render Master Results
function renderResults(data) {
  if (!el.resultsContainer) return;
  el.resultsContainer.classList.remove('hidden');

  // Summary card
  if (el.summaryTopic) el.summaryTopic.textContent = `SEO Blueprint for: "${data.query}"`;
  if (el.summaryText) el.summaryText.textContent = data.summary;
  if (el.discoverabilityScoreValue) el.discoverabilityScoreValue.textContent = data.discoverabilityScore;

  // Breakdown bars
  const b = data.scoreBreakdown || { searchIntent: 95, algorithmAlignment: 94, trendRelevance: 91, competitionBalance: 93 };
  if (el.scoreIntent) el.scoreIntent.textContent = `${b.searchIntent}%`;
  if (el.scoreAlgorithm) el.scoreAlgorithm.textContent = `${b.algorithmAlignment}%`;
  if (el.scoreTrend) el.scoreTrend.textContent = `${b.trendRelevance}%`;
  if (el.scoreComp) el.scoreComp.textContent = `${b.competitionBalance}%`;

  if (el.barIntent) el.barIntent.style.width = `${b.searchIntent}%`;
  if (el.barAlgorithm) el.barAlgorithm.style.width = `${b.algorithmAlignment}%`;
  if (el.barTrend) el.barTrend.style.width = `${b.trendRelevance}%`;
  if (el.barComp) el.barComp.style.width = `${b.competitionBalance}%`;

  // Render individual views
  if (data.youtube) renderYouTubeTab(data.youtube);
  if (data.tiktok) renderTikTokTab(data.tiktok);
  if (data.instagram) renderInstagramTab(data.instagram);
  if (data.facebook) renderFacebookTab(data.facebook);
  renderExportTab(data);

  // Activate subtab
  switchResultSubtab(state.activeResultTab);
}

// Render YouTube Tab
function renderYouTubeTab(yt) {
  if (!yt) return;
  const tags = yt.tags || [];
  const tagsStr = tags.join(', ');
  const charLen = tagsStr.length;

  if (el.ytTagCountBadge) el.ytTagCountBadge.textContent = `${tags.length} / 20 Tags`;
  if (el.ytCharCountText) el.ytCharCountText.textContent = `${charLen} / 500 chars`;
  if (el.ytCharProgressBar) {
    const pct = Math.min(100, Math.round((charLen / 500) * 100));
    el.ytCharProgressBar.style.width = `${pct}%`;
    if (charLen > 500) {
      el.ytCharProgressBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-red-500';
    } else if (charLen > 460) {
      el.ytCharProgressBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-amber-400';
    } else {
      el.ytCharProgressBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-indigo-500';
    }
  }

  if (el.generateYtBatchBtnText) {
    el.generateYtBatchBtnText.textContent = `Generate 20 New Tags (Batch #${(state.batchCount || 1) + 1})`;
  }

  // Filter & Render Tags Grid
  renderYtTagsGrid(tags);

  // Title Suggestions
  if (el.ytTitlesContainer) {
    el.ytTitlesContainer.innerHTML = (yt.titleSuggestions || []).map((title, idx) => `
      <div class="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#0c121e] border border-slate-800/80 hover:border-slate-700 transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
            ${idx + 1}
          </span>
          <span class="text-sm text-slate-100 font-medium truncate">${title}</span>
        </div>
        <button
          type="button"
          data-copy="${title.replace(/"/g, '&quot;')}"
          class="copy-item-btn p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs transition-all cursor-pointer shrink-0 border border-slate-700/60"
          title="Copy Title"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>
    `).join('');

    el.ytTitlesContainer.querySelectorAll('.copy-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        copyToClipboard(text, 'Copied title suggestion!');
      });
    });
  }

  // Target Keywords Table
  if (el.ytKeywordsTableBody) {
    el.ytKeywordsTableBody.innerHTML = (yt.targetKeywords || []).map((k) => `
      <tr class="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors">
        <td class="py-3 px-4 text-sm font-semibold text-slate-100 flex items-center justify-between gap-2">
          <span>${k.keyword}</span>
          <button
            type="button"
            data-copy="${k.keyword}"
            class="copy-item-btn text-slate-400 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
            title="Copy keyword"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
        </td>
        <td class="py-3 px-4">
          <span class="text-xs px-2.5 py-1 rounded-lg ${getVolumeBadgeClass(k.searchVolume)} font-medium">
            ${k.searchVolume}
          </span>
        </td>
        <td class="py-3 px-4">
          <span class="text-xs px-2.5 py-1 rounded-lg ${getCompBadgeClass(k.competition)} font-medium">
            ${k.competition}
          </span>
        </td>
        <td class="py-3 px-4">
          <span class="text-xs text-slate-300 capitalize bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
            ${k.type}
          </span>
        </td>
      </tr>
    `).join('');

    el.ytKeywordsTableBody.querySelectorAll('.copy-item-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        copyToClipboard(btn.getAttribute('data-copy'), 'Copied keyword!');
      });
    });
  }

  // Description snippet
  if (el.ytDescriptionSnippet) el.ytDescriptionSnippet.value = yt.descriptionSnippet || '';

  // Category recommendation
  if (el.ytCategoryPill) el.ytCategoryPill.textContent = yt.categoryRecommendation || state.niche;
}

function renderYtTagsGrid(tags) {
  if (!el.ytTagsGrid) return;
  const filter = (state.tagFilter || '').toLowerCase().trim();
  const visibleTags = filter
    ? tags.filter((t) => t.toLowerCase().includes(filter))
    : tags;

  if (visibleTags.length === 0) {
    el.ytTagsGrid.innerHTML = `
      <div class="col-span-full py-6 text-center text-xs text-slate-400">
        No tags match "${filter}". Try a different filter or add a custom tag.
      </div>
    `;
    return;
  }

  el.ytTagsGrid.innerHTML = visibleTags.map((tag, idx) => `
    <div class="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0c121e] border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all">
      <div class="flex items-center gap-2 min-w-0 flex-1 cursor-pointer copy-single-tag" data-tag="${tag}">
        <span class="text-xs font-mono text-indigo-400/60 select-none">${idx + 1}.</span>
        <span class="text-xs font-semibold text-slate-200 truncate">${tag}</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button
          type="button"
          data-tag="${tag}"
          class="copy-single-tag p-1 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          title="Click to copy tag"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
        <button
          type="button"
          data-remove="${tag}"
          class="remove-tag-btn p-1 text-red-400/40 hover:text-red-400 transition-colors cursor-pointer"
          title="Remove tag"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  `).join('');

  // Attach event handlers
  el.ytTagsGrid.querySelectorAll('.copy-single-tag').forEach((item) => {
    item.addEventListener('click', () => {
      const tag = item.getAttribute('data-tag');
      copyToClipboard(tag, `Copied: "${tag}"`);
    });
  });

  el.ytTagsGrid.querySelectorAll('.remove-tag-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tagToRemove = btn.getAttribute('data-remove');
      if (state.currentResult && state.currentResult.youtube) {
        state.currentResult.youtube.tags = state.currentResult.youtube.tags.filter((t) => t !== tagToRemove);
        renderYouTubeTab(state.currentResult.youtube);
        renderExportTab(state.currentResult);
        showToast(`Removed tag: "${tagToRemove}"`);
      }
    });
  });
}

function getVolumeBadgeClass(vol) {
  switch (vol) {
    case 'Very High':
      return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40';
    case 'High':
      return 'bg-sky-500/20 text-sky-300 border border-sky-500/40';
    case 'Medium':
      return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700/60';
  }
}

function getCompBadgeClass(comp) {
  switch (comp) {
    case 'Low':
      return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'Medium':
      return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
    default:
      return 'bg-red-500/15 text-red-400 border border-red-500/30';
  }
}

// Render TikTok Tab
function renderTikTokTab(tt) {
  if (!tt || !el.tiktokHashtagCategories) return;

  const categories = ['Trending', 'Niche', 'Broad', 'Community'];
  el.tiktokHashtagCategories.innerHTML = categories.map((cat) => {
    const list = (tt.hashtags || []).filter((h) => h.category === cat);
    if (list.length === 0) return '';
    return `
      <div class="bg-[#0c121e] rounded-xl p-4 border border-slate-800/80">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold uppercase tracking-wider ${getCategoryHeaderColor(cat)}">${cat} Hashtags</span>
          <span class="text-xs text-slate-400">${list.length} tags</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${list.map((h) => `
            <button
              type="button"
              data-copy="${h.tag}"
              class="copy-item-btn text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-cyan-200 border border-slate-700/60 transition-all cursor-pointer font-medium"
            >
              ${h.tag}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  // Search queries
  if (el.tiktokSearchQueries) {
    el.tiktokSearchQueries.innerHTML = (tt.searchBarKeywords || []).map((q) => `
      <div class="flex items-center justify-between p-3 rounded-xl bg-[#0c121e] border border-slate-800/80">
        <span class="text-xs sm:text-sm text-slate-200">🔍 "${q}"</span>
        <button
          type="button"
          data-copy="${q}"
          class="copy-item-btn p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Copy search query"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>
    `).join('');
  }

  // Video hooks
  if (el.tiktokHooksContainer) {
    el.tiktokHooksContainer.innerHTML = (tt.videoHooks || []).map((hook, idx) => `
      <div class="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800/80 flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
          <p class="text-xs sm:text-sm text-slate-100 font-medium">"${hook}"</p>
        </div>
        <button
          type="button"
          data-copy="${hook.replace(/"/g, '&quot;')}"
          class="copy-item-btn text-cyan-400 hover:text-cyan-300 p-1 transition-colors cursor-pointer shrink-0"
          title="Copy Hook"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </button>
      </div>
    `).join('');
  }

  // Sounds
  if (el.tiktokSoundsContainer) {
    el.tiktokSoundsContainer.innerHTML = (tt.soundKeywords || []).map((snd) => `
      <span class="text-xs px-3 py-1.5 rounded-xl bg-[#0c121e] text-slate-200 border border-slate-800 font-medium">
        🎵 ${snd}
      </span>
    `).join('');
  }

  // Wire up copy buttons
  el.tabContentTikTok.querySelectorAll('.copy-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      copyToClipboard(btn.getAttribute('data-copy'), 'Copied to clipboard!');
    });
  });
}

function getCategoryHeaderColor(cat) {
  switch (cat) {
    case 'Trending': return 'text-amber-400';
    case 'Niche': return 'text-indigo-400';
    case 'Broad': return 'text-cyan-400';
    default: return 'text-emerald-400';
  }
}

// Render Instagram Tab
function renderInstagramTab(ig) {
  if (!ig || !el.igHashtagTiers) return;
  const tiers = ['High-Volume', 'Mid-Volume', 'Hyper-Niche'];

  el.igHashtagTiers.innerHTML = tiers.map((tier) => {
    const list = (ig.hashtags || []).filter((h) => h.tier === tier);
    if (list.length === 0) return '';
    return `
      <div class="bg-[#0c121e] rounded-xl p-4 border border-slate-800/80">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-pink-400">${tier}</span>
          <span class="text-xs text-pink-300/60">${list.length} tags</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${list.map((h) => `
            <button
              type="button"
              data-copy="${h.tag}"
              class="copy-item-btn text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-pink-500 hover:text-white text-pink-200 border border-slate-700/60 transition-all cursor-pointer font-medium"
            >
              ${h.tag}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  if (el.igExploreKeywords) {
    el.igExploreKeywords.innerHTML = (ig.exploreKeywords || []).map((kw) => `
      <span class="text-xs px-3 py-1.5 rounded-xl bg-[#0c121e] text-pink-300 border border-slate-800 font-medium cursor-pointer copy-item-btn" data-copy="${kw}">
        ✨ ${kw}
      </span>
    `).join('');
  }

  if (el.igAltText) el.igAltText.textContent = ig.altTextSEO || '';
  if (el.igCaptionHook) el.igCaptionHook.textContent = ig.captionHook || '';

  el.tabContentInstagram.querySelectorAll('.copy-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      copyToClipboard(btn.getAttribute('data-copy'), 'Copied to clipboard!');
    });
  });
}

// Render Facebook Tab
function renderFacebookTab(fb) {
  if (!fb) return;

  if (el.fbTopicTags) {
    el.fbTopicTags.innerHTML = (fb.topicTags || []).map((t) => `
      <span class="text-xs px-3 py-1.5 rounded-xl bg-[#0c121e] text-blue-300 border border-slate-800 font-medium cursor-pointer copy-item-btn" data-copy="${t}">
        🏷️ ${t}
      </span>
    `).join('');
  }

  if (el.fbHashtags) {
    el.fbHashtags.innerHTML = (fb.hashtags || []).map((h) => `
      <span class="text-xs px-3 py-1.5 rounded-xl bg-[#0c121e] text-blue-200 border border-slate-800 font-medium cursor-pointer copy-item-btn" data-copy="${h}">
        ${h}
      </span>
    `).join('');
  }

  if (el.fbVideoTitle) el.fbVideoTitle.textContent = fb.videoTitle || '';

  if (el.fbDiscoverabilityKw) {
    el.fbDiscoverabilityKw.innerHTML = (fb.discoverabilityKeywords || []).map((kw) => `
      <span class="text-xs px-3 py-1.5 rounded-xl bg-[#0c121e] text-slate-300 border border-slate-800 font-medium cursor-pointer copy-item-btn" data-copy="${kw}">
        🔍 ${kw}
      </span>
    `).join('');
  }

  el.tabContentFacebook.querySelectorAll('.copy-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      copyToClipboard(btn.getAttribute('data-copy'), 'Copied to clipboard!');
    });
  });
}

// Render Export Tab
function renderExportTab(data) {
  if (!el.exportRawPreview || !data) return;

  const bundle = generateFullReportString(data);
  el.exportRawPreview.value = bundle;
}

function generateFullReportString(data) {
  let content = `SOCIAL VIDEO SEO & TAG REPORT\nGenerated on: ${new Date(data.timestamp || Date.now()).toLocaleString()}\nTopic: ${data.query}\nNiche: ${data.niche}\nFormat: ${data.format}\nScore: ${data.discoverabilityScore}/100\n\n` +
    `STRATEGY SUMMARY:\n${data.summary}\n\n` +
    `==================== YOUTUBE ====================\n` +
    `Video Tags (Comma-Separated):\n${data.youtube?.tags?.join(', ') || ''}\n\n` +
    `Title Formulas:\n${(data.youtube?.titleSuggestions || []).map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n` +
    `Keywords:\n${(data.youtube?.targetKeywords || []).map((k) => `- ${k.keyword} [Volume: ${k.searchVolume}, Comp: ${k.competition}]`).join('\n')}\n\n` +
    `Description Template:\n${data.youtube?.descriptionSnippet || ''}\n\n` +
    `==================== TIKTOK ====================\n` +
    `Hashtags:\n${(data.tiktok?.hashtags || []).map((h) => `${h.tag} (${h.category})`).join('\n')}\n\n` +
    `Search Bar Keywords:\n${data.tiktok?.searchBarKeywords?.join(', ') || ''}\n\n` +
    `Hooks:\n${(data.tiktok?.videoHooks || []).map((h, i) => `${i + 1}. "${h}"`).join('\n')}\n\n` +
    `==================== INSTAGRAM ====================\n` +
    `Hashtag Bundle:\n${(data.instagram?.hashtags || []).map((h) => `${h.tag} [${h.tier}]`).join(' ')}\n\n` +
    `Alt-Text SEO:\n${data.instagram?.altTextSEO || ''}\n\n` +
    `==================== FACEBOOK ====================\n` +
    `Topic Tags:\n${data.facebook?.topicTags?.join(', ') || ''}\n\n` +
    `Video Title:\n${data.facebook?.videoTitle || ''}\n`;

  return content;
}

// Subtab switcher
function switchResultSubtab(tabName) {
  state.activeResultTab = tabName;
  el.resultSubtabs.forEach((tab) => {
    const t = tab.getAttribute('data-subtab');
    if (t === tabName) {
      tab.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700/60');
      tab.classList.add('bg-indigo-600', 'text-white', 'font-semibold', 'border-indigo-500', 'shadow-md', 'shadow-indigo-600/30');
    } else {
      tab.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700/60');
      tab.classList.remove('bg-indigo-600', 'text-white', 'font-semibold', 'border-indigo-500', 'shadow-md', 'shadow-indigo-600/30');
    }
  });

  const tabMap = {
    youtube: el.tabContentYouTube,
    tiktok: el.tabContentTikTok,
    instagram: el.tabContentInstagram,
    facebook: el.tabContentFacebook,
    export: el.tabContentExport,
  };

  Object.entries(tabMap).forEach(([name, elem]) => {
    if (elem) {
      if (name === tabName) {
        elem.classList.remove('hidden');
      } else {
        elem.classList.add('hidden');
      }
    }
  });
}

// History Modal Render
function openHistoryModal() {
  if (!el.historyModal) return;
  renderHistoryModalContent();
  el.historyModal.classList.remove('hidden');
  el.historyModal.classList.add('flex');
}

function closeHistoryModal() {
  if (!el.historyModal) return;
  el.historyModal.classList.add('hidden');
  el.historyModal.classList.remove('flex');
}

function renderHistoryModalContent() {
  if (!el.historyList) return;
  if (el.historyModalSubtitle) {
    el.historyModalSubtitle.textContent = `${state.history.length} saved video keyword & tag reports`;
  }

  if (state.history.length === 0) {
    el.historyList.innerHTML = `
      <div class="py-12 text-center text-slate-400">
        <p class="text-sm">No saved SEO reports yet.</p>
        <p class="text-xs text-slate-500 mt-1">Generated tag bundles will appear here automatically.</p>
      </div>
    `;
    return;
  }

function getPlatformBadge(platform) {
  switch ((platform || '').toLowerCase()) {
    case 'youtube':
      return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/><path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF"/></svg>
        YouTube
      </span>`;
    case 'tiktok':
      return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.891-2.89 2.896 2.896 0 0 1 2.891-2.892c.38 0 .744.075 1.08.213V9.432a6.34 6.34 0 0 0-1.08-.093 6.345 6.345 0 0 0-6.336 6.337 6.345 6.345 0 0 0 6.336 6.336 6.345 6.345 0 0 0 6.336-6.336V8.452a8.214 8.214 0 0 0 4.97 1.674V6.686z" fill="#00F2FE"/><path d="M16.69 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-.896v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.891-2.89 2.896 2.896 0 0 1 2.891-2.892c.38 0 .744.075 1.08.213V9.432a6.34 6.34 0 0 0-1.08-.093 6.345 6.345 0 0 0-6.336 6.337 6.345 6.345 0 0 0 6.336 6.336 6.345 6.345 0 0 0 6.336-6.336V8.452a8.214 8.214 0 0 0 4.97 1.674V6.686z" fill="#FE2C55"/><path d="M17.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-2.545v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.891-2.89 2.896 2.896 0 0 1 2.891-2.892c.38 0 .744.075 1.08.213V9.432a6.34 6.34 0 0 0-1.08-.093 6.345 6.345 0 0 0-6.336 6.337 6.345 6.345 0 0 0 6.336 6.336 6.345 6.345 0 0 0 6.336-6.336V8.452a8.214 8.214 0 0 0 4.97 1.674V6.686z" fill="#FFFFFF"/></svg>
        TikTok
      </span>`;
    case 'instagram':
      return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24"><defs><linearGradient id="igHistItemGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fa7e1e"/><stop offset="25%" stop-color="#f44336"/><stop offset="50%" stop-color="#e91e63"/><stop offset="75%" stop-color="#9c27b0"/><stop offset="100%" stop-color="#4a148c"/></linearGradient></defs><rect width="24" height="24" rx="6" fill="url(#igHistItemGrad)"/><path d="M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.2a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4zm5.7-7.4a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0zM17.8 4.2H6.2A4.2 4.2 0 0 0 2 8.4v7.4a4.2 4.2 0 0 0 4.2 4.2h11.6a4.2 4.2 0 0 0 4.2-4.2V8.4a4.2 4.2 0 0 0-4.2-4.2zm2.4 11.6a2.4 2.4 0 0 1-2.4 2.4H6.2a2.4 2.4 0 0 1-2.4-2.4V8.4a2.4 2.4 0 0 1 2.4-2.4h11.6a2.4 2.4 0 0 1 2.4 2.4v7.4z" fill="#ffffff"/></svg>
        Instagram
      </span>`;
    case 'facebook':
      return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M15.12 12.63l.4-2.61h-2.51V8.33c0-.72.35-1.42 1.48-1.42h1.15V4.69c-.7-.09-1.42-.14-2.13-.14-2.17 0-3.59 1.32-3.59 3.69v1.78H7.13v2.61h2.29V19.5c.46.07.93.11 1.4.11s.94-.04 1.4-.11v-6.87h2.9z" fill="#FFFFFF"/></svg>
        Facebook
      </span>`;
    default:
      return `<span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        <svg class="w-3.5 h-3.5 shrink-0 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        All Platforms
      </span>`;
  }
}

  el.historyList.innerHTML = state.history.map((item) => `
    <div
      class="history-item p-4 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all flex items-center justify-between gap-4 group cursor-pointer"
      data-id="${item.id}"
    >
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          ${getPlatformBadge(item.platform)}
          <span class="text-xs text-slate-400">
            Score: <strong class="text-indigo-400">${item.discoverabilityScore || 94}</strong>/100
          </span>
          <span class="text-xs text-slate-500">
            • ${new Date(item.timestamp).toLocaleDateString()}
          </span>
        </div>
        <h4 class="text-sm font-semibold text-slate-100 truncate">${item.query}</h4>
        <p class="text-xs text-slate-400 truncate mt-0.5">${item.summary || ''}</p>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          data-delete-id="${item.id}"
          class="delete-history-btn p-2 text-red-400/40 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
          title="Delete item"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  `).join('');

  el.historyList.querySelectorAll('.history-item').forEach((row) => {
    row.addEventListener('click', (e) => {
      // Don't trigger if clicked delete
      if (e.target.closest('.delete-history-btn')) return;
      const id = row.getAttribute('data-id');
      const found = state.history.find((h) => h.id === id);
      if (found) {
        state.currentResult = found;
        state.prompt = found.query;
        state.platform = found.platform || 'all';
        state.niche = found.niche || 'General Content';
        state.format = found.format || 'Reels / Shorts / TikTok (<60s)';
        state.tone = found.tone || 'Engaging & Viral';
        if (el.promptInput) el.promptInput.value = found.query;
        if (el.nicheSelect) el.nicheSelect.value = state.niche;
        if (el.formatSelect) el.formatSelect.value = state.format;
        if (el.toneSelect) el.toneSelect.value = state.tone;
        updateCharCounter();
        updatePlatformPills();
        renderResults(found);
        closeHistoryModal();
        showToast('Restored report from history');
      }
    });
  });

  el.historyList.querySelectorAll('.delete-history-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-delete-id');
      state.history = state.history.filter((h) => h.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
      } catch (err) {}
      updateHistoryCountBadge();
      renderHistoryModalContent();
      showToast('Deleted history item');
    });
  });
}

// Event Listeners Initialization
function setupEventListeners() {
  // Prompt text & char count
  el.promptInput?.addEventListener('input', updateCharCounter);

  el.clearPromptBtn?.addEventListener('click', () => {
    if (el.promptInput) {
      el.promptInput.value = '';
      updateCharCounter();
      el.promptInput.focus();
    }
  });

  // Platform pills
  el.platformPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      state.platform = pill.getAttribute('data-platform');
      updatePlatformPills();
    });
  });

  // Select dropdowns
  el.nicheSelect?.addEventListener('change', (e) => {
    state.niche = e.target.value;
  });
  el.formatSelect?.addEventListener('change', (e) => {
    state.format = e.target.value;
  });
  el.toneSelect?.addEventListener('change', (e) => {
    state.tone = e.target.value;
  });

  // Generate Button
  el.generateBtn?.addEventListener('click', handleGenerate);

  // Result Subtabs
  el.resultSubtabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const subtab = tab.getAttribute('data-subtab');
      switchResultSubtab(subtab);
    });
  });

  // YouTube Tab Actions
  el.copyYtTagsBtn?.addEventListener('click', () => {
    if (!state.currentResult?.youtube?.tags) return;
    const str = state.currentResult.youtube.tags.join(', ');
    copyToClipboard(str, 'Copied all 20 YouTube Tags (comma-separated)!');
  });

  el.generateYtBatchBtn?.addEventListener('click', handleGenerateNewBatch);

  el.tagFilterInput?.addEventListener('input', (e) => {
    state.tagFilter = e.target.value;
    if (state.currentResult?.youtube?.tags) {
      renderYtTagsGrid(state.currentResult.youtube.tags);
    }
  });

  el.addTagForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tag = (el.addTagInput?.value || '').trim().replace(/^#/, '');
    if (!tag || !state.currentResult?.youtube) return;

    if (!state.currentResult.youtube.tags.includes(tag)) {
      state.currentResult.youtube.tags.push(tag);
      renderYouTubeTab(state.currentResult.youtube);
      renderExportTab(state.currentResult);
      showToast(`Added custom tag: "${tag}"`);
    }
    if (el.addTagInput) el.addTagInput.value = '';
  });

  el.copyYtDescBtn?.addEventListener('click', () => {
    const text = el.ytDescriptionSnippet?.value || '';
    copyToClipboard(text, 'Copied optimized description snippet!');
  });

  // TikTok Tab Actions
  el.copyTikTokHashtagsBtn?.addEventListener('click', () => {
    if (!state.currentResult?.tiktok?.hashtags) return;
    const str = state.currentResult.tiktok.hashtags.map((h) => h.tag).join(' ');
    copyToClipboard(str, 'Copied all TikTok Hashtags!');
  });

  // Instagram Tab Actions
  el.copyIgHashtagsBtn?.addEventListener('click', () => {
    if (!state.currentResult?.instagram?.hashtags) return;
    const str = state.currentResult.instagram.hashtags.map((h) => h.tag).join(' ');
    copyToClipboard(str, 'Copied all Instagram Reels Hashtags!');
  });

  el.copyIgAltBtn?.addEventListener('click', () => {
    const alt = state.currentResult?.instagram?.altTextSEO || '';
    copyToClipboard(alt, 'Copied visual AI alt-text!');
  });

  el.copyIgHookBtn?.addEventListener('click', () => {
    const hook = state.currentResult?.instagram?.captionHook || '';
    copyToClipboard(hook, 'Copied caption hook!');
  });

  // Facebook Tab Actions
  el.copyFbTagsBtn?.addEventListener('click', () => {
    if (!state.currentResult?.facebook) return;
    const tags = [
      ...(state.currentResult.facebook.topicTags || []),
      ...(state.currentResult.facebook.hashtags || []),
    ].join(', ');
    copyToClipboard(tags, 'Copied Facebook Tags & Hashtags!');
  });

  el.copyFbTitleBtn?.addEventListener('click', () => {
    const title = state.currentResult?.facebook?.videoTitle || '';
    copyToClipboard(title, 'Copied Facebook Video Title!');
  });

  // Export Tab Actions
  el.copyBundleBtn?.addEventListener('click', () => {
    if (!state.currentResult) return;
    const report = generateFullReportString(state.currentResult);
    copyToClipboard(report, 'Copied complete SEO bundle!');
  });

  el.copyJsonBtn?.addEventListener('click', () => {
    if (!state.currentResult) return;
    const jsonStr = JSON.stringify(state.currentResult, null, 2);
    copyToClipboard(jsonStr, 'Copied SEO JSON data!');
  });

  el.downloadReportBtn?.addEventListener('click', () => {
    if (!state.currentResult) return;
    const report = generateFullReportString(state.currentResult);
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-seo-${state.currentResult.query.slice(0, 20).replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('SEO Report downloaded!');
  });

  // History Modal
  el.historyBtn?.addEventListener('click', openHistoryModal);
  el.closeHistoryBtn?.addEventListener('click', closeHistoryModal);
  el.historyModal?.addEventListener('click', (e) => {
    if (e.target === el.historyModal) closeHistoryModal();
  });

  el.clearHistoryBtn?.addEventListener('click', () => {
    state.history = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    updateHistoryCountBadge();
    renderHistoryModalContent();
    showToast('All history cleared');
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHistoryModal();
  });
}

// Initial Boot
function initApp() {
  initDropdowns();
  initSampleChips();
  updateCharCounter();
  updatePlatformPills();
  loadHistory();
  setupEventListeners();

  // Auto-generate initial sample so the screen immediately displays rich results!
  handleGenerate();
}

// DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
