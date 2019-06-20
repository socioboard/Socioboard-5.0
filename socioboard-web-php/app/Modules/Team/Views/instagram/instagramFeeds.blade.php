@extends('Team::instagram.InstagramMaster')
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
    @include('Discovery::incPostModal')
    @endsection
@section('script')
    @include("Discovery::incLinkPostJs")
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
                    console.log(response);
                    /*
                     * 200 => success
                     * 201 => no post
                     * 400 => error
                     * 500 => exception*/
                    if(response.code == 200){
                        pageId1 += 1;
                        console.log("inc after succ ================"+pageId1);
                        $("#bootLoader").css("display","none");
                        if(response.data.length == 0){
                            action = "active";
                        }else{
                            action = "inactive";

                        }
                        $(".CommentInput").css('display', 'none');

                        $.each(response.data, function(key,value){
console.log()



                            instafeeds += '<div class="card border-0 mb-2"><div class="col-12 dropleft text-right insta_resocio resocio" style="">' +
                                    '<span class="dropdown-toggle dropdown-toggle-none-c re-socio-span" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="fas fa-angle-down"></i> </span>' +
                                    '<div class="dropdown-menu p-0"> <div class="dropdown-item" data-toggle="modal" data-target="#postModal"> ' +
                                    '<span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content.">' +
                                    ' <i class="fas fa-retweet text-primary"></i> re-socio </span> </div> </div> </div>' +

                                    '<input class="multiImages" value=' + value.permalink + ' style="display: none"><p class="messageSocio" style="display: none">'+ value.captions+'</p>  '+

                                    '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="'+value.permalink+'" ' +
                                    '<div> <a href="'+value.permalink+'" target="_blank"> </a></div>' +
                                    '</blockquote><script async src="//www.instagram.com/embed.js"><//script>  </div>' ;
                            console.log(instafeeds)
                            $("#instaFeeds").append(instafeeds);
                            instafeeds ="";
                            console.log("===================")

                        });

                        $(".CommentInput").css('display', 'none');

                    }else if(response.code == 201){

                    }else if(response.code == 400){

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

    </script>
    @endsection