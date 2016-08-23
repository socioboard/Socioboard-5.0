'use strict';

SocioboardApp.controller('MyTaskController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
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


        $scope.comment = function (newComment) {
            if (newComment == null || newComment == ' ') {
                return ;
            }
            else {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Task/AddComment?taskId=' + $scope.selectedTask.tasks.strId + '&userId=' + $rootScope.user.Id + '&commentText=' + newComment,
                }).then(function (response) {
                    if (response.data != null)
                    {
                        var addedComment = {
                            "taskComments": response.data,
                            "user": $rootScope.user
                        }
                        $scope.selectedTask.lstTaskComments.push(addedComment);
                        $("#task_rply").val(' ');
                        $scope.newComment = null;
                    }
                }, function (reason) {
                    console.log(reason);
                });
            }
           

        }
        $scope.getTasks();
        mytask();
           $scope.deleteTask = function(){
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
		                return;
		            }

		            $http({
		                method: 'POST',
		                url: apiDomain + '/api/Task/DeleteTask?taskId=' + $scope.selectedTask.tasks.strId ,
		            }).then(function (response) {
		                if (response.data == "deleted");
		                {
		                    $scope.userTasks.splice($scope.selectedTaskIndex, 1);
		                    $scope.selectedTask = null;
		                    $scope.$apply();
		                    if ($scope.selectedTask + 1 < $scope.userTasks.length) {
		                        $scope.showTask($scope.selectedTask + 1);
		                    }
		                    swal("Deleted!", "Your profile has been deleted.", "success");
		                }
		                console.log(response);
		            }, function (reason) {
		                console.log(reason);
		            });
		           
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
		                return;
		            }

		            $http({
		                method: 'POST',
		                url: apiDomain + '/api/Task/MarkTaskCompleted?taskId=' + $scope.selectedTask.tasks.strId,
		            }).then(function (response) {
		                if (response.data == "deleted");
		                {
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

		        });
           }
    });

});