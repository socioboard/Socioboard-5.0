'use strict';

SocioboardApp.controller('BillingController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        billing();

        //current plan detail start
        $scope.currentplan = function () {
            debugger;
           
            $http.get(apiDomain + '/api/Billing/CurrentPlanDetails?userid=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.plandetails = response.data;
                            
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        //current plan detail End

        $scope.getOnPageLoadReports = function () {
            $scope.currentplan();
        }

        $scope.getOnPageLoadReports();
    });
});