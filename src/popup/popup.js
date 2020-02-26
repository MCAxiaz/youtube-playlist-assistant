import * as Messaging from '../modules/Messaging.js';

// eslint-disable-next-line no-unused-vars
import { PlaylistEntry } from '../modules/data/Model.js';

const results = document.body.querySelector('#results');

results.appendChild(document.createTextNode('hmmm'));

function listener(payload) {
	console.log(payload);
	toggleLoading(false);
	showContent(payload);
}

Messaging.addListener(listener, Messaging.TAG.SYNC_COMPLETE);
Messaging.sendMessage(new Messaging.Message(Messaging.TAG.REQUEST_LIST)).then(
	response => {
		console.log(response);
		toggleLoading(false);
		showContent(response);
	}
);

const toggleLoading = display => {
	const node = document.getElementById('loading');
	node.style.display = display ? 'block' : 'none';
};

/**
 * @param {Map<string, PlaylistEntry[]>} data
 */
const showContent = data => {
	const node = document.getElementById('content');
	const list = document.createElement('ul');
	data.forEach((value, key) => {
		const listItem = document.createElement('li');
		listItem.textContent = key.title;
		list.appendChild(listItem);
	});
	node.appendChild(list);

	node.style.display = 'block';
};

const hideContent = () => {
	const node = document.getElementById('content');
	node.style.display = 'none';
};
