'use strict';
namespace app.Controllers {
  export class SignupController {
    //start-non-standard
    user: { name: string, email: string, password: string } = { name: null, email: null, password: null };
    errors = {};
    submitted = false;
    //end-non-standard

    constructor(private Auth, private $state) { }

    register() {
      this.submitted = true;

      this.Auth.createUser({
        name: this.user.name,
        email: this.user.email,
        password: this.user.password
      })
        .then(() => {
        // Account created, redirect to home
        this.$state.go('Home');
      }, (err) => {
        err = err.data;
        this.errors = {};
      });
    }
  }

  angular.module('app').controller('SignupController', SignupController);

}
