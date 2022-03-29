@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Pinterest Pins</title>
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
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row" data-sticky-container>
                    <div class="col-xl-12">
                        <!--begin::Feeds-->
                        <div class="card card-custom gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="mb-0 font-weight-bolder">Pinterest Pins of Board  {{$boardName}}</h3>
                            </div>
                            <!--end::Header-->
                            <?php $regex = "@(https?://([-\w\.]+[-\w])+(:\d+)?(/([\w/_\.#-]*(\?\S+)?[^\.\s])?).*$)@\n"; ?>
                            <div class="card-body medium-story" id="pinterestPins">
                                <div class="row">
                                    @if($message === 'success')
                                        <script>
                                            let feedsLength = <?php echo count($pins)  ?>;
                                            let accountId = <?php echo $accountId  ?>;
                                            let boardId = <?php echo $boardId  ?>;
                                        </script>
                                        @foreach($pins as $data)
                                            <div class="col-xl-3">
                                                <div class="card pinterest-feeds">
                                                    <div class="card-body px-3 py-3">
                                                        <a href="{{$data->postUrl}}" target="_blank">
                                                            <img src={{$data->mediaUrl}} alt="image"
                                                                 class="img-fluid card-img">
                                                        </a>
                                                        <div class="mt-5">
                                                            {{--                                                        @if($data->captionText === '')--}}
                                                            {{--                                                            <br>--}}
                                                            {{--                                                        @endif--}}
                                                            <p class="mt-2">{{$data->captionText}}</p>
                                                            @if($data->outgoingUrl !== '')
                                                                <a href="{{$data->outgoingUrl}}" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target="_blank">
                                                                    {{$data->outgoingUrl}}</a>
                                                                @endif
                                                        </div>
                                                        <br>
                                                        <div class="d-flex justify-content-center">
                                                            @if($data->outgoingUrl!=='')
                                                                <button data-toggle="tooltip" data-placement="top"
                                                                        title="Re-socio" type="button" class="btn btn-sm"
                                                                        onclick="resocioButton('<?php echo preg_replace($regex, ' ', $data->captionText); ?>','{{$data->mediaUrl}}','image',null,'{{$data->outgoingUrl}}')">
                                                                    <i class="fas fa-pencil-alt"></i> Re-socio
                                                                </button>
                                                                @else
                                                                <button data-toggle="tooltip" data-placement="top"
                                                                        title="Re-socio" type="button" class="btn btn-sm"
                                                                        onclick="resocioButton('<?php echo preg_replace($regex, ' ', $data->captionText); ?>','{{$data->mediaUrl}}','image',null,null)">
                                                                    <i class="fas fa-pencil-alt"></i> Re-socio
                                                                </button>
                                                            @endif
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>

                                        @endforeach
                                    @elseif($message === 'failed')
                                        <h3>Some error occured,Can not show Pins of pinterest Board {{$boardName}}</h3>
                                    @else
                                        <h3>{{$message}}</h3>
                                    @endif
                                </div>
                            </div>
                        </div>
                        <!--end::Feeds-->
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
@endsection
@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script src="{{asset('js/images-grid.js')}}"></script>
    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
    <script>
        let pageId = 2;
        $(window).scroll(function () {
            if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                if (feedsLength >= 12) {
                    getNextPinterestFeeds(accountId, pageId, boardId);
                    pageId++;
                }
            }
        });
        $(document).ready(function () {
            $("#discovery").trigger("click");
        });

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

        function getNextPinterestFeeds(accounId, pageId, boardId) {
            $.ajax({
                type: 'get',
                url: '/get-next-pinterest-feeds',
                data: {
                    accounId, pageId, boardId
                },
                dataType: 'json',
                success: function (response) {
                    let appendData = '';
                    if (response.data.code === 200) {
                        if (response.data.data.pins.length > 0) {
                            let type = 'image';
                            response.data.data.pins.map(element => {
                                appendData +=
                                    '<div class="col-xl-3">\n' +
                                    '<div class="card pinterest-feeds">\n' +
                                    '<div class="card-body px-3 py-3">\n' +
                                    '<a href="' + element.postUrl + '" target="_blank">\n' +
                                    '<img src="' + element.mediaUrl + '" alt="image"\n' +
                                    'class="img-fluid card-img">\n' +
                                    '</a>\n' +
                                    '<div class="mt-5">\n' +
                                    '<p class="mt-2">' + element.captionText + '</p>\n' +
                                    '</div>\n' +
                                    '<div class="d-flex justify-content-center">\n' +
                                    '<button data-toggle="tooltip" data-placement="top"\n' +
                                    'title="Re-socio" type="button" class="btn btn-sm"\n' ;
                                if(element.outgoingUrl!==''){
                                    appendData +='onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl + '\',\'' + type + '\',null,\'' + element.outgoingUrl + '\')">\n' ;

                                }
                                else{
                                    appendData +='onclick="resocioButton(\'' + element.captionText + '\',\'' + element.mediaUrl + '\',\'' + type + '\',null,null)">\n' ;

                                }
                                appendData +=  '<i class="fas fa-pencil-alt"></i> Re-socio\n' +
                                    '</button>\n' +
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</div>'
                            });
                            $('#pinterestPins').append(appendData);
                        }
                    }
                }
            });
        }

    </script>
@endsection