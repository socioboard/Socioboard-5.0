'use strict';

SocioboardApp.controller('TwitterAnalyticsController', function ($rootScope, $scope, $http, $timeout, apiDomain, grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        twitteranalytics();
        var reachLast = false;
        var x = false;

        $scope.getTwitterNotifications = function () {
            $http.get(apiDomain + '/api/Twitter/GetNotifications?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&skip=0&count=20')
                          .then(function (response) {
                              $scope.lstNotifications = response.data;
                              $scope.temp = $scope.lstNotifications;
                              $scope.x = true;
                              //$scope.loaderclass = 'hide';
                              if (response.data == null) {
                                  reachLast = true;
                                  $scope.loaderclass = 'hide';
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        };

        $scope.getTwitterNotifications();

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

        };

        $scope.clearSearch = function () {
            var searchname = $('#name_search').val("");
            var searchkey = $('#key_search').val("");
            $scope.keysearch = false;
            $scope.changeSearch("");
        }
        $scope.changeSearch = function (name_search) {
            var searchname = $('#name_search').val();
            var searchkey = $('#key_search').val();
            if (searchname != "" || searchkey != "") {
                $scope.keysearch = true;
            }
            else
            {
                $scope.keysearch = false;
            }
            if (name_search != "socioboard_key_search") {
                var filtered = [];
                angular.forEach($scope.temp, function (item) {
                    try {
                        if (item.fromScreenName.includes(name_search)) {
                            filtered.push(item);
                        }
                    }
                    catch (es) {
                        if (item.fromName.includes(name_search)) {
                            filtered.push(item);
                        }
                    }
                })
                $scope.lstNotifications = filtered;
            }
        }


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

        $scope.filterType = [9, 0, 1, 6];
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
            var TempTaskMessage = taskComment;
            var updatedmessage = "";
            var postdata = taskComment.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');

            taskComment = updatedmessage;
            if (!memberId.val()) {
                swal('Please select a member to assign the task')
            }
            else if (!(/\S/.test(TempTaskMessage))) {
                swal('Please write a comment to assign the task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.twitterMsg, $rootScope.taskNotification.messageId, '');

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