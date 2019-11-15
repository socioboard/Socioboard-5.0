@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery dailymotion</title>
@endsection

@section('style')
    <style type="text/css">
        .video_dailymotion {
            position: relative;
            display: block;
            width: 100%;
            padding: 0;
            overflow: hidden;
        }

        .video_dailymotion::before {
            display: block;
            content: "";
        }

        .video_width_full {
            width: 100%;
        }

        .dailymotion_title {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 5px;
        }
    </style>
@endsection


@section('dailymotion')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>dailymotion</h4>
        </div>
    </div><div class="row">
        <div class="col-md-12">
            <div class="card bg-light border-0 shadow">
                <div class="card-body">
                    <form class="form-inline mb-2" id="dailymotionForm">
                        <div class="form-group col-3">
                            <label for="filter">Filter</label>
                            <select class="form-control col-12" id="filter">
                                <option value="what-to-watch">what-to-watch </option>
                                <option value="recommended">recommended</option>
                            </select>
                        </div>
                        <div class="form-group col-3">
                            <label for="sort_by">Sort by</label>
                            <select class="form-control col-12" id="sort_by">
                                <option value="recent">recent</option>
                                <option value="visited">visited</option>
                                <option value="visited-hour"> visited-hour</option>
                                <option value="visited-today">visited-today</option>
                                <option value="visited-week">visited-week</option>
                                <option value="visited-month">visited-month</option>
                                <option value="relevance">relevance</option>
                                <option value="trending">trending</option>
                                <option value="old">old</option>
                                <option value="live-audience">live-audience</option>
                                <option value="least-visit">least-visit</option>
                                <option value="live-airing-time">live-airing-time</option>
                                <option value="random">random</option>
                            </select>
                        </div>
                        <div class="text-center col-2">
                            <button type="submit" class="btn btn-primary col-12 rounded-pill">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    {{--<div class="row">--}}
        {{--<div class="col-md-12">--}}
            {{--<div class="card bg-light border-0 shadow">--}}
                {{--<div class="card-body">--}}
                    {{--<form class="form-inline mb-2" id="dailymotionForm">--}}
                        {{--<label class="sr-only" for="dailymotion_search">Keyword</label>--}}
                        {{--<input type="text" name="keyword" class="form-control col-9 border-0 rounded-pill"--}}
                               {{--id="dailymotion_search" placeholder="keyword">--}}
                        {{--<div class="text-center col-3">--}}
                            {{--<button type="submit" class="btn btn-primary col-12 rounded-pill">Submit</button>--}}
                        {{--</div>--}}
                    {{--</form>--}}
                {{--</div>--}}
            {{--</div>--}}
        {{--</div>--}}
    {{--</div>--}}
    <div class="d-flex justify-content-center" >
        <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    <div class="card-columns mt-5" id="dailymotion">



    </div>



@include('Discovery::incPostModal')

@endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'Content-Studio';
        var eventAction = 'Dailymotion';


        var val=[];
        var result=[];

        $(document).ready(function(){

//            $(document).on('click','.resocio', function(){
//
//                $('.clearimag').remove();
//                $('.post-thumb').remove();
//                var appenddata="";
//                var msg ="";
//
//
//                var image = $(this).closest('.card').find('img').attr('src');
//                val = $(this).closest('.card').find('.multiImages').val();
//                msg = $(this).closest('.card').find('.messageSocio').text();
//                console.log("message=======>",msg);
//                result = val.split(',')
//                console.log("hdjshd=> ",result)
//                $.each(result, function(key,value) {
//                    if(value.indexOf(".jpg") >= 1){
//                        alert(3333333);
//                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px' src='" + value + "' " +
//                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
//                    }else if(value.indexOf(".mp4") >= 1){
//
//                        appenddata +=  "<li class='clearimag' id='" +key +"'><video autoplay width='100px' height='100px'  src='" + value + "'" +
//                                " id='" +key +"' ></video><div id='" +key +"'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></li>";
//                    }else{
//
//                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px'  src='" + value + "'" +
//                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
//                    }
//                });
//
//                $('#media-list').prepend(appenddata);
//                $('.emojionearea-editor').text(msg);
//
////                        var gg  =$('#appendData').append(  '<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>');
//
////                $('').val(messageInput);
//                $('#reimage').attr('src',image);
//
//                $('#postModal').modal('show');
//
////                    console.log('image===>',image);
//            });
//            $(document).on('click','.resociovideo', function(){
//                var video = $(this).closest('.card').find('source').attr('src');
//                val = $(this).closest('.card').find('.multiImages').val();
//
//                $('#postModal').modal('show');
////                    console.log('video===>',video);
//            });


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

        function post(postStatus){
//        var btn = $(this);
//        $(btn).buttonLoader('start');
            var form = document.getElementById('publishForm');

            var formData = new FormData(form);

            var selected = [];
            $('#checkboxes input:checked').each(function() {
                selected.push($(this).attr('name'));
            });
            formData.append('checked',selected);
            formData.append('imagevideos',result);
            formData.append('postStatus',postStatus);

            $.ajax({
                url: "/publish-data-discovery",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){
                    $('#messageError').text("");
                    $('#test').show();
                    $('#testText').html('Uploading')

                    setTimeout(function(){
                        $('.emojionearea-editor').focus();
                        $('.emojionearea-editor').innerHTML.trigger("click");
                    }, 2000);

                },
                success: function (response) {

                    $('#test').hide();
                    $('#testText').html('Post');

//                document.getElementById("publishForm").reset();
                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    $("#hint_brand").css("display","none");
//                    $("#option_upload").css("display","block");
                    $("#test").attr("disabled", true);
                    if(response.code == 404){
                        $('#messageError').text(response.message);
                    }else if(response.code == 400){
                        swal(response.message);
                    }else if(response.code == 200){
                        if(response.errors.length != 0){
                            $.each(response.errors, function(key,value) {
                                $.toaster({ priority : 'warning', title : 'Could not publish on account', message : ' '+value.firstName+' '+value.error[0].message});
                            });
                        }

                        swal(response.message+"/n");
                        document.getElementById("publishForm").reset();
                        $('#postModal').modal('hide');
                    }else if(response.code == 500){

                        swal("Something went wrong... Please try again after sometime")
                        $('#postModal').modal('hide');

                    }
                },
                error:function(error){
                    console.log(error)
                }
            })
        }



    </script>
    <script>
        var data = '<?php echo env('KEYWORD_CONTENT_STUDIO');?>';
        var pageId1 = 1;
        var filterBy = "what-to-watch";
        var sortBy = "recent";
        var action = "inactive";
        // normal post emoji
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });
        if(action=='inactive')
        {
            action ="active";
            getDailyMotion(filterBy,sortBy, pageId1,0);
        }
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
        ////                console.log('image===>',i);
        //            }

        function getDailyMotion(filter,sort,pageId,search){
            var dailyData = "";
            $.ajax({
                url: "/get-daily-motion",
                type: 'POST',
                data: {
                    filter: filter,
                    sort: sort,
                    pageId: pageId
                },
                beforeSend:function(){
                    $("#bootLoader").css("display","block");
                    if(search == 1) {
                        $("#dailymotion").children().remove();
                    }

                },
                success: function (response) {


                    if(response.code == 200){
                        pageId1 += 1;
                        $("#bootLoader").css("display","none");
                        if(response.DailyDetails.length == 0){
                           action = "active";
                        }else{
                            action = "inactive";
                        }
                        $.each(response.DailyDetails, function(key,value) {

                            if(value.mediaUrl != undefined && value.mediaUrl != "") {

                                var str = value.mediaUrl
                                dailyData += '<div class="card bg-dark text-white border-0 shadow"><input class="multiImages" value=' + value.mediaUrl + ' style="display: none"> <div class="video_dailymotion"> <div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="'+ value.mediaUrl +'" allowfullscreen="true"></iframe> </div> </div> <div class="card-body p-2"> <h5 class="card-title dailymotion_title">' +
                                        ''+ value.title +'</h5> <p class="card-text"> <span class="messageSocio" style="display: none">' + value.title + ' </span> ' +
                                        '<a href="javascript:void(0);" class="text-white float-right resocio" data-toggle="modal" data-target="#postModal"> ' +
                                        '<span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span> </a> </p> </div></div>';
//                                    dailyData += ' <div class="card bg-dark text-white border-0 shadow"> <input class="multiImages" value=' + value.mediaUrl + ' style="display: none">' +
//                                            '<div class="video_imgur"> <video poster="//i.imgur.com/FS6micJ.jpg" muted="muted" autoplay="autoplay" loop="loop" class="video_width_full"> <source src="' + value.mediaUrl + '" type="video/mp4"> </video> </div> <div class="card-body p-2"> <h5 class="card-title imgur_title">' + value.title + '</h5> <p class="card-text"> <a href="javascript:void(0);" class="text-white float-right resocio" > <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span> </a> </p> </div> </div>'



                            }
                        });
//console.log(dailyData);

                        $("#dailymotion").append(dailyData);
                    }else if(response.code == 400 || response.code == 500){
                        console.log(response.message)
                    }


                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        $(document).ready(function(){

            $(document).on('submit','#dailymotionForm',function(e){
                e.preventDefault();
                filterBy = document.getElementById("filter").value;
                sortBy = document.getElementById("sort_by").value;
                pageId1 = 1
                var data = $('#dailymotion_search').val();
                getDailyMotion(filterBy,sortBy,pageId1 ,1);

            });
            $(document).on('click','.resocio', function(){
                $('.clearimag').remove();
                $('.post-thumb').remove();
                var appenddata="";
                var msg ="";
                msg = $(this).closest('.card').find('.messageSocio').text();

                var image = $(this).closest('.card').find('iframe').attr('src');
                val = $(this).closest('.card').find('input').val();
                result = val.split(',')
                $.each(result, function(key,value) {
                        appenddata +=  "<li class='clearimag' id='" +key +"' > <iframe frameborder='0' width='480' height='270'  class='embed-responsive-item' src='"+ value +"' allowfullscreen allow='autoplay'></iframe><div id='" +key +"'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></li>";
//                        appenddata +=  '<li><video width="320" height="240" controls> <source src="'+ value +'" type="video/mp4"> <source src="'+ value +'"  type="video/ogg"> Your browser does not support the video tag.</video></li>';
                });

                $('#media-list').prepend(appenddata);

//                        var gg  =$('#appendData').append(  '<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>');
                $('#normal_post_area').data("emojioneArea").setText(msg);

                $('#reimage').attr('src',image);

                $('#postModal').modal('show');

//                    console.log('image===>',image);
            });


        });

        // infinite scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() >= $("#dailymotion").height() && action == 'inactive') {

//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
                action = 'active';
                setTimeout(function () {
                    getDailyMotion(filterBy,sortBy, pageId1,0);
                }, 1000);
            }
        });


    </script>
@endsection
