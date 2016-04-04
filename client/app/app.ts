namespace app {
  angular.module('app', [
    'app.constants',
    'ngResource',
    'ngSanitize',
    'ui.router'
  ])
    .config(($urlRouterProvider: ng.ui.IUrlRouterProvider, $locationProvider: ng.ILocationProvider) => {

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });
}
