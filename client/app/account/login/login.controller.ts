'use strict';
namespace app.Controllers {
  export class LoginController {
    public submitted = false;
    public user: { email: string, password: string } = { email: null, password: null };
    public errors = { other: null };

    constructor(private Auth: app.Services.AuthService, private $state) { }

    login() {
      this.submitted = true;

      this.Auth.login({
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
        // Logged in, redirect to home
        this.$state.go('Home');
      })
        .catch(err => {
        this.errors.other = err.message;
      });
    }
  }

  angular.module('app').controller('LoginController', LoginController);
}
