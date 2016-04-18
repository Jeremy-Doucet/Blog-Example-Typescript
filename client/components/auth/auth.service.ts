namespace app.Services {
  export class AuthService {
    private safeCb = this.Util.safeCb;
    private currentUser: app.i.ICurrentUser = { _id: undefined, email: undefined, name: undefined};
    private userRoles = this.appConfig.userRoles || [];

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    public login({ email, password }: { email: string, password: string }, callback?: (error, user) => any) {
      return this.$http.post('/api/v1/auth/local', {
        email: email,
        password: password
      })
        .then(res => {
          this.$cookies.put('token', res.data['token']);
          this.setUser();
          return this.currentUser['$promise'];
        })
        .then(user => {
          this.safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          this.logout();
          this.safeCb(callback)(err.data);
          return this.$q.reject(err.data);
        });
    }

    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    public createUser(user, callback) {
      let q = this.$q.defer();
      this.$http.post('/api/v1/auth/local/login', user).then((res) => {
        this.$cookies.put('token', res.data['token']);
        this.setUser();
        q.resolve();
      }, (err) => {
        this.logout();
        q.reject(err);
      });
    }

    /**
     * Delete access token and user info
     */
    public logout() {
      this.$cookies.remove('token');
      this.currentUser._id = null;
      this.currentUser.name = null;
      this.currentUser.email = null;
    }

    /**
     * Gets all available info on a user
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
    public getCurrentUser(callback): any {
      if (arguments.length === 0) {
        return this.currentUser;
      }

      let value = (this.currentUser.hasOwnProperty('$promise')) ?
        this.currentUser['$promise'] : this.currentUser;
      return this.$q.when(value)
        .then(user => {
          this.safeCb(callback)(user);
          return user;
        }, () => {
          this.safeCb(callback)({});
          return {};
        });
    }

    /**
     * Check if a user is logged in
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */
    public isLoggedIn(callback) {
      if (arguments.length === 0) {
        return this.currentUser.hasOwnProperty('role');
      }

      return this.getCurrentUser(null)
        .then(user => {
          let is = user.hasOwnProperty('role');
          this.safeCb(callback)(is);
          return is;
        });
    }

     /**
      * Check if a user has a specified role or higher
      *   (synchronous|asynchronous)
      *
      * @param  {String}     role     - the role to check against
      * @param  {Function|*} callback - optional, function(has)
      * @return {Bool|Promise}
      */
    public hasRole(role, callback) {
      let hasRole = function(r, h) {
        return this.userRoles.indexOf(r) >= this.userRoles.indexOf(h);
      };

      if (arguments.length < 2) {
        return hasRole(this.currentUser['role'], role);
      }

      return this.getCurrentUser(null)
        .then(user => {
          let has = (user.hasOwnProperty('role')) ?
            hasRole(user.role, role) : false;
          this.safeCb(callback)(has);
          return has;
        });
    }

     /**
      * Check if a user is an admin
      *   (synchronous|asynchronous)
      *
      * @param  {Function|*} callback - optional, function(is)
      * @return {Bool|Promise}
      */
    public isAdmin() {
      return this.hasRole
        .apply(this, [].concat.apply(['admin'], arguments));
    }

    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
    public getToken() {
      return this.$cookies.get('token');
    }

    /**
     * Get the current user from the JWT, and sets the properties to this.currentUser
     */
    public setUser() {
      let u = JSON.parse( atob( this.$cookies.get('token').split('.')[1]));
      this.currentUser._id = u._id;
      this.currentUser.name = u.name;
      this.currentUser.email = u.email;
    }

    constructor(
      private $location: ng.ILocationService,
      private $http: ng.IHttpService,
      private $cookies: ng.cookies.ICookiesService,
      private $q: ng.IQService,
      private appConfig,
      private Util,
      private User
    ) {
      if ($cookies.get('token') && $location.path() !== '/logout') this.setUser();
    }
  }

  angular.module('app.auth').service('Auth', AuthService);
}
