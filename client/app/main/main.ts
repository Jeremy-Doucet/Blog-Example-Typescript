namespace app {
  angular.module('app').config(($stateProvider: ng.ui.IStateProvider) => {
    $stateProvider.state('Home', {
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'vm'
    });
  });
}
