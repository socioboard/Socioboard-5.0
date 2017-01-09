'use strict';

SocioboardApp.controller('InboxMessageController', function ($rootScope, $scope, $http, $timeout,apiDomain,grouptask) {
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
                                  
                                  $scope.messagesReachLast = true;
                                  for (var i = 0; i < response.data.length; i++) {
                                      $scope.lstMessages.push(response.data[i]);
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
            $scope.selectedProfiles.push(item.profileId);
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

        $scope.GetConversation = function (SenderId, RecipientId, profileId, recipientProfileUrl, recipientScreenName, senderScreenName, senderProfileUrl) {
            
            $rootScope.profileId = profileId;
            $rootScope.SenderId = SenderId;
            $rootScope.RecipientId = RecipientId;
            $rootScope.recipientProfileUrl = recipientProfileUrl;
            $rootScope.recipientScreenName = recipientScreenName;
            $rootScope.senderScreenName = senderScreenName;
            $rootScope.senderProfileUrl = senderProfileUrl;
            $scope.Conversation(RecipientId, SenderId);
            console.log($rootScope.profileId);
            $('#ChatModal').openModal();
          //  $('#ChatModal').scrollTop($('#ChatModal')[0].scrollHeight);
        }

        $scope.Conversation = function (RecipientId, SenderId)
        {
            //codes to load  GetConversation
            $http.get(apiDomain + '/api/Twitter/GetConversation?RecipientId=' + RecipientId + '&SenderId=' + SenderId)
                          .then(function (response) {

                              $scope.date(response.data);

                          }, function (reason) {
                              $scope.error = reason.data;
                              console.log(reason.data);
                          });
            // end codes to load  GetConversation
        }
        $scope.taskInboxModel = function (notification) {
            $rootScope.taskinboxNotification = notification;
            $('#InboxTaskModal').openModal();
            

        }

        $scope.postdirrectmessage = function () {
           // alert($rootScope.user.Id);
            var message = $('#dmmessagecomment').val();
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
            //codes to postdirrectmessage
            $http.post(apiDomain + '/api/Twitter/PostTwitterDirectmessage?RecipientId=' + $rootScope.RecipientId + '&SenderId=' + $rootScope.SenderId + '&profileId=' + $rootScope.profileId + '&message=' + message + '&UserId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $('#dmmessagecomment').val('');
                              $scope.Conversation($rootScope.RecipientId, $rootScope.SenderId);
                          }, function (reason) {
                              $scope.error = reason.data;
                              console.log(reason.data);
                          });
            // end codes to postdirrectmessage
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
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskinboxNotification.message, $rootScope.taskinboxNotification.messageId,'');

            }
        }

        $scope.date = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].createdDate);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].createdDate = date;
            }
            $scope.lstGetConversation = parm;

        }
            
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


SocioboardApp.directive('myChatModalDirective', function ($timeout) {
    return function (scope, element, attrs) {
if (scope.$last === true) {
            $timeout(function () {
                $('#ChatModal').scrollTop($('#ChatModal')[0].scrollHeight);

            });
 }
    };
})