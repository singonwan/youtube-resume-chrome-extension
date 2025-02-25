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

chrome.storage.local.get('youtubeData', (data) => {
	const savedVideos = data.youtubeData;

	if (savedVideos && Object.keys(savedVideos).length > 0) {
		const container = document.getElementById('video-link');
		container.innerHTML = '';

		for (const [url, videoData] of Object.entries(savedVideos)) {
			const videoElement = document.createElement('div');
			videoElement.innerHTML = `
        <p>You stopped at: ${videoData.time.toFixed(2)} seconds</p>
        <a href="${url}" target="_blank">${videoData.title}</a>
        <hr>
      `;
			container.appendChild(videoElement);
		}
	} else {
		document.getElementById('saved-time').textContent = 'No saved videos.';
	}
});
