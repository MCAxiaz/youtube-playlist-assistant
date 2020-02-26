const runtime = browser.runtime;

/**
 * @param {function} listener
 * @param {string} [tag] Only respond to messages with the given tag.
 */
export const addListener = (listener, tag) => {
	if (!tag) {
		runtime.onMessage.addListener(listener);
	} else {
		runtime.onMessage.addListener(
			/**@param {Message} message*/
			message => {
				if (message && message.tag === tag) {
					return listener(message.body);
				}
			}
		);
	}
};

/**
 * @param {Message} message
 * @returns {Promise} Promise that resolves to the response.
 */
export const sendMessage = message => runtime.sendMessage(message);

export class Message {
	/**
	 *
	 * @param {string} tag
	 * @param {*} [body]
	 */
	constructor(tag, body) {
		this.tag = tag;
		this.body = body;
	}
}

export const TAG = {
	/** request */
	REQUEST_LIST: 'REQUEST_LIST',
	SYNC_COMPLETE: 'SYNC_COMPLETE'
};
