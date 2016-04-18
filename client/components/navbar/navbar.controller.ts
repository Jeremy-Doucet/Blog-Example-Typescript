namespace app.navbar {
  export class NavbarController {
    public isCollapsed = true;
  }

  angular.module('app').controller('NavbarController', NavbarController);
}
