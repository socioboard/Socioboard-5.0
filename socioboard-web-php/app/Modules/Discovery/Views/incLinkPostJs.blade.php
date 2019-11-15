<script>
    var val=[];
    var result=[];

    $(document).ready(function() {
        $(document).on('click','.resocio', function(){
            // document.getElementById("pills-pinterest-profile-tab").style.display = "none";
            $('.clearimag').remove();
            $('.post-thumb').remove();
//                var appenddata="";
            var msg ="";
            msg = $(this).closest('.card').find('.messageSocio').text();
               $('#normal_post_area').data("emojioneArea").setText(msg);
//                var image = $(this).closest('.card').find('img').attr('src');
            val = $(this).closest('.card').find('input').val();
            console.log('link---'+val);
            $("#outgoing_link").attr("value", val);



//                $.each(result, function(key,value) {
//                    if(value.indexOf(".jpg") >= 1){
//                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px' src='" + value + "' " +
//                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
//                    }else if(value.indexOf(".mp4") >= 1){
//                        appenddata +=  "<li class='clearimag' id='" +key +"'><video autoplay width='100px' height='100px'  src='" + value + "'" +
//                                " id='" +key +"' ></video><div id='" +key +"'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></li>";
//                    }else{
//                        appenddata += "<li class='clearimag' id='" +key +"'><img width='100px' height='100px'  src='" + value + "'" +
//                                "title='image' id='" +key +"' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";
//                    }
//                });

//                $('#media-list').prepend(appenddata);

//                        var gg  =$('#appendData').append(  '<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>');

//                $('#reimage').attr('src',image);

            $('#postModal').modal('show');

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
        formData.append('checked',selected);
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
                $('#testText').html('Uploading');
            },
            success: function (response) {

                $('#test').hide();
                $('#testText').html('Post');

//                document.getElementById("publishForm").reset();

                $("#hint_brand").css("display","none");
//                $("#option_upload").css("display","block");
                $("#test").attr("disabled", true);
                if(response.code == 404){
                    console.log(response.message)
                    $('#messageError').text(response.message);
                }else if(response.code == 400){
                    swal(response.message);
                }else if(response.code == 200){
                    if(response.errors.length != 0){


                        $.each(response.errors, function(key,value) {

                            $.toaster({ priority : 'warning', title : 'Could not publish on account', message : ' '+value.firstName+' '+value.error[0].message});

                        });
                    }

                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    swal(response.message);
//                        document.getElementById("publishForm").reset();
                    $('#postModal').modal('hide');
                }else if(response.code == 500){
                    console.log(response.message);
                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    swal("Something went wrong... Please try again after sometime")
                    $('#postModal').modal('hide');

                }
            },
            error:function(error){
                console.log(error)
                $('#publishForm').trigger("reset");
                $(".emojionearea-editor").text("");
                swal("Something went wrong... Please try again after sometime")
                $('#postModal').modal('hide');
            }
        })
    }



</script>
