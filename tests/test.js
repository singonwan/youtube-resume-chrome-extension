const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '../');

(async () => {
	// Launch Chrome with the extension loaded
	const browser = await puppeteer.launch({
		headless: false, // Set to false to see the browser UI
		args: [
			`--disable-extensions-except=${EXTENSION_PATH}`,
			`--load-extension=${EXTENSION_PATH}`,
		],
	});

	// Open YouTube
	const page = await browser.newPage();
	// directly going to a video page
	await page.goto('https://www.youtube.com/watch?v=lkkGlVWvkLk', {
		waitUntil: 'networkidle2',
	});

	await page.waitForSelector('video');

	// Simulate pause and store playback time
	await page.evaluate(async () => {
		const video = document.querySelector('video');
		video.currentTime = 42; // Seek to 42 seconds
		video.pause();

		// Wait for 2 seconds after the video pauses
		await new Promise((resolve) => setTimeout(resolve, 2000));

		console.log('Waited for 2 seconds after pausing the video');
	});

	const popUpPage = await browser.newPage();
	//open popup
	await popUpPage.goto(
		'chrome-extension://moojbciplhlbkadbmagjeibjcbokgkbk/popup.html',
		{
			waitUntil: 'networkidle2',
		}
	);
	console.log('opened popup');

	// Wait for the element to appear
	await popUpPage.waitForSelector('.video-time'); // Use your actual selector

	// Get the text content of the element
	const statusText = await popUpPage.$eval('.video-time', (el) =>
		el.textContent.trim()
	);

	// Check the text
	if (statusText === '0m 42s') {
		console.log('✅ Correct status shown!');
	} else {
		console.log(`❌ Unexpected status: "${statusText}"`);
	}

	// Close the pages
	await page.close();
	await popUpPage.close();

	// Close browser
	await browser.close();
})();
