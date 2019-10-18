<script>
    var eventCategory = 'Content-Studio';
    var eventAction = 'Youtube';

    console.log(123);
    var data = '<?php echo $data['key'];?>'
    var pageId1 = 1;
    var sortBy = "date";
    var action = "inactive";
    var youtubeDetails =[];

    // normal post emoji
    $("#normal_post_area").emojioneArea({
        pickerPosition: "right",
        tonesStyle: "bullet"
    });
    if(action=='inactive')
    {
        action ="active";
        getyoutube(data,sortBy, pageId1,0);
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

    function getyoutube(keyword,sort,pageId,search){
        var youtube = "";
        $.ajax({
            url: "/getYoutube",
            type: 'POST',
            data: {
                keyword:keyword,
                sort: sort,
                pageId: pageId
            },
            beforeSend:function(){
                $("#bootLoader").css("display","block");
                if(search == 1) {
                    $("#youtube").children().remove();
                }
                youtubeDetails = [];
            },
            success: function (response) {
                console.log(response);
                if(response.code == 200){
                    pageId1 += 1;
                    $("#bootLoader").css("display","none");
                    if(response.youtubeDetails.length == 0){
                        action = "active";
                    }else{
                        action = "inactive";
                    }
                    $.each(response.youtubeDetails, function(key,value) {
                        if(value.mediaUrl != undefined && value.mediaUrl != "") {
                            console.log(456);

                            var date = value.publishedDate.split('T');
                            var str = value.mediaUrl
                            youtube += ' <div class="card border-0 shadow mt-2"> ' +
                                    '<div class="embed-responsive embed-responsive-16by9"> <iframe class="embed-responsive-item" src="'+ value.embed_url +'" allowfullscreen></iframe> </div> ' +
                                    '<div class="card-body p-1"> <div class="btn-group dropleft float-right"> <span class="dropdown-toggle dropdown-toggle-none-c" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                    '<i class="fas fa-angle-down"></i> </span>' +
                                    ' <div class="dropdown-menu p-0"><input class="multiImages" value=' + value.embed_url + ' style="display: none">   <div class="dropdown-item resocio" data-toggle="modal" data-target="#postModal"> <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content."> <i class="fas fa-retweet text-primary"></i> re-socio </span> </div> <a class="dropdown-item" target="_blank" href="'+value.mediaUrl +'"> <i class="fas fa-globe-africa text-primary"></i> Show original </a> </div> </div> <h5 class="mt-0 mb-0"> <span class="keyword_font">"'+value.title+'"</span> </h5> <p class="messageSocio">"'+ value.description +'"</p> <p class="card-text"><small class="text-muted">Published on '+ date[0]+'</small></p> </div> </div>';

                        }
                    });

                    $("#youtube").append(youtube);
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

        $(document).on('submit','#youtubeForm',function(e){
            e.preventDefault();

            data = $('#youtube_search').val();
            getyoutube(data, 1,1);

        });
    });



    // infinite scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= $("#youtube").height() && action == 'inactive') {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
            action = 'active';

            setTimeout(function () {
                getyoutube(data,sortBy, pageId1,0);
            }, 1000);
        }
    });

</script>