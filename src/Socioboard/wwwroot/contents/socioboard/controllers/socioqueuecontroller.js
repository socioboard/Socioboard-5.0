'use strict';
SocioboardApp.controller('SocioqueueController', function ($rootScope, $scope, $http, $modal, $timeout, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        socioqueue();
        $scope.deleteMsg = function (socioqueueId) {
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
	            $http.get(apiDomain + '/api/SocialMessages/DeleteSocialMessages?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&socioqueueId=' + socioqueueId)
                              .then(function (response) {
                                  closeOnConfirm: false
                                  swal("deleted");
                                  $scope.date(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
	            // end codes to delete draft messages
	        });
        }

        $scope.fetchsocioqueuemessage = function () {
            //codes to load  socioqueue messages start
            $http.get(apiDomain + '/api/SocialMessages/GetAllScheduleMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.date(response.data);
                              } else {
                                  swal("No Schedule Post To Display");
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load socioqueue messages
        }
        $scope.fetchsocioqueuemessage();

        $scope.getProperURL = function (obj) {
            console.log(obj);
            var img = obj.split("wwwroot/")[1];
            return apiDomain + "/api/Media/get?id=" + img;
        };

        $scope.editscheulemessage = function (sharemessage, socioqueueId)
        {
            $rootScope.editscdmessage = sharemessage;
            $rootScope.socioqueueId = socioqueueId;
            $('#SocioqueueModal').openModal();
            //$scope.modalinstance = $modal.open({
            //    templateUrl: 'editschedulemessageModalContent.html',
            //    controller: 'SocioqueueController',
            //    scope: $scope
            //});
        }

        $scope.date = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].scheduleTime);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].scheduleTime = date;
            }
            $scope.lstsocioqueuemessage = parm;

        }
        $scope.closeModal = function () {
            $scope.modalinstance.dismiss('cancel');
        }
        $scope.savesocioqueueedit = function () {
            var message = $('#editScheduleMsg').val();

            //For taking special character start
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');
            message = updatedmessage;
            //End

            $http.get(apiDomain + '/api/SocialMessages/EditScheduleMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&socioqueueId=' + $rootScope.socioqueueId + '&message=' + message)
                                  .then(function (response) {
                                      //$scope.modalinstance.dismiss('cancel');
                                      //$rootScope.lstdraftmessage = response.data;
                                      $scope.date(response.data);
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });


        }

    });
});
