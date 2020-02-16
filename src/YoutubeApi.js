import * as Network from './Network.js';
import * as Model from './Model.js';

const BASE_URL = 'https://www.youtube.com';
const PLAYLIST_URL = `${BASE_URL}/playlist`;
const PLAYLIST_LIST_URL = `${BASE_URL}/feed/library`;

const LIST_PARAM = 'list';

/**
 * Fetches all the user's playlists.
 * @returns {Promise<Model.Playlist[]>} A promise that resolves to a list of playlists.
 */
export const fetchPlaylistList = async () => {
	let response = await Network.GET(PLAYLIST_LIST_URL);
	let body = await response.text();

	return Model.parsePlaylistList(body);
};

/**
 * Fetches all entries in a playlist.
 * @param {string} playlistId The playlist Id.
 * @returns {Promise<Model.PlaylistEntry[]>} A promise that resolves to the entries in the playlist.
 */
export const fetchPlaylist = async playlistId => {
	let initialSection = await fetchInitial(playlistId);

	return initialSection;
};

/**
 * @param {string} playlistId The playlist Id.
 * @returns {Promise<Model.PlaylistSection>} A promise that resolves to the first section in the playlist.
 */
const fetchInitial = async playlistId => {
	let url = Network.constructUrlWithQuery(PLAYLIST_URL, {
		[LIST_PARAM]: playlistId
	});

	let response = await Network.GET(url);
	let body = await response.text();

	return Model.parseInitialPlaylistSection(body);
};
