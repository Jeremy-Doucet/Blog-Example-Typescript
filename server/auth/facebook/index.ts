import * as express from 'express';
import * as passport from 'passport';
import { redirectJWT } from '../auth.service';

const router = express.Router();

router.get('/', passport.authenticate('facebook', {
  scope: ['email', 'user_about_me'],
  session: false
}));

router.get('/', passport.authenticate('facebook', {
  scope: ['email', 'user_about_me'],
  session: false
}), redirectJWT);

export = router;
