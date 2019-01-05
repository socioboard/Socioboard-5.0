/// <reference path="../../views/home/index.html" />
/// <reference path="../../views/home/index.html" />
'use strict';
/***
Socioboard AngularJS App Main Script
***/
/* Socioboard App */
var SocioboardApp = angular.module("SocioboardApp", [
    "ui.router",
    "ngRoute",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "lazy-scroll",
    "ngMaterial",
    "mdPickers",
    //"ngAviary",
]);

//SocioboardApp.config(function (ngAviaryProvider) {
//    ngAviaryProvider.configure({
//        apiKey: 'my-awesome-api-key',
//        theme: 'light',
//        tools: 'all'
//    })
//});

//SocioboardApp.constant("apiDomain", "https://servapi1.socioboard.com");
//SocioboardApp.constant("domain", "https://serv1.socioboard.com");

SocioboardApp.constant("apiDomain", "http://localhost:6361");
SocioboardApp.constant("domain", "http://localhost:9821");
//Not Using codes Start
SocioboardApp.directive('myRepeatDropdownDirective', function () {
    return function (scope, element, attrs) {
        // if (scope.$last) {
        $('select').material_select();
        $('select').change(function () {
            var newValuesArr = [],
                select = $(this),
                ul = select.prev();
            ul.children('li').toArray().forEach(function (li, i) {
                if ($(li).hasClass('active')) {
                    newValuesArr.push(select.children('option').toArray()[i].value);
                }
            });
            select.val(newValuesArr);
        });
        //}
    };
})

//Not Using End

SocioboardApp.directive('myRepeatTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();
                $('select').change(function () {
                    var newValuesArr = [],
                        select = $(this),
                        ul = select.prev();
                    ul.children('li').toArray().forEach(function (li, i) {
                        if ($(li).hasClass('active')) {
                            newValuesArr.push(select.children('option').toArray()[i].value);
                        }
                    });
                    select.val(newValuesArr);
                });

            });
        }
    };
})

SocioboardApp.directive('myRepeatTimeoutGroupsDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();

            });
        }
    };
})







//codes to redirect all unauthorized calls to index page
SocioboardApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('SB401Detector');
});



