@extends('home::layouts.UserLayout')
<head>
    <link href="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.css')}}" rel="stylesheet" type="text/css"/>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Calendar View</title>
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!-- begin:calendar -->
                <div class="row">
                    <div class="col-xl-12">
                        <!--begin::Accounts-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Calendar view</h3>
                                <div class="card-toolbar">
                                    <a href="home/publishing/scheduling" class="btn text-hover-success font-weight-bolder font-size-sm addPostBtn">Add post</a>
                                </div>
                            </div>
                            <!--end::Header-->
                            <!--begin::Category Selectbox-->
                            <div class="card-body pt-2">
                                <div class="row">
                                    <div class="col-md-4 col-lg-3 categoryButtonsDiv">
                                        <select class="form-control selectpicker " id="categories">
                                            <option value="">All Categories</option>
                                            <option value="0" >Normal Publish</option>
                                            <option value="1">DayWise Publish</option>
                                            <option value="6">history</option>
                                        </select>
                                    </div>
                                    <div class="d-flex color-descriptive col-md-4 ml-auto colorDiv">
                                        <div class="red-color d-flex"><span></span>Normal Publish</div>
                                        <div class="yellow-color d-flex"><span></span>Day Wise Publish</div>
                                    </div>
                                </div>
                            </div>
                            <!--end::Category Selectbox-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative">
                                <div id="sb_calendar" style="max-width: 1350px; margin: 40px auto; "></div>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Accounts-->
                    </div>
                    <!--begin::editcalenderbtn modal-->
                    <div class="modal fade" id="editcalenderbtn" tabindex="-1" aria-labelledby="editcalenderbtnLabel" aria-hidden="true">
                        <div class="modal-dialog modal-md">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="editcalenderbtnLabel">Post Details</h5>
                                    <button type="button" class="close btn btn-xs btn-icon btn-light btn-hover-primary" data-dismiss="modal"
                                            aria-label="Close" id="Sb_quick_user_close">
                                        <i class="ki ki-close icon-xs"></i>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <!-- begin:info list -->
                                    <div class="info-list">
                                        <!-- end of image and video upload -->
                                        <div class="schedule-div" style="display: block;" >
                                            <!--begin::Header-->
                                            <p class="font-size-h6"><strong>Post type: </strong> <span id="title"></span></p>
                                            <p class="font-size-h6"><strong>Post Content: </strong> <span id="description"></span></p>
                                            <p class="font-size-h6"><strong>Content Type: </strong> <span id="content_type"></span></p>
                                            <p class="font-size-h6"><strong>Created On: </strong><span id="created_date"></span></p>
                                            <p class="font-size-h6"><strong>Post Date: </strong><span id="post_date"></span></p>
                                            <!--end::Header-->
                                        </div>
                                    </div>
                                    <!-- end:info list -->
                                </div>
                                <div class="modal-footer">
                                    <div id="redirection">
                                        <a class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                           data-dismiss="modal">Edit</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--end::editcalenderbtn modal-->

                </div>
                <!-- end:calendar -->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>

@endsection
@section('scripts')
    <script src="{{asset('js/calendar.js')}}"></script>
    <script src="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.js')}}"></script>
    <script src="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.js')}}"></script>
    <script src="{{asset('plugins/custom/prismjs/prismjs.bundle.js')}}"></script>
@endsection

@section('page-scripts')
    <script>
        $(document).ready(function(){
            $("#home_tab").trigger('click');
        });
    </script>
@endsection