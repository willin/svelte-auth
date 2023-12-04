import { redirect } from '@sveltejs/kit';
import { authenticator } from '../../sso.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async (event) => {
	const user = await authenticator.isAuthenticated(event);
	if (user) {
		throw redirect(307, '/demo');
	}
	const { request } = event;
	const provider = event.params.provider;
	const referer = request.headers.get('referer');
	const returnPath = referer ? new URL(referer).pathname : '/';

	return await authenticator.authenticate(provider, event, {
		successRedirect: returnPath,
		failureRedirect: returnPath
	});
};
