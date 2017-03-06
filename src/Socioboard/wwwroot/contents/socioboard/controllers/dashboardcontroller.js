'use strict';

SocioboardApp.controller('DashboardController', function ($rootScope, $scope, $http, $modal, $timeout, apiDomain,domain) {
    //alert('helo');
    
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.check = false;

        $scope.selectedvalue = true;
        $scope.selectclick = function () {

            //  var selectedvals = $scope.composeProfiles;
            var selectedvals = $('#composeProfiles').val();
            if (selectedvals.indexOf("selectall") != -1) {
                var alloptions = $('#composeProfiles option');
                angular.forEach(alloptions, function (value, key) {
                    //alert(value);
                    var tempval = value.value;//$(a).val();
                    var selectvalindex = selectedvals.indexOf(tempval);
                    if (selectvalindex == -1) {
                        if (tempval != "selectall" && tempval != "select") {
                            selectedvals.push(tempval);
                            // $('.dropdown-content > li:not(:first-child)').find('input').prop('checked', true)
                        }
                    } else {
                        selectedvals.splice(selectvalindex);
                        //$('.dropdown-content > li:not(:first-child)').find('input').prop('checked', false)
                    }
                });
                // console.log(selectedvals);
                // $('#composeProfiles').material_select();
                if ($scope.selectedvalue == true) {
                    // $('.dropdown-content > li:not(:first-child)').find('input').prop('checked', true);
                    $('.dropdown-content > li:not(:first-child)').addClass("active").find('input').prop('checked', true);
                    $scope.selectedvalue = false;

                }
                else {
                    // $('.dropdown-content > li:not(:first-child)').find('input').prop('checked', false);
                    $('.dropdown-content > li:not(:first-child)').removeClass("active").find('input').prop('checked', false);
                    $scope.selectedvalue = true;

                }
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
            if ($rootScope.Downgrade == true) {
                $('#ActiveProfileModal').openModal({ dismissible: false });
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
                $scope.dispbtn = false;
                var profiles = $('#composeProfiles').val();
                var message = $('#composeMessage').val();
                var updatedmessage = "";
                message = encodeURIComponent(message);
                //var postdata = message.split("\n");
                //for (var i = 0; i < postdata.length; i++) {
                //    updatedmessage = updatedmessage + "<br>" + postdata[i];
                //}
                // updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
                if (profiles.length > 0 && message!='') {
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
                    if (profiles.length < 0) {
                        swal('Please select a profile');
                    }
                    else {
                        swal('Please enter some text to compose this message');
                    }
                }
            }

            $scope.checkfile = function () {
                var filesinput = $('#composeImage');//composeImage
                var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
                if (filesinput != undefined && filesinput[0].files[0] != null) {
                    if ($scope.hasExtension('#composeImage', fileExtension)) {
                        $scope.check = true;
                    }
                    else {

                        $scope.check = false;
                    }
                }
                else
                {
                    $scope.check = true;
                }
            }
            $scope.hasExtension = function (inputID, exts) {
                var fileName = $('#composeImage').val();
                return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
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


           
            
            $scope.draftMsg = function () {

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
            //updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
           // message = encodeURIComponent(message);

            // var date_value = $('#input_0').val();
            //var date_value = ($('.md-input')[0]).value;
            //var date = date_value.split("/");
            //date_value = date[1] + "/" + date[0] + "/" + date[2];
            //var time_value = $('#input_1').val();
            //var time_value = ($('.md-input')[1]).value;
            //var scheduletime = date_value + ' ' + time_value;
            //var newdate1 = new Date(scheduletime.replace("AM", "").replace("PM", "")).toUTCString();
            //var d = new Date(newdate1);
            //var d4 = d.setHours(d.getHours() + 5);
            //var date = moment(d4);
                //var newdate = new Date(date).toUTCString();
            var todayDate = new Date();
            console.log(todayDate);

            if (message != "" && message != undefined) {
                $scope.checkfile();//added on 19/10/2016
                if ($scope.check == true)
                {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    //$scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.dispbtn = true;
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }

                else if ($scope.check == false) 
                {
                    var formData = new FormData();
                    $scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' +""+ '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.dispbtn = true;
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





            $scope.fetchProfiles = function () {

                //codes to load  fb profiles start
                debugger;
                $http.get(apiDomain + '/api/Facebook/GetFacebookProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstFbProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.nopro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 1500);
                                  }
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
                                  if (response.data != "") {
                                      $scope.lstTwtProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.notwtpro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 1500);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load twitter profiles


            }

            $scope.fetchGplusProfiles = function () {

                //codes to load  Gplus profiles start
                $http.get(apiDomain + '/api/Google/GetGplusProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstGplusProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.nogpluspro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 1500);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load Gplus profiles


            }
            $scope.fetchGAProfiles = function () {

                //codes to load  GA profiles start
                $http.get(apiDomain + '/api/Google/GetGAProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstAProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.noGApro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 1500);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load GA profiles


            }
            $scope.fetchInstagramProfiles = function () {

                //codes to load  Instagram profiles start
                $http.get(apiDomain + '/api/Instagram/GetInstagramProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstinsProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.noinstapro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 1500);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load Instagram profiles


            }


            $scope.fetchLinkedInCompanyPagesProfiles = function () {

                //codes to load  LinkedIn Comapany page profiles start
                $http.get(apiDomain + '/api/LinkedIn/GetLinkedInCompanyPagesProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstlincmpnyProfiles = response.data;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                                  else
                                  {
                                      $scope.noLinkedpro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
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
                } else if ($scope.selecteFbPageProfiles.length > 0)
                {
                    swal("This page is already added");
                }
                else {
                    swal("Select atleast one page to add!");
                }
            }
            //end codes to add facebook pages


            //code to add Ga Sites
            $scope.toggleGAeProfileSelection = function (AccessToken, RefreshToken, AccountId, AccountName, EmailId, ProfileId, ProfileName, WebPropertyId, WebsiteUrl,internalWebPropertyId) {
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
                    swal("This page is already added");
                }
                else {
                    swal("Select atleast one page to add!");
                }
            }
            //end codes to add Ga Sites


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
                                      if (response.data!="")
                                      {
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
        });
});