'use strict';

SocioboardApp.controller('FacebookFeedsManagerController', function ($rootScope, $scope, $http, $timeout) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        facebookfeedsmanager();
        $('.collapsible').collapsible({
	      accordion : false 
        });

        $scope.openModels=function()
        {
            $('#chatComment').openModal();
            $('#closeDiv').closeModal();
        }
            
    });
});