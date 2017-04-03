'use strict';

SocioboardApp.controller('LinkShareathonController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        linkshareathon();
        $scope.deletelinkhareathon = function(profileId){
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send message via this account!",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            $http.post(apiDomain + '/api/Shareathon/DeleteLinkShareathon?LinkShareathodId=' + profileId)
                               .then(function (response) {
                                   if (response.data == "success")
                                   {
                                       swal('successfully deleted');
                                       $scope.loadpageshareathon();
                                   }
                               }, function (reason) {
                                   $scope.error = reason.data;
                               });
	            });
        }

        $scope.loadpageshareathon = function () {

            //codes to get  link shreathon
            $http.get(apiDomain + '/api/Shareathon/UserLinkShareathon?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstlinkhareathon = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to get link shreathon
        }

        $scope.loadpageshareathon();

  });

});