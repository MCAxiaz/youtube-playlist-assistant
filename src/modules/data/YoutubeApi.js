import * as Network from './Network.js';
import * as Model from './Model.js';

const BASE_URL = 'https://www.youtube.com';
const PLAYLIST_URL = `${BASE_URL}/playlist`;
const PLAYLIST_LIST_URL = `${BASE_URL}/feed/library`;
const CONTINUATION_URL = `${BASE_URL}/browse_ajax`;

/**
 * Fetches all the user's playlists.
 * @returns {Promise<Model.Playlist[]>} A promise that resolves to a list of playlists.
 */
export const fetchPlaylistList = async () => {
	const response = await Network.GET(PLAYLIST_LIST_URL);
	const body = await response.text();

	return Model.parsePlaylistList(body);
};

/**
 * Fetches all entries in a playlist.
 * @param {String} playlistId The playlist Id.
 * @returns {Promise<Model.PlaylistEntry[]>} A promise that resolves to the entries in the playlist.
 */
export const fetchPlaylist = async playlistId => {
	const url = Network.constructUrlWithQuery(
		PLAYLIST_URL,
		ListParam(playlistId)
	);

	const response = await Network.GET(url);
	const responseBody = await response.text();

	let { items, continuation } = Model.parseInitialPlaylistSection(responseBody);

	if (continuation) {
		const continuationHeader = ContinuationHeader(responseBody);

		while (continuation) {
			const nextSection = await fetchPlaylistContinuation(
				continuation,
				continuationHeader
			);

			items = items.concat(nextSection.items);
			continuation = nextSection.continuation;
		}
	}

	return items;
};

/**
 * @param {String} continuationId The Id for the next playlist section.
 * @param {Object} continuationHeader The header used for the request.
 * @returns {Promise<Model.PlaylistSection>} A promise that resolves to the section in the playlist.
 */
const fetchPlaylistContinuation = async (
	continuationId,
	continuationHeader
) => {
	const url = Network.constructUrlWithQuery(
		CONTINUATION_URL,
		ContinuationParam(continuationId)
	);

	const response = await Network.GET(url, continuationHeader);
	const responseBody = await response.json();

	return Model.parseContinuationSection(responseBody);
};

const ListParam = playlistId => ({
	list: playlistId
});

const ContinuationParam = continuationId => ({
	ctoken: continuationId,
	continuation: continuationId
});

const ContinuationHeader = responseBody => {
	const clientInfo = Model.parseClientInfo(responseBody);
	const idToken = Model.parseIdToken(responseBody);

	return {
		'X-Youtube-Client-Name': clientInfo.name,
		'X-Youtube-Client-Version': clientInfo.version,
		'X-Youtube-Identity-Token': idToken
	};
};
