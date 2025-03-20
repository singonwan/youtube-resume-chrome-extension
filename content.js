let isScriptInitialized = false;

async function initContentScript() {
	if (isScriptInitialized) {
		return;
	}
	if (!window.location.pathname.startsWith('/watch')) {
		return;
	}

	const video = document.querySelector('video');

	if (!video) {
		return;
	}

	isScriptInitialized = true;
	let interval;

	async function saveVideoData() {
		try {
			if (chrome.runtime && chrome.runtime.id) {
				const url = new URL(window.location.href);
				const videoID = url.searchParams.get('v');

				if (!videoID) return;

				const videoURL = `https://www.youtube.com/watch?v=${videoID}`;
				const videoTitle = document.title;

				const data = await chrome.storage.local.get('youtubeData');
				const savedVideos = data.youtubeData ?? {};

				savedVideos[videoURL] = {
					time: video.currentTime,
					title: videoTitle,
				};

				await chrome.storage.local.set({ youtubeData: savedVideos });
			} else {
				console.warn('Extension context invalidated, skipping save.');
			}
		} catch (error) {
			console.error('Error saving video data:', error);
		}
	}

	function startSaving() {
		if (interval) clearInterval(interval);
		interval = setInterval(saveVideoData, 2000);
	}

	function stopSaving() {
		clearInterval(interval);
		interval = null;
	}

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			saveVideoData();
			stopSaving();
		} else {
			startSaving();
		}
	});
	startSaving();
}

const observer = new MutationObserver((mutations, obs) => {
	if (window.location.pathname.startsWith('/watch')) {
		const video = document.querySelector('video');
		if (video) {
			initContentScript();
			obs.disconnect();
		}
	} else {
		obs.disconnect();
	}
});

observer.observe(document.body, { childList: true, subtree: true });

let lastUrl = location.href;
const urlObserver = new MutationObserver(() => {
	const currentUrl = location.href;
	if (currentUrl !== lastUrl) {
		lastUrl = currentUrl;
		observer.disconnect();
		isScriptInitialized = false;
		if (window.location.pathname.startsWith('/watch')) {
			observer.observe(document.body, { childList: true, subtree: true });
		}
	}
});

urlObserver.observe(document.body, { childList: true, subtree: true });
