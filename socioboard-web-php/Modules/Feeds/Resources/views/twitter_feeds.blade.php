@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Twitter Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row" data-sticky-container>
                    <div class="col-xl-4">
                        <div class=" sticky" data-sticky="true" data-margin-top="180px" data-sticky-for="1023"
                             data-sticky-class="kt-sticky">
                            <!-- begin:Accounts list -->
                            <div class="form-group">
                                <select
                                        class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                        onchange="call(this)">
                                    @if($message=== 'success')
                                        <script>
                                            var accounId = <?php echo $accounts[0]->account_id; ?>;
                                        </script>
                                        <option disabled>Select Account</option>
                                        @foreach($accounts as $data)
                                            <option
                                                    value="{{$data->account_id}}">{{$data->first_name}}
                                            </option>
                                        @endforeach
                                    @elseif($message=== 'failed')
                                        <option selected value="failed"> Sorry some error ,occurred please reload page
                                        </option>
                                    @elseif($message=== 'No Twitter account added yet! or Account has locked')
                                        <option selected value="failed">No Twitter account added yet! or Account has
                                            locked
                                        </option>
                                    @else
                                        <option selected value="failed"> {{$message}}
                                        </option>
                                    @endif
                                </select>
                            </div>
                            <!-- end:Accounts list -->
                            <!--begin::Profile-->
                            <div class="card card-custom gutter-b ">
                                @if($message=== 'success')
                                    @if(count($accounts)>0)
                                        @if($feeds['code']=== 200)
                                            <div
                                                    class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                                <div class="ribbon-target bg-twitter" style="top: -2px; right: 20px;">
                                                    <i class="fab fa-twitter dummy"></i>
                                                </div>
                                                <!--begin::User-->
                                                <div class="d-flex align-items-center" id="twitterProfileDiv">
                                                    <div
                                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                        <div class="symbol-label"
                                                             style="background-image:url('{{$accounts[0]->profile_pic_url}}')"></div>
                                                        <i class="symbol-badge bg-success"></i>
                                                    </div>
                                                    <div>
                                                        <a href="{{$feeds['data']->socialAccountDetails->profile_url}}"
                                                           class="font-weight-bolder font-size-h5 text-hover-primary"
                                                           target="_blank">
                                                            {{$accounts[0]->first_name}}<i
                                                                    class="flaticon2-correct text-primary icon-md ml-2"></i>
                                                        </a>
                                                        <div class="text-muted">
                                                            {{$accounts[0]->email}}
                                                        </div>
                                                        <!-- begin:account star rating -->
                                                        <div class="rating-css">
                                                            <div class="star-icon">
                                                                <input type="radio"
                                                                       <?php if ($accounts[0]->rating === 1) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                       id="rating1{{$accounts[0]->account_id}}}"
                                                                       onclick="ratingUpdate('1', '{{$accounts[0]->account_id}}}');">
                                                                <label
                                                                        for="rating1{{$accounts[0]->account_id}}"
                                                                        class="fas fa-star"></label>
                                                                <input type="radio"
                                                                       <?php if ($accounts[0]->rating == 2) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                       id="rating2{{$accounts[0]->account_id}}}"
                                                                       onclick="ratingUpdate('2', '{{$accounts[0]->account_id}}');">
                                                                <label
                                                                        for="rating2{{$accounts[0]->account_id}}"
                                                                        class="fas fa-star"></label>
                                                                <input type="radio"
                                                                       <?php if ($accounts[0]->rating == 3) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                       id="rating3{{$accounts[0]->account_id}}"
                                                                       onclick="ratingUpdate('3', '{{$accounts[0]->account_id}}');">
                                                                <label
                                                                        for="rating3{{$accounts[0]->account_id}}"
                                                                        class="fas fa-star"></label>
                                                                <input type="radio"
                                                                       <?php if ($accounts[0]->rating == 4) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                       id="rating4{{$accounts[0]->account_id}}"
                                                                       onclick="ratingUpdate('4', '{{$accounts[0]->account_id}}');">
                                                                <label
                                                                        for="rating4{{$accounts[0]->account_id}}"
                                                                        class="fas fa-star"></label>
                                                                <input type="radio"
                                                                       <?php if ($accounts[0]->rating == 5) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                       id="rating5{{$accounts[0]->account_id}}"
                                                                       onclick="ratingUpdate('5', '{{$accounts[0]->account_id}}');">
                                                                <label
                                                                        for="rating5{{$accounts[0]->account_id}}"
                                                                        class="fas fa-star"></label>
                                                            </div>
                                                        </div>
                                                        <!-- end:account star rating -->

                                                        <div class="mt-2">
                                                            <button href="javascript:;"
                                                               class="btn btn-sm font-weight-bold py-2 px-3 px-xxl-5 my-1"
                                                               onclick="return false" id="chatID" title="Coming soon">Chat</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--end::User-->

                                                <!--begin::Contact-->
                                                <div class="py-9">
                                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                                        <span class="font-weight-bold mr-2">Following:</span>
                                                        <a href="#"
                                                           class="text-hover-primary"
                                                           id="following_count">{{$feeds['data']->SocialAccountStats->following_count}}</a>
                                                    </div>
                                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                                        <span class="font-weight-bold mr-2">Followers:</span>
                                                        <a href="#"
                                                           class="text-hover-primary"
                                                           id="follower_count">{{$feeds['data']->SocialAccountStats->follower_count}}</a>
                                                    </div>
                                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                                        <span class="font-weight-bold mr-2">Feeds:</span>
                                                        <a href="#"
                                                           class="text-hover-primary"
                                                           id="feeds_count">{{$feeds['data']->SocialAccountStats->total_post_count}}</a>
                                                    </div>
                                                </div>
                                            </div>
                                        @else
                                            <div style="color: Red;text-align:center;">
                                                {{$feeds['message']}}
                                            </div>
                                        @endif
                                    @else
                                        <div style="color: Green;text-align:center;">
                                            Currently no twitter Account has been added for this team
                                        </div>
                                    @endif
                                @elseif($message=== 'No Twitter account added yet! or Account has locked')
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>{{$message}}</h6>
                                    </div>
                                @elseif($message === 'failed')
                                    <div style="color: Red;text-align:center;">
                                        Sorry some error ,occurred please reload page
                                    </div>
                                @else
                                    <div style="color: Red;text-align:center;">
                                        {{$message}}
                                    </div>
                                @endif
                            </div>
                            <!--end::Profile-->
                        </div>
                    </div>


                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card card-custom gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Feeds</h3>
                                <button id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                        title="Add to custom Reports">+
                                </button>
                            </div>
                            <!--end::Header-->
                            <!--begin::Body-->
                            <div class="card-body" id="twitterFeeds">
                            @if($message=== 'success')
                                @if(count($accounts)>0)
                                    @if($feeds['code']=== 200)
                                        <!--begin::Text-->
                                            <script>
                                                var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                            </script>
                                            @foreach($feeds['data']->feeds as $data)
                                                <div class="mb-5">
                                                    <!--begin::Container-->
                                                    <div>
                                                        <!--begin::Header-->
                                                        <div class="d-flex align-items-center pb-4">
                                                            <!--begin::Symbol-->
                                                            <div class="symbol symbol-40 symbol-light-success mr-5">
                                                            <span class="symbol-label">
                                                                <img
                                                                        src="{{$feeds['data']->socialAccountDetails->profile_pic_url}}"
                                                                        class="h-75 align-self-end" alt=""/>
                                                            </span>
                                                            </div>
                                                            <!--end::Symbol-->
                                                            <!--begin::Info-->
                                                            <div class="d-flex flex-column flex-grow-1">
                                                                <a href="{{$data->tweetUrl}}"
                                                                   target="_blank"
                                                                   class="text-hover-primary mb-1 font-size-lg font-weight-bolder">{{$feeds['data']->socialAccountDetails->first_name}}</a>
                                                                <span
                                                                        class="font-weight-bold"><?php echo date($data->publishedDate) ?></span>
                                                            </div>
                                                            <!--end::Info-->
                                                        </div>
                                                        <!--end::Header-->

                                                        <!--begin::Body-->
                                                        @if(count($data->mediaUrls)>0)
                                                            <div class="pt-4">
                                                                @foreach($data->mediaUrls as $media)
                                                                    @if($media->type === 'photo')
                                                                        <div class="">
                                                                            <img src="{{$media->url}}"
                                                                                 class="img-fluid"/>
                                                                        </div>
                                                                    @else
                                                                        <div
                                                                                class="embed-responsive embed-responsive-16by9">
                                                                            <iframe class="embed-responsive-item rounded"
                                                                                    src="{{$media->url}}"
                                                                                    allowfullscreen=""></iframe>
                                                                        </div>
                                                                    @endif
                                                                @endforeach
                                                            <!--begin::Text-->
                                                                <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                    {{$data->descritpion}}
                                                                </p>
                                                                @else
                                                                    <div>
                                                                        <!--begin::Text-->
                                                                        <p class="font-size-lg font-weight-normal">
                                                                            {{$data->descritpion}}
                                                                        </p>
                                                                    @endif
                                                                    <!--end::Text-->

                                                                        <!--begin::Action-->
                                                                        <div class="d-flex align-items-center">
                                                                            <a href="javascript:;"
                                                                               class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">
                                                                <span
                                                                        class="svg-icon svg-icon-md svg-icon-primary pr-2">
                                                                        <i class="fas fa-comments"></i>
                                                                </span>
                                                                            </a>
                                                                            @if($data->isLiked === false)
                                                                                <a href="javascript:;"
                                                                                   data-value="{{$data->tweetId}}"
                                                                                   class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5"
                                                                                   onclick="likeTweet('{{$data->tweetId}}')">
                                                                <span data-value="{{$data->tweetId}}"
                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"
                                                                      like-count="{{$data->favoriteCount}}">
                                                                        <i class="fas fa-heart"></i>
                                                                    {{$data->favoriteCount}}
                                                                </span>
                                                                                </a>
                                                                            @else
                                                                                <a href="javascript:;"
                                                                                   data-value="{{$data->tweetId}}"
                                                                                   class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-5"
                                                                                   onclick="disLikeTweet('{{$data->tweetId}}')">
                                                                <span data-value="{{$data->tweetId}}"
                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"
                                                                      like-count="{{$data->favoriteCount}}">
                                                                        <i class="fas fa-heart"
                                                                        ></i>
                                                                    {{$data->favoriteCount}}
                                                                </span>
                                                                                </a>
                                                                            @endif
                                                                            <a href="javascript:;"
                                                                               data-value2="{{$data->tweetId}}"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "
                                                                               onclick="retweetThisTweet('{{$data->tweetId}}')">
                                                                <span data-value2="{{$data->tweetId}}"
                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-1"
                                                                      retweet-count="{{$data->retweetCount}}">
                                                                        <i class="fas fa-retweet"></i>
                                                                    {{$data->retweetCount}}
                                                                </span>
                                                                            </a>
                                                                            @if(count($data->mediaUrls)>0)
                                                                                @if($data->mediaUrls[0]->type === 'photo')
                                                                                    <?php $type = 'image'?>
                                                                                @else
                                                                                    <?php $type = 'video'?>
                                                                                @endif
                                                                                <a id="reSocioButton"
                                                                                   href="javascript:;"
                                                                                   value="{{$data->descritpion}}"
                                                                                   imageSrc="#"
                                                                                   class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "
                                                                                   onclick="resocioButton('{{$data->descritpion}}','{{$data->mediaUrls[0]->url}}','{{$type}}',null,null)">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                </a>
                                                                            @else
                                                                                <a id="reSocioButton"
                                                                                   href="javascript:;"
                                                                                   value="{{$data->descritpion}}"
                                                                                   imageSrc="#"
                                                                                   class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "
                                                                                   onclick="resocioButton('{{$data->descritpion}}',null,null,null,null)">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                </a>
                                                                            @endif
                                                                        </div>
                                                                        <!--end::Action-->
                                                                    </div>
                                                                    <!--end::Body-->
                                                            </div>
                                                            <div class="fb_cmt_div mt-5">
                                                                <!--end::Container-->
                                                                <!--begin::Editor-->
                                                                <form class="position-relative">
                                                    <textarea class="form-control border-0 pr-10 resize-none"
                                                              rows="1" placeholder="Reply..."
                                                              name="{{$data->tweetId}}"></textarea>

                                                                    <div name="{{$data->tweetId}}"
                                                                         value="{{$feeds['data']->socialAccountDetails->user_name}}"
                                                                         id="commentButton"
                                                                         class="position-absolute top-0 right-0 mt-1 mr-n2">
                                                            <span class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                    <i class="fas fa-paper-plane"></i>
                                                            </span>
                                                                    </div>
                                                                </form>
                                                                <!--edit::Editor-->
                                                            </div>
                                                    </div>
                                                    <!--end::Text-->
                                                    <hr>
                                                    @endforeach
                                                    @else
                                                        <div style="color: RED;text-align:center;">
                                                            {{$feeds['message']}}
                                                        </div>
                                                    @endif
                                                    @else
                                                        <div class="text-center">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>{{$message}}</h6>
                                                        </div>
                                                    @endif
                                                    @elseif($message=== 'No Twitter account added yet! or Account has locked')
                                                        <div class="text-center">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>{{$message}}</h6>
                                                        </div>
                                                    @elseif($message=== 'failed')
                                                        <div class="text-center"
                                                             style="color: Red;text-align:center;">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>Sorry some error ,occurred please reload page</h6>
                                                        </div>
                                                    @else
                                                        <div class="text-center"
                                                             style="color: Red;text-align:center;">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>{{$message}}</h6>
                                                        </div>
                                                    @endif
                                                </div>
                                                <!--end::Body-->
                            </div>
                            <!--end::feeds-->
                        </div>

                    </div>
                    <!--end::Row-->
                    <!--end::Profile-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::Entry-->
        </div>
        <!--end::Content-->

        @endsection
        @section('scripts')
{{--            <script src="{{asset('js/contentStudio/search.js')}}"></script>--}}
            <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
            <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
            <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
            <script>
                // begin::sticky
                var sticky = new Sticky('.sticky');
                // end::sticky

                // accounts list div open
                $(".accounts-list-div").css({
                    display: "none"
                });
                $(".accounts-list-btn").click(function () {
                    $(".accounts-list-div").css({
                        display: "block"
                    });
                });

                $(document).ready(function () {
                    $("#discovery").trigger("click");
                    $('#addToCart').tooltip();
                });

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

                var pageid = 2;
                document.addEventListener("scroll", function (event) {
                    if (feedsLength >= 12) {
                        if (getDocHeight() === getScrollXY()[1] + window.innerHeight) {
                            getNextTwitterFeeds(accounId, pageid);
                            pageid++;
                        }
                    }
                });

                /**
                 * TODO we've to dislike the particular feed of twitter.
                 * This function is used for disliking  the particular feed of twitter.
                 * @param {integer} twitterID - twitterID of feed.
                 * ! Do not change this function without referring API format of disliking feed.
                 */
                function disLikeTweet(twitterID) {
                    if ($("a[data-value='" + twitterID + "']").hasClass("btn-icon-danger") === true) {
                        $.ajax({
                            type: 'post',
                            url: '/dislike-tweet',
                            data: {
                                twitterID, accounId
                            },
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.code === 200) {
                                    $("span[data-value='" + twitterID + "']").empty();
                                    $("span[data-value='" + twitterID + "']").append('<i class="fas fa-heart"></i>');
                                    let likecount = parseInt($("span[data-value='" + twitterID + "']").attr('like-count'));
                                    $("span[data-value='" + twitterID + "']").append(likecount - 1);
                                    $("a[data-value='" + twitterID + "']").removeClass('btn-icon-danger');
                                    $("a[data-value='" + twitterID + "']").addClass('btn-hover-icon-danger');
                                    toastr.success('Successfully Disliked Feed');
                                } else if (response.code === 400) {
                                    toastr.error(response.error);
                                } else {
                                    toastr.error('can not dislike ,some error occured');
                                }
                            }
                        });
                    } else {
                        $.ajax({
                            type: 'post',
                            url: '/like-tweet',
                            data: {
                                twitterID, accounId
                            },
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.code === 200) {
                                    $("span[data-value='" + twitterID + "']").empty();
                                    $("span[data-value='" + twitterID + "']").append('<i class="fas fa-heart"></i>');
                                    let likecount = parseInt($("span[data-value='" + twitterID + "']").attr('like-count'));
                                    $("span[data-value='" + twitterID + "']").append(likecount);
                                    $("a[data-value='" + twitterID + "']").removeClass('btn-hover-icon-danger');
                                    $("a[data-value='" + twitterID + "']").addClass('btn-icon-danger');
                                    toastr.success('Successfully Liked  Feed');
                                } else if (response.code === 400) {
                                    toastr.error(response.error);
                                } else {
                                    toastr.error('can not dislike ,some error occured');
                                }
                            }
                        });
                    }

                }

                /**
                 * TODO we've to like the particular feed of twitter.
                 * This function is used for liking  the particular feed of twitter account from socioboard.
                 * @param {integer} twitterID - twitterID of feed.
                 * ! Do not change this function without referring API format of liking feed.
                 */
                function likeTweet(twitterID) {
                    if ($("a[data-value='" + twitterID + "']").hasClass("btn-hover-icon-danger") === true) {
                        $.ajax({
                            type: 'post',
                            url: '/like-tweet',
                            data: {
                                twitterID, accounId
                            },
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.code === 200) {
                                    $("span[data-value='" + twitterID + "']").empty();
                                    $("span[data-value='" + twitterID + "']").append('<i class="fas fa-heart"></i>');
                                    let likecount = parseInt($("span[data-value='" + twitterID + "']").attr('like-count'));
                                    $("span[data-value='" + twitterID + "']").append(likecount + 1);
                                    $("a[data-value='" + twitterID + "']").removeClass('btn-hover-icon-danger');
                                    $("a[data-value='" + twitterID + "']").addClass('btn-icon-danger');
                                    toastr.success('Successfully Liked  Feed');
                                } else if (response.code === 400) {
                                    toastr.error(response.error);
                                } else {
                                    toastr.error('can not dislike ,some error occured');
                                }
                            }
                        });
                    } else {
                        $.ajax({
                            type: 'post',
                            url: '/dislike-tweet',
                            data: {
                                twitterID, accounId
                            },
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.code === 200) {
                                    $("span[data-value='" + twitterID + "']").empty();
                                    $("span[data-value='" + twitterID + "']").append('<i class="fas fa-heart"></i>');
                                    let likecount = parseInt($("span[data-value='" + twitterID + "']").attr('like-count'));
                                    $("span[data-value='" + twitterID + "']").append(likecount);
                                    $("a[data-value='" + twitterID + "']").removeClass('btn-icon-danger');
                                    $("a[data-value='" + twitterID + "']").addClass('btn-hover-icon-danger');
                                    toastr.success('Successfully Disliked Feed');
                                } else if (response.code === 400) {
                                    toastr.error(response.error);
                                } else {
                                    toastr.error('can not dislike ,some error occured');
                                }
                            }
                        });
                    }

                }

                /**
                 * TODO we've to get  the next  feeds of twitter account on pagination.
                 * This function is used for getting next feeds from particular twitter account,on pagination.
                 * @param {integer} accid- account id of that particular twitter account.
                 * ! Do not change this function without referring API format of getting the twitter feeds.
                 */
                function getNextTwitterFeeds(accid, pageId) {
                    $.ajax({
                        type: 'get',
                        url: '/get-Next-Twitter-feeds',
                        data: {
                            accid, pageId
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#twitterFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '        <div class="spinner-border" role="status"  style="display: none;">\n' +
                                '            <span class="sr-only">Loading...</span>\n' +
                                '        </div>\n' +
                                '\n' +
                                '        </div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            if (response.data.code === 200) {
                                let appendData = '',createdDate = new Date(element.publishedDate),published = String(createdDate).substring(0, 25);
                                $(".spinner-border").css("display", "none");
                                feedsLength = response.data.data.feeds.length;
                                response.data.data.feeds.map(element => {
                                    var type = '';
                                    appendData = '<div class="mb-5">\n' +
                                        '                                            <div>\n' +
                                        '                                                <div class="d-flex align-items-center pb-4">\n' +
                                        '                                                    <!--begin::Symbol-->\n' +
                                        '                                                    <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                        '                                                            <span class="symbol-label">\n' +
                                        '                                                                <img\n' +
                                        '                                                                    src="' + response.data.data.socialAccountDetails.profile_pic_url + '"\n' +
                                        '                                                                    class="h-75 align-self-end" alt=""/>\n' +
                                        '                                                            </span>' +
                                        '                                                    </div>\n' +
                                        '                                                    <div class="d-flex flex-column flex-grow-1">\n' +
                                        '                                                        <a href="' + element.tweetUrl + '"\n' +
                                        '                                                            target="_blank" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">' + response.data.data.socialAccountDetails.first_name + '</a>\n' +
                                        '                                                        <span\n' +
                                        '                                                            class="font-weight-bold">' + published + '</span>\n' +
                                        '                                                    </div>\n' +
                                        '                                                </div>\n' ;
                                    if (element.mediaUrls.length > 0) {
                                        appendData += '<div class="pt-4">';
                                        element.mediaUrls.map(data => {
                                            if (data.type === 'photo') {
                                                appendData += '<div class="">\n' +
                                                    '                                                                            <img src="' + data.url + '"\n' +
                                                    '                                                                                 class="img-fluid"/>\n' +
                                                    '                                                                        </div>';
                                            } else {
                                                appendData += '<div\n' +
                                                    '                                                                                class="embed-responsive embed-responsive-16by9">\n' +
                                                    '                                                                            <iframe class="embed-responsive-item rounded"\n' +
                                                    '                                                                                    src="' + data.url + '"\n' +
                                                    '                                                                                    allowfullscreen=""></iframe>\n' +
                                                    '                                                                        </div>';
                                            }
                                        });
                                        appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.descritpion +
                                            '                                                                </p>';
                                    } else {
                                        appendData += '<div>\n' +
                                            '                                                    <p class="font-size-lg font-weight-normal">\n' + element.descritpion +
                                            '                                                    </p>\n';
                                    }
                                    appendData += '<div class="d-flex align-items-center">\n' +
                                        '                                                        <a href="javascript:;"\n' +
                                        '                                                           class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">\n' +
                                        '                                                                <span\n' +
                                        '                                                                    class="svg-icon svg-icon-md svg-icon-primary pr-2">\n' +
                                        '                                                                        <i class="fas fa-comments"></i>\n' +
                                        '                                                                </span>\n' +
                                        '                                                        </a>\n';
                                    if (element.isLiked === false) {
                                        appendData += '                                                            <a href="javascript:;" data-value="' + element.tweetId + '"\n' +
                                            '                                                               class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                            '                                                               onclick="likeTweet(\'' + element.tweetId + '\')">\n' +
                                            '                                                                <span data-value="' + element.tweetId + '"\n' +
                                            '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                            '                                                                      like-count="' + element.favoriteCount + '">\n' +
                                            '                                                                        <i class="fas fa-heart"></i>\n' + element.favoriteCount +
                                            '                                                                </span>\n' +
                                            '                                                            </a>\n';
                                    } else {
                                        appendData += '                                                            <a href="javascript:;" data-value="' + element.tweetId + '"\n' +
                                            '                                                               class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                            '                                                               onclick="disLikeTweet(\'' + element.tweetId + '\')">\n' +
                                            '                                                                <span data-value="' + element.tweetId + '"\n' +
                                            '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                            '                                                                      like-count="' + element.favoriteCount + '">\n' +
                                            '                                                                        <i class="fas fa-heart"></i>\n' + element.favoriteCount +
                                            '                                                                </span>\n' +
                                            '                                                            </a>\n';
                                    }
                                    appendData += '<a href="javascript:;" data-value2="' + element.tweetId + '"\n' +
                                        '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                        '                                                           onclick="retweetThisTweet(\'' + element.tweetId + '\')">\n' +
                                        '                                                                <span data-value2="' + element.tweetId + '"\n' +
                                        '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-1"\n' +
                                        '                                                                      retweet-count="' + element.retweetCount + '">\n' +
                                        '                                                                        <i class="fas fa-retweet"></i>\n' + element.retweetCount +
                                        '                                                                </span>\n' +
                                        '                                                        </a>\n';
                                    if (element.mediaUrls.length > 0) {
                                        let type;
                                        if (element.mediaUrls[0].type === 'photo') {
                                            type = 'image'
                                        } else {
                                            type = 'video'
                                        }
                                        appendData += '<a id="reSocioButton" value="' + element.descritpion + '" href="javascript:;"\n' +
                                            '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.descritpion + '\',\'' + element.mediaUrls[0].url + '\',\'' + type + '\',null,null)"\n' +
                                            '                                                                <span\n' +
                                            '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '                                                                        <i class="fas fa-pencil-alt"></i>\n' +
                                            '                                                                </span>Re-socio\n' +
                                            '                                                        </a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton" value="' + element.descritpion + '" href="javascript:;"\n' +
                                            '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.descritpion + '\',null,null,null,null)"\n' +
                                            '                                                                <span\n' +
                                            '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '                                                                        <i class="fas fa-pencil-alt"></i>\n' +
                                            '                                                                </span>Re-socio\n' +
                                            '                                                        </a>\n';
                                    }
                                    appendData += '                                                    </div>\n' +
                                        '                                                </div>\n' +
                                        '                                            </div>\n' +
                                        '                                            <div class="fb_cmt_div mt-5">\n' +
                                        '                                                <form class="position-relative">\n' +
                                        '                                                    <textarea class="form-control border-0 pr-10 resize-none"\n' +
                                        '                                                              rows="1" placeholder="Reply..."\n' +
                                        '                                                              name="' + element.tweetId + '"></textarea>\n' +
                                        '                                                    <div name="' + element.tweetId + '"\n' +
                                        '                                                         value="' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                        '                                                         id="commentButton"\n' +
                                        '                                                         class="position-absolute top-0 right-0 mt-1 mr-n2">\n' +
                                        '                                                            <span class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                        '                                                                    <i class="fas fa-paper-plane"></i>\n' +
                                        '                                                            </span>\n' +
                                        '                                                    </div>\n' +
                                        '                                                </form>\n' +
                                        '                                            </div>\n' +
                                        '                                        </div>\n' +
                                        '                                        <hr>';
                                    $('#twitterFeeds').append(appendData);
                                });
                            } else if (response.data.code === 400) {
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div class="text-center">\n' +
                                    '                                                                                    <div class="symbol symbol-150">\n' +
                                    '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '                                                                                    </div>\n' + '\n' +
                                    '                                                                               </div>');
                            } else {
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div class="text-center">\n' +
                                    '                                                                                    <div class="symbol symbol-150">\n' +
                                    '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '                                                                                    </div>\n' + '\n' +
                                    '                                                                               </div>');
                            }
                        }
                    });
                }

                /**
                 * TODO we've to get  the next  feeds of twitter account on change of accounts from dropdown.
                 * This function is used for the next  feeds of twitter account on change of accounts from dropdown.
                 * @param {integer} accid- account id of that particular twitter account.
                 * ! Do not change this function without referring API format of getting the twitter feeds.
                 */
                function getTwitterFeeds(accid, pageId) {
                    $.ajax({
                        type: 'get',
                        url: '/get-Next-Twitter-feeds',
                        data: {
                          accid, pageId
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#twitterFeeds,#twitterProfileDiv').empty();
                            $('#twitterFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '        <div class="spinner-border" role="status"  style="display: none;">\n' +
                                '            <span class="sr-only">Loading...</span>\n' +
                                '        </div>\n' +
                                '\n' +
                                '        </div>');
                            $('#twitterProfileDiv').append('<div class="d-flex justify-content-center" >\n' +
                                '        <div class="spinner-border" role="status"  style="display: none;">\n' +
                                '            <span class="sr-only">Loading...</span>\n' +
                                '        </div>\n' +
                                '        </div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            $(".spinner-border").css("display", "none");
                            if (response.data.code === 200) {
                                $('#feeds_count,#following_count,#follower_count').empty();
                                $('#twitterProfileDiv').append('<div\n' +
                                    '                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                    '                                            <div class="symbol-label"\n' +
                                    '                                                 style="background-image:url(' + response.data.data.socialAccountDetails.profile_pic_url + ')"></div>\n' +
                                    '                                            <i class="symbol-badge bg-success"></i>\n' +
                                    '                                        </div>\n' +
                                    '                                        <div>\n' +
                                    '                                            <a href="' + response.data.data.socialAccountDetails.profile_url + '"\n' +
                                    '                                               class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                    '                                               target="_blank">\n' + response.data.data.socialAccountDetails.first_name +
                                    '                                                <i\n' +
                                    '                                                    class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                                    '                                            </a>\n' +
                                    '                                            <div class="rating-css">\n' +
                                    '                                                <div class="star-icon">\n' +
                                    (
                                        response.data.data.socialAccountDetails.rating === 1 ? ' <input type="radio" checked name="rating1" id="rating1">\n' +
                                            '<label for="rating1" class="fas fa-star"></label>\n' : ' <input type="radio"  name="rating1" id="rating1">\n' +
                                            '<label for="rating1" class="fas fa-star"></label>\n'
                                    ) +
                                    (
                                        response.data.data.socialAccountDetails.rating === 2 ? ' <input type="radio" checked name="rating2" id="rating2">\n' +
                                            '<label for="rating2" class="fas fa-star"></label>\n' : ' <input type="radio"  name="rating2" id="rating2">\n' +
                                            '<label for="rating2" class="fas fa-star"></label>\n'
                                    ) +
                                    (
                                        response.data.data.socialAccountDetails.rating === 3 ? ' <input type="radio" checked name="rating3" id="rating3">\n' +
                                            '<label for="rating3" class="fas fa-star"></label>\n' : ' <input type="radio"  name="rating3" id="rating3">\n' +
                                            '<label for="rating3" class="fas fa-star"></label>\n'
                                    ) +
                                    (
                                        response.data.data.socialAccountDetails.rating === 4 ? ' <input type="radio" checked name="rating4" id="rating4">\n' +
                                            '<label for="rating4" class="fas fa-star"></label>\n' : ' <input type="radio"  name="rating4" id="rating4">\n' +
                                            '<label for="rating4" class="fas fa-star"></label>\n'
                                    ) +
                                    (
                                        response.data.data.socialAccountDetails.rating === 5 ? ' <input type="radio" checked name="rating5" id="rating5">\n' +
                                            '<label for="rating5" class="fas fa-star"></label>\n' : ' <input type="radio"  name="rating5" id="rating5">\n' +
                                            '<label for="rating5" class="fas fa-star"></label>\n'
                                    ) +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="mt-2">\n' +
                                    '                                                <a href="#"\n' +
                                    '                                                   class="btn btn-sm font-weight-bold py-2 px-3 px-xxl-5 my-1" onclick="return false" id="chatID" title="Coming soon">Chat</a>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>');
                                let appendData = '';
                                $(".spinner-border").css("display", "none");
                                feedsLength = response.data.data.feeds.length;
                                response.data.data.feeds.map(element => {
                                    let createdDate = new Date(element.publishedDate),published = String(createdDate).substring(0, 25);
                                    appendData = '<div class="mb-5">\n' +
                                        '                                            <div>\n' +
                                        '                                                <div class="d-flex align-items-center pb-4">\n' +
                                        '                                                    <!--begin::Symbol-->\n' +
                                        '                                                    <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                        '                                                            <span class="symbol-label">\n' +
                                        '                                                                <img\n' +
                                        '                                                                    src="' + response.data.data.socialAccountDetails.profile_pic_url + '"\n' +
                                        '                                                                    class="h-75 align-self-end" alt=""/>\n' +
                                        '                                                            </span>\n' +
                                        '                                                    </div>\n' +
                                        '                                                    <div class="d-flex flex-column flex-grow-1">\n' +
                                        '                                                        <a href="' + element.tweetUrl + '"\n' +
                                        '                                                           class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">' + response.data.data.socialAccountDetails.first_name + '</a>\n' +
                                        '                                                        <span\n' +
                                        '                                                            class="font-weight-bold">' + published + '</span>\n' +
                                        '                                                    </div>\n' +
                                        '                                                </div>\n' ;
                                    if (element.mediaUrls.length > 0) {
                                        appendData += '<div class="pt-4">';
                                        element.mediaUrls.map(data => {
                                            if (data.type === 'photo') {
                                                appendData += '<div class="">\n' +
                                                    '                                                                            <img src="' + data.url + '"\n' +
                                                    '                                                                                 class="img-fluid"/>\n' +
                                                    '                                                                        </div>';
                                            } else {
                                                appendData += '<div\n' +
                                                    '                                                                                class="embed-responsive embed-responsive-16by9">\n' +
                                                    '                                                                            <iframe class="embed-responsive-item rounded"\n' +
                                                    '                                                                                    src="' + data.url + '"\n' +
                                                    '                                                                                    allowfullscreen=""></iframe>\n' +
                                                    '                                                                        </div>';
                                            }
                                        });
                                        appendData += '  <p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.descritpion +
                                            '                                                                </p>';
                                    } else {
                                        appendData += '                                                <div>\n' +
                                            '                                                    <p class="font-size-lg font-weight-normal">\n' + element.descritpion +
                                            '                                                    </p>\n' ;
                                    }
                                    appendData += '                                                    <!--begin::Action-->\n' +
                                        '                                                    <div class="d-flex align-items-center">\n' +
                                        '                                                        <a href="#"\n' +
                                        '                                                           class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">\n' +
                                        '                                                                <span\n' +
                                        '                                                                    class="svg-icon svg-icon-md svg-icon-primary pr-2">\n' +
                                        '                                                                        <i class="fas fa-comments"></i>\n' +
                                        '                                                                </span>\n' +
                                        '                                                        </a>\n';
                                    if (element.isLiked === false) {
                                        appendData += '                                                            <a href="javascript:;" data-value="' + element.tweetId + '"\n' +
                                            '                                                               class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                            '                                                               onclick="likeTweet(\'' + element.tweetId + '\')">\n' +
                                            '                                                                <span data-value="' + element.tweetId + '"\n' +
                                            '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                            '                                                                      like-count="' + element.favoriteCount + '">\n' +
                                            '                                                                        <i class="fas fa-heart"></i>\n' + element.favoriteCount +
                                            '                                                                </span>\n' +
                                            '                                                            </a>\n';
                                    } else {
                                        appendData += '                                                            <a href="javascript:;" data-value="' + element.tweetId + '"\n' +
                                            '                                                               class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                            '                                                               onclick="disLikeTweet(\'' + element.tweetId + '\')">\n' +
                                            '                                                                <span data-value="' + element.tweetId + '"\n' +
                                            '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                            '                                                                      like-count="' + element.favoriteCount + '">\n' +
                                            '                                                                        <i class="fas fa-heart"></i>\n' + element.favoriteCount +
                                            '                                                                </span>\n' +
                                            '                                                            </a>\n';
                                    }
                                    appendData += '                                                        <a href="javascript:;" data-value2="' + element.tweetId + '"\n' +
                                        '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                        '                                                           onclick="retweetThisTweet(\'' + element.tweetId + '\')">\n' +
                                        '                                                                <span data-value2="' + element.tweetId + '"\n' +
                                        '                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-1"\n' +
                                        '                                                                      retweet-count="' + element.retweetCount + '">\n' +
                                        '                                                                        <i class="fas fa-retweet"></i>\n' + element.retweetCount +
                                        '                                                                </span>\n' +
                                        '                                                        </a>\n';
                                    if (element.mediaUrls.length > 0) {
                                        let type
                                        if (element.mediaUrls[0].type === 'photo') {
                                            type = 'image'
                                        } else {
                                            type = 'video'
                                        }
                                        appendData += '<a id="reSocioButton" value="' + element.descritpion + '" href="javascript:;"\n' +
                                            '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.descritpion + '\',\'' + element.mediaUrls[0].url + '\',\'' + type + '\',null,null)"\n' +
                                            '                                                                <span\n' +
                                            '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '                                                                        <i class="fas fa-pencil-alt"></i>\n' +
                                            '                                                                </span>Re-socio\n' +
                                            '                                                        </a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton" value="' + element.descritpion + '" href="javascript:;"\n' +
                                            '                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.descritpion + '\',null,null,null,null)"\n' +
                                            '                                                                <span\n' +
                                            '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '                                                                        <i class="fas fa-pencil-alt"></i>\n' +
                                            '                                                                </span>Re-socio\n' +
                                            '                                                        </a>\n';
                                    }
                                    appendData += '                                                    </div>\n' +
                                        '                                                </div>\n' +
                                        '                                            </div>\n' +
                                        '                                            <div class="fb_cmt_div mt-5">\n' +
                                        '                                                <form class="position-relative">\n' +
                                        '                                                    <textarea class="form-control border-0 pr-10 resize-none"\n' +
                                        '                                                              rows="1" placeholder="Reply..."\n' +
                                        '                                                              name="' + element.tweetId + '"></textarea>\n' +
                                        '                                                    <div name="' + element.tweetId + '"\n' +
                                        '                                                         value="' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                        '                                                         id="commentButton"\n' +
                                        '                                                         class="position-absolute top-0 right-0 mt-1 mr-n2">\n' +
                                        '                                                            <span class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                        '                                                                    <i class="fas fa-paper-plane"></i>\n' +
                                        '                                                            </span>\n' +
                                        '                                                    </div>\n' +
                                        '                                                </form>\n' +
                                        '                                            </div>\n' +
                                        '                                        </div>\n' +
                                        '                                        <hr>';
                                    $('#twitterFeeds').append(appendData);
                                });
                                $('#follower_count').append(response.data.data.SocialAccountStats.follower_count);
                                $('#following_count').append(response.data.data.SocialAccountStats.following_count);
                                $('#feeds_count').append(response.data.data.SocialAccountStats.total_post_count);
                            } else if (response.data.code === 400) {
                                $('#twitterFeeds,#twitterProfileDiv').empty();
                                $('#twitterProfileDiv').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div class="text-center">\n' +
                                    '                                                                                    <div class="symbol symbol-150">\n' +
                                    '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '                                                                                    </div>\n' + '\n' +
                                    '                                                                               </div>');

                            } else {
                                $('#twitterFeeds,#twitterProfileDiv').empty();
                                $('#twitterProfileDiv').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#twitterFeeds').append('<div class="text-center">\n' +
                                    '                                                                                    <div class="symbol symbol-150">\n' +
                                    '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '                                                                                    </div>\n' + '\n' +
                                    '                                                                               </div>');
                            }
                        }
                    });
                }

                /**
                 * TODO we've to get  comment on the particular twitter feed of twitter account from sociobaord.
                 * This function is used for commenting on particular twitter feed of the twitter account.
                 * !Do not change this function without referring API format of commenting on particular twitter feed.
                 */
                $(document).on("click", "#commentButton", function (e) {
                    e.preventDefault();
                    let twitterID = $(this).attr('name'),comment = $("textarea[name='" + twitterID + "']").val(),userName = $(this).attr('value');
                    if (comment === '') {
                        toastr.error('Comment can not be empty', "");
                    } else {
                        $.ajax({
                            type: 'post',
                            url: '/comment-on-tweet',
                            data: {
                                twitterID, accounId, userName, comment
                            },
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.code === 200) {
                                    toastr.success('Successfully commented on Tweet');
                                    $("textarea[name='" + twitterID + "']").val("");
                                } else if (response.code === 400) {
                                    toastr.error(response.message);
                                    $("textarea[name='" + twitterID + "']").val("");
                                } else {
                                    $("textarea[name='" + twitterID + "']").val("");
                                    toastr.error('Can not comment,some error occured.');
                                }
                            }
                        });
                    }
                });

                /**
                 * TODO we've to get  the twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                 * This function is used for getting twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                 * @param {this} data- account id of that particular twitter account.
                 * ! Do not change this function without referring API format of getting the twitter feeds.
                 */
                function call(data) {
                    pageid = 2;
                    accounId = data.value;//accountid of particular twitter account from dropdown
                    getTwitterFeeds(data.value, 1);
                }

                /**
                 * TODO we have to perform the retweet operation from sociobaord.
                 * This function is used to perform the retweeting a post operation from particular twitter account from sociobaord.
                 * @param {twitterID} twitterID- twitter account id of that particular twitter account.
                 * ! Do not change this function without referring API format of retweeeting particular tweet.
                 */
                function retweetThisTweet(twitterID) {
                    $.ajax({
                        type: 'post',
                        url: '/retweet-this-tweet',
                        data: {
                            twitterID, accounId
                        },
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        dataType: 'json',
                        beforeSend: function () {
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                $("span[data-value2='" + twitterID + "']").empty();
                                $("span[data-value2='" + twitterID + "']").append('<i class="fas fa-retweet"></i>');
                                let likecount = parseInt($("span[data-value2='" + twitterID + "']").attr('retweet-count'));
                                $("span[data-value2='" + twitterID + "']").append(likecount + 1);
                                toastr.success(' Retweeted');
                            } else if (response.code === 400) {
                                toastr.error(response.error);
                            } else {
                                toastr.error('can not Retweet ,some error occured');
                            }
                        }
                    });
                }

                /**
                 * TODO We have to publish particular twitter post from particular twitter feed on multiple social account.
                 * This function is used for publishing  particular twitter post from particular twitter feed on multiple social account
                 * @param {string} description-description of particular twitter post .
                 * @param {string} mediaUrl- link of image or video in the twitter post.
                 * @param {string} type- type of the post video ,image or no media urls.
                 * @param {string} title- title on post.
                 * @param {sourceUrl} sourceUrlon post.
                 * ! Do not change this function without referring API format of resocio.
                 */
                function resocioButton(description, mediaUrl, type, title, sourceUrl) {
                    $('body').find('#resocioModal').remove();
                    let action = '/discovery/content_studio/publish-content/feeds-modal';
                    let isType = (type == null) ? 'no media' : type;
                    $.ajax({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        type: 'post',
                        url: action,
                        data: {
                            mediaUrl, sourceUrl,
                            description, type, isType
                        },
                        success: function (data) {
                            $('body').append(data.html);
                            $('body').find('#resocioModal').modal('show');
                            // begin:normal post emoji
                            $('body').find("#normal_post_area").emojioneArea({
                                pickerPosition: "right",
                                tonesStyle: "bullet"
                            });
                            downloadMediaUrl();
                        },
                        error: function (error) {
                            if (error.responseJSON.message) {
                                toastr.error(`${error.responseJSON.message}`);
                            }
                        },
                    });
                };
                $('#chatID').tootip();
            </script>
@endsection
