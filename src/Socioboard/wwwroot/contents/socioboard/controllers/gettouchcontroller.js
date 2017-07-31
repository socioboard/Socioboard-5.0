'use strict';
SocioboardApp.controller('GetTouchController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        get_touch();
        $scope.checkedFile = false;
        $scope.btnValue = "Send";
        $('.tooltipped').tooltip({ delay: 50 });
        $scope.btnLd = 'show';
        $scope.btnLding = 'hide';
        $scope.valuesData = [];
        $scope.valuesData.nameUser = $rootScope.user.FirstName +" "+ $rootScope.user.LastName;
        $scope.valuesData.emailUser = $rootScope.user.EmailId;
        $scope.sendEmail = function () {
            var name = $('#first_name').val();
            var email = $('#email5').val();
            var subject = $('#subject').val();
            var message = $('#message').val();
            var issue = $('#priority').val();
            if (/\S/.test(subject)) {
                if (/\S/.test(message)) {
                    $scope.checkfile();
                    if ($scope.checkedFile == true) {
                        $("#subBtn").attr("class", "btn btn_style right disabled");
                        $scope.btnLd = 'hide';
                        $scope.btnLding = 'show';
                        var formData = new FormData();
                        formData.append('files', $("#input_file_getintouch").get(0).files[0]);
                        $http({
                            method: 'POST',
                            url: apiDomain + '/api/GetInTouch/SendMailToGetInTouch?name=' + name + '&email=' + email + '&sub=' + subject + '&issue=' + issue + '&message=' + message,
                            data: formData,
                            headers: {
                                'Content-Type': undefined
                            },
                            transformRequest: angular.identity,
                        }).then(function (response) {
                            $scope.btnLd = 'show';
                            $scope.btnLding = 'hide';
                            $("#subBtn").attr("class", "btn btn_style right blue");
                            alertify.success("Great, thanks for your email. We're on the case!");
                            $('#subject').val(null);
                            $('#message').val(null);
                            $('.dropify-clear').click();
                        });
                    }
                    else {
                        alertify.error("Please upload an image file");
                    }
                }
                else {
                    alertify.error("Message shouldn't contain only spaces");
                }
            }
            else {
                alertify.error("Subject shouldn't contain only spaces");
            }
        }
        $scope.checkfile = function () {
            var filesinput = $('#input_file_getintouch');
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'PNG'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#input_file_getintouch', fileExtension)) {
                    $scope.checkedFile = true;
                }
                else {
                    $scope.checkedFile = false;
                }
            }
            else {
                $scope.checkedFile = true;
            }
        }
        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#input_file_getintouch').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }
    });
});