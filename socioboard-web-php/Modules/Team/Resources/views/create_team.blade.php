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
            <div class=" container-fluid ">
                <!--begin::Dashboard-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-md-6 offset-md-3">
                        <!--begin::Borad-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Create Team</h3>
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
                                            <i class="fas fa-pen icon-sm text-muted upload-button"></i>
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
                                    </div>
                                </div>
                            </form>
                        </div>
                        <!--end::Borad-->
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Dashboard-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->



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
