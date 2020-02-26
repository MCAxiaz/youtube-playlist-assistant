import * as Storage from '../modules/Storage.js';
import * as Api from '../modules/data/YoutubeApi.js';
import * as Downloads from '../modules/Downloads.js';
import * as Messaging from '../modules/Messaging.js';

// eslint-disable-next-line no-unused-vars
import { PlaylistEntry } from '../modules/data/Model.js';

/**
 * @type {Map<string, PlaylistEntry[]>}
 */
const unavailablePlaylistEntries = new Map();
let syncing = true;

const init = async () => {
	Messaging.addListener(() => {
		const value = syncing ? null : unavailablePlaylistEntries;
		console.log(value);
		return Promise.resolve(value);
	}, Messaging.TAG.REQUEST_LIST);

	await sync();
};

async function sync() {
	syncing = true;
	const savedPlaylistEntries = await Storage.getPlaylistEntries();

	let playlists = await Api.fetchPlaylistList();

	for (const playlist of playlists) {
		const entries = await Api.fetchPlaylist(playlist.id);

		const unavailableEntries = entries.filter(entry => {
			const id = entry.id;
			const available = !!entry.title;

			if (available) {
				savedPlaylistEntries[id] = entry.title;
			}

			return !available;
		});

		unavailablePlaylistEntries.set(playlist, unavailableEntries);
	}

	console.log('Unavailable entries =====');
	console.log(unavailablePlaylistEntries);

	console.log('Pending Saved Entries =====');
	console.log(savedPlaylistEntries);

	await Storage.setPlaylistEntries(savedPlaylistEntries);
	await createBackup(savedPlaylistEntries);
	syncing = false;
	Messaging.sendMessage({ results: savedPlaylistEntries });
}

const createBackup = async playlistEntries => {
	const fileName = Downloads.generateBackupFileName();
	console.log(`downloading ${fileName}`);

	let success = await Downloads.download(playlistEntries, fileName);
	console.log(`download succeeded: ${success}`);
};

init()
	.then(() => {
		console.log('done init');
	})
	.catch(error => console.error(error));
