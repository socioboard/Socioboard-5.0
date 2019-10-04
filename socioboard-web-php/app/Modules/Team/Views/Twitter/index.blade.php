{{-- @inject('carbon', 'Carbon\Carbon') --}}
{{--@inject('FbController', 'App\Modules\Team\Controllers\FacebookController' ) --}}
@extends('Team::dashboard.master')

@section('style')
    <style>
        .video_twitter{position:relative;display:block;width:100%;padding:0;overflow:hidden}.video_twitter::before{display:block;content:""}.video_width_full{width:100%}.twitter_title{font-size:14px;font-weight:600;line-height:1.4;margin-bottom:5px}.keyword_font{font-size:15px;font-weight:700;margin-bottom:0;color:#14171a;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",sans-serif}.trending_text{margin-bottom:0;color:#616c77;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",sans-serif}.trending_img_post{display:flex;flex-wrap:nowrap}.visited{opacity:.25}#media-list li video .media-uploading{top:0}.media-uploading>*{top:0!important;height:100px;width:100px;border-radius:100%;border:3px solid #3b5998;animation:rotateThis 10s linear infinite}@keyframes rotateThis{from{transform:rotate(0) scale(1)}to{transform:rotate(360deg) scale(1)}}#media-list img{display:inline-block;vertical-align:top;position:relative;margin:0 2%}#media-list img{transform:translateZ(0);margin-bottom:100px}.button-like{background-color:transparent;text-decoration:none;position:relative;vertical-align:middle;text-align:center;display:inline-block;border:none;color:#8a8a8a;transition:all ease .4s}.button-like span{margin-left:.5rem}.button-like .fa,.button-like span{transition:all ease .4s}.button-like:focus{background-color:transparent}.button-like:focus .fa,.button-like:focus span{color:#8a8a8a}.button-like:hover{border-color:#cc4b37;background-color:transparent}.button-like:hover .fa,.button-like:hover span{color:#cc4b37}.liked .fa,.liked span{color:#cc4b37}.liked:focus{background-color:#fff}.liked:focus .fa,.liked:focus span{color:#cc4b37}.liked:hover{background-color:#fff;border-color:#fff}.liked:hover .fa,.liked:hover span{color:#cc4b37}
    </style>
@endsection

@section('title')
    <title>SocioBoard | Twitter Feeds</title>
@endsection

@section('feed')

    <div class="container margin-top-60">
        <div class="row margin-top-10">
            <div class="col-md-12">
                <h4>Twitter feeds</h4>
            </div>
        </div>

        <div class="row">
            <!-- twt profile-->
            <div class="col-md-4 active_account">
                @include('Team::Twitter.inc_profile')
            </div>

            <div class="col-md-8 margin-bottom-50 fb_feeds_div">
                <div class="lazy_feeds_div">
                    @include('Team::Twitter.inc_posts');
                <!-- dynamic content loads here -->
                </div>
            </div>

        </div>
    </div>

    <!-- Successful Comment Modal -->
    <div class="modal fade" id="successCommentModal" tabindex="-1" role="dialog"
         aria-labelledby="successfulModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-center">
                    <i class="fas fa-check-circle fa-5x text-success"></i>
                    <h2 class="mt-3">Yay!</h2>
                    <h5>Your comments was successful!</h5>
                </div>
            </div>
        </div>
    </div>

    <!-- Error Comment Modal -->
    <div class="modal fade" id="errorCommentModal" tabindex="-1" role="dialog" aria-labelledby="errorModalLabel"
         aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body text-center">
                    <i class="fas fa-times text-danger fa-5x"></i>
                    <h2 class="mt-3">Oh no!</h2>
                    <h5>Your comments was unsuccessful, please try again.</h5>
                    <button class="btn btn-danger">Try again</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('postModal')
    @include('Team::dashboard.incPostModal')
    {{--@include('Team::Twitter.inc_resocio')--}}
@endsection

@section('incJS')
    <script>
        //for GA
        var eventCategory = 'View-Feeds';
        var eventAction = 'Twitter-Feeds';
    </script>


    @include('Team::dashboard.incJS')
    @include('Team::Twitter.incJS')
@endsection
