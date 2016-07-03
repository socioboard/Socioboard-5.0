'use strict';

SocioboardApp.controller('GroupsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.lstInviteTeamMembers = []; // array contains list of needs to invite for current group

        $scope.deleteProfile = function(profileId, groupId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You want to remove this account from Socioboard",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){
	            //todo: code to delete profile
	            swal("Deleted!", "Profile has been deleted.", "success"); 
	            });
        }

        $scope.deleteGroups = function(groupsId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You want to remove this group ?",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            swal("Deleted!", "Group has been deleted.", "success"); 
	            });
        }

        $scope.addGroup = function (groupName) {
            if (groupName == null || groupName == '') {
                alertify.set({ delay: 1000 });
                alertify.error("Group name should not be empty");
                return ;
            }
            $http({
                method: 'POST',
                url: apiDomain + '/api/Groups/CreateGroup?GroupName=' + groupName + '&AdminId=' + $rootScope.user.Id ,
            }).then(function (response) {
                if (response.data == 'Group Added') {
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                }
                else {
                    alertify.set({ delay: 1000 });
                    alertify.error(response.data);
                }
            }, function (reason) {
                console.log(reason);
            });
        }

        //get GroupMembers of a perticular group and add to members arrary in group
        $scope.getGroupMembers = function (index, groupId) {
            console.log(index);
            console.log(groupId);
            console.log($rootScope.groups[index].members);
            if ($rootScope.groups[index].members == undefined) {
                //codes to load  fb profiles start
                $http.get(apiDomain + '/api/GroupMember/GetGroupMembers?groupId=' + groupId)
                              .then(function (response) {
                                  $rootScope.groups[index].members = response.data;
                                  console.log($rootScope.groups[index].members);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load fb profiles
            }
            
        }


        //get GroupProfiles of a perticular group and add to groups array in group
        $scope.getGroupProfiles = function (index, groupId) {
            if ($rootScope.groups[index].profiles == undefined) {
                //codes to load  fb profiles start
                $http.get(apiDomain + '/api/GroupProfiles/GetGroupProfiles?groupId=' + groupId)
                              .then(function (response) {
                                  $rootScope.groups[index].profiles = response.data;
                                  console.log($rootScope.groups[index].profiles);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load fb profiles
            }

        }



        //get GroupProfiles to connect of a perticular group and add to groups array in group
        $scope.getGroupProfilesToconnect = function (index, groupId) {
            if ($rootScope.groups[index].profilesToConnect == undefined) {
                $http.get(apiDomain + '/api/GroupProfiles/getProfilesAvailableToConnect?groupId=' + groupId +'&userId='+ $rootScope.user.Id)
                              .then(function (response) {
                                  $rootScope.groups[index].profilesToConnect = response.data;
                                  console.log($rootScope.groups[index].profilesToConnect);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            }

        }


        $scope.openMemberInvitationModal = function (groupId, groupName) {
            console.log(groupName);
            $scope.inviGrpName = groupName;
            $scope.inviGrpId = groupId;
            $scope.lstInviteTeamMembers = [];
        }

        $scope.addToInviteList = function (inviteMember) {
           var mem =  {
                "email": inviteMember.email,
                "firstName": inviteMember.firstName,
                "lastName": inviteMember.lastName,
                "id": 0,
                "userId": $rootScope.user.Id,
                "profileImg": $rootScope.user.profileImg,
                "memberStatus": 0,
                "groupid": $scope.inviGrpId,
                "isAdmin": false,
               "memberCode":""
            };
           $scope.lstInviteTeamMembers.push(mem);
           $scope.inviteMember = null;
          
        }

        $scope.deleteFromInviteList = function (index) {
            $scope.lstInviteTeamMembers.splice(index, 1);
        }

        $scope.SendInvitations = function (groupId) {
            var mem ='';
            for (var i = 0; i < $scope.lstInviteTeamMembers.length ; i++)
            {
                mem = mem + $scope.lstInviteTeamMembers[i].firstName + ':' + $scope.lstInviteTeamMembers[i].lastName + ':' + $scope.lstInviteTeamMembers[i].email + ';'
            }

            console.log($scope.lstInviteTeamMembers);
            $http({
                method: 'POST',
                url: apiDomain + '/api/GroupMember/InviteGroupMembers?groupId=' + $scope.inviGrpId + '&members='+mem,
              //  params: { 'mem':  $scope.lstInviteTeamMembers },
                //headers: {
                //    'Content-Type': 'application/json'
                //},
                //transformRequest: angular.identity,
            }).then(function (response) {
                console.log(response);
            }, function (reason) {
                console.log(reason);
            });
        }

        $scope.getGroupsData = function (index, groupId) {
            $scope.getGroupMembers(index, groupId);
            $scope.getGroupProfiles(index, groupId);
            $scope.getGroupProfilesToconnect(index, groupId);
        }
        // $scope.getGroupMembers(0, 1);

        $scope.addProfileToGroup = function (groupId, profileId, profileType) {
            $http({
                method: 'POST',
                url: apiDomain + '/api/GroupProfiles/AddProfileToGroup?profileId=' + profileId + '&groupId=' + groupId + '&userId=' + $rootScope.user.Id + '&profileType=' + profileType,
            }).then(function (response) {
                if (response.data == 'Added Successfully') {
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                }
                else {
                    alertify.set({ delay: 1000 });
                    alertify.error(response.data);
                }
            }, function (reason) {
                alertify.set({ delay: 1000 });
                alertify.error(reason.data);
            });
        }
        groups();
    });
});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('ul.tabs').tabs();
                $('.modal-trigger').leanModal();

            });
        }
    };
})