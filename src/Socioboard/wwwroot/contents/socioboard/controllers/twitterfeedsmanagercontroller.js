'use strict';

SocioboardApp.controller('TwitterFeedsManagerController', function ($rootScope, $scope, $http, $timeout) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        twitterfeedsmanager();
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