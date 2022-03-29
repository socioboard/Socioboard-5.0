@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Discovery</title>
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row" data-sticky-container>
                    <div class="col-xl-4" >
                        <div class="card card-custom gutter-b sticky" data-sticky="true" data-margin-top="180px" data-sticky-for="1023" data-sticky-class="kt-sticky">
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Twitter</h3>
                            </div>
                            <!--begin::Body-->
                            <div class="card-body">
                                <!--begin::Form-->
                                <form id="twitter_form" method="get" action="/discovery/search-twits">
{{--                                <form id="twitter_form">--}}
                                    <!--begin::search-->
                                    <div class="form-group">
                                        <div class="input-icon InKwywordDiv">
                                            <div id="InKwyword">
                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 keywordTextDIvs" type="text" name="keyword" autocomplete="off" id="keyword_name" value="@if(isset($keyword)){{$keyword}} @endif" placeholder="Enter Keyword or Topics"/>
                                            <span><i class="far fa-keyboard"></i></span>
                                            </div>
                                        </div>
                                        @if ($errors->any())
                                            <span id="validboardname" style="color: red;font-size: medium;" role="alert">{{ $errors->first('keyword') }}</span>
                                        @endif
                                    </div>

                                    <!--end::search-->
                                    <button id="search"  class="btn font-weight-bolder mr-2 px-8" >Search</button>
                                    <button type="reset" class="btn font-weight-bolder px-8" onclick="clearFunction()">Clear</button>
                                </form>
                                <!--end::Form-->
                            </div>
                            <!--end::Body-->
                        </div>

                    </div>

                    @if(isset($ErrorMessage))
                        <div class="card-body">
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                </div>
                                <h6>{{$ErrorMessage}}</h6>
                            </div>
                        </div>
                    @endif
                    <div class="col-xl-8" id="feeds">
                        <!--begin::feeds-->
                        <div class="card-columns" id="twitter_feeds">
                            @if(isset($responseData['data']) && $responseData['data']->tweets !== null)
                                <script>
                                    var maxId = <?php echo $responseData['data']->max_id ?>;
                                    var feedsLength = <?php echo count($responseData['data']->tweets)  ?>;
                                    var  keywordName =  '{{$keyword}}' ;
                                </script>
                                @foreach($responseData['data']->tweets as $twits)
                                    @if($twits->mediaUrls != null)
                                    @php (sizeof($twits->mediaUrls) > 1 ? $count = "multiple" : $count = "single") @endphp
                                    <div class="card">
                                        <div class="card-body">
                                            <!--begin::carousel-->
                                            <div id="carouselExampleControls{{$twits->tweetId}}" class="carousel slide" data-ride="carousel">

                                                <div class="carousel-inner">
                                                    @foreach($twits->mediaUrls as $k=>$media)
                                                    @if($media->type === 'photo' && isset($media->url))
                                                        @if($k == 0)
                                                        <div class="carousel-item active">
                                                            <img src="{{$media->url}}" class="d-block w-100" alt="...">
                                                        </div>
                                                            @else
                                                                <div class="carousel-item">
                                                                    <img src="{{$media->url}}" class="d-block w-100" alt="...">
                                                                </div>
                                                            @endif
                                                    @elseif($media->type === 'video' && isset($media->url))
                                                        <div class="carousel-item active">
                                                            <iframe class="d-block w-100"
                                                                    src="{{$media->url}}" allowfullscreen=""></iframe>
                                                        </div>
                                                    @elseif($media->type === 'animated_gif' && isset($media->url))
                                                        <div class="carousel-item active">
                                                            <iframe class="d-block w-100"
                                                                    src="{{$media->url}}" allowfullscreen=""></iframe>
                                                        </div>
                                                    @endif
                                                        @endforeach
                                                </div>
                                                                                            <a class="carousel-control-prev" href="#carouselExampleControls{{$twits->tweetId}}" role="button" data-slide="prev">
                                                                                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                                                                                <span class="sr-only">Previous</span>
                                                                                            </a>
                                                                                            <a class="carousel-control-next" href="#carouselExampleControls{{$twits->tweetId}}" role="button" data-slide="next">
                                                                                                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                                                                                <span class="sr-only">Next</span>
                                                                                            </a>
                                            </div>
                                            <br>
                                            <!--end::carousel-->
                                            <div class="d-flex align-items-center">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-40 symbol-light-success mr-5">
                                                            <span class="symbol-label">
                                                                <img src="{{$twits->postedAccountProfilePic}}" class="h-75 align-self-end" alt="">
                                                            </span>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Info-->
                                                <div class="d-flex flex-column flex-grow-1">
                                                    <a href="javascript:;" class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">{{$twits->postedAccountScreenName}}</a>
                                                    <?php $date = new Datetime($twits->publishedDate);
                                                    ?>
                                                    <span class="text-muted font-weight-bold">{{$date->format('Y-m-d')}}</span>
                                                </div>
                                                <!--end::Info-->
                                            </div>
                                            <p class="card-text  mt-3">{{$twits->description}}<br><br>
                                                @if($twits->hashtags !== null)
                                                    @foreach($twits->hashtags as $hashtags)
                                                <a href="javascript:;" class="label label-inline label-pill mr-2">{{$hashtags}}</a>
                                                    @endforeach
                                                    <br><br>
                                                @endif
                                            </p>
                                            <div class="d-flex align-items-center mb-2">
                                                <a href="javascript:;" class="font-weight-bolder font-size-sm p-2" data-toggle="tooltip" title="Like">
                                                                <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                        <i class="fas fa-heart text-danger"></i>
                                                                </span> {{$twits->favoriteCount}}
                                                </a>

                                                <a href="javascript:;" class="font-weight-bolder font-size-sm p-2" data-toggle="tooltip" title="Retweet">
                                                            <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                    <i class="fas fa-retweet"></i>
                                                            </span> {{$twits->retweetCount}}
                                                </a>
                                            </div>
                                            <hr>
                                            @if(isset($media->url))
                                            <div class="d-flex justify-content-center">
                                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openImageModel('{{$twits->tweetUrl}}','{{$media->type}}','{{$twits->description}}','{{$media->url}}', '{{$count}}')"><i class="far fa-hand-point-up fa-fw" ></i> 1 click</a>
                                                <a href="{{$twits->tweetUrl}}" class="btn btn-hover-text-primary btn-hover-icon-primary rounded font-weight-bolder"><i class="fab fa-twitter fa-fw"></i> Show Original</a>
                                            </div>
                                                @else
                                                <div class="d-flex justify-content-center">
                                                    <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('{{$twits->tweetUrl}}','{{$twits->postedAccountScreenName}}','{{$twits->description}}')"><i class="far fa-hand-point-up fa-fw" ></i> 1 click</a>
                                                    <a href="{{$twits->tweetUrl}}" class="btn btn-hover-text-primary btn-hover-icon-primary rounded font-weight-bolder"><i class="fab fa-twitter fa-fw"></i> Show Original</a>
                                                </div>
                                            @endif
                                        </div>
                                    </div>

                                    @else
                                    <div class="card">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-40 symbol-light-success mr-5">
                                                            <span class="symbol-label">
                                                                <img src="{{$twits->postedAccountProfilePic}}"
                                                                     class="h-75 align-self-end" alt="">
                                                            </span>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Info-->
                                                <div class="d-flex flex-column flex-grow-1">
                                                    <a href="{{$twits->tweetUrl}}" class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">{{$twits->postedAccountScreenName}}</a>
                                                    <?php $date = new Datetime($twits->publishedDate);
                                                    ?>
                                                    <span class="text-muted font-weight-bold">{{$date->format('Y-m-d ')}}</span>
                                                </div>
                                                <!--end::Info-->
                                            </div>
                                            <p class="card-text  mt-3">{{$twits->description}}<br><br>
                                                @if($twits->hashtags !== null)
                                                    @foreach($twits->hashtags as $hashtags)
                                                        <a href="javascript:;" class="label label-inline label-pill mr-2">{{$hashtags}}</a>
                                                    @endforeach
                                                    <br><br>
                                                @endif
                                            </p>
                                            <div class="d-flex align-items-center mb-2">

                                                <a href="javascript:;" class="font-weight-bolder font-size-sm p-2 likeDiv" data-toggle="tooltip" title="I like this">
                                                            <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                    <i class="fas fa-thumbs-up "></i>
                                                            </span> {{$twits->favoriteCount}}
                                                </a>

                                                <a href="javascript:;" class="font-weight-bolder font-size-sm p-2 Retweetdiv" data-toggle="tooltip" title="Retweet">
                                                            <span class="svg-icon svg-icon-md svg-icon-danger pr-1">
                                                                    <i class="fas fa-retweet"></i>
                                                            </span> {{$twits->retweetCount}}
                                                </a>
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-center">
                                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('{{$twits->tweetUrl}}','{{$twits->postedAccountScreenName}}','{{$twits->description}}')"><i class="far fa-hand-point-up fa-fw" ></i> One-Click</a>
                                                <a href="{{$twits->tweetUrl}}" class="btn btn-hover-text-primary btn-hover-icon-primary rounded font-weight-bolder"><i class="fab fa-twitter fa-fw"></i> Show Original</a>
                                            </div>
                                        </div>
                                    </div>
                                    @endif
                                @endforeach
                                @else
                                <div class="card-body">
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                            <h6>Something went wrong</h6>
                                        </div>

                                    </div>
                                </div>
                            @endif
                        <!--end::feeds-->
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
                <!-- begin::Re-socio-->
                <div class="modal fade" id="resocioModal" tabindex="-1" role="dialog" aria-labelledby="resocioModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="resocioModalLabel">Re-Socio</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <i aria-hidden="true" class="ki ki-close"></i>
                                </button>
                            </div>

                            <form action="{{ route('publish_content.scheduling')  }}" method="POST" id="checkRoute">
                                @csrf
                                <input type="hidden" name="mediaUrl" id="mediaUrls" value={{null}}>
                                <input type="hidden" name="sourceUrl" id="sourceUrl" value={{ null}}>
                                <input type="hidden" name="publisherName" id="publisherName" value="{{ null }}">
                                <input type="hidden" name="title" id="title" value="{{ null }}">
                                <input type="hidden" name="type"  id="type" value="{{ null }}">
                                <textarea name="description"  id="description" value="{{ null }}" style="display: none">{{ null }}</textarea>
                            </form>

                            <form action="{{ route('publish_content.share') }}" id="publishContentForm" method="POST">
                                <div class="modal-body">
                                    <div class="form-group" id="normal_post_area">

                                    </div>
                                    <div class="form-group">
                                        <div class="input-icon" id="outgoingUrl">

                                        </div>
                                    </div>

                                    <!-- image and video upload -->
                                    <div class="row" id="mediaUrl">

                                    </div>
                                    <!-- end of image and video upload -->
                                    <!-- begin:Accounts list -->
                                @if(isset($socialAccounts) && !empty($socialAccounts))
                                    <!-- begin:Accounts list -->
                                        <div>
                                            <button type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 accounts-list-btn">Select Accounts</button>
                                        </div>
                                        <div class="accounts-list-div">
                                            <ul class="nav justify-content-center nav-pills" id="AddAccountsTab" role="tablist">
                                                @foreach($socialAccounts as $key => $socialAccount)
                                                    <li class="nav-item">
                                                        <a class="nav-link" id="{{$key}}-tab-accounts" data-toggle="tab" href="#{{$key}}-add-accounts">
                                                            <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i></span>
                                                        </a>
                                                    </li>
                                                @endforeach
                                            </ul>
                                            <span id="error-socialAccount" class="error-message form-text text-danger text-center"></span>
                                            <div class="tab-content mt-5" id="AddAccountsTabContent">
                                                @foreach($socialAccounts as $key => $socialAccountsGroups)
                                                    <div class="tab-pane" id="{{$key}}-add-accounts" role="tabpanel" aria-labelledby="{{$key}}-tab-accounts">
                                                        <div class="mt-3">
                                                            @foreach($socialAccountsGroups as $group => $socialAccountArray)
                                                                <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="overflow-y: scroll;">
                                                                    @if(ucwords($key) === "Twitter")
                                                                        <ul class="schedule-social-tabs">
                                                                            <li class="font-size-md font-weight-normal">The Character limit is 280.</li>
                                                                            <li class="font-size-md font-weight-normal">You can only post four Images at a time.</li>
                                                                        </ul>
                                                                    @elseif(ucwords($key) === "Facebook")
                                                                        <ul class="schedule-social-tabs">
                                                                            <li class="font-size-md font-weight-normal">The Character limit is 5000.</li>
                                                                            <li class="font-size-md font-weight-normal">You can only post four Images at a time.</li>
                                                                        </ul>
                                                                    @elseif(ucwords($key) === "Instagram")
                                                                        <ul class="schedule-social-tabs">
                                                                            <li class="font-size-md font-weight-normal">The Character limit is 2200.</li>
                                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                                            <li class="font-size-md font-weight-normal">An Image or video for posting is required.</li>
                                                                            <li class="font-size-md font-weight-normal">Image Pixel should be 1:1 resolution.</li>
                                                                        </ul>
                                                                    @elseif(ucwords($key) === "Linkedin")
                                                                        <ul class="schedule-social-tabs">
                                                                            <li class="font-size-md font-weight-normal">The Character limit is 700.</li>
                                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                                        </ul>
                                                                    @elseif(ucwords($key) === "Tumblr")
                                                                        <ul class="schedule-social-tabs">
                                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                                            <li class="font-size-md font-weight-normal">Media size should be less than 10MB .</li>
                                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                                        </ul>
                                                                    @endif
                                                                <span>Choose {{ucwords($key)}} {{$group}} for posting</span>
                                                                @foreach($socialAccountArray as $group_key => $socialAccount)

                                                                        <!--begin::Page-->
                                                                        <div class="d-flex align-items-center flex-grow-1">
                                                                            <!--begin::Facebook Fanpage Profile picture-->
                                                                            <div class="symbol symbol-45 symbol-light mr-5">
                                                                    <span class="symbol-label">
                                                                        <img src="{{isset($socialAccount->profile_pic_url) ?  $socialAccount->profile_pic_url : null}}" class="w-100 align-self-center" alt=""/>
                                                                    </span>
                                                                            </div>
                                                                            <!--end::Facebook Fanpage Profile picture-->
                                                                            <!--begin::Section-->
                                                                            <div class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                                                <!--begin::Info-->
                                                                                <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                                    <!--begin::Title-->
                                                                                    <a href="javascript:;" class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                        {{ $socialAccount->first_name.' '. $socialAccount->last_name }}
                                                                                    </a>
                                                                                    <!--end::Title-->

                                                                                    <!--begin::Data-->
                                                                                @if($socialAccount->account_type !== 6)
                                                                                    <!--begin::Data-->
                                                                                        <span class="text-muted font-weight-bold">
                                                                            {{ $socialAccount->friendship_counts }} followers
                                                                        </span>
                                                                                    @endif
                                                                                </div>
                                                                                <!--end::Info-->
                                                                            </div>
                                                                            <!--end::Section-->
                                                                            <!--begin::Checkbox-->
                                                                            <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                                                <input type="checkbox" name="socialAccount[]" value="{{ $socialAccount->account_id }}"/>
                                                                                {{-- <input type="hidden" name="account_id[{{ $socialAccount->account_id }}]" value="{{ $socialAccount->account_id }}"> --}}
                                                                                <span></span>
                                                                            </label>
                                                                            <!--end::Checkbox-->
                                                                        </div>
                                                                        <!--end::Page-->
                                                                @endforeach
                                                                </div>
                                                            @endforeach
                                                        </div>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                        <!-- end:Accounts list -->
                                @endif
                                <!-- end:Accounts list -->
                                </div>

                                <div class="modal-footer">
                                    <button type="submit"  class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" form="checkRoute"><i class="fas fa-history fa-fw"></i>Schedule</button>
                                    <button type="button" name="status" value="0" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Draft</button>
                                    <button type="button" name="status" value="1" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Post</button>
                                </div>
                        </div>
                    </div>
                </div>
                <!-- end::Re-socio-->
        </div>
        <!--end::Entry-->
    </div>

