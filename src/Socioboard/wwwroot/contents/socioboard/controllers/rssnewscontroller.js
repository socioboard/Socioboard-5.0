'use strict';

SocioboardApp.controller('RssNewsController', function ($rootScope, $scope, $http, $timeout, $state, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        $scope.disbtncom = true;
        rssnews();
        
        $scope.deleteMsg = function(profileId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send message via this account!",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success"); 
	            });
        }

        $('#tags').tagsInput();
    

        $scope.loadRssNewsFeed = function () {
            debugger;
            $http.get(apiDomain + '/api/RssFeed/getRssNewsFeedsPost?userId=' + $rootScope.user.Id)
            .then(function (response) {
                if (response.data != "") {

                    $scope.postedRssData = response.data;
                    console.log($scope.postedRssData);
                    $scope.fetchdatacomplete = true;
                }
                else {
                    $scope.nofeeds = true;
                    $scope.fetchdatacomplete = true;

                }
            }, function () {
                $scope.error = reason.data;

            });

        }

        $scope.loadRssNewsFeed();
      
        $scope.rssContentsData = function () {

            var keywords = $('#tags').val();

            console.log($rootScope.user.Id);

            if (keywords != null && keywords != undefined) {

                $http.get(apiDomain + '/api/RssFeed/RssNewsFeedsUrl?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
                .then(function (response) {
                    if (response.data != "") {

                        $scope.rssNewsData = response.data;
                        console.log("NEWS");
                        console.log(response.data);
                        $('#rssSettingModal').closeModal();
                        $scope.fetchdatacomplete = true;
                        $scope.rssNewsFeed(keywords);
                    }
                    else {
                        $scope.nofeeds = true;
                        $('#rssSettingModal').closeModal();
                        $scope.fetchdatacomplete = true;

                    }
                }, function () {
                    $scope.error = reason.data;

                });
            }
        }



        $scope.rssNewsFeed = function (keywords) {

            $http.get(apiDomain + '/api/RssFeed/getRssNewsFeedsContents?userId=' + $rootScope.user.Id + '&keyword=' + keywords)
            .then(function (response) {
                if (response.data != "") {

                    $scope.postedRssData = response.data;
                    console.log($scope.postedRssData);
                    $scope.fetchdatacomplete = true;
                }
                else {
                    $scope.nofeeds = true;
                    $scope.fetchdatacomplete = true;

                }
            }, function () {
                $scope.error = reason.data;

            });

        }


       // $('#rssSettingModal').openModal();


        $scope.schedulePost = function (schedulemessage) {
            $rootScope.schedulemessage = schedulemessage;
            console.log(schedulemessage);
            $rootScope.grppost = true;
            //window.location.href = "#/schedulemessage";
            $state.go('schedulemessage');
        }

        $scope.openComposeMessage = function (schedulemessage) {

            if (schedulemessage != null) {
                var message = {
                    "title": schedulemessage.title,
                    "link": schedulemessage.link
                };
                //  console.log(schedulemessage.message);
                console.log("google");
                console.log(message);
                $rootScope.fbComposeMessage = message;
            }

            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + schedulemessage.postImgUrl + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
        }



        $scope.ComposeMessage = function () {
            debugger;
            $scope.disbtncom = false;

            var profiles = $('#composeProfiles').val();
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
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $scope.disbtncom = true;
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
                $scope.disbtncom = true;
                if (profiles.length < 0) {
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
       
  });

});