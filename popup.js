const container = document.getElementById('video-list');
const clearAllButton = document.getElementById('clear-all');

async function loadSavedVideos() {
	try {
		const data = await chrome.storage.local.get('youtubeData');
		const savedVideos = data.youtubeData;
		if (savedVideos && Object.keys(savedVideos).length > 0) {
			container.innerHTML = '';
			clearAllButton.style.display = 'block'; // show button

			for (const [url, videoData] of Object.entries(savedVideos)) {
				const minutes = Math.floor(videoData.time / 60);
				const seconds = Math.floor(videoData.time % 60);

				const videoElement = document.createElement('div');
				videoElement.classList.add('video-item');
				videoElement.innerHTML = `
            <p class="video-time">${minutes}m ${seconds}s</p>
            <a href="${url}" target="_blank">${videoData.title}</a>
            <button class="remove-btn" data-url="${url}">Remove Video</button>
            <hr>
          `;
				container.appendChild(videoElement);
			}

			// Add event listeners to remove buttons
			document.querySelectorAll('.remove-btn').forEach((button) => {
				button.addEventListener('click', (e) => {
					const videoURL = e.target.getAttribute('data-url');
					removeVideo(videoURL);
				});
			});
		} else {
			container.innerHTML = '<p>No saved videos.</p>';
			clearAllButton.style.display = 'none'; // hide button if no videos are found.
		}
	} catch (error) {
		console.error('Error loading saved videos:', error);
	}
}

async function removeVideo(videoURL) {
	try {
		const data = await chrome.storage.local.get('youtubeData');
		let savedVideos = data.youtubeData ?? {};
		if (videoURL in savedVideos) {
			delete savedVideos[videoURL]; // Remove the selected video
			await chrome.storage.local.set({ youtubeData: savedVideos });
		}
		loadSavedVideos(); // Refresh UI
	} catch (error) {
		console.error('Error removing video:', error);
	}
}

async function clearAllVideos() {
	try {
		await chrome.storage.local.remove('youtubeData');
		loadSavedVideos(); // Refresh UI
	} catch (error) {
		console.error('Error clearing all videos:', error);
	}
}

clearAllButton.style.display = 'none'; // initially hide the button
loadSavedVideos();
clearAllButton.addEventListener('click', clearAllVideos);
