'use strict';
SocioboardApp.controller('ScheduleMessageController', function ($rootScope, $scope, $http, $modal, $timeout, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        schedulemsg();
        $scope.deleteMsg = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success");
	        });
        }

        $scope.schedulemsg = function () {
            var profiles = $('#scheduleprofiles').val();
            var message = $('#ScheduleMsg').val();
            var scheduletime = $('#ScheduleTime').val();
            if (profiles.length > 0)
            {
                if (scheduletime!="") {
                    var formData = new FormData();
                    formData.append('files', $("#input-file-now").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + scheduletime,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        swal("message schduled successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }
                else {
                    swal('please enter data time to schedule message');
                }
            }
            else {
                swal('please select profile for schedule message');
            }
        }


        $scope.draftmsg = function () {
            var message = $('#ScheduleMsg').val();
            var scheduletime = $('#ScheduleTime').val();
            var formData = new FormData();
            formData.append('files', $("#input-file-now").get(0).files[0]);
            $http({
                method: 'POST',
                url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + scheduletime + '&groupId=' + $rootScope.groupId,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                $('#ScheduleMsg').val('');
                $('#ScheduleTime').val('');
                swal("message saved in draft successfully");
            }, function (reason) {
                console.log(reason);
            });
        }
    });
});