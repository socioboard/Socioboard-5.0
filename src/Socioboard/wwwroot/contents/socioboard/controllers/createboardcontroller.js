'use strict';

SocioboardApp.controller('CreateBoardController', function ($rootScope, $scope,$state ,$http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.board = {};
        $scope.createBoard = function () {
            $http({
                method: 'POST',
                url: apiDomain + '/api/BoardMe/createBoard?boardName=' + $scope.name + '&fbHashTag=' + $scope.facebookHashTag + '&twitterHashTag=' + $scope.twitterHashTag + '&instagramHashTag=' + $scope.board.instagramHashTag + '&gplusHashTag=' + $scope.gpluHashTag + '&userId=' + $rootScope.user.Id,
               // data: { boardName: $scope.board.name, fbHashTag: $scope.board.facebookHashTag, twitterHashTag: $scope.board.twitterHashTag, instagramHashTag: $scope.board.instagramHashTag, gplusHashTag: $scope.board.gpluHashTag, userId: $rootScope.user.Id }
            }).then(function (response) {
                if (response.data == 'board Exist') {
                    alertify.set({ delay: 5000 });
                    alertify.error(response.data);
                }
                else if (response.data == 'successfulyy added.') {
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
	            swal("Deleted!", "Your profile has been deleted.", "success"); 
	            });
        }

  });

});