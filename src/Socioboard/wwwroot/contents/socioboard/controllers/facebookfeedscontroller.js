'use strict';

SocioboardApp.controller('FacebookFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain, grouptask,$location,$anchorScroll) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        $scope.moveTop = function () {
            $location.hash('upLink');
            $anchorScroll();
            $('#downLink').css("display", "none");
        }
        
        // initialize core components
        var preloadmore = false;
        $scope.disbtncom = true;
        $scope.buildbtn = true;
        $scope.query = {};
        $scope.queryBy = '$';
        var endfeeds = false;
        $scope.filterrTxtt = 'All Posts';
        $scope.SorttTxtt = 'Popular';
        var start = 0; // where to start data
        var ending = start + 10; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        var count = 10;
        $scope.loadmore = "Load More Feeds";
        $scope.lstFbComments = [];
        $scope.getHttpsURL = function (obj) {
          
            return obj.replace("http:", "https:")
        };
        $scope.lstFbFeeds = [];
        if ($rootScope.user.TrailStatus == 2) {
            count = 5
        }

        //select all
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
        //end
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Facebook/GetTopFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + count + '&type='+ $stateParams.fbProfileType)
                              .then(function (response) {
                           $scope.lstFbFeeds = response.data;
                           $scope.comments = response.data._facebookComment;
                           $rootScope.firstFeedDate = $scope.lstFbFeeds[0]._facebookFeed.entryDate;
                           //var date = (new Date($rootScope.firstFeedDate).getTime() / 1000);
                           //$scope.reloadFeeds();
                           //$scope.LoadLatestFeeds();
                           $scope.preloadmore = true;
                           setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                           if (response.data == null) {
                               reachLast = true;
                           }
                           $scope.dropCalled = true;
                           setTimeout(function () {
                               $scope.callDropmenu();
                           }, 1000);
                       }, function (reason) {
                           $scope.error = reason.data;
                       });
            $http.get(apiDomain + '/api/Facebook/fbtype?profileId=' + $stateParams.profileId)
                      .then(function (respon) {
                          $scope.fbprofiletype = respon.data[0].fbProfileType;
                                  // end codes to load  recent Feeds
                              });
        
        }
        $scope.LoadTopFeeds();

        //Latest Feeds loading
        $scope.LoadLatestFeeds = function () {
            $http.get(apiDomain + '/api/Facebook/GetLatestFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + count + '&date=' + $rootScope.firstFeedDate)
                              .then(function (response) {
                                  $scope.lstlatestFbFeeds = response.data;
                                  $scope.latestfeedcount = $scope.lstlatestFbFeeds.length;
                                  if ($scope.latestfeedcount>0)
                                  {
                                      $rootScope.firstFeedDate = $scope.lstlatestFbFeeds[0].entryDate;
                                  }
                                  $scope.reloadFeeds();
                                  $scope.preloadmore = true;
                                  setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                                  if (response.data == null) {
                                      reachLast = true;
                                  }
                                  $scope.dropCalled = true;
                                  setTimeout(function () {
                                      $scope.callDropmenu();
                                  }, 1000);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        }
        $scope.reloadFeeds = function () {
            setTimeout(function () { $scope.LoadLatestFeeds(); }, 10000);
        }

        //End Latest feeds loading
        $scope.loadFeeds = function () {
            $scope.filters = false;
            $scope.preloadmore = false;
            $scope.lstFbFeeds = null;
            $scope.filterrTxtt = 'All Posts';
            $scope.SorttTxtt = 'Popular';
            $scope.LoadTopFeeds();
        }

        //$scope.reloadFeeds = function () {
        //    setTimeout(function () { $scope.LoadTopFeeds(); }, 10000);
        //}



        $scope.feeddate = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i]._facebookFeed.feedDate);
                var d = new Date(parm[i].feedDate);
                var d4 = d.setTime(d.getTime() + 37800000);;
                var date1 = moment(d4);
                var newdate = date1.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3] + " " + splitdate[4];
                parm[i]._facebookFeed.feedDate = date;
                if (parm[i]._facebookComment.length > 0) {
                    for (var j = 0; j < parm[i]._facebookComment.length; j++) {
                        var datecomment = moment(parm[i]._facebookComment[j].commentdate);
                        var dcomment = new Date(parm[i]._facebookComment[j].commentdate);
                        var d4comment = dcomment.setTime(d.getTime() + 37800000);
                        var date1comment = moment(d4comment);
                        var newdatecomment = date1comment.toString();
                        var splitdatecomment = newdatecomment.split(" ");
                        datecomment = splitdatecomment[0] + " " + splitdatecomment[1] + " " + splitdatecomment[2] + " " + splitdatecomment[3] + " " + splitdatecomment[4];
                        parm[i]._facebookComment[j].commentdate = datecomment;
                    }
                }

            }
            $scope.lstFbFeeds = parm;

        }


        $scope.listData = function () {

            if (reachLast) {
                return false;
            }
            $http.get(apiDomain + '/api/Facebook/GetTopFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=30')
                         .then(function (response) {
                             //console.log(response.data);
                             // $scope.lstProfiles = response.data;
                             if (response.data == null || response.data == "") {
                                 reachLast = true;
                                 $scope.loadmore = "No more feeds to Load";
                                 $scope.loaderclass = 'hide';
                                 $scope.endfeeds = true;
                                 
                             }
                             else {
                                 $scope.lstFbFeeds = $scope.lstFbFeeds.concat(response.data);
                                 //console.log($scope.lstFbFeeds);
                                 ending = ending + 30;
                                 $scope.listData();
                             }
                             //$scope.LoadLatestFeeds();
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        };


        facebookfeeds();

        $scope.reconnect = function (xyz) {
     
            
            $http.get(domain + '/socioboard/recfbcont?id=' + $stateParams.profileId + '&fbprofileType=' + xyz)
                              .then(function (response) {
                                  window.location.href = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });

        };

        $scope.fbprofiles = function () {
         
            $http.get(apiDomain + '/api/Facebook/GetFacebookProfilesOnlyforReconn?groupId=' + $rootScope.groupId)
            .then(function (response) {
                console.log(response.data)
                if (response.data != null) {
                    var ac = false;
                    $scope.profiledet = response.data;
                    angular.forEach($scope.profiledet, function (value, key) {
                        if (value.fbUserId == $stateParams.profileId) {
                            $scope.reconnect(value.fbProfileType);
                            ac = true;
                        }

                    });

                    if (!ac) {
                        $scope.reconnect(null);
                    }

                }


            }, function (reason) {
                $scope.error = reason.data;
            });

        };

        $scope.confirmation = function () {

        }

        $scope.filterSearch = function (typeFilter, txtt) {
            $scope.filters = true;
            $scope.preloadmore = false;
            $scope.lstFbFeeds = null;
            $scope.filterrTxtt = txtt;
            $http.get(apiDomain + '/api/Facebook/GetTopFilterFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + 30 + '&typeFilter=' + typeFilter)
                              .then(function (response) {
                                  // $scope.lstProfiles = response.data;
                                  $scope.lstFbFeeds = response.data;
                                  $scope.preloadmore = true;
                                  setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                                  // $('.collapsible').collapsible();
                                  // $scope.feeddate(response.data);
                                  //$scope.loaderclass = 'hide';
                                  //console.log(response.data);
                                  if (response.data == null) {
                                      reachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        };


        $scope.SortSearch = function (typeShort, txtt) {
         
            $scope.filters = true;
            $scope.preloadmore = false;
            $scope.lstFbFeeds = null;
            $scope.SorttTxtt = txtt;
            $http.get(apiDomain + '/api/Facebook/Shortfeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + 30 + '&typeShort=' + typeShort)
                              .then(function (response) {
                                  $scope.lstFbFeeds = response.data;
                                  $scope.preloadmore = true;
                                  setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                                  if (response.data == null) {
                                      reachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        };


        $scope.renderComments = function (feedId, index) {
            $scope.LoadTopComments(feedId, index);
            $('.collapsible').collapsible({
                accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
            });
        }

        $scope.LoadTopComments = function (feedId, index) {
            //codes to load  recent Feed Commets
            $http.get(apiDomain + '/api/Facebook/GetFacebookPostComment?postId=' + feedId)
                          .then(function (response) {
                              // $scope.lstFbComments = response.data;
                              $scope.commentdate(response.data, index);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  Feed Commets
        }


        $scope.commentdate = function (parm, index) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].commentdate);
                var d = new Date(parm[i].commentdate);
                var d4 = d.setTime(d.getTime() + 37800000);
                var date1 = moment(d4);
                var newdate = date1.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3] + " " + splitdate[4];
                parm[i].commentdate = date;
            }
            $scope.lstFbComments[index] = parm;

        }


        $scope.PostFacebookComment = function (feedId, ProfileId) {
            var postcomment = $('#postcomment_' + feedId).val();

            if (/\S/.test(postcomment)) {
                $scope.sendingcomment = true;
                $scope.sendicon = true;
                var timezoneOffset = new Date().toLocaleString();
                $http.post(apiDomain + '/api/Facebook/PostFacebookComment?postId=' + feedId + '&profileId=' + ProfileId + '&message=' + encodeURIComponent(postcomment) + '&timezoneOffset=' + timezoneOffset)
                                     .then(function (response) {
                                         $scope.sendingcomment = false;
                                         swal(response.data);
                                         $('#postcomment_' + feedId).val('');
                                         // $scope.LoadTopComments(feedId);
                                         $scope.LoadTopFeeds();
                                         setTimeout(function () {
                                             $scope.sendicon = false;
                                         }, 1000);
                                     }, function (reason) {
                                         $scope.error = reason.data;
                                     });
            }
            else {
                swal("Please type comment");
            }
        }

        $scope.taskfbfeedModel = function (notification) {
            $('#TaskfbfeedModal').openModal();
            $rootScope.taskNotification = notification;
            Materialize.updateTextFields();
        }
        $scope.addTask = function (feedTableType) {

            var memberId = $('.task-user-member:checked');
            var taskComment = $('#taskfbfeedComment').val();
            if (!memberId.val()) {
                swal('Please select a member to assign the task')
            }
            else if (!(/\S/.test(taskComment))) {
                swal('Please write a comment to assign the task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.feedDescription, $rootScope.taskNotification.feedId, $rootScope.taskNotification.picture);

            }
        }
        //comments
        $scope.viewcomment = function (contentFeed) {
            if (contentFeed.picture == "") {
                $('#xxxxx').hide();
            }
            else {
                $('#xxxxx').show();
            }
            $scope.feeddata = contentFeed;
            if ($scope.fbprofiletype != 1) {
                if (contentFeed._facebookComment.length != 0) {
                    $('#view').openModal();
                    $scope.allcomment = contentFeed._facebookComment;
                }
                else {
                    swal('Sorry your post have no comment')
                }
            }
            else {
                    $('#viewpageModal').openModal();
                    $scope.allcomment = contentFeed._facebookComment;
            }
        }

        //end comments


        //repost

        $scope.openComposeMessage = function (contentFeed) {
           
            jQuery('input:checkbox').removeAttr('checked');
            if (contentFeed != null) {
                var message = {
                    "title": contentFeed.feedDescription,
                    "image": contentFeed.picture,
                };

                $rootScope.contentMessage = message;

            }

            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + contentFeed.picture + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
        }
        //end

        // start compose
        $scope.ComposeMessage = function () {

            $scope.disbtncom = false;
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

            // var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
            //if (image == "N/A") {
            //    image = image.replace("N/A", "");
            //}
            var updatedmessage = "";
            message = encodeURIComponent(message);
            //var postdata = message.split("\n");
            //for (var i = 0; i < postdata.length; i++) {
            //    updatedmessage = updatedmessage + "<br>" + postdata[i];
            //}
            //updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            if (profiles.length > 0 && message != '') {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $scope.disbtncom = true;
                            // $('#composeMessage').val('');
                            //$('#composeMessage').val('');
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
                $scope.disbtncom = true;
                if (profiles.length == 0) {
                    swal('Please select a profile');
                }
                else {
                    swal('Please enter some text to compose this message');
                }
            }
        }

        $scope.callDropmenu = function () {
            $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrain_width: false, // Does not change width of dropdown to that of the activator
                hover: true, // Activate on hover
                gutter: 0, // Spacing from edge
                belowOrigin: false, // Displays dropdown below the button
                alignment: 'right' // Displays dropdown with edge aligned to the left of button
            });
        }

        $scope.checkfile = function () {
            var filesinput = $('#composeImage');

            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
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
        //end

        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'right' // Displays dropdown with edge aligned to the left of button
        });



    });
});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
   
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
              
                $('.collapsible').collapsible({
                    accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
                });
            });
        }
    };
})

//SocioboardApp.directive('myRepeatTimeoutfacebookpostsDirective', function ($timeout) {
//    return function (scope, element, attrs) {
//if (scope.$last === true) {
//            $timeout(function () {
//                $('.collapsible').collapsible({});

//            });
// }
//    };
//})