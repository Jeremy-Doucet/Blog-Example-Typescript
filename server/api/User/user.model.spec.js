"use strict";
let should = require('should');
let User = require('./user.model').User;
let atob = require('atob');

describe('User Model', () => {
  describe('hashPassword()', () => {
    it('Should return a hashed string that is different than the initial string', (done) => {
      let u = new User();
      u.hashPassword('test', (err, hash) => {
        should.not.exist(err);
        should.exist(hash);
        hash.should.not.equal('test');
        done();
      });
    });
  });
  describe('comparePassword()', () => {
    let u = new User();
    before((done) => {
      u.hashPassword('secret', (err, hash) => {
        u.password = hash;
        done();
      });
    });
    it('Should return true if the passwords match', (done) => {
      u.comparePassword('secret', (err, isMatch) => {
        should.not.exist(err);
        isMatch.should.equal(true);
        done();
      })
    });
    it('Should return false if the passwords do not match', (done) => {
      u.comparePassword('not equal', (err, isMatch) => {
        should.not.exist(err);
        isMatch.should.equal(false);
        done();
      });
    });
  });
  describe('generateJWT()', () => {
    it('Should return a jwt with 3 parts (head, body, signature)', (done) => {
      let u = new User();
      process.env.JWT_SECRET = "test";
      u.name = "test name";
      u.email = "test@test.test";
      let token = u.generateJWT();

      should.exist(token);
      // xxxx.xxxxx.xxxxx
      token.split('.').length.should.equal(3);
      let t = JSON.parse(atob(token.split('.')[1]));
      t._id.should.equal(u._id.toString());
      t.name.should.equal('test name');
      t.email.should.equal('test@test.test');
      done();
    });
  });
  describe('validation', () => {
    it('Should make name required', (done) => {
      User.schema.tree.name.required.should.equal(true);
      done();
    });
    it('Should make email: sparse, unique, trim, and lowercase', (done) => {
      let email = User.schema.tree.email;
      email.sparse.should.equal(true);
      email.unique.should.equal(true);
      email.trim.should.equal(true);
      email.lowercase.should.equal(true);
      done();
    });
    it('Should include the correct refs for Blogs and Comments', (done) => {
      User.schema.tree.blogs[0].ref.should.equal('Blog');
      User.schema.tree.comments[0].ref.should.equal('Comment');
      done();
    });
  });
});
