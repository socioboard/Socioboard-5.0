@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery twitter</title>
@endsection

@section('style')
    <link rel="stylesheet" type="text/css"
          href="/assets/plugins/bootstrap-select/dist/css/bootstrap-select.min.css">
    <style type="text/css">
        .video_twitter {
            position: relative;
            display: block;
            width: 100%;
            padding: 0;
            overflow: hidden;
        }

        .video_twitter::before {
            display: block;
            content: "";
        }

        .video_width_full {
            width: 100%;
        }

        .twitter_title {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 5px;
        }

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

        .twt_resocio_btn{
            margin-top: 9px;
            position: absolute;
            right: 0;
            z-index: 99;
            background-color: #1da1f2;
            padding: 5px;
            color: #fff;
        }
    </style>

@endsection


@section('twitterDiscovery')
    <div class="container margin-top-60">
        <div class="row margin-top-10">
            <div class="col-md-12">
                <h4>twitter</h4>
            </div>
        </div>

        <div class="row">
            <div class="col-md-8">
                <div class="card bg-light border-0 shadow">
                    <div class="card-body">
                        <form class="form-inline mb-2" id="twitterForm">
                            <label class="sr-only" for="twitter_search">Keyword</label>
                            <input type="text" class="form-control col-9 border-0 rounded-pill" id="twitter_search"
                                   placeholder="keyword">
                            <div class="text-center col-3">
                                <button type="submit" class="btn btn-primary col-12 rounded-pill">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div  id="tweet">
                    {{--twitter feeds--}}

                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow">
                    <h5 class="card-header"><b>Country trends</b>
                        <a href="javascript:void(0);" data-toggle="modal" data-target="#trendsSettingsModal"><i
                                    class="fas fa-cog text-primary float-right"></i></a>
                    </h5>
                </div>
                <div id="trends">

                </div>
            </div>
        </div>
    </div>


    <!-- Trends setting modal -->
    <div class=" modal" id="trendsSettingsModal" tabindex="-1" role="dialog"
         aria-labelledby="trendssettingsModalLabel" aria-hidden="true">
        <div class="modal-dialog  modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Trends</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row p-0">
                        <div class="col-md-12">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="trends_check">
                                <label class="custom-control-label" for="trends_check"
                                       aria-describedby="trendsHelp">Trends for you</label>
                                <small id="trendsHelp" class="form-text text-muted">Personalize
                                    trends based on your
                                    location and who you follow.
                                </small>
                            </div>
                            <div class="form-group mt-2 country_list_div">
                                <label for="exampleFormControlSelect1">Change location</label>
                                <select class="form-control selectpicker countrypicker" data-live-search="true"
                                        data-default="United States" data-flag="true"></select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    @include('Discovery::incPostModal')

    @endsection


    @section('script')


            <!-- country picker -->
    <script src="/assets/plugins/bootstrap-select/js/bootstrap-select.js"></script>
    <script src="/assets/plugins/country-picker/js/countrypicker.js"></script>

    <script>
        //for GA
        var eventCategory = 'Content-Studio';
        var eventAction = 'Twitter';
        var val=[];
        var result=[];
        var image;

        $(document).ready(function() {
            $(document).on('click', '.twt_resocio_btn', function () {
                $('.clearimag').remove();
                $('.post-thumb').remove();
                var appenddata = "";
                var msg = "";
                msg = $(this).closest('.card').find('.tweet-details').text();
                image = $(this).closest('.card').find('.tweet-media-url').text();
                tweetUrl = $(this).closest('.card').find('.tweet-url').text();
//                var image = $(this).closest('.card').find('img').attr('src');
//                var image = $('a').hasClass('MediaCard-borderOverlay').show();
//                val = $(this).closest('.card').find('input').val();
//                result = val.split(',');
                console.log("Image==",image);
                appenddata += "<li class='clearimag' ><img width='100px' height='100px' src='" + image + "' " +
                            "title='" + image + "' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";

                $('#normal_post_area').data("emojioneArea").setText(msg);

                $('#media-list').prepend(appenddata);

                $('#reimage').attr('src', image);

                $('#incpostModal').modal('show');


            });


            $('body').on('click', '.remove-pic', function () {
                $(this).parent().parent().parent().remove();
                var removeItem = $(this).attr('data-id');
                var yet = names.indexOf(removeItem);
                if (yet != -1) {
                    names.splice(yet, 1);
                }
                // return array of file name
            });
            $('#hint_brand').on('hide', function (e) {
                names = [];
                z = 0;
            });
        })

        function post(postStatus) {
            var form = document.getElementById('publishForm');

            var formData = new FormData(form);

            var selected = [];
            $('#checkboxes input:checked').each(function () {
                selected.push($(this).attr('name'));
            });
            var selectedBoards = [];
            $('#boardsCheckbox input:checked').each(function() {
                selectedBoards.push($(this).attr('name'));
            });
            formData.append('selectedBoards',selectedBoards);
            formData.append('checked', selected);
            formData.append('imagevideos', image);
            formData.append('postStatus', postStatus);


            $.ajax({
                url: "/publish-data-discovery",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend: function () {
                    $('#messageError').text("");
                    if (postStatus == 1) {
                        $('#test').show();
                        $('#testText').html('Uploading');
                    } else if (postStatus == 0) {
                        $('#draftspinstyle').show();
                        $('#draftspin').html('Uploading');
                    }
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
                        $('#postModal').modal('hide');
                    } else if (response.code == 500) {
                        console.log(response.message);
                        swal("Something went wrong... Please try again after sometime")
                        $('#postModal').modal('hide');

                    }
                },
                error: function (error) {
                    console.log(error)
                    swal("Something went wrong... Please try again after sometime")
                    $('#postModal').modal('hide');
                }
            })
        }




    </script>
    <script >
        getTwitter("a");
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


        // country trend show/hide
        $("#trends_check").click(function () {
            if ($(this).is(":checked")) {
                $(".country_list_div").hide();
                getTrends("mine");
            } else {
                $(".country_list_div").show();
                var selectpicker = $('#selectpicker').find(":selected").text();
                alert(selectpicker)
                alert(selectpicker)

            }
        });

        $('.countrypicker').on('change', function (e) {
            var selectpicker = $('.countrypicker').find(":selected").text().slice(-2);
            getTrends(selectpicker);
        });


        function getTrends(country){
            var trends='';
            $.ajax({
                url: "/getTrends",
                type: 'POST',
                data: {
                    country:country
                },
                beforeSend:function(){
                    $("#trends").children().remove();
                },
                success: function (response) {


                    if(response.code == 200){
                        $('#trendsSettingsModal').modal('hide');
                        $.each(response.trends, function(key1,value1) {
                            trends += '<div  class="list-group-item list-group-item-action"><h6 class="keyword_font">'+ value1.title +'</h6> <p class="trending_text">'+value1.tweetCount+'  tweets</p></div>'
                        });
                        $("#trends").append(trends);
                    }else if(response.code == 400 || response.code == 500){
//                        console.log(response.message)
                    }
                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        function getTwitterSearch(data){
            var tweetData = "";
            $.ajax({
                url: "/getTwitterSearch",
                type: 'POST',
                data: {
                    Keyword:data,
                },
                beforeSend:function(){
                    $("#tweet").children().remove();
                },
                success: function (response) {
                    if(response.code == 200){
                        $.each(response.tweets, function(key,value) {
                            var tweetDetails = value.tweetDetails;
                            var tweetMediaUrl =  value.tweetMediaUrl ;
                            var tweetUrl = value.tweetUrl;


                            tweetData = '<div class="card mb-1"><p style="display: none" class="tweet-details">'
                                    +tweetDetails+'</p><p style="display: none" class="tweet-media-url">'+tweetMediaUrl+'' +
                                    '</p><p style="display: none" class="tweet-url">'+tweetUrl+'</p>' +
                                    '<div class="dropleft float-right twt_resocio_btn"> ' +
                                    '<span class="dropdown-toggle dropdown-toggle-none-c" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                    ' <i class="fas fa-angle-down"></i> </span> <div class="dropdown-menu p-0">' +
                                    ' <div class="dropdown-item" data-toggle="modal" data-target="#postModal"> ' +
                                    '<span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> ' +
                                    '<i class="fas fa-retweet text-primary"></i> re-socio </span> </div></div> </div><blockquote class="twitter-tweet"> ' +
                                    '<div id="container"></div> "'+ value.tweetDetails+'" <a href="'+ value.tweetUrl +'"></a> </blockquote></div> ' +
                                    '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><//script>'
                            $("#tweet").append(tweetData);
                        });
                    }else if(response.code == 400 || response.code == 500){
//                        console.log(response.message)
                    }
                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }


        //            function resocio(){
        ////                debugger;
        ////              var i = $(this).closest('.card').find('img').attr('src');
        //            }

        function getTwitter(keyword){
            var tweetData = "";
            var trends = "";
            $.ajax({
                url: "/getTwitter",
                type: 'POST',
                data: {
                    keyword:keyword,
                    pageId: 1
                },
                beforeSend:function(){

                    $("#tweet").children().remove();
                    $("#trends").children().remove();
                },
                success: function (response) {


                    if(response.code == 200){
                        $.each(response.tweets, function(key,value) {
                            var tweetDetails = value.tweetDetails;
                            var tweetMediaUrl =  value.tweetMediaUrl ;
                            var tweetUrl = value.tweetUrl;
                            tweetData = '<div class="card mb-1"><p style="display: none" class="tweet-details">'+tweetDetails+'</p><p style="display: none" class="tweet-media-url">'+tweetMediaUrl+'</p><p style="display: none" class="tweet-url">'+tweetUrl+'</p><div class="dropleft float-right twt_resocio_btn"> <span class="dropdown-toggle dropdown-toggle-none-c" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> <i class="fas fa-angle-down"></i> </span> <div class="dropdown-menu p-0"> <div class="dropdown-item resocio" data-toggle="modal" data-target="#postModal"><span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span></div></div> </div><blockquote class="twitter-tweet"> <div id="container"></div> "'+ value.tweetDetails+'" <a href="'+ value.tweetUrl +'"></a> </blockquote></div> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"><//script>'
                            $("#tweet").append(tweetData);
                        });
                        $.each(response.trends, function(key1,value1) {
                            trends += '<div  class="list-group-item list-group-item-action"><h6 class="keyword_font">'+ value1.title +'</h6> <p class="trending_text">'+value1.tweetCount+'  tweets</p></div>'
                        })

                        $("#trends").append(trends);
                    }else if(response.code == 400 || response.code == 500){
//                        console.log(response.message)
                    }
                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        $(document).ready(function(){
            $(document).on('submit','#twitterForm',function(e){
                e.preventDefault();
                var data = $('#twitter_search').val();

                if(data == ""){
                    swal("Please enter valid input");
                }else {
                    pageId1 = 1
                    getTwitterSearch(data);}

            });
        });





    </script>
@endsection
