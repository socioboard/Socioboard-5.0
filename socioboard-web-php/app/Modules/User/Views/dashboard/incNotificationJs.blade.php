
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>

<script>
    var notify_count = 0;
    var notifyData = "";

    var userPageID = 1;
    var teamPageID = 1;
    var userAction = "inactive";
    var teamAction = "inactive";

    if(userAction == "inactive"){
        userAction = "active";
        getUserNotification(userPageID);
    }
    if(teamAction == "inactive"){
        teamAction = "active";
        getTeamNotification(teamPageID);
    }

    app_url = '<?php echo env("APP_URL");?>';
    var teamId = $('#teamId').val();
    var teamActive = document.getElementById(teamId);
//    teamActive.setAttribute('class', 'dropdown-item active');
    var socketUrl = "<?php echo env('API_URL_NOTIFY');?>";
    socket = io.connect(socketUrl);

    var userId = $('#userID').val();
    var team = $('#teamSocket').val();

    //on connect
    socket.on('connect', function() {
        console.log("User has been Connected..");
        var details = {
            userId: userId,
            teamIds: team
        };
        socket.emit('subscribe', details);
    });
    function unsubscribe(team) {
        socket.emit('teamUnsubscribe', team);
    }

    //on disconnect
    socket.on('disconnect', function() {
        console.log('User Disconnected..');
    });


    //on notification
    socket.on('notification', function(messge) {
        if(notifyData !== '') notifyData = '';
        notify_count++;

        //for system time
        var today = new Date();
        var systemTime = today.getHours()+":"+today.getMinutes();
        let utime = (messge.dateTime.split(".")[0]);
        let newDate = new Date(messge.dateTime.split(".")[0]).getTime();
        var currentdate = Date.now();
        var res = Math.abs(newDate - currentdate) / 1000;
        var days = Math.floor(res / 86400);
        if(messge.notifyType === 'team_invite' ) notifyData += '<a href="'+app_url+"accept-invitation"+'" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">just now</small></div> <p class="mb-1 notification_desc">'+messge.notificationMessage+'</p> </a>'
        else if( messge.notifyType === 'team_decline' || messge.notifyType === 'team_accept') notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">just now</small></div> <p class="mb-1 notification_desc">'+messge.notificationMessage+'</p> </a>'
        else if(messge.notifyType === 'publish_publishPosts'){
            notificationPublish = messge.notificationMessage;
            var result = notificationPublish.split(",");
            var link = notificationPublish.split('"');
            var publishedUrl = link[1];
            notifyData += '<a href="'+publishedUrl+'" class="list-group-item list-group-item-action p-2" target="_blank"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Published</h6> <small class="text-muted">'+messge.DateTime+'</small></div> <p class="mb-1 notification_desc">'+result[0]+'<br>'+result[1]+'<br>'+result[2]+'</p> </a>'

            //GA
            window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
            ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
                'name': 'event'
            });
            ga('event.send', 'pageview');
            ga('event.send', 'event', {
                'eventCategory': 'Publish',
                'eventAction': messge.notifyType+'('+publishedUrl+')',
                'eventLabel': '{{session('user')['userDetails']->email}}'
            });
        }
        else if(messge.notifyType === 'team_addProfile' || messge.notifyType === 'team_deleteTeamSocialProfile'){
            if(days == 0)  notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">just now</small></div> <p class="mb-1 notification_desc">'+messge.notificationMessage+'</p> </a>'
            else if(days == 1) notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">'+days+' day ago</small></div> <p class="mb-1 notification_desc">'+messge.notificationMessage+'</p> </a>'
            else notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">'+days+' days ago</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
            //GA
            window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
            ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
                'name': 'event'
            });
            ga('event.send', 'pageview');
            ga('event.send', 'event', {
                'eventCategory': 'Add-Social-Profile',
                'eventAction': messge.notifyType+'('+messge.notificationMessage+')',
                'eventLabel': '{{session('user')['userDetails']->email}}'
            });
        }

        else if(messge.notifyType === 'team_leave' ) {
            if (days == 0)  notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Left Team</h6> <small class="text-muted">just now</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
            else if(days ==1) notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Left Team</h6> <small class="text-muted">'+days+' day ago</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
            else notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Left Team</h6> <small class="text-muted">'+days+' days ago</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
        }
        else if(messge.notifyType === 'team_removeTeamMember'){
            $.ajax({
                type: 'get',
                url: "/login"
            })
            if (days == 0)  notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Member Removed</h6> <small class="text-muted">just now</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
            else if(days ==1) notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Member Removed</h6> <small class="text-muted">'+days+' day ago</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
            else notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Member Removed</h6> <small class="text-muted">'+days+' days ago</small></div> <p class="mb-1 notification_desc">' + messge.notificationMessage + '</p> </a>'
        }
        $("#notify").prepend(notifyData);
        if(notify_count) $(".badge-noti-count").text(notify_count);
        notifyData = '';
    });
    //get user notifications
    function getUserNotification(pageId){
        if(notifyData !== '') notifyData = '';
        $.ajax({
            type: 'get',
            url: "/get-user-notification?pageId="+pageId,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                if(((response["notifications"] != '' || response['notifications'].length >0) && response["code"] != 500)){
                    notify_count = notify_count + response['notifications'].length ;
                    var notifications = response['notifications'];
                    if (response.code == 200) {
                        userPageID++;
                        if(response['notifications'].length == 0) userAction = "active";
                        else userAction = "inactive";
                        notifications.forEach(function(notification){
                            if(notification.notifyType === 'team_invite' ) notifyData += '<a href="'+app_url+"accept-invitation"+'" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                            else if( notification.notifyType === 'team_decline' || notification.notifyType === 'team_accept')  notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Invitation</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                            else if( notification.notifyType === 'team_removeTeamMember') notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Member Removed</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                        });
                        $("#notify").append(notifyData);
                        if(notify_count) $(".badge-noti-count").text(notify_count);
                        notifyData = '';
                    } else ;
                }else notify_count = 0 ;

            },
            error:function(error){
                console.log(error)
            }
        })

    }



    //get team notification
    function getTeamNotification(pageId){

        $.ajax({
            type: 'get',
            url: "/get-team-notification?pageId="+pageId,
            cache: false,
            processData: false,
            contentType: false,
            success: function (response) {
                if(((response["notifications"] != '' || response['notifications'].length >0) && response["code"] != 500)){
                    notify_count = notify_count + response['notifications'].length ;
                    var notifications = response['notifications'];
                    if (response.code == 200) {
                        teamPageID++;
                        if(response['notifications'].length == 0) teamAction = "active";
                        else teamAction = "inactive";
                        notifications.forEach(function(notification){
                            if(notification.notifyType === 'publish_publishPosts') {
                                notificationPublish = notification.notificationMessage;
                                var result = notificationPublish.split(",");
                                var link = notificationPublish.split('"');
                                var publishedUrl = link[1];
                                notifyData += '<a href="'+publishedUrl+'" class="list-group-item list-group-item-action p-2" target="_blank"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Published</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+result[0]+'<br>'+result[1]+'<br>'+result[2]+'</p> </a>'
                            }
                            else if(notification.notifyType === 'team_addProfile' || notification.notifyType === 'team_deleteTeamSocialProfile')notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Team Profiles</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                            else if(notification.notifyType === 'team_leave') notifyData += '<a href="#" class="list-group-item list-group-item-action p-2"> <div class="d-flex w-100 justify-content-between"><h6 class="mb-1 notification_title">Left Team</h6> <small class="text-muted">'+notification.dateTime+'</small></div> <p class="mb-1 notification_desc">'+notification.notificationMessage+'</p> </a>'
                        });
                        $("#notify").append(notifyData);
                        notifyData = '';
                        if(notify_count) $(".badge-noti-count").text(notify_count);
                    } else ;
                }else notify_count = 0 ;

            },
            error:function(error){
                console.log(error)
            }
        })

    }

    // infinite scroll
    function functionNotify (x) {
        if (x.offsetHeight + x.scrollTop == x.scrollHeight) {
            if (userAction == "inactive") {
                userAction = "active";
                getTeamNotification(userPageID);
            }
            if (teamAction == "inactive") {
                teamAction = "active";
                getTeamNotification(teamPageID);
            }

        }
    }
    //decrement notify_count
    function dec_notify(){
        notify_count = 0;
        $(".badge-noti-count").text('');
    }


</script>
<script async src='https://www.google-analytics.com/analytics.js'></script>
