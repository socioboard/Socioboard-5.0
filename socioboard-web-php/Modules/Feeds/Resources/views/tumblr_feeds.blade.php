@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Tumblr Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="/css/images-grid.css"/>
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
                <?php $regex = "@(https?://([-\w\.]+[-\w])+(:\d+)?(/([\w/_\.#-]*(\?\S+)?[^\.\s])?).*$)@"; ?>
                <?php $urls = []; ?>
                <?php $imageCounts = 0; ?>
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
                                    @elseif($message=== 'No Tumblr Account has been  added yet!')
                                        <option selected value="failed">No Tumblr account has been added yet! for this team or Account has been
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
                                                <div class="ribbon-target bg-tumblr" style="top: -2px; right: 20px;">
                                                    <i class="fab fa-tumblr"></i>
                                                </div>
                                                <!--begin::User-->
                                                <div class="d-flex align-items-center" id="twitterProfileDiv">
                                                    <div
                                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                        <div class="symbol-label"
                                                             style="background-image:url('{{$accounts[0]->profile_pic_url}}')"></div>
                                                    </div>
                                                    <div>
                                                        <a href="{{$feeds['data']->socialAccountDetails->profile_url}}"
                                                           class="font-weight-bolder font-size-h5 text-hover-primary"
                                                           target="_blank">
                                                            {{$accounts[0]->first_name}}
                                                        </a>
                                                        <div class="text-muted">
                                                            {{$accounts[0]->email}}
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
                                                {{--                                                @if($feeds['data']->SocialAccountStats !== null)--}}
                                                {{--                                                    <div class="py-9">--}}
                                                {{--                                                        <div class="d-flex align-items-center justify-content-between mb-2">--}}
                                                {{--                                                            <span class="font-weight-bold mr-2">Followers:</span>--}}
                                                {{--                                                            <a href="#"--}}
                                                {{--                                                               class="text-hover-primary"--}}
                                                {{--                                                               id="follower_count">{{$feeds['data']->SocialAccountStats->follower_count}}</a>--}}
                                                {{--                                                        </div>--}}
                                                {{--                                                        <div class="d-flex align-items-center justify-content-between mb-2">--}}
                                                {{--                                                            <span class="font-weight-bold mr-2">Feeds:</span>--}}
                                                {{--                                                            <a href="#"--}}
                                                {{--                                                               class="text-hover-primary"--}}
                                                {{--                                                               id="feeds_count">{{$feeds['data']->SocialAccountStats->total_post_count}}</a>--}}
                                                {{--                                                        </div>--}}
                                                {{--                                                    </div>--}}
                                                {{--                                                @endif--}}
                                            </div>
                                        @else
                                            <div style="color: Red;text-align:center;">
                                                {{$feeds['message']}}
                                            </div>
                                        @endif
                                    @else
                                        <div style="color: Green;text-align:center;">
                                            Currently no Tumblr Account has been added yet! for this team or Account has been
                                            locked
                                        </div>
                                    @endif
                                @elseif($message=== 'No Tumblr account added yet! or Account has locked')
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Currently no Tumblr Account has been added yet! for this team or Account has been
                                            locked</h6>
                                    </div>
                                @elseif($message === 'failed')
                                    <div style="color: Red;text-align:center;">
                                        Sorry some error ,occurred please reload page
                                    </div>
                                @else
                                    <div class="symbol symbol-150">
                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                    </div>
                                    <div>
                                        Currently no Tumblr Account has been added yet! for this team or Account has been
                                        locked
                                    </div>
                                @endif
                            </div>
                            <!--end::Profile-->
                        </div>
                    </div>


                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card card-custom gutter-b card-stretch" id="ss-feedsDiv">
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Feeds</h3>
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports">+
                                    <span node-id="ss-feedsDiv_md8" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-feedsDiv_md8" style="
    display: none;"></span>
                            </div>
                            <div class="card-body" id="tumblrFeeds">
                            <?php $date = 0; ?>
                            @if($message=== 'success')
                                @if(count($accounts)>0)
                                    @if($feeds['code']=== 200)
                                        <!--begin::Text-->
                                            <script>
                                                var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                            </script>
                                            @if(count($feeds['data']->feeds)>0)
                                                @foreach($feeds['data']->feeds as $data)
                                                    <?php $date = new Datetime($data->publishedDate);
                                                    $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                                    ?>
                                                    <?php $string_desc = trim(preg_replace('/\r|\n/', ' ', $data->captionText));
                                                    preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $data->captionText, $urls);
                                                    ?>
                                                    <?php  $string_desc = str_replace("'", '', $string_desc);;?>
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
                                                                    <a href="{{$data->mediaUrl}}"
                                                                       target="_blank"
                                                                       class="text-hover-primary mb-1 font-size-lg font-weight-bolder">{{$feeds['data']->socialAccountDetails->first_name}}</a>
                                                                    <span
                                                                            class="font-weight-bold">{{$date->format('Y-m-d')}} {{$date->format('H:i:s')}}</span>
                                                                </div>
                                                                <!--end::Info-->
                                                            </div>
                                                            <!--end::Header-->

                                                            <!--begin::Body-->
                                                            @if($data->permalink !== '')
                                                                <div class="pt-4">
                                                                    @if($data->type === 'video')
                                                                        <div
                                                                                class="embed-responsive embed-responsive-16by9">
                                                                            <iframe class="embed-responsive-item rounded"
                                                                                    src="{{$data->permalink}}"
                                                                                    allowfullscreen=""></iframe>
                                                                        </div>
                                                                    @elseif($data->type === 'photo')
                                                                        <div class="">
                                                                            <img src="{{$data->permalink}}"
                                                                                 class="img-fluid"/>
                                                                        </div>
                                                                    @endif

                                                                <!--begin::Text-->
                                                                    @if(($data->type==='link'))
                                                                        <strong class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                            <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                        </strong>
                                                                        <br>
                                                                        <a href="{{$data->permalink}}"
                                                                           class="font-size-lg font-weight-normal pt-5 mb-2"
                                                                           target=_blank>
                                                                            {{$data->permalink}}</a>
                                                                        <br>
                                                                    @else
                                                                        <p class="font-size-lg font-weight-normal">
                                                                            <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                        </p>
                                                                            @if(count($urls[0])>0)
                                                                                @foreach($urls[0] as $data2)
                                                                                    <a href="{{$data2}}"
                                                                                       class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                                       target=_blank>
                                                                                        {{$data2}}</a>
                                                                                @endforeach
                                                                            @endif
                                                                    @endif
                                                                    @else
                                                                        <div>
                                                                            @if(($data->type==='link'))
                                                                                <strong class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                                    <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                                </strong>
                                                                                @if(count($urls[0])>0)
                                                                                    <a href="{{$urls[0][0]}}"
                                                                                       class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                                       target=_blank>
                                                                                        {{$urls[0][0]}}</a>
                                                                                @endif
                                                                                <br>
                                                                                <a href="{{$data->permalink}}"
                                                                                   class="font-size-lg font-weight-normal pt-5 mb-2"
                                                                                   target=_blank>
                                                                                    {{$data->permalink}}</a>
                                                                                <br>
                                                                            @else
                                                                                <p class="font-size-lg font-weight-normal">
                                                                                    <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                                </p>
                                                                                @if(count($urls[0])>0)
                                                                                    <a href="{{$urls[0][0]}}"
                                                                                       class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                                       target=_blank>
                                                                                        {{$urls[0][0]}}</a>
                                                                                @endif
                                                                            @endif
                                                                            @endif
                                                                        <!--end::Text-->
                                                                            @if($data->type === 'link')
                                                                                <br>
                                                                            @endif
                                                                            <div class="d-flex align-items-center">
                                                                                @if($data->permalink !== '')
                                                                                    @if($data->type === 'video')
                                                                                        @if(count($urls[0])>0)
                                                                                            <a id="reSocioButton"
                                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->permalink}}','video',null,'{{$urls[0][0]}}')"
                                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                            </a>
                                                                                        @else
                                                                                            <a id="reSocioButton"
                                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->permalink}}','video',null,null)"
                                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                            </a>
                                                                                        @endif
                                                                                    @elseif($data->type === 'photo')
                                                                                        @if(count($urls[0])>0)
                                                                                            <a id="reSocioButton"
                                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->permalink}}','image',null,'{{$urls[0][0]}}')"
                                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                            </a>
                                                                                            @else
                                                                                            <a id="reSocioButton"
                                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->permalink}}','image',null,null)"
                                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                            </a>
                                                                                            @endif
                                                                                    @elseif($data->type === 'link')
                                                                                        <a id="reSocioButton"
                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,'{{$data->permalink}}')"
                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                        </a>
                                                                                    @endif
                                                                                @else
                                                                                    @if((count($urls[0])>0))
                                                                                        <a id="reSocioButton"
                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,'{{$urls[0][0]}}')"
                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                        </a>
                                                                                        @else
                                                                                        <a id="reSocioButton"
                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,null)"
                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                                        </a>
                                                                                        @endif

                                                                                @endif
                                                                            </div>
                                                                        </div>
                                                                        <!--end::Body-->
                                                                </div>
                                                        </div>
                                                        <!--end::Text-->
                                                        <hr>
                                                        @endforeach
                                                        @else
                                                            <div class="text-center">
                                                                <div class="symbol symbol-150">
                                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                </div>
                                                                <h6>Currently no feeds found for this account</h6>
                                                            </div>
                                                        @endif
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
                                                        @elseif($message=== 'No Tumblr account added yet! or Account has locked')
                                                            <div class="text-center">
                                                                <div class="symbol symbol-150">
                                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                </div>
                                                                <h6>Currently no Tumblr Account has been added yet! for this team or Account has been
                                                                    locked</h6>
                                                            </div>
                                                        @elseif($message=== 'failed')
                                                            <div class="text-center"
                                                                 style=text-align:center;">
                                                                <div class="symbol symbol-150">
                                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                </div>
                                                                <h6>Sorry some error ,occurred please reload page</h6>
                                                            </div>
                                                        @else
                                                            <div class="text-center"
                                                                 style=text-align:center;">
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
            <script src="{{asset('js/accounts.js')}}"></script>
            <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
            <script src="{{asset('js/images-grid.js')}}"></script>
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
                });


                let pageId = 2;
                $(window).scroll(function () {
                    if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                        if (feedsLength >= 12) {
                            getNextTumblrFeeds(accounId, pageId);
                            pageId++;
                        }
                    }
                });


                function getNextTumblrFeeds(accid, pageId) {
                    $.ajax({
                        type: 'get',
                        url: '/get-next-tumbler-feeds',
                        data: {
                            accid, pageId
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#tumblrFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div></div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            $(".spinner-border").css("display", "none");
                            let arrayImages = [];
                            let num = 0;
                            let append = '';
                            if (response.code === 200) {
                                let appendData = '';
                                $(".spinner-border").css("display", "none");
                                feedsLength = response.data.feeds.length;
                                if (feedsLength !== 0) {
                                    response.data.feeds.map(element => {
                                        let createdDate = new Date(element.publishedDate),
                                            published = String(createdDate).substring(0, 25);
                                        appendData = '<div class="mb-5"><div>\n' +
                                            '<div class="d-flex align-items-center pb-4">\n' +
                                            '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                            '<span class="symbol-label"><img\n' +
                                            'src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                            'class="h-75 align-self-end" alt=""/>\n' +
                                            '</span></div>\n' +
                                            '<div class="d-flex flex-column flex-grow-1">\n' +
                                            '<a href="' + element.mediaUrl + '"\n' +
                                            'class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                            '<span class="font-weight-bold">' + published + '</span></div></div>\n';
                                        if (element.permalink !== '') {
                                            appendData += '<div class="pt-4">';
                                            if (element.type === 'video') {
                                                appendData += '<div\n' +
                                                    'class="embed-responsive embed-responsive-16by9">\n' +
                                                    '<iframe class="embed-responsive-item rounded"\n' +
                                                    'src="' + element.permalink + '"\n' +
                                                    'allowfullscreen=""></iframe>\n' +
                                                    '</div>';
                                            } else if (element.type === 'photo') {
                                                appendData += '<div class="">\n' +
                                                    '<img src="' + element.permalink + '" class="img-fluid"/>\n' +
                                                    '</div>';
                                            } else if (element.type === 'link') {
                                                appendData += '<a href="' + element.permalink + '" class="font-size-lg font-weight-normal pt-5 mb-2" target = _blank>\n' + element.permalink +
                                                    '</a><br>\n';
                                            }
                                            appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.captionText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '</p>'
                                        } else {
                                            appendData += '<div><p class="font-size-lg font-weight-normal">\n' + element.captionText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '</p>\n';
                                        }
                                        appendData += '<div class="d-flex align-items-center">\n';
                                        if (element.permalink !== '') {
                                            if (element.type === 'video') {
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.captionText + '\',\'' + element.permalink + '\',\'' + 'video' + '\',null,null)"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            } else if (element.type === 'link') {
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.captionText + '\',null,null,null,\'' + element.permalink + '\')"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            } else if (element.type === 'photo') {
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.captionText + '\',\'' + element.permalink + '\',\'' + 'image' + '\',null,null)"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            }
                                        } else {
                                            appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + element.captionText + '\',null,null,null,null)"\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio</a>\n';
                                        }
                                        appendData += '<hr>';
                                        $('#tumblrFeeds').append(appendData);
                                        num++;
                                    });

                                }
                            } else if (response.code === 400) {
                                $('#tumblrFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.error + '</div>');
                                $('#tumblrFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>' + response.error + '</div>');

                            } else {
                                $('#twitterProfileDiv').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#tumblrFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>' + "Some error occured,can not get feeds" + '</div>');
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
                function getTumblerFeeds(accid, pageId) {
                    $.ajax({
                        type: 'get',
                        url: '/get-next-tumbler-feeds',
                        data: {
                            accid, pageId
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#tumblrFeeds,#twitterProfileDiv').empty();
                            $('#tumblrFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div></div>');
                            $('#twitterProfileDiv').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div></div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            $(".spinner-border").css("display", "none");
                            let arrayImages = [];
                            let num = 0;
                            let append = '';
                            if (response.code === 200) {
                                $('#feeds_count,#follower_count').empty();
                                append = '<div\n' +
                                    'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                    '<div class="symbol-label"\n' +
                                    'style="background-image:url(' + response.data.socialAccountDetails.profile_pic_url + ')"></div>\n' +
                                    '</div><div>\n' +
                                    '<a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                                    'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                    'target="_blank">\n' + response.data.socialAccountDetails.first_name +
                                    '</a>\n' +
                                    '<div class="rating-css">\n' +
                                    '<div class="star-icon">\n';
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
                                $('#twitterProfileDiv').append(append);
                                $('#follower_count').html(response.data.SocialAccountStats.follower_count);
                                $('#feeds_count').html(response.data.SocialAccountStats.total_post_count);
                                let appendData = '';
                                let urlsFromDesc2 = '';
                                $(".spinner-border").css("display", "none");
                                feedsLength = response.data.feeds.length;
                                if (feedsLength !== 0) {
                                    response.data.feeds.map(element => {
                                        urlsFromDesc2 = '';
                                        urlsFromDesc2 = getUrlsFromDesc(element.captionText);
                                        let desc = element.captionText.replace(/(\r\n|\n|\r)/gm, "");
                                        desc = desc.replace("'", '');
                                        let createdDate = new Date(element.publishedDate),
                                            published = String(createdDate).substring(0, 25);
                                        appendData = '<div class="mb-5"><div>\n' +
                                            '<div class="d-flex align-items-center pb-4">\n' +
                                            '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                            '<span class="symbol-label"><img\n' +
                                            'src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                            'class="h-75 align-self-end" alt=""/>\n' +
                                            '</span></div>\n' +
                                            '<div class="d-flex flex-column flex-grow-1">\n' +
                                            '<a href="' + element.mediaUrl + '"\n' +
                                            'class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                            '<span class="font-weight-bold">' + published + '</span></div></div>\n';
                                        if (element.permalink !== '') {
                                            appendData += '<div class="pt-4">';
                                            if (element.type === 'video') {
                                                appendData += '<div\n' +
                                                    'class="embed-responsive embed-responsive-16by9">\n' +
                                                    '<iframe class="embed-responsive-item rounded"\n' +
                                                    'src="' + element.permalink + '"\n' +
                                                    'allowfullscreen=""></iframe>\n' +
                                                    '</div>';
                                            } else if (element.type === 'photo') {
                                                appendData += '<div class="">\n' +
                                                    '<img src="' + element.permalink + '" class="img-fluid"/>\n' +
                                                    '</div>';
                                            } else if (element.type === 'link') {
                                                appendData += '<a href="' + element.permalink + '" class="font-size-lg font-weight-normal pt-5 mb-2" target = _blank>\n' + element.permalink +
                                                    '</a><br>\n';
                                            }
                                            if (urlsFromDesc2 !== null) {
                                                appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                    + element.captionText.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                    '</strong><br>\n' +
                                                    '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                    '</a>';
                                            } else {
                                                appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.captionText.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                    '</p>';
                                            }
                                        } else {
                                            if (urlsFromDesc2 !== null) {
                                                appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                    + element.captionText.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                    '</strong><br>\n' +
                                                    '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                    '</a>';
                                            } else {
                                                appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.captionText.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                    '</p>';
                                            }                                        }
                                        appendData += '<div class="d-flex align-items-center">\n';
                                        if (element.permalink !== '') {
                                            if (element.type === 'video') {
                                                if (urlsFromDesc2 !== null) {
                                                    appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.permalink + '\',\'' + 'video' + '\',null,\'' + urlsFromDesc2[0]
                                                        + '\')"\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio</a>\n';
                                                }
                                                else{
                                                    appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.permalink + '\',\'' + 'video' + '\',null,null)"\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio</a>\n';
                                                }

                                            } else if (element.type === 'photo') {
                                                if (urlsFromDesc2 !== null) {
                                                    appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.permalink + '\',\'' + 'image' + '\',null,\'' + urlsFromDesc2[0]
                                                        + '\')"\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio</a>\n';
                                                }else{
                                                    appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.permalink + '\',\'' + 'image' + '\',null,null)"\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio</a>\n';
                                                }

                                            } else if (element.type === 'link') {
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.permalink + '\')"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            }
                                        } else {
                                            if (urlsFromDesc2 !== null) {
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + urlsFromDesc2[0]
                                                    + '\')"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            }
                                            else{
                                                appendData += '<a id="reSocioButton" value="' + element.captionText + '" href="javascript:;"\n' +
                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                                    '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                    '</span>Re-socio</a>\n';
                                            }

                                        }
                                        appendData += '<hr>';
                                        $('#tumblrFeeds').append(appendData);
                                        num++;
                                    });

                                } else {
                                    $('#tumblrFeeds').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>' + "No feeds found for this account" + '</div>');
                                }
                            } else if (response.code === 400) {
                                $('#tumblrFeeds,#twitterProfileDiv').empty();
                                $('#tumblrFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.error + '</div>');
                                $('#tumblrFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>' + response.error + '</div>');

                            } else {
                                $('#tumblrFeeds,#twitterProfileDiv').empty();
                                $('#twitterProfileDiv').append('<div style="color: Red;text-align:center;">\n' +
                                    response.message + '</div>');
                                $('#tumblrFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>' + "Some error occured,can not get feeds" + '</div>');
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
                    let twitterID = $(this).attr('name'), comment = $("textarea[name='" + twitterID + "']").val(),
                        userName = $(this).attr('value');
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
                    $(function() {
                        $('body').scrollTop(0);
                    });
                    pageId = 2;
                    accounId = data.value;//accountid of particular twitter account from dropdown
                    getTumblerFeeds(data.value, 1);
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
                    publishOrFeeds = 1;
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
                            setTimeout(function () {
                                downloadMediaUrl();
                            }, 500);
                        },
                        error: function (error) {
                            if (error.responseJSON.message) {
                                toastr.error(`${error.responseJSON.message}`);
                            }
                        },
                    });
                };

                function getUrlsFromDesc(text) {
                    let replyText = text;
                    let urls = replyText.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
                    );
                    return urls;
                }
                $('#chatID').tootip();
            </script>
@endsection
