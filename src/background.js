
chrome.action.onClicked.addListener(async tab => {
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle-reader' });
  }
  catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle-reader' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-zoom') {
    chrome.tabs.getZoom(sender.tab.id, zoomFactor => {
      sendResponse({ zoomFactor });
    });
    return true;
  }

  if (message.action === 'set-icon') {
    const path = message.enabled
      ? { 16: 'icons/icon16-disable.png', 48: 'icons/icon48-disable.png', 128: 'icons/icon128-disable.png' }
      : { 16: 'icons/icon16.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' };
    chrome.action.setIcon({ tabId: sender.tab.id, path });
  }
});

chrome.tabs.onZoomChange.addListener(zoomChangeInfo => {
  chrome.tabs.sendMessage(zoomChangeInfo.tabId, {
    action: 'zoom-changed',
    zoomFactor: zoomChangeInfo.newZoomFactor,
  }).catch(() => {});
});

