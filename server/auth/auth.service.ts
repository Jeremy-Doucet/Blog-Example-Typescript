import * as express from 'express';

/**
 * Redirect the user to the home page, and place a jwt in the query param 'code'
 */
export function redirectJWT(req: express.Request, res: express.Response, next: Function) {
  if (!req['tempUser']) return next({ status: 404, message: 'You could not be logged in. Please try again.' });

  res.redirect(`/?code=${req['tempUser'].generateJWT()}`);
}
