// keeping background slim, don't want it to be activated continuously - so that it can sleep

// lower resource usage and prevent risk of chrome killing background script and losing data

// listens when the tab closes and logs the youtubeData from local storage
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
	// logging only in development
	chrome.storage.local.get('youtubeData', (data) => {
		console.log('youtubeData:', data);
	});
});
