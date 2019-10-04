@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery Flickr</title>
@endsection
@section('style')
    <style type="text/css">
        .keyword_font {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 0;
            color: #14171a;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_text {
            margin-bottom: 0;
            color: #616c77;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_img_post {
            display: flex;
            flex-wrap: nowrap;
        }
        /*span:before {*/
            /*content: "              ";*/
            /*display:inline-block;*/
            /*width:128px*/
        /*}*/
    </style>
@endsection


@section('youtubeDiscovery')

    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>   {{ $data['boardName'] }} : {{ $data['key'] }}</h4>
        </div>
    </div>

    <div class="card-columns mt-5" id="youtube">



    </div>
    <div class="d-flex justify-content-center" >
        <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
            <span class="sr-only">Loading...</span>
        </div>
    </div>


    @include('Discovery::incPostModal')
@endsection


@section('script')

    @include("Discovery::incYoutubepostJs")
    @include("Discovery::boardMe.boardViewJS")


@endsection