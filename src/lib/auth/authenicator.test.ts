import { describe, test, expect } from 'vitest';
import { Strategy } from './strategy.js';
import { Authenticator } from './authenicator.js';
import type { RequestEvent } from '@sveltejs/kit';
import { AuthorizationError } from './error.js';

const event = {
	cookies: {
		set() {},
		get() {},
		delete() {}
	}
};

class MockStrategy<User> extends Strategy<User, Record<string, never>> {
	name = 'mock';

	async authenticate(event: RequestEvent, options: AuthenticateOptions) {
		const user = await this.verify({});
		if (user) return await this.success(user, event, options);
		return await this.failure(
			'Invalid credentials',
			event,
			options,
			new Error('Invalid credentials')
		);
	}
}

describe(Authenticator, () => {
	test('should be able to add a new strategy calling use', async () => {
		const response = new Response('It works!', {
			// @ts-expect-error this should work
			url: ''
		});

		const authenticator = new Authenticator<Response>();

		expect(authenticator.use(new MockStrategy(async () => response))).toBe(authenticator);
		expect(await authenticator.authenticate('mock', event)).toEqual(response);
	});

	test('should be able to remove a strategy calling unuse', async () => {
		const response = new Response('It works!');

		const authenticator = new Authenticator<Response>();
		authenticator.use(new MockStrategy(async () => response));

		expect(authenticator.unuse('mock')).toBe(authenticator);
	});

	test('should throw if the strategy was not found', async () => {
		const request = new Request('http://.../test');
		const authenticator = new Authenticator();

		expect(() => authenticator.authenticate('unknown', request)).toThrow(
			'Strategy unknown not found.'
		);
	});

	test('should store the strategy provided name in the session if no custom name provided', async () => {
		const user = { id: '123' };

		const authenticator = new Authenticator({
			sessionStrategyKey: 'strategy-name'
		});
		authenticator.use(new MockStrategy(async () => user));

		try {
			await authenticator.authenticate('mock', event, {
				successRedirect: '/'
			});
		} catch (error) {
			expect(error.location).toBe('/');
			expect(error.status).toBe(307);
		}
	});

	test('should redirect after logout', async () => {
		try {
			await new Authenticator({
				sessionKey: 'user'
			}).logout(event, { redirectTo: '/login' });
		} catch (error) {
			expect(error.location).toBe('/login');
			expect(error.status).toBe(307);
		}
	});

	describe('isAuthenticated', () => {
		test("should return the user if it's on the session", async () => {
			const user = { id: '123' };
			const e = {
				cookies: {
					get() {
						return user;
					}
				}
			};

			expect(
				new Authenticator({
					sessionKey: 'user'
				}).isAuthenticated(e)
			).resolves.toEqual(user);
		});

		test("should return null if user isn't on the session", () => {
			expect(new Authenticator().isAuthenticated(event)).resolves.toEqual(null);
		});

		test('should throw a redirect if failureRedirect is defined', () => {
			const resp = new Response(undefined, {
				status: 307,
				header: {
					location: '/login'
				}
			});
			expect(
				new Authenticator().isAuthenticated(event, {
					failureRedirect: '/login'
				})
			).rejects.toEqual(resp);
		});

		test('should throw a redirect if successRedirect is defined', async () => {
			const user = { id: '123' };
			const e = {
				cookies: {
					get() {
						return user;
					}
				}
			};
			const response = new Response(undefined, {
				status: 307,
				header: {
					location: '/dashboard'
				}
			});

			expect(
				new Authenticator().isAuthenticated(e, {
					successRedirect: '/dashboard'
				})
			).rejects.toEqual(response);
		});

		test('should throw an error if throwOnError is enabled', async () => {
			const authenticator = new Authenticator();

			authenticator.use(new MockStrategy(async () => null));

			const error = await authenticator
				.authenticate('mock', event, {
					throwOnError: true
				})
				.catch((error) => error);

			expect(error).toEqual(new AuthorizationError('Invalid credentials'));

			expect((error as AuthorizationError).cause).toEqual(new TypeError('Invalid credentials'));
		});
	});
});
