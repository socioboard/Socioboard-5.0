@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Schedule Message</title>
@endsection

@section('publish')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>Schedule Message</h4>
        </div>
    </div>

    <div class="row">
        <form id="scheduleForm" style="display: inline-flex;width: 100%;" enctype='multipart/form-data'>
            <div class="col-md-7">
                <div class="card border-0">
                    <div class="card-body shadow p-2">
                    {{--<form>--}}
                    <!-- post input box -->
                        <div class="form-group">
                                        <textarea name="message" class="form-control border border-light"
                                                  id="schedule_post_area" rows="3"
                                                  placeholder="Write something !"></textarea>
                            <p id="messageError" style="color: red"></p>
                        </div>
                        <!-- image and video upload -->
                        <div class="row">
                            <div class="col-12" id="option_upload">
                                <small>Note: Add only 4 items at a single time.</small>
                                <ul class="btn-nav">
                                    <li>
                                                    <span>
                                                        <i class="far fa-image text-secondary"></i>
                                                        <input type="file" name="imageName[]" click-type="type1"
                                                               class="picupload"
                                                               multiple accept="image/*"/>
                                                    </span>
                                    </li>

                                    <li>
                                                    <span>
                                                        <i class="fas fa-video text-secondary"></i>
                                                        <input type="file" name="videoupload" click-type="type1"
                                                               class="picupload"
                                                               multiple accept="video/*"/>
                                                    </span>
                                    </li>
                                </ul>
                            </div>

                            <div class="col-12" id="hint_brand">
                                <ul id="media-list" class="clearfix">
                                    <li class="myupload">
                                        <span>
                                            <i class="fa fa-plus" aria-hidden="true"></i>
                                            <input type="file" name="subsImageVideo" click-type="type2" id="picupload" class="picupload" multiple>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!-- end of image and video upload -->
                        <hr>
                        <!-- user or pages add list -->
                        <div class="row">
                            <div class="col-md-12">
                                <button type="button" class="btn btn-fb btn-sm all_social_btn">Add Accounts</button>
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
                                            <li class="nav-item">
                                                <a class="nav-link" id="pills-linkedin-profile-tab"
                                                   data-toggle="pill" href="#pills-linkedin-profile" role="tab"
                                                   aria-controls="pills-linkedin-profile" aria-selected="false"><i
                                                            class="fab fa-linkedin-in"></i></a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="pills-pinterest-profile-tab"
                                                   data-toggle="pill" href="#pills-pinterest-profile" role="tab"
                                                   aria-controls="pills-pinterest-profile" aria-selected="false"><i
                                                            class="fab fa-pinterest-p"></i></a>
                                            </li>
                                        </ul>
                                        <div class="tab-content" id="pills-tabContent">
                                            <div class="tab-pane fade show active" id="pills-facebook-profile"
                                                 role="tabpanel" aria-labelledby="pills-facebook-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Facebook Accounts for posting</b></h6>
                                                        <div>
                                                            <ul class="list-group">
                                                                @for($i=0;$i<count($socialAccount);$i++)
                                                                    @if($socialAccount[$i]->account_type == env('FACEBOOK') || $socialAccount[$i]->account_type == env('FACEBOOKPAGE'))
                                                                        @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked === false)

                                                                            <li class="list-group-item page_list">
                                                                                <div class="media">
                                                                                    <img class="mr-3 pp_50 rounded-circle"
                                                                                         src="{{$socialAccount[$i]->profile_pic_url}}"
                                                                                         alt="page title">
                                                                                    <div class="media-body">
																				<span class="float-right badge badge-light"
                                                                                      id="checkboxes">
																					<div class="custom-control custom-checkbox">
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
                                            <div class="tab-pane fade" id="pills-twitter-profile" role="tabpanel"
                                                 aria-labelledby="pills-twitter-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Twitter profile for posting</b></h6>
                                                        <div>
                                                            <ul class="list-group">
                                                                @for($i=0;$i<count($socialAccount);$i++)
                                                                    @if($socialAccount[$i]->account_type == env('TWITTER') )
                                                                        {{--should give a condition for lock--}}
                                                                        @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked === false)
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
                                                                        @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked === false)

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
                                            <div class="tab-pane fade" id="pills-pinterest-profile" role="tabpanel"
                                                 aria-labelledby="pills-pinterest-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Pinterest Profile for posting</b></h6>
                                                        @for($i=0;$i<count($socialAccount);$i++)
                                                            @if($socialAccount[$i]->account_type == env('PINTEREST') && $socialAccount[$i]->join_table_teams_social_accounts->is_account_locked === false)
                                                                <div class="accordion" id="accordionExample">
                                                                    <div class="card border-0">
                                                                        <div class="card-header bg-danger text-white p-1 m-0"
                                                                             id="headingOne" style="cursor: pointer;">
                                                                            <div data-toggle="collapse"
                                                                                 data-target="#profile_pin_1"
                                                                                 aria-expanded="true"
                                                                                 aria-controls="profile_pin_1">
                                                                                <div class="media">
                                                                                    <img src="{{$socialAccount[$i]->profile_pic_url}}"
                                                                                         class="mr-3 pp_50 rounded-circle"
                                                                                         alt="avatar">

                                                                                    <div class="media-body">
                                                                                        <h5 class="mt-0 mb-0">{{$socialAccount[$i]->first_name}} {{$socialAccount[$i]->last_name}}</h5>
                                                                                        <span>2</span> boards
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        @if($boards != null )
                                                                            @for($j=0;$j<count($boards); $j++)
                                                                                @if($boards[$j]->account_type == env('PINTEREST'))
                                                                                    @for($k=0;$k<count($boards[$j]->boards);$k++)
                                                                                        @if($boards[$j]->boards[$k]->social_account_id == $socialAccount[$i]->account_id)
                                                                                            <div id="profile_pin_1"
                                                                                                 class="collapse show"
                                                                                                 aria-labelledby="headingOne"
                                                                                                 data-parent="#accordionExample">
                                                                                                <div class="card-body p-2">
                                                                                                    <ul class="list-group">
                                                                                                        <li class="list-group-item page_list">
                                                                                                            <div class="media">
                                                                                                                <img class="mr-3 pp_50 rounded-circle"
                                                                                                                     src="../assets/imgs/64x64.jpg"
                                                                                                                     alt="page title">

                                                                                                                <div class="media-body">
                                                                                                   <span class="float-right badge badge-light">
                                                                                                    <div class="custom-control custom-checkbox"
                                                                                                         id="boardCheck">
                                                                                                         <input type="checkbox"
                                                                                                                class="custom-control-input"
                                                                                                                id="{{$boards[$j]->boards[$k]->id}}"
                                                                                                                name="{{$boards[$j]->boards[$k]->board_id}}">
                                                                                                        <label class="custom-control-label"
                                                                                                               for="{{$boards[$j]->boards[$k]->id}}"><span
                                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                                    </div>
                                                                                                    </span>
                                                                                                                    <h5 class="mt-2 mb-0 page_name">{{$boards[$j]->boards[$k]->board_name}}</h5>
                                                                                                                    {{--<b style="font-size: 12px;">pin:</b>--}}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </li>
                                                                                                    </ul>
                                                                                                </div>
                                                                                            </div>
                                                                                        @else
                                                                                            @break
                                                                                        @endif
                                                                                    @endfor
                                                                                @endif
                                                                            @endfor
                                                                        @endif

                                                                    </div>

                                                                </div>
                                                            @endif
                                                        @endfor
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {{--</form>--}}
                    </div>
                </div>
            </div>
            <div class="col-md-5">
                <div class="card border-0">
                    <div class="card-body shadow">
                        <label><b>Schedule Type</b></label>
                        <div class="mb-2">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input schedule_normal_post"
                                       id="schedule_post"
                                       name="schedule_normal_post">
                                <label class="custom-control-label" for="schedule_post">Normal
                                    Schedule Post</label>
                            </div>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input day_schedule_post" id="day_schedule"
                                       name="day_schedule_post">
                                <label class="custom-control-label" for="day_schedule">Day Wise Schedule Post</label>
                            </div>
                        </div>
                        <div class="card-body p-1 bg-light mb-2" id="schedule_normal_div">
                            <label for="schedule_normal_post">Select Date and Time</label>
                            <input type="text" class="form-control border border-light" name="dateTime"
                                   id="schedule_normal_post"
                                   placeholder="dd-mm-yyyy">
                        </div>
                        <div class="card-body p-1 bg-light mb-2" id="day_wise_schedule_div">
                            <label>Select Days</label>
                            <div class="btn-group btn-group-toggle col-12" data-toggle="buttons">
                                <label class="btn btn-secondary active">
                                    <input type="checkbox" id="sun" autocomplete="off" checked>
                                    Sun
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="mon" autocomplete="off"> Mon
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="tues" autocomplete="off"> Tues
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="wed" autocomplete="off"> Wed
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="thu" autocomplete="off"> Thu
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="fri" autocomplete="off"> Fri
                                </label>
                                <label class="btn btn-secondary">
                                    <input type="checkbox" id="sat" autocomplete="off"> Sat
                                </label>
                            </div>
                            <hr/>
                            <div>
                                <div class="form-group">
                                    <label for="day_schedule_post">Select Time</label>
                                    <input type="text" class="form-control border border-light" id="day_schedule_post"
                                           placeholder="dd-mm-yyyy">
                                </div>
                            </div>
                            <hr>
                            <div>
                                <label>Select types</label>
                                <div class="custom-control custom-radio">
                                    <input type="radio" id="all_imgs" name="customRadio" class="custom-control-input">
                                    <label class="custom-control-label" for="all_imgs">All images</label>
                                </div>
                                <div class="custom-control custom-radio">
                                    <input type="radio" id="single_img" name="customRadio" class="custom-control-input">
                                    <label class="custom-control-label" for="single_img">Single image</label>
                                </div>
                                <div class="custom-control custom-radio">
                                    <input type="radio" id="random_imgs" name="customRadio"
                                           class="custom-control-input">
                                    <label class="custom-control-label" for="random_imgs">Random images</label>
                                </div>
                            </div>
                        </div>

                        <div class="row m-0 p-0">

                            <button type="button" onclick="schedulePost()" class="btn btn-primary btn-sm col-5 mr-3">
                                Schedule Post
                            </button>
                            <button type="button" onclick="savePost()" class="btn btn-secondary btn-sm col-5">Draft
                            </button>
                            {{--<button type="submit" name="sub_one" class="btn btn-primary btn-sm col-5 mr-3"> Schedule Post </button>--}}
                            {{--<button type="submit" name="sub_two" class="btn btn-secondary btn-sm col-5"> Draft </button>--}}
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </div>
@endsection

