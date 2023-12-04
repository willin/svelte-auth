import type { Handle } from '@sveltejs/kit';
import { authenticator } from './routes/sso.server.js';

export const handle: Handle = async ({ event, resolve }) => {
	const user = await authenticator.isAuthenticated(event);
	if (user) {
		event.locals.user = user as unknown;
	}

	const response = await resolve(event);
	// after endpoint or page is called
	return response;
};
