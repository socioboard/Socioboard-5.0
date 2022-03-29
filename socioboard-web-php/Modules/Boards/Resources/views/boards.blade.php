@extends('home::layouts.UserLayout')

@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Boards</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">

                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-12">
                        <!--begin::Borad-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">BoardMe : <span class="text-primary ml-3"> {{$keyword}}</span></h3>

                                <div class="card-toolbar">
                                    <!--begin::Teams Actions Dropdown-->
                                    <div class="dropdown dropdown-inline ml-2" data-toggle="tooltip" data-placement="left">
                                        <a href="javascript:;" class="btn btn-hover-light-primary btn-sm btn-icon" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i class="ki ki-bold-more-hor"></i>
                                        </a>
                                        <div class="dropdown-menu p-0 m-0 dropdown-menu-md dropdown-menu-right">
                                            <!--begin::Navigation-->
                                            <ul class="navi navi-hover">
                                                <li class="navi-item">
                                                      <a href="{{env('APP_URL')}}boards/board-me/{{$keyword}}/refresh/{{$id}}" class="navi-link">
                                                                    <span class="navi-text">
                                                                        <span class="text-success"><i class="fas fa-sync-alt fa-fw text-success"></i> Refresh </span>
                                                                    </span>
                                                    </a>
                                                </li>
                                                <li class="navi-item">
                                                    <a href="javascript:;" class="navi-link" data-toggle="modal" data-target="#deleteBoardModal">
                                                                    <span class="navi-text">
                                                                        <span class="text-danger"><i class="far fa-trash-alt fa-fw text-danger"></i> Delete This Board</span>
                                                                    </span>
                                                    </a>
                                                </li>
                                            </ul>
                                            <!--end::Navigation-->
                                        </div>
                                    </div>
                                    <!--end::Teams Actions Dropdown-->
                                </div>
                            </div>
                            <!--end::Header-->
                        </div>
                        <!--end::Borad-->
                    </div>

                </div>
                <!--end::Row-->
                <!--begin::Board-->
                <!--begin::Row-->
                <div class="card-columns feeds-container" id="youtubeFeeds">
                    @if(isset($responseData) && $responseData['data'] !== null)
                        <script>
                            var feedsLength = <?php echo count($responseData['data']->youtubeDetails)  ?>;
                            var keyword =  '{{$keyword}}'  ;
                        </script>

                        @foreach( $responseData['data']->youtubeDetails as $account)
                            <div class="card">
                                <!--begin::Video-->
                                <div class="embed-responsive embed-responsive-16by9">
                                    <iframe class="embed-responsive-item rounded"
                                            src="{{$account->embed_url}}" allowfullscreen=""></iframe>
                                </div>
                                <!--end::Video-->
                                <div class="card-body">
                                    <div class="board-card">
                                        <div>
                                            <div class="d-flex align-items-center">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-40 symbol-light-success mr-5">
                                                                    <span class="symbol-label">
                                                                        <img src="/media/svg/avatars/011-boy-5.svg"
                                                                             class="h-75 align-self-end" alt="">
                                                                    </span>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Info-->
                                                <div class="d-flex flex-column flex-grow-1">
                                                    <a href="{{$account->mediaUrl}}"
                                                       class="text-hover-primary mb-1 font-size-lg font-weight-bolder"
                                                       target="_blank">{{$account->channelTitle}}</a>
                                                    @php
                                                        $date = new DateTime($account->publishedDate);
                                                    @endphp
                                                    <span class="text-muted font-weight-bold">{{$date->format('Y-m-d H:i:s')}}</span>
                                                </div>
                                                <!--end::Info-->
                                            </div>
                                            <h5 class="card-title mt-3 mb-2">{{$account->title}}</h5>
                                            <p class="card-text">
                                                {{$account->description}}<br><br>
                                            </p>
                                        </div>
                                        <div>
                                            <hr>
                                            <div class="d-flex justify-content-center">
                                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" onclick="openModel('{{$account->mediaUrl}}','{{$account->channelTitle}}','{{$account->title}}')"
                                                   class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5"><i
                                                            class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                                                <a href="{{$account->mediaUrl}}"
                                                   class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder"><i
                                                            class="fab fa-youtube fa-fw"></i> Show Original</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    @endif
                </div>
                <!--end::Row-->
                <!--end::Board-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>

        <!--begin::Entry-->

        <!--end::Entry-->
    </div>
    <div class="modal fade" id="deleteBoardModal" tabindex="-1" role="dialog" aria-labelledby="deleteBoardModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteBoardModalLabel">Delete Board</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <img src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                        <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this board?</span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button" onclick=" deleteIt('{{$id}}')" class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal" id="board-delete">Delete it!</a>
                        <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
                                                    @elseif(ucwords($key) === "Linkedin" || ($key) === "linkedin-in")
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
                                                    <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="overflow-y: scroll;">
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
                        <button type="button" name="status" value="0" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Draft</button>
                        <button type="button" name="status" value="1" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Post</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <!-- end::Re-socio-->




