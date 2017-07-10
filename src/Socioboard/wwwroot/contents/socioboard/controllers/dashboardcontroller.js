'use strict';

SocioboardApp.controller('DashboardController', function ($rootScope, $scope, $http, $modal, $timeout, $state,apiDomain,domain) {
    //alert('helo');
    
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.check = false;
        $scope.draftbtn = true;
        $scope.query = {};
        $scope.queryBy = '$';
        $scope.message = function (msg) {
            $scope.msg = "If You want to use this feature upgrade to higher business plan ";
            swal(msg);
        };
        $scope.profileaddmessage = function (prfilemsg) {
            $scope.prfilemsg = "As per your plan you can add one profile per network If You want to add more profiles upgrade to higher business plan ";
            swal(prfilemsg);
        };
       
        var objappVersion = navigator.appVersion; var objAgent = navigator.userAgent; var objbrowserName = navigator.appName; var objfullVersion = '' + parseFloat(navigator.appVersion); var objBrMajorVersion = parseInt(navigator.appVersion, 10); var objOffsetName, objOffsetVersion, ix;
        if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
             objbrowserName = "Chrome"; objfullVersion = objAgent.substring(objOffsetVersion + 7);
        }
        else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
            objbrowserName = "Microsoft Internet Explorer"; objfullVersion = objAgent.substring(objOffsetVersion + 5);
        }
        else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
            objbrowserName = "Firefox";
        }
        else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
            objbrowserName = "Safari"; objfullVersion = objAgent.substring(objOffsetVersion + 7); if ((objOffsetVersion = objAgent.indexOf("Version")) != -1) objfullVersion = objAgent.substring(objOffsetVersion + 8);
        }
        else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) < (objOffsetVersion = objAgent.lastIndexOf('/'))) {
            objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion); objfullVersion = objAgent.substring(objOffsetVersion + 1); if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) { objbrowserName = navigator.appName; }
        }
        if ((ix = objfullVersion.indexOf(";")) != -1) objfullVersion = objfullVersion.substring(0, ix); if ((ix = objfullVersion.indexOf(" ")) != -1) objfullVersion = objfullVersion.substring(0, ix); objBrMajorVersion = parseInt('' + objfullVersion, 10); if (isNaN(objBrMajorVersion)) { objfullVersion = '' + parseFloat(navigator.appVersion); objBrMajorVersion = parseInt(navigator.appVersion, 10); }
        $rootScope.objbrowserName = objbrowserName;
        //codes to save  sessionData
        $scope.sessionData = function () {
            $http.post(domain + '/Home/SaveSessiondata?ip=' + $scope.Ip + '&userId=' + $rootScope.user.Id + '&browserName=' + objbrowserName + '&userAgent=' + navigator.userAgent)
                          .then(function (response) {
                              setCookie("sociorevtoken",response.data,"90");
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        // end codes to sessionData

        function setCookie(cname, cvalue, exdays) {
            var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
            cpwd = cvalue;
            cvalue = Base64.encode(cpwd);
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
       
        $.getJSON('//ipapi.co/json/', function (data) {
            $rootScope.Ip = data.ip;
            $scope.sessionData();
        });


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
            if ($rootScope.groupsdowngrade == true) {
                $('#ActiveGroupModal').openModal({ dismissible: false });
            }


        //codes to groupprofile for restriction
            $scope.GetGroupProfiles = function () {
              $http.get(apiDomain + '/api/GroupProfiles/GetAllGroupProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  $scope.getprofile = [];
                                  $scope.getFbprofile = [];
                                  $scope.getTwtprofile = [];
                                  $scope.getInstaprofile = [];
                                  $scope.getGplusprofile = [];
                                  $scope.getGAprofile = [];
                                  $scope.getLinkedInprofile = [];
                                  $scope.getGAprofile = [];
                                  $scope.getYoutubeprofile = [];
                                  $scope.getPinprofile = [];
                                  $scope.GroupProfiles = response.data;
                                  var fbcount = 0;
                                  var Twtcount = 0;
                                  var Instacount = 0;
                                  var Ytubecount = 0;
                                  var Gpluscount = 0;
                                  var GAcount = 0;
                                  var LinkedIncount = 0;
                                  var Pincount = 0;
                                  angular.forEach($scope.GroupProfiles, function (value, key) {
                                      if (value.profileType == 1 || value.profileType == 0) {
                                          fbcount = fbcount + 1
                                      }
                                      else if (value.profileType == 2) {
                                          Twtcount = Twtcount + 1
                                      }
                                      else if (value.profileType == 3 || value.profileType == 4) {
                                          LinkedIncount = LinkedIncount + 1
                                      }

                                      else if (value.profileType == 5) {
                                          Gpluscount = Gpluscount + 1
                                      }
                                      else if (value.profileType == 7) {
                                          Ytubecount = Ytubecount + 1
                                      }
                                      else if (value.profileType == 8) {
                                          Instacount = Instacount + 1
                                      }
                                      else if (value.profileType == 10) {
                                          GAcount = GAcount + 1
                                      }
                                      else if (value.profileType == 13) {
                                          Pincount = Pincount + 1
                                      };
                                      ;

                                  });
                                  $scope.Fbcounts = fbcount;
                                  $scope.Twtcounts = Twtcount;
                                  $scope.Ytubecounts = Ytubecount;
                                  $scope.LinkedIncounts = LinkedIncount;
                                  $scope.Gpluscounts = Gpluscount;
                                  $scope.Instacounts = Instacount;
                                  $scope.GAcounts = GAcount;
                                  $scope.Pincounts = Pincount;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            }
        // end codes to groupprofile

         //codes fetch all profiles start
            $scope.fetchalllProfiles = function () {
                $http.get(apiDomain + '/api/GroupProfiles/GetTop3GroupProfiles?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstAccountProfiles = response.data;
                                     
                                      
                                          $scope.loaderclass = 'hide';
                                      
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
        // end codes fetch all profiles

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

            $scope.ComposePostModal = function () {
                $('#ComposePostModal').openModal();
            }

      
            //code for compose message start
            $scope.ComposeMessage = function () {
               
                var profiles = new Array();
                $("#checkboxdata .subcheckbox").each(function () {
                   
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
                var testmsg=message;
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
                            url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&shortnerstatus=' + $rootScope.user.urlShortnerStatus,
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
                    else
                    {
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
            //code for checking the file format end

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
                if ($scope.check == true)
                {
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
                        $('#ComposePostModal').closeModal();
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                       
                    });
                }

                else if ($scope.check == false) 
                {
                    var formData = new FormData();
                    $scope.draftbtn = false;
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
                        $scope.draftbtn = true;
                        $('#ComposePostModal').closeModal();
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                       
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

            $scope.contentFeeds = function (key) {
                $rootScope.keyword = key;
                $state.go('rss_news');       
                //$state.go('schedulemessage');
            }


            $scope.fetchalllProfiles();
            $scope.GetGroupProfiles();
            $scope.TwitterRecentFollower();
           
            //$scope.fetchYTChannels();

            $scope.deleteProfile = function (profileId) {
               
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

        //Selected groups
        //code for addselected profiles
            $scope.toggleGroupsSelection = function (profileid) {
                var idx = $scope.selectedGroups.indexOf(profileid);
                var data = "";
                // is currently selected
                if (idx > -1) {
                    $scope.selectedGroups.splice(idx, 1);
                }

                    // is newly selected
                else {
                    data = profileid;
                    $scope.selectedGroups.push(data);
                }
            };
        //end code 
            $scope.selectedGroups = [];
        //End
        //Add selected Groups
            $scope.AddSelectedGroups = function () {
                debugger;
                if ($scope.selectedGroups.length <= $rootScope.groupsMaxCount) {
                    var formData = new FormData();
                    formData.append('selectedGroups', $scope.selectedGroups);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/Groups/AddSelectedGroups?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,

                    })
                        .then(function (response) {
                            if (response.status == 200) {
                                $('#ActiveGroupModal').closeModal();
                                $rootScope.groupsdowngrade = false;
                                window.location.reload();
                                // swal(response.data);
                            }
                        }, function (reason) {
                            swal("Error!");
                        });
                }
                else {
                    swal('please select ' + $rootScope.groupsMaxCount + ' Groups');
                }

            }
        //End

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
                 
                    document.getElementById("TwitterAddButton").setAttribute('href', "../TwitterManager/AddTwitterAccount?follow=true");
                }
                else {
                 

                    document.getElementById("TwitterAddButton").setAttribute('href', "../TwitterManager/AddTwitterAccount");
                }
            }
            dashboard();
            $('#tags').tagsInput();

            //add initial youtube feeds to mongo
            $scope.addinitialfeeds = function (accesstoken,channelid) {

                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/Google/AddYoutubeFeed?accesstoken=' + accesstoken + '&channelid=' + channelid,
                            }).then(function (response) {

                               

                            });
                        }

        });
});

