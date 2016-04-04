namespace app.Constants {
  angular.module('app.constants', [])
    .constant('appConfig', {
      'userRoles': [
        'guest',
        'user',
        'admin'
      ]
    })
}