@endsection
@section('scripts')
  <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
@endsection

@section('page-scripts')

    <script>

        var sticky = new Sticky('.sticky');

    </script>
    <script type="text/javascript">

        $(document).ready(function(){
            $("#boards").trigger('click');
        });
    </script>
    <script>

        function getScrollXY() {
            var scrOfX = 0, scrOfY = 0;
            if (typeof (window.pageYOffset) == 'number') {
                //Netscape compliant
                scrOfY = window.pageYOffset;
                scrOfX = window.pageXOffset;
            } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                //DOM compliant
                scrOfY = document.body.scrollTop;
                scrOfX = document.body.scrollLeft;
            } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                //IE6 standards compliant mode
                scrOfY = document.documentElement.scrollTop;
                scrOfX = document.documentElement.scrollLeft;
            }
            return [scrOfX, scrOfY];
        }

        function getDocHeight() {
            var D = document;
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            );
        }

       // $(document).on('submit','#twitter_form',function (e) {
       //      // e.preventDefault();
       //      alert('here')
       //      // let keyword = $('#keyword_name').val();
       //      // alert(keyword);
       // })

        document.addEventListener("scroll", function (event) {
            if (feedsLength >= 100) {
                if (getDocHeight() === getScrollXY()[1] + window.innerHeight) {
                    getNextTwitterFeeds(maxId,keywordName);
                    pageId++;
                }
            }

        });

        function getNextTwitterFeeds(maxId,keywordName){
            $.ajax({
                url : '/discovery/search-more-twits',
                type : 'post',
                data : {
                    maxId: maxId,
                    keyword : keywordName
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success : function (response) {
                    if(response.code === 200 ){
                        let appendData = '';
                        $(".spinner-border").css("display", "none");
                        feedsLength = response.data.tweets.length;
                        let url;
                        let chaneltitle;
                        let title;
                        response.data.tweets.map(element => {
                            if (element.mediaUrls != null) {
                                url = "'" + element.tweetUrl + "'";
                                chaneltitle = "'" + element.postedAccountScreenName + "'";
                                title = "'" + element.description + "'";
                                appendData = '<div class="card">' +
                                    '<div class="card-body">' +
                                    '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-40 symbol-light-success mr-5">' +
                                    '<span class="symbol-label">' +
                                    '<img src="' + element.postedAccountProfilePic + '" class="h-75 align-self-end" alt="">' +
                                    '</span>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column flex-grow-1">' +
                                    '<a href="' + element.tweetUrl + '" class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">' + element.postedAccountScreenName + '</a>' +
                                    '<span class="text-muted font-weight-bold">' + element.publishedDate + '</span>' +
                                    '</div>' +
                                    '</div>' +
                                    '<p class="card-text mt-3">' + element.description + '</p>' +
                                    '<div class="d-flex align-items-center mb-2">' +
                                    '<a href="javascript:;" class="font-weight-bolder font-size-sm p-2" data-toggle="tooltip" title="I like this">' +
                                    '<span class="svg-icon svg-icon-md svg-icon-danger pr-1">' +
                                    '<i class="fas fa-thumbs-up "></i>' +
                                    '</span>' + element.favoriteCount + '</a>' +
                                    '<a href="javascript:;" class="font-weight-bolder font-size-sm p-2" data-toggle="tooltip" title="Retweet">' +
                                    '<span class="svg-icon svg-icon-md svg-icon-danger pr-1">' +
                                    '<i class="fas fa-retweet"></i>' +
                                    '</span>' + element.retweetCount + '</a>' +
                                    '</div>' +
                                    '<hr>' +
                                    '<div class="d-flex justify-content-center">' +
                                    '<a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('+url+','+chaneltitle+','+title.replace(/[{()}]/g, '')+')"><i class="far fa-hand-point-up fa-fw"></i> 1 click</a>' +
                                    '<a href="' + element.tweetUrl + '" class="btn btn-hover-text-primary btn-hover-icon-primary rounded font-weight-bolder"><i class="fab fa-twitter fa-fw"></i> Show Original</a>' +
                                    '</div>' +
                                    '</div>' +
                                    '</div>';
                            }
                            $('#twitter_feeds').append(appendData);
                        })

                    }
                },
                error : function (error) {

                }
            })
        }
        function openModel(mediaUrl, publisherName, title ) {
            let sourceUrl = mediaUrl;
            $.ajax({
                type: 'post',
                url: '/discovery/publish-model',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data :{
                    mediaUrl,
                    sourceUrl,
                    publisherName,
                    title,
                },
                success: function (response) {
                    $('#normal_post_area').empty().append(' <textarea class="form-control border border-light h-auto py-4 rounded-lg font-size-h6" id="normal_post_area" name="content" rows="3" placeholder="Write something !" required >'+response.title +'</textarea>');
                    $('#outgoingUrl').empty().append(' <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="outgoingUrl" autocomplete="off" placeholder="Enter Outgoing url" value="'+response.sourceUrl +'"/><span><i class="fas fa-link"></i></span>');
                    $('#mediaUrl').empty();
                    $('#title').attr('value',response.title);
                    $('#sourceUrl').attr('value',response.sourceUrl);
                }
            });
        }

        function openImageModel(mediaUrl, mediatype, title,media,count ) {
                    $('#normal_post_area').empty().append(' <textarea class="form-control border border-light h-auto py-4 rounded-lg font-size-h6" id="normal_post_area" name="content" rows="3" placeholder="Write something !" required >'+title +'</textarea>');
                    $('#outgoingUrl').empty().append(' <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="outgoingUrl" autocomplete="off" placeholder="Enter Outgoing url" value="'+mediaUrl+'"/><span><i class="fas fa-link"></i></span>');
                    $('#title').attr('value',title);
                    $('#sourceUrl').attr('value',mediaUrl);
                    if(mediatype === "photo") {
                        $('#mediaUrls').attr('value',media);
                        $('#type').attr('value','image');
                        if (count === "single") {
                            $('#mediaUrl').empty().append('<div class="col-12" id="">' +
                                '                                            <ul id="media-list" class="clearfix">' +
                                '                                                <li>' +
                                '                                                    <img src="' + media + '"/>' +
                                '                                                </li>' +
                                '                                            </ul>' +
                                '                                        </div>');
                        }else {
                            $('#mediaUrl').empty().append('<div class="col-12" id="">' +
                                '                                            <ul id="media-list" class="clearfix">' +
                                '                                                <li>' +
                                '                                                    <img src="' + media + '"/><div class="image-monero">\n' +
                                '      <i class="fab fa-monero"></i>\n' +
                                ' </div>' +
                                '                                                </li>' +
                                '                                            </ul>' +
                                '                                        </div>');
                        }
                    }else{
                        $('#type').attr('value','video');
                        $('#mediaUrl').empty().append('<div class="col-12" id="">' +
                            '                                            <ul id="media-list" class="clearfix">' +
                            '                                                <li>' +
                            '                                                    <iframe src="' + media + '"/><div class="image-monero">\n' +
                            '      <i class="fab fa-monero"></i>\n' +
                            ' </div>' +
                            '                                                </li>' +
                            '                                            </ul>' +
                            '                                        </div>');
                    }
        }

        $(document).ready(function () {
            $("#discovery").trigger('click');
        })
        $(document).on('click','#search',function (e) {
            $('#search').empty().append('<i class="fa fa-spinner fa-spin"></i>Searching');
        })

        function clearFunction() {
            $("#InKwyword").empty().append('<input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="keyword" id="keyword" placeholder="Enter Keyword"/>\n' +
                '                                            <span><i class="far fa-keyboard"></i></span>');
        }
    </script>
@endsection