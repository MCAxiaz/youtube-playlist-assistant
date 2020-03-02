import * as Storage from '../modules/Storage.js';
import * as Api from '../modules/data/YoutubeApi.js';
import * as Downloads from '../modules/Downloads.js';
import * as Messaging from '../modules/Messaging.js';

// eslint-disable-next-line no-unused-vars
import { PlaylistEntry, Playlist } from '../modules/data/Model.js';

/** @type {Map<Playlist, PlaylistEntry[]>} */
let unavailablePlaylistEntries = new Map();
let syncing = true;

const SYNC_INTERVAL = 12 * 3600 * 1000;

const init = async () => {
	Messaging.addListener(() => {
		const value = syncing ? null : unavailablePlaylistEntries;
		return Promise.resolve(value);
	}, Messaging.TAG.REQUEST_LIST);

	window.addEventListener('online', () => checkAutoSync());

	checkAutoSync();
};

const checkAutoSync = async () => {
	if (!window.navigator.onLine) return;

	const timeTillNextSync = await getTimeUntilNextAutoSync();
	console.log('current time ' + new Date());
	console.log('time till next sync ' + timeTillNextSync / 1000);

	if (!timeTillNextSync) {
		try {
			await sync();
		} catch (error) {
			console.error(error);
		} finally {
			scheduleAutoSync(SYNC_INTERVAL);
			await Storage.setLastAutoSyncDate(Date.now());
		}
	} else {
		scheduleAutoSync(timeTillNextSync);
	}
};

let autoSyncTimer = 0;
const scheduleAutoSync = delayMs => {
	if (autoSyncTimer) {
		clearTimeout(autoSyncTimer);
		autoSyncTimer = 0;
	}
	autoSyncTimer = setTimeout(checkAutoSync, delayMs);
};

async function sync() {
	try {
		syncing = true;
		/** @type {Map<Playlist, PlaylistEntry[]>} */
		const newUnavailablePlaylistEntries = new Map();
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

			newUnavailablePlaylistEntries.set(playlist, unavailableEntries);
		}

		console.log('Unavailable entries =====');
		console.log(newUnavailablePlaylistEntries);

		console.log('Pending Saved Entries =====');
		console.log(savedPlaylistEntries);

		unavailablePlaylistEntries = newUnavailablePlaylistEntries;

		await Storage.setPlaylistEntries(savedPlaylistEntries);
		await createBackup(savedPlaylistEntries);
		Messaging.sendMessage(
			new Messaging.Message(
				Messaging.TAG.SYNC_COMPLETE,
				unavailablePlaylistEntries
			)
		);
	} finally {
		syncing = false;
	}
}

const getTimeUntilNextAutoSync = async () => {
	const lastSyncDate = await Storage.getLastAutoSyncDate();
	let currentTime = Date.now();
	return Math.max(lastSyncDate + SYNC_INTERVAL - currentTime, 0);
};

const createBackup = async playlistEntries => {
	const fileName = Downloads.generateBackupFileName();
	console.log(`downloading ${fileName}`);

	let blob = Downloads.createBlob(playlistEntries, 'application/json');

	let success = await Downloads.download(blob, fileName);
	console.log(`download succeeded: ${success}`);
};

init()
	.then(() => {
		console.log('done init');
	})
	.catch(error => console.error(error));
