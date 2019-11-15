@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard |See All Notifications</title>
@endsection

@section('seeAllNotifications')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>NOTIFICATIONS</h4>
        </div>
        <div class="col-md-12" id="notifications"></div>
    </div>
@endsection

@section('script')
    <script>
        $('html,body').animate({scrollTop:0},800);
        //for GA
        var eventCategory = 'User';
        var eventAction = 'See-All-Notifications';
        var notify_Data = '';
        $("#notifications").textContent = '';

        var actionUser = "inactive";
        var actionTeam = "inactive";
        var userPageId = 1;
        var teamPageId = 1;


        if(actionUser == "inactive"){
            actionUser = "active";
            getAllUserNotifications(userPageId);
        }
        if(actionTeam == "inactive"){
            actionTeam = "active";
            getAllTeamNotifications(teamPageId);
        }

        //get user notifications
        function getAllUserNotifications(pageId){
            $.ajax({
                type: 'get',
                url: "/get-all-user-notification?pageId"+pageId,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    if(((response["notifications"] != '' || response['notifications'].length >0) && response["code"] != 500)){
                        var notifications = response['notifications'];
                        if (response.code == 200) {
                            userPageId++;
                            $("#bootLoader").css("display","none");
                            if(response['notifications'].length == 0) actionUser = "active";
                            else actionUser = "inactive";
                            notifications.forEach(function(notification){
                                if(notification.notifyType === 'team_invite' ) notify_Data += '<a href="'+app_url+"accept-invitation"+'" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                                else if( notification.notifyType === 'team_decline' || notification.notifyType === 'team_accept') notify_Data += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                                else if(notification.notifyType === 'team_removeTeamMember') notify_Data += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Member Removed</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">' + notification.notificationMessage + '</p> </a>'
                            });
                            $("#notifications").append(notify_Data);
                            notify_Data = '';
                        } else ;
                    }

                },
                error:function(error){
                    console.log(error)
                }
            })

        }


        //get team notifications
        function getAllTeamNotifications(pageId){
            $.ajax({
                type: 'get',
                url: "/get-all-team-notification?pageId="+pageId,
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    if(((response["notifications"] != '' || response['notifications'].length >0) && response["code"] != 500)){
                        var notifications = response['notifications'];
                        if (response.code == 200) {
                            teamPageId++;
                            $("#bootLoader").css("display","none");
                            if(response['notifications'].length == 0) actionTeam = "active";
                            else actionTeam = "inactive";
                            notifications.forEach(function(notification){
                                if(notification.notifyType === 'publish_publishPosts'){
                                    notificationPublish = notification.notificationMessage;
                                    var result = notificationPublish.split(",");
                                    var link = notificationPublish.split('"');
                                    var publishedUrl = link[1];
                                    notify_Data += '<a href="'+publishedUrl+'" class="list-group-item list-group-item-action p-2" target="_blank"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Published</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+result[0]+'<br>'+result[1]+'<br>'+result[2]+'</p> </a>'
                                }
                                else if(notification.notifyType === 'team_addProfile') notify_Data += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                                else if( notification.notifyType === 'team_deleteTeamSocialProfile') notify_Data += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                                else if(notification.notifyType === 'team_leave') notify_Data += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Left Team</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">' + notification.notificationMessage + '</p> </a>'
                            });
                            $("#notifications").append(notify_Data);
                            notify_Data = '';
                        } else ;
                    }

                },
                error:function(error){
                    console.log(error)
                }
            })

        }

        // infinite scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.9 ) {

                if(actionUser == "inactive"){
                    actionUser = "active";
                        getAllUserNotifications(userPageId);
                }
                if(actionTeam == "inactive"){
                    actionTeam = "active";
                        getAllTeamNotifications(teamPageId);
                }
            }
        });

    </script>
@endsection
