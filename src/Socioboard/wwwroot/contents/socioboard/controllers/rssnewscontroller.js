'use strict';

SocioboardApp.controller('RssNewsController', function ($rootScope, $scope, $http, $timeout, $state, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        $scope.disbtncom = true;
        $scope.draftbtn = true;
        $scope.query = {};
        $scope.queryBy = '$';
        $rootScope.contentMessage = {};
        $rootScope.schedulemessage = {};
        $scope.buildbtn = true;

        var x = $rootScope.keyword;
      
        rssnews();

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


        $scope.deleteMsg = function (profileId) {
          
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

	            $http.post(apiDomain + '/api/RssFeed/DeleteContentFeeds?contentfeedid=' + profileId)
                           .then(function (response) {
                               if (response.data == "success") {
                                   swal("Deleted!", "Your profile has been deleted.", "success");
                                   window.location.reload();
                                   //$scope.loadpageshareathon();
                               }
                           }, function (reason) {
                               $scope.error = reason.data;
                           });
	            //todo: code to delete profile
	           // swal("Deleted!", "Your profile has been deleted.", "success");
	        });
        }




        $('#tags').tagsInput();


        $scope.loadRssNewsFeed = function () {
           
            //if()
            if ($rootScope.keyword == null || $rootScope.keyword == undefined) {

                $http.get(apiDomain + '/api/RssFeed/getRssNewsFeedsPost?userId=' + $rootScope.user.Id + '&skip=0&count=50')
            .then(function (response) {
                if (response.data != "") {

                    $scope.postedRssData = response.data;
                  
                    $scope.fetchdatacomplete = true;
                    var keywords = $('#tags').val('');
                    //if ($rootScope.keyword != null) {
                    //    $scope.rssContentsData();
                    //}

                }
                else {
                    $scope.nofeeds = true;
                    $scope.fetchdatacomplete = false;

                }
            }, function () {
                $scope.error = reason.data;
            });
            }
            
            else {
                                            
                if ($('#tags').val() != null && $('#tags').val() != "") {
                    var keywords = $('#tags').val();
                }
                else {
                    var keywords = $rootScope.keyword;
                }


                $scope.buildbtn = false;


               

                if (keywords != null && keywords != undefined) {

                    $http.get(apiDomain + '/api/RssFeed/RssNewsFeedsUrl?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
                    .then(function (response) {
                        if (response.data != "") {

                            $scope.postedRssData = response.data;
                            if ($scope.postedRssData != "Data already added") {

                             
                                $scope.buildbtn = true;
                                $('#rssSettingModal').closeModal();
                                $scope.fetchdatacomplete = true;
                                //$scope.rssNewsFeed(keywords);
                                $('#tags').val('');
                            }
                            else {

                                $scope.buildbtn = true;
                                $('#rssSettingModal').closeModal();
                                swal("Data already added");
                                $('#tags').val('');
                            }

                        }
                        else {
                            $scope.nofeeds = true;
                            $scope.buildbtn = true;
                            $('#rssSettingModal').closeModal();
                            $scope.fetchdatacomplete = true;
                        }
                    }, function () {
                        $scope.error = reason.data;

                    });
                }
            }

            

        }

        $scope.loadRssNewsFeed();

        $scope.rssContentsData = function () {
            var title = $('#tags').val();
            if (/\S/.test(title)) {
                if ($('#tags').val() != null) {
                    var keywords = $('#tags').val();
                }
                else {
                    var keywords = $rootScope.keyword;
                }


                $scope.buildbtn = false;




                if (keywords != null && keywords != undefined) {

                    $http.get(apiDomain + '/api/RssFeed/RssNewsFeedsUrl?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
                    .then(function (response) {
                        if (response.data != "") {

                            $scope.postedRssData = response.data;
                            if ($scope.postedRssData != "Data already added") {


                                $scope.buildbtn = true;
                                $('#rssSettingModal').closeModal();
                                $scope.fetchdatacomplete = true;
                                //$scope.rssNewsFeed(keywords);
                                $('#tags').val('');
                            }
                            else {

                                $scope.buildbtn = true;
                                $('#rssSettingModal').closeModal();
                                swal("Data already added");
                                $('#tags').val('');
                            }

                        }
                        else {
                            $scope.nofeeds = true;
                            $scope.buildbtn = true;
                            $('#rssSettingModal').closeModal();
                            $scope.fetchdatacomplete = true;
                        }
                    }, function () {
                        $scope.error = reason.data;

                    });
                }
            }
            else {
                swal("Please enter tag first")
            }


        }

        $scope.contentfeedsdata = function () {
         
            if ($('#tags').val() != null)
            {
                var keywords = $('#tags').val();
            }
            else {
                var keywords = $rootScope.keyword;
            }

            $scope.buildbtn = false;
           // var keywords = $('#tags').val();
          

            if (keywords != null && keywords != undefined) {

                $http.get(apiDomain + '/api/RssFeed/ContentFeeds?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
                .then(function (response) {
                    if (response.data != "") {

                        $scope.postedRssData = response.data;
                        if ($scope.postedRssData != "Data already added") {

                           
                            $scope.buildbtn = true;
                            $('#rssSettingModal').closeModal();
                            $scope.fetchdatacomplete = true;
                            //$scope.rssNewsFeed(keywords);
                            $('#tags').val('');
                        }
                        else {

                            $scope.buildbtn = true;
                            $('#rssSettingModal').closeModal();
                            swal("Data already added");
                            $('#tags').val('');
                        }

                    }
                    else {
                        $scope.nofeeds = true;
                        $scope.buildbtn = true;
                        $('#rssSettingModal').closeModal();
                        $scope.fetchdatacomplete = true;
                    }
                }, function () {
                    $scope.error = reason.data;

                });
            }
        }

        //content feeds search from twitter start--------date : 12/05/2017
        //$scope.contentfeedsdata = function ()
        //{
        //    var keywords = $('#tags').val();
        //    $http.get(apiDomain + '/api/RssFeed/ContentFeeds?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
        //    .then(function (response) {
        //        if (response.data != null) {
        //            $scope.confeeds = response.data;
        //            console.log("contentfeeds");
        //            console.log($scope.confeeds);
        //        }

        //    }, function () {
        //        $scope.error = reason.data;
        //        console.log("kjsdkjs");
        //        console.log($scope.error);

        //    });
        //}


        //content feeds search from twitter end----------date : 12/05/2017

        //$scope.rssNewsFeed = function (keywords) {

        //    $http.get(apiDomain + '/api/RssFeed/getRssNewsFeedsContents?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
        //    .then(function (response) {
        //        if (response.data != "") {
        //            $scope.postedRssData = response.data;
        //            console.log($scope.postedRssData);
        //            $scope.fetchdatacomplete = true;
        //        }
        //        else {
        //            $scope.nofeeds = true;
        //            $scope.fetchdatacomplete = true;
        //        }
        //    }, function () {
        //        $scope.error = reason.data;
        //    });
        //}

        //$('#rssSettingModal').openModal();


        $scope.schedulePost = function (schedulemessage) {

            var message = {
                "shareMessage": schedulemessage.title,
                "url":schedulemessage.link,
                "picUrl": schedulemessage.image
            };
            $rootScope.schedulemessage = message;
          
            $state.go('schedulemessage');
        }

        $scope.openComposeMessage = function (contentFeed) {
            jQuery('input:checkbox').removeAttr('checked');
            if (contentFeed != null) {
                var message = {
                    "title": contentFeed.title,
                    "link": contentFeed.link,
                    "image": contentFeed.image,
                };
               
                 $rootScope.contentMessage = message;

            }

            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + contentFeed.image + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
          
        }



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
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message+ '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
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
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
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

                else if ($scope.check == false) {
                    var formData = new FormData();
                    $scope.draftbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
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

    });

});


SocioboardApp.directive('afterRender', function ($timeout) {
    return function (scope, element, attrs) {
        $timeout(function () {
            $('.dropify').dropify();
        });
    };
})