'use strict';

SocioboardApp.controller('SmartInboxController', function ($rootScope, $scope, $http, $timeout, apiDomain, grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        var reachLast = false;
        $scope.getTwitterNotifications = function () {
            $http.get(apiDomain + '/api/Twitter/GetNotifications?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&skip=0&count=20')
                          .then(function (response) {
                              $scope.lstNotifications = response.data;
                              if (response.data == null) {
                                  reachLast = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        };

        $scope.getTwitterNotifications();
        smartinbox();

        // toggle selection for a given fruit by name
        $scope.toggleSelection = function toggleSelection(option) {
            var idx = $scope.filterType.indexOf(option);

            // is currently selected
            if (idx > -1) {
                $scope.filterType.splice(idx, 1);
            }

                // is newly selected
            else {
                $scope.filterType.push(option);
            }
            console.log($scope.filterType);
        };

        // toggle selection for a given fruit by name
        $scope.toggleProfileSelection = function toggleProfileSelection(option) {
            var idx = $scope.selectedProfiles.indexOf(option);

            // is currently selected
            if (idx > -1) {
                $scope.selectedProfiles.splice(idx, 1);
            }

                // is newly selected
            else {
                $scope.selectedProfiles.push(option);
            }
        };

        $scope.filterType = [9, 0, 1, 2];
        $scope.selectedProfiles = [];

        angular.forEach($rootScope.lstProfiles, function (item) {
            $scope.selectedProfiles.push(item.profileId);
        });


        $scope.taskModel = function (notification) {
            $('#TaskModal').openModal();
            $rootScope.taskNotification = notification;
            Materialize.updateTextFields();
        }

        $scope.addTask = function (feedTableType) {
          
            var memberId = $('.task-user-member:checked');
            var taskComment = $('#taskComment').val();
            if (!memberId.val()) {
                swal('please select any member for assign task')
            }
            else if (!taskComment) {
                swal('please write any comment for assign task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.twitterMsg, $rootScope.taskNotification.messageId,'');
                
            }
        }

    });
});

SocioboardApp.filter('notificationbyprofilesfileter', function () {
    return function (items, filterType, selectedProfiles) {
        var filtered = [];
        angular.forEach(items, function (item) {
            if (filterType.indexOf(item.type) != -1 && selectedProfiles.indexOf(item.profileId) != -1) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});