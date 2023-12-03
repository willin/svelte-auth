import { describe, it, expect } from 'vitest';
import { default as t } from '.';

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		t();
		expect(1 + 2).toBe(3);
	});
});
