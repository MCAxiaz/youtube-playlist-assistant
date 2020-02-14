const BASE = (url, method) =>
	fetch(url, {
		method,
		credentials: 'same-origin'
	});

/**
 * GET Request.
 * @param {string} url
 * @returns {Response}
 */
export const GET = url => BASE(url, 'GET');

/**
 * POST Request.
 * @param {string} url
 * @returns {Response}
 */
export const POST = url => BASE(url, 'POST');

/**
 * Appends a url with the given query parameters.
 * @param {string} url
 * @param {Object} queries
 * @returns {string} The url with query parameters.
 */
export const constructUrlWithQuery = (url, queries) => {
	let urlObj = new URL(url);
	urlObj.search = new URLSearchParams(queries).toString();
	console.log(urlObj.href);

	return urlObj.href;
};
