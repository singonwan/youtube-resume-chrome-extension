function initContentScript() {
	// check if the page is a youtube page
	if (!window.location.pathname.startsWith('/watch')) {
		console.log('Not a YouTube video page. Skipping...');
		return;
	}

	// looks for video element on the page.
	const video = document.querySelector('video');

	if (video) {
		console.log('video:', video);
		console.log('currenttime:', video.currentTime);

		function saveVideoData() {
			// ensures chrome extension is still running, if chrome.runtime.id is missing,
			// it means the extension was disabled or removed
			if (chrome.runtime && chrome.runtime.id) {
				// get URL and title
				const videoURL = window.location.href;
				const videoTitle = document.title;

				// retrieve existing youtubeData from chrome.storage.local
				chrome.storage.local.get('youtubeData', (data) => {
					// set saved videos to youtubeData or empty object
					let savedVideos = data.youtubeData || {};

					// store the current video progress or replace it
					savedVideos[videoURL] = {
						time: video.currentTime,
						title: videoTitle,
					};

					// save data to chrome storage
					chrome.storage.local.set({ youtubeData: savedVideos });
				});
			} else {
				// logs a warning if runtime.id does not exist
				console.warn('Extension context invalidated, skipping save.');
			}
		}

		// call saveVideoData every 2 seconds to regularly save progress
		const interval = setInterval(saveVideoData, 2000);
		// 'beforeunload' is triggered when user closes or refreshes the tab
		// calls saveVideoData when user 'unloads'

		// ensures one final save before tab closes // if unload is reliable
		window.addEventListener('unload', saveVideoData);
		// clears the interval when the tab is closed // cleaning up
		window.addEventListener('unload', () => clearInterval(interval));
	} else {
		console.log('No video element found on this page.');
	}
}

// Use MutationObserver to detect when video elements is added dynamically
// a mutation observer is created to monitor changes in the DOM
// helps detect when a video element appears, especially useful for Youtube's SPA behavior

const observer = new MutationObserver((mutations, obs) => {
	// check if current page is a youtube video page
	if (window.location.pathname.startsWith('/watch')) {
		// select video element
		const video = document.querySelector('video');

		if (video) {
			console.log('Video element found by MutationObserver');
			// calls initContentScript
			initContentScript();
			obs.disconnect(); // Stop observing once video is found
		}
	} else {
		// non-video page
		console.log('Not a video page, disconnecting observer.');
		obs.disconnect(); // Disconnect for non-video pages
	}
});

// Tells the mutationObserver to watch for changes in the <body> element and all its child elements
observer.observe(document.body, { childList: true, subtree: true });

// Also handle URL changes in Youtube's SPA
let lastUrl = location.href; // gets the current URL
const urlObserver = new MutationObserver(() => {
	// new observer to detect for URL changes
	const currentUrl = location.href;
	// compares current URL with last recorded URL
	if (currentUrl !== lastUrl) {
		// if URL changed, upadate lastUrl
		lastUrl = currentUrl;
		console.log('URL changed, reinitializing content script...');
		observer.disconnect(); // Clear old observer ^
		if (window.location.pathname.startsWith('/watch')) {
			// reinitailize observer if new page is a video page
			observer.observe(document.body, { childList: true, subtree: true });
		}
	}
});
// start observing URL changes in body and its children
urlObserver.observe(document.body, { childList: true, subtree: true });
