import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
/* istanbul ignore next */
const SALT_ROUNDS = (process.env.NODE_ENV === 'test') ? 1 : 10;

export interface IUserModel extends app.i.IUser, mongoose.Document {
  hashPassword(password: string, cb: (err, hash: string) => any);
  generateJWT(): string;
  comparePassword(password: string, cb: (err, isMatch: boolean) => any);
}

let userSchema = new mongoose.Schema({
  email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  password: { type: String },
  age: { type: Number },
  gender: { type: String },
  bio: { type: String },
  location: { type: String },
  name: { type: String, required: true },
  imageUrl: { type: String },

  facebook: {
    id: String,
    token: String
  },

  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

userSchema.method('hashPassword', function(password, done) {
  bcrypt.genSalt(SALT_ROUNDS, (saltErr, salt) => {
    /* istanbul ignore next */
    if (saltErr) return done(saltErr);
    bcrypt.hash(password, salt, (hashErr, hash) => {
      /* istanbul ignore next */
      if (hashErr) return done(hashErr);
      done(null, hash);
    });
  });
});

userSchema.method('comparePassword', function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    /* istanbul ignore next */
    if (err) return done(err);
    done(null, isMatch);
  });
});

userSchema.method('generateJWT', function() {
  return jwt.sign({
    name: this.name,
    email: this.email,
    _id: this._id
  }, process.env.JWT_SECRET);
});

export let User = mongoose.model<IUserModel>('User', userSchema);
