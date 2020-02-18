const PLAYLIST_ENTRIES_KEY = 'playListEntries';

const getStorage = key => browser.storage.local.get(key);

const setStorage = (key, value) => browser.storage.local.set({ [key]: value });

/**
 * @param {Map<string, string>} entries A map containing video ID and title pairs.
 * @returns {Promise} A promise that resolves or rejects to indicate success of the operation.
 */
export const setPlaylistEntries = entries =>
	setStorage(PLAYLIST_ENTRIES_KEY, entries);

/**
 * @returns {Promise<Map<string, string>} A promise that resolves to a map containing video ID and title pairs.
 */
export const getPlaylistEntries = async () => {
	let result = await getStorage(PLAYLIST_ENTRIES_KEY);

	return result[PLAYLIST_ENTRIES_KEY] || new Map();
};
