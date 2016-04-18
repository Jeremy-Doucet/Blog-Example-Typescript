namespace app.Services {
  export function authInterceptor(
    $rootScope: ng.IRootScopeService,
    $q: ng.IQService,
    $cookies: ng.cookies.ICookiesService,
    $injector,
    Util: app.Services.UtilService
  ) {
    let state;
    return {
      // Add authorization token to headers
      request(config) {
        config.headers = config.headers || {};
        if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError(response) {
        if (response.status === 401) {
          (state || (state = $injector.get('$state'))).go('login');
          // remove any stale tokens
          $cookies.remove('token');
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('app.auth')
    .factory('authInterceptor', authInterceptor);

}
