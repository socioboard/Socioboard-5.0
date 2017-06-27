'use strict';

SocioboardApp.controller('ExtensionsController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        extensions();


    });
});