@section('script')
    <script type="text/javascript" src="../assets/js/jquery-3.3.1.min.js"></script>
    <script type="text/javascript" src="../assets/plugins/emojionearea/js/emojionearea.min.js"></script>
    <script src="../../assets/plugins/moment.min.js"></script>
    <script type="text/javascript"
            src="../../assets/plugins/datetimepicker/build/js/bootstrap-datetimepicker.min.js"></script>

    <script>
        //Aishwarya jquery

        //            $(document).on('submit','#publishForm',function(e){
        //                e.preventDefault();
        //
        //                var form = document.getElementById('publishForm');
        //
        //
        //                var formData = new FormData(form);
        //
        //                console.log((formData));
        //
        //                var selected = [];
        //                $('#checkboxes input:checked').each(function() {
        //                    selected.push($(this).attr('name'));
        //                });
        //                formData.append('checked',selected);
        //
        //
        //                $.ajax({
        //                    url: "/publish-data",
        //                    data: formData,
        //                    cache: false,
        //                    processData: false,
        //                    contentType: false,
        //                    type: 'POST',
        //                    beforeSend:function(){
        //                        $('#messageError').text("");
        //
        //                    },
        //                    success: function (response) {
        //                        console.log(response);
        //
        //                        if(response.code == 404){
        //                            $('#messageError').text(response.message);
        //                        }else if(response.code == 400){
        //                            swal(response.message);
        //                        }else if(response.code == 200){
        //                            swal(response.message);
        //                        }
        //                    },
        //                    error:function(error){
        //                            console.log(error)
        //                    }
        //                })
        //            });

        function schedulePost() {
            var form = document.getElementById('scheduleForm');


            var formData = new FormData(form);

            var selected = [];
            var boardsSelected = [];
            $('#checkboxes input:checked').each(function () {
                selected.push($(this).attr('name'));
            });
            formData.append('checked', selected);

            $('#boardCheck input:checked').each(function () {
                boardsSelected.push($(this).attr('name'));
            });


            $.ajax({
                url: "/schedule-post",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend: function () {
                    $('#messageError').text("");

                },
                success: function (response) {

                    return 1;

                    if (response.code == 404) {
                        $('#messageError').text(response.message);
                    } else if (response.code == 400) {
                        swal(response.message);
                    } else if (response.code == 200) {
                        swal(response.message);
                    }
                },
                error: function (error) {
                    console.log(error)
                }
            })
        }

        // schedule post emoji
        $("#schedule_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // schedule_post
        $(function () {
            // schedule_post normal
            $('#schedule_normal_post').datetimepicker();
            // day wise schedule post
            $('#day_schedule_post').datetimepicker();
        });

        // --------------------- //
        // schedule div toggle
        // --------------------- //
        $("#schedule_normal_div").hide();
        $(".schedule_normal_post").click(function () {
            if ($(this).is(":checked")) {
                $("#schedule_normal_div").show();
            } else {
                $("#schedule_normal_div").hide();
            }
        });

        $("#day_wise_schedule_div").hide();
        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                $("#day_wise_schedule_div").show();
            } else {
                $("#day_wise_schedule_div").hide();
            }
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


        //    images and videos upload
        window.count = 0; //global
        $(function () {
            var names = [];
            var i = 0;


            $('#hint_brand').css("display", "none");
            $('body').on('change', '.picupload', function (event) {

                i++;
                window.count++;


                var getAttr = $(this).attr('click-type');
                var files = event.target.files;
                var output = document.getElementById("media-list");
                var z = 0;

                if (getAttr == 'type1') {

//                    debugger;
                    $('#media-list').html('');

                    $('#media-list').after('<li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" name="subsPic[]" click-type="type2" id="picupload' + i + '" class="picupload" multiple="multiple"></span></li>');
                    $('#hint_brand').css("display", "block");
                    $('#option_upload').css("display", "none");
                    for (var i = 0; i < files.length; i++) {

                        var file = files[i];
                        names.push($(this).get(0).files[i].name);

                        if (file.type.match('image')) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<img src='" + picFile.result + "'" +
                                    "title='" + picFile.name + "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        } else {
                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<video src='" + picFile.result + "'" +
                                    "title='" + picFile.name + "'></video><div id='" + z + "'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                } else if (getAttr == 'type2') {
//                    debugger;


//                    $('#media-list2').html('<li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" name="subsPic_'+ window.count+'" click-type="type2" id="picupload" class="picupload" multiple accept="image/*"></span></li>');

                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        names.push($(this).get(0).files[i].name);


                        if (file.type.match('image')) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<img src='" + picFile.result + "'" +
                                    "title='" + picFile.name + "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);

                            });
                        } else {

                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {

                                var picFile = event.target;

                                var div = document.createElement("li");

                                div.innerHTML = "<video src='" + picFile.result + "'" +
                                    "title='" + picFile.name + "'></video><div class='post-thumb'><div  class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);

                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                    // return array of file name
                }

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
        });

    </script>
@endsection