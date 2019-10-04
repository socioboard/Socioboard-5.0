@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery RSS</title>
@endsection

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
    </style>
@endsection


@section('rssDiscovery')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>RSS</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="card bg-light border-0 shadow">
                <div class="card-body">
                    <form class="form-inline mb-2" id="rssForm">
                        <label class="sr-only" for="rss_search">rss_url</label>
                        <input type="text" class="form-control col-9 border-0 rounded-pill" id="rss_search"
                               placeholder="Enter RSS url">
                        <div class="text-center col-3">
                            <button type="submit" class="btn btn-primary col-12 rounded-pill">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
<p style="color: red" id="rssFeedErrorMessage"></p>
    <div class="card-columns mt-5" id="rss">



    </div>

    <div class="d-flex justify-content-center" >
        <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
            <span class="sr-only">Loading...</span>
        </div>
    </div>


    @include('Discovery::incPostModal')
@endsection


@section('script')
@include("Discovery::incLinkPostJs")
    <script>
        //for GA
        var eventCategory = 'Content-Studio';
        var eventAction = 'RSS-Feeds';

        var data = "http://feeds.bbci.co.uk/news/rss.xml";
        var pageId1 = 1;
        var action = "inactive";
        if(action=='inactive')
        {
            action ="active";
            getRss(data, pageId1,0);
        }
        // normal post emoji
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // all social list div open
        $('.all_social_div').css({
            'display': 'none'
        });
        $('.all_social_btn').click(function () {
            $('.all_social_div').css({
                'display': 'block'
            });
            $('.all_social_btn').css({
                'display': 'none'
            });
        });


        //            function resocio(){
        ////                debugger;
        ////              var i = $(this).closest('.card').find('img').attr('src');
        //            }

        function getRss(keyword,pageId,search){
            var rssData = "";
            $.ajax({
                url: "/getRss",
                type: 'POST',
                data: {
                    keyword:keyword,
                    pageId: pageId
                },
                beforeSend:function(){
                    $("#bootLoader").css("display","block");
                    $('#rssFeedErrorMessage').text("");
                    if(search == 1) {
                        $("#rss").children().remove();
                    }
                },
                success: function (response) {

                    if(response.code == 200){

                        pageId1 += 1;
                        $("#bootLoader").css("display","none");
                        if(response.rssDetails.length == 0){
                            action = "active";
                        }else{
                            action = "inactive";
                        }



                        $.each(response.rssDetails, function(key,value) {
                            if(value.mediaUrl != undefined && value.mediaUrl != "") {

                                var date = value.publishedDate.split('T');
                                var str = value.mediaUrl
                                rssData += ' <div class="card border-0 shadow mt-2"> <div class="card-body p-0"> ' +
                                        '<div class="list-group list-group-flush"> ' +
                                        '<div class="list-group-item list-group-item-action">' +
                                        '<input class="multiImages" value=' + value.mediaUrl + ' style="display: none">' +
                                        '  <div class="media"> <div class="media-body"> <div class="btn-group dropleft float-right"> ' +
                                        '<span class="dropdown-toggle dropdown-toggle-none-c" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                        ' <i class="fas fa-angle-down"></i> ' +
                                        '</span> <div class="dropdown-menu p-0"> ' +
                                        '<div class="dropdown-item resocio" data-toggle="modal" data-target="#postModal"> <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span> </div> <a class="dropdown-item" href="'+ value.mediaUrl +'" target="_blank"> <i class="fas fa-globe-africa text-primary"></i> Show original </a> </div> </div> <h5 class="mt-0 mb-0"> <span class="keyword_font">"'+ value.title +'"</span> </h5> <p class="messageSocio">"'+ value.description +'"</p> <p class="card-text">' +
                                        '<small class="text-muted">'+ date[0] +'  </small></p> </div> </div> </div> </div> </div> </div>';

                            }
                        });

                        $("#rss").append(rssData);
                    }else if(response.code == 400 || response.code == 500){
                        console.log(response.message)
                        $('#rssFeedErrorMessage').text(response.message+". Please enter a RSS Feed");
                        $("#bootLoader").css("display","none");
                    }
                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        $(document).ready(function(){

            $(document).on('submit','#rssForm',function(e){
                e.preventDefault();

                data = $('#rss_search').val();
                if(data == ""){
                    swal("Please enter valid input");
                }else {
                    pageId1 =1
                    getRss(data, pageId1,1);
                }
            });
        });


        // infinite scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() >= $("#rss").height() && action == 'inactive') {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
                action = 'active';

                setTimeout(function () {
                    getRss(data, pageId1,0);
                }, 1000);
            }
        });


    </script>
@endsection