/**
 * Parses out a list of all of a user's playlists.
 * @param {string} responseBody The response body in plaintext.
 * @returns {Playlist[]} Array of playlists
 */
export const parsePlaylistList = responseBody => {
	let playlists = parseInitialData(responseBody)[2].itemSectionRenderer
		.contents[0].shelfRenderer.content.gridRenderer.items;

	return playlists.map(item => {
		let actualItem = item.gridPlaylistRenderer;
		let id = actualItem.playlistId;
		let title = actualItem.title.runs[0].text;

		return new Playlist(id, title);
	});
};

/**
 * Parses the first section of a playlist.
 * @param {string} responseBody The response body in plaintext.
 * @returns {PlaylistSection} The first section of the playlist.
 */
export const parseInitialPlaylistSection = responseBody => {
	let initialData = parseInitialData(responseBody)[0].itemSectionRenderer
		.contents[0].playlistVideoListRenderer;

	let initialResults = parseInitialPlaylistResults(initialData);
	let initialContinuation = parseInitialContinuation(initialData);

	return new PlaylistSection(initialResults, initialContinuation);
};

const initialDataRegex = /window\["ytInitialData"\] = (\{.*\});/;
const parseInitialData = responseBody => {
	let initialData = responseBody.match(initialDataRegex);

	initialData = JSON.parse(initialData[1]).contents
		.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
		.sectionListRenderer.contents;

	return initialData;
};

const parseInitialPlaylistResults = initialData => {
	let playlistContent = initialData.contents;

	return playlistContent.map(item => {
		let actualItem = item.playlistVideoRenderer;
		let id = actualItem.videoId;
		let title = actualItem.title.simpleText;

		return new PlaylistEntry(id, title);
	});
};

const parseInitialContinuation = initialData => {
	let continuations = initialData.continuations;
	return continuations && continuations[0].nextContinuationData.continuation;
};

/** Class representing a playlist. */
class Playlist {
	/**
	 * @param {string} id
	 * @param {string} title
	 */
	constructor(id, title) {
		this.id = id;
		this.title = title;
	}
}

/** Class representing one section of a paged playlist. */
class PlaylistSection {
	/**
	 * @param {PlaylistEntry[]} items List of entries in the section.
	 * @param {string} continuation Id of the next playlist section if it exists.
	 */
	constructor(items, continuation) {
		this.items = items;
		this.continuation = continuation;
	}
}

/** Class representing a playlist entry. */
class PlaylistEntry {
	/**
	 * @param {string} id
	 * @param {string} title
	 */
	constructor(id, title) {
		this.id = id;
		this.title = title;
	}
}
