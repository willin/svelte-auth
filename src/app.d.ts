/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: unknown;
		}
		// interface PageData {}
		interface Platform {
			env: {
				SSO_ID: string;
				SSO_SECRET: string;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
