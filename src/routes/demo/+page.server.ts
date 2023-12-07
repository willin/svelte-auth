import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async (event) => {
  const user = event.locals.user || { invalid: true };
  return { user };
};
