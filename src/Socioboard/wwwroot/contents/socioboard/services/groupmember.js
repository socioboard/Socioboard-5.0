SocioboardApp.service('groupmember', function ($http, $rootScope, apiDomain) {
    this.getGroupMembers = function (index, groupId) {
        if ($rootScope.groups[index].members == undefined) {
            //codes to load  fb profiles start
            $http.get(apiDomain + '/api/GroupMember/GetGroupMembers?groupId=' + groupId)
                          .then(function (response) {
                              $rootScope.groups[index].members = response.data;
                              //alert($rootScope.groups[index].members);
                          }, function (reason) {
                              $rootScope.error = reason.data;
                          });
            // end codes to load fb profiles
        }
    }
});