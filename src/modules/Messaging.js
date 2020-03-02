const runtime = browser.runtime;

/**
 * Adds a listener to the Messaging API. The listener is passed the message, or message body if tag is specified.
 * The listener should return a promise that resolves to the response, or omit return to ignore the message.
 * @param {(message: Any) => Promise} listener
 * @param {String} [tag] Only respond to messages with the given tag.
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

/**
 * Class representing a message. All messages with the same tag are expected to have consistent body structure.
 */
export class Message {
	/**
	 * @param {String} tag
	 * @param {*} [body]
	 */
	constructor(tag, body) {
		this.tag = tag;
		this.body = body;
	}
}

/**
 * Enum for identifying differentiating sender/receiver
 * @enum {String}
 */
export const TAG = {
	REQUEST_LIST: 'REQUEST_LIST',
	SYNC_COMPLETE: 'SYNC_COMPLETE'
};
