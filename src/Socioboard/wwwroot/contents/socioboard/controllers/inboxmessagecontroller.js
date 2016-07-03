'use strict';

SocioboardApp.controller('InboxMessageController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    

        var count = 30; // where to start data
        $scope.messagesEnding = 0; // how much data need to add on each function call
        $scope.messagesReachLast = false; // to check the page ends last or not

        $scope.lstMessages = [];
        $scope.LoadMessages = function () {
            if (!$scope.messagesReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/Twitter/GetTwitterDirectMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&skip=' + $scope.messagesEnding + ' &count=' + count)
                              .then(function (response) {
                                  if (response.data == null || (response.data != null && response.data.length == 0)) {
                                      $scope.messagesReachLast = true;
                                  }
                                  else {
                                      for (var i = 0; i < response.data.length; i++) {
                                          $scope.lstMessages.push(response.data[i]);
                                      }
                                      $scope.messagesEnding = $scope.messagesEnding + response.data.length;
                                      console.log($scope.messagesEnding);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                                  console.log(reason.data);
                              });
                // end codes to load  recent Feeds
            }

        }
        $scope.LoadMessages();

        $scope.selectedProfiles = [];

        angular.forEach($rootScope.lstProfiles, function (item) {
            $scope.selectedProfiles.push(item.ProfileId);
        });

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

        inboxmessage();
            
    });
});

SocioboardApp.filter('notificationbyprofilesfileter', function () {
    return function (items, selectedProfiles) {
        var filtered = [];
        angular.forEach(items, function (item) {
            if ((selectedProfiles.indexOf(item.senderId) != -1) || (selectedProfiles.indexOf(item.recipientId) != -1)) {
                filtered.push(item);
            }
        });
        return filtered;
    };
});