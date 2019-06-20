@extends('Team::youtube.YoutubeMaster')
@section('style')
    <style type="text/css">
        .keyword_font {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 0;
            color: #14171a;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_text {
            margin-bottom: 0;
            color: #616c77;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_img_post {
            display: flex;
            flex-wrap: nowrap;
        }
        .visited {
            opacity: 0.25
        }
    </style>
    @endsection
@section('profile')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>YouTube </h4>
        </div>
    </div>

    <div class="row ">
        <!-- instagram profile-->
        <div class="col-md-4">
            <div class="shadow mb-5 bg-white yt-card rounded">
                <div class="card-body">
                <span class="card_social_ribbon">
                    <i class="fab fa-youtube"></i>
                </span>
                    <div class="text-center">
                        <img class="rounded-circle avatar_100 mb-2" src="{{$profileData->profile_pic_url}}" alt="No profile"/>
                        <h5 class="card-title no-space"> {{$profileData->first_name}}</h5>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="text-center">
                                <h5>{{$profileData->updatedDetails->subscription_count}}</h5>
                                <h6>Subscription count</h6>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-center">
                                <h5>{{$profileData->updatedDetails->total_post_count}}</h5>
                                <h6>Posts</h6>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <a href="{{env('APP_URL')}}report/{{$account_id}}/{{$account_type}}" class="btn btn-outline-dark col-md-12 margin-top-10">View Reports</a>
                </div>
            </div>
        </div>

        <div class="col-md-8 margin-bottom-50">
            <!-- youtube fedds -->
            <div class="yt_feeds_div" id="youtubeFeeds">

            </div>
        </div>
        <div class="d-flex justify-content-center" >
            <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
                <span class="sr-only">Loading...</span>
            </div>
        </div>

    </div>

    @include('Discovery::incPostModal')
    @endsection


