import { authenticator } from './routes/sso.js';

export const handle: Handle = async ({ event, resolve }) => {
	const user = await authenticator.isAuthenticated(event);
	if (user) {
		event.locals.user = user;
	}

	const response = await resolve(event);
	// after endpoint or page is called
	return response;
};
