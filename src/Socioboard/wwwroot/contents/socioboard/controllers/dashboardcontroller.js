'use strict';

SocioboardApp.controller('DashboardController', function ($rootScope, $scope, $http, $modal, $timeout, apiDomain,domain) {
    //alert('helo');
    
        $scope.$on('$viewContentLoaded', function () {
            //console.log(lstAddFbPages);

            if ($rootScope.lstAddFbPages != undefined) {
                $('#FbFanpage_Modal').openModal();
            }
            if ($rootScope.lstaddlinpages != undefined) {
                $('#LinCompanypage_Modal').openModal();
            }
            if ($rootScope.lstGanalytics != undefined) {
                $('#GoogleAnalytics_Modal').openModal();
            }

            $scope.TwitterRecentFollower = function () {
                //codes to load  TwitterRecentFollower
                $http.get(apiDomain + '/api/Twitter/TwitterRecentFollower?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.TwitterRecentFollower = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to TwitterRecentFollower
            }

            $scope.TwitterFollowerCount = function () {
                //codes to load  TwitterFollowerCount
                $http.get(apiDomain + '/api/Twitter/TwitterFollowerCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.TwitterFollowerCount = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to TwitterFollowerCount
            }
            $scope.FacebookfanPageCount = function () {
                //codes to load  FacebookfanPageCount
                $http.get(apiDomain + '/api/Facebook/FacebookfanPageCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.FacebookfanPageCount = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to FacebookfanPageCount
            }

            $scope.TotalSetMessages = function () {
                //codes to load  TotalSetMessages
                $http.get(apiDomain + '/api/SocialMessages/GetAllSentMessagesCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.TotalSetMessages = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to TotalSetMessages
            }

            $scope.ComposePostModal = function () {
                $('#ComposePostModal').openModal();
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
                    if (response.data == "Posted") {
                        $('#ComposePostModal').closeModal();
                        swal('Message compose successfully');
                    }
                    
                }, function (reason) {
                    console.log(reason);
                });
            }
            $scope.GetIncommingMessage = function () {
                //codes to load  TotalIncommingMessages
                $http.get(apiDomain + '/api/Twitter/GetIncommingMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.TotaltIncommingMessage = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to TotalIncommingMessages
            }

            $scope.fetchProfiles = function () {

                //codes to load  fb profiles start
                $http.get(apiDomain + '/api/Facebook/GetFacebookProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.lstFbProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load fb profiles


            }


            $scope.fetchTwtProfiles = function () {

                //codes to load  twitter profiles start
                $http.get(apiDomain + '/api/Twitter/GetTwitterProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  console.log(response.data);
                                  $scope.lstTwtProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load twitter profiles


            }

            $scope.fetchGplusProfiles = function () {

                //codes to load  Gplus profiles start
                $http.get(apiDomain + '/api/Google/GetGplusProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.lstGplusProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load Gplus profiles


            }
            $scope.fetchGAProfiles = function () {

                //codes to load  GA profiles start
                $http.get(apiDomain + '/api/Google/GetGAProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.lstAProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load GA profiles


            }
            $scope.fetchInstagramProfiles = function () {

                //codes to load  Instagram profiles start
                $http.get(apiDomain + '/api/Instagram/GetInstagramProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.lstinsProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load Instagram profiles


            }


            $scope.fetchLinkedInCompanyPagesProfiles = function () {

                //codes to load  LinkedIn Comapany page profiles start
                $http.get(apiDomain + '/api/LinkedIn/GetLinkedInCompanyPagesProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.lstlincmpnyProfiles = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load LinkedIn Comapany page profiles


            }

            $scope.fetchProfiles();
            $scope.fetchTwtProfiles();
            $scope.fetchGplusProfiles();
            $scope.fetchInstagramProfiles();
            $scope.fetchGAProfiles();
            $scope.fetchLinkedInCompanyPagesProfiles();
            $scope.TotalSetMessages();
            $scope.GetIncommingMessage();
            $scope.TwitterFollowerCount();
            $scope.FacebookfanPageCount();
            $scope.TwitterRecentFollower();

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
                        if (response.data == "Deleted") {
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



            //codes to add linkedin pages
            $scope.toggleLinkedinProfileSelection = function (profileid, token, name) {
                var idx = $scope.selectedLinkedinProfiles.indexOf(profileid, token, name);
                var data = "";
                // is currently selected
                if (idx > -1) {
                    $scope.selectedLinkedinProfiles.splice(idx, 1);
                }

                    // is newly selected
                else {
                    data = profileid + '<:>' + token + '<:>' + name;
                    $scope.selectedLinkedinProfiles.push(data);
                }
            };
            $scope.selectedLinkedinProfiles = [];
            $scope.addcompanypages = function () {
                if ($scope.selectedLinkedinProfiles.length > 0) {
                    // $scope.modalinstance.dismiss('cancel');
                    var formData = new FormData();
                    formData.append('profileaccesstoken', $scope.selectedLinkedinProfiles);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/LinkedIn/AddLinkedInPages?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
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
            // end codes to add linkedin pages


            //codes to add facebook pages
            $scope.toggleFbPageProfileSelection = function (option) {
                var idx = $scope.selectedFbPageProfiles.indexOf(option);

                // is currently selected
                if (idx > -1) {
                    $scope.selectedFbPageProfiles.splice(idx, 1);
                }

                    // is newly selected
                else {
                    $scope.selectedFbPageProfiles.push(option);
                }
            };
            $scope.selectedFbPageProfiles = [];

            $scope.AddFacebookPages = function () {
                if ($scope.selectedFbPageProfiles.length > 0) {
                    //$scope.modalinstance.dismiss('cancel');
                    var formData = new FormData();
                    formData.append('profileaccesstoken', $scope.selectedFbPageProfiles);
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
            //end codes to add facebook pages


            //code to add Ga Sites
            $scope.toggleGAeProfileSelection = function (AccessToken, RefreshToken, AccountId, AccountName, EmailId, ProfileId, ProfileName, WebPropertyId, WebsiteUrl) {
                var idx = $scope.selectedLinkedinProfiles.indexOf(AccessToken, RefreshToken, AccountId, AccountName, EmailId, ProfileId, ProfileName, WebPropertyId, WebsiteUrl);
                var data = "";
                // is currently selected
                if (idx > -1) {
                    $scope.selectedGAPageProfiles.splice(idx, 1);
                }

                    // is newly selected
                else {
                    data = AccessToken + '<:>' + RefreshToken + '<:>' + AccountId + '<:>' + AccountName + '<:>' + EmailId + '<:>' + ProfileId + '<:>' + ProfileName + '<:>' + WebPropertyId + '<:>' + WebsiteUrl;
                    $scope.selectedGAPageProfiles.push(data);
                }
            }
            $scope.selectedGAPageProfiles = [];
            $scope.AddGaSites = function () {
                if ($scope.selectedGAPageProfiles.length > 0) {
                    var formData = new FormData();
                    formData.append('profileaccesstoken', $scope.selectedGAPageProfiles);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/Google/AddGaSites?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
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
            //end codes to add Ga Sites


            $scope.Addfacebookpagebyurl = function () {
                var url = $('#_txtinputurl').val();
                if (url != "" && url.indexOf('facebook') > 0) {
                    //codes to load  Gplus profiles start
                    $http.get(apiDomain + '/api/Facebook/AddFacebookPagesByUrl?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&url=' + url)
                                  .then(function (response) {
                                      $('#_txtinputurl').val('');

                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });
                    // end codes to load Gplus profiles
                }
                else {
                    swal("Please Enter a valid url");
                }
            }


            $scope.changeGroup = function (groupId) {
                $http.get(domain + '/Home/changeSelectdGroupId?groupId=' + groupId)
                              .then(function (response) {
                                  if (response.data == "changed") {
                                      $rootScope.groupId = groupId;
                                      window.location.reload();
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            }
            dashboard();

        });
    
});