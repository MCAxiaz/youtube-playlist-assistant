export const delay = async delayMs =>
	new Promise(resolve => setTimeout(resolve, delayMs));

export const notifyError = (message, error) =>
	console.error(`${message}: ${error}`);