@section('script')
    @include("Discovery::incYoutubepostJs")
    <script>
        var Ytid = "<?php echo $account_id; ?>";
        var pageId1 = 1;
        var action = "inactive";
        if(action=='inactive')
        {
            action ="active";
            getYoutubefeeds(Ytid,pageId1);
        }
      var currentvid =0;
        var currentvidi="";

        var youtubefeeds ="";

        function  getYoutubefeeds(accountId, pageId){

            $.ajax({
                type: "POST",
                url: "/get-youtube-post",
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
                        $.each(response.data, function(key,value){
                            youtubefeeds += '<div class="card border-0 shadow mb-2"> <div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="'+value.embed_url+'" allowfullscreen></iframe> </div> <div class="card-body p-1"> <h5 class="mt-0 mb-0"> <span class="keyword_font">'+value.title+'</span> </h5> <p class="messageSocio">'+value.description+'</p> <p class="card-text"><small class="text-muted">Published on '+value.createdDate.split("T")[0]+'</small></p> <div class="row text-center"> <div class="col-md-3"> ' +
                                    '<a  id="'+value.videoId+'like" onclick = "likeDislike(\'' + value.videoId + '\', 1)" class="text-dark" data-toggle="tooltip" data-placement="top" title="I like this"> <i class="far fa-thumbs-up"></i> <span></span> </button> </div> ' +
                                    '<div class="col-md-3"> <a id="'+value.videoId+'dislike" onclick="likeDislike(\'' + value.videoId + '\', 0)" class="text-dark" data-toggle="tooltip" data-placement="top" title="I dislike this"> <i class="far fa-thumbs-down"></i> <span></span> </a> </div> ' +
                                    '<div class="col-md-3"> <a onclick="return toggleComment(\'' + value.videoId + '\')"  class="text-dark yt_cmt_btn" > <i class="far fa-comment-alt"></i> Comments </a> </div> ' +
                                    '<div class="col-md-3"> <a  class="text-dark resocio" data-toggle="modal" data-target="#postModal" > ' +
                                    '<span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content." > <i class="fas fa-retweet text-primary"></i> re-socio </span> </a> </div> </div> ' +
                                    '<div class="yt_cmt_div" id='+value.videoId+' > <hr class="m-1" /> ' +
                                    '<div class="media p-2"> <input class="multiImages" value=' + value.embed_url + ' style="display: none">' +
                                    '<img class="rounded-circle mr-3 pp_50" src=<?php echo $profileData->profile_pic_url ?> alt="ChanchalSantra" /> <div class="media-body"> <div class="mt-2 mb-0"> <input type="text" name="comment" class="form-control rounded-pill yt-comment" id="'+value.videoId+'yt" placeholder="Type your comments" /> </div> </div> </div> </div> </div> </div>';
                        });
                        $("#youtubeFeeds").append(youtubefeeds);
                        $(".yt_cmt_div").css('display', 'none');

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
            if ($(window).scrollTop() + $(window).height() >= $("#youtubeFeeds").height() && action == 'inactive' ) {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
                action = 'active';

                setTimeout(function () {
                    getYoutubefeeds(Ytid,pageId1);
                }, 1000);
            }else{
                $("#bootLoader").css("display","none");
            }
        });
        // yt comments div open
        function toggleComment(idi){

            $("#"+idi).toggle();
            currentvid = idi
        }

        function likeDislike(vid, action,comment){
            //action 1=> like 0=> dislike 2=> comment
            var idaction = "";
            if(action == 1){
                idaction =vid+"like";
                console.log();
            }else if(action == 0){
                idaction =vid+"dislike";
            }
            if(action == 1 || action == 0){
                $('#'+idaction).addClass('visited').attr("onclick","return false");
            }

            $.ajax({
                type: "POST",
                url: "/get-youtube-action",
                data:{
                    accountId: Ytid,
                    rating: action,
                    videoId:vid,
                    comment:comment
                },
                beforeSend: function(){

                },
                cache: false,
                success: function(response){
                    swal(response.message);
                    if(action == 2)
                    {
                        $('#'+currentvidi).val('')
                        $("#"+currentvid).toggle();
                    }


                },
                error: function(error){
                    console.log("Youtube action error ========> ");
                    console.log(error);
                }
            });
        }
        // normal post emoji
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // all social list div open
        $(".all_social_div").css({
            display: "none"
        });
        $(".all_social_btn").click(function() {
            $(".all_social_div").css({
                display: "block"
            });
            $(".all_social_btn").css({
                display: "none"
            });
        });

        $(document).on('keypress','.yt-comment',function(e) {
            if(e.which == 13) {
                currentvidi = currentvid+"yt";
                var comment = document.getElementById(currentvidi).value;
                likeDislike(currentvid,2,comment );
            }
        });

    </script>
    @endsection

{{--<div class="card border-0 shadow mb-2"> <div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/XJ8wrLmuGHs?rel=0&showinfo=0&controls=0" allowfullscreen></iframe> </div> <div class="card-body p-1"> <h5 class="mt-0 mb-0"> <span class="keyword_font">Video Title</span> </h5> <p>Lorem ipsum dolor sit amet, in qui justo hendrerit, porro hendrerit eam no.</p> <p class="card-text"><small class="text-muted">Published on Mar 2, 2017</small></p> <div class="row text-center"> <div class="col-md-3"> <a href="javascript:void(0);" class="text-dark" data-toggle="tooltip" data-placement="top" title="I like this"> <i class="far fa-thumbs-up"></i> <span>10</span> </a> </div> <div class="col-md-3"> <a href="javascript:void(0);" class="text-dark" data-toggle="tooltip" data-placement="top" title="I dislike this"> <i class="far fa-thumbs-down"></i> <span>11</span> </a> </div> <div class="col-md-3"> <a href="javascript:void(0);" class="text-dark yt_cmt_btn"> <i class="far fa-comment-alt"></i> Comments </a> </div> <div class="col-md-3"> <a href="javascript:void(0);" class="text-dark" data-toggle="modal" data-target="#postModal" > <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content." > <i class="fas fa-retweet text-primary"></i> re-socio </span> </a> </div> </div> <div class="yt_cmt_div"> <hr class="m-1" /> <div class="media p-2"> <img class="rounded-circle mr-3 pp_50" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg" alt="ChanchalSantra" /> <div class="media-body"> <div class="mt-2 mb-0"> <input type="text" class="form-control rounded-pill" id="post_cmt" placeholder="Type your comments" /> </div> </div> </div> </div> </div> </div>--}}