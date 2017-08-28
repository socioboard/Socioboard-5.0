'use strict';

SocioboardApp.controller('NotificationController', function ($rootScope, $scope, $http, $timeout) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        notification();

    });
});