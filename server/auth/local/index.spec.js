'use strict';
let proxyquire = require('proxyquire')
  .noPreserveCache();

let controlStub = {
  login: 'controller.login',
  register: 'controller.register'
};

let routerStub = {
  post: sinon.spy()
};

let localIndex = proxyquire('./index', {
  'express': {
    Router() {
      return routerStub
    }
  },
  './controller': controlStub
});

describe('Local Auth Router:', () => {
  it('Shouyld return an express router instance', function() {
    localIndex.should.equal(routerStub);
  });
  describe('POST: /api/v1/auth/local/login', () => {
    it('Should route to controller.login', () => {
      console.log(routerStub);
      routerStub.post.withArgs('/login', 'controller.login').should.have.been.calledOnce;
    });
  });
  describe('POST: /api/v1/auth/local/register', () => {
    it('Should route to controller.register', () => {
      routerStub.post.withArgs('/register', 'controller.register').should.have.been.calledOnce;
    });
  });
});
