'use strict';

SocioboardApp.controller('CreateBoardController', function ($rootScope, $scope,$state ,$http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.board = {};
        $scope.createBoard = function (board) {

            if ($rootScope.user.TrailStatus == 2) {
                swal("You cannot use paid features as your trial period has expired");
                return false;
            }

            if (board.name == "" || board.name == '' || board.name == undefined) {
                alertify.set({ delay: 5000 });
                alertify.error("Board name should not be empty");
                return;
            }
            if (board.name.length > 20) {
                alertify.set({ delay: 5000 });
                alertify.error("Length of the board name should be less than 20");
                return;
            }

            $scope.dispbtn = false;
            $http({
                method: 'POST',
                url: apiDomain + '/api/BoardMe/createBoard?boardName=' + board.name + '&fbHashTag=' + board.facebookHashTag + '&twitterHashTag=' + board.twitterHashTag + '&instagramHashTag=' + board.instagramHashTag + '&gplusHashTag=' + board.gpluHashTag + '&userId=' + $rootScope.user.Id,
               // data: { boardName: $scope.board.name, fbHashTag: $scope.board.facebookHashTag, twitterHashTag: $scope.board.twitterHashTag, instagramHashTag: $scope.board.instagramHashTag, gplusHashTag: $scope.board.gpluHashTag, userId: $rootScope.user.Id }
            }).then(function (response) {
                if (response.data == 'board Exist') {
                    $scope.dispbtn = true;
                    alertify.set({ delay: 5000 });
                    alertify.error(response.data);
                }
                else if (response.data == 'successfulyy added.') {
                    $scope.dispbtn = true;
                    $state.go('boardlist');
                }
                console.log(response);
            }, function (reason) {
                console.log(reason);
            });
        }
    
        createboard();
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
	            swal("Deleted!", "Your profile has been deleted.", "Success");
	            });
        }

  });

});