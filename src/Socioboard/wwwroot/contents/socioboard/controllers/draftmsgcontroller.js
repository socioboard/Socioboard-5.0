'use strict';
SocioboardApp.controller('DraftMessageController', function ($rootScope, $scope, $http, $modal, $timeout, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        draft();
        $scope.deleteMsg = function (draftId) {
            swal({
                title: "Are you sure?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            //codes to delete  draft messages start
	            $http.get(apiDomain + '/api/DraftMessage/DeleteDraftMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&draftId=' + draftId)
                              .then(function (response) {
                                  closeOnConfirm: false
                                  swal("deleted");
                                  // $scope.lstdraftmessage = response.data;
                                  $scope.date(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
	            // end codes to delete draft messages
	        });
        }

        $scope.fetchdraftmessage = function () {
            //codes to load  draft messages start
            $http.get(apiDomain + '/api/DraftMessage/GetAllUserDraftMessages?groupId=' + $rootScope.groupId+'&userId='+$rootScope.user.Id)
                          .then(function (response) {
                              // $rootScope.lstdraftmessage = response.data;
                              $scope.date(response.data);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load draft messages
        }
        $scope.fetchdraftmessage();


        $scope.editdraft = function (message, draftId)
        {
            $rootScope.draftmessgae = message;
            $rootScope.draftId = draftId;
            $('#EditDraftModal').openModal();
            //$scope.modalinstance = $modal.open({
            //    templateUrl: 'editdraftModalContent.html',
            //    controller: 'DraftMessageController',
            //    scope: $scope
            //});
        }

        $scope.scheduledraft = function (schedulemessage)
        {
            $rootScope.schedulemessage = schedulemessage;
            window.location.href = "#/schedulemsg";
        }
        $scope.date = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].scheduleTime);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].scheduleTime = date;
            }
            $rootScope.lstdraftmessage = parm;

        }


        $scope.closeModal = function () {
            $scope.modalinstance.dismiss('cancel');
        }
        $scope.saveditdraft = function () {
            var message = $('#editdraftScheduleMsg').val();
            $http.post(apiDomain + '/api/DraftMessage/EditDraftMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&draftId=' + $rootScope.draftId + '&message=' + message)
                                  .then(function (response) {
                                     // $scope.modalinstance.dismiss('cancel');
                                      //$rootScope.lstdraftmessage = response.data;
                                      $scope.date(response.data);
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });
            // end codes to delete draft messages

        }


    });
});



