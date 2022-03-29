@if(isset($data) && $data)

    @foreach($data['data'] as $key => $item)
        @foreach($data['schedule_information'] as $scheduled_details)
            $scheduled_details->mongo_schedule_id
                @endforeach
        <?php
                $scheduled_ids = [];
                foreach ($data['schedule_information'] as $scheduled_details){
                    array_push($scheduled_ids, $scheduled_details->mongo_schedule_id);
                }
        $pageSlug = $slug ? $slug : null;
        $mediaUrlSize = (isset($item->mediaUrl) && !empty($item->mediaUrl)) ? sizeof($item->mediaUrl) : 0 ;
        if(is_array($item->mediaUrl) && !empty($item->mediaUrl)){
            $mediaUrl = filter_var($item->mediaUrl[0], FILTER_VALIDATE_URL) ? $item->mediaUrl[0] : $site_url.$item->mediaUrl[0] ;
        } else{
            $mediaUrl = ($item->mediaUrl) ? (filter_var($item->mediaUrl, FILTER_VALIDATE_URL) ? $item->mediaUrl : $site_url.$item->mediaUrl) : '/media/png/broken-img.jpg' ;
        }
        if($page == "drafts") {
            $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : route('publish_content.draft-schedule-edit', $item->_id, $pageSlug);
        } elseif (($slug == "ready-queue") || ($slug == "day-wise-socioqueue")) {
            $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : $env.'home/publishing/socioQueue-scheduling/'.$item->_id.'/2';
        } else {
            $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : route('publish_content.scheduling-edit', $item->_id, $pageSlug);
        }

        $title = strlen($item->description) > 30 ? substr($item->description, 0, 30)."..." : $item->description;
        $timezones = session()->get('timezone');
        ?>
        <tr>
            <td class="pl-0 py-8">
                <div class="d-flex align-items-center">
                    @if($mediaUrlSize > 1)
                        <div class="symbol symbol-50 flex-shrink-0 mr-4 ribbon ribbon-right">
                            <div class="ribbon-targ et bg-primary" style="top: 5px; right: -2px;" data-toggle="tooltip" id="multiple_urls_tag_id"
                                 title="Multiple post"><i class="fab fa-monero"></i></div>
                            @else
                                <div class="symbol symbol-70 flex-shrink-0 mr-4">
                                    @endif
                                    <div class="symbol-label">
                                        @if($item->postType == "Image")
                                            <img src="{{$mediaUrl}}" alt="" style="height: 100%; width: 100%; border-radius:5px;">
                                        @elseif($item->postType == "Video")
                                            <video style="object-fit: contain;height: inherit; width: inherit;" autoplay muted>
                                                <source src="{{$mediaUrl}}">
                                                Your browser does not support the video tag.
                                            </video>
                                        @else
                                            <img src="{{$mediaUrl}}" alt="" style="height: 100%; width: 100%; border-radius:5px;">
                                        @endif
                                    </div>
                                </div>
                                <div>
                                    <div class="font-weight-bolder mb-1 font-size-lg" title="{{$title}}">
                                        {{$title}}
                                    </div>

                                    @if(isset($item->postingSocialIds) && sizeof($item->postingSocialIds) > 0)
                                        <span class="font-weight-bold d-block"> {{$type}} -
                             @foreach($item->postingSocialIds as $v)
                                                @if(array_key_exists($v->accountId, $twitterAccountsIds)) <i class="fab fa-twitter fa-fw " data-toggle="tooltip" data-placement="top" title="{{$twitterAccountsIds[$v->accountId]}}" ></i></i>
                                                @elseif(array_key_exists($v->accountId, $facebookAccountsIds)) <i class="fab fa-facebook-f fa-fw " data-toggle="tooltip" data-placement="top" title="{{$facebookAccountsIds[$v->accountId]}}"></i>
                                                @elseif(array_key_exists($v->accountId, $linkedInAccountsIds)) <i class="fab fa-facebook-f fa-linkedin fa-fw " data-toggle="tooltip" data-placement="top" title="{{$linkedInAccountsIds[$v->accountId]}}"></i>
                                                @elseif(array_key_exists($v->accountId, $instagramAccountsIds)) <i class="fab fa-facebook-f fa-instagram fa-fw " data-toggle="tooltip" data-placement="top" title="{{$instagramAccountsIds[$v->accountId]}}"></i>
                                                @elseif(array_key_exists($v->accountId, $tumblrAccountsIds)) <i class="fab fa-facebook-f fa-tumblr fa-fw " data-toggle="tooltip" data-placement="top" title="{{$tumblrAccountsIds[$v->accountId]}}"></i>
                                                @endif

                                                {{--                            <i class="fab fa-instagram fa-fw " data-toggle="tooltip" data-placement="top" title="Instagram"></i>--}}
                                                {{--                            <i class="fab fa-linkedin-in fa-fw " data-toggle="tooltip" data-placement="top" title="Linkedin"></i>--}}
                                                {{--                            <i class="fab fa-youtube fa-fw " data-toggle="tooltip" data-placement="top" title="YouTube"></i>--}}
                                                {{--                            <i class="fab fa-google-plus-g fa-fw " data-toggle="tooltip" data-placement="top" title="Google Plus"></i>--}}
                                                {{--                            <i class="fas fa-chart-line fa-fw " data-toggle="tooltip" data-placement="top" title="Google Analytics"></i>--}}
                                                {{--                            <i class="fab fa-dailymotion fa-fw " data-toggle="tooltip" data-placement="top" title="Dailymotion"></i>--}}
                                            @endforeach
                            </span>
                                    @else
                                        <span class="font-weight-bold d-block"> Posted -
                             @foreach($item->accountIds as $v)
                                                @if(array_key_exists($v, $twitterAccountsIds)) <i class="fab fa-twitter fa-fw " data-toggle="tooltip" data-placement="top" title="{{$twitterAccountsIds[$v]}}"></i></i>
                                                @elseif(array_key_exists($v, $facebookAccountsIds)) <i class="fab fa-facebook-f fa-fw " data-toggle="tooltip" data-placement="top" title="{{$facebookAccountsIds[$v]}}"></i>
                                                @elseif(array_key_exists($v, $linkedInAccountsIds)) <i class="fab fa-facebook-f fa-linkedin fa-fw " data-toggle="tooltip" data-placement="top" title="{{$linkedInAccountsIds[$v]}}"></i>
                                                @elseif(array_key_exists($v, $instagramAccountsIds)) <i class="fab fa-facebook-f fa-instagram fa-fw " data-toggle="tooltip" data-placement="top" title="{{$instagramAccountsIds[$v]}}"></i>
                                                @elseif(array_key_exists($v, $tumblrAccountsIds)) <i class="fab fa-facebook-f fa-tumblr fa-fw " data-toggle="tooltip" data-placement="top" title="{{$tumblrAccountsIds[$v]}}"></i>
                                                @endif
                                            @endforeach
                            </span>
                                    @endif

                                </div>
                        </div>
            </td>
            <td>
                <span class="font-weight-bolder d-block font-size-lg">
                    @if($page == "drafts")
                        {{$item->postType}}
                    @endif

                    @if($page == "schedule")
                        {{--                        @if($slug && $slug == "day-wise-socioqueue")--}}
                        @if($item->scheduleCategory == 1)
                            {{"Day-Wise Schedule"}}
                        @elseif($item->scheduleCategory == 0)
                            {{"Normal Schedule"}}
                        @else
                            -
                        @endif
                        {{--                        @endif--}}

                    @endif
                </span>
            </td>
            <td>
                <span class="font-weight-bolder d-block font-size-lg">
                    <?php
                    $timezone = session()->get('timezone');
                    $dateTIme = $item->createdDate;
                    $date = new DateTime($dateTIme);
                    $date->setTimezone(new DateTimeZone($timezone));
                    echo $date->format('Y-m-d');
                    ?>
                </span>
            </td>
            <td>
                    @php
                    $timezone = session()->get('timezone');
                    @endphp
                    @if (isset($item->scheduleCategory) && $item->scheduleCategory == 0)
                        @php
                        $dateTIme = $item->normalScheduleDate;
                        $date = new DateTime($dateTIme);
                        $date->setTimezone(new DateTimeZone($timezone));
                        @endphp
                    <span class="font-weight-bolder d-block font-size-lg">
                        {{$date->format('Y-m-d H:i:s')}}
                     </span>
                    @elseif (isset($item->scheduleCategory) && $item->scheduleCategory == 1)
                    <span id="viewButton" data-toggle="modal" data-target="#scheduleViewModal{{$item->_id}}"><i class="far fa-eye eyeDiv mr-2" title="Click here to see the day(s) and Timing(s)"></i></span>
                    <span class="date-popover ">
                        Schedule days
                    </span>
                    <div class="modal fade" id="scheduleViewModal{{$item->_id}}" tabindex="-1" role="dialog" aria-labelledby="scheduleViewModalLabel"
                         aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal-xs" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="scheduleViewModalLabel">Days and Timings</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <i aria-hidden="true" class="ki ki-close"></i>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <div class="text-center">
                                        @foreach ($item->daywiseScheduleTimer as $dats)
                                            @php
                                                $dateTIme = $dats->timings[0];
                                                $date = new DateTime($dateTIme);
                                                $date->setTimezone(new DateTimeZone($timezone));
                                            @endphp
                                            @switch($dats->dayId)
                                                @case(0)
                                                <p>Sunday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(1)
                                                <p>Monday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(2)
                                                <p>Tuesday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(3)
                                                <p>wednesday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(4)
                                                <p>Thursday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(5)
                                                <p>Friday - {{$date->format('H:i:s')}}</p>
                                                @break
                                                @case(6)
                                                <p>saturday - {{$date->format('H:i:s')}}</p>
                                                @break
                                            @endswitch
                                        @endforeach
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    @endif

            </td>
            <td>
                <span class="label label-lg label-light-primary label-inline">
                    @if ($page == "drafts")
                        @if(!isset($item->scheduleStatus))
                            {{ "Draft" }}
                        @else
                            {{"Draft schedule"}}
                        @endif
                    @endif

                    {{$type}}
                </span>
            </td>
            @if($page_title !== "history")
                <td class="pr-0">
                    <a  href="{{ $action }}" class="btn btn-icon text-hover-info btn-sm">
                    <span class="svg-icon svg-icon-md svg-icon-info">
                            <i class="fas fa-pen-square editButton"></i>
                    </span>
                    </a>
                    &nbsp;&nbsp;
                    @if(in_array($item->_id, $scheduled_ids))
                    @foreach($data['schedule_information'] as $scheduled_details)
                        @if($scheduled_details->mongo_schedule_id === $item->_id)
                            <a href="javascript:;"  class="btn btn-icon text-hover-info btn-sm deleteButton" onclick="openDeleteModel('{{$scheduled_details->schedule_id}}','draft_schedule')">
                    <span class="svg-icon svg-icon-md svg-icon-info">
                            <i class="fas fa-trash" data-toggle="modal" data-target="#deleteImageModal" ></i>
                    </span>
                            </a>
                            <!-- begin::Delete Image modal-->
                            <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel"
                                 aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="deleteImageModalLabel">Delete Post</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <i aria-hidden="true" class="ki ki-close"></i>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <form id="delete_post_form" >
                                                @csrf
                                                <input type="hidden" name="id" id="delete_id" >
                                                <input type="hidden" name="type" id="typo">
                                                <div class="text-center">
                                                    <span class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this Schedule? </span>
                                                </div>
                                                <div class="d-flex justify-content-center">
                                                    <button type="submit"
                                                            class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                            id="image-delete">Delete it! </button>
                                                    <a href="javascript:;" type="button"
                                                       class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                                                        thanks. </a>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        @endif
                    <!-- end::Delete Image modal-->
                    @endforeach
                        @else
                        <a href="javascript:;"  class="btn btn-icon text-hover-info btn-sm" onclick="openDeleteModel('{{$item->_id}}','drafts')">
                    <span class="svg-icon svg-icon-md svg-icon-info">
                            <i class="fas fa-trash" data-toggle="modal" data-target="#deleteImageModal" ></i>
                    </span>
                        </a>
                        <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel"
                             aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                <div class="modal-content">
                                    <div class="modal-header">
                                        <h5 class="modal-title" id="deleteImageModalLabel">Delete Post</h5>
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <i aria-hidden="true" class="ki ki-close"></i>
                                        </button>
                                    </div>
                                    <div class="modal-body">
                                        <form id="delete_post_form" >
                                            @csrf
                                            <input type="hidden" name="id" id="delete_id" >
                                            <input type="hidden" name="type" id="typo">
                                            <div class="text-center">
                                                <span class="font-weight-bolder font-size-h4 "> Are you sure you want to delete this Schedule? </span>
                                            </div>
                                            <div class="d-flex justify-content-center">
                                                <button type="submit"
                                                        class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                        id="image-delete">Delete it! </button>
                                                <a href="javascript:;" type="button"
                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                                                    thanks. </a>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @endif
                    @if($page == "drafts" )
                    &nbsp;@php
                    $videoData = "nomedia";
                    (($mediaUrlSize > 1) ? ($item->postType == "Video" ? $videoData = $mediaUrl : $mediaUrl) :  $mediaUrl );
                    $youtubeAction = '';
                        (in_array($item->_id, $scheduled_ids) ? $youtubeAction = "schedule_drat" : $youtubeAction = 'draft' );
                    @endphp
                    <a  href="/home/publishing/edit-with-youtube/{{$item->_id}}/{{$youtubeAction}}" class="btn btn-icon text-hover-info btn-sm" title="Edit with YouTube">
                    <span class="svg-icon svg-icon-md svg-icon-info">
                            <i class="fab fa-youtube"></i>
                    </span>
                    </a>
                        @endif
                </td>

            @endif
            @if($page_title === "history")
            <td>
{{--                <p class="font-weight-bold">--}}
{{--                    <a href="/home/publishing/schedule/post-detail/{{$item->_id}}" class="btn btn-icon btn-sm" title="Post Details">--}}
{{--                                                                <span class="svg-icon svg-icon-md svg-icon-info">--}}
{{--                                                                        <i class="fas fa-info-circle"></i>--}}
{{--                                                                </span>--}}
{{--                    </a>--}}
{{--                </p>--}}
                    <p class="font-weight-bold">
                        <a href="#" class="btn btn-icon btn-sm" data-toggle="modal" data-target="#tableInformationModal" onclick="openInfoModal('{{$item->_id}}','{{$timezones}}')">
                                                                    <span class="svg-icon svg-icon-md svg-icon-info">
                                                                        <i class="fas fa-info-circle"></i>
                                                                    </span>
                        </a>
                    </p>
                <!-- begin::Table Information modal-->
                <div class="modal fade info-modal-task" id="tableInformationModal" tabindex="-1" role="dialog"
                     aria-labelledby="informationModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title font-weight-bolder" id="approveModalLabel">Table Information</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <i aria-hidden="true" class="ki ki-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="table-responsive">
                                    <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
                                        <thead>
                                        <tr class="text-uppercase">
                                            <th style="min-width: 150px; font-size:13px;" class=""><span class="">Social Account</span></th>
                                            <th style="min-width: 150px; font-size:13px;">Status</th>
                                            <th style="min-width: 150px; font-size:13px;">Post Date</th>
                                            <th style="min-width: 150px; font-size:13px;">Post Link</th>
                                        </tr>
                                        </thead>


                                        <tbody id="lists">
                                        <div class="d-flex">
                                            <h4>Discription :  </h4>
                                            <h4 id="discription">  </h4>
                                        </div>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end::Table Information modal-->
            </td>

                @endif
        </tr>
    @endforeach
