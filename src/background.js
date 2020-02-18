import * as Storage from './Storage.js';
import * as Api from './YoutubeApi.js';

// eslint-disable-next-line no-unused-vars
import { PlaylistEntry } from './Model.js';

async function init() {
	console.log('DOOT init');
	let savedPlaylistEntries = await Storage.getPlaylistEntries();

	console.log('Saved entries =====');
	console.log(savedPlaylistEntries);

	let playlists = await Api.fetchPlaylistList();
	console.log('Playlists =====');
	console.log(playlists);

	/**
	 * @type {Map<string, PlaylistEntry[]>}
	 */
	let unavailablePlaylistEntries = new Map();

	/**
	 * @type {Map<string, string>}
	 */
	const newPlaylistEntries = new Map();

	for (const playlist of playlists) {
		const entries = await Api.fetchPlaylist(playlist.id);

		const unavailableEntries = entries.filter(entry => {
			const id = entry.id;
			const available = !!entry.title;

			if (available) {
				newPlaylistEntries.set(id, entry.title);
			} else {
				const savedTitle = savedPlaylistEntries.get(entry.id);
				if (savedTitle) {
					newPlaylistEntries.set(id, savedTitle);
				}
			}

			return !available;
		});

		unavailablePlaylistEntries.set(playlist.id, unavailableEntries);
	}

	console.log('Unavailable entries =====');
	console.log(unavailablePlaylistEntries);

	console.log('Pending Saved Entries =====');
	console.log(newPlaylistEntries);

	await Storage.setPlaylistEntries(newPlaylistEntries);
}

init().then(() => {
	console.log('DOOT done init');
});
