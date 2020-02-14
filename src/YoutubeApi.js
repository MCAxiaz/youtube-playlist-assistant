import * as Network from './Network.js';
import * as Model from './Model.js';

const BASE_URL = 'https://www.youtube.com';
const PLAYLIST_URL = `${BASE_URL}/playlist`;
const PLAYLIST_LIST_URL = `${BASE_URL}/feed/library`;

const LIST_PARAM = 'list';

const fetchPlaylistList = async () => {
	let response = await Network.GET(PLAYLIST_LIST_URL);
	let body = await response.text();

	return Model.parsePlaylistList(body);
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

	return Model.parseInitialPlaylistSection(body);
};

const Api = {
	fetchPlaylistList,
	fetchPlaylist
};

export default Api;
