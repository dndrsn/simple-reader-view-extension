
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
});

chrome.tabs.onZoomChange.addListener(zoomChangeInfo => {
  chrome.tabs.sendMessage(zoomChangeInfo.tabId, {
    action: 'zoom-changed',
    zoomFactor: zoomChangeInfo.newZoomFactor,
  }).catch(() => {});
});

