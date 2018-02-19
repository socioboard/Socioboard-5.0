'use strict';

SocioboardApp.controller('PageShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        pageshareathon();
        $scope.deletepageshareathon = function(profileId){
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send any message via this account!",
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            $http.post(apiDomain + '/api/Shareathon/DeletePageShareathon?PageShareathodId=' + profileId)
                            .then(function (response) {
                                if (response.data == "success") {
                                    swal("Deleted!", "Your profile has been deleted.", "success");
                                    $scope.loadpageshareathon();
                                }
                            }, function (reason) {
                                $scope.error = reason.data;
                             });
	            });
        }

        $scope.loadpageshareathon = function () {
           
                //codes to get  page shreathon
            $http.get(apiDomain + '/api/Shareathon/UserpageShareathon?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstpageshareathon = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to get page shreathon
        }

        $scope.loadpageshareathon();

        //$scope.deletepageshareathon = function (PageShareathodId)
        //{
        //    //codes to delete  page shreathon
        //    $http.post(apiDomain + '/api/Shareathon/DeletePageShareathon?PageShareathodId=' + PageShareathodId)
        //                      .then(function (response) {
        //                          swal(response.data);
        //                          $scope.loadpageshareathon();
        //                      }, function (reason) {
        //                          $scope.error = reason.data;
        //                      });
        //    // end codes to delete page shreathon
        //}


        $scope.editpageshareathon = function (pageshareathon) {
            $rootScope.pageshareathondata = pageshareathon;
           // console.log($rootScope.pageshareathondata);
            window.location.href = "#/edit_page_shareathon.html";
        }

  });

});