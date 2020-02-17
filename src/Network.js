const BASE = (url, method, headers) =>
	fetch(url, {
		method,
		credentials: 'same-origin',
		headers
	});

/**
 * GET Request.
 * @param {string} url
 * @param {Object} headers
 * @returns {Promise<Response>}
 */
export const GET = (url, headers) => BASE(url, 'GET', headers);

/**
 * POST Request.
 * @param {string} url
 * @returns {Promise<Response>}
 */
export const POST = url => BASE(url, 'POST');

/**
 * Appends a url with the given query parameters.
 * @param {string} url
 * @param {Object} queries
 * @returns {string} The url with query parameters.
 */
export const constructUrlWithQuery = (url, queries) => {
	const urlObj = new URL(url);
	urlObj.search = new URLSearchParams(queries).toString();

	return urlObj.href;
};