@endsection

@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script>
        // accounts list div open
        $(".accounts-list-div").css({
            display: "none"
        });
        $(".accounts-list-btn").click(function() {
            $(".accounts-list-div").css({
                display: "block"
            });
        });

        $(function() {
            var names = [];
            $("#hint_brand").css("display", "none");
            var pageid = 2;
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

            var pageid = 2;
            document.addEventListener("scroll", function (event) {
                if (feedsLength >= 15) {
                    if (getDocHeight() == getScrollXY()[1] + window.innerHeight) {
                        getNextYotubefeeds(pageid,keyword);
                        pageid++;
                    }
                }
            });

        });
        // end:images and videos upload
    </script>

@endsection

@section('page-scripts')
    <script type="text/javascript">

        $(document).ready(function(){

            $("#boards").trigger('click');
        });

        function getNextYotubefeeds(pageid, keyword) {
            $.ajax({
                type: 'post',
                url: '/boards/get-next-youtube-feeds',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data :{
                    pageid:pageid,
                    keyword:keyword
                },
                success: function (response) {
                    if(response.code === 200 ){
                        let appendData = '';
                        $(".spinner-border").css("display", "none");
                        feedsLength = response.data.youtubeDetails.length;
                        let url;
                        let chaneltitle;
                        let title;
                        response.data.youtubeDetails.map(element => {
                            url = "'" + element.mediaUrl + "'";
                            chaneltitle = "'" + element.channelTitle + "'";
                            title = "'" + element.title + "'";
                            appendData = '<div class="card">'+
                                '<div class="embed-responsive embed-responsive-16by9">'+
                                '<iframe class="embed-responsive-item rounded" src="'+element.embed_url+'" allowfullscreen=""></iframe>'+
                                '</div>'+
                                '<div class="card-body">'+
                                '<div class="board-card">'+
                                '<div>'+
                                '<div class="d-flex align-items-center">'+
                                '<div class="symbol symbol-40 symbol-light-success mr-5">'+
                                '<span class="symbol-label">'+
                                '<img src="/media/svg/avatars/011-boy-5.svg"class="h-75 align-self-end" alt=""> </span> </div>'+
                        '<div class="d-flex flex-column flex-grow-1">'+
                        '<a href="https://www.youtube.com/watch?v=jfCpOsdouwA&ab_channel=ChanchalSantra" class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">'+element.channelTitle+'</a>'+
                        '<span class="text-muted font-weight-bold">'+element.publishedDate+'</span>'+
                        '</div>'+
                        '</div>'+
                        '<h5 class="card-title mt-3 mb-2">'+element.title+'</h5>'+
                        '<p class="card-text">'+element.description+'<br><br></p>'+
                                '</div>'+
                                '<div>'+
                                '<hr><div class="d-flex justify-content-center">'+
                                '<a href="javascript:;" data-toggle="modal" data-target="#resocioModal"class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5" onclick="openModel('+url+','+chaneltitle+','+title+')">'+
                                '<iclass="far fa-hand-point-up fa-fw"></i> 1 click</a>'+
                                '<a href="'+element.mediaUrl+'" class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder">'+
                                '<i class="fab fa-youtube fa-fw"></i> Show Original</a>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>';
                            $('#youtubeFeeds').append(appendData);
                        })

                        }
                    }
            });
        }

        function openModel(mediaUrl, publisherName, title ) {
            $('input:checkbox').prop('checked', false);
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
                }
            });
        }

        function deleteIt(id) {
            $.ajax({
                url: "/boards/board-delete/"+id,
                type: "delete",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response['code'] === 200) {
                        toastr.success("Board Deleted Successfully!");
                        window.location.href = "/boards/view-boards";
                    } else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    toastr.error(error.ErrorMessage);
                }
            })
        }
    </script>
@endsection


