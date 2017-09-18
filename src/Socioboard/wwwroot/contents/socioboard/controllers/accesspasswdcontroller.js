'use strict';

SocioboardApp.controller('AccessPasswdController', function ($rootScope, $scope, $http, $stateParams, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        //$scope.hasEnableF = false;
        //$scope.hasEnableG = false;
        //$scope.access_passwd = function () {
        //   $scope.hasEnableF = $rootScope.user.SocialLoginEnableFb;
        //   $scope.hasEnableG = $rootScope.user.SocialLoginEnableGo;

        //}
        //$scope.FBloginmessage = function (Fblogin) {
        //    $scope.Fblogin = "You singup with Social network,So you can't use 2 step login ";
        //    swal(Fblogin);
        //};
        //$scope.Gplusloginmessage = function (Gpluslogin) {
        //    $scope.Gpluslogin = "You singup with Google,you can't use 2 step login  ";
        //    swal(Gpluslogin);
        //};
        $scope.twostepsocialmessage = function () {
            $scope.twostepsociallogin = "You can't use this feature as you enable social singin or singup with Social network";
            swal($scope.twostepsociallogin);
        };
        $scope.password = $rootScope.user.Password;
      //  $scope.access_passwd();
        //Initialization
        $scope.updatePassword = {};







        //open password model for two step login
        $scope.enableModel = function () {
            $("#2step_login_enable").openModal();
        }
        $scope.disableModel = function () {
            $("#2step_login_disable").openModal();
        }
        $scope.changepasswordModel = function () {
            $("#change_passwd").openModal();
        }

        //Enable two step login
        $scope.enabletwosteplogin = function (verifyPassword) {
           
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/EnableTwoStepLogin?currentPassword=' + verifyPassword.currentPassword + '&userId=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
            }).then(function (response) {

                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                window.location.reload();
                //document.querySelector("#mail_div").style.display = "block";
                //document.querySelector("#change_email_btn").style.display = "none";
            }, function (reason) {

                alertify.set({ delay: 5000 });
                alertify.error(reason.data);


            });
        }

        //Disable two step login
        $scope.disabletwosteplogin = function (verifyPassword) {
          
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/DisablebleTwoStepLogin?currentPassword=' + verifyPassword.currentPassword + '&userId=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
            }).then(function (response) {

                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                window.location.reload();
                //document.querySelector("#mail_div").style.display = "block";
                //document.querySelector("#change_email_btn").style.display = "none";
            }, function (reason) {

                alertify.set({ delay: 5000 });
                alertify.error(reason.data);


            });
        }

        //codes to load  fb profiles start
        $scope.getfbprofiles = function () {

            $http.get(apiDomain + '/api/Facebook/GetFacebookProfilesOnly?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.fbprofiles = response.data;                                    
                                      console.log($scope.fbprofiles);
                                  }

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        }
        // end codes to load fb profiles

        //code for google start
        $scope.fetchGplusProfiles = function () {
           
            $http.get(apiDomain + '/api/Google/GetAllGplusProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.lstGplusProfiles = response.data;
                                  console.log("dfedf");
                                  console.log($scope.lstGplusProfiles);
                              }

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        //code for google end



        //for message when no pass and id start
        //$scope.passNull = function (temp) {
        //    if (temp == false) {
        //        $scope.hasEnableF = true;
        //    }
        //    alertify.set({ delay: 9000 });
        //    alertify.error("You can't disable it because you dont have Id & Password to login!");
        //    $scope.hasEnableF = true;

        //}
        //for message when no pass and id end

        //Enable disable fcebook social sign fb start
        $scope.socialLoginFB = function (hasEnable,fbid) {

            console.log(hasEnable);
            console.log($scope.userdata);
            $scope.onoff = hasEnable;
            if ($scope.onoff) {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/EnableDisableSocialLogin?userId=' + $rootScope.user.Id + '&facebookid=' + fbid + '&checkEnable=' + true,
                    crossDomain: true,
                    //data: ,
                }).then(function (response) {
                    swal(response.data);

                }, function (reason) {

                    swal(response.data);


                });
            }
            else {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/EnableDisableSocialLogin?userId=' + $rootScope.user.Id + '&facebookid=' + fbid + '&checkEnable=' + false,
                    crossDomain: true,
                    //data: ,
                }).then(function (response) {
                    swal(response.data);

                }, function (reason) {

                    swal("Error!");


                });
            }

        }
        //Enable disable fcebook social sign fb End

        //Enable disable GoogleSignIn start
        $scope.socialLoginGoogle = function (hasEnableGoogle) {

            console.log("abcd");
            console.log($rootScope.user.Password);
            $scope.onoff = hasEnableGoogle;
            if ($scope.onoff) {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Google/EnableDisableGoogleSignIn?userId=' + $rootScope.user.Id + '&checkEnable=' + true,
                    crossDomain: true,
                    //data: ,
                }).then(function (response) {
                    swal(response.data);

                }, function (reason) {

                    swal("Error!");


                });
            }
            else {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Google/EnableDisableGoogleSignIn?userId=' + $rootScope.user.Id + '&checkEnable=' + false,

                }).then(function (response) {
                    swal(response.data);

                }, function (reason) {

                    swal("Error!");


                });
            }

        }
        //En dis GoogleSignIn end


        //Func
        $scope.fetchGplusProfiles();
        $scope.getfbprofiles();

        //Update Password
        $scope.UpdatePassword = function (updatePassword) {
           // var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
            var cookies = document.cookie.split(";");
            var systemId = '';
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                cookie = cookie.split("=");
               // var eqPos = cookie.indexOf("=");
                var name = cookie[0];
                var value = cookie[1];   //eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                if (name.indexOf("socioboardpluginemailId") > -1) {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
                if (name.indexOf("socioboardpluginToken") > -1) {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
                if (name.indexOf("sociorevtoken") > -1) {
                    systemId = value; //Base64.decode(value);
                }
            }
            var formData = new FormData();
            formData.append('currentPassword', updatePassword.currentPassword);
            formData.append('newPassword', updatePassword.newPassword);
            formData.append('conformPassword', updatePassword.conformPassword);
            formData.append('systemId', systemId);
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/ChangePassword?userId='+ $rootScope.user.Id,
                crossDomain: true,
                data: formData ,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                updatePassword.currentPassword = '';
                updatePassword.newPassword = '';
                updatePassword.conformPassword = '';
                $("#change_passwd").closeModal();
            }, function (reason) {
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);

            });
        }
        //Code for fetching session details
        $scope.fetchUserSession = function () {
            $http.get(apiDomain + '/api/User/GetUserSessions?userId=' + $rootScope.user.Id)
                            .then(function (response) {
                                $scope.userSessions = response.data;
                                $scope.sessionTimedifference($scope.userSessions);
                            }, function (reason) {
                                $scope.error = reason.data;
                            });
        }
        $scope.fetchUserSession();

        $scope.getuserdata = function () {
            $http.get(apiDomain + '/api/User/GetUser?Id=' + $rootScope.user.Id)
                            .then(function (response) {
                                $scope.userdata = response.data;
                               
                            }, function (reason) {
                                $scope.error = reason.data;
                            });
        }
        $scope.Revokesession = function (sessionId, systemId) {
            $http.post(apiDomain + '/api/User/RevokeSession?sessionId=' + sessionId + '&systemId=' + systemId)
                            .then(function (response) {
                                swal('your session has been revoked');
                                var cookies = document.cookie.split(";");
                                for (var i = 0; i < cookies.length; i++) {
                                    var cookie = cookies[i];
                                    var eqPos = cookie.indexOf("=");
                                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                                    if (name.indexOf("socioboardpluginemailId") > -1) {
                                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                    }
                                    if (name.indexOf("socioboardpluginToken") > -1) {
                                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                    }
                                    if (name.indexOf("socioboardToken") > -1) {
                                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                    }
                                    if (name.indexOf("socioboardemailId") > -1) {
                                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                    }
                                    if (name.indexOf("sociorevtoken") > -1) {
                                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                    }
                                }
                                $scope.fetchUserSession();
                            }, function (reason) {
                                $scope.error = reason.data;
                            });
        }
      
        

        $scope.sessionTimedifference = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                //var mytimeinUtc = new Date('2017-06-24 10:55:10').toUTCString();
                var utcTime = new Date().toUTCString();

                var x = new Date(parm[i].lastAccessedTime);
                var y = new Date(parm[i].firstloginTime);
                var test = new Date(x);//new Date(mytimeinUtc);
                var test1 = new Date(y);//new Date(mytimeinUtc);
                var d1 = new Date();
                try {
                    var adtlastAccessedTime = moment([test.getFullYear(), test.getMonth(), test.getDate(), test.getHours(), test.getMinutes(), test.getSeconds()]);
                } catch (e) {
                    console.log(e);
                }
                try {
                    var afirstloginTime = moment([test1.getFullYear(), test1.getMonth(), test1.getDate(), test1.getHours(), test1.getMinutes(), test1.getSeconds()]);
                } catch (x) {
                    console.log(x);
                }
                var b = moment([d1.getUTCFullYear(), d1.getUTCMonth(), d1.getUTCDate(), d1.getUTCHours(), d1.getUTCMinutes(), d1.getUTCSeconds()]);
                var dlastAcce = adtlastAccessedTime.from(b);
                var dfirstlog = afirstloginTime.from(b);
                parm[i].lastAccessedTime = dlastAcce;
                parm[i].firstloginTime = dfirstlog;
            }
            $scope.Sessions = parm;

        }
        $scope.getOnPageLoad = function () {
            $scope.getuserdata();
        }

        $scope.getOnPageLoad();

    });
});