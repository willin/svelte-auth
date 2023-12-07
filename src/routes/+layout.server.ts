import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = ({ locals }) => {
  const { user } = locals; // locals.user set by hooks.server.ts/handle(), undefined if not logged in
  return {
    user
  };
};

export const trailingSlash = 'always';
