/**
 * Parses out a list of all of a user's playlists.
 * @param {String} responseBody The response body in plaintext.
 * @returns {Playlist[]} Array of playlists.
 */
export const parsePlaylistList = responseBody => {
	const playlists = parseInitialData(responseBody)[2].itemSectionRenderer
		.contents[0].shelfRenderer.content.gridRenderer.items;

	return playlists.map(item => {
		const actualItem = item.gridPlaylistRenderer;
		const id = actualItem.playlistId;
		const title = actualItem.title.runs[0].text;

		return new Playlist(id, title);
	});
};

/**
 * Parses the first section of a playlist.
 * @param {String} responseBody The response body in plaintext.
 * @returns {PlaylistSection} The first section of the playlist.
 */
export const parseInitialPlaylistSection = responseBody => {
	const initialData = parseInitialData(responseBody)[0].itemSectionRenderer
		.contents[0].playlistVideoListRenderer;

	const entriesArray = initialData.contents;
	let initialEntries = [];
	if (entriesArray) {
		initialEntries = entriesArray.map(parsePlaylistEntry);
	}

	const continuations = initialData.continuations;
	const initialContinuation = continuations
		? parseContinuation(continuations)
		: null;

	return new PlaylistSection(initialEntries, initialContinuation);
};

/**
 * Parses the given section of a playlist.
 * @param {Object} responseBody The response body in JSON.
 * @returns {PlaylistSection} The section of the playlist.
 */
export const parseContinuationSection = responseBody => {
	const continuationData =
		responseBody[1].response.continuationContents.playlistVideoListContinuation;

	const entries = continuationData.contents.map(parsePlaylistEntry);

	const continuations = continuationData.continuations;
	const continuation = continuations ? parseContinuation(continuations) : null;

	return new PlaylistSection(entries, continuation);
};

const idTokenRegex = /"ID_TOKEN":"([^"]*)"/;
/**
 * parses the identity token for use in request headers.
 * @param {String} responseBody The response body in plaintext.
 * @returns {String} The ID Token.
 */
export const parseIdToken = responseBody => responseBody.match(idTokenRegex)[1];

/**
 * Parses the client info for use in request headers.
 * @param {String} responseBody The response body in plaintext.
 * @returns {ClientInfo}
 */
export const parseClientInfo = responseBody => {
	const clientInfoArray = parseInitialDataObject(responseBody).responseContext
		.serviceTrackingParams[2].params;

	const clientVersion = clientInfoArray[2].value;
	const clientName = clientInfoArray[3].value;

	return new ClientInfo(clientName, clientVersion);
};

const initialDataRegex = /window\["ytInitialData"\] = (\{.*\});/;
const parseInitialDataObject = responseBody => {
	const initialData = responseBody.match(initialDataRegex);

	return JSON.parse(initialData[1]);
};

const parseInitialData = responseBody => {
	return parseInitialDataObject(responseBody).contents
		.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
		.sectionListRenderer.contents;
};

const parsePlaylistEntry = playlistEntry => {
	const actualItem = playlistEntry.playlistVideoRenderer;
	const id = actualItem.videoId;
	const title = actualItem.title.simpleText;

	return new PlaylistEntry(id, title);
};

const parseContinuation = data => {
	return data[0].nextContinuationData.continuation;
};

/** Class representing a playlist. */
export class Playlist {
	/**
	 * @param {String} id
	 * @param {String} title
	 */
	constructor(id, title) {
		this.id = id;
		this.title = title;
	}
}

/** Class representing one section of a paged playlist. */
export class PlaylistSection {
	/**
	 * @param {PlaylistEntry[]} items List of entries in the section.
	 * @param {String} [continuation] Id of the next playlist section if it exists.
	 */
	constructor(items, continuation) {
		this.items = items;
		this.continuation = continuation;
	}
}

/** Class representing a playlist entry. */
export class PlaylistEntry {
	/**
	 * @param {String} id
	 * @param {String} title
	 */
	constructor(id, title) {
		this.id = id;
		this.title = title;
	}
}

/** Class representing the client info to be used in request headers. */
export class ClientInfo {
	/**
	 * @param {String} name
	 * @param {String} version
	 */
	constructor(name, version) {
		this.name = name;
		this.version = version;
	}
}
