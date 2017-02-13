'use strict';

SocioboardApp.controller('BoardlistController', function ($rootScope, $scope,$http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        $scope.loadBoards = function () {
            //codes to load  boards start
            $http.get(apiDomain + '/api/BoardMe/getUserBoards?userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.lstBoards = response.data;
                              $scope.lastreach = true;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load boards.
        }
       

        $scope.loadBoards();
        boardlist();
        $scope.deleteBoard = function (profileId) {
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send message via this account!",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function () {
	            $http({
	                method: 'POST',
	                url: apiDomain + '/api/BoardMe/DeleteBoard?BoardId=' + profileId + '&userId=' + $rootScope.user.Id ,
	            }).then(function (response) {
	                if (response.data == "Deleted") {
	                    swal("Deleted!", "Your board has been deleted.", "success");
	                    $scope.loadBoards();
	                }
	                else {
	                    swal("Deleted!", response.data, "success");
	                }
	            }, function (reason) {
	                swal("Deleted!", reason, "success");
	            });
	            });
        }

  });

});
