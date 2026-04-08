
import { Readability } from '@mozilla/readability';


let readerActive = false;
let savedBody = null;
let savedStyleStates = [];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'toggle-reader') {
    if (readerActive) {
      exitReaderMode();
    }
    else {
      enterReaderMode();
    }
    sendResponse({ ok: true });
    return true;
  }

  if (message.action === 'zoom-changed') {
    if (readerActive) {
      applyInverseZoom(message.zoomFactor);
    }
  }
});

const applyInverseZoom = zoomFactor => {
  document.documentElement.style.zoom = zoomFactor ? 1 / zoomFactor : 1;
};

function enterReaderMode() {
  const docClone = document.cloneNode(true);
  const article = new Readability(docClone).parse();

  if (!article) {
    alert('Reader View: Could not extract article content from this page.');
    return;
  }

  // Disable all existing stylesheets so the page's CSS doesn't bleed in
  savedStyleStates = [];
  document.querySelectorAll('link[rel="stylesheet"], style').forEach(el => {
    savedStyleStates.push({ el, media: el.media });
    el.media = 'not all';
  });

  // Inject reader stylesheet
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.id = 'reader-view-css';
  link.href = chrome.runtime.getURL('reader.css');
  document.head.appendChild(link);

  // Build the reader body
  const newBody = document.createElement('body');
  newBody.id = 'reader-view-body';
  newBody.className = 'bg-stone-50';

  const container = document.createElement('div');
  container.id = 'reader-container';
  container.className = 'max-w-[80ch] mx-auto px-8 pt-12 pb-20';

  const header = document.createElement('div');
  header.id = 'reader-header';
  header.className = 'mb-8 pb-6 border-b border-stone-200';

  const title = document.createElement('h1');
  title.id = 'reader-title';
  title.className = 'font-sans text-[2rem] font-bold leading-snug text-gray-900 mb-2';
  title.textContent = article.title || document.title;
  header.appendChild(title);

  if (article.byline || article.publishedTime) {
    const meta = document.createElement('div');
    meta.id = 'reader-meta';
    meta.className = 'flex gap-4 font-sans text-sm text-gray-400';

    if (article.byline) {
      const byline = document.createElement('span');
      byline.className = 'font-bold';
      byline.id = 'reader-byline';
      byline.textContent = article.byline;
      meta.appendChild(byline);
    }

    if (article.publishedTime) {
      const date = document.createElement('span');
      date.id = 'reader-date';
      const parsed = new Date(article.publishedTime);
      date.textContent = isNaN(parsed)
        ? article.publishedTime
        : parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      meta.appendChild(date);
    }

    header.appendChild(meta);
  }

  container.appendChild(header);

  const content = document.createElement('div');
  content.id = 'reader-content';
  content.className = 'prose prose-xl';
  content.innerHTML = article.content;
  container.appendChild(content);

  newBody.appendChild(container);

  savedBody = document.body;
  document.body.replaceWith(newBody);

  readerActive = true;
  window.scrollTo(0, 0);

  chrome.runtime.sendMessage({ action: 'get-zoom' }, response => {
    if (response?.zoomFactor) {
      applyInverseZoom(response.zoomFactor);
    }
  });
}


function exitReaderMode() {
  // Remove reader stylesheet
  const link = document.getElementById('reader-view-css');
  if (link) link.remove();

  // Restore original stylesheets
  savedStyleStates.forEach(({ el, media }) => {
    el.media = media;
  });
  savedStyleStates = [];

  // Restore original body
  if (savedBody) {
    document.body.replaceWith(savedBody);
    savedBody = null;
  }

  document.documentElement.style.zoom = '';
  readerActive = false;
}
