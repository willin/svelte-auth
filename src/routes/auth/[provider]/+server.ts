import { redirect, type RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
  if (event.locals.user) {
    throw redirect(307, '/demo');
  }
  const { request } = event;
  const provider = event.params.provider;
  const referer = request.headers.get('referer');
  const returnPath = referer ? new URL(referer).pathname : '/';

  return await event.locals.auth.authenticate(event, provider as string, {
    successRedirect: returnPath,
    failureRedirect: returnPath
  });
};
