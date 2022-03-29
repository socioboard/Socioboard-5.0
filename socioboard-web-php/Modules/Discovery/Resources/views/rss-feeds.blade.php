@extends('home::layouts.UserLayout')
<head>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
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
                        <div class="card card-custom gutter-b sticky" data-sticky="true" data-margin-top="140px" data-sticky-for="1023" data-sticky-class="kt-sticky">
                            <!-- <div class="card-header border-0 py-5">

                            </div> -->
                            <!--begin::Body-->
                            <div class="card-body">
                                <h3 class="card-title font-weight-bolder mb-5">RSS</h3>
                                <!--begin::Form-->
                                <form id="search_form">
                                    <!--begin::Social-->
                                    <div class="form-group">
                                        <div class="input-icon">
                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" id="rss_url" name="url" autocomplete="off" placeholder="Enter RSS URL"/>
                                            <span><i class="fas fa-link"></i></span>
                                        </div>
                                    </div>
                                    <!--end::Social-->
                                    <button type="submit" id="search" class="btn font-weight-bolder mr-2 px-8">Search</button>
                                    <button type="reset" class="btn font-weight-bolder px-8">Clear</button>
                                </form>
                                <!--end::Form-->
                                <div class="rss-feed-url-lists">
                                    <script>
                                        let url = '{{$url}}' ;
                                    </script>
                                    <h3 class="card-title font-weight-bolder mt-10">URL list</h3>
                                    <ul>
                                        @foreach($responseData['data'] as $data)
                                            <li>
                                                <h4 class="text-muted font-weight-bold d-block mt-5" id="title_id{{$data->_id}}" onblur="editFunction('{{$data->_id}}','{{$data->rssUrl}}','{{$data->description}}')">{{$data->title}}</h4>
                                                <a href="" class="font-weight-bolder text-hover-primary mb-1 font-size-lg" onclick="viweFunction('{{$data->rssUrl}}')">{{$data->rssUrl}}</a>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                            <!--end::Body-->
                        </div>

                    </div>
                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card-columns" id="rss_feedss">
                            @if(isset($responseFeedsData['data']))
                                @foreach($responseFeedsData['data'] as $feeds )
                                    @php $title = str_replace("'",'',$feeds->title); @endphp
                                    <div class="card">
                                        <div class="card-body">
                                            <a href="{{$feeds->mediaUrl}}"><h5 class="card-title mb-1 mt-2">{{$feeds->title}}</h5></a>
                                            <p class="card-text">{{$feeds->description}}</p>
                                            <hr>
                                            <div class="d-flex justify-content-center">
                                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('{{$feeds->mediaUrl}}','{{$title}}')"><i class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @endif
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
                    <form action="{{ route('publish_content.share') }}" id="publishContentForm" method="POST">
                        <div class="modal-body">
                            <div class="form-group" id="normal_post_area">

                            </div>
                            <div class="form-group">
                                <div class="input-icon" id="outgoingUrl">

                                </div>
                            </div>

                            <!-- image and video upload -->
                            <!-- end of image and video upload -->
                            <!-- begin:Accounts list -->
                        @if(isset($socialAccounts) && !empty($socialAccounts))
                            <!-- begin:Accounts list -->
                                <ul class="nav justify-content-center nav-pills" id="AddAccountsTab" role="tablist">
                                    @foreach($socialAccounts as $key => $socialAccount)
                                        @if($key !== 'instagram')
                                        <li class="nav-item">
                                            <a class="nav-link" id="{{$key}}-tab-accounts" data-toggle="tab" href="#{{$key}}-add-accounts">
                                                <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i></span>
                                            </a>
                                        </li>
                                        @endif
                                    @endforeach
                                </ul>
                                <span id="error-socialAccount" class="error-message form-text text-danger text-center"></span>
                                <div class="tab-content mt-5" id="AddAccountsTabContent">
                                    @foreach($socialAccounts as $key => $socialAccountsGroups)

                                        <div class="tab-pane" id="{{$key}}-add-accounts" role="tabpanel" aria-labelledby="{{$key}}-tab-accounts">
                                            <div class="mt-3">
                                                @foreach($socialAccountsGroups as $group => $socialAccountArray)
                                                    @if(($group == "account") || ($group == "page") || ($group == "business account"))
                                                        <span>Choose {{ucwords($key)}} {{$group}} for posting</span>
                                                        @foreach($socialAccountArray as $group_key => $socialAccount)

                                                            <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="overflow-y: scroll;">
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
                                                                            <!--end::Data-->
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
                                                            </div>
                                                        @endforeach
                                                    @endif
                                                @endforeach
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                                <!-- end:Accounts list -->
                        @endif
                        <!-- end:Accounts list -->
                        </div>

                        <div class="modal-footer">
                            <button type="button" name="status" value="0" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Draft</button>
                            <button type="button" name="status" value="1" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Post</button>
                        </div>
                </div>
            </div>
        </div>
        <!-- end::Re-socio-->

        @endsection

        @section('scripts')
            <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
        @endsection

        @section('page-scripts')

            <script>

                var sticky = new Sticky('.sticky');


                $(document).ready(function(){
                    $("#boards").trigger('click');
                });

                let feedsLength;
                function viweFunction(url){
                    $("#rss_feedss").empty();
                    $('#rss_url').val(url);
                    getRssFeeds(url);
                }

                $(document).on('submit','#search_form', function (e) {
                    $("#rss_feedss").empty();
                    e.preventDefault();
                    url = $('#rss_url').val();
                    getRssFeeds(url);
                })

                function getRssFeeds(url) {
                    $('#search').empty().append('<i class="fa fa-spinner fa-spin"></i>Searching');
                    $.ajax({
                        url : '/discovery/search-rss-feeds',
                        type: 'post',
                        data: {
                            url : url
                        },
                        headers : {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        success: function (response) {
                            $('#search').empty().append('Search');
                            if(response.code === 200 ){
                                $('#rss_feedss').empty();
                                feedslength = response.data.length;
                                let appendData = '';
                                $(".spinner-border").css("display", "none");
                                let url;
                                let chaneltitle;
                                response.data.map(element => {
                                    url = "'" + element.mediaUrl + "'";
                                    let title = element.title.replace("'","");
                                    chaneltitle = "'"+title+"'";
                                    appendData = '<div class="card">' +
                                        '<div class="card-body">' +
                                        '<a href="'+element.mediaUrl+'"><h5 class="card-title mb-1 mt-2">'+element.title+'</h5></a>'+
                                        '<p class="card-text">'+element.description+'</p>'+
                                        '<hr>'+
                                        '<div class="d-flex justify-content-center">'+
                                        '<a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('+url+','+chaneltitle+')"><i class="far fa-hand-point-up fa-fw"></i> 1 click</a>'+
                                        '</div>'+
                                        '</div>'+
                                        '</div>'
                                    ;
                                    $('#rss_feedss').append(appendData);
                                })
                            } else if (response.code === 401){
                                if (response.error === "\"rssUrl\" is not allowed to be empty")
                                {
                                    toastr.error('RSS Url is not allowed to be empty')
                                }else if(response.error ==="\"rssUrl\" must be a valid uri"){
                                    toastr.error('The url must be a valid RSS url.');
                                }else{
                                    toastr.error(response.error);
                                }
                            }else if(response.code === 400){
                                toastr.error('Please recheck RSS Url');
                            }else{
                                toastr.error(response.error);
                            }
                        },
                        error : function (error) {
                            $('#search').empty().append('Search');
                            toastr.error(error.error);
                        }
                    })
                }

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

                document.addEventListener("scroll", function (event) {
                    if (getDocHeight() === getScrollXY()[1] + window.innerHeight) {
                        getNextRssFeeds(url);
                    }
                });
                function getNextRssFeeds(url){
                    $.ajax({
                        url : '/discovery/search-rss-feeds',
                        type: 'post',
                        data: {
                            url : url
                        },
                        headers : {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        beforeSend: function () {
                            $('#rss_feedss').append('<div class="d-flex justify-content-center" >\n' +
                                '        <div class="spinner-border" role="status"  id="' + url + '" style="display: none;">\n' +
                                '            <span class="sr-only">Loading...</span>\n' +
                                '        </div>\n' +
                                '\n' +
                                '        </div>');
                            $(".spinner-border").css("display", "block");
                        },
                        success: function (response) {
                            if(response.code === 200 ){
                                feedslength = response.data.length;
                                let appendData = '';
                                $(".spinner-border").css("display", "none");
                                let url;
                                let chaneltitle;
                                let title;
                                response.data.map(element => {
                                    url = "'" + element.mediaUrl + "'";
                                    let title = element.title.replace("'","");
                                    chaneltitle = "'"+title+"'";
                                    appendData = '<div class="card">' +
                                        '<div class="card-body">' +
                                        '<a href="'+element.mediaUrl+'"><h5 class="card-title mb-1 mt-2">'+element.title+'</h5></a>'+
                                        '<p class="card-text">'+element.description+'</p>'+
                                        '<hr>'+
                                        '<div class="d-flex justify-content-center">'+
                                        '<a href="javascript:;" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('+url+','+chaneltitle+')"><i class="far fa-hand-point-up fa-fw"></i> 1 click</a>'+
                                        '</div>'+
                                        '</div>'+
                                        '</div>'
                                    ;
                                    $('#rss_feedss').append(appendData);
                                })
                            }else if (response.code === 401){
                                toastr.error(response.error);
                            }
                        },
                        error : function (error) {
                            toastr.error(error.error);
                        }
                    })
                }

                $(document).ready(function () {
                    $("#discovery").trigger('click');
                })

                function editFunction(id, url, description) {
                    let value = document.getElementById("title_id" + id).innerHTML;
                    $.ajax({
                        url: '/discovery/edit-rss-feeds',
                        type: 'post',
                        data: {
                            id: id,
                            title: value,
                            url: url,
                            description: description
                        },
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                toastr.success('success')
                            } else {
                                toastr.error(response.error);
                            }
                        },
                        error: function (error) {
                            toastr.error(error.error);
                        }
                    })
                }


                function openModel(id, cheaneltitle ) {
                    $('#normal_post_area').empty().append(' <textarea class="form-control border border-light h-auto py-4 rounded-lg font-size-h6" id="normal_post_area" name="content" rows="3" placeholder="Write something !" required >'+cheaneltitle +'</textarea>');
                    $('#outgoingUrl').empty().append(' <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="outgoingUrl" autocomplete="off" placeholder="Enter Outgoing url" value="'+id +'"/><span><i class="fas fa-link"></i></span>');
                }
            </script>
@endsection


