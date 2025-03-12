const container = document.getElementById('video-list');
const clearAllButton = document.getElementById('clear-all');

async function loadSavedVideos() {
	try {
		const data = await chrome.storage.local.get('youtubeData');
		const savedVideos = data.youtubeData;
		if (savedVideos && Object.keys(savedVideos).length > 0) {
			container.innerHTML = '';
			clearAllButton.classList.remove('hidden');

			for (const [url, videoData] of Object.entries(savedVideos)) {
				const minutes = Math.floor(videoData.time / 60);
				const seconds = Math.floor(videoData.time % 60);

				const videoElement = document.createElement('div');
				videoElement.classList.add('video-item');

				// 		videoElement.innerHTML = `
				//     <p class="video-time">${minutes}m ${seconds}s</p>
				//     <a href="${url}" target="_blank">${videoData.title}</a>
				//     <button class="remove-btn" data-url="${url}">Remove Video</button>
				//     <hr>
				//   `;

				const timeElement = document.createElement('p');
				timeElement.classList.add('video-time');
				timeElement.innerText = `${minutes}m ${seconds}s`;

				const linkElement = document.createElement('a');
				linkElement.href = url;
				linkElement.target = '_blank';
				linkElement.innerText = videoData.title;

				const removeButton = document.createElement('button');
				removeButton.classList.add('remove-btn');
				removeButton.dataset.url = url;
				removeButton.innerText = 'Remove Video';

				const hrElement = document.createElement('hr');

				videoElement.appendChild(timeElement);
				videoElement.appendChild(linkElement);
				videoElement.appendChild(removeButton);
				videoElement.appendChild(hrElement);

				// container.appendChild(videoElement);

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
			// container.innerHTML = '<p>No saved videos.</p>';
			container.innerHTML = ''; // Clear any existing videos
			const noVideosMessage = document.createElement('h3');
			noVideosMessage.innerText = 'No saved videos.';
			container.appendChild(noVideosMessage);
			clearAllButton.classList.add('hidden'); // hide button if no videos are found.
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
clearAllButton.classList.add('hidden'); // initially hide the button
loadSavedVideos();
clearAllButton.addEventListener('click', clearAllVideos);
