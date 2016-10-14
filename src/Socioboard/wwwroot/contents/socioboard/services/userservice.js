SocioboardApp.service('userservice', function ($http, $rootScope, apiDomain,domain) {
    this.updateLocalUser = function () {
        $http.get(domain + '/home/UpdateUser')
                      .then(function (response) {
                          window.location.reload();
                      }, function (reason) {
                          $rootScope.error = reason.data;
                      });
    }
});