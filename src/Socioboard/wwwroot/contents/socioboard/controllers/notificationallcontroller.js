'use strict';

SocioboardApp.controller('NotificationAllController', function ($rootScope, $scope, $http, $timeout, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        notification_all();
        //All notification
        $scope.LoadAllNotifications = function () {
            $http.get(apiDomain + '/api/Notifications/FindAllNotifications?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstnotifications = response.data;
                                  $http.get(apiDomain + '/api/Notifications/UpdateNotifications?userId=' + $rootScope.user.Id)
                                  .then(function (response) {
                                      $scope.updated = response.data;
                                  })
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds

        }
        $scope.LoadAllNotifications();
    });
});