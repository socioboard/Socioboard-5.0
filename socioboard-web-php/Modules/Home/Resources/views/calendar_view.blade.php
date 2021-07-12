@extends('home::layouts.UserLayout')
<head>
    <link href="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.css')}}" rel="stylesheet" type="text/css"/>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Dashboard</title>
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
                                    <a href="home/publishing/scheduling" class="btn text-hover-success font-weight-bolder font-size-sm">Add post</a>
                                </div>
                            </div>
                            <!--end::Header-->
                            <!--begin::Category Selectbox-->
                            <div class="card-body pt-2">
                                <div class="row">
                                    <div class="col-md-4 col-lg-3">
                                        <select class="form-control selectpicker" id="categories">
                                            <option value="">Select Category</option>
                                            <option value="0" >SocioQueue</option>
                                            <option value="1">DayWise-Socioqueue</option>
                                            <option value="6">history</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <!--end::Category Selectbox-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <div id="sb_calendar" style="max-width: 1100px; margin: 40px auto; "></div>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Accounts-->
                    </div>
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