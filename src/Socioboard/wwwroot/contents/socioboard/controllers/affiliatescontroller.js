'use strict';

SocioboardApp.controller('AffiliatesController', function ($rootScope, $scope, $http, $timeout) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        affiliates();

  });

});