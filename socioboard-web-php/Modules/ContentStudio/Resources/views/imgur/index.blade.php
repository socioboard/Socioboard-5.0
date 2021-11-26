@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Imgure</title>
@endsection
@section('discoveryActive')
    active
@endsection
@section('links')
    <link rel="stylesheet"  type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}" />
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
                    {!! $html !!}
                    <p id="notification">Please enter the keyword to find imgur’s </p>
                    <div class="col-xl-8">
                        <!--begin::Feeds-->
                        <div class="card-columns feeds-container feeds-card-container" id="list"></div>
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
    <script src="{{asset('js/contentStudio/search.js')}}"></script>
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
    <script>
        $('#imgur').css('background','#e4e4e4').find('span').css('color','#3699FF');
        let nextUrl = 'imgur';
    </script>
@endsection