@endif

<script>
    // $('#multiple_urls_tag_id').tooltip();

    function openDeleteModel(id,type) {
        $('#delete_id').val(id);
        $('#typo').val(type);
    }

    function openInfoModal(id, timezone){
        $.ajax({
            type: "get",
            url: '/home/publishing/schedule/post-detail/'+id,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                // $("#informationModal").modal("show");
                if (response.data.code === 200){
                    let postDetails = '';
                    if (response.data.data.length > 0){
                        $('#discription').empty().append(' '+ response.data.data[0].publishedContentDetails);
                        $('#lists').empty();
                        let accountData = '';
                        response.data.data.map(element => {
                            if (response.account.length > 0){
                                response.account.map(accounts =>{
                                    if (accounts.account_id === element.accountId){
                                        let accountType = '';
                                        if (accounts.account_type === 1) {
                                            accountType = 'facebook';
                                        } else if (accounts.account_type === 2) {
                                            accountType = 'Facebook Pages';

                                        } else if (accounts.account_type === 9) {
                                            accountType = 'YouTube';

                                        } else if (accounts.account_type === 4) {
                                            accountType = 'Twitter';

                                        } else if (accounts.account_type === 16) {
                                            accountType = 'Tumblr';

                                        } else if (accounts.account_type === 11) {
                                            accountType = 'Pinterest';

                                        } else if (accounts.account_type === 12) {
                                            accountType = 'Instagram Business';

                                        } else if (accounts.account_type === 7) {
                                            accountType = 'LinkedIn';

                                        } else if (accounts.account_type === 5) {
                                            accountType = 'Instagram';
                                        }
                                        accountData = '';
                                        accountData += '                                                <div class="d-flex">\n' +
                                            '                                                    <div class="symbol symbol-50 symbol-light mr-5">\n' +
                                            '                                                <span class="symbol-label">\n' +
                                            '                                                    <img src="' + accounts.profile_pic_url + '" class="card-img-top" alt="avatar name">\n' +
                                            '                                                </span>\n' +
                                            '                                                    </div>\n' +
                                            '                                                    <div class="SB-accounts-section d-flex flex-column flex-grow-1 mr-2">\n' +
                                            '                                                        <a class="font-weight-bold font-size-lg mb-1 truncate">' + accounts.first_name + '</a>\n' +
                                            '                                                        <span class="text-muted font-weight-bold">' + accountType + '</span>\n' +
                                            '                                                    </div>\n' +
                                            '                                                </div>\n';
                                    }
                                })
                            }
                            postDetails = '' +
                                '<tr>\n' +
                                '                                            <td class="pl-0 py-8">\n' +
                                '\n' +accountData+
                                    '</td>'+
                                '                                            <td class="pr-0">\n' +
                                '                                                <p class="font-weight-bold">'+(element.PublishedStatus === "Success" ? "Success" : "-")+'</p>\n' +
                                '                                            </td>\n' +
                                '                                            <td class="pr-0">\n' +
                                '                                                <p class="font-weight-bold">'+new Date(element.publishedDate).toLocaleString("en-US", {timeZone: timezone})+'</p>\n' +
                                '                                            </td>\n' +
                                '                                            <td>\n' +
                                '                                                <p class="font-weight-bold">\n' +
                                '                                                    <a target="_blank" href="'+element.PublishedUrl+'">Click to view post</a>\n' +
                                '                                                </p>\n' +
                                '                                            </td>\n';

                            $('#lists').append(postDetails);
                        })
                    }else{
                        $('#lists').append("No Data Available");
                    }
                }else{
                    toastr.alert(response.message);
                }
            },
            error: function (error) {
                toastr.alert(error.message);
            }
        })
    }

    $(document).on('submit','#delete_post_form', function (e) {
        e.preventDefault();
        let id = $('#delete_id').val();
        let type = $('#typo').val();
        $.ajax({
            type: "delete",
            url: '/home/publishing/schedule/delete',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {id, type},
            success: function (response) {
                $("#deleteImageModal").modal("hide");
                if (response.code === 200){
                    toastr.success(response.message);
                    window.location.reload();
                }else{
                    toastr.alert(response.message);
                }
            },
            error: function (error) {
                toastr.alert(error.message);
            }
        })
    })
</script>