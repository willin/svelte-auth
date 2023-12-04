import { SSO_ID, SSO_SECRET } from '$env/static/private';
import { Authenticator } from '$lib/index.js';
import { SSOStrategy } from '@svelte-dev/auth-sso';

const authenticator = new Authenticator({
	throwOnError: true
});

const ssoStrategy = new SSOStrategy(
	{
		clientID: SSO_ID,
		clientSecret: SSO_SECRET,
		callbackURL: 'http://localhost:8788/auth/sso/callback'
		// 'https://svelte-auth.js.cool/auth/sso/callback'
	},
	async ({ profile }) => {
		// Get the user data from your DB or API using the tokens and profile
		return profile;
	}
);

authenticator.use(ssoStrategy);

export { authenticator };
