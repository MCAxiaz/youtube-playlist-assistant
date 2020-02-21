import { delay } from './Utils.js';

const downloads = browser.downloads;

/**
 *
 * @param {Object} data A data object that can be placed in a blob.
 * @returns {string} The URL referencing the data object.
 */
const createBackupFileUrl = data => {
	const blob = new Blob([JSON.stringify(data, null, '\t')], {
		type: 'application/json'
	});

	return URL.createObjectURL(blob);
};

/**
 * @return {string} Generated file name.
 */
export const generateBackupFileName = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = prefixNum(date.getMonth() + 1);
	const day = prefixNum(date.getDate());
	return `youtube-playlist-assistant/playlist-archive-${year}-${month}-${day}.json`;
};

export const download = async (
	data,
	filename,
	saveAs = false,
	overwrite = true
) => {
	const url = createBackupFileUrl(data);

	try {
		const id = await downloads.download({
			url,
			filename,
			saveAs,
			conflictAction: overwrite
				? downloads.FilenameConflictAction.OVERWRITE
				: downloads.FilenameConflictAction.UNIQUIFY
		});

		const success = await waitDownload(id);
		await downloads.erase({ id });
		return success;
	} catch (error) {
		console.error(error);
	} finally {
		URL.revokeObjectURL(url);
	}
};

/**
 * Prefixes the given date or month number with 0 if necessary to maintain length of two.
 * @param {number} num Day or month number.
 * @returns {string}
 */
const prefixNum = num => {
	const prefixed = `0${num}`;

	return prefixed.slice(-2);
};

/**
 *
 * @param {number} id The ID of the download to wait for.
 * @returns Whether the download succeeded or not.
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
