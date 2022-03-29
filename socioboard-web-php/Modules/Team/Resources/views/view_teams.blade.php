@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} - View Teams</title>
@endsection
@section('content')
    <div class="subheader py-2 py-lg-4  subheader-transparent">
        <div class="container-fluid  d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
            <!--begin::Details-->
            <div class="d-flex align-items-center flex-wrap mr-2">

                <!--begin::Separator-->
                <div class="subheader-separator subheader-separator-ver mt-2 mb-2 mr-5 bg-gray-200"></div>
                <!--end::Separator-->

                <!--begin::Search Form-->
                <div class="d-flex align-items-center flex-wrap mr-2 mb-3" >
                    @if(isset($accounts) && isset($accounts['data']->teamSocialAccountDetails))

                            <h5 class="font-weight-bold mt-2 mb-2 mr-5">Teams (<span class="font-weight-bold " id="count_data">{{count($accounts['data']->teamSocialAccountDetails)}})</h5>
                    @endif
                             <div class="subheader-separator subheader-separator-ver mt-2 mb-2 mr-5 bg-gray-200"></div>
                        <form class="ml-5" action="/search" method="post" >
                            @csrf
                        <div class="d-flex align-items-center searchButtonDiv" id=""    >
                            <!-- <span class="text-dark-50 font-weight-bold" id="">4 Total </span> -->
                                <div class="btn input-group input-group-sm input-group-solid" style="max-width: 400px; width:400px">
                                    <input type="text" class="form-control" id="team_name" name="team_name" placeholder="Search..." onkeyup="functionDisable()">
                                    <button class="btn" type="submit" id="submit_id"><i class="fas fa-search icon-lg"></i></button>
                                </div>
                        </div>
                            <br>
                            @if($errors->has('team_name'))
                                <div class="text-danger">{{ $errors->first('team_name') }}</div>
                            @endif
                        </form>
                </div>
                <!--end::Search Form-->
            </div>
            <!--end::Details-->

            <!--begin::Toolbar-->
            <div class="d-flex align-items-center">
                <!--begin::Button-->
                <a href="create-team" class="btn btn-light-primary font-weight-bold ml-2 createTeamDiv">Create Team</a>
                <!--end::Button-->
            </div>
            <!--end::Toolbar-->
        </div>
    </div>
    <!--begin::Entry-->
    <div class="d-flex flex-column-fluid">
        <!--begin::Container-->

        <div class=" container-fluid ">
            <!--begin::Teams-->
            <div class="card card-custom gutter-b card-stretch" id="ss-viewTeamsDiv">
                <div class="card-body">
                    @if(session()->has('message-success') != "")
                        @if(session()->has('message-success'))
                            <script>
                                toastr.error("result")
                            </script>
                        @endif
                    @endif
                    @if(session()->has('message-danger') != "")
                        @if(session()->has('message-danger'))
                            <p class="text-danger">{{session()->get('message-danger')}}</p>
                        @endif
                    @endif
                <!--begin::Top-->
                    @if(isset($accounts))
                        @if(isset($accounts['data']->teamSocialAccountDetails) && count($accounts['data']->teamSocialAccountDetails) > 0)
                            @if($accounts['code']  === 200 )
                                @php
                                    $members = $accounts['data']->memberProfileDetails;
                                    $admin = [];
                                @endphp
                                @foreach($accounts['data']->teamSocialAccountDetails as $account)
                                    @foreach($account as $data)
                                        <div id="team{{$data->team_id}}">
                                        <div class="d-flex">
                                            <!--begin::Pic-->
                                            @if($data->team_logo === 'www.socioboard.com' || $data->team_logo === "www.NA.com" )
                                            @if($data->is_team_locked)
                                                <div class="flex-shrink-0 mr-7 ribbon ribbon-clip ribbon-left">
                                                    <div class="ribbon-target" style="top: 12px;">
                                                        <span class="ribbon-inner bg-danger"></span> lock
                                                    </div>
                                                    <div class="symbol symbol-50 symbol-lg-120">
                                                        <img src="/media/logos/sb-icon.svg" onerror=" this.onerror=null;this.src='https://i.imgur.com/TMVAonx.png';" alt="SB"/>
                                                    </div>
                                                </div>
                                            @else
                                                <div class="flex-shrink-0 mr-7">
                                                    <div class="symbol symbol-50 symbol-lg-120">
                                                        <img src="/media/logos/sb-icon.svg" onerror=" this.onerror=null;this.src='https://i.imgur.com/TMVAonx.png';" alt="SB"/>
                                                    </div>
                                                </div>
                                        @endif
                                            @else
                                                @if($data->is_team_locked)
                                                    <div class="flex-shrink-0 mr-7 ribbon ribbon-clip ribbon-left">
                                                        <div class="ribbon-target" style="top: 12px;">
                                                            <span class="ribbon-inner bg-danger"></span> lock
                                                        </div>
                                                        <div class="symbol symbol-50 symbol-lg-120">
                                                            <img src="{{$data->team_logo}}" onerror=" this.onerror=null;this.src='https://i.imgur.com/TMVAonx.png';" alt="SB"/>
                                                        </div>
                                                    </div>
                                                @else
                                                    <div class="flex-shrink-0 mr-7">
                                                        <div class="symbol symbol-50 symbol-lg-120">
                                                            <img src="{{$data->team_logo}}" onerror=" this.onerror=null;this.src='https://i.imgur.com/TMVAonx.png';"  alt="SB"/>
                                                        </div>
                                                    </div>
                                            @endif
                                            @endif
                                        <!--end::Pic-->

                                            <!--begin: Info-->

                                            <div class="flex-grow-1">
                                                <!--begin::Title-->
                                                <div
                                                        class="d-flex align-items-center justify-content-between flex-wrap mt-2">
                                                    <!--begin::User-->
                                                    <div class="mr-3">
                                                        <!--begin::Name-->
                                                        <a href="/team/{{$data->team_id}}"
                                                           class="d-flex align-items-center text-hover-primary font-size-h5 font-weight-bold mr-3 teamNameDiv">
                                                            {{$data->team_name}}
                                                        </a>
                                                        <!--end::Name-->

                                                        <!--begin::Contacts-->
                                                        <div class="d-flex flex-wrap my-2">
                                                        <span
                                                                class="text-muted font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-gray-500 mr-1">
                                                                <i class="fas fa-user fa-fw"></i>
                                                            </span>
                                                            @foreach($members as $member)
                                                                @foreach($member as $user)
                                                                    @if($user->user_id === $data->team_admin_id)
                                                                        @php
                                                                            $admin = $user->first_name.' '.$user->last_name;
                                                                        @endphp
                                                                        @break($user->user_id === $data->team_admin_id)
                                                                    @endif
                                                                @endforeach
                                                            @endforeach
                                                            {{$admin}}
                                                        </span>
                                                        </div>
                                                        <!--end::Contacts-->
                                                    </div>
                                                    <!--begin::User-->

                                                    <!--begin::Teams Actions Dropdown-->
                                                    <div class="dropdown dropdown-inline ml-2 quickActionsDiv" data-toggle="tooltip"
                                                         title="Quick actions" data-placement="left">
                                                        <a href="javascript:;"
                                                           class="btn btn-hover-light-primary btn-sm btn-icon"
                                                           data-toggle="dropdown" aria-haspopup="true"
                                                           aria-expanded="false">
                                                            <i class="ki ki-bold-more-hor"></i>
                                                        </a>
                                                        <div
                                                                class="dropdown-menu p-0 m-0 dropdown-menu-md dropdown-menu-right">
                                                            <!--begin::Navigation-->
                                                            <ul class="navi navi-hover">
                                                                <li class="navi-item switchTeamDiv">
                                                                    <a href="javascript:;" class="navi-link"
                                                                       onclick="switchTeam({{$data->team_id}})">
                                                                    <span class="navi-text">
                                                                        <span class=" text-primary"><i
                                                                                    class="fas fa-random fa-fw text-primary"></i>&nbsp; Switch to {{$data->team_name}} Team</span>
                                                                    </span>
                                                                    </a>
                                                                </li>
                                                                <li class="navi-item viewTeamDiv">
                                                                    <a href="/team/{{$data->team_id}}"
                                                                       class="navi-link">
                                                                    <span class="navi-text">
                                                                        <span class=" text-info"><i
                                                                                    class="fas fa-street-view fa-fw text-info"></i>&nbsp; View This Team</span>
                                                                    </span>
                                                                    </a>
                                                                </li>
                                                                <li class="navi-item updateTeamDiv">
                                                                    <a href="" class="navi-link"
                                                                       data-toggle="modal"
                                                                       data-target="#teamUpdateModal{{$data->team_id}}">
                                                                    <span class="navi-text">
                                                                        <span class="text-success"><i
                                                                                    class="fas fa-user-edit fa-fw text-success"></i>&nbsp; Update This Team</span>
                                                                    </span>
                                                                    </a>
                                                                </li>
                                                                <li class="navi-item deleteTeamDiv">
                                                                    <a href="" class="navi-link"
                                                                       data-toggle="modal"
                                                                       data-target="#teamDeleteModal{{$data->team_id}}">
                                                                    <span class="navi-text">
                                                                        <span class="text-danger"><i
                                                                                    class="far fa-trash-alt fa-fw text-danger"></i> Delete This Team</span>
                                                                    </span>
                                                                    </a>
                                                                </li>
                                                                @if($data->is_team_locked)
                                                                    <li class="navi-item holdTeamDiv">
                                                                        <a href="javascript:;" class="navi-link"
                                                                           data-toggle="modal"
                                                                           data-target="#teamLockModal{{$data->team_id}}">
                                                                    <span class="navi-text">
                                                                        <span class="text-warning"><i
                                                                                    class="fas fa-user-clock fa-fw text-warning"></i>&nbsp; UnHold This Team</span>
                                                                    </span>
                                                                        </a>
                                                                    </li>
                                                                @else
                                                                    <li class="navi-item">
                                                                        <a href="javascript:;" class="navi-link"
                                                                           data-toggle="modal"
                                                                           data-target="#teamUnLockModal{{$data->team_id}}">
                                                                    <span class="navi-text">
                                                                        <span class="text-warning"><i
                                                                                    class="fas fa-user-clock fa-fw text-warning"></i>&nbsp; Hold This Team</span>
                                                                    </span>
                                                                        </a>
                                                                    </li>
                                                                @endif
                                                            </ul>
                                                            <!--end::Navigation-->

                                                        </div>
                                                    </div>
                                                    <!--end::Teams Actions Dropdown-->
                                                </div>
                                                <!--end::Title-->

                                                <!--begin::Content-->
                                            {{--                                                <div--}}
                                            {{--                                                    class="d-flex align-items-center flex-wrap justify-content-between">--}}
                                            {{--                                                    <!--begin::Description-->--}}
                                            {{--                                                    <div class="flex-grow-1 font-weight-bold py-2 py-lg-2 mr-5">--}}
                                            {{--                                                        <i class="fas fa-bell fa-fw"></i> 23 pending messages--}}
                                            {{--                                                    </div>--}}
                                            {{--                                                    <!--end::Description-->--}}
                                            {{--                                                </div>--}}
                                            <!--end::Content-->
                                            </div>

                                            <!--end::Info-->

                                            <!-- begin::Delete team modal-->
                                            <div class="modal fade" id="teamDeleteModal{{$data->team_id}}" tabindex="-1"
                                                 role="dialog"
                                                 aria-labelledby="teamDeleteModalLabel"
                                                 aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered modal-lg"
                                                     role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="teamDeleteModalLabel">Delete
                                                                Team</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                <i aria-hidden="true" class="ki ki-close"></i>
                                                            </button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="text-center">
                                                                <img
                                                                        src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                                                                <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this team?</span>
                                                            </div>
                                                            <div class="d-flex justify-content-center">
                                                                <button type="submit"
                                                                        onclick="deleteIt('{{$data->team_id}}')"
                                                                        class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                        id="{{$data->team_id}}" data-dismiss="modal">
                                                                    Delete It
                                                                </button>
                                                                <a href="javascript:;" type="button"
                                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                   data-dismiss="modal">No
                                                                    Thanks.</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end::Delete account modal-->

                                            <!-- begin::Delete team modal-->
                                            <div class="modal fade" id="teamLockModal{{$data->team_id}}" tabindex="-1"
                                                 role="dialog"
                                                 aria-labelledby="teamLockModalLabel"
                                                 aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered modal-lg"
                                                     role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="teamLockModalLabel">Un-Hold
                                                                Team</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                <i aria-hidden="true" class="ki ki-close"></i>
                                                            </button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="text-center">
                                                                <img
                                                                        src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                                                                <span class="font-weight-bolder font-size-h4 ">Are you sure wanna Un-Hold this team?</span>
                                                            </div>
                                                            <div class="d-flex justify-content-center">
                                                                <button onclick="unHold('{{$data->team_id}}')"
                                                                        type="submit"
                                                                        class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                        id="{{$data->team_id}}" data-dismiss="modal">
                                                                    Un-Hold it!!
                                                                </button>
                                                                <a href="javascript:;" type="button"
                                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                   data-dismiss="modal">No
                                                                    thanks.</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end::Delete account modal-->

                                            <!-- begin::Hold team modal-->
                                            <div class="modal fade" id="teamUnLockModal{{$data->team_id}}" tabindex="-1"
                                                 role="dialog"
                                                 aria-labelledby="teamUnLockModalLabel"
                                                 aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered modal-lg"
                                                     role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="teamUnLockModalLabel">Hold
                                                                Team</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                <i aria-hidden="true" class="ki ki-close"></i>
                                                            </button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="text-center">
                                                                <img
                                                                        src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                                                                <span class="font-weight-bolder font-size-h4 ">Are you sure wanna Hold this team?</span>
                                                            </div>
                                                            <div class="d-flex justify-content-center">
                                                                <button onclick="hold('{{$data->team_id}}')"
                                                                        type="submit"
                                                                        class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                        id="{{$data->team_id}}" data-dismiss="modal">
                                                                    Hold It
                                                                </button>
                                                                <a href="javascript:;" type="button"
                                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                   data-dismiss="modal">No
                                                                    Thanks.</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end::Hold account modal-->
                                            <!-- begin::Update team modal-->
                                            <div class="modal fade" id="teamUpdateModal{{$data->team_id}}" tabindex="-1"
                                                 role="dialog"
                                                 aria-labelledby="teamDUpdateModalLabel"
                                                 aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered modal-lg"
                                                     role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="teamUpdateModalLabel">Update
                                                                Team</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                <i aria-hidden="true" class="ki ki-close"></i>
                                                            </button>
                                                        </div>
                                                        <form id="update_data{{$data->team_id}}">
                                                            @csrf
                                                            <div class="modal-body">
                                                                <!--begin::Form group-->

                                                                <div class="form-group">
                                                                    <div class="input-icon">
                                                                        <input
                                                                                class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                                                                type="text" name="team_name"
                                                                                value="{{$data->team_name}}"
                                                                                id="team_name{{$data->team_id}}"
                                                                                placeholder="Team Name"/>
                                                                        <input type="hidden" id="old_pic{{$data->team_id}}" value="{{$data->team_logo}}" name="old_pic">
                                                                        <span><i class="fas fa-users"></i></span>
                                                                    </div>
                                                                </div>

                                                                <!--end::Form group-->
                                                                <div
                                                                        class="image-input image-input-empty image-input-outline profile-pic{{$data->team_id}}"
                                                                        id="Sb_team_pic{{$data->team_id}}"
                                                                        style="background-image: url({{$data->team_logo}})">
                                                                    <div class="image-input-wrapper"></div>
                                                                    <label
                                                                            class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                                            data-action="change" data-toggle="tooltip"
                                                                            title=""
                                                                            data-original-title="Change avatar">
                                                                        <i class="fas fa-pen icon-sm text-muted upload-button{{$data->team_id}}"></i>
                                                                        <input type="file" name="profile_avatar"
                                                                               id="profile{{$data->team_id}}"
                                                                               class="file-upload"
                                                                               accept=".png, .jpg, .jpeg"/>
                                                                        <input type="hidden"
                                                                               name="profile_avatar_remove"/>
                                                                        <input type="hidden" name="id"
                                                                               value="{{$data->team_id}}"/>
                                                                    </label>

                                                                    <span
                                                                            class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                                            data-action="cancel" data-toggle="tooltip"
                                                                            title="Cancel avatar">
                            <i class="ki ki-bold-close icon-xs text-muted"></i>
                        </span>

                                                                    <span
                                                                            class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                                            data-action="remove" data-toggle="tooltip"
                                                                            title="Remove avatar">
                            <i class="ki ki-bold-close icon-xs text-muted"></i>
                        </span>
                                                                </div>
                                                                <div class="d-flex justify-content-center">
                                                                    <a onclick="updateForm('{{$data->team_id}}');"
                                                                       class="btn text-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                    ><div id="update_button_id{{$data->team_id}}">Update</div>
                                                                    </a>
                                                                    <a href="javascript:;" type="button"
                                                                       class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                       data-dismiss="modal">Close</a>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end::Update account modal-->

                                        </div>
                                        <div class="separator separator-solid my-7"></div>
                                        </div>
                                    @endforeach
                                @endforeach
                            @else
                                <div class="card-body">
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                        </div>
                                        <h6>No teams found</h6>
                                    </div>
                                </div>
                            @endif
                        @else
                            <div class="card-body">
                                <div class="text-center">
                                    <div class="symbol symbol-150">
                                        <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                    </div>
                                    <h6>No teams found</h6>
                                </div>
                            </div>
                        @endif
                    @else
                        <div class="card-body">
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                </div>
                                <h6>No teams found</h6>
                            </div>
                        </div>
                @endif
                <!--end::Top-->

                    <!--begin::Separator-->

                    <!--end::Separator-->

                    <!--begin::Bottom-->
                    <div class="d-flex align-items-center flex-wrap">
                        <!--begin: Item-->
                        <div class="d-flex align-items-center flex-lg-fill my-1">
                                            <span class="mr-4">
                                                <i class="flaticon-network icon-2x text-muted font-weight-bold"></i>
                                            </span>
                            {{--                            <div class="symbol-group symbol-hover">--}}
                            {{--                                <div class="symbol symbol-30 symbol-circle" data-toggle="tooltip" title="Mark Stone">--}}
                            {{--                                    <img alt="Pic" src="/media/svg/avatars/001-boy.svg"/>--}}
                            {{--                                </div>--}}
                            {{--                                <div class="symbol symbol-30 symbol-circle" data-toggle="tooltip" title="Charlie Stone">--}}
                            {{--                                    <img alt="Pic" src="/media/svg/avatars/002-girl.svg"/>--}}
                            {{--                                </div>--}}
                            {{--                                <div class="symbol symbol-30 symbol-circle" data-toggle="tooltip" title="Luca Doncic">--}}
                            {{--                                    <img alt="Pic" src="/media/svg/avatars/001-boy.svg"/>--}}
                            {{--                                </div>--}}
                            {{--                                <div class="symbol symbol-30 symbol-circle" data-toggle="tooltip" title="Nick Mana">--}}
                            {{--                                    <img alt="Pic" src="/media/svg/avatars/002-girl.svg"/>--}}
                            {{--                                </div>--}}
                            {{--                                <div class="symbol symbol-30 symbol-circle" data-toggle="tooltip" title="Teresa Fox">--}}
                            {{--                                    <img alt="Pic" src="/media/svg/avatars/001-boy.svg"/>--}}
                            {{--                                </div>--}}
                            {{--                                <div class="symbol symbol-30  symbol-circle symbol-light" data-toggle="tooltip"--}}
                            {{--                                     title="More users">--}}
                            {{--                                    <span class="symbol-label font-weight-bold">5+</span>--}}
                            {{--                                </div>--}}
                            {{--                            </div>--}}
                        </div>
                        <!--end: Item-->
                    </div>
                    <!--end::Bottom-->
                </div>
            </div>
            <!--end::Teams-->
        </div>
        <!--end::Container-->
    </div>
    <!--end::Entry-->

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>

    <script>

        $(document).ready(function(){
            $("#home_tab").trigger('click');
        });
        function updateForm(id) {
            $('#update_button_id' + id).empty().append('<i class="fa fa-spinner fa-spin"></i>Updating Team');
            let addBoardDefault = document.getElementById('update_data' + id);
            let formData = new FormData(addBoardDefault);
            $.ajax({
                url: "team-update",
                type: "post",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $('#update_button_id' + id).empty().append('update');
                    $("#teamUpdateModal" + id).modal('hide');
                    if (response['code'] === 200) {
                        $("#teamUpdateModal" + id).modal('hide');
                        toastr.success("", "Updated successfully!!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        })
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    $('#update_button_id' + id).empty().append('update');
                    toastr.error(error.message);
                }
            })
        }

        function deleteIt(id) {
            let count = $('#count_data').text();
            $.ajax({
                url: "/team-delete/" + id,
                type: "get",
                success: function (response) {
                    if (response['code'] === 200) {
                        toastr.success("", "Team Deleted Successfully!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                        });
                        $('#team'+id).remove();
                        $('#count_data').empty().append(count-1);
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else if(response.code === 500) {
                        toastr.error(response.error);
                    }else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    toastr.error(error.message);
                }
            })
        }

        function unHold(id) {
            $.ajax({
                url: "unhold-teams/" + id,
                type: "get",
                success: function (response) {
                    console.log(response);
                    if (response['code'] === 200) {
                        toastr.success("", "Team Unhold successfully!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        })
                    } else if (response['code'] === 400) {
                        toastr.error(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    toastr.error(error.message);
                }
            })
        }

        function hold(id) {
            $.ajax({
                url: "hold-teams/" + id,
                type: "get",
                success: function (response) {
                    console.log(response);
                    if (response['code'] === 200) {
                        toastr.success("", "Team Holded successfully!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        })
                    } else if (response['code'] === 400) {
                        toastr.error(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    toastr.error(error.message);
                }
            })
        }

        function switchTeam(id) {
            $.ajax({
                url: 'changeTeamSession',
                type: "post",
                data: {
                    teamid: id
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success(response.message, "", {
                            timeOut: 2000,
                            fadeOut: 2000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        })
                    } else if (response.code === 400) {
                        toastr.error(response.message);
                    } else {
                        toastr.error(response.message);
                    }
                }
            });
        }

        function functionDisable(){
            let team_name = $('#team_name').val();
            if (team_name.length > 0 ) {
                $('#submit_id').removeAttr("disabled")
            }else{
                document.getElementById("submit_id").disabled = true;
            }
        }

        $(document).ready(function () {
            let readURL = function (input) {
                var matches = input.id.match(/(\d+)/);

                if (input.files && input.files[0]) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        $('.profile-pic'+matches[0]).css('background-image', 'url("' + e.target.result + '")');
                        $('#profile').val(e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            };
            $(".file-upload").on('change', function () {
                readURL(this);
            });
            $(".upload-button").on('click', function () {
                $(".file-upload").click();
            });
        });

    </script>

@endsection
