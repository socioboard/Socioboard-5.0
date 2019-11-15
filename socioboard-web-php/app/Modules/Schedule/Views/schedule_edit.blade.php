@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard |Edit Schedule Message</title>
@endsection

@section('schedule')

    <main>
        <div class="container margin-top-60">
            <div class="row margin-top-10">
                <div class="col-md-12">
                    <h4>Edit Schedule Message</h4>
                </div>
            </div>

            <div class="row">
                <div class="col-md-7">
                    <div class="card border-0">
                        <div class="card-body shadow p-2">
                            <form id="scheduleForm">
                                <!-- post input box -->
                                <div class="form-group">
                                    <textarea name="sMessage" class="form-control border border-light" id="schedule_post_area" rows="3"
                                              placeholder="Write something !" >{{$scheduleDetails['description']}}</textarea>
                                </div>
                                <div class="form-group">
                                    <input type="text" class="form-control border border-light" name="sLink" id="outgoing_link" value="{{$scheduleDetails['shareLink']}}"    placeholder="Enter outgoing link">
                                </div>
                                <p id="messageError" style="color: red" ></p>
                                <!-- image and video upload -->
                                <div class="row">
                                    <div class="col-12" id="option_upload">
                                        <small>Note: Add only 4 items at a single time.</small>
                                        <ul class="btn-nav">
                                            <li>
                                                <span>
                                                    <i class="far fa-image text-secondary"></i>
                                                    <input type="file" name="imageName[]" click-type="type1" class="picupload"
                                                           multiple accept="image/*" />
                                                </span>
                                            </li>
                                            <li>
                                                <span>
                                                    <i class="fas fa-video text-secondary"></i>
                                                    <input type="file" name="videoupload[]" click-type="type1" class="picupload"
                                                           multiple accept="video/*" />
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div class="col-12" id="hint_brand">
                                        <ul id="media-list" class="clearfix">
                                            <li class="myupload">
                                                <span>
                                                    <i class="fa fa-plus" aria-hidden="true"></i>
                                                    <input type="file" name="imageName[]" click-type="type2" id="picupload"
                                                           class="picupload" multiple>
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
                                        <button type="button" class="btn btn-fb btn-sm all_social_btn">Add
                                            Accounts</button>
                                        <div class="all_social_div">
                                            <div>
                                                <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                                    <li class="nav-item">
                                                        <a class="nav-link active" id="pills-facebook-profile-tab"
                                                           data-toggle="pill" href="#pills-facebook-profile" role="tab"
                                                           aria-controls="pills-facebook-profile"
                                                           aria-selected="true"><i class="fab fa-facebook-f"></i></a>
                                                    </li>
                                                    <li class="nav-item">
                                                        <a class="nav-link" id="pills-twitter-profile-tab"
                                                           data-toggle="pill" href="#pills-twitter-profile" role="tab"
                                                           aria-controls="pills-twitter-profile"
                                                           aria-selected="false"><i class="fab fa-twitter"></i></a>
                                                    </li>
                                                    {{--<li class="nav-item">--}}
                                                    {{--<a class="nav-link" id="pills-linkedin-profile-tab"--}}
                                                    {{--data-toggle="pill" href="#pills-linkedin-profile" role="tab"--}}
                                                    {{--aria-controls="pills-linkedin-profile"--}}
                                                    {{--aria-selected="false"><i class="fab fa-linkedin-in"></i></a>--}}
                                                    {{--</li>--}}
{{--                                                    <li class="nav-item">--}}
{{--                                                        <a class="nav-link" id="pills-pinterest-profile-tab"--}}
{{--                                                           data-toggle="pill" href="#pills-pinterest-profile"--}}
{{--                                                           role="tab" aria-controls="pills-pinterest-profile"--}}
{{--                                                           aria-selected="false"><i class="fab fa-pinterest-p"></i></a>--}}
{{--                                                    </li>--}}
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
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->account_id}}" name="{{$socialAccount[$i]->account_id}}--{{$socialAccount[$i]->account_type}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->account_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
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
                                                                                               id="{{$socialAccount[$i]->account_id}}"
                                                                                               name="{{$socialAccount[$i]->account_id}}--{{$socialAccount[$i]->account_type}}">
                                                                                        <label class="custom-control-label"
                                                                                               for="{{$socialAccount[$i]->account_id}}"><span
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
                                                                                {{--should give a condition for lock--}}
                                                                                <li class="list-group-item page_list">
                                                                                    <div class="media">
                                                                                        <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                        <div class="media-body">
																				<span  class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox" id="checkboxes">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}--{{$socialAccount[$i]->account_type}} checked">
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
{{--                                                    <div class="tab-pane fade" id="pills-pinterest-profile"--}}
{{--                                                         role="tabpanel" aria-labelledby="pills-pinterest-profile-tab">--}}
{{--                                                        <div class="card margin-top-10">--}}
{{--                                                            <div class="card-body bg-white p-2">--}}
{{--                                                                <h6><b>Choose Pinterest Profile for posting</b></h6>--}}
{{--                                                                <div class="accordion" id="accordionExample">--}}
{{--                                                                    @for($i=0;$i<count($socialAccount);$i++)--}}
{{--                                                                        @if( $socialAccount[$i]->account_type == env('PINTEREST'))--}}
{{--                                                                            @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)--}}
{{--                                                                                <div class="card border-0">--}}
{{--                                                                                    <div class="card-header bg-danger text-white p-1 m-0"--}}
{{--                                                                                         id="headingOne" style="cursor: pointer;">--}}
{{--                                                                                        <div data-toggle="collapse"--}}
{{--                                                                                             data-target="#profile_pin_1"--}}
{{--                                                                                             aria-expanded="true"--}}
{{--                                                                                             aria-controls="profile_pin_1">--}}
{{--                                                                                            <div class="media">--}}
{{--                                                                                                <img src="{{$socialAccount[$i]->profile_pic_url}}"--}}
{{--                                                                                                     class="mr-3 pp_50 rounded-circle"--}}
{{--                                                                                                     alt="avatar">--}}
{{--                                                                                                <div class="media-body">--}}
{{--                                                                                                    <h5 class="mt-0 mb-0">{{$socialAccount[$i]->first_name}}</h5>--}}

