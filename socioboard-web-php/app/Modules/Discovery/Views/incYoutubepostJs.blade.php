<script>
    var val=[];
    var result=[];

    $(document).ready(function(){
        // document.getElementById("pills-pinterest-profile-tab").style.display = "none";
        $(document).on('click','.resocio', function(){
            $('.clearimag').remove();
            $('.post-thumb').remove();
            var appenddata="";
            var msg ="";
            msg = $(this).closest('.card').find('.messageSocio').text();

            var image = $(this).closest('.card').find('img').attr('src');
            val = $(this).closest('.card').find('input').val();
            result = val.split(',');
            $.each(result, function(key,value) {

                appenddata += "<li class='clearimag' id='" +key +"'><iframe class='embed-responsive-item' src='" + value + "' title='image' id='" +key +"' ></iframe> " +
                        "<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div></div>";

            });
            $('#normal_post_area').data("emojioneArea").setText(msg);
            $('#media-list').prepend(appenddata);

//                        var gg  =$('#appendData').append(  '<div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>');

            $('#reimage').attr('src',image);

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
                    swal(response.message);
                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");

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
