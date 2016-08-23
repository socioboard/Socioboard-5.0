SocioboardApp.service('grouptask', function ($http, $rootScope, apiDomain) {
    this.addtasks = function (assignUserId, feedTableType, taskComment, taskMessage, feedId,taskMessageImageUrl) {
      
            //codes to add task
        $http.post(apiDomain + '/api/Task/AddTask?groupId=' + $rootScope.groupId + '&senderUserId=' + $rootScope.user.Id + '&recipientUserId=' + assignUserId + '&taskMessage=' + taskMessage + '&feedTableType=' + feedTableType + '&feedId=' + feedId + '&taskComment=' + taskComment + '&taskMessageImageUrl=' + taskMessageImageUrl)
                            .then(function (response) {
                                swal('Task Assign Successfully');
                                window.location.reload();
                            }, function (reason) {
                                $scope.error = reason.data;
                            });
            // end codes to add task
       
    }
});