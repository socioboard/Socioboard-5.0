@extends('Team::instagram.instagramMaster')
@include('Team::dashboard.incHead')
@section('style')
    <style type="text/css">
        .insta_resocio{
            margin-top: 5px;

            right: -34px;
        }
        .insta_resocio .re-socio-span{
            background-color: #c32aa3;
            padding: 9px 5px 3px 5px;
            color: #fff;
        }
    </style>
    
    @endsection
<?php
//for socket getting teams id
$data = Session::get('team')['teamSocialAccountDetails'];
foreach($data as $team){
    $teamId[] = $team[0]->team_id;
}
$value = json_encode($teamId);

//gettting current team id
$teamId =Session::get('currentTeam')['team_id'];

?>
<input type="hidden" id="userID" value={{session()->get('user')['userDetails']->user_id}} />
<input type="hidden" id="teamSocket" value="{{$value}}" />
<input style="display:none" id="teamId" value="{{$teamId}}">
<input style="display: none" id="planInput" value="{{session()->get('user')['userDetails']->Activations->user_plan}}" >

@section('profile')
    <div class="container margin-top-60">
        <div class="row margin-top-10">
            <div class="col-md-12">
                <h4>Instagram Business feeds</h4>
            </div>
        </div>

        <div class="row ">
            <!-- instagram profile-->
            <div class="col-md-4">
                <div class="shadow mb-5 bg-white inst-card rounded">
                    <div class="card-body">
                <span class="card_social_ribbon">
                  <i class="fab fa-instagram"></i>
                </span>
                        <div class="text-center">
                            @if($profileData->profile_pic_url == "")
                                <img class="rounded-circle avatar_100 mb-2" src="{{env('APP_URL')}}assets/imgs/user-avatar.png" alt="Profile Data"/>
                                @else
                                <img class="rounded-circle avatar_100 mb-2" src="{{$profileData->profile_pic_url}}" alt="Profile Data"/>
                                @endif

                            <h5 class="card-title no-space">{{$profileData->first_name}}</h5>
                            {{--<p class="card-text">Design is a FUNNY word !!</p>--}}
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="text-center">
                                    <h5>{{$instagramStats->followed_by_count}}</h5>
                                    <h6>Follower</h6>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="text-center">
                                    <h5>{{$instagramStats->follow_count}}</h5>
                                    <h6>Following</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        <a href="{{env('APP_URL')}}report/{{$profileData->account_id}}/{{$profileData->account_type}}" class="btn btn-outline-dark col-md-12 margin-top-10">View Reports</a>
                    </div>
                </div>
            </div>

            <div class="col-md-8 margin-bottom-50">
                <!-- instagram fedds -->
                <div class="fb_feeds_div"  id="instaFeeds">
                    <!-- using embedded -->



                </div>
                <div class="d-flex justify-content-center" >
                    <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('Team::dashboard.incPostModal')
    @endsection
