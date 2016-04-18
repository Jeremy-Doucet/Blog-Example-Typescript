angular.module('app')
  .config(($stateProvider: ng.ui.IStateProvider) => {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('logout', {
        url: '/logout?referrer',
        template: '',
        controller: function($state: ng.ui.IStateService, Auth) {
          let referrer = $state.params['referrer'] ||
            $state.current['referrer'] ||
            'main';
          Auth.logout();
          $state.go(referrer);
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupController',
        controllerAs: 'vm'
      });
    })
    .run(($rootScope) => {
      $rootScope.$on('$stateChangeStart', (event, next, nextParams, current) => {
        if (next.name === 'logout' && current && current.name && !current.authenticate) {
          next.referrer = current.name;
        }
      });
    });
