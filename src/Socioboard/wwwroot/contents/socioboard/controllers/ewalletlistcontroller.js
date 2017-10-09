'use strict';

SocioboardApp.controller('EwalletlistController', function ($rootScope, $scope, $http, $timeout, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        ewalletlist();
        $scope.getEwalletTransactions = function () {
            
            $http.get(apiDomain + '/api/Ewallet/GetEwalletTransactions?userid=' + $rootScope.user.Id)
           .then(function (response) {
               $scope.ewalletTransactions = response.data;
           }, function (reason) {
               $scope.error = reason.data;
           });
        }

        $scope.getEwalletTransactions();

    });
    
    $scope.balance = function () {
        $http.get(apiDomain + '/api/Ewallet/UserBalance?userid=' + $rootScope.user.Id)
       .then(function (response) {
           $scope.balancedetails = response.data;
       }, function (reason) {
           $scope.error = reason.data;
       });
    }
    $scope.balance();

});

SocioboardApp.directive('myRepeatVideoTabDirectives', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
            $('#EwalletList').DataTable();
            });
        }
    };
})