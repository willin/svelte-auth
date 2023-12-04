import { env } from '$env/dynamic/private';
import { Authenticator } from '$lib/index.js';
import { SSOStrategy } from '@svelte-dev/auth-sso';

const authenticator = new Authenticator({
	throwOnError: true
});

const ssoStrategy = new SSOStrategy(
	{
		clientID: env.SSO_ID,
		clientSecret: env.SSO_SECRET,
		callbackURL: 'http://localhost:8788/auth/sso/callback'
		// 'https://svelte-auth.js.cool/auth/sso/callback'
	},
	async ({ profile }: { profile: Record<string, unknown> }) => {
		// Get the user data from your DB or API using the tokens and profile
		return profile;
	}
);

authenticator.use(ssoStrategy);

export { authenticator };
