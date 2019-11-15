@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery giphy</title>
@endsection

@section('style')
<style type="text/css">
    .video_giphy {
        position: relative;
        display: block;
        width: 100%;
        padding: 0;
        overflow: hidden;
    }

    .video_giphy::before {
        display: block;
        content: "";
    }

    .video_width_full {
        width: 100%;
    }

    .giphy_title {
        font-size: 14px;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 5px;
    }
</style>
@endsection


@section('giphy')


    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>giphy</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="card bg-light border-0 shadow">
                <div class="card-body">
                    <form class="form-inline mb-2" id="giphyForm">
                        <div class="form-group col-4">
                            <label for="giphy_search">Keyword</label>
                            <input type="text" class="form-control col-12 border-0 rounded-pill" id="giphy_search" name="keyword"
                                   placeholder="keyword" value="{{env('KEYWORD_CONTENT_STUDIO')}}">
                        </div>
                        <div class="form-group col-3">
                            <label for="filter">Filter</label>
                            <select class="form-control col-12" id="filter">
                                <option value="G">G(General audiences ->All ages admitted)</option>
                                <option value="PG">PG(Parental guidance suggested ->Some material may not be suitable for children)</option>
                                <option value="PG-13">PG-13( Parents strongly cautioned ->Some material may be inappropriate for children under 13)</option>
                                <option value="R">R(Restricted -> Under 17 requires accompanying parent or adult guardian)</option>
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
    <div class="card-columns mt-5" id="giphy">


    </div>
    <div class="d-flex justify-content-center" >
        <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    @include('Discovery::incPostModal')

    @endsection





@section('script')

    <script>
        //for GA
        var eventCategory = 'Content-Studio';
        var eventAction = 'Giphy';

        var val=[];
        var result=[];

        $(document).ready(function(){
            $(document).on('click','.resocio', function(){
                $('.clearimag').remove();
                $('.post-thumb').remove();
                var appenddata="";
                var msg ="";
                msg = $(this).closest('.card').find('.messageSocio').text();
                var image = $(this).closest('.card').find('img').attr('src');
                val = $(this).closest('.card').find('input').val();
                result = val.split(',')
                console.log(result,val,image,msg);
                $.each(result, function(key,value) {
                    if(value.indexOf(".jpg") >= 1){
                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px' src='" + value + "' " +
                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
                    }else if(value.indexOf(".mp4") >= 1){
                        // document.getElementById("pills-pinterest-profile-tab").style.display = "none";
                        appenddata +=  "<li class='clearimag' id='" +key +"'><video autoplay width='100px' height='100px'  src='" + value + "'" +
                                " id='" +key +"' ></video><div id='" +key +"'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></li>";
                    }else{
                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px'  src='" + value + "'" +
                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
                    }
                });
                $('#normal_post_area').data("emojioneArea").setText(msg);

                $('#media-list').prepend(appenddata);

//                        var gg  =$('#appendData').append(  '<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>');

                $('#reimage').attr('src',image);

                $('#postModal').modal('show');

//                    console.log('image===>',image);
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

        function post(postStatus){
//        var btn = $(this);
//        $(btn).buttonLoader('start');
            var form = document.getElementById('publishForm');

            var formData = new FormData(form);

            var selected = [];
            $('#checkboxes input:checked').each(function() {
                selected.push($(this).attr('name'));
            });
            var selectedBoards = [];
            $('#boardsCheckbox input:checked').each(function() {
                selectedBoards.push($(this).attr('name'));
            });
            formData.append('selectedBoards',selectedBoards);
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
                    if(postStatus == 1){
                        $('#test').show();
                        $('#testText').html('Uploading');
                    }else if(postStatus == 0){
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
                    $("#hint_brand").css("display","none");
                    $("#option_upload").css("display","block");
                    $("#test").attr("disabled", true);
                    if(response.code == 404){
                        console.log(response.message)
                        $('#messageError').text(response.message);
                    }else if(response.code == 400){
                        swal(response.message);
                    }else if(response.code == 200){
                        $(".emojionearea-editor").text("");
                        swal(response.message);

                        if(response.errors.length != 0){
                            $.each(response.errors, function(key,value) {
                                $.toaster({ priority : 'warning', title : 'Could not publish on account', message : ' '+value.firstName+' '+value.error[0].message});
                            });
                        }

                        document.getElementById("publishForm").reset();
                        $('#postModal').modal('hide');
                    }else if(response.code == 500){
                        console.log(response.message);
                        swal("Something went wrong... Please try again after sometime")
                        $('#postModal').modal('hide');

                    }
                },
                error:function(error){
                    console.log(error)
                    swal("Something went wrong... Please try again after sometime")
                    $('#postModal').modal('hide');
                }
            })
        }



    </script>
    <script>

        var data = '<?php echo env('KEYWORD_CONTENT_STUDIO');?>';
        var filterBy = 'G';
        var pageId1 = 1;
        var action = "inactive";
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });
        if(action=='inactive')
        {
            action ="active";
            getGiphy(data,filterBy, pageId1,0);
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

        function getGiphy(keyword,filter,pageId,search){
            var gifData = "";
            $.ajax({
                url: "/getGiphy",
                type: 'POST',
                data: {
                    keyword:keyword,
                    filter: filter,
                    pageId: pageId
                },
                beforeSend:function(){
                    $("#bootLoader").css("display","block");
                    if(search == 1) {
                        $("#giphy").children().remove();
                    }

                },
                success: function (response) {
                    pageId1 += 1;
                    $("#bootLoader").css("display","none");
                    if(response.giphyDetails.length == 0){
                        action = "active";
                    }else{
                        action = "inactive";
                    }

                    if(response.code == 200){
                        $.each(response.giphyDetails, function(key,value) {
                            if(value.mediaUrl[0] != undefined && value.mediaUrl[0] != ""){
                                gifData += '<div class="card bg-dark text-white border-0 shadow"><input class="multiImages" value='+ value.mediaUrl +' style="display: none"> <img src="'+ value.mediaUrl +'" class="card-img-top" alt="sample"> <div class="card-body p-2"> <h5 class="card-title giphy_title messageSocio">'+ value.title +'</h5> <p class="card-text"> <a href="javascript:void(0);" class="text-white float-right resocio" > <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span> </a> </p> </div> </div>';
                            }


                        });

                        $("#giphy").append(gifData);
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



        $(document).on('submit','#giphyForm',function(e){
            e.preventDefault();
             data = $('#giphy_search').val();
             filterBy = document.getElementById('filter').value;
            if(data == ""){
                swal("Please enter valid keyword");
            }else {
                pageId1 =1;
                getGiphy(data,filterBy,pageId1,1);}
        });

        // infinite scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() >= $("#giphy").height() && action == 'inactive') {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
                action = 'active';
                console.log(data,filterBy);
                setTimeout(function () {
                    getGiphy(data,filterBy, pageId1,0);
                }, 1000);
            }
        });


    </script>
    @endsection
