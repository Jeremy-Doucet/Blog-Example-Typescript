namespace app.Services {
  /**
   * The Util service is for thin, globally reusable, utility functions
   */
  export class UtilService {

    /**
     * Return a callback or noop function
     *
     * @param  {Function|*} cb - a 'potential' function
     * @return {Function}
     */
    public safeCb(cb) {
      return (angular.isFunction(cb)) ? cb : angular.noop;
    }

    /**
     * Parse a given url with the use of an anchor element
     *
     * @param  {String} url - the url to parse
     * @return {Object}     - the parsed url, anchor element
     */
    public urlParse(url: string) {
      let a = document.createElement('a');
      a.href = url;

      // Special treatment for IE, see http://stackoverflow.com/a/13405933 for details
      if (a.host === '') {
        a.href = a.href;
      }

      return a;
    }

    /**
     * Test whether or not a given url is same origin
     *
     * @param  {String}           url       - url to test
     * @param  {String|String[]}  [origins] - additional origins to test against
     * @return {Boolean}                    - true if url is same origin
     */
    public isSameOrigin(url, origins?) {
      url = this.urlParse(url);
      origins = (origins && [].concat(origins)) || [];
      origins = origins.map(this.urlParse);
      origins.push(this.$window.location);
      origins = origins.filter(function(o) {
        return url.hostname === o.hostname &&
          url.port === o.port &&
          url.protocol === o.protocol;
      });
      return (origins.length >= 1);
    }

    constructor (private $window: ng.IWindowService) {}
  }

  angular.module('app.util').service('Util', UtilService);
}
