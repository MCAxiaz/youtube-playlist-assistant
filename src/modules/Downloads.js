import { delay } from './Utils.js';

const downloads = browser.downloads;
const OVERWRITE = downloads.FilenameConflictAction.OVERWRITE;
const UNIQUIFY = downloads.FilenameConflictAction.UNIQUIFY;

/**
 * @param {Object} data The data object to be placed in a blob.
 * @param {String} mimeType
 * @returns {Blob} The created blob.
 */
export const createBlob = (data, mimeType) => {
	switch (mimeType) {
		case 'application/json':
			return new Blob([JSON.stringify(data, null, '\t')], {
				type: mimeType
			});
		default:
			return new Blob([data], {
				type: mimeType
			});
	}
};

/**
 * @returns {String} Generated file name.
 */
export const generateBackupFileName = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = prefixNum(date.getMonth() + 1);
	const day = prefixNum(date.getDate());

	return `youtube-playlist-assistant/playlist-archive-${year}-${month}-${day}.json`;
};

/**
 * @param {Blob} dataBlob
 * @param {String} filename
 * @param {Boolean} [saveAs] Whether to show the "Save As" dialog. Default false.
 * @param {Boolean} [overwrite] Whether to overrite existing file. Default true.
 * @returns {Promise<Boolean>} Promise that resolves to whether the download succeeded or not.
 */
export const download = async (
	dataBlob,
	filename,
	saveAs = false,
	overwrite = true
) => {
	const url = URL.createObjectURL(dataBlob);

	try {
		const id = await downloads.download({
			url,
			filename,
			saveAs,
			conflictAction: overwrite ? OVERWRITE : UNIQUIFY
		});

		const success = await waitDownload(id);
		await downloads.erase({ id });
		return success;
	} finally {
		URL.revokeObjectURL(url);
	}
};

/**
 * Prefixes the given date or month number with 0 if necessary to maintain length of two.
 * @param {Number} num Day or month number.
 * @returns {String}
 */
const prefixNum = num => {
	const prefixed = `0${num}`;

	return prefixed.slice(-2);
};

/**
 * Waits for the download up to a set amount of time, cancelling it if it times out.
 * @param {Number} id The ID of the download to wait for.
 * @returns {Promise<Boolean>} Promise that resolves to whether the download succeeded or not.
 */
const waitDownload = async id => {
	for (let i = 0; i < 5; ++i) {
		await delay(1000);

		const [downloadStatus] = await downloads.search({ id });

		if (!downloadStatus) {
			return false;
		} else if (downloadStatus.state === downloads.State.COMPLETE) {
			return true;
		} else if (downloadStatus.state === downloads.State.INTERRUPTED) {
			return false;
		}
	}

	await downloads.cancel(id);

	return false;
};
