///// <reference path="../../../shared/IUser.ts"/>
namespace app.Services {
  interface IUserResourceClass extends app.i.IUser, ng.resource.IResource<IUserResourceClass> { };
  interface IUserResource extends ng.resource.IResourceClass<IUserResourceClass> { };

  export class UserResource {
    private UserResource: IUserResource;

    constructor($resource: ng.resource.IResourceService) {
      this.UserResource = <IUserResource>$resource('/api/v1/users', null, {
        changePassword: {
          method: 'PUT'
        }
      });
    }
  }
  angular.module('app.auth').service('User', UserResource);
}
