@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Instagram Feeds</title>
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
                                    @elseif($message=== 'No Instagram account has been added yet!')
                                        <option selected value="failed">
                                            No Instagram Account to show.
                                        </option>
                                    @endif
                                </select>
                            </div>
                            <!-- end:Accounts list -->
                            <!--begin::Profile-->
                            <div class="card card-custom gutter-b ">
                                @if($message=== 'success')
                                    @if(count($accounts)>0)
                                        <div
                                                class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                            <div class="ribbon-target bg-instagram" style="top: -2px; right: 20px;">
                                                <i class="fab fa-instagram"></i>
                                            </div>
                                            <!--begin::User-->
                                            <div class="d-flex align-items-center" id="instaProfileDiv">
                                                <div
                                                        class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                    <div class="symbol-label"
                                                         style="background-image:url('https://i.imgur.com/TMVAonx.png')"></div>
                                                    <i class="symbol-badge bg-success"></i>
                                                </div>
                                                <div>
                                                    <a href="{{$accounts[0]->profile_url}}"
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
                                            <div class="py-9">
                                            </div>
                                            <!--end::Contact-->
                                        </div>
                                    @else
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently no Instagram Account has been added for this team or Account has been locked</h6>
                                        </div>
                                    @endif
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
                            <div class="card-body" id="instagramFeeds">
                            @if(count($accounts)>0)
                                @if($feeds['code']=== 200)
                                    <!--begin::Video-->
                                        <script>
                                            var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                        </script>
                                        @if(sizeof($feeds['data']->feeds) !== 0 )
                                            @foreach($feeds['data']->feeds as $data)
                                                <?php $count = 0;?>
                                                <?php $date =  new Datetime($data->publishedDate);
                                                $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                                ?>
                                                <?php $arrayImages = [];?>
                                                <div class="mb-5">
                                                    <!--begin::Top-->
                                                    <div class="d-flex align-items-center">
                                                        <!--begin::Symbol-->
                                                        <div class="symbol symbol-40 symbol-light-success mr-5">
                                                        <span class="symbol-label">
                                                            <img
                                                                    src="https://i.imgur.com/TMVAonx.png"
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
                                                    <div class="pt-4">
                                                        @if($data->type === 'IMAGE')
                                                            @foreach($data->mediaUrl as $images)
                                                                <div class="">
                                                                    <img src="{{$images->media_url}}"
                                                                         class="img-fluid"/>
                                                                </div>
                                                            @endforeach
                                                        @elseif($data->type === 'VIDEO')
                                                            @foreach($data->mediaUrl as $video)
                                                                <div
                                                                        class="embed-responsive embed-responsive-16by9">
                                                                    <iframe class="embed-responsive-item rounded"
                                                                            src="{{$video->media_url}}"
                                                                            allowfullscreen=""></iframe>
                                                                </div>
                                                            @endforeach
                                                        @elseif($data->type === 'CAROUSEL_ALBUM')
                                                            <div class="pt-4">
                                                                <div id="image-gallery{{$count}}"></div>
                                                                @foreach($data->mediaUrl as $data2)
                                                                    @if($data2->media_type === 'IMAGE')
                                                                        <div class="">
                                                                            <img src="{{$data2->media_url}}"
                                                                                 class="img-fluid"/>
                                                                        </div>
                                                                    @elseif($data2->media_type === 'VIDEO')
                                                                        <div
                                                                                class="embed-responsive embed-responsive-16by9">
                                                                            <iframe class="embed-responsive-item rounded"
                                                                                    src="{{$data2->media_url}}"
                                                                                    allowfullscreen=""></iframe>
                                                                        </div>
                                                                    @endif
                                                                    <?php $count++;?>;
                                                            @endforeach
                                                            @endif
                                                            <!--begin::Text-->
                                                                <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                    {{$data->captionText}}
                                                                </p>
                                                                <!--end::Text-->

                                                                <!--begin::Action-->
                                                                <div class="d-flex align-items-center">
                                                                    @if($data->type === 'IMAGE')
                                                                        <a id="reSocioButton"
                                                                           onclick="resocioButton('{{$data->captionText}}','{{$data->mediaUrl[0]->media_url}}','image',null,null)"
                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                        </a>
                                                                    @elseif($data->type === 'VIDEO')
                                                                        <a id="reSocioButton"
                                                                           onclick="resocioButton('{{$data->captionText}}','{{$data->mediaUrl[0]->media_url}}','video',null,null)"
                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                        </a>
                                                                    @elseif($data->type === 'CAROUSEL_ALBUM')
                                                                        <a id="reSocioButton"
                                                                           onclick="resocioButton('{{$data->captionText}}','{{$data->mediaUrl[0]->media_url}}','{{strtolower($data->mediaUrl[0]->media_type)}}',null,null)"
                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                        </a>
                                                                    @else
                                                                        <a id="reSocioButton"
                                                                           onclick="resocioButton('{{$data->captionText}}',null,null,null,null)"
                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">
                                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                    <i class="fas fa-pencil-alt"></i>
                                                            </span>Re-socio
                                                                        </a>
                                                                    @endif
                                                                </div>
                                                                <!--end::Action-->
                                                            </div>
                                                            <!--end::Bottom-->
                                                    </div>
                                                    <!--end::Video-->
                                                    @endforeach
                                                    @else
                                                        <div class="text-center">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>Currently no Instagram feeds has been found for this account</h6>
                                                        </div>
                                                    @endif


                                                    @elseif($feeds['code']=== 400)
                                                        <div class="text-center">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>Can not get feeds as : {{$feeds['message']}}</h6>
                                                        </div>
                                                    @endif
                                                    @else
                                                        <div class="text-center noInstagramDiv">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6> Can not get feeds as : Currently no Instagram Account has been added for this
                                                                team or Account has been locked</h6>
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
            <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
            <script src="{{asset('js/images-grid.js')}}"></script>
            <script src="{{asset('js/accounts.js')}}"></script>
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


                let pageId = 2;
                $(window).scroll(function () {
                    if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                        if (feedsLength >= 12) {
                            getNextInstagramFeeds(accounId, pageId);
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
                    $(function() {
                        $('body').scrollTop(0);
                    });
                    pageId = 2;
                    accounId = data.value;//accountid of particular twitter account from dropdown
                    getInstagramFeeds(data.value, 1);
                }

                /**
                 * TODO we've to get  the Instagram feeds and data of a particular Instagram account .
                 * This function is used for getting Instagram feeds and data of a particular Instagram account by passing the the account id and page id.
                 * @param {this} accid- account id of that particular Instagram account.
                 * @param {this} pageid- page id of that particular Instagram account.
                 * ! Do not change this function without referring API format of getting the Instagram feeds.
                 */
                function getInstagramFeeds(accid, pageid) {
                    let accounType = 5;
                    let publishedDate = 0;
                    $.ajax({
                        type: 'get',
                        url: '/get-next-instgram-feeds',
                        data: {
                            accid, pageid, accounType
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#instagramFeeds').empty();
                            $('#instagramFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  id="' + pageid + '" style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div>\n' +
                                '\n' +
                                '</div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            $(".spinner-border").css("display", "none");
                            let append= '';
                            if (response.code === 200) {
                                $('#instaProfileDiv').empty();
                                append='<div\n' +
                                    'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                    '<div class="symbol-label"\n' +
                                    'style="background-image:url(' + "'https://i.imgur.com/TMVAonx.png'" + ')"></div>\n' +
                                    '<i class="symbol-badge bg-success"></i>\n' +
                                    '</div>\n' +
                                    '<div>\n' +
                                    '<a href="' + response.data.socialAccountDetails.profile_url + '"\n' +
                                    'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                    'target="_blank">\n' + response.data.socialAccountDetails.first_name +
                                    '<i\n' +
                                    'class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                                    '</a>\n' +
                                    '<div class="text-muted">\n' + response.data.socialAccountDetails.email +
                                    '</div>' +
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
                                append +='</div>\n' +
                                    '</div>\n' +
                                    '</div>';
                                $('#instaProfileDiv').append(append);
                                $(".spinner-border").css("display", "none");
                                feedsLength = response.data.feeds.length;
                                $('#instagramFeeds').empty();
                                let appendData = '';
                                let arrayImages = [];
                                let num = 0;
                                if (response.data.feeds.length > 0) {
                                    response.data.feeds.map(element => {
                                        publishedDate = String(new Date(element.publishedDate)).substring(0, 25);
                                        appendData = '<div class="mb-5">\n' +
                                            '<div class="d-flex align-items-center">\n' +
                                            '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                            '<span class="symbol-label">\n' +
                                            '<img\n' +
                                            'src="https://i.imgur.com/TMVAonx.png"\n' +
                                            'class="h-75 align-self-end" alt=""/>\n' +
                                            '</span>\n' +
                                            '</div>\n' +
                                            '<div class="d-flex flex-column flex-grow-1" >\n' +
                                            '<a href="' + response.data.socialAccountDetails.profile_url + '" target="_blank"\n' +
                                            'class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                            '<span\n' +
                                            'class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '<div class="pt-4">';
                                        if (element.type === 'IMAGE') {
                                            element.mediaUrl.map(data => {
                                                appendData += '<div class="">\n' +
                                                    '<img src="' + data.media_url + '"\n' +
                                                    'class="img-fluid"/>\n' +
                                                    '</div>\n';
                                            });
                                        } else if (element.type === 'VIDEO') {
                                            element.mediaUrl.map(data => {
                                                appendData += '<div\n' +
                                                    'class="embed-responsive embed-responsive-16by9">\n' +
                                                    '<iframe class="embed-responsive-item rounded"\n' +
                                                    'src="' + data.media_url + '"\n' +
                                                    'allowfullscreen=""></iframe>\n' +
                                                    '</div>\n';
                                            });
                                        } else if (element.type === 'CAROUSEL_ALBUM') {
                                            appendData += '<div class="pt-4"><div id="image-gallery' + num + '"></div>';
                                            element.mediaUrl.map(data => {
                                                if (data.media_type === 'IMAGE') {
                                                    arrayImages.push(data.media_url);
                                                } else if (data.media_type === 'VIDEO') {
                                                    appendData += ' <div\n' +
                                                        'class="embed-responsive embed-responsive-16by9">\n' +
                                                        '<iframe class="embed-responsive-item rounded"\n' +
                                                        'src="' + data.media_url + '"\n' +
                                                        'allowfullscreen=""></iframe>\n' +
                                                        '</div>';
                                                }
                                            });
                                        }
                                        appendData += '</div>';
                                        appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                            '' + element.captionText + '\n' +
                                            '</p>\n' +
                                            '<div class="d-flex align-items-center">\n';
                                        if (element.type === 'IMAGE') {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + 'image' + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';
                                        } else if (element.type === 'VIDEO') {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + 'video' + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';
                                        } else {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + element.mediaUrl[0].media_type.toLowerCase() + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';

                                        }
                                        appendData += '</div>\n' +
                                            '</div>\n' +
                                            '</div>\n';
                                        $('#instagramFeeds').append(appendData);
                                        $('div#image-gallery' + num).imagesGrid({
                                            images: arrayImages
                                        });
                                        num++;
                                    });
                                } else {
                                    $('#instagramFeeds').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>\n' +
                                        '<h6>Currently no Instagram  feeds has been found for this account</h6>\n' +
                                        '</div>');
                                }

                            }
                            else if (response.code === 400) {
                                $('#instagramFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>\n' +
                                    '<h6>\n' + "Can not get feeds, as : " + response.message +
                                    '</h6></div>');
                            } else {
                                $('#instagramFeeds').append(' <div style="color: red;text-align:center;">\n' +
                                    "Some error occured can get feeds" +
                                    '</div>');
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
                function getNextInstagramFeeds(accid, pageId) {
                    let accounType = 5;
                    $.ajax({
                        type: 'get',
                        url: '/get-next-instgram-feeds',
                        data: {
                            accid, pageId, accounType
                        },
                        dataType: 'json',
                        beforeSend: function () {
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                $(".spinner-border").css("display", "block");
                                feedsLength = response.data.feeds.length;
                                let appendData = '';
                                let publishedDate = 0;
                                if (response.data.feeds.length > 0) {
                                    response.data.feeds.map(element => {
                                        publishedDate = String(new Date(element.publishedDate)).substring(0, 25);
                                        appendData = '    <div class="mb-5">\n' +
                                            ' <div class="d-flex align-items-center">\n' +
                                            ' <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                            ' <span class="symbol-label">\n' +
                                            '<img\n' +
                                            'src="https://i.imgur.com/TMVAonx.png"\n' +
                                            'class="h-75 align-self-end" alt=""/>\n' +
                                            '</span>\n' +
                                            '</div>\n' +
                                            '<div class="d-flex flex-column flex-grow-1" >\n' +
                                            '<a href="' + response.data.socialAccountDetails.profile_url + '" target="_blank"\n' +
                                            'class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">' + response.data.socialAccountDetails.first_name + '</a>\n' +
                                            '<span\n' +
                                            'class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '<div class="pt-4">\n';
                                        if (element.type === 'IMAGE') {
                                            element.mediaUrl.map(image => {
                                                appendData += '<div class="">\n' +
                                                    '<img src="' + image.media_url + '"\n' +
                                                    'class="img-fluid"/>\n' +
                                                    '</div>\n';
                                            });
                                        } else if (element.type === 'VIDEO') {
                                            element.mediaUrl.map(video => {
                                                appendData += '<div\n' +
                                                    'class="embed-responsive embed-responsive-16by9">\n' +
                                                    '<iframe class="embed-responsive-item rounded"\n' +
                                                    'src="' + video.media_url + '"\n' +
                                                    'allowfullscreen=""></iframe>\n' +
                                                    '</div>\n';
                                            });
                                        } else if (element.type === 'CAROUSEL_ALBUM') {
                                            element.mediaUrl.map(data => {
                                                if (data.media_type == 'IMAGE') {
                                                    appendData += '<div class="">\n' +
                                                        '<img src="' + data.media_url + '"\n' +
                                                        'class="img-fluid"/>\n' +
                                                        '</div>';
                                                } else if (data.media_type == 'VIDEO') {
                                                    appendData += ' <div\n' +
                                                        'class="embed-responsive embed-responsive-16by9">\n' +
                                                        '<iframe class="embed-responsive-item rounded"\n' +
                                                        'src="' + data.media_url + '"\n' +
                                                        'allowfullscreen=""></iframe>\n' +
                                                        '</div>';
                                                }

                                            });
                                        } else {
                                            appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                '' + element.captionText + '\n' +
                                                '</p>';
                                        }
                                        appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                            '' + element.captionText + '\n' +
                                            '</p>\n' +
                                            '<div class="d-flex align-items-center">\n';
                                        if (element.type === 'IMAGE') {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + 'image' + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';
                                        } else if (element.type === 'VIDEO') {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + 'video' + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';
                                        } else {
                                            appendData += '<a id="reSocioButton"\n' +
                                                'onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl[0].media_url + '\',\'' + element.mediaUrl[0].media_type.toLowerCase() + '\',null,null)"\n' +
                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass">\n' +
                                                '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                '</span>Re-socio\n' +
                                                '</a>\n';

                                        }
                                        appendData += '</div>\n' +
                                            '</div>\n' +
                                            '</div>\n';
                                        $('#instagramFeeds').append(appendData);
                                    });
                                } else {
                                    $('#instagramFeeds').append('<div class="text-center">\n' +
                                        'div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>\n' +
                                        '<h6>Currently no Instagram  feeds has been found for this account</h6>\n' +
                                        '</div>');
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
                                downloadMediaUrl('fb');
                            }, 3000);
                        },
                        error: function (error) {
                            if (error.responseJSON.message) {
                                toastr.error(`${error.responseJSON.message}`);
                            }
                        },
                    });
                };

            </script>

@endsection