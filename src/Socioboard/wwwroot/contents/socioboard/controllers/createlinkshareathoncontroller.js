'use strict';

SocioboardApp.controller('CreateLinkShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
       
        $scope.url = {
            text: 'https://facebook.com',
        };
        createlinkshareathon();

        $scope.check = function (input) {
            if (input.indexOf('facebook') > 0) {
                $scope.urlchange = false;
            } else {
                $scope.urlchange = true;
            }
           
        }

        $(document).ready(function () {
            var max_fields = 20;
            var wrapper = $(".container_link");
            var add_button = $(".add_form_field");
            var x = 1;
            $(add_button).click(function (e) {
                var url = $('#post_url').val();
                e.preventDefault();
                if (url != "") {
                    if (x < max_fields) {
                        x++;
                        $(wrapper).append('<div class="row"><div class="col l10 m10 s10"><input type="text" name="mytext[]"/></div><div class="col l2 m2 s2"><a href="#" class="delete btn btn_style">Delete</a></div></div>'); //add input box
                    }
                    else {
                        swal('You Reached the limits')
                    }
                } else {
                    swal('please enter value first')
                }
            });

            $(wrapper).on("click", ".delete", function (e) {
                e.preventDefault(); $(this).parent('div').parent('div').remove(); x--;
            })
        });

        $scope.schedulelinkshreathon = function () {
            debugger;
            $scope.pageurl = "";
            var url = $('#post_url').val();
            if (url == "")
            {
                swal('please enter value first');
                return false;
            }
            if (url.indexOf('facebook') > 0) {
                var pageIds = $('#shraeathonfacebookpage').val();
                var timeInterval = $('#shraeathontimeinterval').val();
                var texts = document.getElementsByName("mytext[]");
                var sum = "";
                for (var i = 0; i < texts.length; i++) {
                    var n = texts[i].value || 0;
                    if (n != "" && n.indexOf('facebook') > 0) {
                        sum = n + "," + sum;
                    } else {
                        swal('please enter valid facebook page url');
                        return false;
                    }

                }
                $scope.pageurl = url + "," + sum
                if (pageIds != "" && url != '' && timeInterval != null) {
                    $scope.dispbtn = false;
                    var formData = new FormData();
                    formData.append('pageUrls', $scope.pageurl);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/SchedulePagePost?profileId=' + pageIds + '&TimeInterVal=' + timeInterval + '&UserId=' + $rootScope.user.Id,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    })
                    .then(function (response) {
                        swal(response.data);
                        window.location.reload();
                    }, function (reason) {
                        $scope.error = reason.data;
                    });
                }
                else {
                    $scope.dispbtn = true;
                    swal('Please fill in all the details');
                }
               
            } else {
                swal('please enter valid facebook page url');
                return false;
            }

           
        }
        

    });

});