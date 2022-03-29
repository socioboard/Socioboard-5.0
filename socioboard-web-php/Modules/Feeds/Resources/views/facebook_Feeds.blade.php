@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Facebook Feeds</title>
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
            <div class=" container-fluid">
                <!--begin::Profile-->
                <!--begin::Row-->
                <?php $regex = "#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#"; ?>
                <?php $urls = []; ?>
                <?php $imageCounts = 0; ?>
                <div class="row" data-sticky-container>
                    <div class="col-xl-4">
                        <div class="sticky" data-sticky="true" data-margin-top="180px" data-sticky-for="1023"
                             data-sticky-class="kt-sticky">
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
                                            <option value="{{$data->account_id}} {{$data->account_type}}">{{$data->first_name}}
                                            </option>
                                        @endforeach
                                    @elseif($message=== 'failed')
                                        <option selected value="failed"> Sorry some error ,occurred please reload page
                                        </option>
                                    @elseif($message=== 'No facebook Accounts added yet!')
                                        <option selected value="failed">Currently no Facebook Account has been added yet for this team or Account has been locked
                                        </option>
                                    @else
                                        <option selected value="failed"> {{$message}}
                                        </option>
                                    @endif
                                </select>
                            </div>
                            <!-- end:Accounts list -->
                            <!--begin::Profile-->
                            <div class="card card-custom gutter-b card-stretch" id="ss-accountsDiv">
                                @if($message=== 'success')
                                    @if(count($accounts)>0)
                                        <div
                                                class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                            <div class="ribbon-target bg-facebook" style="top: -2px; right: 20px;">
                                                <i class="fab fa-facebook-f"></i>
                                            </div>
                                            <!--begin::User-->
                                            <div class="d-flex align-items-center" id="facebookProfileDiv">
                                                <div
                                                        class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                    <div class="symbol-label"
                                                         style="background-image:url('{{$accounts[0]->profile_pic_url}}')"></div>
                                                    <i class="symbol-badge bg-success"></i>
                                                </div>
                                                <div>
                                                    @if($accounts[0]->account_type === 2)
                                                        <a href="https://www.facebook.com/{{$accounts[0]->user_name}}"
                                                           target="_blank">
                                                            {{$accounts[0]->first_name}} {{substr($accounts[0]->last_name, 0, 7)}}
                                                        </a>
                                                    @elseif($accounts[0]->account_type === 1)
                                                        <a>
                                                            {{$accounts[0]->first_name}} {{substr($accounts[0]->last_name, 0, 7)}}
                                                        </a>
                                                    @else
                                                        <a href="{{$accounts[0]->profile_url}}"
                                                           target="_blank">
                                                            {{$accounts[0]->first_name}} {{substr($accounts[0]->last_name, 0, 7)}}
                                                        </a>
                                                    @endif
                                                    <div class="text-muted">
                                                        {{$accounts[0]->user_name}}
                                                    </div>
                                                    <!-- begin:account star rating -->
                                                    <div class="rating-css">
                                                        <div class="star-icon">
                                                            <input type="radio"
                                                                   <?php if ($accounts[0]->rating === 1) echo "checked";?> name="rating1{{$accounts[0]->account_id}}"
                                                                   id="rating1{{$accounts[0]->account_id}}"
                                                                   onclick="ratingUpdate('1', '{{$accounts[0]->account_id}}}');">
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
                                                    @if($accounts[0]->account_type === 2)
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <span class="font-weight-bold mr-2">like Counts:</span>
                                                            <a href="javascript:;"
                                                               class=" text-hover-primary"
                                                               id="like_count">{{$feeds['data']->SocialAccountStats->total_like_count}}</a>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                            <span class=""
                                                                  id="follower_count">{{$feeds['data']->SocialAccountStats->follower_count}}</span>
                                                        </div>
                                                    @elseif($accounts[0]->account_type === 1)
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <span class="font-weight-bold mr-2">Followers :</span>
                                                            <a href="javascript:;"
                                                               class=" text-hover-primary"
                                                               id="follower_count">{{$feeds['data']->SocialAccountStats->friendship_count}}</a>
                                                        </div>
                                                        <div class="d-flex align-items-center justify-content-between mb-2">
                                                            <span class="font-weight-bold mr-2">Page Count:</span>
                                                            <span class=""
                                                                  id="page_count">{{$feeds['data']->SocialAccountStats->page_count}}</span>
                                                        </div>
                                                    @endif
                                                @endif
                                            </div>
                                            <!--end::Contact-->
                                        </div>
                                    @else
                                        <div class="text-center noFbFeedsDiv">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently no Facebook  Account has been added yet for this team or Account has been locked</h6>
                                        </div>
                                    @endif
                                @elseif($message=== 'falied')
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <h6>Sorry some error ,occurred please reload page</h6>
                                    </div>
                                @endif
                            </div>
                            <!--end::Profile-->
                        </div>

                    </div>
                    <div class="col-xl-8">
                        <!--begin::feeds-->
                        <div class="card card-custom gutter-b card-stretch" id="ss-feedsDiv">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Feeds</h3>
                            </div>
                            <div class="card-body" id="facebookFeeds">
                            @if(count($accounts)>0)
                                <!--begin::Text-->
                                    @if($feeds['code']=== 200)
                                        <?php $date = 0; ?>
                                        <script>
                                            var feedsLength = <?php echo count($feeds['data']->feeds)  ?>;
                                        </script>
                                        @if((count($feeds['data']->feeds))>0)
                                            @foreach($feeds['data']->feeds as $data)
                                                <?php $date = new Datetime($data->publishedDate);
                                                $date->setTimezone(new DateTimeZone('Asia/Calcutta'));
                                                preg_match_all('#\bhttps?://[^,\s()<>]+(?:\([\w\d]+\)|([^,[:punct:]\s]|/))#', $data->description, $urls);
                                                ?>
                                                <?php $string_desc = trim(preg_replace('/\r|\n/', ' ', $data->description));?>
                                                <?php  $string_desc = str_replace("'", '', $string_desc);;?>
                                                @if($data->postType !== 'profile_media'&& $data->postType !== 'cover_photo'&& $data->postType !== 'pages_share'&& $data->postType !== 'native_templates')
                                                    <div class="mb-5">
                                                        <div>
                                                            <div class="d-flex align-items-center pb-4">
                                                                <div class="symbol symbol-40 symbol-light-success mr-5">
                                                            <span class="symbol-label">
                                                                <img
                                                                        src="{{$feeds['data']->socialAccountDetails->profile_pic_url}}"
                                                                        class="h-75 align-self-end" alt=""/>
                                                            </span>
                                                                </div>
                                                                <div class="d-flex flex-column flex-grow-1">
                                                                    @if($accounts[0]->account_type === 2)
                                                                        <a href="https://www.facebook.com/{{$accounts[0]->user_name}}"
                                                                           class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv"
                                                                           target="_blank">
                                                                            {{$feeds['data']->socialAccountDetails->first_name}}
                                                                        </a>
                                                                    @elseif($accounts[0]->account_type === 1)
                                                                        <a class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">
                                                                            {{$feeds['data']->socialAccountDetails->first_name}}
                                                                        </a>
                                                                    @endif
                                                                    <span
                                                                            class="text-muted font-weight-bold">{{$date->format('Y-m-d')}} {{$date->format('H:i:s')}}</span>
                                                                </div>
                                                            </div>
                                                            @if(count($data->mediaUrls)>0)
                                                                @if($data->postType === 'photo')
                                                                    <div class="pt-4">
                                                                        @foreach($data->mediaUrls as $image)
                                                                            <div class="">
                                                                                <img src="{{$image}}"
                                                                                     class="img-fluid"/>
                                                                            </div>
                                                                        @endforeach
                                                                    <!--begin::Text-->
                                                                        <p class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                            <strong class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                                <?php echo preg_replace($regex, ' ', $string_desc); ?>
                                                                            </strong>
                                                                            @if(count($urls[0])>0)
                                                                                <br>
                                                                                @foreach($urls[0] as $data2)
                                                                                    <a href="{{$data2}}"
                                                                                       class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                                       target=_blank>
                                                                                        {{$data2}}</a>
                                                                                @endforeach
                                                                            @endif
                                                                        </p>
                                                                        @else
                                                                            <div class="pt-4">

                                                                                <!--begin::Video-->
                                                                                @foreach($data->mediaUrls as $video)
                                                                                    <div
                                                                                            class="embed-responsive embed-responsive-16by9">
                                                                                        <iframe class="embed-responsive-item rounded"
                                                                                                src="{{$video}}"
                                                                                                allowfullscreen=""></iframe>
                                                                                    </div>
                                                                                @endforeach
                                                                            <!--end::Video-->

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
                                                                                @endif
                                                                                @else
                                                                                    <div>
                                                                                        @if($data->postType === 'share')
                                                                                            <strong class="font-size-lg font-weight-normal pt-5 mb-2">
                                                                                                {{$data->description}}
                                                                                            </strong>
                                                                                            <br>
                                                                                            <a href="{{$data->sharedUrl}}"
                                                                                               class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links"
                                                                                               target=_blank>
                                                                                                {{$data->sharedUrl}}</a>
                                                                                            <br>
                                                                                        @else
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
                                                                                    @endif
                                                                                    @endif

                                                                                    <!--end::Text-->
                                                                                        <!--begin::Action-->
                                                                                        <div class="d-flex align-items-center">
                                                                                            @if($accounts[0]->account_type === 2)
                                                                                                <a href="javascript:;"
                                                                                                   class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">
                                                                <span
                                                                        class="svg-icon svg-icon-md svg-icon-primary pr-2">
                                                                        <i class="fas fa-comments"></i>
                                                                    {{$data->commentCount}}
                                                                </span>
                                                                                                </a>

                                                                                                @if($data->isLiked === false)
                                                                                                    <a href="javascript:;"
                                                                                                       data-value="{{$data->postId}}"
                                                                                                       class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5"
                                                                                                       onclick="likeFeed('{{$data->postId}}')">
                                                                <span data-value="{{$data->postId}}"
                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"
                                                                      like-count="{{$data->likeCount}}">
                                                                        <i class="fas fa-heart"></i>
                                                                    {{$data->likeCount}}
                                                                </span>
                                                                                                    </a>
                                                                                                @else
                                                                                                    <a href="javascript:;"
                                                                                                       data-value="{{$data->postId}}"
                                                                                                       class="btn btn-icon-danger btn-sm  bg-hover-light-danger btn-hover-text-danger rounded font-weight-bolder font-size-sm p-2 mr-5"
                                                                                                       onclick="disLikeFeed('{{$data->postId}}')">
                                                                <span data-value="{{$data->postId}}"
                                                                      class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"
                                                                      like-count="{{$data->likeCount}}">
                                                                        <i class="fas fa-heart"
                                                                        ></i>
                                                                    {{$data->likeCount}}
                                                                </span>
                                                                                                    </a>
                                                                                                @endif

                                                                                                @if(count($data->mediaUrls)>0)
                                                                                                    @if(count($data->mediaUrls)>1)
                                                                                                        <?php $imageCounts = count($data->mediaUrls)?>
                                                                                                    @else
                                                                                                        <?php $imageCounts = 0?>
                                                                                                    @endif
                                                                                                    @if($data->postType === 'photo'||$data->postType === 'album')
                                                                                                        <?php $type = 'image'?>
                                                                                                    @else
                                                                                                        <?php $type = 'video'?>
                                                                                                    @endif
                                                                                                    @if(count($urls[0])>0)
                                                                                                        <a id="reSocioButton"
                                                                                                           href="javascript:;"
                                                                                                           value="{{$data->description}}"
                                                                                                           imageSrc="#"
                                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->mediaUrls[0]}}','{{$type}}',null,'{{$urls[0][0]}}',{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                                        </a>
                                                                                                    @else
                                                                                                        <a id="reSocioButton"
                                                                                                           href="javascript:;"
                                                                                                           value="{{$data->description}}"
                                                                                                           imageSrc="#"
                                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->mediaUrls[0]}}','{{$type}}',null,null,{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                                        </a>
                                                                                                    @endif

                                                                                                @elseif($data->postType === 'share')
                                                                                                    <a id="reSocioButton"
                                                                                                       href="javascript:;"
                                                                                                       value="{{$data->description}}"
                                                                                                       imageSrc="#"
                                                                                                       class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                                       onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,'{{$data->sharedUrl}}',{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                                    </a>
                                                                                                @else
                                                                                                    @if(count($urls[0])>0)
                                                                                                        <a id="reSocioButton"
                                                                                                           href="javascript:;"
                                                                                                           value="{{$data->description}}"
                                                                                                           imageSrc="#"
                                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,'{{$urls[0][0]}}',{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                                        </a>
                                                                                                    @else
                                                                                                        <a id="reSocioButton"
                                                                                                           href="javascript:;"
                                                                                                           value="{{$data->description}}"
                                                                                                           imageSrc="#"
                                                                                                           class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                                           onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,null,{{$imageCounts}})">
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
                                                                                    <!--end::Body-->
                                                                            </div>
                                                                            <div class="fb_cmt_div">
                                                                                <!--end::Container-->
                                                                                <!--begin::Editor-->
                                                                                <form class="position-relative">
                                                    <textarea class="form-control border-0 pr-10 resize-none"
                                                              rows="1" placeholder="Reply..."
                                                              name="{{$data->postId}}"></textarea>

                                                                                    <div name="{{$data->postId}}"
                                                                                         id="commentButton"
                                                                                         class="position-absolute top-0 right-0 mt-1 mr-n2">
                                                            <span class="btn btn-icon btn-sm btn-hover-icon-primary">
                                                                    <i class="fas fa-paper-plane"></i>
                                                            </span>
                                                                                    </div>
                                                                                </form>
                                                                                <!--edit::Editor-->
                                                                            </div>
                                                                            @else
                                                                                @if(count($data->mediaUrls)>0)
                                                                                    @if($data->postType === 'photo'||$data->postType === 'album')
                                                                                        <?php $type = 'image'?>
                                                                                    @else
                                                                                        <?php $type = 'video'?>
                                                                                    @endif
                                                                                    <a id="reSocioButton"
                                                                                       href="javascript:;"
                                                                                       value="{{$data->description}}"
                                                                                       imageSrc="#"
                                                                                       class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                       onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>','{{$data->mediaUrls[0]}}','{{$type}}',null,null,{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                    </a>
                                                                                @else
                                                                                    <a id="reSocioButton"
                                                                                       href="javascript:;"
                                                                                       value="{{$string_desc}}"
                                                                                       imageSrc="#"
                                                                                       class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 reSocioButtonClass"
                                                                                       onclick="resocioButton('<?php echo preg_replace($regex, ' ', $string_desc); ?>',null,null,null,null,{{$imageCounts}})">
                                                                                    <span
                                                                                            class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">
                                                                        <i class="fas fa-pencil-alt"></i>
                                                                </span>Re-socio
                                                                                    </a>
                                                                                @endif
                                                                            @endif
                                                                    </div>
                                                                    <!--end::Text-->
                                                                    <hr>
                                                                @endif
                                                                @endforeach
                                                            @else
                                                                <div class="text-center noFbFeedsDiv">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6> Currently no Facebook Feeds has been found for this
                                                                        Account</h6>
                                                                </div>
                                                            @endif
                                                            @elseif($feeds['code']=== 400)
                                                                <div class="text-center">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6> Error Occured : {{$feeds['message']}}</h6>
                                                                </div>
                                                            @endif
                                                            @else
                                                                <div class="text-center noFbFeedsDiv">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6>
                                                                        Currently no Facebook Account has  been added for
                                                                        this
                                                                        team yet or Account has been locked</h6>
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
                {{--                <script src="{{asset('js/contentStudio/search.js')}}"></script>--}}
                <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
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
                    });

                    // begin:normal post emoji
                    $("#normal_post_area").emojioneArea({
                        pickerPosition: "right",
                        tonesStyle: "bullet"
                    });


                    let pageId = 2;
                    $(window).scroll(function () {
                        if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                            if (feedsLength >= 12) {
                                getNextFacebookFeeds(accounId, pageId, accountType);
                                pageId++;
                            }
                        }
                    });


                    /**
                     * TODO we've to get  the next  feeds of facebook account on change of accounts from dropdown.
                     * This function is used for the next  feeds of facebook account on change of accounts from dropdown.
                     * @param {integer} accid- account id of that particular facebook account.
                     * ! Do not change this function without referring API format of getting the facebook feeds.
                     */
                    function getfacebookFeeds(accid, pageId, acctype) {
                        let publishedDate = 0;
                        $.ajax({
                            type: 'get',
                            url: '/get-next-facebook-feeds',
                            data: {
                                accid, pageId, acctype,
                            },
                            dataType: 'json',
                            beforeSend: function () {
                                $('#follower_counts-div').empty();
                                $('#facebookProfileDiv').empty();
                                $('#facebookFeeds').empty().append('<div class="d-flex justify-content-center" >\n' +
                                    '        <div class="spinner-border" id="' + pageId + '"  role="status"  style="display: none;">\n' +
                                    '            <span class="sr-only">Loading...</span>\n' +
                                    '        </div>\n' +
                                    '        </div>');
                                $(".spinner-border").css("display", "block");
                            },
                            success: function (response) {
                                if ($('#errorDIv').length) {
                                    $('#errorDIv').empty();
                                }
                                $(".spinner-border").css("display", "none");
                                let append = '';
                                let appendData2 = '';
                                let multiImageCount = 0;
                                if (response.data.code === 200) {
                                    append += ' <div\n' +
                                        'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                        '<div class="symbol-label"\n' +
                                        'style="background-image:url(' + response.data.data.socialAccountDetails.profile_pic_url + ')"></div>\n' +
                                        '<i class="symbol-badge bg-success"></i>\n' +
                                        '</div>\n' +
                                        '<div>\n';
                                    if (response.data.data.socialAccountDetails.account_type === 2) {
                                        append += '<a href="https://www.facebook.com/' + response.data.data.socialAccountDetails.user_name + '"  target="_blank"\n' +
                                            'class="font-weight-bolder font-size-h5 text-hover-primary postLinkClassDiv"\n' +
                                            '>\n' + response.data.data.socialAccountDetails.first_name +
                                            '<i\n' +
                                            'class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                                            '</a>\n';
                                    } else if (response.data.data.socialAccountDetails.account_type === 1) {
                                        append += '<a \n' +
                                            'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                            '>\n' + response.data.data.socialAccountDetails.first_name +
                                            '<i\n' +
                                            'class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                                            '</a>\n';

                                    } else {
                                        append += '<a href="' + response.data.data.socialAccountDetails.profile_url + '"  target="_blank"\n' +
                                            'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                            '>\n' + response.data.data.socialAccountDetails.first_name +
                                            '<i\n' +
                                            'class="flaticon2-correct text-primary icon-md ml-2"></i>\n' +
                                            '</a>\n';
                                    }
                                    append += '<div class="text-muted">\n' + response.data.data.socialAccountDetails.user_name +
                                        '</div>\n' +
                                        '<div class="rating-css">\n' +
                                        '<div class="star-icon">\n';
                                    (response.data.data.socialAccountDetails.rating === 1) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating1' + accid + '" onclick="ratingUpdate(\'1\', ' + accid + ');">\n' +
                                        '<label for="rating1' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating' + accid + '" id="rating1' + accid + '" onclick="ratingUpdate(\'1\', ' + accid + ');">\n' +
                                        '<label for="rating1' + accid + '" class="fas fa-star"></label>\n';
                                    (response.data.data.socialAccountDetails.rating === 2) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating2' + accid + '" onclick="ratingUpdate(\'2\', ' + accid + ');">\n' +
                                        '<label for="rating2' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating2' + accid + '" onclick="ratingUpdate(\'2\', ' + accid + ');">\n' +
                                        '<label for="rating2' + accid + '" class="fas fa-star"></label>\n';
                                    (response.data.data.socialAccountDetails.rating === 3) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating3' + accid + '" onclick="ratingUpdate(\'3\', ' + accid + ');">\n' +
                                        '<label for="rating3' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating3' + accid + '" onclick="ratingUpdate(\'3\', ' + accid + ');">\n' +
                                        '<label for="rating3' + accid + '" class="fas fa-star"></label>\n';
                                    (response.data.data.socialAccountDetails.rating === 4) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating4' + accid + '" onclick="ratingUpdate(\'4\', ' + accid + ');">\n' +
                                        '<label for="rating4' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating4' + accid + '" onclick="ratingUpdate(\'4\', ' + accid + ');">\n' +
                                        '<label for="rating4' + accid + '" class="fas fa-star"></label>\n';
                                    (response.data.data.socialAccountDetails.rating === 5) ? append += '<input type="radio" checked name="rating1' + accid + '" id="rating5' + accid + '" onclick="ratingUpdate(\'5\', ' + accid + ');">\n' +
                                        '<label for="rating5' + accid + '" class="fas fa-star"></label>\n' : append += ' <input type="radio"  name="rating1' + accid + '" id="rating5' + accid + '" onclick="ratingUpdate(\'5\', ' + accid + ');">\n' +
                                        '<label for="rating5' + accid + '" class="fas fa-star"></label>\n';
                                    append += '</div>\n' +
                                        '</div>\n' +
                                        '</div>'
                                    $('#facebookProfileDiv').append(append);
                                    if (response.data.data.socialAccountDetails.account_type === 1) {
                                        appendData2 = '<div class="d-flex align-items-center justify-content-between mb-2">\n' +
                                            '<span class="font-weight-bold mr-2">Followers :</span>\n' +
                                            '<a href="javascript:;" class=" text-hover-primary"\n' +
                                            'id="follower_count">' + response.data.data.SocialAccountStats.friendship_count + '</a>\n' +
                                            '</div>\n' +
                                            '<div class="d-flex align-items-center justify-content-between mb-2">\n' +
                                            '<span class="font-weight-bold mr-2">Page Count:</span>\n' +
                                            '<span class=""\n' +
                                            'id="page_count">' + response.data.data.SocialAccountStats.page_count + '</span>\n' +
                                            '</div>';
                                        $('#follower_counts-div').append(appendData2);
                                    } else if (response.data.data.socialAccountDetails.account_type === 2) {
                                        appendData2 = '<div class="d-flex align-items-center justify-content-between mb-2">\n' +
                                            '<span class="font-weight-bold mr-2">like Counts:</span>\n' +
                                            '<a href="javascript:;"\n' +
                                            'class=" text-hover-primary"\n' +
                                            'id="like_count">' + response.data.data.SocialAccountStats.total_like_count + '</a>\n' +
                                            '</div>\n' +
                                            '<div class="d-flex align-items-center justify-content-between mb-2">\n' +
                                            '<span class="font-weight-bold mr-2">Followers:</span>\n' +
                                            '<span class=""\n' +
                                            'id="follower_count">' + response.data.data.SocialAccountStats.follower_count + '</span>\n' +
                                            '</div>';
                                        $('#follower_counts-div').append(appendData2);
                                    }
                                    $(".spinner-border").css("display", "none");
                                    if (response.data.code === 200) {
                                        let appendData = '';
                                        let num = 1;
                                        let undfinedFeeds = 1;
                                        let urlsFromDesc = '';
                                        $(".spinner-border").css("display", "none");
                                        feedsLength = response.data.data.feeds.length;
                                        if (feedsLength > 0) {
                                            response.data.data.feeds.map(element => {
                                                urlsFromDesc = '';
                                                let desc = element.description.replace(/(\r\n|\n|\r)/gm, "");
                                                desc = desc.replace("'", '');
                                                urlsFromDesc = getUrlsFromDesc(element.description);
                                                if (element.postType !== 'profile_media' && element.postType !== 'cover_photo' && element.postType !== 'pages_share' && element.postType !== 'native_templates') {
                                                    publishedDate = String(new Date(element.publishedDate)).substring(0, 25);
                                                    appendData = '<div class="mb-5">\n' +
                                                        '<div>\n' +
                                                        '<div class="d-flex align-items-center pb-4">\n' +
                                                        '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                                        '<span class="symbol-label">\n' +
                                                        '<img\n' +
                                                        'src="' + response.data.data.socialAccountDetails.profile_pic_url + '"\n' +
                                                        'class="h-75 align-self-end" alt=""/>\n' +
                                                        '</span></div>\n' +
                                                        '<div class="d-flex flex-column flex-grow-1">\n';
                                                    if (response.data.data.socialAccountDetails.account_type === 2) {
                                                        appendData += '<a href="https://www.facebook.com/' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                                            'target="_blank" class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">' + response.data.data.socialAccountDetails.first_name + '</a>\n';
                                                    } else {
                                                        appendData += '<a target="_blank" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">' + response.data.data.socialAccountDetails.first_name + '</a>\n';
                                                    }
                                                    appendData += '<span class="text-muted font-weight-bold">' + publishedDate + '</span>';
                                                    appendData += '</div></div>\n';
                                                    if (element.mediaUrls.length > 0) {
                                                        if (element.postType === 'photo') {
                                                            appendData += '<div class="pt-4">';
                                                            element.mediaUrls.map(image => {
                                                                appendData += '<div class="">\n' +
                                                                    '<img src="' + image + '"\n' +
                                                                    'class="img-fluid"/>\n' +
                                                                    '</div>'
                                                            });
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
                                                        } else if (element.postType === 'album') {
                                                            appendData += '<div class="pt-4"><div id="image-gallery' + num + '"></div>';
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
                                                        } else {
                                                            appendData += '<div class="pt-4">';
                                                            element.mediaUrls.map(video => {
                                                                appendData += ' <div\n' +
                                                                    'class="embed-responsive embed-responsive-16by9">\n' +
                                                                    '<iframe class="embed-responsive-item rounded"\n' +
                                                                    'src="' + video + '"\n' +
                                                                    'allowfullscreen=""></iframe>\n' +
                                                                    '</div>';

                                                            });
                                                            if (element.postType === 'share') {
                                                                appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                                    element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                    '</strong><br>\n' +
                                                                    '<a href="' + element.sharedUrl + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + element.sharedUrl +
                                                                    '</a><br>\n';
                                                            } else {
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
                                                            }
                                                        }
                                                    } else {
                                                        appendData += '<div>\n';
                                                        if (element.postType === 'share') {
                                                            appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                                element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                '</strong><br>\n' +
                                                                '<a href="' + element.sharedUrl + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + element.sharedUrl +
                                                                '</a><br>\n';
                                                        } else {
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
                                                        }
                                                    }
                                                    appendData += '<div class="d-flex align-items-center">\n';
                                                    if (response.data.data.socialAccountDetails.account_type === 2) {
                                                        appendData += '<a href="javascript:;"\n' +
                                                            'class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">\n' +
                                                            '<span\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-primary pr-2">\n' +
                                                            '<i class="fas fa-comments"></i>\n' +
                                                            element.commentCount +
                                                            '</span></a>\n';
                                                        if (element.isLiked === false) {
                                                            appendData += '<a href="javascript:;" data-value="' + element.postId + '"\n' +
                                                                'class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                                                'onclick="likeFeed(\'' + element.postId + '\')">\n' +
                                                                '<span data-value="' + element.postId + '"\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                                                'like-count="' + element.likeCount + '">\n' +
                                                                '<i class="fas fa-heart"></i>\n' + element.likeCount +
                                                                '</span></a>\n';
                                                        } else {
                                                            appendData += '<a href="javascript:;" data-value="' + element.postId + '"\n' +
                                                                'class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                                                'onclick="disLikeFeed(\'' + element.postId + '\')">\n' +
                                                                '<span data-value="' + element.postId + '"\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                                                'like-count="' + element.likeCount + '">\n' +
                                                                '<i class="fas fa-heart"></i>\n' + element.likeCount +
                                                                '</span></a>\n';
                                                        }
                                                        if (element.mediaUrls.length > 0) {
                                                            if (element.mediaUrls.length > 1) {
                                                                multiImageCount = element.mediaUrls.length;
                                                            } else {
                                                                multiImageCount = 0;
                                                            }
                                                            let type = '';
                                                            if (element.postType === 'photo' || element.postType === 'album') {
                                                                type = 'image';
                                                            } else {
                                                                type = 'video';
                                                            }
                                                            if (urlsFromDesc !== null) {
                                                                appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '" href="javascript:;"\n' +
                                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + type + '\',null,\'' + urlsFromDesc[0]
                                                                    + '\', ' + multiImageCount + ' )"\n' +
                                                                    '<span\n' +
                                                                    'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                                    '</span>Re-socio</a>\n';
                                                            } else {
                                                                appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '" href="javascript:;"\n' +
                                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + type + '\',null,null,\'' + multiImageCount + '\')"\n' +
                                                                    '<span\n' +
                                                                    'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                                    '</span>Re-socio</a>\n';
                                                            }
                                                        } else if (element.postType === 'share') {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.sharedUrl + '\')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
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
                                                                appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '" href="javascript:;"\n' +
                                                                    'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                                                    '<span\n' +
                                                                    'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                    '<i class="fas fa-pencil-alt"></i>\n' +
                                                                    '</span>Re-socio</a>\n';
                                                            }

                                                        }
                                                    }
                                                    appendData += '</div>\n' +
                                                        '</div>\n' +
                                                        '</div>\n' +
                                                        '<div class="fb_cmt_div">\n' +
                                                        '<form class="position-relative">\n' +
                                                        '<textarea class="form-control border-0 pr-10 resize-none"\n' +
                                                        'rows="1" placeholder="Reply..."\n' +
                                                        'name="' + element.postId + '"></textarea>\n' +
                                                        '<div name="' + element.postId + '"\n' +
                                                        'value="' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                                        'id="commentButton"\n' +
                                                        'class="position-absolute top-0 right-0 mt-1 mr-n2">\n' +
                                                        '<span class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                                        '<i class="fas fa-paper-plane"></i>\n' +
                                                        '</span></div></form></div>\n';
                                                } else {
                                                    if (element.mediaUrls.length > 0) {
                                                        if (element.mediaUrls.length > 1) {
                                                            multiImageCount = element.mediaUrls.length;
                                                        } else {
                                                            multiImageCount = 0;
                                                        }
                                                        let type = '';
                                                        if (element.postType === 'photo' || element.postType === 'album') {
                                                            type = 'image';
                                                        } else {
                                                            type = 'video';
                                                        }
                                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + type + '\',null,null,' + multiImageCount + ')"\n' +
                                                            '<span\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio</a>\n';
                                                    } else {
                                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null,' + multiImageCount + ')"\n' +
                                                            '<span\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio</a>\n';
                                                    }

                                                }
                                                appendData += '</div><hr>\n';
                                                $('#facebookFeeds').append(appendData);
                                                $('div#image-gallery' + num).imagesGrid({
                                                    images: element?.mediaUrls
                                                });
                                                num++;
                                            });
                                        } else {
                                            undfinedFeeds++;
                                        }
                                        if (undfinedFeeds === feedsLength) {
                                            $('#facebookFeeds').append('<div class="text-center">\n' +
                                                '<div class="symbol symbol-150">\n' +
                                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                                '</div>\n' +
                                                '<h6>\n' +
                                                'Currently no Facebook Feeds has been found for\n' +
                                                'this\n' +
                                                'Account</h6>\n' +
                                                '</div>');
                                        }
                                    } else if (response.data.code === 400) {
                                        $('#facebookFeeds').append('<div class="text-center">\n' +
                                            '<div class="symbol symbol-150">\n' +
                                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                            '</div>\n' +
                                            '<h6>\n' + "Can not get feeds, as : " + response.data.error +
                                            '</h6></div>');
                                    } else {
                                        $('#facebookFeeds').append(' <div style="color: red;text-align:center;">\n' +
                                            "Some error occured can get feeds" +
                                            '</div>');
                                    }
                                }
                                else if (response.data.code === 400) {
                                    $('#facebookFeeds').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>\n' +
                                        '<h6>\n' + "Can not get feeds, as : " + response.data.error +
                                        '</h6></div>');
                                    $('#facebookProfileDiv').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>\n' +
                                        '<h6>\n' + "Can not get feeds, as : " + response.data.error +
                                        '</h6></div>');
                                } else {
                                    $('#facebookProfileDiv').append(' <div style="color: red;text-align:center;">\n' +
                                        "Some error occured can get feeds" +
                                        '</div>');
                                    $('#facebookFeeds').append(' <div style="color: red;text-align:center;">\n' +
                                        "Some error occured can get feeds" +
                                        '</div>');
                                }
                            }
                        });
                    }

                    /**
                     * TODO we've to get  the next  feeds of facebook account on pagination.
                     * This function is used for getting next feeds from particular facebook account,on pagination.
                     * @param {integer} accid- account id of that particular facebook account.
                     * ! Do not change this function without referring API format of getting the facebook feeds.
                     */
                    function getNextFacebookFeeds(accid, pageId, acctype) {
                        let publishedDate = 0;
                        $.ajax({
                            type: 'get',
                            url: '/get-next-facebook-feeds',
                            data: {
                                accid, pageId, acctype,
                            },
                            dataType: 'json',
                            beforeSend: function () {
                            },
                            success: function (response) {
                                if (response.data.code === 200) {
                                    if (response.data.code === 200) {
                                        let appendData = '';
                                        let num = 1;
                                        let urlsFromDesc2 = '';
                                        let multiImageCount = 0;
                                        $(".spinner-border").css("display", "none");
                                        feedsLength = response.data.data.feeds.length;
                                        response.data.data.feeds.map(element => {
                                            urlsFromDesc2 = '';
                                            let desc = element.description.replace(/(\r\n|\n|\r)/gm, "");
                                            desc = desc.replace("'", '');
                                            urlsFromDesc2 = getUrlsFromDesc(element.description);
                                            if (element.postType !== 'profile_media' && element.postType !== 'cover_photo' && element.postType !== 'pages_share' && element.postType !== 'native_templates') {
                                                publishedDate = String(new Date(element.publishedDate)).substring(0, 25);
                                                appendData = '<div class="mb-5"><div>\n' +
                                                    '<div class="d-flex align-items-center pb-4">\n' +
                                                    '<div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                                    '<span class="symbol-label"><img\n' +
                                                    'src="' + response.data.data.socialAccountDetails.profile_pic_url + '"\n' +
                                                    'class="h-75 align-self-end" alt=""/>\n' +
                                                    '</span></div>\n' +
                                                    '<div class="d-flex flex-column flex-grow-1">\n';
                                                if (response.data.data.socialAccountDetails.account_type === 2) {
                                                    appendData += '<a href="https://www.facebook.com/' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                                        'target="_blank" class="text-hover-primary mb-1 font-size-lg font-weight-bolder postLinkClassDiv">' + response.data.data.socialAccountDetails.first_name + '</a>\n';
                                                } else {
                                                    appendData += '<a target="_blank" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">' + response.data.data.socialAccountDetails.first_name + '</a>\n';
                                                }
                                                appendData += '<span class="text-muted font-weight-bold">' + publishedDate + '</span>' +
                                                    '</div></div>\n';
                                                if (element.mediaUrls.length > 0) {
                                                    if (element.mediaUrls.length > 1) {
                                                        multiImageCount = element.mediaUrls.length;
                                                    } else {
                                                        multiImageCount = 0;
                                                    }
                                                    if (element.postType === 'photo') {
                                                        appendData += '<div class="pt-4">';
                                                        element.mediaUrls.map(image => {
                                                            appendData += '<div class=""><img src="' + image + '" class="img-fluid"/></div>'
                                                        });
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                                + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                '</strong><br>\n' +
                                                                '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                                '</a>';
                                                        } else {
                                                            appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                '</p>';
                                                        }
                                                        '                                                                </p>';
                                                    } else if (element.postType === 'album') {
                                                        appendData += '<div class="pt-4"><div id="image-gallery' + num + '"></div>';
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                                + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                '</strong><br>\n' +
                                                                '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                                '</a>';
                                                        } else {
                                                            appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                '</p>';
                                                        }
                                                    } else {
                                                        appendData += '<div class="pt-4">';
                                                        element.mediaUrls.map(video => {
                                                            appendData += ' <div\n' +
                                                                'class="embed-responsive embed-responsive-16by9">\n' +
                                                                '<iframe class="embed-responsive-item rounded"\n' +
                                                                'src="' + video + '"\n' +
                                                                'allowfullscreen=""></iframe>\n' +
                                                                '</div>';

                                                        });
                                                        if (element.postType === 'share') {
                                                            appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                                element.description +
                                                                '</strong><br>\n' +
                                                                '<a href="' + element.sharedUrl + '" class="font-size-lg font-weight-normal pt-5 mb-2" target = _blank>\n' + element.sharedUrl +
                                                                '</a><br>\n';
                                                        } else {
                                                            if (urlsFromDesc2 !== null) {
                                                                appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                                    + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                    '</strong><br>\n' +
                                                                    '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                                    '</a>';
                                                            } else {
                                                                appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                                    '</p>';
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    if (urlsFromDesc2 !== null) {
                                                        appendData += '<strong class="font-size-lg font-weight-normal pt-5 mb-2">\n'
                                                            + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                            '</strong><br>\n' +
                                                            '<a href="' + urlsFromDesc2 + '" class="font-size-lg font-weight-normal pt-5 mb-2 linkedin-links" target = _blank>\n' + urlsFromDesc2 +
                                                            '</a>';
                                                    } else {
                                                        appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' + element.description.replace(/\n/g, '').replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') +
                                                            '</p>';
                                                    }
                                                }
                                                appendData += '<div class="d-flex align-items-center">\n';
                                                if (response.data.data.socialAccountDetails.account_type === 2) {
                                                    appendData += '<a href="javascript:;"\n' +
                                                        'class="btn btn-hover-text-primary btn-hover-icon-primary btn-sm bg-light-primary rounded font-weight-bolder font-size-sm p-2 mr-5 fb_cmt_btn">\n' +
                                                        '<span\n' +
                                                        'class="svg-icon svg-icon-md svg-icon-primary pr-2">\n' +
                                                        '<i class="fas fa-comments"></i>\n' +
                                                        element.commentCount +
                                                        '</span></a>\n';
                                                    if (element.isLiked === false) {
                                                        appendData += '<a href="javascript:;" data-value="' + element.postId + '"\n' +
                                                            'class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                                            'onclick="likeFeed(\'' + element.postId + '\')">\n' +
                                                            '<span data-value="' + element.postId + '"\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                                            'like-count="' + element.likeCount + '">\n' +
                                                            '<i class="fas fa-heart"></i>\n' + element.likeCount +
                                                            '</span></a>\n';
                                                    } else {
                                                        appendData += '<a href="javascript:;" data-value="' + element.postId + '"\n' +
                                                            'class="btn btn-hover-text-danger btn-hover-icon-danger btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 mr-5 "\n' +
                                                            'onclick="disLikeFeed(\'' + element.postId + '\')">\n' +
                                                            '<span data-value="' + element.postId + '"\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-2"\n' +
                                                            'like-count="' + element.likeCount + '">\n' +
                                                            '<i class="fas fa-heart"></i>\n' + element.likeCount +
                                                            '</span></a>\n';
                                                    }
                                                    if (element.mediaUrls.length > 0) {
                                                        if (element.mediaUrls.length > 1) {
                                                            multiImageCount = element.mediaUrls.length;
                                                        } else {
                                                            multiImageCount = 0;
                                                        }
                                                        let postType = '';
                                                        if (element.postType === 'photo' || element.postType === 'album') {
                                                            postType = 'image'
                                                        } else {
                                                            postType = 'video'
                                                        }
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + postType + '\',null,\'' + urlsFromDesc2[0]
                                                                + '\','+multiImageCount+')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        } else {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + postType + '\',null,null,'+multiImageCount+')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        }
                                                    } else if (element.postType === 'share') {
                                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.sharedUrl + '\')"\n' +
                                                            '<span\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio</a>\n';
                                                    } else {
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + urlsFromDesc2[0]
                                                                + '\')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        } else {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        }

                                                    }
                                                    appendData += '</div>\n' +
                                                        '</div></div>\n' +
                                                        '<div class="fb_cmt_div">\n' +
                                                        '<form class="position-relative">\n' +
                                                        '<textarea class="form-control border-0 pr-10 resize-none"\n' +
                                                        'rows="1" placeholder="Reply..."\n' +
                                                        'name="' + element.postId + '"></textarea>\n' +
                                                        '<div name="' + element.postId + '"\n' +
                                                        'value="' + response.data.data.socialAccountDetails.user_name + '"\n' +
                                                        'id="commentButton"\n' +
                                                        'class="position-absolute top-0 right-0 mt-1 mr-n2">\n' +
                                                        '<span class="btn btn-icon btn-sm btn-hover-icon-primary">\n' +
                                                        '<i class="fas fa-paper-plane"></i>\n' +
                                                        '</span></div></form></div>\n';
                                                } else {
                                                    if (element.mediaUrls.length > 0) {
                                                        if (element.mediaUrls.length > 1) {
                                                            multiImageCount = element.mediaUrls.length;
                                                        } else {
                                                            multiImageCount = 0;
                                                        }
                                                        let type2 = '';
                                                        if (element.postType === 'photo' || element.postType === 'album') {
                                                            type2 = 'image'
                                                        } else {
                                                            type2 = 'video'
                                                        }
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + type2 + '\',null,\'' + urlsFromDesc2[0]
                                                                + '\','+multiImageCount+')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        } else {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',\'' + element.mediaUrls[0] + '\',\'' + type2 + '\',null,null,'+multiImageCount+')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        }

                                                    } else if (element.postType === 'share') {
                                                        appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + element.sharedUrl + '\')"\n' +
                                                            '<span\n' +
                                                            'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio</a>\n';
                                                    } else {
                                                        if (urlsFromDesc2 !== null) {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,\'' + urlsFromDesc2[0]
                                                                + '\')"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        } else {
                                                            appendData += '<a id="reSocioButton" value="' + element.description.replace(/\n/g, '') + '" href="javascript:;"\n' +
                                                                'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2 reSocioButtonClass" onclick="resocioButton(\'' + desc.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') + '\',null,null,null,null)"\n' +
                                                                '<span\n' +
                                                                'class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                                '<i class="fas fa-pencil-alt"></i>\n' +
                                                                '</span>Re-socio</a>\n';
                                                        }

                                                    }
                                                }

                                                appendData += '</div><hr>\n';
                                                $('#facebookFeeds').append(appendData);
                                                $('div#image-gallery' + num).imagesGrid({
                                                    images: element?.mediaUrls
                                                });
                                                num++;
                                            }
                                        });
                                    }

                                }
                            }
                        });
                    }

                    /**
                     * TODO we've to like the particular feed of facebook post of facebook account.
                     * This function is used for liking  the particular feed of facebook account from socioboard.
                     * @param {integer} postID - postID of feed.
                     * ! Do not change this function without referring API format of liking feed.
                     */
                    function likeFeed(postID) {
                        if ($("a[data-value='" + postID + "']").hasClass("btn-hover-icon-danger") === true) {
                            $.ajax({
                                type: 'post',
                                url: '/like-fb-feed',
                                data: {
                                    postID, accounId
                                },
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                },
                                dataType: 'json',
                                beforeSend: function () {
                                },
                                success: function (response) {
                                    if (response.code === 200) {
                                        $("span[data-value='" + postID + "']").empty().append('<i class="fas fa-heart"></i>');
                                        let likecount = parseInt($("span[data-value='" + postID + "']").attr('like-count'));
                                        $("span[data-value='" + postID + "']").append(likecount + 1);
                                        $("a[data-value='" + postID + "']").addClass('btn-icon-danger');
                                        $("a[data-value='" + postID + "']").removeClass('btn-hover-icon-danger');
                                        toastr.success('Successfully Liked  Feed');
                                    } else if (response.code === 400) {
                                        toastr.error(response.error);
                                    } else {
                                        toastr.error('can not like feed ,some error occured');
                                    }
                                }
                            });
                        } else {
                            $("span[data-value='" + postID + "']").empty().append('<i class="fas fa-heart"></i>');
                            let likecount = parseInt($("span[data-value='" + postID + "']").attr('like-count'));
                            $("span[data-value='" + postID + "']").append(likecount);
                            $("a[data-value='" + postID + "']").removeClass('btn-icon-danger');
                            $("a[data-value='" + postID + "']").addClass('btn-hover-icon-danger');
                            toastr.success('Successfully Disliked Feed');
                        }

                    }

                    /**
                     * TODO we've to dislike the particular feed of faceboook.
                     * This function is used for disliking  the particular feed of twitter.
                     * @param {integer} postID - postID of feed.
                     * ! Do not change this function without referring API format of disliking feed.
                     */
                    function disLikeFeed(postID) {
                        if ($("a[data-value='" + postID + "']").hasClass("btn-icon-danger") === true) {
                            $("span[data-value='" + postID + "']").empty().append('<i class="fas fa-heart"></i>');
                            let likecount = parseInt($("span[data-value='" + postID + "']").attr('like-count'));
                            $("span[data-value='" + postID + "']").append(likecount - 1);
                            $("a[data-value='" + postID + "']").removeClass('btn-icon-danger');
                            $("a[data-value='" + postID + "']").addClass('btn-hover-icon-danger');
                        } else {
                            $.ajax({
                                type: 'post',
                                url: '/like-fb-feed',
                                data: {
                                    postID, accounId
                                },
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                },
                                dataType: 'json',
                                beforeSend: function () {
                                },
                                success: function (response) {
                                    if (response.code === 200) {
                                        $("span[data-value='" + postID + "']").empty().append('<i class="fas fa-heart"></i>');
                                        let likecount = parseInt($("span[data-value='" + postID + "']").attr('like-count'));
                                        $("span[data-value='" + postID + "']").append(likecount);
                                        $("a[data-value='" + postID + "']").addClass('btn-icon-danger');
                                        $("a[data-value='" + postID + "']").removeClass('btn-hover-icon-danger');
                                    } else if (response.code === 400) {
                                        toastr.error(response.error);
                                    } else {
                                        toastr.error('can not like feed ,some error occured');
                                    }
                                }
                            });
                        }
                    }

                    let accountType;

                    /**
                     * TODO we've to get  the faebook feeds and data of a particular faecbook account on change of facebook ccounts from dropdown.
                     * This function is used for getting facebook accounts feeds and data of a particular facebook account on change of faecbook accounts from dropdown.
                     * @param {this} data- account id of that particular facebook account.
                     * ! Do not change this function without referring API format of getting the faecbook feeds.
                     */
                    function call(data) {
                        $(function() {
                            $('body').scrollTop(0);
                        });
                        let accountsData = data.value;
                        let accountsArray = accountsData.split(" ");
                        accounId = accountsArray[0], accountType = accountsArray[1];
                        getfacebookFeeds(accountsArray[0], 1, accountsArray[1]);
                    }

                    /**
                     * TODO we've to get  comment on the particular facebook feed of facebook account from sociobaord.
                     * This function is used for commenting on particular faceboook feed of the faceboook account.
                     * !Do not change this function without referring API format of commenting on particular facebook feed of particular facebook account.
                     */
                    $(document).on("click", "#commentButton", function (e) {
                        e.preventDefault();
                        let postID = $(this).attr('name'), comment = $("textarea[name='" + postID + "']").val();
                        if (comment === '') {
                            toastr.error('Comment can not be empty', "");
                        } else {
                            $.ajax({
                                type: 'post',
                                url: '/comment-fb-feed',
                                data: {
                                    postID, accounId, comment
                                },
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                },
                                dataType: 'json',
                                beforeSend: function () {
                                },
                                success: function (response) {
                                    if (response.code === 200) {
                                        toastr.success('Successfully commented on Feed');
                                        $("textarea[name='" + postID + "']").val("");
                                    } else if (response.code === 400) {
                                        toastr.error(response.error, "Error!");
                                        $("textarea[name='" + postID + "']").val("");
                                    } else {
                                        $("textarea[name='" + postID + "']").val("");
                                        toastr.error('Can not comment,some error occured.');
                                    }
                                }
                            });
                        }
                    });

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
                        let action = '/discovery/content_studio/publish-content/feeds-modal',
                            isType = (type == null) ? 'no media' : type;
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
                                $('body').find("#normal_post_area").emojioneArea({
                                    pickerPosition: "right",
                                    tonesStyle: "bullet"
                                });
                                if (imagecount === 0 || imagecount === '0') {
                                    $('.thumb-count').empty();
                                } else {
                                    $('.thumb-count').html('+' + (parseInt(imagecount)-1).toString());

                                }
                                setTimeout(function () {
                                    downloadMediaUrl('fb');
                                }, 3000);
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

                    function getUrlsFromDesc(text) {
                        let replyText = text;
                        let urls = replyText.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
                        );
                        return urls;
                    }

                </script>
@endsection