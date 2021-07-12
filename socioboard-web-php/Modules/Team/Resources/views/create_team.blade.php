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

            <div class="container-fluid ">
                <!--begin::Team-->
                <!--begin::Card-->
                <div class="card card-custom gutter-b card-stretch" id="ss-createTeamDiv">
                    <div class="card-header">
                        <div class="card-title">
                            <h3 class="card-label">
                                Create Team
                            </h3>
                        </div>
                        <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                             title="Add to custom Reports">+
                            <span node-id="ss-createTeamDiv_md4" class="ss addtcartclose"></span>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="create_team"></div>

                        <div class="mt-4">
                            <button class="btn text-warning font-weight-bolder font-size-h6" data-toggle="modal"
                                    data-target="#teamCreateModal">Add Team
                            </button>
                        </div>
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

    <!-- begin::Create team modal-->
    <div class="modal fade" id="teamCreateModal" tabindex="-1" role="dialog" aria-labelledby="teamDCreateModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="teamCreateModalLabel">Create team</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <form id="form_field">
                    @csrf
                    <div class="modal-body">
                        <!--begin::Form group-->
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                       type="text" name="team_name" placeholder="Team Name"/>
                                <span><i class="fas fa-users"></i></span>
                            </div>
                        </div>
                        <!--end::Form group-->
                        <div class="image-input image-input-empty image-input-outline profile-pic" id="Sb_team_pic"
                             style="background-image: url(media/logos/sb-icon.svg)">
                            <div class="image-input-wrapper"></div>

                            <label class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                   data-action="change" data-toggle="tooltip" title=""
                                   data-original-title="Change avatar">
                                <i class="fa fa-pen icon-sm text-muted upload-button"></i>
                                <input type="file" name="profile_avatar" accept=".png, .jpg, .jpeg" id="profile" class="file-upload"/>
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
                            <button type="submit" id="create_button"
                                    class="btn text-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Create
                            </button>
                            <button type="submit" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                    data-dismiss="modal">Close
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->




@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
@section('scripts')
    <!--begin::Page Scripts(used by this page)-->
    <script src="/plugins/custom/kanban/kanban.bundle.js"></script>
    <script src="/js/create_team.js"></script>
    <!--end::Page Scripts-->
@endsection
<script>

    $(document).ready(function(){
        $("#home_tab").trigger('click');
    });
    $(document).ready(function () {
        let readURL = function (input) {
            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    $('.profile-pic').css('background-image', 'url("' + e.target.result + '")');
                    $('#profile').val(e.target.result);
                }
                reader.readAsDataURL(input.files[0]);
            }
        };
        $(".file-upload").on('change', function () {
            readURL(this);
        });
        $(".upload-button").on('click', function (){
            $(".file-upload").click();
        });
    });
</script>
