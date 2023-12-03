import { describe, test, expect } from 'vitest';
import { Authorizer } from './authorizer.js';
import { Authenticator } from './authenicator.js';
import { AuthorizationError } from './error.js';

describe(Authorizer, () => {
	type User = {
		id: number;
		token: string;
		email: string;
		role: string;
	};

	const user: User = {
		id: 1,
		token: 'token',
		email: 'test@example.com',
		role: 'admin'
	};

	const authenticator = new Authenticator<User>();

	test('it should return the user as result', async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isAdmin({ user }) {
				return user.role === 'admin';
			}
		]);

		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};

		await expect(
			authorizer.authorize({ event, params: { id: '1' }, context: {} })
		).resolves.toEqual(user);
	});

	test('if user is not logged in throw a Unauthorized response', async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isAdmin({ user }) {
				return user.role === 'admin';
			}
		]);

		const event = {
			cookies: {
				set() {},
				get() {
					return null;
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize({ event, params: { id: '1' }, context: {} });
		} catch (error) {
			expect(error instanceof Response).toBe(true);
			const resp = error as Response;
			expect(resp.status).toBe(401);
			expect(await resp.json()).toEqual({ message: 'Not authenticated.' });
		}
	});

	test('if user is not logged in an failureRedirect is defined redirect', async () => {
		const event = {
			cookies: {
				set() {},
				get() {
					return null;
				},
				delete() {}
			}
		};

		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isAdmin({ user }) {
				return user.role === 'admin';
			}
		]);
		try {
			await authorizer.authorize(
				{ event, params: { id: '1' }, context: {} },
				{ raise: 'redirect', failureRedirect: '/login' }
			);
		} catch (error) {
			expect(error).toEqual(new AuthorizationError('Invalid status code'));
		}
	});

	test("if user doesn't pass rule throw a Forbidden response", async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isNotAdmin({ user }) {
				return user.role !== 'admin';
			}
		]);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize({ event, params: { id: '1' }, context: {} });
		} catch (error) {
			expect(error instanceof Response).toBe(true);
			const resp = error as Response;
			expect(resp.status).toBe(403);
			expect(await resp.json()).toEqual({
				message: 'Forbidden by policy isNotAdmin'
			});
		}
	});

	test("if user doesn't pass rule throw a Forbidden response without the policy name if it's an arrow function", async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async ({ user }) => user.role !== 'admin'
		]);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};

		try {
			await authorizer.authorize({ event, params: { id: '1' }, context: {} });
		} catch (error) {
			expect(error instanceof Response).toBe(true);
			const resp = error as Response;
			expect(resp.status).toBe(403);
			expect(await resp.json()).toEqual({
				message: 'Forbidden'
			});
		}
	});

	test("if user doesn't pass rule and failureRedirect is defined throw a redirect", async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isNotAdmin({ user }) {
				return user.role !== 'admin';
			}
		]);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize(
				{ event, params: { id: '1' }, context: {} },
				{ raise: 'redirect', failureRedirect: '/login' }
			);
		} catch (error) {
			expect(error.location).toBe('/login');
			expect(error.status).toBe(307);
		}
	});

	test('raise error without rule name', async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function ({ user }) {
				return user.role !== 'admin';
			}
		]);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize(
				{ event, params: { id: '1' }, context: {} },
				{ raise: 'xxx', failureRedirect: '/login' }
			);
		} catch (error) {
			expect(error).toEqual(new AuthorizationError('Forbidden.'));
		}
	});

	test('raise error', async () => {
		const authorizer = new Authorizer<User, string>(authenticator, [
			async function isNotAdmin({ user }) {
				return user.role !== 'admin';
			}
		]);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize(
				{ event, params: { id: '1' }, context: {} },
				{ raise: 'xxx', failureRedirect: '/login' }
			);
		} catch (error) {
			expect(error).toEqual(new AuthorizationError('Forbidden by policy isNotAdmin'));
		}
	});

	test('empty rules', async () => {
		const authorizer = new Authorizer<User, string>(authenticator);
		const event = {
			cookies: {
				set() {},
				get() {
					return JSON.stringify(user);
				},
				delete() {}
			}
		};
		try {
			await authorizer.authorize(
				{ event, params: { id: '1' }, context: {} },
				{ raise: 'redirect', failureRedirect: '/login' }
			);
		} catch (error) {
			expect(error.location).toBe('/login');
			expect(error.status).toBe(307);
		}
	});
});
