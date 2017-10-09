'use strict';

SocioboardApp.controller('GroupsController', function ($rootScope, $scope, $http, $timeout, apiDomain,groupmember,utility) {
    $scope.$on('$viewContentLoaded', function () {
        $scope.lstInviteTeamMembers = []; // array contains list of needs to invite for current group
        $scope.accountType = $rootScope.user.AccountType;
        $scope.userEmail = $rootScope.user.EmailId;        
        $scope.message = function () {
            $scope.msg = "As per your plan you already added maximum number of members.If you want to add more members in your team upgrade your plan. ";
            swal($scope.msg);
        };

        //$scope.grpmsgs = function (grpmsg) {
        //    $scope.grpmsg = "You reached maximum groups count you can't create more groups  ";
        //    swal(grpmsg);
        //};

        $scope.utility = utility;
        $scope.btnLded = 'temp';
        $scope.btnLding = 'hide';
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
                alertify.error("Team name should not be empty");
                return ;
            }
            $http({
                method: 'POST',
                url: apiDomain + '/api/Groups/CreateGroup?GroupName=' + encodeURIComponent(groupName) + '&AdminId=' + $rootScope.user.Id,
            }).then(function (response) {
                if (response.data == 'Group Added') {
                    $('#CreateGroupModal').closeModal();
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                }
                else {
                    alertify.set({ delay: 1000 });
                    alertify.success(response.data);
                    $('#CreateGroupModal').closeModal();
                    window.location.reload();
                }
            }, function (reason) {
               
            });
        }



        //get GroupProfiles of a perticular group and add to groups array in group
        $scope.getGroupProfiles = function (index, groupId) {
          
           // if ($rootScope.groups[index].profiles == undefined) {
                //codes to load  fb profiles start
            $http.get(apiDomain + '/api/GroupProfiles/GetAllGroupProfiles?groupId=' + groupId)
                              .then(function (response) {
                                  $rootScope.groups[index].profiles = response.data;
                                 
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
                                
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            //}

        }

        $scope.getadminDetails = function (index, groupId) {

            $http.get(apiDomain + '/api/GroupMember/GetGroupAdmin?groupId=' + groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $rootScope.groups[index].admin = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            //}

        }

        $scope.adminDelete = function (index, groupId) {

            $http.get(apiDomain + '/api/GroupMember/DeleteGroup?groupId=' + groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                            
                              $scope.success = response.data;
                              swal("Team is deleted");
                              window.location.reload();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        $scope.leaveGroup = function (index, groupId) {

            $http.get(apiDomain + '/api/GroupMember/LeaveGroup?groupId=' + groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                             
                              $scope.success = response.data;
                              swal("successfully Leave");
                              window.location.reload();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }






        //Get Group members count
        $scope.getgroupsmembercount = function () {
            $http.get(apiDomain + '/api/Groups/GetUserGroupsMembersCount?&userId=' + $rootScope.user.Id)
                 .then(function (response) {
                     $scope.membercount = response.data;

                     $http.get(apiDomain + '/api/GroupMember/RetainGrpMber?userId=' + $rootScope.user.Id)
                     .then(function (response) {
                         $scope.grpdetails = response.data;

                         if ($scope.membercount > 2 && $rootScope.user.AccountType == 0) {
                             $scope.maxmember = 2;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 5 && $rootScope.user.AccountType == 1) {
                             $scope.maxmember = 5;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 10 && $rootScope.user.AccountType == 2) {
                             $scope.maxmember = 10;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 20 && $rootScope.user.AccountType == 3) {
                             $scope.maxmember = 20;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 30 && $rootScope.user.AccountType == 4) {
                             $scope.maxmember = 30;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 50 && $rootScope.user.AccountType == 5) {
                             $scope.maxmember = 50;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 80 && $rootScope.user.AccountType == 6) {
                             $scope.maxmember = 80;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                         else if ($scope.membercount > 100 && $rootScope.user.AccountType == 7) {
                             $scope.maxmember = 100;
                             $('#ActiveMemberModal').openModal({ dismissible: false });
                         }
                     }, function (reason) {
                         $scope.error = reason.data;
                     });





                 }, function (reason) {
                     $scope.error = reason.data;
                 });
            //}

        }



        $scope.retainMemberSelection = function (option) {
            var idx = $scope.selectedMembersrestrict.indexOf(option);

            // is currently selected
            if (idx > -1) {
                $scope.selectedMembersrestrict.splice(idx, 1);
            }

                // is newly selected
            else {
                $scope.selectedMembersrestrict.push(option);
            }
        };
        $scope.selectedMembersrestrict = [];
        //retain group
        $scope.retainGrpMember = function (max, current) {
            var tempMembers = current - max;
            
            if ($scope.selectedMembersrestrict.length >= tempMembers) {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/GroupMember/DeleteGroupMembers?grpMmbrIdss=' + $scope.selectedMembersrestrict,
                }).then(function (response) {
                    if (response.data != "") {
                        alertify.success('Selected team members has been deleted successfully');
                        window.location.reload();
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
        };

        $scope.openMemberInvitationModal = function (groupId, groupName) {
            $('#InviteMembersModal').openModal();
            $scope.inviGrpName = groupName;
            $scope.inviGrpId = groupId;
            $scope.lstInviteTeamMembers = [];
        }

        $scope.addToInviteList = function (inviteMember) {
            var mem = {
                "email": inviteMember.email,
                "firstName": inviteMember.firstName,
                "lastName": inviteMember.lastName,
                "id": 0,
                "userId": $rootScope.user.Id,
                "profileImg": $rootScope.user.profileImg,
                "memberStatus": 0,
                "groupid": $scope.inviGrpId,
                "isAdmin": false,
                "memberCode": ""
            };

            // if ($scope.lstInviteTeamMembers.length > 0) {
            //   if (mem.email == $scope.lstInviteTeamMembers[0].email) {

            var lstVal = 0;
            angular.forEach($scope.lstInviteTeamMembers, function (value, key) {
                if (mem.email == value.email) {
                    swal("please fill the required field")
                    lstVal = -1;
                    return false;
                }
                else {
                    document.getElementById('first_name').value = "";
                    document.getElementById('last_name').value = "";
                    document.getElementById('email').value = "";
                }
            });
            if (lstVal != -1) {
                $scope.lstInviteTeamMembers.push(mem);
                $scope.inviteMember = null;
                document.getElementById('first_name').value = "";
                document.getElementById('last_name').value = "";
                document.getElementById('email').value = "";
            }
        }

        

        $scope.deleteFromInviteList = function (index) {
            $scope.lstInviteTeamMembers.splice(index, 1);
        }

        $scope.SendInvitations = function (groupId) {
            var fir_name=$('#first_name').val();
            var sec_name=$('#first_name').val();
            var email_s=$('#first_name').val();
            if (fir_name == "" && sec_name == "" && email_s == "") {
                var mem = '';
                for (var i = 0; i < $scope.lstInviteTeamMembers.length ; i++) {
                    mem = mem + $scope.lstInviteTeamMembers[i].firstName + ':' + $scope.lstInviteTeamMembers[i].lastName + ':' + $scope.lstInviteTeamMembers[i].email + ';'
                }


                if (mem != "") {
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

                    });
                }
                else {
                    swal("Please click on add button in order add the team members to the folder");
                }
            }
            else {
                swal("Please click on add button in order add the team members to the folder");
            }
        }

        $scope.getGroupsData = function (index, groupId) {
          
            $rootScope.index = index;
            groupmember.getGroupMembers(index, groupId);
            $scope.getGroupProfiles(index, groupId);
            $scope.getGroupProfilesToconnect(index, groupId);
            $scope.getadminDetails(index, groupId);
            $rootScope.adminDelete(index, groupId);
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

        $scope.toggleMemberSelection = function (option) {
            var idx = $scope.selectedMembers.indexOf(option);

            // is currently selected
            if (idx > -1) {
                $scope.selectedMembers.splice(idx, 1);
            }

                // is newly selected
            else {
                $scope.selectedMembers.push(option);
            }
        };
        $scope.selectedMembers = [];

        $scope.deleteGrpMember = function (groupId) {
            if ($scope.selectedMembers.length != 0) {
                $scope.btnLded = 'hide';
                $scope.btnLding = 'temp';
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/GroupMember/DeleteGroupMembers?grpMmbrIdss=' + $scope.selectedMembers,
                }).then(function (response) {
                    if (response.data != "") {
                        $scope.btnLded = 'temp';
                        $scope.btnLding = 'hide';
                        alertify.success('Selected team members has been deleted successfully');
                        window.location.reload();
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
        };

        $scope.openDeleteModal = function (idss) {
            var temp = '#Edit_' + idss;
            $(temp).openModal();
        }

        $scope.getOnPageLoadGroups = function () {
            $scope.getgroupsmembercount();
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