'use strict';

SocioboardApp.controller('GroupsController', function ($rootScope, $scope, $http, $timeout, apiDomain,groupmember,utility) {
    $scope.$on('$viewContentLoaded', function () {
        $scope.lstInviteTeamMembers = []; // array contains list of needs to invite for current group

        


        $scope.utility = utility;

        $scope.deleteProfile = function(profileId, groupId){
            swal({
                title: "Are you sure?",
                text: "You will not be able to send any message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
           function () {
               console.log(profileId)

               $http({
                   method: 'POST',
                   url: apiDomain + '/api/GroupProfiles/DeleteProfile?groupId=' + groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + profileId,
               }).then(function (response) {
                   if (response.data == "Deleted") {
                       swal("Deleted!", "Your profile has been deleted.", "Success");
                       $scope.getGroupsData($rootScope.index, groupId);
                       window.location.reload();
                   }
                   else {
                       swal("Deleted!", response.data, "success");
                   }

               }, function (reason) {
                   swal("Deleted!", reason, "success");
               });

               //todo: code to delete profile
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
	            swal("Deleted!", "Group has been deleted", "Success"); 
	            });
        }

        $scope.addgroupmodal = function () {
            $('#CreateGroupModal').openModal();
        }

        $scope.closegroupmodal = function () {
            $('.lean-overlay').remove();
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
                    $('#CreateGroupModal').closeModal();
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                    window.location.reload();
                }
                else {
                    alertify.set({ delay: 1000 });
                    alertify.error(response.data);
                }
            }, function (reason) {
                console.log(reason);
            });
        }



        //get GroupProfiles of a perticular group and add to groups array in group
        $scope.getGroupProfiles = function (index, groupId) {
            console.log("entered");
           // if ($rootScope.groups[index].profiles == undefined) {
                //codes to load  fb profiles start
                $http.get(apiDomain + '/api/GroupProfiles/GetGroupProfiles?groupId=' + groupId)
                              .then(function (response) {
                                  $rootScope.groups[index].profiles = response.data;
                                  console.log($rootScope.groups[index].profiles);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load fb profiles
           // }

        }



        //get GroupProfiles to connect of a perticular group and add to groups array in group
        $scope.getGroupProfilesToconnect = function (index, groupId) {
            
           // if ($rootScope.groups[index].profilesToConnect == undefined) {
                $http.get(apiDomain + '/api/GroupProfiles/getProfilesAvailableToConnect?groupId=' + groupId +'&userId='+ $rootScope.user.Id)
                              .then(function (response) {
                                  $rootScope.groups[index].profilesToConnect = response.data;
                                  console.log($rootScope.groups[index].profilesToConnect);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            //}

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
            debugger;
            var mem ='';
            for (var i = 0; i < $scope.lstInviteTeamMembers.length ; i++)
            {
                mem = mem + $scope.lstInviteTeamMembers[i].firstName + ':' + $scope.lstInviteTeamMembers[i].lastName + ':' + $scope.lstInviteTeamMembers[i].email + ';'
            }

            console.log($scope.lstInviteTeamMembers);
            if (mem!="") {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/GroupMember/InviteGroupMembers?groupId=' + $scope.inviGrpId + '&members=' + mem,
                    //  params: { 'mem':  $scope.lstInviteTeamMembers },
                    //headers: {
                    //    'Content-Type': 'application/json'
                    //},
                    //transformRequest: angular.identity,
                }).then(function (response) {
                    $('#InviteMembersModal').closeModal();
                    swal('Email sent successfully');
                    window.location.reload();

                }, function (reason) {
                    console.log(reason);
                });
            }
            else {
                swal("Please click on add button in order add the group members to the folder");
            }
        }

        $scope.getGroupsData = function (index, groupId) {
            debugger;
            $rootScope.index = index;
            groupmember.getGroupMembers(index, groupId);
            $scope.getGroupProfiles(index, groupId);
            $scope.getGroupProfilesToconnect(index, groupId);
        }

        $scope.addProfileToGroup = function (groupId, profileId, profileType) {
           
            $http({
                method: 'POST',
                url: apiDomain + '/api/GroupProfiles/AddProfileToGroup?profileId=' + profileId + '&groupId=' + groupId + '&userId=' + $rootScope.user.Id + '&profileType=' + profileType,
            }).then(function (response) {
                if (response.data == 'Added Successfully') {
                    $scope.getGroupsData($rootScope.index, groupId);
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                   // $scope.getOnPageLoadGroups();
                   // window.location.reload();

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

        $scope.getOnPageLoadGroups = function () {
            var canContinue = true;
            angular.forEach($rootScope.groups, function (value, key) {
                if (canContinue && value.id == $rootScope.groupId) {
                    $scope.getGroupsData(key, $rootScope.groupId)
                    canContinue = false;
                }
            });
        }

        $scope.getOnPageLoadGroups();
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