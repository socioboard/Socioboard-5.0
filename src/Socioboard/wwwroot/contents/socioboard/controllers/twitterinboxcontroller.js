'use strict';

SocioboardApp.controller('TwitterInboxController', function ($rootScope, $scope, $http, $timeout, apiDomain, grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        twitterinbox();
        var lastreach = false;
        var count = 30; // where to start data
        $scope.messagesEnding = 0; // how much data need to add on each function call
        $scope.messagesReachLast = false; // to check the page ends last or not
        $scope.nodata = false;
        $scope.lstMessages = [];
        $scope.LoadMessages = function () {
            if (!$scope.messagesReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/Twitter/GetTwitterDirectMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&skip=' + $scope.messagesEnding + ' &count=' + count)
                              .then(function (response) {

                                  if (response.data == "") {
                                      $scope.nodata = true;
                                      $scope.lastreached = true;
                                  }
                                  else {
                                      $scope.messagesReachLast = true;
                                      $scope.lastreached = true;
                                      for (var i = 0; i < response.data.length; i++) {
                                          $scope.lstMessages.push(response.data[i]);
                                      }
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;

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


        $scope.GetConversation = function (SenderId, RecipientId, profileId, recipientProfileUrl, recipientScreenName, senderScreenName, senderProfileUrl) {

            $rootScope.profileId = profileId;
            $rootScope.SenderId = SenderId;
            $rootScope.RecipientId = RecipientId;
            $rootScope.recipientProfileUrl = recipientProfileUrl;
            $rootScope.recipientScreenName = recipientScreenName;
            $rootScope.senderScreenName = senderScreenName;
            $rootScope.senderProfileUrl = senderProfileUrl;
            $scope.Conversation(RecipientId, SenderId);


            $scope.msgload = false;
            $('#ChatModal').openModal();
            $scope.lstGetConversation = "";
            $scope.sendingloader = 'hide';//hide loader
            $scope.sendicon = 'show';// loader stop for send icon after click on send
            //  $('#ChatModal').scrollTop($('#ChatModal')[0].scrollHeight);
        }

        $scope.Conversation = function (RecipientId, SenderId) {
            //codes to load  GetConversation
            $http.get(apiDomain + '/api/Twitter/GetConversation?RecipientId=' + RecipientId + '&SenderId=' + SenderId)
                          .then(function (response) {
                              $('#dmmessagecomment').val('');
                              $scope.sendingloader = 'hide';//hide loader
                              $scope.sendicon = 'show';// loader stop for send icon after click on send
                              $scope.date(response.data);
                              $scope.msgload = true;
                          }, function (reason) {
                              $scope.error = reason.data;

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
            if (/\S/.test(message)) {
                var updatedmessage = "";
                var postdata = message.split("\n");
                $scope.sendingloader = 'show';       // for loader part
                $scope.sendicon = 'hide';             // for loader part
                for (var i = 0; i < postdata.length; i++) {
                    updatedmessage = updatedmessage + "<br>" + postdata[i];
                }
                updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
                updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
                updatedmessage = updatedmessage.replace("+", 'ppp');
                updatedmessage = updatedmessage.replace("-+", 'jjj');
                message = updatedmessage;
                //codes to postdirrectmessage
                $http.post(apiDomain + '/api/Twitter/PostTwtDirectmessage?RecipientId=' + $rootScope.RecipientId + '&SenderId=' + $rootScope.SenderId + '&profileId=' + $rootScope.profileId + '&message=' + message + '&UserId=' + $rootScope.user.Id                 
                        + '&senderScreenName=' + $rootScope.recipientScreenName
                        + '&senderImageUrl=' + $rootScope.recipientProfileUrl
                        + '&recipientScreenName=' + $rootScope.senderScreenName
                        + '&recipientImageUrl=' + $rootScope.recipientProfileUrl
                )
                              .then(function (response) {
                                  //setTimeout(function () {
                                  //$scope.sendingcomment = false;
                                  //}, 0);

                                  $scope.Conversation($rootScope.RecipientId, $rootScope.SenderId);
                              }, function (reason) {
                                  $scope.error = reason.data;

                              });
                // end codes to postdirrectmessage
            }
            else {
                swal("Please enter some text");
            }
        }

        $scope.addTask = function (feedTableType) {

            var memberId = $('.task-user-member:checked');
            var taskComment = $('#taskComment').val();
            if (!memberId.val()) {
                swal('Please select a member to assign the task')
            }
            else if (!(/\S/.test(taskComment))) {
                swal('Please write a comment to assign the task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskinboxNotification.message, $rootScope.taskinboxNotification.messageId, '');

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

SocioboardApp.filter('notificationByTwitterProfiles', function () {
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
                $('#innerModal').scrollTop($('#innerModal')[0].scrollHeight);

            });
        }
    };
})