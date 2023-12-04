import { authenticator } from '../../../sso.js';
import type { RequestHandler } from './$types.js';

export const GET: RequestHandler = async (event) => {
	const provider = event.params.provider;

	return await authenticator.authenticate(provider, event, {
		successRedirect: '/demo',
		failureRedirect: '/'
	});
};
