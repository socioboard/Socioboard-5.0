@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} - Teams</title>
@endsection
@section('links')
    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="/plugins/custom/kanban/kanban.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->

            <div class="container-fluid" id="ss-viewTeamDiv" >
                <!--begin::Team-->
                <!--begin::Card-->
                <div class="card card-custom gutter-b card-stretch">
                    <div class="card-header">
                        <div class="card-title">
                            @if($data['code']===200)
                                <div class="symbol symbol-50">
                                    @if($data['data']['teamLogo'] === 'www.socioboard.com' || $data['data']['teamLogo'] === "www.NA.com" )
                                    <img src="/media/logos/sb-icon.svg" alt="SB"/>
                                        @else
                                        <img src="{{$data['data']['teamLogo']}}" alt="SB"/>
                                    @endif
                                </div>&nbsp;&nbsp;
                                <h3 class="card-label">
                                    {{$data['data']['teamName']}}
                                </h3>
                            @else
                                <div class="symbol symbol-50">
                                    <img src="https://i.imgur.com/eRkLsuQ.png" alt="SB"/>
                                </div>
                                <h3 class="card-label">
                                </h3>
                            @endif
                        </div>
                        <div class="card-toolbar">


                                <ul class="navi navi-hover">
                                    <li class="navi-item">

                                        <a href="javascript:;" class="navi-link" data-toggle="modal" data-target="#teamInviteModal{{$team_id}}">
                                                            <span class="navi-text">
                                                                <span class="text-info"><i class="fas fa-user fa-fw text-info"></i>&nbsp; Invite a Member</span>
                                                            </span>
                                        </a>
                                    </li>

                                </ul>

                            <!--end::Teams Actions Dropdown-->
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="Sb_teams"></div>
                    </div>
                </div>
                <!--end::Card-->
                <!--end::Team-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->

    <!-- begin::Invite team modal-->

    <div class="modal fade" id="teamInviteModal{{$team_id}}" tabindex="-1" role="dialog"
         aria-labelledby="teamDInviteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="teamInviteModalLabel">Invite Team</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <form id="invite_form">
                    <div class="modal-body">
                        <!--begin::User name-->
                        <div class="form-group">
                            <div class="input-icon">

                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       id="member_name" type="text" name="member_name" placeholder="Member Name"/>

                                <span><i class="fas fa-users"></i></span>
                            </div>
                        </div>
                        <!--end::User name-->
                        <!--begin::User email-->
                        <div class="form-group">
                            <div class="input-icon">

                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       id="email" type="email" name="member_email" placeholder="Member Email Id"/>
                                <input type="hidden" id="team_id" name="team_id" value="{{$team_id}}">
                                <span><i class="fas fa-envelope"></i></span>
                            </div>
                        </div>
                        <!--end::User email-->
                        <!--begin::User permission-->
                        <div class="form-group">
                            <select
                                class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                id="permission" name="permission">
                                <option selected disabled>Select Permission</option>
                                <option value="0">Approval Required</option>
                                <option value="1">Full Permission</option>
                                <option value="2">Admin</option>
                            </select>
                        </div>
                        <!--end::User permission-->

                        <div class="d-flex justify-content-center">

                            <button type="submit" id="invite_button"
                                    class="btn text-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Invite
                            </button>
                            <a href="javascript:;" type="button"
                               class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">Close</a>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->


    <!-- begin::Delete team modal-->
    <div class="modal fade" id="teamDeleteModal" tabindex="-1" role="dialog" aria-labelledby="teamDeleteModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="teamDeleteModalLabel">Delete team</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <img src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                        <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this team??</span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal" id="team-delete">Delete it!!</a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                            thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->



    <!-- begin::Update team modal-->
    <div class="modal fade" id="teamUpdateModal" tabindex="-1" role="dialog" aria-labelledby="teamDUpdateModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="teamUpdateModalLabel">Update team</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!--begin::Form group-->
                    <div class="form-group">
                        <div class="input-icon">
                            <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                   type="text" name="" placeholder="Team Name"/>
                            <span><i class="fas fa-users"></i></span>
                        </div>
                    </div>
                    <!--end::Form group-->
                    <div class="image-input image-input-empty image-input-outline" id="Sb_team_pic"
                         style="background-image: url(/media/logos/sb-icon.svg)">
                        <div class="image-input-wrapper"></div>

                        <label class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                               data-action="change" data-toggle="tooltip" title="" data-original-title="Change avatar">
                            <i class="fa fa-pen icon-sm text-muted"></i>
                            <input type="file" name="profile_avatar" accept=".png, .jpg, .jpeg"/>
                            <input type="hidden" name="profile_avatar_remove"/>
                        </label>

                        <span class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                              data-action="cancel" data-toggle="tooltip" title="Cancel avatar">
                            <i class="ki ki-bold-close icon-xs text-muted"></i>
                        </span>

                        <span class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                              data-action="remove" data-toggle="tooltip" title="Remove avatar">
                            <i class="ki ki-bold-close icon-xs text-muted"></i>
                        </span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal" id="team-update">Update</a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal">Close</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->
@endsection

@section('scripts')
    <!--begin::Page Scripts(used by this page)-->
    <script src="/plugins/custom/kanban/kanban.bundle.js"></script>
    <script src="/js/team.js"></script>
    <!--end::Page Scripts-->

    <script>

        $(document).ready(function(){
            $("#home_tab").trigger('click');
        });
        // delete team
        $('#team-delete').click(function (event) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };

            toastr.error("Team has been deleted!", "Deleted");

        });

    </script>
    <script>
        // begin:Team profile pic
        var team_pic = new SBImageInput('Sb_team_pic');

        team_pic.on('cancel', function (imageInput) {
            swal.fire({
                title: 'Image successfully changed !',
                type: 'success',
                buttonsStyling: false,
                confirmButtonText: 'Awesome!',
                confirmButtonClass: 'btn btn-primary font-weight-bold'
            });
        });

        team_pic.on('change', function (imageInput) {
            swal.fire({
                title: 'Image successfully changed !',
                type: 'success',
                buttonsStyling: false,
                confirmButtonText: 'Awesome!',
                confirmButtonClass: 'btn btn-primary font-weight-bold'
            });
        });

        team_pic.on('remove', function (imageInput) {
            swal.fire({
                title: 'Image successfully removed !',
                type: 'error',
                buttonsStyling: false,
                confirmButtonText: 'Got it!',
                confirmButtonClass: 'btn btn-primary font-weight-bold'
            });
        });

        // end:Team profile pic

        $(document).ready(function () {
            $(document).on('submit', '#invite_form', function (e) {
                e.preventDefault();
                $('#invite_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Sending Invitation');
                var member_name = $('#member_name').val();
                var email = $('#email').val();
                var permission = $('#permission').val();
                var team_id = $('#team_id').val();

                $.ajax({
                    url: '/invite',
                    type: 'post',
                    data: {
                        member_name: member_name,
                        member_email: email,
                        permission: permission,
                        team_id: team_id
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        $("#teamInviteModal"+team_id).modal('hide');
                        $('#invite_button').empty().append('Invite');
                        if (response['code'] == 200) {
                            $('#invite_form').trigger("reset");
                            toastr.success(response.message);
                        } else if (response['code'] == 204) {
                            toastr.error(response.message)
                        } else {
                            toastr.error(response.error)
                        }
                    },
                    error: function (error) {
                        $('#invite_button').empty().append('Invite');
                        $("#teamInviteModal"+team_id).modal('hide');
                        toastr.error(error.message)
                    }

                })

            })
        })
    </script>
@endsection
