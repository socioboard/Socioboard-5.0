@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Youtube Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="/plugins/custom/emojionearea/css/emojionearea.min.css"/>
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

                        <div class="sticky" data-sticky="true" data-margin-top="180px" data-sticky-for="1023"
                             data-sticky-class="kt-sticky">

                            <!-- begin:Accounts list -->
                            <div class="form-group">
                                <select
                                        class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 selectAccountsDiv"
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
                                        <option selected value="failed">No
                                            accounts,Some error occured
                                        </option>
                                    @elseif($message=== 'No Youtube account has been added yet!')
                                        <option selected value="failed">No
                                            Youtube Account has been added yet for this team yet! or Account has been locked
                                        </option>
                                    @endif
                                </select>
                            </div>
                            <!-- end:Accounts list -->
                            <!--begin::Profile-->
                            <div class="card card-custom gutter-b ">
                                @if(count($accounts)>0)
                                    <div
                                            class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                        <div class="ribbon-target bg-youtube" style="top: -2px; right: 20px;">
                                            <i class="fab fa-youtube"></i>
                                        </div>
                                        <!--begin::User-->
                                        <div class="d-flex align-items-center" id="youtubeProfileDiv">
                                            <div
                                                    class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                <div class="symbol-label"
                                                     style="background-image:url('{{$accounts[0]->profile_pic_url}}')"></div>
                                                <i class="symbol-badge bg-success"></i>
                                            </div>
                                            <div>
                                                <a href="{{$feeds['data']->socialAccountDetails->profile_url}}"
                                                   class="font-weight-bolder font-size-h5 text-hover-primary "
                                                   target="_blank">
                                                    {{$accounts[0]->first_name}}
                                                </a>
                                                <div class="text-muted">
{{--                                                    {{$accounts[0]->email}}--}}
                                                </div>
                                                <!-- begin:account star rating -->
                                                <div class="rating-css">
                                                    <div class="star-icon">
                                                        <input type="radio"
                                                               <?php if ($accounts[0]->rating === 1) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                               id="rating1{{$accounts[0]->account_id}}"
                                                               onclick="ratingUpdate('1', '{{$accounts[0]->account_id}}');">
                                                        <label
                                                                for="rating1{{$accounts[0]->account_id}}"
                                                                class="fas fa-star"></label>
                                                        <input type="radio"
                                                               <?php if ($accounts[0]->rating == 2) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                               id="rating2{{$accounts[0]->account_id}}"
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

                                            </div>
                                        </div>
                                        <!--end::User-->

                                        <!--begin::Contact-->
                                        <div class="py-9" id="follower_counts-div">
                                            @if($feeds['code'] === 200)
                                                <div class="d-flex align-items-center justify-content-between mb-2">
                                                    <span class="font-weight-bold mr-2">Subscription Count:</span>
                                                    <a href="javascript:;"
                                                       class=" text-hover-primary">{{$feeds['data']->SocialAccountStats->subscription_count}}</a>
                                                </div>
                                            @endif
                                        </div>
                                        <!--end::Contact-->
                                    </div>
                                @else
                                    <div class="text-center youtubeNoDIv">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Currently no Youtube Account has been added for this team or Account has been locked.</h6>
                                    </div>
                                @endif
                            </div>
                            <!--end::Profile-->

                        </div>
                    </div>
                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card card-custom gutter-b" id="ss-feedsDiv">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Feeds</h3>
                            </div>
                            <!--end::Header-->
                            <!--begin::Body-->
                            <div class="card-body" id="youtubeFeeds">
                            @if(count($accounts)>0)
                                @if($feeds['code']=== 200)
                                    <!--begin::Video-->
                                        <script>
                                            var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                        </script>
                                        @if(sizeof($feeds['data']->feeds) !== 0 )
                                            @foreach($feeds['data']->feeds as $data)
                                                <div class="mb-5">
                                                <?php $date =  new Datetime($data->publishedDate );
                                                $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                                ?>
                                                    <!--begin::Top-->
                                                    <div class="d-flex align-items-center">
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
                                                            <a href="{{$feeds['data']->socialAccountDetails->profile_url}}" target="_blank"
                                                               class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">{{$feeds['data']->socialAccountDetails->first_name}}</a>
                                                            <span
                                                                    class="text-muted font-weight-bold">{{$date->format('Y-m-d')}} {{$date->format('H:i:s')}}</span>
                                                        </div>
                                                        <!--end::Info-->
                                                    </div>
                                                    <!--end::Top-->

                                                    <!--begin::Bottom-->
                                                    <div class="pt-4">

                                                        <!--begin::Video-->
                                                        <div class="embed-responsive embed-responsive-16by9">
                                                            <iframe class="embed-responsive-item rounded"
                                                                    src="{{$data->embed_url}}"
                                                                    allowfullscreen=""></iframe>
                                                        </div>
                                                        <!--end::Video-->

                                                        <!--begin::Text-->
                                                        <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                            {{$data->description}}
                                                        </p>
                                                        <!--end::Text-->

                                                        <!--begin::Action-->
                                                        <div class="d-flex align-items-center">
                                                            <a href="javascript:;"
                                                               class="font-weight-bolder font-size-sm p-2 "
                                                               data-toggle="tooltip" title="I like this">
                                                                    <span class="svg-icon svg-icon-md svg-icon-danger pr-1"
                                                                          onclick="likeTweet('{{$data->videoId}}')">
                                                                            <i class="fas fa-thumbs-up" id="likeCount">
                                                                            </i>
                                                                    </span>
                                                            </a>
                                                            <a href="javascript:;"
                                                               class="font-weight-bolder font-size-sm p-2 "
                                                               data-toggle="tooltip" title="I dislike this">
                                                                    <span class="svg-icon svg-icon-md svg-icon-danger pr-1"
                                                                          onclick="disLikeTweet('{{$data->videoId}}')">
                                                                            <i class="fas fa-thumbs-down"
                                                                               id="dislikeCount">
                                                                        </i>
                                                                    </span>
                                                            </a>
                                                            <a id="reSocioButton"
                                                               onclick="resocioButton('{{$data->description}}',null,'video',null,'{{$data->mediaUrl}}')"
                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-retweet"></i>
                                                            </span>Re-socio
                                                            </a>
                                                        </div>
                                                        <!--end::Action-->
                                                    </div>
                                                    <!--end::Bottom-->

                                                    <!--begin::Comments toggle-->
                                                    <div class="fb_cmt_div">


                                                        <!--end::Item-->

                                                        <!--begin::Separator-->
                                                        <div class="separator separator-solid mt-5 mb-4"></div>
                                                        <!--end::Separator-->

                                                        <!--begin::Editor-->
                                                        <form class="position-relative">
                                                    <textarea id="" class="form-control border-0 pr-10 resize-none sendCommentDiv"
                                                              rows="1" placeholder="Reply..."
                                                              name="{{$data->videoId}}"></textarea>

                                                            <div class="position-absolute top-0 right-0 mt-1 mr-n2"
                                                                 name="{{$data->videoId}}" id="commentButton"
                                                                 onclick="commentOnFeed('{{$data->videoId}}')">
                                                                <span
                                                                        class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                        <i class="fas fa-paper-plane"></i>
                                                                </span>
                                                            </div>
                                                        </form>
                                                        <!--edit::Editor-->
                                                    </div>
                                                    <!--end::Comments toggle-->
                                                </div>
                                                <!--end::Video-->
                                            @endforeach
                                        @else
                                            <div class="text-center">
                                                <div class="symbol symbol-150">
                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                </div>
                                                <h6>Currently no youtube feeds found for this account</h6>
                                            </div>
                                        @endif
                                    @endif
                                @else
                                    <div class="text-center youtubeNoDIv">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Currently no Youtube Account has been added for this team yet or Account has been locked.</h6>
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
    {{--    <script src="{{asset('js/contentStudio/search.js')}}"></script>--}}
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script src="/plugins/custom/dropify/dist/js/dropify.min.js"></script>
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script src="{{asset('js/accounts.js')}}"></script>
    <script src="../plugins/custom/emojionearea/js/emojionearea.min.js"></script>
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
        });


        // begin:normal post emoji
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // end:normal post emoji
        // begin:images and videos upload


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

        //taken from http://james.padolsey.com/javascript/get-document-height-cross-browser/
        function getDocHeight() {
            var D = document;
            return Math.max(
                D.body.scrollHeight, D.documentElement.scrollHeight,
                D.body.offsetHeight, D.documentElement.offsetHeight,
                D.body.clientHeight, D.documentElement.clientHeight
            );
        }

        let pageId = 2;
        document.addEventListener("scroll", function (event) {
            if (feedsLength >= 12) {
                if (getDocHeight() == getScrollXY()[1] + window.innerHeight) {
                    getNextYoutubeFeeds(accounId, pageId);
                    pageId++;
                }
            }
        });

        /**
         * TODO we've to get  the youtube feeds and data of a particular youtube channel account on change of youtube channel ccounts from dropdown.
         * This function is used for getting youtube channel account feeds and data of a particular youtube channel account  on change of youtube channel accounts from dropdown.
         * @param {this} data- account id of that particular youtube channel account.
         * ! Do not change this function without referring API format of getting the outube channel feeds.
         */
        function call(data) {
            $(function() {
                $('body').scrollTop(0);
            });
            accounId = data.value;
            getYoutubeFeeds(data.value, 1);
        }

        function getYoutubeFeeds(accid, pageid) {
            $.ajax({
                type: 'get',
                url: '/get-next-youtube-feeds',
                data: {
                    accid, pageid
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#youtubeFeeds').empty().append('<div class="d-flex justify-content-center" >\n' +
                        '        <div class="spinner-border" role="status"  id="' + pageid + '" style="display: none;">\n' +
                        '            <span class="sr-only">Loading...</span>\n' +
                        '        </div>\n' +
                        '\n' +
                        '        </div>');
                    $(".spinner-border").css("display", "block");
                    $('#follower_counts-div').empty();
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        let append= '';
                        let appendData2= '';
                        $('#youtubeProfileDiv').empty();
                        append+='<div\n' +
                            '                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                            '                                            <div class="symbol-label"\n' +
                            '                                                 style="background-image:url(' + response.data.socialAccountDetails.profile_pic_url + ')"></div>\n' +
                            '                                            <i class="symbol-badge bg-success"></i>\n' +
                            '                                        </div>\n' +
                            '                                        <div>\n' +
                            '                                            <a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                            '                                               class="font-weight-bolder font-size-h5 text-hover-primary "\n' +
                            '                                               target="_blank">\n' + response.data.socialAccountDetails.first_name +
                            '                                            </a>\n' +
                            // '  <div class="text-muted">\n' + response.data.socialAccountDetails.email +
                            // '                                            </div>' +
                            '                                            <div class="rating-css">\n' +
                            '                                                <div class="star-icon">\n' ;
                        (response.data.socialAccountDetails.rating === 1) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating1' + accid + '" onclick="ratingUpdate(\'1\', ' + accid + ');">\n' +
                            '<label for="rating1' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating' + accid + '" id="rating1' + accid + '" onclick="ratingUpdate(\'1\', ' + accid + ');">\n' +
                            '<label for="rating1' + accid + '" class="fas fa-star"></label>\n';
                        (response.data.socialAccountDetails.rating === 2) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating2' + accid + '" onclick="ratingUpdate(\'2\', ' + accid + ');">\n' +
                            '<label for="rating2' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating2' + accid + '" onclick="ratingUpdate(\'2\', ' + accid + ');">\n' +
                            '<label for="rating2' + accid + '" class="fas fa-star"></label>\n';
                        (response.data.socialAccountDetails.rating === 3) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating3' + accid + '" onclick="ratingUpdate(\'3\', ' + accid + ');">\n' +
                            '<label for="rating3' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating3' + accid + '" onclick="ratingUpdate(\'3\', ' + accid + ');">\n' +
                            '<label for="rating3' + accid + '" class="fas fa-star"></label>\n';
                        (response.data.socialAccountDetails.rating === 4) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating4' + accid + '" onclick="ratingUpdate(\'4\', ' + accid + ');">\n' +
                            '<label for="rating4' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating4' + accid + '" onclick="ratingUpdate(\'4\', ' + accid + ');">\n' +
                            '<label for="rating4' + accid + '" class="fas fa-star"></label>\n';
                        (response.data.socialAccountDetails.rating === 5) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating5' + accid + '" onclick="ratingUpdate(\'5\', ' + accid + ');">\n' +
                            '<label for="rating5' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating5' + accid + '" onclick="ratingUpdate(\'5\', ' + accid + ');">\n' +
                            '<label for="rating5' + accid + '" class="fas fa-star"></label>\n';
                        append += '</div></div>\n' +
                            '                                        </div>';
                        $('#youtubeProfileDiv').append(append);
                        appendData2 = '<div class="d-flex align-items-center justify-content-between mb-2">\n' +
                            '<span class="font-weight-bold mr-2">Subscription Count:</span>\n' +
                            '<span class=""\n' +
                            'id="page_count">' + response.data.SocialAccountStats.subscription_count + '</span>\n' +
                            '</div>';
                        $('#follower_counts-div').append(appendData2);
                        feedsLength = response.data.feeds.length;
                        $('#youtubeFeeds').empty();
                        let appendData = '';
                        if (response.data.feeds.length > 0) {
                            response.data.feeds.map(element => {
                                let createdDate = new Date(element.publishedDate),
                                    published = String(createdDate).substring(0, 25);
                                appendData = '<div class="mb-5">\n' +
                                    '                                            <div class="d-flex align-items-center">\n' +
                                    '                                                <!--begin::Symbol-->\n' +
                                    '                                                <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                    '                                                        <span class="symbol-label">\n' +
                                    '                                                            <img src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                    '                                                                 class="h-75 align-self-end" alt=""/>\n' +
                                    '                                                        </span>\n' +
                                    '                                                </div>\n' +
                                    '                                                <div class="d-flex flex-column flex-grow-1" >\n' +
                                    '                                                    <a href="' + response.data.socialAccountDetails.profile_url + '" \n' +
                                    '                                                       class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv" target="_blank">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                    '                                                    <span\n' +
                                    '                                                        class="text-muted font-weight-bold">' + published + '</span>\n' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="pt-4">\n' +
                                    '                                                <div class="embed-responsive embed-responsive-16by9">\n' +
                                    '                                                    <iframe class="embed-responsive-item rounded"\n' +
                                    '                                                            src="' + element.embed_url + '" allowfullscreen=""></iframe>\n' +
                                    '                                                </div>\n' +
                                    '                                                <p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description +
                                    '                                                </p>\n' +
                                    '                                                <div class="d-flex align-items-center">\n';
                                appendData += '<a href="javascript:;"\n' +
                                    '                                                               class="font-weight-bolder font-size-sm p-2 "\n' +
                                    '                                                               data-toggle="tooltip" title="I like this">\n' +
                                    '                                                                    <span class="svg-icon svg-icon-md svg-icon-danger pr-1"\n' +
                                    '                                                                          onclick="likeTweet(\'' + element.videoId + '\')">\n' +
                                    '                                                                            <i class="fas fa-thumbs-up" id="likeCount">\n';
                                appendData += '                                                                            </i>\n' +
                                    '                                                                    </span>\n' +
                                    '                                                            </a>\n' +
                                    '                                                            <a href="javascript:;"\n' +
                                    '                                                               class="font-weight-bolder font-size-sm p-2 "\n' +
                                    '                                                               data-toggle="tooltip" title="I dislike this">\n' +
                                    '                                                                    <span class="svg-icon svg-icon-md svg-icon-danger pr-1"\n' +
                                    '                                                                          onclick="disLikeTweet(\'' + element.videoId + '\')">\n' +
                                    '                                                                            <i class="fas fa-thumbs-down"\n' +
                                    '                                                                               id="dislikeCount">\n';
                                appendData += '                                                                        </i>\n' +
                                    '                                                                    </span>\n' +
                                    '                                                            </a>';
                                appendData += '<a id="reSocioButton"\n' +
                                    '                                                               onclick="resocioButton(\'' + element.description.replace(/\n/g, '') + '\',null,\'' + 'video' + '\',null,\'' + element.mediaUrl + '\')"\n' +
                                    '                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                    '                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                    '                                                                    <i class="fas fa-retweet"></i>\n' +
                                    '                                                            </span>Re-socio\n' +
                                    '                                                            </a>' +
                                    '                                                </div>\n' +
                                    '                                            </div>\n' +
                                    '                                            <div class="fb_cmt_div">\n' +
                                    '                                                <div class="separator separator-solid mt-5 mb-4"></div>\n' +
                                    '                                                <form class="position-relative">\n' +
                                    '                                                    <textarea id="" class="form-control border-0 pr-10 resize-none sendCommentDiv"\n' +
                                    '                                                              rows="1" placeholder="Reply..." name="' + element.videoId + '"></textarea>\n' +
                                    '\n' +
                                    '                                                    <div class="position-absolute top-0 right-0 mt-1 mr-n2" name ="' + element.videoId + '" id="commentButton" onclick="commentOnFeed(\'' + element.videoId + '\')">\n' +
                                    '                                                                <span\n' +
                                    '                                                                    class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                    '                                                                        <i class="fas fa-paper-plane"></i>\n' +
                                    '                                                                </span>\n' +
                                    '                                                    </div>\n' +
                                    '                                                </form>\n' +
                                    '                                            </div>\n' +
                                    '                                        </div>';
                                $('#youtubeFeeds').append(appendData);
                            });
                        } else {
                            $('#youtubeFeeds').append('<div class="text-center">\n' +
                                '                                                <div class="symbol symbol-150">\n' +
                                '                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '                                                </div>\n' +
                                '                                                <h6>Currently no youtube  feeds found for this account</h6>\n' +
                                '                                            </div>');
                        }

                    }
                }
            });
        }


        function getNextYoutubeFeeds(accid, pageid) {
            $.ajax({
                type: 'get',
                url: '/get-next-youtube-feeds',
                data: {
                    accid, pageid
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#youtubeFeeds').append('<div class="d-flex justify-content-center" >\n' +
                        '        <div class="spinner-border" role="status"  id="' + pageid + '" style="display: none;">\n' +
                        '            <span class="sr-only">Loading...</span>\n' +
                        '        </div>\n' +
                        '\n' +
                        '        </div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#youtubeProfileDiv').empty();
                        $('#youtubeProfileDiv').append('<div\n' +
                            '                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                            '                                            <div class="symbol-label"\n' +
                            '                                                 style="background-image:url(' + response.data.socialAccountDetails.profile_pic_url + ')"></div>\n' +
                            '                                            <i class="symbol-badge bg-success"></i>\n' +
                            '                                        </div>\n' +
                            '                                        <div>\n' +
                            '                                            <a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                            '                                               class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                            '                                               target="_blank">\n' + response.data.socialAccountDetails.first_name +
                            '                                                <i\n' +
                            '                                                    class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                            '                                            </a>\n' +
                            '  <div class="text-muted">\n' + response.data.socialAccountDetails.email +
                            '                                            </div>' +
                            '                                            <div class="rating-css">\n' +
                            '                                                <div class="star-icon">\n' +
                            (
                                response.data.data.socialAccountDetails.rating === 1 ? ' <input type="radio" checked name="rating1" id="rating1">\n' +
                                    '<input type="radio" name="rating1" id="rating1">\n' : ' <input type="radio"  name="rating1" id="rating1">\n' +
                                    '<input type="radio" name="rating1" id="rating1">\n'
                            ) +
                            (
                                response.data.data.socialAccountDetails.rating === 2 ? ' <input type="radio" checked name="rating2" id="rating2">\n' +
                                    '<input type="radio" name="rating2" id="rating2">\n' : ' <input type="radio"  name="rating2" id="rating2">\n' +
                                    '<input type="radio" name="rating2" id="rating2">\n'
                            ) +
                            (
                                response.data.data.socialAccountDetails.rating === 3 ? ' <input type="radio" checked name="rating3" id="rating3">\n' +
                                    '<input type="radio" name="rating3" id="rating3">\n' : ' <input type="radio"  name="rating3" id="rating3">\n' +
                                    '<input type="radio" name="rating3" id="rating3">\n'
                            ) +
                            (
                                response.data.data.socialAccountDetails.rating === 4 ? ' <input type="radio" checked name="rating4" id="rating4">\n' +
                                    '<input type="radio" name="rating4" id="rating4">\n' : ' <input type="radio"  name="rating4" id="rating4">\n' +
                                    '<input type="radio" name="rating4" id="rating4">\n'
                            ) +
                            (
                                response.data.data.socialAccountDetails.rating === 5 ? ' <input type="radio" checked name="rating5" id="rating5">\n' +
                                    '<input type="radio" name="rating5" id="rating5">\n' : ' <input type="radio"  name="rating5" id="rating5">\n' +
                                    '<input type="radio" name="rating5" id="rating5">\n'
                            ) +
                            '                                                </div>\n' +
                            '                                            </div>\n' +
                            '                                            <!-- end:account star rating -->\n' +
                            '\n' +
                            '                                            <div class="mt-2">\n' +
                            '                                                <a href="accounts/profile.html"\n' +
                            '                                                   class="btn btn-sm font-weight-bold py-2 px-3 px-xxl-5 my-1">Profile</a>\n' +
                            '                                                <a href="javascript:;"\n' +
                            '                                                   class="btn btn-sm font-weight-bold py-2 px-3 px-xxl-5 my-1">Chat</a>\n' +
                            '                                            </div>\n' +
                            '                                        </div>');
                        $(".spinner-border").css("display", "none");
                        feedsLength = response.data.feeds.length;
                        let appendData = '';
                        response.data.feeds.map(element => {
                            appendData = '<div class="mb-5">\n' +
                                '                                            <div class="d-flex align-items-center">\n' +
                                '                                                <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                '                                                        <span class="symbol-label">\n' +
                                '                                                            <img src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                '                                                                 class="h-75 align-self-end" alt=""/>\n' +
                                '                                                        </span>\n' +
                                '                                                </div>\n' +
                                '                                                <div class="d-flex flex-column flex-grow-1">\n' +
                                '                                                    <a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                                '                                                       class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv" target="_blank">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                '                                                    <span\n' +
                                '                                                        class="text-muted font-weight-bold">' + element.publishedDate + '</span>\n' +
                                '                                                </div>\n' +
                                '                                            </div>\n' +
                                '                                            <div class="pt-4">\n' +
                                '                                                <div class="embed-responsive embed-responsive-16by9">\n' +
                                '                                                    <iframe class="embed-responsive-item rounded"\n' +
                                '                                                            src="' + element.embed_url + '" allowfullscreen=""></iframe>\n' +
                                '                                                </div>\n' +
                                '                                                <p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description +
                                '                                                </p>\n' +
                                '                                                <div class="d-flex align-items-center">\n';
                            if (element.isLiked === false || element.isLiked === 'dislike') {
                                appendData += '   <a href="javascript:;"\n' +
                                    '                                                           class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-2 "\n' +
                                    '                                                           onclick="disLikeTweet(\'' + element.videoId + '\')">\n' +
                                    '                                                                <span\n' +
                                    '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-2">\n' +
                                    '                                                                        <i class="fas fa-heart"></i>\n' +
                                    '                                                                </span>\n' +
                                    '                                                        </a>';
                            } else {
                                appendData += '   <a href="javascript:;"\n' +
                                    '                                                           class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-2 "\n' +
                                    '                                                           onclick="likeTweet(\'' + element.videoId + '\')">\n' +
                                    '                                                                <span\n' +
                                    '                                                                    class="svg-icon svg-icon-md svg-icon-dark-25 pr-2">\n' +
                                    '                                                                        <i class="fas fa-heart"></i>\n' +
                                    '                                                                </span>0\n' +
                                    '                                                        </a>';
                            }
                            appendData += '                                                    <a href="javascript:;"\n' +
                                '                                                       class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                '                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                '                                                                    <i class="fas fa-retweet"></i>\n' +
                                '                                                            </span>Re-socio\n' +
                                '                                                    </a>\n' +
                                '                                                </div>\n' +
                                '                                            </div>\n' +
                                '                                            <div class="fb_cmt_div">\n' +
                                '                                                <div class="separator separator-solid mt-5 mb-4"></div>\n' +
                                '                                                <form class="position-relative">\n' +
                                '                                                    <textarea id="" class="form-control border-0 pr-10 resize-none sendCommentDiv"\n' +
                                '                                                              rows="1" placeholder="Reply..." name="' + element.videoId + '"></textarea>\n' +
                                '\n' +
                                '                                                    <div class="position-absolute top-0 right-0 mt-1 mr-n2" name ="' + element.videoId + '" id="commentButton">\n' +
                                '                                                                <span\n' +
                                '                                                                    class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                '                                                                        <i class="fas fa-paper-plane"></i>\n' +
                                '                                                                </span>\n' +
                                '                                                    </div>\n' +
                                '                                                </form>\n' +
                                '                                            </div>\n' +
                                '                                        </div>';
                            $('#youtubeFeeds').append(appendData);
                        });
                    }

                }
            });
        }

        /**
         * TODO we've to dislike the particular feed of youtube channel video.
         * This function is used for disliking  the particular feed of youtube channel.
         * @param {integer} videoId - video ID  of feed.
         * @param {integer} accounId - Account ID of feed.
         * ! Do not change this function without referring API format of disliking feed.
         */
        function disLikeTweet(videoId) {
            $.ajax({
                type: 'post',
                url: '/dislike-youtube-feed',
                data: {
                    videoId, accounId
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success('Successfully Disliked Feed');
                    } else if (response.code === 400) {
                        toastr.error(response.error);
                    } else {
                        toastr.error('can not dislike ,some error occured');
                    }
                }
            });
        }

        /**
         * TODO we've to get  comment on the particular facebook feed of Youtube channel account from sociobaord.
         * This function is used for commenting on particular Youtube channel feed of the Youtube channel account.
         * * @param {integer} videoID - video id of youtube channel feed.
         * !Do not change this function without referring API format of commenting on particular facebook feed of particular facebook account.
         */
        function commentOnFeed(videoId) {
            let comment = $("textarea[name='" + videoId + "']").val();
            if (comment === '') {
                toastr.error('Comment can not be empty', "");
            } else {
                $.ajax({
                    type: 'post',
                    url: '/comment-on-youtubeFeed',
                    data: {
                        videoId, accounId, comment
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    dataType: 'json',
                    beforeSend: function () {
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success('Successfully commented on feed');
                            $("textarea[name='" + videoId + "']").val("");
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                            $("textarea[name='" + videoId + "']").val("");
                        } else {
                            toastr.error('Can not comment,some error occured.');
                            $("textarea[name='" + videoId + "']").val("");
                        }
                    }
                });
            }

        }

        /**
         * TODO we've to like the particular feed of youtube post of youtube channel account.
         * This function is used for liking  the particular feed of youtube channel account from socioboard.
         * @param {integer} id - video id of feed.
         * ! Do not change this function without referring API format of liking feed.
         */

        function getSteps()
        {
            return StepsYoutube;
        }
        function likeTweet(videoId) {
            $.ajax({
                type: 'post',
                url: '/like-youtube-feed',
                data: {
                    videoId, accounId
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                },
                success: function (response) {
                    if (response.code === 200) {
                        toastr.success('Successfully Liked  Feed');
                    } else if (response.code === 400) {
                        toastr.error(response.error);
                    } else {
                        toastr.error('can not dislike ,some error occured');
                    }
                }
            });
        }
        $('.introjs-step-0').click(function () {
            introStart();
        });

        const introStart = () => {
            introJs().setOptions({
                skipLabel: 'Skip',
                doneLabel: 'Finish',
                steps: getSteps()
            }).start();
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
            publishOrFeeds=1;
            $('body').find('#resocioModal').remove();
            let action = '/discovery/content_studio/publish-content/feeds-modal';
            let isType = (type == null) ? 'no media' : type
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
                    btn.removeAttr('disabled');
                    btn.html("<i class='far fa-hand-point-up fa-fw'></i> 1 Click");
                    if (error.responseJSON.message) {
                        toastr.error(`${error.responseJSON.message}`);
                    }
                },
            });
        };
        $('#chatID').tootip();
    </script>

@endsection

