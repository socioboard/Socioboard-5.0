'use strict';

SocioboardApp.controller('YourFollowerController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        var nomessages = false;
        var lastreach = false;


        $scope.twtfollower = function () {
            debugger;
            $http.get(apiDomain + '/api/Twitter/TwitterUserFollowers?profileId=' + $stateParams.profileId)
                           .then(function (response) {
                             $scope.twtfollowerdata = response.data;
                             $scope.lastreach = true;
                             $scope.nomessages = true;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        }
        $scope.twtfollower();

    });
});