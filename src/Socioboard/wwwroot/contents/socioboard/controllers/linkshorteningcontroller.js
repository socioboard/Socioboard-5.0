'use strict';

SocioboardApp.controller('LinkShorteningController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        link_shortening();
        $scope.accountType = $rootScope.user.AccountType;
        $scope.shortnerSettingsdisabled = 0;
        $scope.message = function () {
            swal("If You want to use this feature upgrade to higher business plan ");
            
        };
        if ($rootScope.user.urlShortnerStatus == 0) {
            $scope.shortnerSettings = 0;
        }
        else if ($rootScope.user.urlShortnerStatus == 1) {
            $scope.shortnerSettings = 1;
        }
        else if ($rootScope.user.urlShortnerStatus == 2) {
            $scope.shortnerSettings = 2;
        }


        $scope.UpdateStatus = function (tempStatus) {
            $rootScope.user.urlShortnerStatus = tempStatus;
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/UpdateurlShortnerStatus?userId=' + $rootScope.user.Id + '&staTus=' + tempStatus,
                }).then(function (response) {
                    
                }, function (reason) {

                });
        }


    });
});