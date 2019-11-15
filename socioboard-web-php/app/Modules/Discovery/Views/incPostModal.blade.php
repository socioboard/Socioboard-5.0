<!-- post modal -->
<div class="modal fade" id="postModal" tabindex="-1" role="dialog" aria-labelledby="postModalLabel"
     aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header p-1 bg-light">
                <h5 class="modal-title">Create post</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-2">
                <form id="publishForm">
                    <!-- post input box -->
                    <div class="form-group">
								<textarea name="message" class="form-control border border-light" id="normal_post_area" rows="3"
                                          placeholder="Write something !" ></textarea>
                    </div>
                    <div class="form-group">
                        <input type="text" class="form-control border border-light" name="link" id="outgoing_link" placeholder="Enter outgoing link">
                    </div>
                    <p id="messageError" style="color: red" ></p>

                    <!-- image and video upload -->
                    <div class="row">
                        {{--<div class="col-12" id="option_upload">--}}
                        {{--<small>Note: Add only 4 items at a single time.</small>--}}
                        {{--<ul class="btn-nav">--}}
                        {{--<li>--}}
                        {{--<span>--}}
                        {{--<i class="far fa-image text-secondary"></i>--}}
                        {{--<input id="imagePOst" type="file" name="imageName[]" click-type="type1" class="picupload" multiple--}}
                        {{--accept="image/*" />--}}
                        {{--</span>--}}
                        {{--</li>--}}
                        {{--<li>--}}
                        {{--<span>--}}
                        {{--<i class="fas fa-video text-secondary"></i>--}}
                        {{--<input type="file" name="videoupload[]" click-type="type1" class="picupload" multiple--}}
                        {{--accept="video/*" />--}}
                        {{--</span>--}}
                        {{--</li>--}}
                        {{--</ul>--}}
                        {{--<br/>--}}

                        {{--</div>--}}
                        <div class="col-12" id="hint_brand">
                            <ul id="media-list" class="clearfix">
                                {{--<li class="myupload">--}}
                                {{--<span>--}}
                                {{--<i class="fa fa-plus" aria-hidden="true"></i>--}}
                                {{--<input type="file" click-type="type2" id="picupload" class="picupload"--}}
                                {{--multiple>--}}
                                {{--</span>--}}
                                {{--</li>--}}
                            </ul>
                        </div>
                    </div>
                    <!-- end of image and video upload -->
                    <hr>
                    <!-- user or pages add list -->
                    <div class="row">
                        <div class="col-md-12">
                            <button type="button" id="add-account-for-publish" class="btn btn-fb btn-sm all_social_btn">Add Accounts</button>
                            <div class="all_social_div">
                                <div>
                                    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active" id="pills-facebook-profile-tab"
                                               data-toggle="pill" href="#pills-facebook-profile" role="tab"
                                               aria-controls="pills-facebook-profile" aria-selected="true"><i
                                                    class="fab fa-facebook-f"></i></a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link" id="pills-twitter-profile-tab"
                                               data-toggle="pill" href="#pills-twitter-profile" role="tab"
                                               aria-controls="pills-twitter-profile" aria-selected="false"><i
                                                    class="fab fa-twitter"></i></a>
                                        </li>
                                        {{--<li class="nav-item">--}}
                                        {{--<a class="nav-link" id="pills-linkedin-profile-tab"--}}
                                        {{--data-toggle="pill" href="#pills-linkedin-profile" role="tab"--}}
                                        {{--aria-controls="pills-linkedin-profile" aria-selected="false"><i--}}
                                        {{--class="fab fa-linkedin-in"></i></a>--}}
                                        {{--</li>--}}
                                        {{--<li class="nav-item">--}}
                                        {{--<a class="nav-link" id="pills-insta-profile-tab"--}}
                                        {{--data-toggle="pill" href="#pills-insta-profile" role="tab"--}}
                                        {{--aria-controls="pills-insta-profile" aria-selected="false"><i--}}
                                        {{--class="fab fa-linkedin-in"></i></a>--}}
                                        {{--</li>--}}

                                        {{--                                            <li class="nav-item">--}}
                                        {{--                                                <a class="nav-link" id="pills-pinterest-profile-tab"--}}
                                        {{--                                                   data-toggle="pill" href="#pills-pinterest-profile" role="tab"--}}
                                        {{--                                                   aria-controls="pills-pinterest-profile" aria-selected="false"><i--}}
                                        {{--                                                            class="fab fa-pinterest-p"></i></a>--}}
                                        {{--                                            </li>--}}
                                    </ul>
                                    <div class="tab-content" id="pills-tabContent">
                                        <div class="tab-pane fade show active" id="pills-facebook-profile"
                                             role="tabpanel" aria-labelledby="pills-facebook-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Facebook Pages for posting</b></h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if( $socialAccount[$i]->account_type == env('FACEBOOKPAGE'))
                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                        <li class="list-group-item page_list">
                                                                            <div class="media">
                                                                                <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                <div class="media-body">
																				<span  class="float-right badge badge-light" id="checkboxes">
																					<div class="custom-control custom-checkbox">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                    <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                    <b   style="font-size: 12px;">Follower:</b>
                                                                                    {{$socialAccount[$i]->friendship_counts}}

                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    @endif

                                                                @endif
                                                            @endfor
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-twitter-profile" role="tabpanel"
                                             aria-labelledby="pills-twitter-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Twitter profile for posting</b></h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if($socialAccount[$i]->account_type == env('TWITTER') )
                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                        <li class="list-group-item page_list">
                                                                            <div class="media">
                                                                                <img class="mr-3 pp_50 rounded-circle"
                                                                                     src="{{$socialAccount[$i]->profile_pic_url}}"
                                                                                     alt="page title">

                                                                                <div class="media-body">
																				<span class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox"
                                                                                         id="checkboxes">
                                                                                        <input type="checkbox"
                                                                                               class="custom-control-input"
                                                                                               id="{{$socialAccount[$i]->social_id}}"
                                                                                               name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label class="custom-control-label"
                                                                                               for="{{$socialAccount[$i]->social_id}}"><span
                                                                                                style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                    <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                    <b style="font-size: 12px;">Follower:</b>
                                                                                    {{$socialAccount[$i]->friendship_counts}}

                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    @endif
                                                                @endif
                                                            @endfor
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-linkedin-profile" role="tabpanel"
                                             aria-labelledby="pills-linkedin-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Linkedin Profile and Pages for posting</b>
                                                    </h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if($socialAccount[$i]->account_type == env('LINKEDIN') || $socialAccount[$i]->account_type == env('LINKEDINCOMPANY'))
                                                                    should give a condition for lock
                                                                    <li class="list-group-item page_list">
                                                                        <div class="media">
                                                                            <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                            <div class="media-body">
																				<span  class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox" id="checkboxes">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                <b   style="font-size: 12px;">Follower:</b>
                                                                                {{$socialAccount[$i]->friendship_counts}}

                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                @endif
                                                            @endfor
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {{--                                            <div class="tab-pane fade" id="pills-pinterest-profile" role="tabpanel"--}}
                                        {{--                                                 aria-labelledby="pills-pinterest-profile-tab">--}}
                                        {{--                                                <div class="card margin-top-10">--}}
                                        {{--                                                    <div class="card-body bg-white p-2">--}}
                                        {{--                                                        <h6><b>Choose Pinterest boards for posting</b></h6>--}}
                                        {{--                                                        <div class="accordion" id="accordionExample">--}}
                                        {{--                                                            @for($i=0;$i<count($socialAccount);$i++)--}}
                                        {{--                                                                @if( $socialAccount[$i]->account_type == env('PINTEREST'))--}}
                                        {{--                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)--}}
                                        {{--                                                                        <div class="card border-0">--}}
                                        {{--                                                                            <div class="card-header bg-danger text-white p-1 m-0"--}}
                                        {{--                                                                                 id="headingOne" style="cursor: pointer;">--}}
                                        {{--                                                                                <div data-toggle="collapse"--}}
                                        {{--                                                                                     data-target="#profile_pin_1"--}}
                                        {{--                                                                                     aria-expanded="true"--}}
                                        {{--                                                                                     aria-controls="profile_pin_1">--}}
                                        {{--                                                                                    <div class="media">--}}
                                        {{--                                                                                        <img src="{{$socialAccount[$i]->profile_pic_url}}"--}}
                                        {{--                                                                                             class="mr-3 pp_50 rounded-circle"--}}
                                        {{--                                                                                             alt="avatar">--}}
                                        {{--                                                                                        <div class="media-body">--}}
                                        {{--                                                                                            <h5 class="mt-0 mb-0">{{$socialAccount[$i]->first_name}}</h5>--}}

                                        {{--                                                                                        </div>--}}
                                        {{--                                                                                    </div>--}}
                                        {{--                                                                                </div>--}}
                                        {{--                                                                            </div>--}}
                                        {{--                                                                            @if($i == 0)--}}
                                        {{--                                                                                    <div id="profile_pin_1" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">--}}
                                        {{--                                                                                @else--}}
                                        {{--                                                                                    <div id="profile_pin_1" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">--}}
                                        {{--                                                                            @endif--}}

                                        {{--                                                                                    <div class="card-body p-2">--}}
                                        {{--                                                                                    <ul class="list-group">--}}
                                        {{--                                                                                        @for($j=0;$j<count($pinterestBoards);$j++)--}}

                                        {{--                                                                                            @if($pinterestBoards[$j]->account_id == $socialAccount[$i]->account_id)--}}

                                        {{--                                                                                                @for($l=0;$l<count($pinterestBoards[$j]->boards);$l++)--}}
                                        {{--                                                                                                    <li class="list-group-item page_list">--}}
                                        {{--                                                                                                        <div class="media">--}}
                                        {{--                                                                                                            --}}{{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--                                                                                                                 --}}{{--src="{{$pinterestBoards[$j]->boards[$l]->board_url}}"--}}
                                        {{--                                                                                                                 --}}{{--alt="page title">--}}
                                        {{--                                                                                                            <div class="media-body">--}}
                                        {{--                                                                                                                <span class="float-right badge badge-light">--}}
                                        {{--                                                                                                                    <div class="custom-control custom-checkbox" id="boardsCheckbox">--}}
                                        {{--                                                                                                                        <input type="checkbox" class="custom-control-input" id="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}" name="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}">--}}
                                        {{--                                                                                                                        <label class="custom-control-label" for="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}">--}}
                                        {{--                                                                                                                            <span style="display: flex; margin-top: 6px;">Add</span>--}}
                                        {{--                                                                                                                        </label>--}}
                                        {{--                                                                                                                    </div>--}}
                                        {{--                                                                                                                </span>--}}
                                        {{--                                                                                                                <h5 class="mt-2 mb-0 page_name">{{$pinterestBoards[$j]->boards[$l]->board_name}}</h5>--}}
                                        {{--                                                                                                            </div>--}}
                                        {{--                                                                                                        </div>--}}
                                        {{--                                                                                                    </li>--}}
                                        {{--                                                                                                @endfor--}}
                                        {{--                                                                                            @endif--}}
                                        {{--                                                                                        @endfor--}}
                                        {{--                                                                                    </ul>--}}
                                        {{--                                                                                </div>--}}
                                        {{--                                                                            </div>--}}
                                        {{--                                                                        </div>--}}
                                        {{--                                                                    @endif--}}
                                        {{--                                                                @endif--}}
                                        {{--                                                            @endfor--}}

                                        {{--                                                        </div>--}}
                                        {{--                                                    </div>--}}
                                        {{--                                                </div>--}}
                                        {{--                                            </div>--}}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="float-right">
                        {{--                            <button type="button" onclick="post(0)" class="btn btn-secondary"><i id="draftspinstyle" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="draftspin">Draft</span></button>--}}
                        <button type="button" onclick="post(1)" class="btn btn-primary"><i id="test" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Post</span></button>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>

<script>

    function post(postStatus){
        //        var btn = $(this);
        //        $(btn).buttonLoader('start');
        var form = document.getElementById('publishForm');

        var formData = new FormData(form);
        var selected = [];
        var selectedBoards = [];
        $('#checkboxes input:checked').each(function() {
            selected.push($(this).attr('name'));
        });
        $('#boardsCheckbox input:checked').each(function() {
            selectedBoards.push($(this).attr('name'));
        });
        formData.append('checked',selected);
        formData.append('postStatus',postStatus);
        formData.append('selectedBoards',selectedBoards);



        $.ajax({
            url: "/publish-data",
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

                $("#test").attr("disabled", true);
                if(response.code == 404){
                    console.log(response.message)
                    $('#messageError').text(response.message);
                }else if(response.code == 400){
                    swal(response.message);
                }else if(response.code == 200){
                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    $("#hint_brand").css("display","none");
                    $("#option_upload").css("display","block");
                    swal(response.message);
                    document.getElementById("publishForm").reset();
                    $('#postModal').modal('hide');
                }else{
                    console.log(response.message);
                    $('#publishForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    $("#hint_brand").css("display","none");
                    $("#option_upload").css("display","block");
                    swal("Something went wrong... Please try again after sometime")
                    $('#postModal').modal('hide');

                }
            },
            error:function(error){
                console.log(error)
                $('#publishForm').trigger("reset");
                $(".emojionearea-editor").text("");
                $("#hint_brand").css("display","none");
                $("#option_upload").css("display","block");
                swal("Something went wrong... Please try again after sometime")
                $('#postModal').modal('hide');

            }
        })
    }
</script>
