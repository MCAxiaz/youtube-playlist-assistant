import * as Storage from './Storage.js';
import * as Api from './YoutubeApi.js';
import * as Downloads from './Downloads.js';

// eslint-disable-next-line no-unused-vars
import { PlaylistEntry } from './Model.js';

async function sync() {
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

	const newPlaylistEntries = {};

	for (const playlist of playlists) {
		const entries = await Api.fetchPlaylist(playlist.id);

		const unavailableEntries = entries.filter(entry => {
			const id = entry.id;
			const available = !!entry.title;

			if (available) {
				newPlaylistEntries[id] = entry.title;
			} else {
				const savedTitle = savedPlaylistEntries[entry.id];
				if (savedTitle) {
					newPlaylistEntries[id] = savedTitle;
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
	await createBackup(newPlaylistEntries);
}

const createBackup = async playlistEntries => {
	const fileName = Downloads.generateBackupFileName();
	console.log(`downloading ${fileName}`);

	let success = await Downloads.download(playlistEntries, fileName);
	console.log(`download succeeded: ${success}`);
};

sync().then(() => {
	console.log('DOOT done init');
});
