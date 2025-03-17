let isScriptInitialized = false;
console.log('content.js loaded');

async function initContentScript() {
	if (isScriptInitialized) {
		console.log('Content script already initialized. Skipping...');
		return;
	}
	// check if the page is a youtube page
	if (!window.location.pathname.startsWith('/watch')) {
		console.log('Not a YouTube video page. Skipping...');
		return;
	}

	// look for video element on the page.
	const video = document.querySelector('video');

	if (!video) {
		console.log('No video element found on this page.');
		return;
	}

	console.log('Initializing content script...');
	isScriptInitialized = true;
	let interval;

	console.log('video:', video);
	console.log('currenttime:', video.currentTime);

	async function saveVideoData() {
		try {
			// ensure chrome extension is still running
			if (chrome.runtime && chrome.runtime.id) {
				// get video ID from URL to ensure clean and consistent URL format
				// avoids duplicate saving of the same video with different URL formats
				const url = new URL(window.location.href);
				const videoID = url.searchParams.get('v');

				if (!videoID) return; // ensure video exists

				// get URL and title
				const videoURL = `https://www.youtube.com/watch?v=${videoID}`; // cleaned URL
				const videoTitle = document.title;

				// retrieve existing youtubeData from chrome.storage.local
				const data = await chrome.storage.local.get('youtubeData');
				const savedVideos = data.youtubeData ?? {};

				// store the current video progress or replace it
				savedVideos[videoURL] = {
					time: video.currentTime,
					title: videoTitle,
				};

				// save data to chrome storage
				await chrome.storage.local.set({ youtubeData: savedVideos });
			} else {
				// logs a warning if runtime.id does not exist
				console.warn('Extension context invalidated, skipping save.');
			}
		} catch (error) {
			console.error('Error saving video data:', error);
		}
	}

	function startSaving() {
		if (interval) clearInterval(interval); //prevent duplicate intervals
		console.log('Starting save interval...');
		interval = setInterval(saveVideoData, 2000);
	}

	function stopSaving() {
		clearInterval(interval);
		interval = null;
	}

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			saveVideoData(); // Save progress before the tab is hidden
			stopSaving(); // Stop interval to prevent unnecessary execution
		} else {
			startSaving(); // Resume saving when the tab is visible again
		}
	});

	startSaving();
}

// Use MutationObserver to detect when video elements is added dynamically
// a mutation observer is created to monitor changes in the DOM
// helps detect when a video element appears, especially useful for Youtube's SPA behavior

const observer = new MutationObserver((mutations, obs) => {
	if (window.location.pathname.startsWith('/watch')) {
		const video = document.querySelector('video');

		if (video) {
			console.log('Video element found by MutationObserver');
			initContentScript();
			obs.disconnect(); // Stop observing once video is found
		}
	} else {
		console.log('Not a video page, disconnecting observer.');
		obs.disconnect(); // Disconnect for non-video pages
	}
});

// Tells the mutationObserver to watch for changes in the <body> element and all its child elements
observer.observe(document.body, { childList: true, subtree: true });

// MutationObserver to handle URL changes in Youtube's SPA
let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
	const currentUrl = location.href;
	if (currentUrl !== lastUrl) {
		lastUrl = currentUrl;
		console.log('URL changed, reinitializing content script...');
		observer.disconnect(); // Clear old observer ^
		isScriptInitialized = false;
		if (window.location.pathname.startsWith('/watch')) {
			// restart observer to catch any late-loaded video elements
			observer.observe(document.body, { childList: true, subtree: true });
		}
	}
});
// start observing URL changes in body and its children
urlObserver.observe(document.body, { childList: true, subtree: true });
