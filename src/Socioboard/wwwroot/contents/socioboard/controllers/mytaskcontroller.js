'use strict';

SocioboardApp.controller('MyTaskController', function ($rootScope, $scope, $http, $timeout,apiDomain,utility) {
    //alert('helo');
    
    $scope.$on('$viewContentLoaded', function () {
        $scope.utility = utility;
        $scope.dispbtnmark = true;
        $scope.dispbtndelete = true;
        $scope.dispbtn = true;
        $scope.lastreached = false;
        $scope.notasks = false;
        $scope.userTasks = [];
        $scope.selectedTask = null;
        $scope.selectedTaskIndex = null;
        $scope.getTasks = function () {
            $http.get(apiDomain + '/api/Task/GetAllPendingTasksOfUserAndGroup?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.userTasks = response.data;
                                  $scope.lastreached = true;
                                  if (response.data.length > 0) {
                                      $scope.showTask(0);
                                  }
                                
                              }
                              else
                              {
                                  $scope.notasks = true;
                                  $scope.lastreached = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        };

        $scope.showTask = function (index) {
          
            $scope.selectedTask = $scope.userTasks[index];
            $scope.selectedTaskIndex = index;
            
            $scope.replydisp = true;
        }


        $scope.comment = function (newComment)
        {
            if (!(/\S/.test(newComment))) {
                $scope.dispbtn = true;
                return;
            }
            if ($("#task_rply").val() == null || $("#task_rply").val() == " " || $("#task_rply").val() == "") {
                $scope.dispbtn = true;
                return;
            }

            else {
           
                $scope.dispbtn = false;
               
                //For taking special character start
                var updatedmessage = "";
                var postdata = newComment.split("\n");
                for (var i = 0; i < postdata.length; i++) {
                    updatedmessage = updatedmessage + "<br>" + postdata[i];
                }
                updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
                updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
                updatedmessage = updatedmessage.replace("+", 'ppp');
                updatedmessage = updatedmessage.replace("-+", 'jjj');
                newComment = updatedmessage;
                //End

                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Task/AddComment?taskId=' + $scope.selectedTask.tasks.strId + '&userId=' + $rootScope.user.Id + '&commentText=' + newComment,
                }).then(function (response) {
                    if (response.data != null);
                    {
                        $scope.dispbtn = true;
                        var addedComment = {
                            "taskComments": response.data,
                            "user": $rootScope.user
                        }
                        $scope.selectedTask.lstTaskComments.push(addedComment);
                        $("#task_rply").val("");

                    }
                   
                }, function (reason) {
                   
                });
            }

        }
        $scope.getTasks();
        mytask();
        $scope.deleteTask = function () {

                swal({
                    title: "Are you sure?",
                    text: "You will not be able to send any message via this account!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "OK",
                    closeOnConfirm: false
                },
		        function () {
		            if ($scope.selectedTask == null) {
		                $scope.dispbtndelete = true;
		                return;
		            }
		            else {
		                $scope.dispbtndelete = false;
		                $http({
		                    method: 'POST',
		                    url: apiDomain + '/api/Task/DeleteTask?taskId=' + $scope.selectedTask.tasks.strId,
		                }).then(function (response) {
		                    if (response.data == "deleted");
		                    {
		                        $scope.dispbtndelete = true;
		                        $scope.userTasks.splice($scope.selectedTaskIndex, 1);
		                        $scope.selectedTask = null;
		                        swal("Deleted!", "Your task has been deleted", "success");
		                        $scope.replydisp = false;
		                        $scope.$apply();
		                        if ($scope.selectedTask + 1 < $scope.userTasks.length) {
		                            $scope.showTask($scope.selectedTask + 1);
		                        }

		                    }
		                    
		                }, function (reason) {
		                  
		                });
		            }

		        });
           }

           $scope.markTaskCompleted = function () {
               swal({
                   title: "Are you sure?",
                   text: "You will not be able to send any message via this account!",
                   type: "warning",
                   showCancelButton: true,
                   confirmButtonColor: "#DD6B55",
                   confirmButtonText: "Yes, mark it as completed!",
                   closeOnConfirm: false
               },
		        function () {
		            if ($scope.selectedTask == null) {
		                $scope.dispbtnmark = true;
		                return;
		            }
		            else {
		                $scope.dispbtnmark = false;
		                $http({
		                    method: 'POST',
		                    url: apiDomain + '/api/Task/MarkTaskCompleted?taskId=' + $scope.selectedTask.tasks.strId,
		                }).then(function (response) {
		                    if (response.data == "deleted");
		                    {
		                        $scope.dispbtnmark = true;
		                        $scope.userTasks.splice($scope.selectedTaskIndex, 1);
		                        $scope.selectedTask = null;
		                        swal("Completed!", "Task has been completed", "success");
		                        $scope.replydisp = false;
		                        $scope.$apply();
		                        if ($scope.selectedTask + 1 < $scope.userTasks.length) {
		                            $scope.showTask($scope.selectedTask + 1);
		                        }
		                        
		                    }
		                   
		                }, function (reason) {
		                  
		                });
		            }

		        });
           }
    });

});