'use strict';

SocioboardApp.controller('YoutubeSearchController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        var nomessages = false;
        var lastreach = false;


        $scope.twtfollower = function () {

            $http.get(apiDomain + '/api/Twitter/TwitterMentions?profileId=' + $stateParams.profileId)
                           .then(function (response) {

                               if (response.data == "") {
                                   swal("Sorry no mentions available right now");
                               }
                               $scope.twtmentiondata = response.data;
                               $scope.lastreach = true;
                               $scope.nomessages = true;
                           }, function (reason) {
                               $scope.error = reason.data;
                           });

        }
        $scope.twtfollower();

    });
});