{{--                                                                                                </div>--}}
{{--                                                                                            </div>--}}
{{--                                                                                        </div>--}}
{{--                                                                                    </div>--}}
{{--                                                                                    @if($i == 0)--}}
{{--                                                                                        <div id="profile_pin_1" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">--}}
{{--                                                                                            @else--}}
{{--                                                                                                <div id="profile_pin_1" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">--}}
{{--                                                                                                    @endif--}}

{{--                                                                                                    <div class="card-body p-2">--}}
{{--                                                                                                        <ul class="list-group">--}}
{{--                                                                                                            @for($j=0;$j<count($pinterestBoards);$j++)--}}

{{--                                                                                                                @if($pinterestBoards[$j]->account_id == $socialAccount[$i]->account_id)--}}

{{--                                                                                                                    @for($l=0;$l<count($pinterestBoards[$j]->boards);$l++)--}}
{{--                                                                                                                        <li class="list-group-item page_list">--}}
{{--                                                                                                                            <div class="media">--}}
{{--                                                                                                                                --}}{{--<img class="mr-3 pp_50 rounded-circle"--}}
{{--                                                                                                                                --}}{{--src="{{$pinterestBoards[$j]->boards[$l]->board_url}}"--}}
{{--                                                                                                                                --}}{{--alt="page title">--}}
{{--                                                                                                                                <div class="media-body">--}}
{{--                                                                                                                <span class="float-right badge badge-light">--}}
{{--                                                                                                                    <div class="custom-control custom-checkbox" id="boardsCheckbox">--}}
{{--                                                                                                                        <input type="checkbox" class="custom-control-input" id="{{$pinterestBoards[$j]->account_id}}" name="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}">--}}
{{--                                                                                                                        <label class="custom-control-label" for="{{$pinterestBoards[$j]->account_id}}">--}}
{{--                                                                                                                            <span style="display: flex; margin-top: 6px;">Add</span>--}}
{{--                                                                                                                        </label>--}}
{{--                                                                                                                    </div>--}}
{{--                                                                                                                </span>--}}
{{--                                                                                                                                    <h5 class="mt-2 mb-0 page_name">{{$pinterestBoards[$j]->boards[$l]->board_name}}</h5>--}}
{{--                                                                                                                                </div>--}}
{{--                                                                                                                            </div>--}}
{{--                                                                                                                        </li>--}}
{{--                                                                                                                    @endfor--}}
{{--                                                                                                                @endif--}}
{{--                                                                                                            @endfor--}}
{{--                                                                                                        </ul>--}}
{{--                                                                                                    </div>--}}
{{--                                                                                                </div>--}}
{{--                                                                                        </div>--}}
{{--                                                                                    @endif--}}
{{--                                                                                    @endif--}}
{{--                                                                                    @endfor--}}
{{--                                                                                </div>--}}
{{--                                                                </div>--}}
{{--                                                            </div>--}}
{{--                                                        </div>--}}
{{--                                                        --}}{{--todo take from np--}}
                                                    </div>
                                                    {{--todo take from np--}}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-md-5">
                    <div class="card border-0">
                        <div class="card-body shadow">
                            <label><b>Schedule Type</b></label>
                            <div class="mb-2">
                                <div class="custom-control custom-checkbox" id="normalChecked">
                                    <input type="checkbox" class="custom-control-input schedule_normal_post"
                                           id="schedule_post" name="schedule_normal_post">
                                    <label class="custom-control-label" for="schedule_post">Normal
                                        Schedule Post</label>
                                </div>
                                <div class="custom-control custom-checkbox" id="dayChecked">
                                    <input type="checkbox" class="custom-control-input day_schedule_post"
                                           id="day_schedule" name="day_schedule_post">
                                    <label class="custom-control-label" for="day_schedule">Day Wise Schedule
                                        Post</label>
                                </div>
                            </div>
                            <div class="card-body p-1 bg-light mb-2" id="schedule_normal_div">
                                <label for="schedule_normal_post">Select Date and Time</label>
                                <input type="text" name="normalDateTime" class="form-control border border-light " id="schedule_normal_post"
                                       placeholder="dd-mm-yyyy">
                            </div>
                            <div class="card-body p-1 bg-light mb-2" id="day_wise_schedule_div">
                                <label>Select Days</label>
                                <div class="btn-group btn-group-toggle col-12" data-toggle="buttons" id="daywiseDayCheck">
                                    <label class="btn btn-secondary active">
                                        <input type="checkbox"  id="sun" name="0" autocomplete="off">
                                        Sun
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="mon" name="1" autocomplete="off"> Mon
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="tue" name="2" autocomplete="off"> Tues
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="wed" name="3" autocomplete="off"> Wed
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="thu" name="4" autocomplete="off"> Thu
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="fri" name="5" autocomplete="off"> Fri
                                    </label>
                                    <label class="btn btn-secondary">
                                        <input type="checkbox" id="sat" name="6" autocomplete="off" > Sat
                                    </label>
                                </div>
                                <hr />
                                <div>
                                    <div class="form-group">
                                        <label for="day_schedule_post">Select Time</label>
                                        <input type="text" class="form-control border border-light"
                                               id="day_schedule_post" placeholder="dd-mm-yyyy">
                                    </div>
                                </div>
                                <hr>
                            </div>

                            <div class="row m-0 p-0">
                                @if($scheduleDetails['scheduleStatus']==1)
                                    <button type="button" onclick="editSchedule({{$scheduleId}})" class="btn btn-primary btn-sm col-5 mr-3"><i id="test" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Edit Schedule Post</span></button>
                                @elseif($scheduleDetails['scheduleStatus']==5)
                                    <button type="button" onclick="editSchedule({{$scheduleId}})" class="btn btn-primary btn-sm col-5 mr-3"><i id="draftspinstyle" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Edit Draft</span></button>
                                    <button type="button" onclick="makeSchedule({{$scheduleId}})" class="btn btn-primary btn-sm col-5 mr-3"><i id="test" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Create Schedule Post</span></button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </main>

@endsection


@section('script')
    <script>
        var selectDays = [];
        var selected = [];
        var selectedBoards = [];

        var normalChecked =0;
        var daywsiseChecked =0;

        // all social list div open
        $('.all_social_div').css({
            'display': 'none'
        });
        $('#hint_brand').css("display", "none");
        $("#schedule_normal_div").hide();
        $("#day_wise_schedule_div").hide();

        //todo::append schedule details
         var schStatus = '<?php echo ($scheduleDetails['scheduleStatus']) ; ?>';//Schedule(1) or draft(5)
         var schCategory = '<?php echo json_encode($scheduleDetails['scheduleCategory']) ; ?>';//normal or daywise
         var tId = '<?php echo json_encode($scheduleDetails['teamId']) ; ?>';//teamId
         var nSchDate = '<?php echo json_encode($scheduleDetails['normalScheduleDate']) ; ?>';//normal schedule date time
         var dSchTimer = '<?php echo json_encode($scheduleDetails['daywiseScheduleTimer']) ; ?>';//daywise schedule days and time
         dSchTimer =  JSON.parse(dSchTimer);
         var postingSocIds = '<?php echo json_encode($scheduleDetails['postingSocialIds']) ; ?>';//social accType and accId
         postingSocIds = JSON.parse(postingSocIds);
         var pinBrds = '<?php echo json_encode($scheduleDetails['pinBoards']) ; ?>';//pinBoards
         pinBrds = JSON.parse(pinBrds);
         var media = '<?php echo json_encode($scheduleDetails['mediaUrl']) ; ?>';//mediaUrls
         media = JSON.parse(media);
//         media = media[0].split(",");


        //schedule-category 0->normal schedule
        if(schCategory == 0){
            document.getElementById("schedule_post").checked = true;
            normalChecked = 1;
            date = nSchDate.split('"');
            $('#schedule_normal_post').datetimepicker({
                date: new Date(date[1])
            });
            $("#schedule_normal_div").show();
        }

        //schedule-category 1->dayWiseSchedule
        if(schCategory == 1){
            document.getElementById("day_schedule").checked = true;
            document.getElementById("sat").checked = true;
            daywsiseChecked = 1;
            if(dSchTimer.length > 0)
            {
                for(i=0;i<dSchTimer.length;i++)
                {
                    if(dSchTimer[i]['dayId'] == 0){
                        document.getElementById("sun").checked = true;
                        document.getElementById("sun").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 1) {
                        document.getElementById("mon").checked = true;
                        document.getElementById("mon").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 2){
                        document.getElementById("tue").checked = true;
                        document.getElementById("tue").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 3){
                        document.getElementById("wed").checked = true;
                        document.getElementById("wed").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 4){
                        document.getElementById("thu").checked = true;
                        document.getElementById("thu").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 5){
                        document.getElementById("fri").checked = true;
                        document.getElementById("fri").closest('.btn').classList.add("active")
                    }
                    else if(dSchTimer[i]['dayId'] == 6){
                        document.getElementById("sat").checked = true;
                        document.getElementById("sat").closest('.btn').classList.add("active");
                    }
                }
            }
            $('#day_wise_schedule_div').datetimepicker({
                date: new Date(dSchTimer[0]['timings'][0])
            });
            $("#day_wise_schedule_div").show();
        }

        //append media to media-list
        if(media.length > 0){
            var appenddata = '';
            for(i=0; i<media.length; i++) {
                value = "<?php echo env('API_URL_PUBLISH'); ?>"+media[i];
                if(value.indexOf(".mp4") >= 1){
                    appenddata += '<li><img src="'+value+'" name="'+media[i]+'" title="undefined"><div class="post-thumb"><div class="inner-post-thumb"><a href="javascript:void(0);" data-id="'+media[i]+'" class="remove-pic"><i class="fa fa-times" aria-hidden="true"></i></a><div></div></div></div></li>';
                }
               else if(value.indexOf(".mp4") >= 1){
                   document.getElementById("pills-pinterest-profile-tab").style.display = "none";
                   appenddata +=  '<li><video src="'+value+'" name="'+media[i]+'" title="undefined"></video><div class="post-thumb"><div  class="inner-post-thumb"><a data-id="' +media[i]+ '" href="javascript:void(0);" class="remove-pic"><i class="fa fa-times" aria-hidden="true"></i></a><div></div></li>';
               }else{
                appenddata += '<li><img src="'+value+'" name="'+media[i]+'" title="undefined"><div class="post-thumb"><div class="inner-post-thumb"><a href="javascript:void(0);" data-id="'+media[i]+'" class="remove-pic"><i class="fa fa-times" aria-hidden="true"></i></a><div></div></div></div></li>';
               }
            };
            $('#hint_brand').css("display", "block");
            $('#media-list').prepend(appenddata);
        }

        //check account-type and account-id
        if(postingSocIds.length > 0){
            $('.all_social_div').css({
                'display': 'block'
            });
            $('.all_social_btn').css({
                'display': 'none'
            });
            for(i=0; i<postingSocIds.length; i++){
                document.getElementById(postingSocIds[i]['accountId']).checked = true;



            }
            if(pinBrds != "") $("#profile_pin_1").show();
        }

        function editSchedule(schId){
            var form = document.getElementById('scheduleForm');
            var formData = new FormData(form);

            //for accounts
            $('#checkboxes input:checked').each(function() {
                selected.push($(this).attr('name'));
            });
            //for pinterest boards
            $('#boardsCheckbox input:checked').each(function() {
                selectedBoards.push($(this).attr('name'));
            });
            //for days selected
            $('#daywiseDayCheck input:checked').each(function() {
                selectDays.push($(this).attr('name'));
            });
            var testArray = ["/images/1570172425.gif", "/images/1570172425.jpg"];
            formData.append('checked',selected);
            formData.append('selectDays',selectDays);
            formData.append('scheduleType',schCategory);
            formData.append('daywsiseChecked',daywsiseChecked);
            formData.append('normalChecked',normalChecked);
            formData.append('normalDateTime',$('#schedule_normal_post').val());
            formData.append('dayWiseDateTime',$('#day_schedule_post').val());
            formData.append('selectedBoards',selectedBoards);
            formData.append('mediaUploaded', JSON.stringify(media));
            formData.append('scheduleId',schId);
            formData.append('teamId', tId);
            formData.append('scheduleStatus', schStatus);

            $.ajax({
                url: "/edit-schedule-post",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){
                    $('#messageError').text("");

                    if(schStatus == 1){
                        $('#test').show();
                        $('#testText').html('Editing');
                    }else if(schStatus == 5){
                        $('#draftspinstyle').show();
                        $('#draftspin').html('Editing');
                    }
                },
                success: function (response) {

                    if(schStatus == 1){
                        $('#test').hide();
                        $('#testText').html('Edit Schedule Post');
                        $("#test").attr("disabled", true);
                    }else if(schStatus == 5){
                        $('#draftspinstyle').hide();
                        $('#draftspin').html('Edit Draft');
                        $("#draftspinstyle").attr("disabled", true);
                    }
                    if(response.code == 404){
                        console.log(response.message)
                        $('#messageError').text(response.message);
                    }else if(response.code == 400){
                        swal(response.message);
                    }else if(response.code == 200){
                        document.getElementById("scheduleForm").reset();
                        swal(response.message);
                        document.getElementById("scheduleForm").reset();
                        window.location.href = "{{env('APP_URL')}}post_history";
                    }else if(response.code == 500){
                        swal("Something went wrong... Please try again after sometime");
                        document.getElementById("scheduleForm").reset();
                        $(".emojionearea-editor").text("");
                        $("#schedule_normal_post").text("");
                        $("#day_schedule_postt").text("");
                        $('#normalChecked').attr('checked', false);
                        $('#dayChecked').attr('checked', false);
                        $("#hint_brand").css("display","none");
                        $("#option_upload").css("display","block");
                    }
                },
                error:function(error){
                    console.log(error);
                    swal("Something went wrong... Please try again after sometime");
                    $('#scheduleForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    $("#schedule_normal_post").text("");
                    $("#day_schedule_postt").text("");
                    $('#normalChecked').attr('checked', false);
                    $('#dayChecked').attr('checked', false);
                    $("#hint_brand").css("display","none");
                    $("#option_upload").css("display","block");
                }
            })

        }
    </script>




    <script>
        //for GA
        var eventCategory = 'Schedule';
        var eventAction = 'Schedule-Messages';


        // schedule post emoji
        $("#schedule_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // schedule_post
        $(function () {
            // schedule_post normal
            $('#schedule_normal_post').datetimepicker({
                minDate:moment()
            });
            // day wise schedule post
            $('#day_schedule_post').datetimepicker({
                minDate:moment()
            });
        });


        $(".schedule_normal_post").click(function () {

            if ($(this).is(":checked")) {
                normalChecked = 1;
                $("#schedule_normal_div").show();
            } else {
                normalChecked = 0;
                $("#schedule_normal_div").hide();
            }
        });

        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                daywsiseChecked = 1;
                $("#day_wise_schedule_div").show();
            } else {
                daywsiseChecked = 0;
                $("#day_wise_schedule_div").hide();
            }
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
        $(function () {

            var names = [];

            $('body').on('change', '.picupload', function (event) {
                var getAttr = $(this).attr('click-type');
                var files = event.target.files;
                var output = document.getElementById("media-list");
                var z = 0
                if (getAttr == 'type1') {
//                    $('#media-list').html('');
//                $('#media-list').html('<li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" multiple></span></li>');
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
                            picReader.fileName = file.name
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
                            picReader.fileName = file.name
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
                if (yet != -1) names.splice(yet, 1);
                var rem = media.indexOf(removeItem);
                if(rem != -1) media.splice(rem, 1);
                // return array of file name
                $('#option_upload').css("display", "block");

            });
            $('#hint_brand').on('hide', function (e) {
                names = [];
                z = 0;
            });
        });

    </script>
    <script>
        function makeSchedule(schId){
            var form = document.getElementById('scheduleForm');
//var checking = $('')
            var formData = new FormData(form);
            var selectDays = [];
            var selected = [];
            var selectedBoards = [];

            //for accounts
            $('#checkboxes input:checked').each(function() {
                selected.push($(this).attr('name'));
            });
            $('#boardsCheckbox input:checked').each(function() {
                selectedBoards.push($(this).attr('name'));
            });
            //for days selected
            $('#daywiseDayCheck input:checked').each(function() {
                selectDays.push($(this).attr('name'));
            });


            formData.append('checked',selected);
            formData.append('selectDays',selectDays);
            formData.append('scheduleType',1);
            formData.append('daywsiseChecked',daywsiseChecked);
            formData.append('normalChecked',normalChecked);
            formData.append('normalDateTime',$('#schedule_normal_post').val());
            formData.append('dayWiseDateTime',$('#day_schedule_post').val());
            formData.append('selectedBoards',selectedBoards);
            formData.append('mediaUploaded', JSON.stringify(media));
            formData.append('scheduleId',schId);
            formData.append('scheduleStatus', 1);
            formData.append('draftToSchedule', 1);

            $.ajax({
                url: "/schedule_post",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){
                    $('#messageError').text("");
                    $('#testText').html('Scheduling....');
                    $("#test").attr("disabled", true);

                },
                success: function (response) {

                    if(response.code == 404){
                        console.log(response.message)
                        $('#messageError').text(response.message);
                    }else if(response.code == 400){
                        swal(response.message);
                    }else if(response.code == 200){
                        swal(response.message);
                        document.getElementById("scheduleForm").reset();
                        $('#normalChecked').attr('checked', false);
                        $('#dayChecked').attr('checked', false);
                        $("#schedule_normal_post").text("");
                        $("#day_schedule_postt").text("");
                        $(".emojionearea-editor").text("");
                        $("#hint_brand").css("display","none");
                        $("#option_upload").css("display","block");
                        window.location.href = "{{env('APP_URL')}}post_history";
                    }else if(response.code == 500){
                        swal("Something went wrong... Please try again after sometime");
                        document.getElementById("scheduleForm").reset();
                        $(".emojionearea-editor").text("");
                        $("#schedule_normal_post").text("");
                        $("#day_schedule_postt").text("");
                        $('#normalChecked').attr('checked', false);
                        $('#dayChecked').attr('checked', false);
                        $("#hint_brand").css("display","none");
                        $("#option_upload").css("display","block");
                    }
                },
                error:function(error){
                    console.log(error)
                    swal("Something went wrong... Please try again after sometime");
                    $('#scheduleForm').trigger("reset");
                    $(".emojionearea-editor").text("");
                    $("#schedule_normal_post").text("");
                    $("#day_schedule_postt").text("");
                    $('#normalChecked').attr('checked', false);
                    $('#dayChecked').attr('checked', false);
                    $("#hint_brand").css("display","none");
                    $("#option_upload").css("display","block");
                }
            })

        }
    </script>
@endsection