// interceptor logic.
SocioboardApp.factory('SB401Detector', function ($location, $q) {
    return {
        responseError: function (response) {
            if (response.status === 401) {
                window.top.location = "../Index/Index";
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
});
//end codes to redirect all unauthorized calls to index page


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
SocioboardApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
    });
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
SocioboardApp.config(['$controllerProvider', function ($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
SocioboardApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: '/contents/socioboard/images/',
        layoutCssPath: '/contents/socioboard/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
// SocioboardApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
//     $scope.$on('$viewContentLoaded', function() {
//         Socioboard.initComponents(); // init core components
//         //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
//     });
// }]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
SocioboardApp.controller('HeaderController', function ($rootScope, $scope, $http, domain, apiDomain, groupmember) {
    $scope.$on('$includeContentLoaded', function () {

        localStorage.setItem("user", JSON.stringify($rootScope.user));
        $scope.AccountType = $rootScope.user.AccountType;
        var imagePic = $rootScope.user.ProfilePicUrl;
        if (imagePic == '' || imagePic == null) {
            $rootScope.profilePicExist = 0;
            $rootScope.user.ProfilePicUrl = 'https://i.imgur.com/zqN47Qp.png';
        }
        else {
            $rootScope.profilePicExist = 1;
        }
       //get group count
        $scope.getGroupCount = function () {
            $http.get(apiDomain + '/api/Groups/GetUserGroupsCount?&userId=' + $rootScope.user.Id)
                           .then(function (response) {
                               $rootScope.GetUserGroupCount = response.data;

                           }, function (reason) {
                               $scope.error = reason.data;
                           });
        }
        //Logout
        $scope.logout = function () {

            setCookie("socioboardpluginemailId", '', "90");
            setCookie("socioboardpluginToken", '', "90");
            setCookie("socioboardToken", '', "90");
            setCookie("socioboardemailId", '', "90");
            setCookie("sociorevtoken", '', "90");

            $rootScope.groupId = '';
            //$rootScope.user.Id = '';
            //codes to logout from all session
            $http.get(domain + '/Logout/Logout')
                          .then(function() {
                            
                              window.location.href = '../Index/Index';
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
          
            
            // window.location.reload();
            // end codes to logout from all session
        }

        function setCookie(cname, cvalue, exdays) {
            var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9+/=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/rn/g, "n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }
                   // cpwd = cvalue;
                    cvalue = Base64.encode(cvalue);
                    var d = new Date();
                    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                    var expires = "expires=" + d.toUTCString();
                    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
                }

        $scope.removeCookies = function async() {
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
           // window.location.href = '../Index/Index';
            //window.location.reload();
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

        //YoutubeGroup
        $scope.loadYtGrpMembers = function () {
            $http.get(apiDomain + '/api/YoutubeGroup/GetGroupMember?userId=' + $rootScope.user.Id)
                                 .then(function (response) {
                                     $rootScope.lstYtGrpMem = response.data;
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }
        //success or failure notification
        //$scope.LoadNotifications = function () {
        //    $http.get(apiDomain + '/api/Notifications/FindNotifications?userId=' + $rootScope.user.Id)
        //                      .then(function (response) {
        //                          $scope.lstnotifications = response.data;
        //                          $scope.notifycount = $scope.lstnotifications.length;
        //                         // $scope.reloadFeeds();
        //                       }, function (reason) {
        //                          $scope.error = reason.data;
        //                      });
        //    // end codes to load  recent Feeds

        //}

        $scope.changepass = function () {
            
            $http.get(apiDomain + '/api/Notifications/ChangePasswordDetail?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstChangePass = response.data;
                                  
                                  var abc = $scope.lstChangePass;
                                  $scope.lstsinglepass = [];
                                  angular.forEach($scope.lstChangePass, function (value, key) {
                                      $scope.lstsinglepass.push(value.profileName);
                                  });
                                  if (response.data != "No Data") {
                                      $scope.notifycount = $scope.lstsinglepass.length;
                                  }
                                  else {
                                      $scope.notifycount = 0;
                                  }
                                  console.log("data", $scope.notifycount);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds
        }
        $scope.changepass();
        //$scope.reloadFeeds = function () {
        //    setTimeout(function () { $scope.LoadNotifications(); }, 1000);
        //}


        $scope.getOnPageLoadGroups = function () {
            $scope.loadYtGrpMembers();
            //$scope.LoadNotifications();
            $scope.getGroupCount();
            var canContinue = true;
            angular.forEach($rootScope.groups, function (value, key) {
                if (canContinue && value.id == $rootScope.groupId) {
                    groupmember.getGroupMembers(key, $rootScope.groupId)
                    $rootScope.groupIndex = key;
                    canContinue = false;
                }
            });
        }

        $scope.getOnPageLoadGroups();
    });
});

/* Setup Layout Part - Sidebar */
/* Setup Layout Part - Sidebar */
SocioboardApp.controller('SidebarController', function ($rootScope, $scope, $http, apiDomain, domain) {
    $scope.$on('$includeContentLoaded', function () {
        $scope.AccountType = $rootScope.user.AccountType;
        $scope.UserEmail = $rootScope.user.EmailId;
        $scope.message = function () {
           $scope.abcd = "If You want to use this feature upgrade to higher business plan ";
            swal($scope.abcd);
        };
        $scope.fbProfileFilter = function (item) {
            return item.profileType === 0 || item.profileType === 1;
        };
        $scope.logout = function () {

            //alert('hello');
            $rootScope.groupId = '';
            //$rootScope.user.Id = '';
            //codes to logout from all session
            $http.get(domain + '/Home/Logout')
                          .then(function (response) {

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
                              }


                              localStorage.removeItem("user");
                              window.location.href = '../Index/Index';
                              window.location.reload();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

            // end codes to logout from all session
        }

        $scope.getYtGroupProfileSidebar = function () {
            $http.get(apiDomain + '/api/YoutubeGroup/GetYtGroupChannel?userId=' + $rootScope.user.Id)
                                 .then(function (response) {
                                     $rootScope.lstYtGrpMembersSidebar = response.data;
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }
        $scope.getYtGroupProfileSidebar();


        $scope.getadminDetails = function () {
               $http.get(apiDomain + '/api/GroupMember/GetGroupAdmin?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $rootScope.groupdetails = response.data;
                              }, function (reason) {
                              $scope.error = reason.data;
                          });
            //}

        }
        $scope.getadminDetails();
        ////codes to load  social profiles start
        //$http.get(apiDomain + '/api/GroupProfiles/GetGroupProfiles?groupId=' + $rootScope.groupId)
        //              .then(function (response) {

        //                  $rootScope.lstProfiles = response.data;
        //              }, function (reason) {
        //                  $scope.error = reason.data;
        //              });
        // end codes to load social profiles

        $('.collapsible').collapsible();
        // Layout.initSidebar(); // init sidebar


        //$scope.getHttpsURL = function (obj) {
        //    if (obj.includes("wwwroot\\")) {
        //        return apiDomain + "/api/Media/get?id=" + obj.split("wwwroot\\upload\\")[1];
        //    }
        //    else {
        //        return obj;
        //    }
        //};
    });
});

/* Setup Layout Part - Sidebar */
// SocioboardApp.controller('PageHeadController', ['$scope', function($scope) {
//     $scope.$on('$includeContentLoaded', function() {        
//         Demo.init(); // init theme panel
//     });
// }]);

/* Setup Layout Part - Footer */
//SocioboardApp.controller('FooterController', ['$scope', function ($scope) {
//    $scope.$on('$includeContentLoaded', function () {
//        // Layout.initFooter(); // init footer
//    });
//}]);

/* Setup Rounting For All Pages */
SocioboardApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");

    $stateProvider
        // Dashboard
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "../contents/socioboard/views/dashboard/dashboard.html",
            data: {
                pageTitle: 'Dashboard', pageSubTitle: 'updated',
            },
            controller: "DashboardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/controllers/dashboardcontroller.js',
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/css/admin/custom.css'
                        ]
                    });
                }]
            }
        })

        // // smart inbox controller

        //.state('smartinbox', {
        //    url: "/smartinbox",
        //    templateUrl: "../contents/socioboard/views/message/smartinbox.html",
        //    data: { pageTitle: 'Smart Inbox', pageSubTitle: 'updated' },
        //    controller: "SmartInboxController",

        //    resolve: {
        //        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
        //            return $ocLazyLoad.load({
        //                name: 'SocioboardApp',
        //                insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                files: [
        //                    '../contents/socioboard/js/admin/plugins.js',
        //                    '../contents/socioboard/controllers/smartinboxcontroller.js',
        //                    '../contents/socioboard/services/grouptask.js'
        //                ]
        //            });
        //        }]
        //    }
        //})


        // twitter analytics controller

        .state('twitteranalytics', {
            url: "/twitteranalytics",
            templateUrl: "../contents/socioboard/views/twitterengagement/twitteranalytics.html",
            data: { pageTitle: 'Twitter Analytics', pageSubTitle: 'updated' },
            controller: "TwitterAnalyticsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/twitteranalyticscontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })



         // inbox message controller
        .state('twitterinbox', {
            url: "/twitterinbox",
            templateUrl: "../contents/socioboard/views/twitterengagement/twitterinbox.html",
            data: { pageTitle: 'Twitter Inbox', pageSubTitle: 'updated' },
            controller: "TwitterInboxController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/twitterinboxcontroller.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })

         // MyTask controller

        .state('mytask', {
            url: "/mytask",
            templateUrl: "../contents/socioboard/views/message/mytask.html",
            data: { pageTitle: 'My Task', pageSubTitle: 'updated' },
            controller: "MyTaskController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/mytaskcontroller.js',
                             '../contents/socioboard/services/grouptask.js',
                             '../contents/socioboard/services/utility.js'
                        ]
                    });
                }]
            }
        })

         // Sent Messages Controller 
         .state('history', {
             url: "/history",
             templateUrl: "../contents/socioboard/views/publishing/history.html",
             data: { pageTitle: 'History', pageSubTitle: 'updated' },
             controller: "HistoryController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/controllers/historycontroller.js'
                         ]
                     });
                 }]
             }
         })

        // youtube inbox Controller

        .state('youtube_inbox', {
            url: "/youtube_inbox/{profileid}",
            templateUrl: "../contents/socioboard/views/twitterengagement/youtube_inbox.html",
            data: { pageTitle: 'Youtube Inbox', pageSubTitle: 'updated' },
            controller: "YoutubeInboxController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubeinboxcontroller.js'
                        ]
                    });
                }]
            }
        })

        // youtube inbox Controller for members

        .state('youtubeinbox_member', {
            url: "/youtubeinbox_member/{profileid}",
            templateUrl: "../contents/socioboard/views/twitterengagement/youtubeinbox_member.html",
            data: { pageTitle: 'Youtube Inbox', pageSubTitle: 'updated' },
            controller: "YoutubeInboxController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubeinboxcontroller.js'
                        ]
                    });
                }]
            }
        })

        // youtube group invite Controller

        .state('youtube_group_invite', {
            url: "/youtubegroup",
            templateUrl: "../contents/socioboard/views/groups/youtubegroup.html",
            data: { pageTitle: 'Youtube Group Invite', pageSubTitle: 'updated' },
            controller: "YoutubeGroupInviteController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubegroupinvitecontroller.js'
                        ]
                    });
                }]
            }
        })


          // schedule message controller
        .state('schedulemessage', {
            url: "/schedulemessage",
            templateUrl: "../contents/socioboard/views/publishing/schedulemsg.html",
            data: { pageTitle: 'Schedule Message', pageSubTitle: 'updated' },
            controller: "ScheduleMessageController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.css',
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.js',
                            '../contents/socioboard/global/plugins/moment.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/schedulemsgcontroller.js'

                        ]
                    });
                }]
            }
        })

         // draft message controller
         .state('draft', {
             url: "/draft",
             templateUrl: "../contents/socioboard/views/publishing/draft.html",
             data: { pageTitle: 'Draft Message', pageSubTitle: 'updated' },
             controller: "DraftMessageController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/css/admin/custom.css',
                             '../contents/socioboard/controllers/draftmsgcontroller.js',
                             '../contents/socioboard/services/utility.js'
                         ]
                     });
                 }]
             }
         })
          // socialqueue message controller
         .state('socioqueue', {
             url: "/socioqueue",
             templateUrl: "../contents/socioboard/views/publishing/socioqueue.html",
             data: { pageTitle: 'SocioQueue', pageSubTitle: 'updated' },
             controller: "SocioqueueController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/css/admin/custom.css',
                             '../contents/socioboard/controllers/socioqueuecontroller.js'
                         ]
                     });
                 }]
             }
         })

        // Day wise socialqueue message controller
         .state('DaySocioQueue', {
             url: "/day_socioqueue",
             templateUrl: "../contents/socioboard/views/publishing/day_socioqueue.html",
             data: { pageTitle: 'Day Wise SocioQueue', pageSubTitle: 'updated' },
             controller: "DaySocioQueueController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/css/admin/custom.css',
                             '../contents/socioboard/controllers/daysocioqueuecontroller.js'
                         ]
                     });
                 }]
             }
         })
         // Discovery Suggestion

        // youtube search       
        .state('youtubesearch', {
            url: "/youtubesearch",
            templateUrl: "../contents/socioboard/views/discovery/youtubesearch.html",
            data: { pageTitle: 'Youtube Search', pageSubTitle: 'updated' },
            controller: "YoutubeSearchController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubesearchcontroller.js'
                        ]
                    });
                }]
            }
        })

        // ur followers        
        .state('your_followers', {
            url: "/your_followers/{profileId}",
            templateUrl: "../contents/socioboard/views/discovery/your_followers.html",
            data: { pageTitle: 'Your Followers', pageSubTitle: 'updated' },
            controller: "YourFollowerController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/yourfollowerscontroller.js'
                        ]
                    });
                }]
            }
        })

        // mentions based       
        .state('mentionsbased', {
            url: "/mentionsbased/{profileId}",
            templateUrl: "../contents/socioboard/views/discovery/mentionsbased.html",
            data: { pageTitle: 'Mentions Based', pageSubTitle: 'updated' },
            controller: "MentionsBasedController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/mentionsbasedcontroller.js'
                        ]
                    });
                }]
            }
        })

                // conversation based       
        .state('conversationbased', {
            url: "/conversationbased/{profileId}",
            templateUrl: "../contents/socioboard/views/discovery/conversationbased.html",
            data: { pageTitle: 'Conversation Based', pageSubTitle: 'updated' },
            controller: "ConversationBasedController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/conversationbasedcontroller.js'
                        ]
                    });
                }]
            }
        })

        // ur unfollowers        
        .state('your_unfollowers', {
            url: "/your_unfollowers/{profileId}",
            templateUrl: "../contents/socioboard/views/discovery/your_unfollowers.html",
            data: { pageTitle: 'Your UnFollowers', pageSubTitle: 'updated' },
            controller: "YourUnFollowerController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/yourunfollowerscontroller.js'
                        ]
                    });
                }]
            }
        })

        .state('calendar', {
            url: "/calendar",
            templateUrl: "../contents/socioboard/views/publishing/calendar.html",
            data: { pageTitle: 'Calendar', pageSubTitle: 'updated' },
            controller: "CalendarController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins/fullcalendar/css/fullcalendar.min.css',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/lib/jquery-ui.custom.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/lib/moment.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/js/fullcalendar.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/fullcalendar-script.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/calendarcontroller.js'
                        ]
                    });
                }]
            }
        })

         // Content Studio 
        .state('trending_content', {
            url: "/trending_content.html",
            templateUrl: "../contents/socioboard/views/content_studio/trending_content.html",
            data: {pageTitle: 'Trending Content', pageSubTitle: 'updated'},
            controller: "TrendingContentController",
             
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/trendingcontentcontroller.js'
 
                        ] 
                    });
                }]
            }
        })

        // Most Shared controller

        .state('MostShared', {
            url: "/mostshared.html",
            templateUrl: "../contents/socioboard/views/content_studio/mostshared.html",
            data: { pageTitle: 'Most Shared', pageSubTitle: 'updated' },
            controller: "MostSharedController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',

                            'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                            'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                            '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                            '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                            '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                            '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                            '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                            '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',

                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/mostsharedcontroller.js'
                        ]
                    });
                }]
            }
        })

         // Content studio shareathon controller

        .state('studio_shareathon_que', {
            url: "/studio_shareathon_que.html",
            templateUrl: "../contents/socioboard/views/content_studio/studio_shareathon_que.html",
            data: { pageTitle: 'Studio Shareathon', pageSubTitle: 'updated' },
            controller: "StudioShareathonQueueController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/studioshareathonqueuecontroller.js'
                        ]
                    });
                }]
            }
        })


        // discovery
        .state('discovery', {
            url: "/discovery",
            templateUrl: "../contents/socioboard/views/discovery/discovery.html",
            data: { pageTitle: 'Discovery', pageSubTitle: 'updated' },
            controller: "DiscoveryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/discoverycontroller.js'
                        ]
                    });
                }]
            }
        })

        // Smart Search
        .state('smartsearch', {
            url: "/smartsearch",
            templateUrl: "../contents/socioboard/views/discovery/smartsearch.html",
            data: { pageTitle: 'SmartSearch', pageSubTitle: 'updated' },
            controller: "DiscoveryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             'https://maps.googleapis.com/maps/api/js?key=AIzaSyAyfTLfVpXa2nAkYREyFdst3bl0B6sYuGU',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/discoverycontroller.js'
                        ]
                    });
                }]
            }
        })


         // pinterest feeds

        .state('pinterestboards', {
            url: "/pinterestboards/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/pinterestboards.html",
            data: { pageTitle: 'Pinterest Boards', pageSubTitle: 'updated' },
            controller: "PinterestBoardsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/controllers/pinterestboardscontroller.js'

                        ]
                    });
                }]
            }
        })

        .state('pinterestfeeds', {
            url: "/pinterestfeeds/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/pinterestfeeds.html",
            data: { pageTitle: 'Pinterest Feeds', pageSubTitle: 'updated' },
            controller: "PinterestFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                            //'../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                            '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/pinterestfeedscontroller.js'

                        ]
                    });
                }]
            }
        })
         .state('pinterestboardpin', {
             url: "/pinterestboardpin/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/pinterestboardpin.html",
             data: { pageTitle: 'Pinterest BoardPins', pageSubTitle: 'updated' },
             controller: "PinterestBoardPinsController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                              '../contents/socioboard/controllers/pinterestboardpincontroller.js'

                         ]
                     });
                 }]
             }
         })

        .state('pinterestlikes', {
            url: "/pinterestlikes/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/pinterestlikes.html",
            data: { pageTitle: 'Pinterest Likes', pageSubTitle: 'updated' },
            controller: "PinterestLikesController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                             '../contents/socioboard/controllers/pinterestlikescontroller.js'

                        ]
                    });
                }]
            }
        })


     // feeds manager
        // facebook feeds manager

        .state('facebookfeedsmanager', {
            url: "/facebookfeedsmanager/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds_manager/facebookfeedsmanager.html",
            data: { pageTitle: 'Facebook feeds manager', pageSubTitle: 'updated' },
            controller: "FacebookFeedsManagerController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/facebookfeedsmanagercontroller.js'
                        ]
                    });
                }]
            }
        })

        // twitter feeds manager

        .state('twitterfeedsmanager', {
            url: "/twitterfeedsmanager/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds_manager/twitterfeedsmanager.html",
            data: { pageTitle: 'Twitter feeds manager', pageSubTitle: 'updated' },
            controller: "TwitterFeedsManagerController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/twitterfeedsmanagercontroller.js'
                        ]
                    });
                }]
            }
        })

        // linkedinpage feeds manager

        .state('linkedinpagefeedsmanager', {
            url: "/linkedinpagefeedsmanager/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds_manager/linkedinpagefeedsmanager.html",
            data: { pageTitle: 'Linkedin Page feeds manager', pageSubTitle: 'updated' },
            controller: "LinkedinPageFeedsManagerController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/linkedinpagefeedsmanagercontroller.js'
                        ]
                    });
                }]
            }
        })

        // instagram feeds manager

        .state('instagramfeedsmanager', {
            url: "/instagramfeedsmanager/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds_manager/instagramfeedsmanager.html",
            data: { pageTitle: 'Instagram feeds manager', pageSubTitle: 'updated' },
            controller: "InstagramFeedsManagerController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/instagramfeedsmanagercontroller.js'
                        ]
                    });
                }]
            }
        })

           // facebook feeds controller

         .state('facebookfeeds', {
             url: "/facebookfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/facebookfeeds.html",
             data: { pageTitle: 'Facebook Live feeds', pageSubTitle: 'updated' },
             controller: "FacebookFeedsController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/facebookfeedscontroller.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/services/grouptask.js',
                            '../contents/socioboard/directives/directives.js'
                         ]
                     });
                 }]
             }
         })
        // AngularJS plugins

        // get_touch Controller

        .state('get_touch', {
            url: "/get_touch",
            templateUrl: "../contents/socioboard/views/settings/get_touch.html",
            data: { pageTitle: 'Get In Touch', pageSubTitle: 'updated' },
            controller: "GetTouchController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/gettouchcontroller.js'
                        ]
                    });
                }]
            }
        })

      .state('profilesettings', {
          url: "/profilesettings",
          templateUrl: "../contents/socioboard/views/settings/profilesettings.html",
          data: { pageTitle: 'Profile Settings', pageSubTitle: 'updated' },
          controller: "ProfileSettingController",

          resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'SocioboardApp',
                      insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                      files: [
                          '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.css',
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.js',
                            '../contents/socioboard/global/plugins/moment.js',
                          '../contents/socioboard/js/admin/plugins.js',
                          '../contents/socioboard/services/userservice.js',
                          '../contents/socioboard/controllers/profilesettingcontroller.js'
                      ]
                  });
              }]
          }
      })

       //ads offer
            .state('ads_offer', {
                url: "/ads_offer",
                templateUrl: "../contents/socioboard/views/settings/ads_offer.html",
                data: { pageTitle: 'Ads Offer', pageSubTitle: 'updated' },
                controller: "AdsOfferController",

                resolve: {
                    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'SocioboardApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                '../contents/socioboard/global/plugins/clipboardjs/dist/clipboard.js',
                                '../contents/socioboard/js/admin/plugins.js',
                                '../contents/socioboard/controllers/adsoffercontroller.js'
                            ]
                        });
                    }]
                }
            })
           .state('mail_settings', {
               url: "/mail_settings",
               templateUrl: "../contents/socioboard/views/settings/mail_settings.html",
               data: { pageTitle: 'Mail Settings', pageSubTitle: 'updated' },
               controller: "MailSettingController",

               resolve: {
                   deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                       return $ocLazyLoad.load({
                           name: 'SocioboardApp',
                           insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                           files: [
                               '../contents/socioboard/js/admin/plugins.js',
                               '../contents/socioboard/controllers/mailsettingcontroller.js'
                           ]
                       });
                   }]
               }
           })


        // billing
        .state('billing', {
            url: "/billing",
            templateUrl: "../contents/socioboard/views/settings/billing.html",
            data: { pageTitle: 'Billing', pageSubTitle: 'updated' },
            controller: "BillingController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/billingcontroller.js'
                        ]
                    });
                }]
            }
        })
        //Access password
        .state('access_passwd', {
            url: "/access_passwd",
            templateUrl: "../contents/socioboard/views/settings/access_passwd.html",
            data: { pageTitle: 'Access &amp; Passward', pageSubTitle: 'updated' },
            controller: "AccessPasswdController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/accesspasswdcontroller.js'
                        ]
                    });
                }]
            }
        })

        //End Access password

        // Link_shortening
        .state('link_shortening', {
            url: "/link_shortening",
            templateUrl: "../contents/socioboard/views/settings/link_shortening.html",
            data: { pageTitle: 'Link Shortening', pageSubTitle: 'updated' },
            controller: "LinkShorteningController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/linkshorteningcontroller.js'
                        ]
                    });
                }]
            }
        })
        //End Link shortening

          //browser extensions
        .state('extensions', {
            url: "/extensions",
            templateUrl: "../contents/socioboard/views/settings/extensions.html",
            data: { pageTitle: 'Extensions', pageSubTitle: 'updated' },
            controller: "ExtensionsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/extensionscontroller.js'
                        ]
                    });
                }]
            }
        })

      .state('upgradeplan', {
          url: "/upgradeplan",
          templateUrl: "../contents/socioboard/views/settings/upgradeplan.html",
          data: { pageTitle: 'Upgrade Plans', pageSubTitle: 'updated' },
          controller: "ProfileSettingController",

          resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'SocioboardApp',
                      insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                      files: [
                          '../contents/socioboard/js/admin/plugins.js',
                          '../contents/socioboard/services/userservice.js',
                          '../contents/socioboard/css/frontend/style.css',
                          '../contents/socioboard/controllers/profilesettingcontroller.js'
                      ]
                  });
              }]
          }
      })

         // referal 
          .state('referral', {
              url: "/referral",
              templateUrl: "../contents/socioboard/views/settings/referral.html",
              data: { pageTitle: 'Referral', pageSubTitle: 'updated' },
              controller: "ReferralController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [

                              '../contents/socioboard/js/admin/plugins.js',
                               '../contents/socioboard/controllers/referralcontroller.js'

                          ]
                      });
                  }]
              }
          })

        // e-wallet 
        .state('ewalletlist', {
            url: "/ewalletlist",
            templateUrl: "../contents/socioboard/views/e_wallet/ewalletlist.html",
            data: { pageTitle: 'ewalletList', pageSubTitle: 'updated' },
            controller: "EwalletlistController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/ewalletlistcontroller.js'
                        ]
                    });
                }]
            }
        })

        // Profiles list
        .state('profiles', {
            url: "/profiles",
            templateUrl: "../contents/socioboard/views/dashboard/profiles.html",
            data: { pageTitle: 'Profile List', pageSubTitle: 'updated' },
            controller: "ProfilesController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/profilescontroller.js'

                        ]
                    });
                }]
            }
        })

     // twitter feeds controller
         .state('twitterfeeds', {
             url: "/twitterfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/twitterfeeds.html",
             data: { pageTitle: 'Twitter Live feeds', pageSubTitle: 'updated' },
             controller: "TwitterFeedsController",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/twitterfeedscontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                         ]
                     });
                 }]
             }
         })


        // instagram feeds controller
         .state('instagramfeeds', {
             url: "/instagramfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/instagramfeeds.html",
             data: { pageTitle: 'Instagram Live feeds', pageSubTitle: 'updated' },
             controller: "InstagramFeedsController",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                              '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                             //'../contents/socioboard/js/admin/plugins.js',
                             //'../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/controllers/instagramfeedscontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                         ]
                     });
                 }]
             }
         })


         // Linkedin Company feeds controller

        .state('linkedin_comp_feeds', {
            url: "/linkedin_comp_feeds/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/linkedin_comp_feeds.html",
            data: { pageTitle: 'LinkedIn Company page Live feeds', pageSubTitle: 'updated' },
            controller: "LinkedinCompFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/linkedin_comp_feeds_controller.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })


        // youtube feeds controller

        .state('youtubefeeds', {
            url: "/youtubefeeds/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/youtubefeeds.html",
            data: { pageTitle: 'Youtube Live feeds', pageSubTitle: 'updated' },
            controller: "YoutubeFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubefeedscontroller.js'
                        ]
                    });
                }]
            }
        })



          .state('googleplusfeeds', {
              url: "/googleplusfeeds/{profileId}",
              templateUrl: "../contents/socioboard/views/feeds/googleplusfeeds.html",
              data: { pageTitle: 'Google plus Live feeds', pageSubTitle: 'updated' },
              controller: "GooglePlusFeedsController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                              '../contents/socioboard/controllers/googleplusfeedscontroller.js'
                          ]
                      });
                  }]
              }
          })

        // Rss News

        .state('rss_news', {
            url: "/rss_news.html",
            templateUrl: "../contents/socioboard/views/rss_news/rss_news.html",
            data: { pageTitle: 'Rss News', pageSubTitle: 'updated' },
            controller: "RssNewsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssnewscontroller.js'
                        ]
                    });
                }]
            }
        })



          // AutoMate Rss Feeds

        .state('automate_rss_feeds', {
            url: "/automate_rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/automate_rss_feeds.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "AutoMateRssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/automaterssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })



        // Rss Feeds

        .state('rss_feeds', {
            url: "/rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/rss_feeds.html",
            data: { pageTitle: 'RssFeeds', pageSubTitle: 'updated' },
            controller: "RssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })


        // Posted Rss Feeds

        .state('posted_rss_feeds', {
            url: "/posted_rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/posted_rss_feeds.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "PostedRssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                           '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/postedrssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })


        // Rss Queue controller

        .state('rss_queue', {
            url: "/rss_queue.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/rss_queue.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "RssQueueController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssqueuecontroller.js'
                        ]
                    });
                }]
            }
        })



         // group report

        .state('groupreport', {
            url: "/groupreport.html",
            templateUrl: "../contents/socioboard/views/reports/groupreport.html",
            data: { pageTitle: 'Group Report', pageSubTitle: 'updated' },
            controller: "GroupreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupreportcontroller.js',
                            '../contents/socioboard/js/admin/moment.min.js'

                        ]
                    });
                }]
            }
        })


          // tweeter custom report

        .state('twittercustomreports', {
            url: "/twittercustomreports",
            templateUrl: "../contents/socioboard/views/reports/twittercustomreports.html",
            data: { pageTitle: 'Tweeter Group Report', pageSubTitle: 'updated' },
            controller: "TwittercustomreportsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/TwittercustomreportsController.js',
                        ]
                    });
                }]
            }
        })

        //twitter report
          .state('twitterreports', {
              url: "/twitterreports",
              templateUrl: "../contents/socioboard/views/reports/twitterreports.html",
              data: { pageTitle: 'Tweeter Group Report', pageSubTitle: 'updated' },
              controller: "TwitterreportsController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              //'//cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css',
                              //'//cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js',
                              '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                              '../contents/socioboard/js/admin/plugins.js',
                              '../contents/socioboard/js/admin/moment.min.js',
                              '../contents/socioboard/controllers/twitterreportscontroller.js',
                          ]
                      });
                  }]
              }
          })

        // Youtube custom report

        .state('youtubereport', {
            url: "/youtubereport.html",
            templateUrl: "../contents/socioboard/views/reports/youtubereport.html",
            data: { pageTitle: 'Youtube Report', pageSubTitle: 'updated' },
            controller: "YoutubereportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubereportcontroller.js'

                        ]
                    });
                }]
            }
        })

        // Youtube all report

        .state('youtubeallreport', {
            url: "/youtubeallreport.html",
            templateUrl: "../contents/socioboard/views/reports/youtubeallreport.html",
            data: { pageTitle: 'Youtube Report', pageSubTitle: 'updated' },
            controller: "YoutubeallreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                              '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                               '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                              '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/youtubeallreportcontroller.js'

                        ]
                    });
                }]
            }
        })


         // googleanalytic report

        .state('googleanalyticsreport', {
            url: "/googleanalyticsreport",
            templateUrl: "../contents/socioboard/views/reports/googleanalyticsreport.html",
            data: { pageTitle: 'googleanalytic Report', pageSubTitle: 'updated' },
            controller: "GoogleAnalyticreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/googleanalyticreportcontroller.js',

                        ]
                    });
                }]
            }
        })
          // Facebook public page report
        .state('facebookpagereport', {
            url: "/facebookpagereport.html",
            templateUrl: "../contents/socioboard/views/reports/facebookpagereport.html",
            data: { pageTitle: 'Facebook Page Report', pageSubTitle: 'updated' },
            controller: "FacebookpagereportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/facebookpagereportcontroller.js',
                              '../contents/socioboard/js/admin/moment.min.js',

                        ]
                    });
                }]
            }
        })


            // Facebook report  

        .state('facebookreport', {
            url: "/facebookreport.html",
            templateUrl: "../contents/socioboard/views/reports/facebookreport.html",
            data: { pageTitle: 'Facebook Report', pageSubTitle: 'updated' },
            controller: "FacebookreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                               '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                              '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/facebookreportcontroller.js'
                            //'../contents/socioboard/js/admin/moment.min.js'

                        ]
                    });
                }]
            }
        })


        //facebook page detail report

        .state('fbpagedetailreport', {
            url: "/facebookpagedetreport.html",
            templateUrl: "../contents/socioboard/views/reports/facebookpagedetreport.html",
            data: { pageTitle: 'Facebook Report', pageSubTitle: 'updated' },
            controller: "FbpagedetreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                          '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                               '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                              '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            //'../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                             '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light1.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/fbpagedetreportcontroller.js'
                            //'../contents/socioboard/js/admin/moment.min.js'

                        ]
                    });
                }]
            }
        })

         // Instagram custome report
         .state('instagramcustomreport', {
             url: "/instagramcustomreport.html",
             templateUrl: "../contents/socioboard/views/reports/instagramcustomreport.html",
             data: { pageTitle: 'Instagram Report', pageSubTitle: 'updated' },
             controller: "InstagramcustomreportController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                               '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                             '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                             '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                             '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                             '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                             '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                             '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                             '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                             '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/InstagramcustomreportController.js'

                         ]
                     });
                 }]
             }
         })
        //instagram report

          .state('instagramreport', {
              url: "/instagramreport.html",
              templateUrl: "../contents/socioboard/views/reports/instagramreport.html",
              data: { pageTitle: 'Instagram Report', pageSubTitle: 'updated' },
              controller: "InstagramreportController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              'https://cdn.datatables.net/buttons/1.3.1/css/buttons.dataTables.min.css',
                              'https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.flash.min.js',
                              '//cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/pdfmake.min.js',
                              '//cdn.rawgit.com/bpampuch/pdfmake/0.1.27/build/vfs_fonts.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.html5.min.js',
                              '//cdn.datatables.net/buttons/1.3.1/js/buttons.print.min.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.css',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/plugins/export/export.min.js',
                              '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                              '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                              '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                              '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                              '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                              '../contents/socioboard/js/admin/plugins.js',
                              '../contents/socioboard/controllers/instagramreportcontroller.js'

                          ]
                      });
                  }]
              }
          })

         // Shareathon //

        // Create group shareathon controller

        .state('creategroupshareathon', {
            url: "/create_group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/create_group_shareathon.html",
            data: { pageTitle: 'Create group shareathon', pageSubTitle: 'updated' },
            controller: "CreateGroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/creategroupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // Edit group shareathon controller

        .state('editgroupshareathon', {
            url: "/edit_group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/edit_group_shareathon.html",
            data: { pageTitle: 'Edit group shareathon', pageSubTitle: 'updated' },
            controller: "CreateGroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/creategroupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // group shareathon

        .state('groupshareathon', {
            url: "/group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/group_shareathon.html",
            data: { pageTitle: 'Group Shareathon', pageSubTitle: 'updated' },
            controller: "GroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // Create Page shareathon controller

        .state('createpageshareathon', {
            url: "/create_page_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/create_page_shareathon.html",
            data: { pageTitle: 'Create page shareathon', pageSubTitle: 'updated' },
            controller: "CreatePageShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/createpageshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        //edit page shareathon
          .state('editpageshareathon', {
              url: "/edit_page_shareathon.html",
              templateUrl: "../contents/socioboard/views/shareathon/edit_page_shareathon.html",
              data: { pageTitle: 'Edit page shareathon', pageSubTitle: 'updated' },
              controller: "CreatePageShareathonController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              '../contents/socioboard/js/admin/plugins.js',
                              '../contents/socioboard/controllers/createpageshareathoncontroller.js'
                          ]
                      });
                  }]
              }
          })

        // page shareathon

        .state('pageshareathon', {
            url: "/page_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/page_shareathon.html",
            data: { pageTitle: 'Page Shareathon', pageSubTitle: 'updated' },
            controller: "PageShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/pageshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // Create link shareathon controller

        .state('createlinkshareathon', {
            url: "/create_link_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/create_link_shareathon.html",
            data: { pageTitle: 'Create link shareathon', pageSubTitle: 'updated' },
            controller: "CreateLinkShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/createlinkshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // link shareathon

        .state('linkshareathon', {
            url: "/link_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/link_shareathon.html",
            data: { pageTitle: 'BoardList', pageSubTitle: 'updated' },
            controller: "LinkShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/linkshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // fbtw_feedsharing
         .state('fbtw_feedsharing', {
             url: "/fbtw_feedsharing.html",
             templateUrl: "../contents/socioboard/views/shareathon/fbtw_feedsharing.html",
             data: { pageTitle: 'Create page shareathon', pageSubTitle: 'updated' },
             controller: "FacebookTwitterFeedsShareController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/facebooktwitterfeedshare.js'
                         ]
                     });
                 }]
             }
         })


        .state('groups', {
            url: "/groups",
            templateUrl: "../contents/socioboard/views/groups/groups.html",
            data: { pageTitle: 'Groups', pageSubTitle: 'updated' },
            controller: "GroupsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupscontroller.js',
                            '../contents/socioboard/services/utility.js'
                        ]
                    });
                }]
            }
        })

    // BoardList controller

        .state('boardlist', {
            url: "/boardlist",
            templateUrl: "../contents/socioboard/views/boardme/boardlist.html",
            data: { pageTitle: 'BoardList', pageSubTitle: 'updated' },
            controller: "BoardlistController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/boardlistcontroller.js'
                        ]
                    });
                }]
            }
        })


        // Create Board me controller
        .state('createboard', {
            url: "/createboard",
            templateUrl: "../contents/socioboard/views/boardme/createboard.html",
            data: { pageTitle: 'Create BoardMe', pageSubTitle: 'updated' },
            controller: "CreateBoardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/createboardcontroller.js'
                        ]
                    });
                }]
            }
        })


         // Create Board me controller
        .state('board', {
            url: "/board/{boardId}/{boardName}",
            templateUrl: "../contents/socioboard/views/boardme/board.html",
            data: { pageTitle: 'BoardMe', pageSubTitle: 'updated' },
            controller: "BoardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                             //'../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                             //'../contents/socioboard/global/plugins/moment.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            //'../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                             '../contents/socioboard/controllers/boardcontroller.js'
                        ]
                    });
                }]
            }
        })


    .state('boardanalytics', {
        url: "/boardanalytics/{boardName}",
        templateUrl: "../contents/socioboard/views/boardme/boardanalytics.html",
        data: { pageTitle: 'BoardList', pageSubTitle: 'updated' },
        controller: "BoardAnalyticsController",

        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'SocioboardApp',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                    files: [

                        '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                        '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                        '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                        '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                        '../contents/socioboard/js/admin/plugins.js',
                        '../contents/socioboard/controllers/boardanalyticscontroller.js'
                    ]
                });
            }]
        }
    })

     // Design Feeds Sample

        .state('facebookgrouppost', {
            url: "/facebookgrouppost",
            templateUrl: "../contents/socioboard/views/design/design_feeds.html",
            data: { pageTitle: 'Design Feeds', pageSubTitle: 'updated' },
            controller: "DesignFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            //'../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                            '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/designfeedscontroller.js'


                        ]
                    });
                }]
            }
        })

       .state('linkedingrouppost', {
           url: "/linkedingrouppost",
           templateUrl: "../contents/socioboard/views/design/design_linfeeds.html",
           data: { pageTitle: 'Design Feeds', pageSubTitle: 'updated' },
           controller: "DesignFeedsINController",

           resolve: {
               deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load({
                       name: 'SocioboardApp',
                       insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                       files: [
                           //'../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                           // '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/global/plugins/waterfall_grid/newWaterfall.js',
                           '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/designlinfeedscontroller.js'

                       ]
                   });
               }]
           }
       })

        // ImgLibrary Controller list

        .state('img_library', {
            url: "/img_library",
            templateUrl: "../contents/socioboard/views/library/img_library.html",
            data: { pageTitle: 'Private Img', pageSubTitle: 'updated' },
            controller: "ImgLibraryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'http://feather.aviary.com/imaging/v2/editor.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/imglibrarycontroller.js'

                        ]
                    });
                }]
            }
        })

        .state('share_img_library', {
            url: "/share_img_library",
            templateUrl: "../contents/socioboard/views/library/share_img_library.html",
            data: { pageTitle: 'Public Img', pageSubTitle: 'updated' },
            controller: "ShareImgLibraryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            //'http://feather.aviary.com/imaging/v2/editor.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/shareimglibrarycontroller.js'

                        ]
                    });
                }]
            }
        })


         // notification all
        .state('notification_all', {
            url: "/notification_all",
            templateUrl: "../contents/socioboard/views/settings/notification_all.html",
            data: { pageTitle: 'Notification All', pageSubTitle: 'updated' },
            controller: "NotificationAllController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/notificationallcontroller.js'
                        ]
                    });
                }]
            }
        })

    // notification Single
        .state('notification', {
            url: "/notification",
            templateUrl: "../contents/socioboard/views/settings/notification.html",
            data: { pageTitle: 'Notification ', pageSubTitle: 'updated' },
            controller: "NotificationController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/notificationcontroller.js'
                        ]
                    });
                }]
            }
        })


}]).run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState, $stateParams) {

        if (localStorage.user != "" && localStorage.user != undefined) {

        }
        else {
            window.location.href = '../Index/Index';
            window.location.reload();
        }
    });
});

