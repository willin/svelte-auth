import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  const provider = event.params.provider;

  return await event.locals.auth.authenticate(event, provider as string, {
    successRedirect: '/demo',
    failureRedirect: '/'
  });
};
