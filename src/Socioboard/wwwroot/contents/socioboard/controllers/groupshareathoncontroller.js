'use strict';

SocioboardApp.controller('GroupShareathonController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        groupshareathon();
        $scope.deleteMsg = function(profileId){
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
	            swal("Deleted!", "Your profile has been deleted.", "success"); 
	            });
        }


        $scope.loadgroupshareathon = function () {

            //codes to get  page shreathon
            $http.get(apiDomain + '/api/Shareathon/UsergroupShareathon?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstgroupshareathon = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to get page shreathon
        }

        $scope.loadgroupshareathon();

        $scope.deletegrouphareathon = function (GroupShareathodId) {
            //codes to delete  page shreathon
            $http.post(apiDomain + '/api/Shareathon/DeleteGroupShareathon?GroupShareathodId=' + GroupShareathodId)
                              .then(function (response) {
                                  swal(response.data);
                                  $scope.loadgroupshareathon();
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to delete page shreathon
        }


        $scope.editgrouphareathon = function (grouphareathon) {
            console.log(grouphareathon);
            $rootScope.grouphareathondata = grouphareathon;
            $http.get(apiDomain + '/api/Facebook/GetFacebookGroup?profileId=' + $rootScope.grouphareathondata.facebookaccountid)
                     .then(function (response) {
                         $rootScope.lstfacebookgroup = response.data;
                     }, function (reason) {
                         $scope.error = reason.data;
                     });
            window.location.href = "#/edit_group_shareathon.html";
        }

  });

});