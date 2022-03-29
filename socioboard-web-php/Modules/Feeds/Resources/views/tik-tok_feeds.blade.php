@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | TikTok Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="/css/images-grid.css"/>
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">

                <div class="card p-10 mb-10 d-flex">
                    <!--begin::Profile-->
                    <div class="">
                        <?php $regex = "@(https?://([-\w\.]+[-\w])+(:\d+)?(/([\w/_\.#-]*(\?\S+)?[^\.\s])?).*$)@"; ?>
                        <div class="row">
                            <div class="col-md-4" id="tiktokProfileDiv">
                                @if($message != 'No Tik-tok Account has been  added yet! or Account has locked' )
                                <div class="card p-5 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                    <div class="ribbon-target bg-tiktok" style="top: -2px; right: 20px;">
                                        <i class="fab fa-tiktok"></i>
                                    </div>
                                    <!--begin::User-->
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                <div class="symbol-label" style="background-image:url('{{$accounts[0]->profile_pic_url}}')">
                                                </div>
                                                <i class="symbol-badge bg-success"></i>
                                            </div>
                                            <div>
                                                <a
                                                   class="font-weight-bolder font-size-h5 text-hover-primary" target="_blank">
                                                    {{$accounts[0]->user_name}}
                                                </a>
                                            </div>
                                        </div>

                                    <!--end::User-->
                                </div>
                                @endif
                            </div>
                            <div class="col-md-4">

                            </div>
                            <div class="col-md-4">
                                <div class="sticky ml-auto" data-sticky="true" data-margin-top="140px" data-sticky-for="1023"
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
                                                            value="{{$data->account_id}}">{{$data->user_name}}
                                                    </option>
                                                @endforeach
                                            @elseif($message=== 'failed')
                                                <option selected value="failed"> Sorry some error ,occurred please reload page
                                                </option>
                                            @elseif($message=== 'No Tik-tok Account has been  added yet! or Account has locked')
                                                <option selected value="failed">No TikTok Account has been added yet! or
                                                    Account has locked
                                                </option>
                                            @else
                                                <option selected value="failed"> {{$message}}
                                                </option>
                                            @endif
                                        </select>
                                    </div>
                                    <!-- end:Accounts list -->

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row" id="tiktokFeeds">
                <?php $regex = "@(https?://([-\w\.]+[-\w])+(:\d+)?(/([\w/_\.#-]*(\?\S+)?[^\.\s])?).*$)@"; ?>
                <?php $date = 0; ?>
                @if($message=== 'success')
                    @if(count($accounts)>0)
                        @if($feeds['code']=== 200)
                            <!--begin::Text-->

                                @if(isset($feeds['data']->videos))
                                    <script>
                                        var feedsLength = <?php echo count($feeds['data']->videos)  ?>;
                                    </script>
                                    @foreach($feeds['data']->videos as $data)
                                        <?php $date = new Datetime($data->create_time);
                                        $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                        ?>

                                                <div class="col-md-6">
                                                    <div class="mb-5 card p-5">
                                                        <!--begin::Top-->
                                                        <div class="d-flex align-items-center">
                                                            <!--begin::Symbol-->
                                                            <div class="symbol symbol-40 symbol-light-success mr-5">
                                        <span class="symbol-label">
                                            <img src="{{$accounts[0]->profile_pic_url}}" class="h-75 align-self-end" alt="" />
                                        </span>
                                                            </div>
                                                            <!--end::Symbol-->

                                                            <!--begin::Info-->
                                                            <div class="d-flex flex-column flex-grow-1">
                                                                <a href="javascript:;" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">{{$accounts[0]->user_name}}</a>
                                                                <span class="text-muted font-weight-bold">{{$date->format('Y-m-d')}} {{$date->format('H:i:s')}}</span>
                                                            </div>
                                                            <!--end::Info-->
                                                        </div>
                                                        <!--end::Top-->

                                                        <!--begin::Bottom-->
                                                        <div class="pt-4">

                                                            <blockquote class="tiktok-embed"
                                                                        cite="{{$data->share_url}}"
                                                                        data-video-id={{$data->id}} style="max-width:
                                                                        605px;min-width: 325px;
                                                            " >
                                                            <section><a target="_blank"
                                                                        title="<?php echo(explode('/', $data->share_url)[3]);?>"
                                                                        href="https://www.tiktok.com/<?php echo(explode('/', $data->share_url)[3]);?>"><?php echo(explode('/', $data->share_url)[3]);?></a>
                                                                <p>videos</p> <a target="_blank"
                                                                                 title="♬ original sound - <?php echo(explode('/', $data->share_url)[3]);?>"
                                                                                 href="https://www.tiktok.com/music/original-sound-{{$data->id}}">♬
                                                                    original sound
                                                                    - <?php echo(explode('/', $data->share_url)[3]);?></a>
                                                            </section>
                                                            </blockquote>
                                                            <script async
                                                                    src="https://www.tiktok.com/embed.js"></script>

                                                            <!--begin::Text-->
                                                            <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                <?php echo preg_replace($regex, ' ', $data->video_description); ?>
                                                            </p>
                                                            <!--end::Text-->

                                                            <!--begin::Action-->
                                                            <div class="d-flex justify-content-center">
                                                                <a href="javascript:;" data-toggle="modal" id="reSocioButton"
                                                                   onclick="resocioButton('{{$data->video_description}}',null,null,null,'{{$data->share_url}}')"
                                                                   class="btn  btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm px-12 py-4">
                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                <i class="fas fa-pencil-alt"></i>
                                            </span>Re-socio
                                                                </a>
                                                            </div>

                                                            <!--end::Action-->
                                                        </div>
                                                        <!--end::Bottom-->
                                                    </div>
                                                    <!--end::Video-->

                                                </div>

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
                                <div class="text-center">
                                    <div class="symbol symbol-150">
                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                    </div>
                                    <h6>{{$message}}</h6>
                                </div>
                            @endif
                        @elseif($message=== 'No Tik-tok Account has been  added yet! or Account has locked')
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <h6>{{$message}}</h6>
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
                    @elseif($message=== 'No Tik-tok Account has been  added yet! or Account has locked')
                        <div class="text-center">
                            <div class="symbol symbol-150">
                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                            </div>
                            <h6>{{$message}}</h6>
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
            <!--end::Entry-->
        </div>

        </div>

    </div>
        <!--end::Content-->
        @endsection
        @section('scripts')
            <script src="{{asset('js/accounts.js')}}"></script>
            <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
            <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
            <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
            <script async src="https://www.tiktok.com/embed.js"></script>
            <script>
                $(document).ready(function () {
                    $("#discovery").trigger("click");
                });

                function fetchMetaDataForTikTokEmbedContainers() {
                    document.body.appendChild(document.createElement('script')).src = 'https://www.tiktok.com/embed.js';
                }

                /**
                 * TODO we've to get  the twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                 * This function is used for getting twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                 * @param {this} data- account id of that particular twitter account.
                 * ! Do not change this function without referring API format of getting the twitter feeds.
                 */
                function call(data) {
                    accounId = data.value;//accountid of particular twitter account from dropdown
                    getTikTokFeeds(accounId, 1);
                }

                function getTikTokFeeds(accid, pageId) {
                    $.ajax({
                        type: 'get',
                        url: '/get-next-tiktok-feeds',
                        data: {
                            accid, pageId
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#tiktokFeeds,#tiktokProfileDiv').empty();
                            $('#tiktokFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div></div>');
                            $('#tiktokProfileDiv').append('<div class="d-flex justify-content-center" >\n' +
                                '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                '<span class="sr-only">Loading...</span>\n' +
                                '</div></div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            $(".spinner-border").css("display", "none");
                            let arrayImages = [];
                            let appendData='';
                            let num = 0;
                            let splitUrl=[];
                            if (response.code === 200) {
                                $('#feeds_count,#following_count,#follower_count').empty();
                                $('#tiktokProfileDiv').append(`<div class="card p-5 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                    <div class="ribbon-target bg-tiktok" style="top: -2px; right: 20px;">
                                        <i class="fab fa-tiktok"></i>
                                    </div>
                                    <!--begin::User-->
                                    <div class="d-flex align-items-center">
                                        <div class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                            <div class="symbol-label" style="background-image:url(`+ response.userData.avatar_url + `)">
                                            </div>
                                            <i class="symbol-badge bg-success"></i>
                                        </div>
                                        <div>
                                            <a
                                               class="font-weight-bolder font-size-h5 text-hover-primary" target="_blank">`+ response.userData.display_name +
                                `</a>
                            </div>
                        </div>
                        <!--end::User-->
                    </div>`);
                                let appendData = '';
                                let createdDate = '';
                                let published = '';
                                let divSection = '';
                                if (typeof (response.feeds) === "string") {
                                    $('#tiktokFeeds').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div></div>');
                                    $('#tiktokFeeds').append(response.feeds);
                                } else {
                                    divSection = document.getElementById('tiktokFeeds');
                                    response.feeds.map(element => {
                                         createdDate = new Date(element.create_time),
                                            published = String(createdDate).substring(0, 25);
                                        splitUrl = element.share_url.split("/");
                                        divSection.innerHTML+=`<div class="col-md-6">
                                                    <div class="mb-5 card p-5">
                                                        <div class="d-flex align-items-center">
                                                            <div class="symbol symbol-40 symbol-light-success mr-5">
                                        <span class="symbol-label">
                                            <img src="` + response.userData.avatar_url + `" class="h-75 align-self-end" alt="" />
                                        </span>
                                                            </div>
                                                            <div class="d-flex flex-column flex-grow-1">
                                                                <a href="javascript:;" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">` + response.userData.display_name + `</a>
                                                                <span class="text-muted font-weight-bold">` + published + `</span>
                                                            </div>
                                                        </div>
                                                        <div class="pt-4">
                                                            <blockquote class="tiktok-embed" cite="` + element.share_url + `" data-video-id=` + element.id + ` style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title=` + splitUrl[3] + ` href="https://www.tiktok.com/` + splitUrl[3] + `">` + splitUrl[3] + `</a> <p>videos</p> <a target="_blank" title="♬ original sound - ` + splitUrl[3] + `" href="https://www.tiktok.com/music/original-sound-` + splitUrl[3] + `">♬ original sound - @shivamdixit817</a> </section> </blockquote>
            <p class="font-size-lg font-weight-normal pt-5 mb-2">
                ` + element.video_description + `
            </p>
            <div class="d-flex justify-content-center">
                <a href="javascript:;" data-toggle="modal" id="reSocioButton"
                   onclick="resocioButton(\`` + element.video_description + `\`,null,null,null,\`` + element.share_url + `\`)"
                   class="btn  btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm px-12 py-4">
                                            <span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                <i class="fas fa-pencil-alt"></i>
                                            </span>Re-socio
                </a>
            </div>
            </div>
            </div>
            </div>`;
                                        fetchMetaDataForTikTokEmbedContainers();
                                    });
                                }
                            }else if (response.data.code === 400) {
                                $('#tiktokFeeds, #tiktokProfileDiv').empty();
                                $('#tiktokFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    response.error + '</div>');
                                $('#tiktokFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div></div>');

                            } else {
                                $('#tiktokFeeds, #tiktokProfileDiv').empty();
                                $('#tiktokFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                    'Some error occured, can not get feeds' + '</div>');
                                $('#tiktokFeeds').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div></div>');
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
            </script>
@endsection
