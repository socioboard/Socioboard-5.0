'use strict';

SocioboardApp.controller('CalendarController', function ($rootScope, $scope, $http, $timeout) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        calendar();
        
  });

});