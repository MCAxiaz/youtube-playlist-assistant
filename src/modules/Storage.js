const storage = browser.storage.local;

const PLAYLIST_ENTRIES_KEY = 'playListEntries';
const LAST_SYNC_TIME_KEY = 'lastSyncTime';

/**
 * @param {Object} entries An object containing video ID and title pairs.
 * @returns {Promise} A promise that resolves or rejects to indicate success of the operation.
 */
export const setPlaylistEntries = entries =>
	storage.set({ [PLAYLIST_ENTRIES_KEY]: entries });

/**
 * @returns {Promise<Object>} A promise that resolves to an object corresponding to video ID and title pairs.
 */
export const getPlaylistEntries = async () => {
	let result = await storage.get(PLAYLIST_ENTRIES_KEY);

	return result[PLAYLIST_ENTRIES_KEY] || {};
};

/**
 * @param {Number} date The sync date in unix time milliseconds.
 * @returns {Promise} A promise that resolves or rejects to indicate success of the operation.
 */
export const setLastAutoSyncDate = date =>
	storage.set({ [LAST_SYNC_TIME_KEY]: date });

/**
 * @returns {Promise<Number>} A promise that resolves to the last sync date in unix time milliseconds.
 */
export const getLastAutoSyncDate = async () => {
	let result = await storage.get(LAST_SYNC_TIME_KEY);

	return result[LAST_SYNC_TIME_KEY] || 0;
};
