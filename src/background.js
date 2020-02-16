import * as Api from './YoutubeApi.js';

async function init() {
	console.log('DOOT init');
	await browser.storage.local.clear();
	await browser.storage.local.set({
		doot: 'HMM'
	});
	console.log('DOOT finished setting storage');

	let playlists = await Api.fetchPlaylistList();
	console.log(playlists);

	let response = await Api.fetchPlaylist('PLOnEr1yfSfP4N3kGycfychr8OFWTepzT_');
	console.log(`DOOT ${response}`);
}

init().then(() => {
	console.log('DOOT done init');
});
