import * as passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../api/User/user.model';

export function setup(config) {
  passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: [ 'displayName', 'emails', 'location', 'gender', 'bio', 'aboutMe' ],
    passReqToCallback: true
  }, callback));
}

export function callback(req, accessToken: string, refreshToken: string, profile, done) {
  User.findOne({ 'facebook.id': profile.id }).exec((err, user) => {
        if (err) return done(err);
        if (user) {
          req['tempUser'] = user;
          done(null, user);
        } else {
          let u = new User();
          u.name = profile.displayName;
          u.gender = profile.gender;
          u.imageUrl = profile.photos[0].value;
          u.facebook.id = profile.id;
          u.facebook.token = accessToken;
          u.save((saveErr, savedUser) => {
            if (saveErr) return done(saveErr);
            req['tempUser'] = savedUser;
            done(null, savedUser);
          });
        }
      });
}