@section('script')
    <script>
        $('.CommentInput').css('display','none');
        var insid = "<?php echo $account_id; ?>";
        var pageId1 = 1;
        var action = "inactive";
        if(action=='inactive')
        {
            action ="active";
            getInstafeeds(insid,pageId1);
        }
        var currentvid =0;
        var currentvidi="";

        var instafeeds ="";

        function  getInstafeeds(accountId, pageId){

            $.ajax({
                type: "POST",
                url: "/get-instagram-business-post",
                data:{
                    accountId: accountId,
                    pageId: pageId

                },
                beforeSend: function(){
                    $("#bootLoader").css("display","block");

                },
                cache: false,
                success: function(response){
                    /*
                     * 200 => success
                     * 201 => no post
                     * 400 => error
                     * 500 => exception*/
                    if(response.code == 200){
                        pageId1 += 1;
                        $("#bootLoader").css("display","none");
                        if(response.data.length == 0){
                            action = "active";
                        }else{
                            action = "inactive";

                        }
                        $(".CommentInput").css('display', 'none');

                        $.each(response.data, function(key,value){
                            instafeeds += '<div class="card border-0 mb-2"><p style="display: none" class="insta-caption"  id="'+value.captions+'"></p><p style="display: none" class="insta-mediaUrl"  id="'+value.mediaUrls+'"></p><div class="col-12 dropleft text-right insta_resocio    " style="">' +
                                    '<span class="dropdown-toggle dropdown-toggle-none-c re-socio-span " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="fas fa-angle-down"></i> </span>' +
                                    '<div class="dropdown-menu p-0"> <div class="dropdown-item" data-toggle="modal" data-target="#incpostModal"> ' +
                                    '<span class="resocio_btn" data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content.">' +
                                    ' <i class="fas fa-retweet text-primary "></i> re-socio </span> </div> </div> </div>' +

                                    '<input class="multiImages" value=' + value.permalink + ' style="display: none"><p class="messageSocio" style="display: none">'+ value.captions+'</p>  '+

                                    '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="'+value.permalink+'" ' +
                                    '<div> <a href="'+value.permalink+'" target="_blank"> </a></div>' +
                                    '</blockquote><script async src="//www.instagram.com/embed.js"><//script>  </div>' ;
                            $("#instaFeeds").append(instafeeds);
                            instafeeds ="";
                        });

                        $(".CommentInput").css('display', 'none');

                    }else if(response.code == 201 && response.data == ""){
                        $("#bootLoader").css("display","none");
                        $("#instaFeeds").append("No Feeds...");

                    }else if(response.code == 400){
                        $("#instaFeeds").append(response.message);
                    }else{
                        console.log(response);
                    }

                },
                error: function (error) {
                    console.log(error);
                }
            });
        }
        //scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() >= $("#instaFeeds").height() && action == 'inactive' ) {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
                action = 'active';

                setTimeout(function () {
                    getInstafeeds(insid,pageId1);
                }, 1000);
            }else{
                $("#bootLoader").css("display","none");
            }
        });


        $(document).on('click', '.resocio_btn', function () {
            $('.clearimag').remove();
            $('.post-thumb').remove();
//            var appenddata = "";
            var msg = "";
            msg = $(this).closest('.card').find('.insta-caption').attr('id');
            imageLink = $(this).closest('.card').find('.insta-mediaUrl').attr('id');
//            var img = imageLink.split(',');
//            if (imageLink !== '') {
//                for (i = 0; i < img.length; i++) {
//                    appenddata += "<li class='clearimag' ><img width='100px' height='100px' src='" + img[i] + "' " +
//                            "title='" + img[i] + "' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' ></i></a><div></div></div>";
//                }
//                $('#media-list').prepend(appenddata);
//            }
            $('#normal_post_area').data("emojioneArea").setText(msg);
            $("#link").attr("value", imageLink);

//            $('#reimage').attr('src', imageLink);

            $('#incpostModal').modal('show');

        });

        function post(postStatus) {
            var form = document.getElementById('publishForm');

            var formData = new FormData(form);


            var selected = [];
            $('#checkboxes input:checked').each(function () {
                selected.push($(this).attr('name'));
            });
            formData.append('checked', selected);
//            formData.append('imagevideos', image);
            formData.append('postStatus', postStatus);

            $.ajax({
                url: "/publish-data-discovery",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend: function () {
//                    $('#messageError').text("");
//                    if (postStatus == 1) {
//                        $('#test').show();
//                        $('#testText').html('Uploading');
//                    } else if (postStatus == 0) {
//                        $('#draftspinstyle').show();
//                        $('#draftspin').html('Uploading');
//                    }
                    $('#messageError').text("");
                    $('#test').show();
                    $('#testText').html('Uploading');
                },
                success: function (response) {

                    $('#test').hide();
                    $('#testText').html('Post');

//                document.getElementById("publishForm").reset();
                    $('#publishForm').trigger("reset");
//                        $(".emojionearea-editor").text("");
                    $("#hint_brand").css("display", "none");
//                        $("#option_upload").css("display","block");
                    $("#test").attr("disabled", true);
                    if (response.code == 404) {
//                        console.log(response.message)
                        $('#messageError').text(response.message);
                    } else if (response.code == 400) {
                        swal(response.message);
                    } else if (response.code == 200) {
                        $(".emojionearea-editor").text("");
                        swal(response.message);

                        if (response.errors.length != 0) {
                            $.each(response.errors, function (key, value) {
                                console.log(value.error);
                                $.toaster({
                                    priority: 'warning',
                                    title: 'Could not publish on account',
                                    message: ' ' + value.firstName + ' ' + value.error
                                })
                                ;
                            });
                        }

                        document.getElementById("publishForm").reset();
                        $('#incpostModal').modal('hide');
                    } else if (response.code == 500) {
                        console.log(response.message);
                        swal("Something went wrong... Please try again after sometime")
                        $('#incpostModal').modal('hide');

                    }
                },
                error: function (error) {
                    console.log(error)
                    swal("Something went wrong... Please try again after sometime")
                    $('#incpostModal').modal('hide');
                }
            })
        }

    </script>
    <!-- Google Analytics -->
    <script>
        var email = document.getElementById("ga_email").value;
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
        ga('create', 'UA-145069111-1', 'auto', {
            'name': 'instBizFeeds'
        });
        ga('instBizFeeds.send', 'pageview');
        ga('instBizFeeds.send', 'event', {
            'eventCategory': 'View-Feeds',
            'eventAction': 'Instagram-Business-Feeds',
            'eventLabel': email
        });
    </script>
    <script async src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->
@endsection