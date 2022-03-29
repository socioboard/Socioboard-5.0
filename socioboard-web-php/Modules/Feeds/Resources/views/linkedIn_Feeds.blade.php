@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | LinkedIn Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="/plugins/custom/emojionearea/css/emojionearea.min.css"/>
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
                <?php $regex = "#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#"; ?>
                <?php $imageCounts = 0; ?>
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
                                    @elseif($message=== 'No LinkedIn Pages account has been added yet!')
                                        <option selected value="failed">No
                                            LinkedIn Pages has been added yet for this team yet! or LinkedIn pages accounts has been locked
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
                                        <div class="ribbon-target bg-linkedin" style="top: -2px; right: 20px;">
                                            <i class="fab fa-linkedin"></i>
                                        </div>
                                        <!--begin::User-->
                                        <div class="d-flex align-items-center" id="linkedProfileDiv">
                                            <div
                                                    class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                <div class="symbol-label"
                                                     style="background-image:url('{{$feeds['data']->socialAccountDetails->profile_pic_url}}')"></div>
                                                <i class="symbol-badge bg-success"></i>
                                            </div>
                                            <div>
                                                <a href="{{$feeds['data']->socialAccountDetails->profile_url}}"
                                                   class="font-weight-bolder font-size-h5 text-hover-primary"
                                                   target="_blank">
                                                    {{$accounts[0]->first_name}} <i
                                                    ></i>
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
                                        @if($feeds['data']->SocialAccountStats !== null)
                                            <div class="py-9">
                                                <div class="d-flex align-items-center justify-content-between mb-2">
                                                    <span class="font-weight-bold mr-2">Followers :</span>
                                                    <a href="#"
                                                       class="text-hover-primary"
                                                       id="follower_count">{{$feeds['data']->SocialAccountStats->follower_count}}</a>
                                                </div>
                                            </div>
                                    @endif
                                    <!--end::Contact-->
                                    </div>
                                @else
                                    <div class="text-center noLinkedInDiv">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Currently no LinkedIn Pages has been added for this team yet! or Account has been locked.</h6>
                                    </div>
                                @endif
                            </div>
                            <!--end::Profile-->
                        </div>
                    </div>
                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card card-custom gutter-b" id="ss-feedsDiv">
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Feeds</h3>
                            </div>
                            <div class="card-body" id="linkedInFeeds">
                            @if(count($accounts)>0)
                                @if($feeds['code']=== 200)
                                    <!--begin::Video-->
                                        <script>
                                            var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                        </script>
                                        @if(sizeof($feeds['data']->feeds) !== 0 )
                                            @foreach($feeds['data']->feeds as $data)
                                                <?php $count = 0?>
                                                <?php $arrayImages = []?>
                                                <?php $string_desc = trim(preg_replace('/\r|\n/', ' ', $data->description));?>
                                                <?php  $string_desc = str_replace("'", '', $string_desc);
                                                preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $data->description, $urls);
                                                ?>
                                                <?php $date = new Datetime($data->publishedAt);
                                                $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                                ?>
                                                <div class="mb-5">
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
                                                            <a href="{{$feeds['data']->socialAccountDetails->profile_url}}"
                                                               target="_blank"
                                                               class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">{{$feeds['data']->socialAccountDetails->first_name}}</a>
                                                            <span
                                                                    class="text-muted font-weight-bold">{{$date->format('Y-m-d')}} {{$date->format('H:i:s')}}</span>
                                                        </div>
                                                        <!--end::Info-->
                                                    </div>
                                                    <!--end::Top-->
                                                    <div class="pt-4">
                                                        @if($data->shareMediaCategory === 'IMAGE')
                                                            @if(count($data->mediaUrl)>1)
                                                                <?php $imageCounts = count($data->mediaUrl)?>
                                                            @else
                                                                <?php $imageCounts = 0?>
                                                            @endif
                                                            @foreach($data->mediaUrl as $images)
                                                                <div class="">
                                                                    <img src="{{$images}}"
                                                                         class="img-fluid"/>
                                                                </div>
                                                            @endforeach
                                                        @elseif($data->shareMediaCategory === 'VIDEO')
                                                            @foreach($data->mediaUrl as $video)
                                                                <div
                                                                        class="embed-responsive embed-responsive-16by9">
                                                                    <iframe class="embed-responsive-item rounded"
                                                                            src="{{$video}}"
                                                                            allowfullscreen=""></iframe>
                                                                </div>
                                                            @endforeach
                                                        @elseif($data->shareMediaCategory === 'CAROUSEL_ALBUM')
                                                            <n class="pt-4">
                                                                <div id="image-gallery{{$count}}"></div>
                                                                @foreach($data->mediaUrl as $data2)
                                                                    <div class="">
                                                                        <img src="{{$data2}}"
                                                                             class="img-fluid"/>
                                                                    </div>
                                                                    <div
                                                                            class="embed-responsive embed-responsive-16by9">
                                                                        <iframe class="embed-responsive-item rounded"
                                                                                src="{{$data2}}"
                                                                                allowfullscreen=""></iframe>
                                                                    </div>
                                                                    <?php $count++;?>;
                                                                @endforeach
                                                                @elseif($data->shareMediaCategory === 'ARTICLE')
                                                                    <strong class="font-size-lg font-weight-normal pt-5 mb-2 ">
                                                                        {{$data->mediaTitle}}
                                                                    </strong>
                                                                    <br>
                                                                    <a href="{{$data->sharedUrl}}"
                                                                       class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                       target=_blank>
                                                                        {{$data->sharedUrl}}</a>
                                                            @endif
                                                            <!--begin::Text-->
                                                                <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                    <strong class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                        <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                    </strong>
                                                                    @if(count($urls[0])>0)
                                                                        <br>
                                                                        <a href="{{$urls[0][0]}}"
                                                                           class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                           target=_blank>
                                                                            {{$urls[0][0]}}</a>
                                                                    @endif
                                                                </p>
                                                                <!--end::Text-->

                                                                <!--begin::Action-->
                                                                <div class="d-flex align-items-center">
                                                                    @if($data->shareMediaCategory === 'IMAGE')
                                                                        @if(count($urls[0])>0)
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>','{{$data->mediaUrl[0]}}','image',null,'{{$urls[0][0]}}',{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @else
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>','{{$data->mediaUrl[0]}}','image',null,null,{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @endif
                                                                    @elseif($data->shareMediaCategory === 'VIDEO')
                                                                        @if(count($urls[0])>0)
                                                                            <a id="reSocioButton"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->mediaUrl[0]}}','video','{{$urls[0][0]}}',null)"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                            </a>
                                                                        @else
                                                                            <a id="reSocioButton"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->mediaUrl[0]}}','video',null,null)"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                            </a>
                                                                        @endif
                                                                    @elseif($data->shareMediaCategory === 'CAROUSEL_ALBUM')
                                                                        @if(count($urls[0])>0)
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>','{{$data->mediaUrl[0]}}','image',null,'{{$urls[0][0]}}',{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @else
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>','{{$data->mediaUrl[0]}}','image',null,null,{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @endif
                                                                    @elseif($data->shareMediaCategory === 'ARTICLE')
                                                                        <a id="reSocioButton"
                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', "$data->mediaTitle"); ?>',null,null,null,'{{$data->sharedUrl}}')"
                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                        </a>
                                                                    @else
                                                                        @if(count($urls[0])>0)
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>',null,null,null,'{{$urls[0][0]}}')">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @else
                                                                            <a id="reSocioButton" value="image"
                                                                               class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                               onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc) ?>',null,null,null,null)">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                            </a>
                                                                        @endif
                                                                    @endif
                                                                </div>
                                                                <!--end::Action-->
                                                    </div>
                                                    <!--end::Bottom-->
                                                </div>
                                                <!--end::Video-->
                                            @endforeach
                                        @else
                                            <div class="text-center noLinkedInDiv">
                                                <div class="symbol symbol-150">
                                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                </div>
                                                <h6>Currently no LinkedIn Pages feeds found for this account</h6>
                                            </div>
                                        @endif
                                    @elseif($feeds['code']=== 400)
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>{{$feeds['error']}}</h6>
                                        </div>
                                    @endif
                                @else
                                    <div class="text-center noLinkedInDiv">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Currently no LinkedIn Pages Accounts has been added for this team yet! or Account has been locked.</h6>
                                    </div>
                                @endif
                            </div>
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
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script src="{{asset('js/images-grid.js')}}"></script>
    <script src="{{asset('js/accounts.js')}}"></script>
    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
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


        let pageId = 2;
        $(window).scroll(function () {
            if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                if (feedsLength >= 12) {
                    getNextLinkedInFeeds(accounId, pageId);
                    pageId++;
                }
            }
        });

        /**
         * TODO we've to get  the twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
         * This function is used for getting twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
         * @param {this} data- account id of that particular twitter account.
         * ! Do not change this function without referring API format of getting the twitter feeds.
         */
        function call(data) {
            pageId = 2;
            accounId = data.value;//accountid of particular twitter account from dropdown
            getLinkedInFeeds(data.value, 1);
            $(function() {
                $('body').scrollTop(0);
            });
        }

        /**
         * TODO we've to get  the Instagram feeds and data of a particular Instagram account .
         * This function is used for getting Instagram feeds and data of a particular Instagram account by passing the the account id and page id.
         * @param {this} accid- account id of that particular Instagram account.
         * @param {this} pageid- page id of that particular Instagram account.
         * ! Do not change this function without referring API format of getting the Instagram feeds.
         */
        function getLinkedInFeeds(accid, pageid) {
            $.ajax({
                type: 'get',
                url: '/get-next-linkedIn-feeds',
                data: {
                    accid, pageid
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#linkedInFeeds').empty();
                    $('#linkedInFeeds').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" id="' + pageid + '"    style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div></div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#linkedProfileDiv,#follower_count').empty();
                        let append = '';
                        $('#follower_count').append(response?.data?.SocialAccountStats?.follower_count ?? 0);
                        append = '<div\n' +
                            'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                            '<div class="symbol-label"\n' +
                            'style="background-image:url(' + response.data.socialAccountDetails.profile_pic_url + ')"></div></div><div>\n' +
                            '<a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                            'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                            'target="_blank">\n' + response.data.socialAccountDetails.first_name +
                            '<i class="flaticon2-correct text-primary icon-md ml-2"></i></a>\n' +
                            '<div class="text-muted">\n' + response.data.socialAccountDetails.email + '</div>' +
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
                        append += '</div></div>\n' +
                            '</div>';
                        $('#linkedProfileDiv').append(append);
                        append += '<div class="mt-2">\n' +
                            '<a id="chatID" href="javascript:;" \n' +
                            'class="btn btn-sm font-weight-bold py-2 px-3 px-xxl-5 my-1" onclick="return false" title="Coming soon">Chat</a>\n' +
                            '</div></div>';
                        feedsLength = response.data.feeds.length;
                        let appendData = '';
                        let arrayImages = [];
                        let num = 0;
                        let publishedDate = 0;
                        let multiImageCount = 0;
                        let urlsFromDesc = '';
                        if (response.data.feeds.length > 0) {
                            response.data.feeds.map(element => {
                                let desc = element.description.replace(/(\r\n|\n|\r)/gm, "");
                                multiImageCount = 0;
                                arrayImages = [];
                                desc = desc.replace("'", '');
                                urlsFromDesc = '';
                                urlsFromDesc = getUrlsFromDesc(element.description);
                                publishedDate = String(new Date(element.publishedAt)).substring(0, 25);
                                appendData = '<div class="mb-5">\n' +
                                    '<div class="d-flex align-items-center">\n' +
                                    '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                    '<span class="symbol-label">\n' +
                                    '<img src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                    'class="h-75 align-self-end" alt=""/>\n' +
                                    '</span></div><div class="d-flex flex-column flex-grow-1">\n' +
                                    '<a href="' + response.data.socialAccountDetails.profile_url + '" target="_blank"\n' +
                                    'class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv" >' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                    '<span class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                    '</div></div>\n' +
                                    '<div class="pt-4">';
                                if (element.shareMediaCategory === 'IMAGE') {
                                    if (element.mediaUrl.length > 1) {
                                        multiImageCount = element.mediaUrl.length;
                                    } else {
                                        multiImageCount = 0;
                                    }
                                    element.mediaUrl.map(data => {
                                        appendData += '<div class="">\n' +
                                            '<img src="' + data + '"\n' +
                                            'class="img-fluid"/></div>\n';
                                    });
                                } else if (element.shareMediaCategory === 'VIDEO') {
                                    element.mediaUrl.map(data => {
                                        appendData += '<div\n' +
                                            'class="embed-responsive embed-responsive-16by9">\n' +
                                            '<iframe class="embed-responsive-item rounded"\n' +
                                            'src="' + data + '"\n' +
                                            'allowfullscreen=""></iframe></div>\n';
                                    });
                                } else if (element.shareMediaCategory === 'CAROUSEL_ALBUM') {
                                    appendData += '<div class="pt-4"><div id="image-gallery' + num + '"></div>';
                                    if (element.mediaUrl.length > 1) {
                                        multiImageCount = element.mediaUrl.length;
                                    } else {
                                        multiImageCount = 0;
                                    }
                                    element.mediaUrl.map(data => {
                                        if (data.shareMediaCategory === 'IMAGE') {
                                            arrayImages.push(data);
                                        } else if (data.shareMediaCategory === 'VIDEO') {
                                            appendData += ' <div\n' +
                                                'class="embed-responsive embed-responsive-16by9">\n' +
                                                '<iframe class="embed-responsive-item rounded"\n' +
                                                'src="' + data + '"\n' +
                                                'allowfullscreen=""></iframe></div>';
                                        }
                                    });
                                } else if (element.shareMediaCategory === 'ARTICLE') {
                                    appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                        element.mediaTitle +
                                        '</strong><br>\n' +
                                        '<a href="' + element.sharedUrl + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + element.sharedUrl +
                                        '</a>';
                                }
                                appendData += '</div>';
                                if (urlsFromDesc !== null) {
                                    appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                        + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                        '</strong><br>\n' +
                                        '<a href="' + urlsFromDesc + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc +
                                        '</a>';
                                } else {
                                    appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                        '</p>';
                                }
                                appendData += '<div class="d-flex align-items-center">\n';
                                if (element.shareMediaCategory === 'IMAGE' || element.shareMediaCategory === 'CAROUSEL_ALBUM') {
                                    if (element.mediaUrl.length > 1) {
                                        multiImageCount = element.mediaUrl.length;
                                    } else {
                                        multiImageCount = 0;
                                    }
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'image' + '\',null,\'' + urlsFromDesc[0]
                                            + '\',\'' + multiImageCount + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'image' + '\',null,null,\'' + multiImageCount + '\')"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }

                                } else if (element.shareMediaCategory === 'VIDEO') {
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'video' + '\',null,\'' + urlsFromDesc[0]
                                            + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'video' + '\',null,null)"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }
                                } else if (element.shareMediaCategory === 'ARTICLE') {
                                    appendData += '<a id="reSocioButton"\n' +
                                        'onclick="resocioButton(\'' + element.mediaTitle.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.sharedUrl + '\')"\n' +
                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                        '</span>Re-socio</a>\n';
                                } else {
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + urlsFromDesc[0]
                                            + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }

                                }
                                appendData += '</div></div></div>\n';
                                $('#linkedInFeeds').append(appendData);
                                $('div#image-gallery' + num).imagesGrid({
                                    images: arrayImages
                                });
                                num++;
                            });
                        } else {
                            $('#linkedInFeeds').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/></div>\n' +
                                '<h6>Currently no LinkedIn Pages  feeds found for this account</h6></div>');
                        }

                    }
                }
            });
        }

        /**
         * TODO we've to get  the Instagram feeds and data of a particular Instagram account on paginations .
         * This function is used for getting Instagram feeds and data of a particular Instagram account by passing the the account id and page id.
         * @param {this} accid- account id of that particular Instagram account.
         * @param {this} pageid- page id of that particular Instagram account.
         * ! Do not change this function without referring API format of getting the Instagram feeds.
         */
        function getNextLinkedInFeeds(accid, pageid) {
            $.ajax({
                type: 'get',
                url: '/get-next-linkedIn-feeds',
                data: {
                    accid, pageid
                },
                dataType: 'json',
                beforeSend: function () {
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        feedsLength = response.data.feeds.length;
                        let appendData = '';
                        let arrayImages = [];
                        let num = 0;
                        let publishedDate = 0;
                        let multiImageCount = 0;
                        if (response.data.feeds.length > 0) {
                            response.data.feeds.map(element => {
                                let urlsFromDesc = '';
                                arrayImages = [];
                                let desc = element.description.replace(/(\r\n|\n|\r)/gm, "");
                                desc = desc.replace("'", '');
                                urlsFromDesc = getUrlsFromDesc(element.description);
                                publishedDate = String(new Date(element.publishedAt)).substring(0, 25);
                                appendData = '<div class="mb-5">\n' +
                                    '<div class="d-flex align-items-center">\n' +
                                    '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                    '<span class="symbol-label">\n' +
                                    '<img src="' + response.data.socialAccountDetails.profile_pic_url + '"\n' +
                                    'class="h-75 align-self-end" alt=""/>\n' +
                                    '</span></div>\n' +
                                    '<div class="d-flex flex-column flex-grow-1">\n' +
                                    '<a href="' + response.data.socialAccountDetails.profile_url + '" target="_blank"\n' +
                                    'class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                    '<span class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                    '</div></div>\n' +
                                    '<div class="pt-4">';
                                if (element.shareMediaCategory === 'IMAGE') {
                                    if (element.mediaUrl.length > 1) {
                                        multiImageCount = element.mediaUrl.length;
                                    } else {
                                        multiImageCount = 0;
                                    }
                                    element.mediaUrl.map(data => {
                                        appendData += '<div class="">\n' +
                                            '<img src="' + data + '"\n' +
                                            'class="img-fluid"/>\n' +
                                            '</div>\n';
                                    });
                                } else if (element.shareMediaCategory === 'VIDEO') {
                                    element.mediaUrl.map(data => {
                                        appendData += '<div\n' +
                                            'class="embed-responsive embed-responsive-16by9">\n' +
                                            '<iframe class="embed-responsive-item rounded"\n' +
                                            'src="' + data + '"\n' +
                                            'allowfullscreen=""></iframe>\n' +
                                            '</div>\n';
                                    });
                                } else if (element.shareMediaCategory === 'CAROUSEL_ALBUM') {
                                    if (element.mediaUrl.length > 1) {
                                        multiImageCount = element.mediaUrl.length;
                                    } else {
                                        multiImageCount = 0;
                                    }
                                    appendData += '<div class="pt-4"><div id="image-gallery' + num + '"></div>';
                                    element.mediaUrl.map(data => {
                                        if (data.shareMediaCategory === 'IMAGE') {
                                            arrayImages.push(data);
                                        } else if (data.media_type === 'VIDEO') {
                                            appendData += ' <div\n' +
                                                'class="embed-responsive embed-responsive-16by9">\n' +
                                                '<iframe class="embed-responsive-item rounded"\n' +
                                                'src="' + data + '"\n' +
                                                'allowfullscreen=""></iframe>\n' +
                                                '</div>';
                                        }
                                    });
                                } else if (element.shareMediaCategory === 'ARTICLE') {
                                    appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                        element.mediaTitle +
                                        '</strong><br>\n' +
                                        '<a href="' + element.sharedUrl + '" class="font-size-lg font-weight-normal pt-5 mb-2" target = _blank>\n' + element.sharedUrl +
                                        '</a>';
                                }
                                appendData += '</div>';
                                appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                    '' + element.description + '\n' +
                                    '</p>\n' +
                                    '<div class="d-flex align-items-center">\n';
                                if (element.shareMediaCategory === 'IMAGE') {
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'image' + '\',null,\'' + urlsFromDesc[0]
                                            + '\',\'' + multiImageCount + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'image' + '\',null,null,\'' + multiImageCount + '\')"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }

                                } else if (element.shareMediaCategory === 'VIDEO') {
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'video' + '\',null,\'' + urlsFromDesc[0]
                                            + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrl[0] + '\',\'' + 'video' + '\',null,null)"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }
                                } else if (element.shareMediaCategory === 'ARTICLE') {
                                    appendData += '<a id="reSocioButton"\n' +
                                        'onclick="resocioButton(\'' + element.mediaTitle.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.sharedUrl + '\')"\n' +
                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                        '</span>Re-socio</a>\n';
                                } else {
                                    if (urlsFromDesc !== null) {
                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + urlsFromDesc[0]
                                            + '\')"\n' +
                                            '<span\n' +
                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    } else {
                                        appendData += '<a id="reSocioButton"\n' +
                                            'onclick="resocioButton(\'' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                            '</span>Re-socio</a>\n';
                                    }

                                }
                                appendData += '</div></div</div>\n';
                                $('#linkedInFeeds').append(appendData);
                                $('div#image-gallery' + num).imagesGrid({
                                    images: arrayImages
                                });
                                num++;
                            });
                        } else {
                            $('#linkedInFeeds').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/></div>\n' +
                                '<h6>Currently no LinkedIn Pages  feeds found for this account</h6></div>');
                        }
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
        function resocioButton(description, mediaUrl, type, title, sourceUrl, imagecount) {
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
                    if (imagecount === 0 || imagecount === '0') {
                        $('.thumb-count').empty();
                    } else {
                        $('.thumb-count').html('+' + (parseInt(imagecount) - 1).toString());

                    }
                    downloadMediaUrl();
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
    </script>

@endsection