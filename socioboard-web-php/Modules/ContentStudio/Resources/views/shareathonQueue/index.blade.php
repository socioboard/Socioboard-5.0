@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | ShareathonQueue</title>
@endsection
@section('discoveryActive')
    active
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row" data-sticky-container="">
                    @include('contentstudio::components.search',['title' => "ShareathonQueue"])
                    <div class="col-xl-8">
                        <!--begin::Feeds-->
                        <div class="card-columns">
                            {{-- @include('contentstudio::shareathonQueue.components.listing') --}}
                        </div>
                        <!--end::Feeds-->
                    </div>
                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
@endsection
@section('scripts')
    <script>
        $('#shareathonQueue').css('background','#e4e4e4').find('span').css('color','#3699FF');
    </script>
@endsection

