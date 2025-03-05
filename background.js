let screenshots = [];
let intervalId = null;
let port = null;

// Keep alive connection
function keepAlive() {
  if (port) {
    port.disconnect();
  }
  port = chrome.runtime.connect({ name: 'keepAlive' });
  port.onDisconnect.addListener(keepAlive);
}

// Function to take screenshot
function takeScreenshot() {
  chrome.windows.getLastFocused({ populate: true }, async (window) => {
    try {
      const activeTab = window.tabs.find(tab => tab.active);
      
      if (activeTab && !activeTab.url.includes('chrome://')) {
        const image = await chrome.tabs.captureVisibleTab(window.id, {
          format: 'png'
        });

        const screenshot = {
          timestamp: new Date().toLocaleString(),
          image: image,
          url: activeTab.url
        };

        // Load existing screenshots and keep only the last 20
        const result = await chrome.storage.local.get('screenshots');
        let existingScreenshots = result.screenshots || [];
        existingScreenshots.push(screenshot);
        
        // Keep only the most recent 20 screenshots
        if (existingScreenshots.length > 20) {
          existingScreenshots = existingScreenshots.slice(-20);
        }

        // Save updated array
        await chrome.storage.local.set({ 'screenshots': existingScreenshots });
        console.log('Screenshot saved:', screenshot.timestamp);
        
        keepAlive();
      }
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  });
}
// Add this at the beginning of your background.js
const blockedKeywords = [
  'porn', 'xxx', 'adult', 'sex', 'nsfw', 'fuck','penis', 'vagina', 'ass','boobs','cock','dick','gay','pussy','fur','xnxx', 'imtlazarus','jesuitinas', 'management'
];

const whitelistedDomains = [
  'youtube.com',
  'youtu.be',
  'kahoot.it',
  'kahoot.com',
  'google.com',
  'google.es',
  'educaplay.com',
  'genially.com',
  'canva.com',
  'classroom.google.com'
];

function getDomain(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname.toLowerCase();
  } catch (e) {
    return '';
  }
}

function isBlockedURL(url) {
  const domain = getDomain(url);
  
  // Si el dominio está en la lista blanca, permitir acceso
  if (whitelistedDomains.some(whiteDomain => domain.includes(whiteDomain))) {
    return false;
  }
  
  // Verificar si el dominio contiene palabras bloqueadas
  return blockedKeywords.some(keyword => domain.includes(keyword));
}

// Add this listener for URL monitoring
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (isBlockedURL(details.url)) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL('access_deneid.html')
    });
  }
});

// Function to start screenshot timer
// ... existing code ...

// Change screenshot timer to 5 minutes
function startScreenshotTimer() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  takeScreenshot(); // Take initial screenshot
  intervalId = setInterval(takeScreenshot, 300000); // 5 minutes = 300000 ms
  keepAlive();
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'policies.html' });
});

// Start the screenshot process and keep it alive
chrome.runtime.onInstalled.addListener(startScreenshotTimer);
chrome.runtime.onStartup.addListener(startScreenshotTimer);

// Adjust keepAlive timer to match
chrome.runtime.onConnect.addListener(function(port) {
  if (port.name === 'keepAlive') {
    setTimeout(keepAlive, 250000); // Set to slightly less than 5 minutes
  }
});

// Initial start
startScreenshotTimer();