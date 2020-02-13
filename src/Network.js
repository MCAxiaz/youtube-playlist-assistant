const BASE = (url, method) =>
	fetch(url, {
		method,
		credentials: 'same-origin'
	});

export const GET = url => BASE(url, 'GET');
export const POST = url => BASE(url, 'POST');

export const constructUrlWithQuery = (url, queries) => {
	let urlObj = new URL(url);
	urlObj.search = new URLSearchParams(queries).toString();
	console.log(urlObj.href);

	return urlObj.href;
};

export const ResponseType = {
	JSON: 'json',
	TEXT: 'text'
};
