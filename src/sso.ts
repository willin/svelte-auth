import { SSOStrategy } from '@svelte-dev/auth-sso';
import { env } from '$env/dynamic/private';
import { Authenticator } from '$lib/index.js';

const authenticator = new Authenticator({
	throwOnError: true
});

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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
authenticator.use(ssoStrategy);

export { authenticator };
