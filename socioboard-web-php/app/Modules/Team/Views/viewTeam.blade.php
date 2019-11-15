@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | View Team</title>
@endsection

@section('style')
    <style type="text/css">
        .droptarget {
            float: left;
            width: 100%;
            min-height: 200px;
            padding: 1px;
            border: 1px solid #f8f9fa;
        }
    </style>

@endsection

{{--@section('nav')--}}
{{--<ul class="navbar-nav">--}}
{{--<li class="nav-item dropdown">--}}
{{--<a class="nav-link dropdown-toggle dropdown-toggle-none-c" href="#" id="teamNavbarDropdown" role="button"--}}
{{--data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">--}}
{{--<i class="fas fa-chalkboard-teacher text-primary" data-toggle="tooltip" data-placement="bottom" title="Teams"></i>--}}
{{--</a>--}}
{{--@if(session()->has('team'))--}}
{{--                {{session()->get('team')['teamSocialAccountDetails'][0][0]->team_id}}--}}
{{--<div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">--}}
{{--@for ($i = 0; $i < count(session()->get('team')['teamSocialAccountDetails']); $i++)--}}
{{--<a class="dropdown-item"  href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}" id="{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}">{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_name}}</a>--}}

{{--@endfor--}}
{{--<div class="dropdown-divider"></div>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}view-team/{{session()->get('currentTeam')['team_id']}}" id="">View Team</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>--}}

{{--</div>--}}
{{--@else--}}
{{--<div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">--}}
{{--<a class="dropdown-item active" href="#">SocioBoard</a>--}}
{{--<div class="dropdown-divider"></div>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}view-team?id=">View Team</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>--}}
{{--</div>--}}
{{--@endif--}}
{{--</li>--}}
{{--</ul>--}}
{{--@endsection--}}
@section('viewTeam')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4 class="mb-0">User And Teams </h4>
            <p>Teams are used to categorize social profiles together to help manage and report on your social
                media efforts efficiently. Learn more about Teams </p>
        </div>
    </div>
    <div class="row">
        <div class="col-md-3">
            <div class="card mb-4 border-0 shadow">
                <div class="card-body">
                    <h5>{{$teamDetails['team_name']}}</h5>
                    <hr>
                    @if($defaultTeam == 1)
                        <p>This is By default team...</p>
                    @endif
                    <p>Admin of <span class="text-primary">{{$teamDetails['team_name']}}</span> Team</p>

                    <dl>
                        <dt>Name :</dt>
                        <dd>{{$adminDetails['first_name']}}</dd>
                        <dt>Email Id :</dt>
                        <dd>{{$adminDetails['email']}}</dd>
                    </dl>
                    {{--<button onclick="editTeam()" class="btn btn-sm btn-light shadow-sm" data-toggle="tooltip"--}}
                    {{--data-placement="top" title="edit"><i class="fas fa-pencil-alt text-info"></i></button>--}}
                    @if($defaultTeam != 1)
                    <a href="javascript:void(0);" class="btn btn-sm btn-light shadow-sm" data-toggle="modal"
                       data-target="#editTeamsModal"><i class="fas fa-pencil-alt text-info"></i></a>

                        <button onclick="checkAdmin()"   id="deleteTeam" value="{{$teamDetails['team_id']}}" class="btn btn-sm btn-light shadow-sm"  data-toggle="tooltip"
                                data-placement="top" title="delete"><i class="far fa-trash-alt text-danger"></i></button>
                    @endif
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0">
                <div class="card-body pl-1 pr-1">
                    <h6 class="text-center">Profile Linked To <span class="text-primary">{{$teamDetails['team_name']}}</span> </h6>
                    <div class="div_scroll card-height">
                        <div class="droptarget" id="add">
                            @if($teamDetails['SocialAccount'] != null)
                                @for($i=0;$i<count($teamDetails['SocialAccount']);$i++)
                                    <div class="bg-light media mb-1" id="dragtarget{{$teamDetails['SocialAccount'][$i]->account_id}}" draggable="true">
                                        <img src="{{$teamDetails['SocialAccount'][$i]->profile_pic_url}}" class="rounded-circle mr-1 pp_50"
                                             alt="avatar">
                                        <div class="media-body">
                                            <h5 class="mt-1 mb-0">{{$teamDetails['SocialAccount'][$i]->first_name}}</h5>
                                            @switch($teamDetails['SocialAccount'][$i]->account_type )
                                            @case(1)
                                            <small class="text-truncate">{{env('ACCOUNT_FB')}}</small>
                                            @break
                                            @case(2)
                                            <small class="text-truncate">{{env('ACCOUNT_FBPAGE')}}</small>
                                            @break
                                            @case(3)
                                            <small class="text-truncate">{{env('ACCOUNT_FBGROUP')}}</small>
                                            @break
                                            @case(4)
                                            <small class="text-truncate">{{env('ACCOUNT_TWITTER')}}</small>
                                            @break
                                            @case(5)
                                            <small class="text-truncate">{{env('ACCOUNT_INSTA')}}</small>
                                            @break
                                            @case(6)
                                            <small class="text-truncate">{{env('ACCOUNT_LINKEDIN')}}</small>
                                            @break
                                            @case(7)
                                            <small class="text-truncate">{{env('ACCOUNT_LINKEDINBUSINESS')}}</small>
                                            @break
                                            @case(8)
                                            <small class="text-truncate">{{env('ACCOUNT_GPLUS')}}</small>
                                            @break
                                            @case(9)
                                            <small class="text-truncate">{{env('ACCOUNT_YOUTUBE')}}</small>
                                            @break
                                            @case(10)
                                            <small class="text-truncate">{{env('ACCOUNT_GANALYTICS')}}</small>
                                            @break
                                            @case(11)
                                            <small class="text-truncate">{{env('ACCOUNT_PINTEREST')}}</small>
                                            @break
                                            @case(12)
                                            <small class="text-truncate">{{env('ACCOUNT_INSTA_BUSINESS')}}</small>
                                            @break

                                            @default
                                            <p> No profiles available for </p>
                                            @endswitch


                                        </div>
                                        {{--<span onclick="deleteTeamSocProfile({{$teamDetails['SocialAccount'][$i]->account_id}})" title="Delete this account" class="float-right"><i class="far fa-times-circle"></i></span>--}}
                                    </div>
                                @endfor
                            @else
                                <p> No profiles available for </p>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0">
                <div class="card-body pl-1 pr-1">
                    <h6 class="text-center">Profiles <span class="text-primary">Available</span> for Connection
                    </h6>
                    <p id="info_profile_text" class="text-center">Drag profile to add in your team</p>

                    @if( $profileAvailablecount != 0)
                        <div class="div_scroll card-height">
                            <div class="droptarget" id="delete">
                                {{--{{$profilesAvailable[0]->account_id}}--}}
                                @for($i=0;$i<count($profilesAvailable);$i++)

                                    <div class="bg-light media mb-1 " id="dragtarget{{$profilesAvailable[$i]->account_id}}"  draggable="true">
                                        <img src="{{$profilesAvailable[$i]->profile_pic_url}}" class="rounded-circle mr-1 pp_50" alt="avatar">
                                        <div class="media-body">
                                            <h5 class="mt-1 mb-0">{{$profilesAvailable[$i]->first_name}}</h5>

                                            @switch($profilesAvailable[$i]->account_type)
                                            @case(1)
                                            <small class="text-truncate">{{env('ACCOUNT_FB')}}</small>
                                            @break
                                            @case(2)
                                            <small class="text-truncate">{{env('ACCOUNT_FBPAGE')}}</small>
                                            @break
                                            @case(3)
                                            <small class="text-truncate">{{env('ACCOUNT_FBGROUP')}}</small>
                                            @break
                                            @case(4)
                                            <small class="text-truncate">{{env('ACCOUNT_TWITTER')}}</small>
                                            @break
                                            @case(5)
                                            <small class="text-truncate">{{env('ACCOUNT_INSTA')}}</small>
                                            @break
                                            @case(6)
                                            <small class="text-truncate">{{env('ACCOUNT_LINKEDIN')}}</small>
                                            @break
                                            @case(7)
                                            <small class="text-truncate">{{env('ACCOUNT_LINKEDINBUSINESS')}}</small>
                                            @break
                                            @case(8)
                                            <small class="text-truncate">{{env('ACCOUNT_GPLUS')}}</small>
                                            @break
                                            @case(9)
                                            <small class="text-truncate">{{env('ACCOUNT_YOUTUBE')}}</small>
                                            @break
                                            @case(10)
                                            <small class="text-truncate">{{env('ACCOUNT_GANALYTICS')}}</small>
                                            @break
                                            @case(11)
                                            <small class="text-truncate">{{env('ACCOUNT_PINTEREST')}}</small>
                                            @break
                                            @case(12)
                                            <small class="text-truncate">{{env('ACCOUNT_INSTA_BUSINESS')}}</small>
                                            @break

                                            @default
                                            <p> No profiles available for </p>
                                            @endswitch
                                        </div>
                                    </div>

                                @endfor
                            </div>
                        </div>

                    @else
                        <p> No profiles available for </p>
                    @endif
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0">
                <div class="card-body pl-1 pr-1">
                    <h6 class="text-center">Accepted Team Members </h6>
                    <div class="div_scroll card-height">
                        @for($i=0;$i<count($teamMemeberActivation);$i++)
                            <div class="bg-light media mb-1">
                                <img src="{{$teamMemeberActivation[$i]->profile}}" class="rounded-circle mr-1 pp_50" alt="avatar">
                                <div class="media-body">
                                    <h5 class="mt-1 mb-0">{{$teamMemeberActivation[$i]->first_name}}</h5>
                                    @if($teamMemeberActivation[$i]->invitation_accepted == true)
                                        <small class="text-success">accepted</small>
                                        @if($adminDetails['email'] !== $teamMemeberActivation[$i]->email )
                                            @if($adminDetails['email'] !== session('user')['userDetails']->email)
                                                <div class="float-right">
                                                    <button  class="btn btn-primary btn-sm quit-team" data-toggle="tooltip" data-placement="top" id="{{$teamMemeberActivation[$i]->email}}+{{$teamMemeberActivation[$i]->team_id}}+{{$teamMemeberActivation[$i]->user_id}}" title="Quit Team"><i class="fas fa-sign-out-alt "></i></button>
                                                </div>
                                            @else
                                                <div class="float-right">
                                                    <button class="btn btn-primary btn-sm remove" data-toggle="tooltip" data-placement="top" id="{{$teamMemeberActivation[$i]->email}}+{{$teamMemeberActivation[$i]->team_id}}+{{$teamMemeberActivation[$i]->user_id}}" title="Remove"><i class="fas fa-user-minus"></i></button>
                                                </div>
                                            @endif
                                        @endif
                                    @else
                                        <div class="float-right">
                                            <button class="btn btn-primary btn-sm withdraw" data-toggle="tooltip" data-placement="top" id="{{$teamMemeberActivation[$i]->email}}+{{$teamMemeberActivation[$i]->team_id}}" title="Withdraw invitation"><i class="fas fa-door-closed"></i></button>
                                        </div>
                                        <small class="text-danger">pending</small>

                                    @endif
                                </div>
                            </div>
                        @endfor
                    </div>
                    <hr>
                    <div class="bg-light text-center mt-1">
                        <a href="javascript:void(0);" class="text-dark" onclick="add_profile_show()">
                            <b><i class="far fa-envelope-open"></i> Invite New Team Member</b>
                        </a>
                    </div>
                    <div class="card-body p-1 bg-light hide" id="profile_add_div">
                        <form id="inviteUser">
                            <p id="invite_mail" style="color: red"></p>
                            {{--<div class="form-group">--}}
                            {{--<label for="permission_option">Select Permission</label>--}}
                            {{--<select name="permission" class="form-control  border-0" id="permission_option">--}}
                            {{--<option selected disabled>Select option</option>--}}
                            {{--<option value="0" selected>Approval required</option>--}}
                            {{--<option value="1">Full permission</option>--}}
                            {{--</select>--}}
                            {{--</div>--}}
                            <div class="form-group">
                                <label for="exampleInputEmail1">Email address</label>
                                <input type="email" class="form-control border-0" id="exampleInputEmail1"
                                       aria-describedby="emailHelp" name="inviteUserMail" placeholder="Enter email">
                            </div>
                            <button type="submit" class="btn btn-primary btn-sm col-12">Add</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <input style="display:none" id="teamId" value="{{$teamDetails['team_id']}}">


    <!-- team edit Modal -->
    <div class="modal fade" id="editTeamsModal" tabindex="-1" role="dialog" aria-labelledby="editTeamsModalLabel"
         aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editTeamsModalLabel">Edit Team</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="editTeam">
                        <div class="form-group">
                            <label for="teamName">Team Name</label>
                            <input pattern=".{4,64}" type="text" class="form-control" id="teamName" aria-describedby="emailHelp"
                                   name="teamName"  title="min 4 and max 64 characters" placeholder="Enter team name">
                        </div>
                        <div class="form-group">
                            <label for="teamdescription">Team Description</label>
                            <textarea class="form-control" id="teamdescription" aria-describedby="emailHelp"
                                      name="teamDesc"         placeholder="Enter team description"></textarea>
                        </div>
                        <div class="float-right">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-primary">Update</button>
                        </div>
                    </form>
                </div>
                {{--<div class="modal-footer">--}}
                {{--<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>--}}
                {{--<button type="button" class="btn btn-primary">Update</button>--}}
                {{--</div>--}}
            </div>
        </div>
    </div>

@endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'Team';
        var eventAction = 'View-Team';
        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
        })

        var team= $('#teamId').val();
        // show app profile script
        function add_profile_show() {
            $("#profile_add_div").removeClass("hide");
        }



        function checkAdmin(){
            var team = $('#deleteTeam').val();
            $.ajax({
                url: "/delete-team",
                type: 'POST',
                data:{
                    "teamId":team
                },
                beforeSend:function(){
                },
                success: function (response) {
                    /*
                     * 200 => success
                     * 500 => Something went wrong(Exception)
                     * 400 => Access denied*/
                    if(response.code == 200){
                        alert(response.message);
                        // redirect to create team
                        window.location.href = "{{env('APP_URL')}}create-team";
                    }else if(response.code == 400){
                        alert(response.message);
                    }else if(response.code == 400){
                        alert(response.message);
                    }
                },
                error:function(error){
                    alert("Something went wrong.. Not able to delete team")
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        $(document).on('submit','#inviteUser',function(e){
            var team1 = $('#teamId').val();
            e.preventDefault();
            var form = document.getElementById('inviteUser');
            var formData = new FormData(form);
            $.ajax({
                url: "/invite-team/"+team1,
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){
                    $('#invite_mail').text("");
                },
                success: function (response) {
                    /*202=>validation error
                     * 200 =>success
                     * 400=>access denied, email not found
                     * 500 => exception
                     * */
                    if(response.code == 202){
                        console.log(response.errors)
                        if(response.errors.inviteUserMail!=null){
                            $('#invite_mail').text(response.errors.inviteUserMail[0]);
                        }
                    }else if(response.code == 200){
                        swal(response.message);
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    }else if(response.code == 400){
                        $('#invite_mail').text(response.message);
                    }else{
                        $('#invite_mail').text("Not able to send invitation");

                    }
                },
                error:function(error){
                    $('#invite_mail').text("Not able to send invitation");
                }
            })
        });

        $(document).on('submit','#editTeam',function(e){
            e.preventDefault();
            var form = document.getElementById('editTeam');
            var formData = new FormData(form);
            formData.append('teamId',team);
            $.ajax({
                url: "/edit-team",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){

                },
                success: function (response) {
                    //200 => success, 400=> Not able to edit team currently, 500=> Something went wrong from our side:(



                    if(response.code == 500){
                        swal({
                            type: "danger",
                            text: response.message
                        });
                    }else if(response.code == 200){
                        swal(response.message);
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    }else if(response.code == 400){
                        swal({
                            type: "danger",
                            text: response.message
                        });
                    }else{

                    }
                },
                error:function(error){
                    $('#invite_mail').text("Not able to send invitation");
                }
            })
        });

        //withdraw invitation
        $(document).on('click','.withdraw',function(){

            var data = $(this).attr('id');
            $.ajax({
                type: "POST",
                url: "/withdraw-invitation",
                data: {
                    data: data
                },
                success: function(response){
                    if(response.code === 200 ){
                        swal(response.message);
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    }
                },
                error: function (error) {
                    console.log(error)
                    swal("Not able to accept invitation");
                }
            });
        })

        //remove member
        $(document).on('click','.remove',function(){
            var data = $(this).attr('id');
            $.ajax({
                type: "POST",
                url: "/remove-member",
                data: {
                    data: data
                },
                success: function(response){
                    if(response.code === 200 ){
                        swal(response.message);
                        setTimeout(function() {
                            location.reload();
                        }, 1000);
                    }
                },
                error: function (error) {
                    console.log(error)
                    swal("Not able to remove!!");
                }
            });
        })

        //leave team
        $(document).on('click','.quit-team',function(){

            var teamData = $(this).attr('id');
            $.ajax({
                type: "POST",
                url: "/leave-team",
                data: {
                    data: teamData
                },
                success: function(response){
                    if(response.code === 200 ){
                        swal(response.message);

                        window.location ='{{env('APP_URL')}}dashboard/'+response.owner;
//                        setTimeout(function() {APP_URL
//                            location.reload();
//                        }, 1000);

                    }
                },
                error: function (error) {
                    console.log(error)
                    swal("Not able to leave the team currently!!");
                }
            });
        })
    </script>
    <!-- for drag and drop profile -->
    <script>
        /* Events fired on the drag target */
        document.addEventListener("dragstart", function (event) {
            // The dataTransfer.setData() method sets the data type and the value of the dragged data
            event.dataTransfer.setData("Text", event.target.id);

            // Output some text when starting to drag the profile element
            document.getElementById("info_profile_text").innerHTML = "Started to drag the profile.";

            // Change the opacity of the draggable element
            event.target.style.opacity = "0.4";
        });

        // While dragging the profile element, change the color of the output text
        document.addEventListener("drag", function (event) {
            document.getElementById("info_profile_text").style.color = "red";
        });

        // Output some text when finished dragging the profile element and reset the opacity
        document.addEventListener("dragend", function (event) {
            document.getElementById("info_profile_text").innerHTML = "Finished dragging the profile.";
            event.target.style.opacity = "1";
        });

        /* Events fired on the drop target */

        // When the draggable profile element enters the droptarget, change the DIVS's border style
        document.addEventListener("dragenter", function (event) {
            if (event.target.className == "droptarget") {
                event.target.style.border = "3px dotted red";
            }
        });

        // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
        document.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        // When the draggable profile element leaves the droptarget, reset the DIVS's border style
        document.addEventListener("dragleave", function (event) {
            if (event.target.className == "droptarget") {
                event.target.style.border = "";
            }
        });

        /* On drop - Prevent the browser default handling of the data (default is open as link on drop)
         Reset the color of the output text and DIV's border color
         Get the dragged data with the dataTransfer.getData() method
         The dragged data is the id of the dragged element ("drag1")
         Append the dragged element into the drop element
         */
        document.addEventListener("drop", function (event) {
            event.preventDefault();
            if (event.target.className == "droptarget") {
                document.getElementById("info_profile_text").style.color = "";
                event.target.style.border = "";
                var data = event.dataTransfer.getData("Text");
                event.target.appendChild(document.getElementById(data));
                var ac =data.split("dragtarget")[1];

                if($(event.target).attr('id') == 'add') {
                    $.ajax({
                        url: "/addToOtherTeam",
                        data: {
                            'teamId':$('#teamId').val(),
                            'accountId':ac
                        },
                        type: 'POST',
                        beforeSend:function(){
                        },
                        success: function (response) {
                            /*202=>validation error
                             * 200 =>success
                             * 400=>access denied, email not found
                             * 500 => exception
                             * */

                            if(response.code == 202){

                            }else if(response.code == 200){

                            }else if(response.code == 400){

                            }else{
                            }
                        },
                        error:function(error){

                        }
                    })






                }

                if($(event.target).attr('id') == 'delete') {
                    $.ajax({
                        url: "/deleteTeamSocialProfile",
                        data: {
                            'teamId':$('#teamId').val(),
                            'accountId':ac
                        },
                        type: 'POST',
                        beforeSend:function(){
                        },
                        success: function (response) {

                            if(response.code == 202){

                            }else if(response.code == 200){

                            }else if(response.code == 400){

                            }else{
                            }
                        },
                        error:function(error){

                        }
                    })






                }


            }
        });
    </script>
@endsection
