'use strict';

SocioboardApp.controller('ProfilesController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');

    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.check = false;
        $scope.draftbtn = true;


        var getAllSelected = function () {
            var selectedItems = $rootScope.lstProfiles.filter(function (profile) {
                return profile.Selected;
            });

            return selectedItems.length === $rootScope.lstProfiles.length;
        }

        var setAllSelected = function (value) {
            angular.forEach($rootScope.lstProfiles, function (profile) {
                profile.Selected = value;
            });
        }

        $scope.allSelected = function (value) {
            if (value !== undefined) {
                return setAllSelected(value);
            } else {
                return getAllSelected();
            }
        }


        //Auth.login().success(function () { });
        $scope.getHttpsURL = function (obj) {
            return obj.replace("http:", "https:")
        };
        if ($rootScope.lstAddFbPages != undefined) {
            $('#FbFanpage_Modal').openModal();
        }
        if ($rootScope.lstaddlinpages != undefined) {
            $('#LinCompanypage_Modal').openModal();
        }
        if ($rootScope.lstGanalytics != undefined) {
            $('#GoogleAnalytics_Modal').openModal();
        }
        if ($rootScope.lstYoutube != undefined) {
            $('#Youtube_Modal').openModal();
        }
        if ($rootScope.Downgrade == true) {
            $('#ActiveProfileModal').openModal({ dismissible: false });
        }


        //codes to load  TwitterRecentFollower
        $scope.TwitterRecentFollower = function () {
            $http.get(apiDomain + '/api/Twitter/TwitterRecentFollower?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.TwitterRecentFollower = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to TwitterRecentFollower

        //codes to load  TwitterFollowerCount
        $scope.TwitterFollowerCount = function () {

            $http.get(apiDomain + '/api/Twitter/TwitterFollowerCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TwitterFollowerCount = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to TwitterFollowerCount

        //codes to load  FacebookfanPageCount
        $scope.FacebookfanPageCount = function () {

            $http.get(apiDomain + '/api/Facebook/FacebookfanPageCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.FacebookfanPageCount = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to FacebookfanPageCount

        //codes to load  TotalSetMessages
        $scope.TotalSetMessages = function () {

            $http.get(apiDomain + '/api/SocialMessages/GetAllSentMessagesCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TotalSetMessages = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        //end codes to TotalSetMessages

        $scope.ComposePostModal = function () {
            $('#ComposePostModal').openModal();
        }


        //code for compose message start
        $scope.ComposeMessage = function () {
            var profiles = new Array();
            $("#checkboxdata .subcheckbox").each(function () {
                debugger;
                var attrId = $(this).attr("id");
                if (document.getElementById(attrId).checked == false) {
                    var index = profiles.indexOf(attrId);
                    if (index > -1) {
                        profiles.splice(index, 1);
                    }
                } else {
                    profiles.push(attrId);
                }
            });

            $scope.dispbtn = false;
            // var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            var testmsg = message;
            message = encodeURIComponent(message);
            //var postdata = message.split("\n");
            //for (var i = 0; i < postdata.length; i++) {
            //    updatedmessage = updatedmessage + "<br>" + postdata[i];
            //}
            // updatedmessage = updatedmessage.replace(/#+/g, 'hhh');


            if (profiles.length != 0 && /\S/.test(testmsg)) {
                $scope.checkfile();
                if ($scope.check == true) {
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
                            $scope.dispbtn = true;
                            $('#ComposePostModal').closeModal();
                            swal('Message composed successfully');
                        }

                    }, function (reason) {
                        console.log(reason);
                    });
                }
                else {
                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#input-file-now').val('');
                }
            }
            else {
                $scope.dispbtn = true;
                if (profiles.length == 0) {
                    swal('Please select a profile');
                }
                else {
                    swal('Please enter some text to compose this message');
                }
            }
        }
        //code for compose message end

        //code for checking the file format start
        $scope.checkfile = function () {
            var filesinput = $('#composeImage');//composeImage
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'mov', 'mp4', 'mpeg', 'wmv', 'avi', 'flv', '3gp'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#composeImage', fileExtension)) {
                    $scope.check = true;
                }
                else {
                    $scope.check = false;
                }
            }
            else {
                $scope.check = true;
            }
        }
        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#composeImage').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }
        //code for checking the file format end



        //codes to load  TotalIncommingMessages
        $scope.GetIncommingMessage = function () {

            $http.get(apiDomain + '/api/Twitter/GetIncommingMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TotaltIncommingMessage = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to TotalIncommingMessages


        // codes to draft message start
        $scope.draftMsg = function () {
            $scope.draftbtn = false;
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');
            message = updatedmessage;

            if (message != "" && message != undefined) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    //$scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#composeMessage').val('');
                        //$('#ScheduleTime').val('');
                        $scope.draftbtn = true;
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }

                else if ($scope.check == false) {
                    var formData = new FormData();
                    $scope.draftbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.draftbtn = true;
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }
                else {
                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#input-file-now').val('');
                }
            }
            else {
                swal('Please type a message to save in draft');
            }
        }
        //codes for draft message end

        //codes to load  fb profiles start
        $scope.fetchProfiles = function () {
            $http.get(apiDomain + '/api/Facebook/GetAllFacebookProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstFbProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.nopro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load fb profiles

        //codes to load  twitter profiles start
        $scope.fetchTwtProfiles = function () {
            $http.get(apiDomain + '/api/Twitter/GetAllTwitterProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              console.log(response.data);
                              if (response.data != "") {
                                  $scope.lstTwtProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.notwtpro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load twitter profiles

        //codes to load  Gplus profiles start
        $scope.fetchGplusProfiles = function () {
            $http.get(apiDomain + '/api/Google/GetAllGplusProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstGplusProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.nogpluspro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load Gplus profiles

        //codes to load  GA profiles start
        $scope.fetchGAProfiles = function () {
            $http.get(apiDomain + '/api/Google/GetAllGAProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstAProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.noGApro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load GA profiles

        //codes to load  Instagram profiles start
        $scope.fetchInstagramProfiles = function () {
            $http.get(apiDomain + '/api/Instagram/GetAllInstagramProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstinsProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.noinstapro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load Instagram profiles

        //codes to load  YT Channels start
        $scope.fetchYTChannels = function () {
            $http.get(apiDomain + '/api/Google/GetAllYTChannelsSB?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstYChannel = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.noYTcha = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 1500);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load YT Channels

        //codes to load  LinkedIn Comapany page profiles start
        $scope.fetchLinkedInCompanyPagesProfiles = function () {
            $http.get(apiDomain + '/api/LinkedIn/GetAllLinkedInCompanyPagesProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstlincmpnyProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.noLinkedpro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load LinkedIn Comapany page profiles

        //codes to load  LinkedIn Account profiles start
        $scope.fetchLinkedInAccountProfiles = function () {
            debugger;
            $http.get(apiDomain + '/api/LinkedIn/GetAllLinkedAccountProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstlinAccountProfiles = response.data;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                              else {
                                  $scope.noLinkedpro = true;
                                  setTimeout(function () {
                                      $scope.loaderclass = 'hide';
                                  }, 3000);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to load LinkedIn Account profiles

        $scope.contentFeeds = function (key) {
            $rootScope.keyword = key;
            $state.go('rss_news');
            //$state.go('schedulemessage');
        }



        $scope.fetchProfiles();
        $scope.fetchTwtProfiles();
        $scope.fetchGplusProfiles();
        $scope.fetchInstagramProfiles();
        $scope.fetchGAProfiles();
        $scope.fetchLinkedInCompanyPagesProfiles();
        $scope.fetchLinkedInAccountProfiles();
        $scope.TotalSetMessages();
        $scope.GetIncommingMessage();
        $scope.TwitterFollowerCount();
        $scope.FacebookfanPageCount();
        $scope.TwitterRecentFollower();
        $scope.fetchYTChannels();

        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
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
                    url: apiDomain + '/api/GroupProfiles/DeleteProfile?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + profileId,
                }).then(function (response) {
                    if (response.data == "Deleted") {
                        // swal("Deleted!", "Your profile has been deleted", "Success");
                        swal("Deleted!", "Account is deleted", "success");
                    }
                    window.location.reload();
                });
                //    else {
                //        //  swal("Deleted!", response.data, "success");
                //        swal("Deleted!","success");
                //    }

                //}, function (reason) {
                //    // swal("Deleted!", reason, "success");
                //    swal("Deleted!","success");
                //});

                //todo: code to delete profile
            });
        }

        $scope.deleteGpProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not able to see any feeds from this account!",
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
                        // swal("Deleted!", "Your profile has been deleted", "Success");
                        swal("Deleted!", "Account is deleted", "success");
                    }
                    window.location.reload();
                });

            });
        }


        $scope.deleteGaProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not able to see any data from this account!",
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
                        // swal("Deleted!", "Your profile has been deleted", "Success");
                        swal("Deleted!", "Account is deleted", "success");
                    }
                    window.location.reload();
                });

            });
        }

        $scope.deleteChannel = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send any video via this account!",
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
                        // swal("Deleted!", "Your profile has been deleted", "Success");
                        swal("Deleted!", "Account is deleted", "success");
                    }
                    window.location.reload();
                });
                //    else {
                //        //  swal("Deleted!", response.data, "success");
                //        swal("Deleted!","success");
                //    }

                //}, function (reason) {
                //    // swal("Deleted!", reason, "success");
                //    swal("Deleted!","success");
                //});

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
        $scope.selecteLinkedinProfiles = [];
        $scope.addcompanypages = function () {

            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (value.profileType == 4) {
                    if ($rootScope.lstaddlinpages.indexOf(value.profileId) == -1) {

                        $scope.selecteLinkedinProfiles.push(value.profileId);
                    }

                }
            });

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
            } else if ($scope.selecteLinkedinProfiles.length > 0) {
                swal("This page is already added");
            }
            else {
                swal("Select atleast one page to add!");
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
        $scope.selecteFbPageProfiles = [];
        // toggleGAeProfileSelection();
        $scope.AddFacebookPages = function () {
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (value.profileType == 1) {
                    if ($rootScope.lstAddFbPages.indexOf(value.profileId) == -1) {

                        $scope.selecteFbPageProfiles.push(value.profileId);
                    }

                }
            });
            console.log($scope.selecteFbPageProfiles);
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
            } else if ($scope.selecteFbPageProfiles.length > 0) {
                swal("This page is already added");
            }
            else {
                swal("Select atleast one page to add!");
            }
        }
        //end codes to add facebook pages


        //code to add Ga Sites
        $scope.toggleGAeProfileSelection = function (AccessToken, RefreshToken, AccountId, AccountName, EmailId, ProfileId, ProfileName, WebPropertyId, WebsiteUrl, internalWebPropertyId) {
            var idx = $scope.selectedGAPageProfiles.indexOf(AccessToken, RefreshToken, AccountId, AccountName, EmailId, ProfileId, ProfileName, WebPropertyId, WebsiteUrl, internalWebPropertyId);
            var data = "";
            // is currently selected
            if (idx > -1) {
                $scope.selectedGAPageProfiles.splice(idx, 1);
            }

                // is newly selected
            else {
                data = AccessToken + '<:>' + RefreshToken + '<:>' + AccountId + '<:>' + AccountName + '<:>' + EmailId + '<:>' + ProfileId + '<:>' + ProfileName + '<:>' + WebPropertyId + '<:>' + WebsiteUrl + '<:>' + internalWebPropertyId;
                $scope.selectedGAPageProfiles.push(data);
            }
        }
        $scope.selectedGAPageProfiles = [];
        $scope.selecteGAPageProfiles = [];
        $scope.AddGaSites = function () {
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (value.profileType == 10) {
                    if ($rootScope.lstGanalytics.indexOf(value.profileId) == -1) {

                        $scope.selecteGAPageProfiles.push(value.profileId);
                    }

                }
            });


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
            else if ($scope.selecteGAPageProfiles.length > 0) {
                swal("This account is already added");
            }
            else {
                swal("Select atleast one page to add!");
            }
        }
        //end codes to add Ga Sites

        //code to add Youtube Channels

        var access;
        var chaid;

        $scope.toggleYTProfileSelection = function (Accesstoken, Refreshtoken, YtChannelId, YtChannelName, YtChannelDescrip, PublishDate, viewscount, commentscount, videoscount, YtChannelImage, subscriberscount) {
            var idx = $scope.selectedYTChannels.indexOf(Accesstoken, Refreshtoken, YtChannelId, YtChannelName, YtChannelDescrip, PublishDate, viewscount, commentscount, videoscount, YtChannelImage, subscriberscount);

            access = Accesstoken;
            chaid = YtChannelId;

            var data = "";
            // is currently selected
            if (idx > -1) {
                $scope.selectedYTChannels.splice(idx, 1);
            }

                // is newly selected
            else {
                data = Accesstoken + '<:>' + Refreshtoken + '<:>' + YtChannelId + '<:>' + YtChannelName + '<:>' + YtChannelDescrip + '<:>' + PublishDate + '<:>' + viewscount + '<:>' + commentscount + '<:>' + videoscount + '<:>' + YtChannelImage + '<:>' + subscriberscount;
                $scope.selectedYTChannels.push(data);
            }
        }
        $scope.selectedYTChannels = [];
        $scope.selecteYTChannels = [];
        $scope.AddYTChannels = function () {
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (value.profileType == 10) {
                    if ($rootScope.lstYoutube.indexOf(value.profileId) == -1) {

                        $scope.selecteYTChannels.push(value.profileId);
                    }

                }
            });


            if ($scope.selectedYTChannels.length > 0) {
                var formData = new FormData();
                formData.append('profileaccesstoken', $scope.selectedYTChannels);
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Google/AddYoutubeChannels?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,

                }).then(function (response) {
                    if (response.status == 200) {
                        window.location.reload();
                        swal(response.data);
                        $scope.addinitialfeeds(access, chaid);
                    }
                }, function (reason) {
                    swal("Error!");
                });
            }
            else if ($scope.selecteYTChannels.length > 0) {
                swal("This channel is already added");
            }
            else {
                swal("Select atleast one channel to add!");
            }
        }
        //end codes to add Youtube Channels

        //code for addselected profiles
        $scope.toggleProfileSelection = function (profileid) {
            var idx = $scope.selectedProfiles.indexOf(profileid);
            var data = "";
            // is currently selected
            if (idx > -1) {
                $scope.selectedProfiles.splice(idx, 1);
            }

                // is newly selected
            else {
                data = profileid;
                $scope.selectedProfiles.push(data);
            }
        };
        //end code 
        $scope.selectedProfiles = [];


        $scope.AddSelectedProfiles = function () {
            //console.log($scope.selectedProfiles);
            if ($scope.selectedProfiles.length <= $rootScope.MaxCount) {
                var formData = new FormData();
                formData.append('selectedProfiles', $scope.selectedProfiles);
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/GroupProfiles/AddSelectedProfiles?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,

                }).then(function (response) {
                    if (response.status == 200) {
                        $('#ActiveProfileModal').closeModal();
                        $rootScope.Downgrade = false;
                        window.location.reload();
                        // swal(response.data);
                    }
                }, function (reason) {
                    swal("Error!");
                });
            }
            else {
                swal('please select ' + $rootScope.MaxCount + ' Profiles');
            }

        }


        $scope.Addfacebookpagebyurl = function () {
            var url = $('#_txtinputurl').val();
            if (url != "" && url.indexOf('facebook') > 0) {
                //codes to load  Gplus profiles start
                $http.get(apiDomain + '/api/Facebook/AddFacebookPagesByUrl?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&url=' + url)
                              .then(function (response) {
                                  if (response.data != "") {
                                      swal(response.data)
                                      $('#_txtinputurl').val('');
                                      if (response.data == "added successfully") {
                                          window.location.reload();
                                      }
                                  }



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

        $scope.followChange = function () {

            if ($('#TwitterFollow').is(':checked')) {
                console.log('../TwitterManager/AddTwitterAccount?follow=true');
                document.getElementById("TwitterAddButton").setAttribute('href', "../TwitterManager/AddTwitterAccount?follow=true");
            }
            else {
                console.log('../TwitterManager/AddTwitterAccount');

                document.getElementById("TwitterAddButton").setAttribute('href', "../TwitterManager/AddTwitterAccount");
            }
        }
        dashboard();
        $('#tags').tagsInput();

        //add initial youtube feeds to mongo
        $scope.addinitialfeeds = function (accesstoken, channelid) {

            $http({
                method: 'POST',
                url: apiDomain + '/api/Google/AddYoutubeFeed?accesstoken=' + accesstoken + '&channelid=' + channelid,
            }).then(function (response) {

                console.log(response);

            });
        }

    });
});

