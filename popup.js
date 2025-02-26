// const data = await chrome.storage.local.get('youtubeData');
// const savedVideos = data.youtubeData;
// console.log(data);
// console.log(savedVideos);
// if (savedVideos && Object.keys(savedVideos).length > 0) {
// 	const container = document.getElementById('video-link'); // popup.html
// 	container.innerHTML = ''; // clear container - starts empty every time

// 	// go through savedVideos object and create a div element for each video
// 	for (const [url, videoData] of Object.entries(savedVideos)) {
// 		const videoElement = document.createElement('div');
// 		videoElement.innerHTML = `
//         <p>You stopped at: ${videoData.time.toFixed(2)} seconds</p>
//         <a href="${url}" target="_blank">${videoData.title}</a>
//         <hr>
//       `;
// 		// append the div element to the container
// 		container.appendChild(videoElement);
// 	}
// } else {
// 	// no saved videos
// 	// popup.html
// 	document.getElementById('saved-time').textContent = 'No saved videos.';
// }

const container = document.getElementById('video-list');
const clearAllButton = document.getElementById('clear-all');

function loadSavedVideos() {
	chrome.storage.local.get('youtubeData', (data) => {
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
	});
}
function removeVideo(videoURL) {
	chrome.storage.local.get('youtubeData', (data) => {
		let savedVideos = data.youtubeData || {};
		delete savedVideos[videoURL]; // Remove the selected video
		chrome.storage.local.set({ youtubeData: savedVideos }, () => {
			loadSavedVideos(); // Refresh UI
		});
	});
}

function clearAllVideos() {
	chrome.storage.local.remove('youtubeData', () => {
		console.log('All videos cleared.');
		loadSavedVideos(); // Refresh UI
	});
}

clearAllButton.style.display = 'none'; // initially hide the button
loadSavedVideos();
clearAllButton.addEventListener('click', clearAllVideos);
