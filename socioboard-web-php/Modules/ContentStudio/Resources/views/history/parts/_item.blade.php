@if(isset($data) && $data)
    @foreach($data['data'] as $key => $item)

        <?php
            $pageSlug = $slug ? $slug : null;
        $mediaUrlSize = (isset($item->mediaUrl) && !empty($item->mediaUrl)) ? sizeof($item->mediaUrl) : 0 ;
            if(is_array($item->mediaUrl) && !empty($item->mediaUrl)){
                $mediaUrl = filter_var($item->mediaUrl[0], FILTER_VALIDATE_URL) ? $item->mediaUrl[0] : $site_url.$item->mediaUrl[0] ;
            } else{
                $mediaUrl = ($item->mediaUrl) ? (filter_var($item->mediaUrl, FILTER_VALIDATE_URL) ? $item->mediaUrl : $site_url.$item->mediaUrl) : null ;
            }
            if($page == "drafts") {
                $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : route('publish_content.draft-schedule-edit', $item->_id, $pageSlug);
            } elseif (($slug == "ready-queue") || ($slug == "day-wise-socioqueue")) {
                $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : route('publish_content.dayWise-SocioQueue', $item->_id, $pageSlug);
            } else {
                $action = !isset($item->scheduleStatus) ? route("publish_content.draft-edit", $item->_id) : route('publish_content.scheduling-edit', $item->_id, $pageSlug);
            }

            $title = strlen($item->description) > 30 ? substr($item->description, 0, 30)."..." : $item->description;
        ?>
        <tr>
            <td class="pl-0 py-8">
                <div class="d-flex align-items-center">
                    @if($mediaUrlSize > 1)
                        <div class="symbol symbol-50 flex-shrink-0 mr-4 ribbon ribbon-right">
                            <div class="ribbon-target bg-primary" style="top: 5px; right: -2px;" data-toggle="tooltip" id="multiple_urls_tag_id"
                                 title="Multiple post"><i class="fab fa-monero"></i></div>
                            @else
                                <div class="symbol symbol-50 flex-shrink-0 mr-4">
                                    @endif
                        <div class="symbol-label">
                            @if($item->postType == "Image")
                                <img src="{{$mediaUrl}}" alt="" style="height: inherit; width: inherit; object-fit: contain;">
                            @elseif($item->postType == "Video")
                                <video style="object-fit: contain;height: inherit; width: inherit;" autoplay muted>
                                  <source src="{{$mediaUrl}}">
                                Your browser does not support the video tag.
                                </video>
                            @endif
                        </div>
                    </div>
                    <div>
                        <a href="#" class="font-weight-bolder text-hover-primary mb-1 font-size-lg">
                            {{$title}}
                        </a>

                            @if(isset($item->postingSocialIds) && sizeof($item->postingSocialIds) > 0)
                                <span class="font-weight-bold d-block"> Posted -
                             @foreach($item->postingSocialIds as $v)
                             @if(in_array($v->accountId, $twitterAccountsIds)) <i class="fab fa-twitter fa-fw " data-toggle="tooltip" data-placement="top" title="Twitter"></i></i>
                                 @elseif(in_array($v->accountId, $facebookAccountsIds)) <i class="fab fa-facebook-f fa-fw " data-toggle="tooltip" data-placement="top" title="Facebook"></i>
                                 @elseif(in_array($v->accountId, $linkedInAccountsIds)) <i class="fab fa-facebook-f fa-linkedin fa-fw " data-toggle="tooltip" data-placement="top" title="LinkedIn"></i>
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
                                    @if(in_array($v, $twitterAccountsIds)) <i class="fab fa-twitter fa-fw " data-toggle="tooltip" data-placement="top" title="Twitter"></i></i>
                                    @elseif(in_array($v, $facebookAccountsIds)) <i class="fab fa-facebook-f fa-fw " data-toggle="tooltip" data-placement="top" title="Facebook"></i>
                                    @elseif(in_array($v, $linkedInAccountsIds)) <i class="fab fa-facebook-f fa-linkedin fa-fw " data-toggle="tooltip" data-placement="top" title="LinkedIn"></i>
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
                    {{ date("d-m-Y",strtotime($item->createdDate)) }}
                </span>
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

                    @if($page == "schedule")
                        @if( $slug && $slug == "drafts" )
                            {{ "Draft schedule" }}

                        @elseif ( $slug &&  $slug == "ready-queue" || $slug = "day-wise-socioqueue")
                            {{ "Active" }}
                        @endif
                    @endif
                </span>
            </td>
            <td class="pr-0">
                <a  href="{{ $action }}" class="btn btn-icon text-hover-info btn-sm">
                    <span class="svg-icon svg-icon-md svg-icon-info">
                            <i class="fas fa-pen-square"></i>
                    </span>
                </a>
            </td>
        </tr>
    @endforeach
@endif
<script>
    $('#multiple_urls_tag_id').tooltip();
</script>