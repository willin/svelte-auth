import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { AuthenticateOptions, Strategy } from './strategy.js';

export interface AuthenticateCallback<User> {
	(user: User): Promise<Response>;
}

/**
 * Extra options for the authenticator.
 */
export interface AuthenticatorOptions {
	sessionKey?: AuthenticateOptions['sessionKey'];
	sessionErrorKey?: AuthenticateOptions['sessionErrorKey'];
	sessionStrategyKey?: AuthenticateOptions['sessionStrategyKey'];
	throwOnError?: AuthenticateOptions['throwOnError'];
	cookieOpts?: AuthenticateOptions['cookieOpts'];
}

export class Authenticator<User = unknown> {
	/**
	 * A map of the configured strategies, the key is the name of the strategy
	 * @private
	 */
	private strategies = new Map<string, Strategy<User, never>>();

	public readonly sessionKey: NonNullable<AuthenticatorOptions['sessionKey']>;
	public readonly sessionErrorKey: NonNullable<AuthenticatorOptions['sessionErrorKey']>;
	public readonly sessionStrategyKey: NonNullable<AuthenticateOptions['sessionStrategyKey']>;
	private readonly throwOnError: AuthenticatorOptions['throwOnError'];

	/**
	 * Create a new instance of the Authenticator.
	 */
	constructor(options: AuthenticatorOptions = {}) {
		this.sessionKey = options.sessionKey || 'user';
		this.sessionErrorKey = options.sessionErrorKey || 'auth:error';
		this.sessionStrategyKey = options.sessionStrategyKey || 'strategy';
		this.throwOnError = options.throwOnError ?? false;
	}

	/**
	 * Call this method with the Strategy, the optional name allows you to setup
	 * the same strategy multiple times with different names.
	 * It returns the Authenticator instance for concatenation.
	 * @example
	 * authenticator
	 *  .use(new SomeStrategy({}, (user) => Promise.resolve(user)))
	 *  .use(new SomeStrategy({}, (user) => Promise.resolve(user)), "another");
	 */
	use(strategy: Strategy<User, never>, name?: string): Authenticator<User> {
		this.strategies.set(name ?? strategy.name, strategy);
		return this;
	}

	/**
	 * Call this method with the name of the strategy you want to remove.
	 * It returns the Authenticator instance for concatenation.
	 * @example
	 * authenticator.unuse("another").unuse("some");
	 */
	unuse(name: string): Authenticator {
		this.strategies.delete(name);
		return this;
	}

	/**
	 * Call this to authenticate a request using some strategy. You pass the name
	 * of the strategy you want to use and the request to authenticate.
	 * @example
	 * async function action({ event }: RequestEvent) {
	 *   let user = await authenticator.authenticate("some", request);
	 * };
	 * @example
	 * async function action({ event }: RequestEvent) {
	 *   return authenticator.authenticate("some", request, {
	 *     successRedirect: "/private",
	 *     failureRedirect: "/login",
	 *   });
	 * };
	 */
	authenticate(
		strategy: string,
		event: RequestEvent,
		options: Pick<AuthenticateOptions, 'failureRedirect' | 'throwOnError'> & {
			successRedirect: AuthenticateOptions['successRedirect'];
		}
	): Promise<never>;
	authenticate(
		strategy: string,
		event: RequestEvent,
		options: Pick<AuthenticateOptions, 'successRedirect' | 'throwOnError'> & {
			failureRedirect: AuthenticateOptions['failureRedirect'];
		}
	): Promise<User>;
	authenticate(
		strategy: string,
		event: RequestEvent,
		options?: Pick<AuthenticateOptions, 'successRedirect' | 'failureRedirect' | 'throwOnError'>
	): Promise<User>;
	authenticate(
		strategy: string,
		event: RequestEvent,
		options: Pick<AuthenticateOptions, 'successRedirect' | 'failureRedirect' | 'throwOnError'> = {}
	): Promise<User> {
		const strategyObj = this.strategies.get(strategy);
		if (!strategyObj) throw new Error(`Strategy ${strategy} not found.`);
		return strategyObj.authenticate(event, {
			throwOnError: this.throwOnError,
			...options,
			name: strategy,
			sessionKey: this.sessionKey,
			sessionErrorKey: this.sessionErrorKey,
			sessionStrategyKey: this.sessionStrategyKey
		});
	}

	/**
	 * Call this to check if the user is authenticated. It will return a Promise
	 * with the user object or null, you can use this to check if the user is
	 * logged-in or not without triggering the whole authentication flow.
	 * @example
	 * async function loader({ event }: RequestEvent) {
	 *   // if the user is not authenticated, redirect to login
	 *   let user = await authenticator.isAuthenticated(request, {
	 *     failureRedirect: "/login",
	 *   });
	 *   // do something with the user
	 *   return json(privateData);
	 * }
	 * @example
	 * async function loader({ event }: RequestEvent) {
	 *   // if the user is authenticated, redirect to /dashboard
	 *   await authenticator.isAuthenticated(request, {
	 *     successRedirect: "/dashboard"
	 *   });
	 *   return json(publicData);
	 * }
	 * @example
	 * async function loader({ event }: RequestEvent) {
	 *   // manually handle what happens if the user is or not authenticated
	 *   let user = await authenticator.isAuthenticated(request);
	 *   if (!user) return json(publicData);
	 *   return sessionLoader(request);
	 * }
	 */
	async isAuthenticated(
		event: RequestEvent,
		options?: {
			successRedirect?: never;
			failureRedirect?: never;
			headers?: never;
		}
	): Promise<User | null>;
	async isAuthenticated(
		event: RequestEvent,
		options: {
			successRedirect: string;
			failureRedirect?: never;
			headers?: HeadersInit;
		}
	): Promise<null>;
	async isAuthenticated(
		event: RequestEvent,
		options: {
			successRedirect?: never;
			failureRedirect: string;
			headers?: HeadersInit;
		}
	): Promise<User>;
	async isAuthenticated(
		event: RequestEvent,
		options: {
			successRedirect: string;
			failureRedirect: string;
			headers?: HeadersInit;
		}
	): Promise<null>;
	async isAuthenticated(
		event: RequestEvent,
		options:
			| { successRedirect?: never; failureRedirect?: never; headers?: never }
			| {
					successRedirect: string;
					failureRedirect?: never;
					headers?: HeadersInit;
			  }
			| {
					successRedirect?: never;
					failureRedirect: string;
					headers?: HeadersInit;
			  }
			| {
					successRedirect: string;
					failureRedirect: string;
					headers?: HeadersInit;
			  } = {}
	): Promise<User | null> {
		const { cookies } = event;
		const user: User | null = cookies.get(this.sessionKey)
			? JSON.parse(cookies.get(this.sessionKey) as string)
			: null;

		if (user) {
			if (options.successRedirect) {
				throw new Response(undefined, {
					status: 307,
					headers: {
						...options.headers,
						location: options.successRedirect
					}
				});
			} else return user;
		}

		if (options.failureRedirect) {
			throw new Response(undefined, {
				status: 307,
				headers: {
					...options.headers,
					location: options.failureRedirect
				}
			});
		} else return null;
	}

	/**
	 * Destroy the user session throw a redirect to another URL.
	 * @example
	 * async function action({ event }: RequestEvent) {
	 *   await authenticator.logout(event, { redirectTo: "/login" });
	 * }
	 */
	async logout(event: RequestEvent, options: { redirectTo: string }): Promise<never> {
		const { cookies } = event;
		cookies.delete(this.sessionKey);
		throw redirect(307, options.redirectTo);
	}
}
