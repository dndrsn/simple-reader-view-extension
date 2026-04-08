
import { Readability } from '@mozilla/readability';


let readerActive = false;
let savedBody = null;
let savedStyleStates = [];

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action !== 'toggle-reader') return;

  if (readerActive) {
    exitReaderMode();
  }
  else {
    enterReaderMode();
  }

  sendResponse({ ok: true });
  return true;
});

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

  const container = document.createElement('div');
  container.id = 'reader-container';

  const title = document.createElement('h1');
  title.id = 'reader-title';
  title.textContent = article.title || document.title;
  container.appendChild(title);

  if (article.byline) {
    const byline = document.createElement('p');
    byline.id = 'reader-byline';
    byline.textContent = article.byline;
    container.appendChild(byline);
  }

  const content = document.createElement('div');
  content.id = 'reader-content';
  content.innerHTML = article.content;
  container.appendChild(content);

  newBody.appendChild(container);

  savedBody = document.body;
  document.body.replaceWith(newBody);

  readerActive = true;
  window.scrollTo(0, 0);
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

  readerActive = false;
}
