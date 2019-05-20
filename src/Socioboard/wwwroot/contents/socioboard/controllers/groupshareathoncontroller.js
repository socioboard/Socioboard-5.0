'use strict';
SocioboardApp.controller('GroupShareathonController', function ($rootScope, $scope, $http, $timeout, $modal, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        groupshareathon();
        $scope.dispbtnsharethon = true;
        $scope.deletegrouphareathon = function (profileId) {
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send any message via this account!",
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	          function () {
	              //todo: code to delete profile
	              $http.post(apiDomain + '/api/Shareathon/DeleteGroupShareathon?GroupShareathodId=' + profileId)
                                 .then(function (response) {
                                     if (response.data == "success") {
                                         swal("Deleted!", "Your profile has been deleted.", "success");
                                         $scope.loadgroupshareathon();
                                     }
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
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
        $scope.current = 1;
        //$scope.deletegrouphareathon = function (GroupShareathodId) {
        //    //codes to delete  page shreathon
        //    $http.post(apiDomain + '/api/Shareathon/DeleteGroupShareathon?GroupShareathodId=' + GroupShareathodId)
        //                      .then(function (response) {
        //                          swal(response.data);
        //                          $scope.loadgroupshareathon();
        //                      }, function (reason) {
        //                          $scope.error = reason.data;
        //                      });
        //    // end codes to delete page shreathon
        //}


        $scope.editgrouphareathon = function (grouphareathon) {
            $scope.dispbtnsharethon = false;
            $rootScope.grouphareathondata = grouphareathon;
            $http.get(apiDomain + '/api/Facebook/GetFacebookGroup?profileId=' + $rootScope.grouphareathondata.facebookaccountid)
                     .then(function (response) {
                         $rootScope.lstfacebookgroup = response.data;
                         window.location.href = "#/edit_group_shareathon.html";
                     }, function (reason) {
                         $scope.error = reason.data;
                     });
            //$scope.editgrouphareathon = function (grouphareathondata) {
            //    $rootScope.grouphareathondata = grouphareathon;
            //    window.location.href = "#/edit_group_shareathon.html";
            //}
        }
        $.getScript('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/js/materialize.min.js');
        $scope.shareathonreport = function (ShareathonId) {
            $http.get(apiDomain + "/api/Shareathon/GetPublishedFeeds?ShareathonId=" + ShareathonId)
                .then(function (response) {
                    if (response.data != "") {
                        $scope.PostedFeeds = response.data;
                        $('#GroupShareathonReportModal').openModal({ dismissible: true });
                    } else {
                        swal("There is no report!");
                    }
                });                      
        }
  });
});