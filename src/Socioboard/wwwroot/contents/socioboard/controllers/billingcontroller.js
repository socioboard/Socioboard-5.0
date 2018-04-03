'use strict';

SocioboardApp.controller('BillingController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        billing();
        //$scope.accountType = $rootScope.user.AccountType;
        //$scope.planname;
        //$scope.planprofiles;
        //$scope.plangroups;
        //$scope.planprice;
        //if ($scope.accountType == 0)
        //{
        //    $scope.planname = "Basic",
        //    $scope.planprofiles=5,
        //    $scope.plangroups="1 default Group",
        //    $scope.planprice="Free"
        //}
        //else if ($scope.accountType == 1)
        //{
        //    $scope.planname = "Standard",
        //    $scope.planprofiles = 10,
        //    $scope.plangroups = "1 default Group",
        //    $scope.planprice = "$4.99"

        //}
        //else if ($scope.accountType == 2) {
        //    $scope.planname = "Premium",
        //    $scope.planprofiles = 20,
        //    $scope.plangroups = "1 default Group",
        //    $scope.planprice = "$9.99"
        //}
        //else if ($scope.accountType == 3) {
        //    $scope.planname = "Deluxe",
        //    $scope.planprofiles = 50,
        //    $scope.plangroups = "5 Groups",
        //    $scope.planprice = "$19.99"
        //}
        //else if ($scope.accountType == 4) {
        //    $scope.planname = "Topaz",
        //    $scope.planprofiles = 100,
        //    $scope.plangroups = "10 Groups",
        //    $scope.planprice = "$29.99"
        //}
        //else if ($scope.accountType == 5) {
        //    $scope.planname = "Ruby",
        //    $scope.planprofiles = 200,
        //    $scope.plangroups = "15 Groups",
        //    $scope.planprice = "$49.99"
        //}
        //else if ($scope.accountType == 6) {
        //    $scope.plannamee = "Gold",
        //    $scope.planprofiles = 500,
        //    $scope.plangroups = "20 Groups",
        //    $scope.planprice = "$79.99"
        //}
        //else if ($scope.accountType == 7) {
        //    $scope.planname = "Platinum",
        //    $scope.planprofiles = 1000,
        //    $scope.plangroups = "25 Groups",
        //    $scope.planprice = "$99.99"
        //}
        //current plan detail start
        $scope.currentplan = function () {
            $http.get(apiDomain + '/api/Billing/CurrentPlanDetails?userid=' + $rootScope.user.Id )
                          .then(function (response) {
                              $scope.plandetails = response.data;
                              console.log($scope.plandetails);
                              
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        //current plan detail End

         //Get User detail start
        $scope.GetUserdetail = function () {
           
            $http.get(apiDomain + '/api/User/GetUser?Id=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.userdetails = response.data;
                              $scope.accountType = $scope.userdetails.accountType;
                              $scope.planname;
                              $scope.planprofiles;
                              $scope.plangroups;
                              $scope.planprice;
                              if ($scope.accountType == 0) {
                                  $scope.planname = "Basic",
                                  $scope.planprofiles = 5,
                                  $scope.plangroups = "0 Group",
                                  $scope.planprice = "Free"
                              }
                              else if ($scope.accountType == 1) {
                                  $scope.planname = "Standard",
                                  $scope.planprofiles = 10,
                                  $scope.plangroups = "0 Group",
                                  $scope.planprice = "$4.99"

                              }
                              else if ($scope.accountType == 2) {
                                  $scope.planname = "Premium",
                                  $scope.planprofiles = 20,
                                  $scope.plangroups = "0 Group",
                                  $scope.planprice = "$9.99"
                              }
                              else if ($scope.accountType == 3) {
                                  $scope.planname = "Deluxe",
                                  $scope.planprofiles = 50,
                                  $scope.plangroups = "5 Groups",
                                  $scope.planprice = "$19.99"
                              }
                              else if ($scope.accountType == 4) {
                                  $scope.planname = "Topaz",
                                  $scope.planprofiles = 100,
                                  $scope.plangroups = "10 Groups",
                                  $scope.planprice = "$29.99"
                              }
                              else if ($scope.accountType == 5) {
                                  $scope.planname = "Ruby",
                                  $scope.planprofiles = 200,
                                  $scope.plangroups = "15 Groups",
                                  $scope.planprice = "$49.99"
                              }
                              else if ($scope.accountType == 6) {
                                  $scope.plannamee = "Gold",
                                  $scope.planprofiles = 500,
                                  $scope.plangroups = "20 Groups",
                                  $scope.planprice = "$79.99"
                              }
                              else if ($scope.accountType == 7) {
                                  $scope.planname = "Platinum",
                                  $scope.planprofiles = 1000,
                                  $scope.plangroups = "25 Groups",
                                  $scope.planprice = "$99.99"
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        //Get User detail End

        //Cancel plan Start
        $scope.cancelplan = function () {
         
            $http.get(apiDomain + '/api/User/CancelPlan?id=' + $rootScope.user.Id)
                           .then(function (response) {
                               $scope.success = response.data;
                              alertify.set({ delay: 5000});
                              alertify.success(response.data);
                               window.location.reload();
                              }, function (reason) {
                                  $scope.error = reason.data;
                                   alertify.set({delay: 5000});
                                   alertify.error(reason.data);
                                   $('#CancelPlanModal').closeModal();
                                 // window.location.reload();
                           });
        }
        //Cancel plan  End

        $scope.getOnPageLoadReports = function () {
            $scope.currentplan();
            $scope.GetUserdetail();
        }

        $scope.getOnPageLoadReports();
    });
});