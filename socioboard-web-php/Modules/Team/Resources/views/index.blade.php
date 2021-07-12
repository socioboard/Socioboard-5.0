@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} - Teams</title>
@endsection
@section('links')
    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="{{asset('/plugins/custom/kanban/kanban.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <link href="{{asset('/plugins/custom/fullcalendar/fullcalendar.bundle.css')}}" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->

            <div class="container-fluid ">
                <!--begin::team-->
                <!--begin::Card-->
                <div class="card card-custom gutter-b">
                    <div class="card-header">
                        <div class="card-title">
                            <h3 class="card-label">
                                Create Team
                            </h3>
                        </div>
                        <div class="card-toolbar">
                            <!--begin::Invite-->
                            <a href="#" class="btn btn-light-primary font-weight-bold ml-2"
                               data-toggle="modal" data-target="#teamInviteModal">Invite</a>
                            <!--end::Invite-->
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="create_team"></div>

                        <div class="mt-4">
                            <button class="btn font-weight-bold btn-light-primary mr-5" id="createModal" >Add "Default" board
                            </button>
                            <button class="btn font-weight-bold btn-light-danger mr-5" id="inviteModal">Invite
                                members
                            </button>
                            <button class="btn font-weight-bold btn-light-success" id="removeBoard">Remove "New team"
                                Board
                            </button>
                        </div>
                    </div>
                </div>
                <!--end::Card-->
                <!--end::team-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection
@section('scripts')
    <!--begin::Page Scripts(used by this page)-->
    <script src="{{asset('/plugins/custom/kanban/kanban.bundle.js')}}"></script>
    <script src="{{asset('/js/create_team.js')}}"></script>
    <script src="{{asset('/js/team/team.js')}}"></script>
    <!--end::Page Scripts-->
@endsection
