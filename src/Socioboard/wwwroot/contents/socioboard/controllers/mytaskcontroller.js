'use strict';

SocioboardApp.controller('MyTaskController', function ($rootScope, $scope, $http, $timeout,apiDomain,utility) {
    //alert('helo');
    
    $scope.$on('$viewContentLoaded', function () {
        $scope.utility = utility;
        $scope.dispbtnmark = true;
        $scope.dispbtndelete = true;
        $scope.dispbtn = true;
        $scope.userTasks = [];
        $scope.selectedTask = null;
        $scope.selectedTaskIndex = null;
        $scope.getTasks = function () {
            $http.get(apiDomain + '/api/Task/GetAllPendingTasksOfUserAndGroup?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.userTasks = response.data;
                              if (response.data.length > 0) {
                                  $scope.showTask(0);
                              }
                              console.log($scope.userTasks);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        };

        $scope.showTask = function (index) {
            console.log(index);
            $scope.selectedTask = $scope.userTasks[index];
            $scope.selectedTaskIndex = index;
            console.log($scope.selectedTask);
        }


        $scope.comment = function (newComment)
        {
            if (newComment == null || newComment == ' ') {
                $scope.dispbtn = true;
                return;
            }
            if ($("#task_rply").val() == null || $("#task_rply").val() == " " || $("#task_rply").val() == "") {
                $scope.dispbtn = true;
                return;
            }

            else {
           
                $scope.dispbtn = false;
                debugger;
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
                    console.log(response);
                }, function (reason) {
                    console.log(reason);
                });
            }

        }
        $scope.getTasks();
        mytask();
        $scope.deleteTask = function () {
            
	        	swal({   
		        title: "Are you sure?",   
		        text: "You will not be able to send message via this account!",   
		        type: "warning",   
		        showCancelButton: true,   
		        confirmButtonColor: "#DD6B55",   
		        confirmButtonText: "Yes, delete it!",   
		        closeOnConfirm: false }, 
		        function(){   
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
                                swal("Deleted!", "Your profile has been deleted.", "success");
		                        $scope.$apply();
		                        if ($scope.selectedTask + 1 < $scope.userTasks.length) {
		                            $scope.showTask($scope.selectedTask + 1);
		                        }
		                        
		                    }
		                    console.log(response);
		                }, function (reason) {
		                    console.log(reason);
		                });
		            }
		           
		            });
           }

           $scope.markTaskCompleted = function () {
               swal({
                   title: "Are you sure?",
                   text: "You will not be able to send message via this account!",
                   type: "warning",
                   showCancelButton: true,
                   confirmButtonColor: "#DD6B55",
                   confirmButtonText: "Yes, Mark as completed it!",
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
		                        $scope.$apply();
		                        if ($scope.selectedTask + 1 < $scope.userTasks.length) {
		                            $scope.showTask($scope.selectedTask + 1);
		                        }
		                        swal("Completed!", "Task has been Completed.", "success");
		                    }
		                    console.log(response);
		                }, function (reason) {
		                    console.log(reason);
		                });
		            }

		        });
           }
    });

});