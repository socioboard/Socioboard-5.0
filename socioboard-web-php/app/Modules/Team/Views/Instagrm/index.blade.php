@extends('Team::dashboard.master')

@section('style')
    <style>
        .fb_off_option_e{bottom:100px!important}.post_cmt_div{display:none}.visited{opacity:.25}#media-list li video .media-uploading{top:0}.media-uploading>*{top:0!important;height:100px;width:100px;border-radius:100%;border:3px solid #3b5998;animation:rotateThis 10s linear infinite}@keyframes rotateThis{from{transform:rotate(0) scale(1)}to{transform:rotate(360deg) scale(1)}}#media-list img{display:inline-block;vertical-align:top;position:relative;margin:0 2%}#media-list img{transform:translateZ(0);margin-bottom:100px}
    </style>
@endsection

@section('title')
    <title>SocioBoard | Instagram Feeds</title>
@endsection

@section('feed')

    <div class="container margin-top-60">
        <div class="row margin-top-10">

            {{--for displaying error message if wrong network is provided in view report (Added by Aishwarya php developer)--}}
            @if (session('Fail'))
                <h5 style="color: red;text-align: center">{{ session('Fail') }}</h5>
            @endif

            @if (session('error'))
                <h5 style="color: red;text-align: center">{{ session('message') }}</h5>
            @endif
            <div class="col-md-12">
                <h4>Instagram feeds</h4>
            </div>
        </div>

        <div class="row ">
            <!-- instagram profile-->
            <div class="col-md-4">
                @include('Team::Instagrm.inc_profile')
            </div>

            <div class="col-md-8 margin-bottom-50">
                <!-- Instagram feeds -->
                <div id="fb-root"></div>
                <div class="lazy_feeds_div">
                    <!-- dynamic content loads here -->
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
                <div class="modal fade" id="errorCommentModal" tabindex="-1" role="dialog"
                     aria-labelledby="errorModalLabel"
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
            </div>
        </div>
    </div>
@endsection

@section('postModal')
    @include('Team::dashboard.incPostModal')
@endsection

@section('incJS')
    <script>
        //for GA
        var eventCategory = 'View-Feeds';
        var eventAction = 'Instagram-Feeds';
    </script>

    @include('Team::dashboard.incJS')
    @include('Team::Instagrm.incJS')
@endsection
