import * as Network from './Network.js';

const BASE_URL = 'https://www.youtube.com';
const PLAYLIST_URL = `${BASE_URL}/playlist`;
const PLAYLIST_LIST_URL = `${BASE_URL}/feed/library`;

const LIST_PARAM = 'list';

/**
 * common data structure used by Youtube for rendering
 * returns an array
 */
const initialDataRegex = /window\["ytInitialData"\] = (\{.*\});/;
const parseInitialData = responseBody => {
	let initialData = responseBody.match(initialDataRegex);

	if (initialData) {
		initialData = JSON.parse(initialData[1]).contents
			.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
			.sectionListRenderer.contents;
	}

	return initialData;
};

const fetchPlaylistList = async () => {
	let response = await Network.GET(PLAYLIST_LIST_URL);
	let body = await response.text();

	let playlists = parseInitialData(body)[2].itemSectionRenderer.contents[0]
		.shelfRenderer.content.gridRenderer.items;

	return playlists.map(item => {
		let actualItem = item.gridPlaylistRenderer;
		let id = actualItem.playlistId;
		let title = actualItem.title.runs[0].text;

		return {
			id,
			title
		};
	});
};

const fetchPlaylist = async playlistUrl => {
	let response = await fetchInitial(playlistUrl);

	return response;
};

const fetchInitial = async playlistUrl => {
	let url = Network.constructUrlWithQuery(PLAYLIST_URL, {
		[LIST_PARAM]: playlistUrl
	});

	let response = await Network.GET(url);
	let body = await response.text();

	let initialData = parseInitialData(body)[0].itemSectionRenderer.contents[0]
		.playlistVideoListRenderer;

	let initialResults = parseInitialPlaylistResults(initialData);
	let initialContinuation = parseInitialContinuation(initialData);

	console.log(initialResults);
	console.log(initialContinuation);

	return {
		results: initialResults,
		continuation: initialContinuation
	};
};

const parseInitialPlaylistResults = initialData => {
	let playlistContent = initialData.contents;

	return playlistContent.map(item => {
		let actualItem = item.playlistVideoRenderer;
		let id = actualItem.videoId;
		let title = actualItem.title.simpleText;

		let uploader;
		let uploaderId;

		if (title) {
			let uploaderData = actualItem.shortBylineText.runs[0];
			uploader = uploaderData.text;
			uploaderId = uploaderData.navigationEndpoint.browseEndpoint.browseId;
		}

		return {
			id,
			title,
			uploader,
			uploaderId
		};
	});
};

const parseInitialContinuation = initialData => {
	let continuations = initialData.continuations;
	return continuations && continuations[0].nextContinuationData.continuation;
};

const Api = {
	fetchPlaylistList,
	fetchPlaylist
};

export default Api;
