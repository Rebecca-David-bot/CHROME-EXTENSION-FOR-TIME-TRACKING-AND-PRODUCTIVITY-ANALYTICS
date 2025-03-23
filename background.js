let activeTabId = null;
let tabStartTime = null;
let siteUsage = {}; // Stores time spent on each domain

// Function to get domain from a URL
function getDomain(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return null;
    }
}

// Listener for tab activation (switching between tabs)
chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeTabId) updateSiteTime(activeTabId); // Update time for previous tab
    activeTabId = activeInfo.tabId;
    tabStartTime = Date.now();
});

// Listener for tab updates (navigating to a new page)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabId === activeTabId && changeInfo.url) {
        updateSiteTime(tabId);
        tabStartTime = Date.now();
    }
});

// Listener for when the browser window loses focus
chrome.windows.onFocusChanged.addListener(windowId => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        updateSiteTime(activeTabId);
        activeTabId = null;
    }
});

// Listener for browser shutdown or extension removal
chrome.runtime.onSuspend.addListener(() => {
    if (activeTabId) updateSiteTime(activeTabId);
    chrome.storage.local.set({ siteUsage });
});

// Function to update time spent on a site
function updateSiteTime(tabId) {
    if (!tabId || !tabStartTime) return;
    
    chrome.tabs.get(tabId, tab => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        
        const domain = getDomain(tab.url);
        if (!domain) return;

        const timeSpent = (Date.now() - tabStartTime) / 1000; // Convert to seconds
        siteUsage[domain] = (siteUsage[domain] || 0) + timeSpent;
        chrome.storage.local.set({ siteUsage });

        console.log(`Updated time for ${domain}: ${siteUsage[domain]} seconds`);
    });
}

// Listener for extension popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getUsage") {
        chrome.storage.local.get(["siteUsage"], data => {
            sendResponse(data.siteUsage || {});
        });
        return true;
    }
});
