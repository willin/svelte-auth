import { env } from '$env/dynamic/private';
import { sequence } from '@sveltejs/kit/hooks';
import { handleSession } from '@svelte-dev/session';
import { Auth } from '$lib/auth/auth.js';
import { SSOStrategy } from '@svelte-dev/auth-sso';

export const handle = sequence(
	handleSession({
		adapter: {
			name: 'cookie',
			options: {
				chunk: true
			}
		},
		session: {
			secrets: ['s3cr3t']
		},
		cookie: {
			secure: !!env.SSO_CALLBACK_URL,
			sameSite: 'lax',
			path: '/',
			httpOnly: !!env.SSO_CALLBACK_URL,
			maxAge: 604800000
		}
	}),
	async function handle({ event, resolve }) {
		const auth = new Auth(event);
		const ssoStrategy = new SSOStrategy(
			{
				clientID: env.SSO_ID,
				clientSecret: env.SSO_SECRET,
				callbackURL: env.SSO_CALLBACK_URL || 'http://localhost:8788/auth/sso/callback'
			},
			async ({ profile }) => {
				// Get the user data from your DB or API using the tokens and profile
				return profile;
			}
		);
		auth.use(ssoStrategy as any);
		event.locals.auth = auth;
		const user = event.locals.session.get('user');
		event.locals.user = user;
		const response = await resolve(event);

		return response;
	}
);
