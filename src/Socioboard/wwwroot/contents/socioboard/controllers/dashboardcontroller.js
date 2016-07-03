'use strict';

SocioboardApp.controller('DashboardController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        if ($rootScope.lstAddFbPages != undefined) {
            //todo : angular codes to open modal and render pages in the model
            $scope.modalinstance = $modal.open({
                templateUrl: 'pageModalContent.html',
                controller: 'fbpagemodalcontroller',
                scope: $scope
            });

        }
        $scope.ComposeMessage = function () {
            var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
            var formData = new FormData();
            formData.append('files', $("#composeImage").get(0).files[0]);
            $http({
                method: 'POST',
                url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                console.log(response);
            }, function (reason) {
                console.log(reason);
            });
        }


        $scope.fetchProfiles = function () {
           
            //codes to load  fb profiles start
            $http.get(apiDomain + '/api/Facebook/GetFacebookProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.lstFbProfiles = response.data;
                              console.log($scope.lstFbProfiles);
                              if (response.data.length < 3) {


                                  $scope.fetchTwtProfiles(response.data.length);

                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles


        }


        $scope.fetchTwtProfiles = function (count) {

            console.log(count);
            //codes to load  twitter profiles start
            $http.get(apiDomain + '/api/Twitter/GetTwitterProfiles?groupId=' + $rootScope.groupId )
                          .then(function (response) {
                              console.log(response.data);
                              $scope.lstTwtProfiles = response.data;
                              if ( count + response.data.length < 3) {

                                  // TODO : codes to call other profiles if count still less than 3

                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load twitter profiles


        }

        $scope.fetchProfiles();

        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send message via this account!",
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
                    url: apiDomain + '/api/GroupProfiles/DeleteProfile?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + profileId,
                }).then(function (response) {
                    if (response.data == "Deleted")
                    {
                        swal("Deleted!", "Your profile has been deleted.", "success");
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

        dashboard();

    });

});
SocioboardApp.controller('fbpagemodalcontroller', function ($rootScope, $scope, $http, apiDomain) {
    $scope.closeModal = function () {
        $scope.modalinstance.dismiss('cancel');
    }
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
    $scope.selectedProfiles = [];

    $scope.AddFacebookPages = function () {
        if ($scope.selectedProfiles.length > 0) {
            $scope.modalinstance.dismiss('cancel');
            var formData = new FormData();
            formData.append('profileaccesstoken', $scope.selectedProfiles);
            $http({
                method: 'POST',
                url: apiDomain + '/api/Facebook/AddFacebookPages?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,

            }).then(function (response) {
                if (response.status == 200) {
                    window.location.reload();
                    swal(response.data);
                }
            }, function (reason) {
                swal("Error!");
            });
        }
        else {
            swal("Select Atleast One Page to add!");
        }
    }

});