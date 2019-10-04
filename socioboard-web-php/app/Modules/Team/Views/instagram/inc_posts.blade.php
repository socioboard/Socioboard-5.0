<div class="fb_feeds_div">

    @foreach($feeds as $feed)

        <div class="card border-0 mb-2">
            <div class="card-body p-0">
                <div>
                    <p style="display: none" class="insta-mediaUrl">{{$feed->mediaUrl}}</p>
                    <p style="display: none" class="insta-caption">{{$feed->captionText}}</p>
                    <div class="media p-2">
                        <img class="rounded-circle mr-3 pp_50" src="{{ $userProfile->profile_pic_url }}" alt="{{ $feed->userName }}"/>
                        <div class="media-body">
                            <h5 class="mt-2 mb-0 page_name">{{ $feed->userName }}</h5>
                            <b style="font-size: 12px;">{{ $feed->locationName  }}</b>
                        </div>
                    </div>

                    @if ($feed->type == 'video')
                        <div class="embed-responsive embed-responsive-16by9">
                            <video class="embed-responsive-item" playsinline="" preload="none" src="{{ $feed->mediaUrl }}" type="video/mp4" poster="{{ $feed->mediaUrl }}"> </video>
                        </div>
                    @endif

                    @if ($feed->type == 'image')
                        <div>
                            <img src="{{ $feed->mediaUrl }}" class="img-fluid feed_posted_image" />
                        </div>
                    @endif

                    @if ($feed->type == 'carousel')
                        <div>
                            <img src="{{ $feed->mediaUrl }}" class="img-fluid feed_posted_image"/>
                        </div>
                    @endif


                    <div class="p-2">
                        <p class="mb-1 feed_posted_text">{{ $feed->captionText }}</p>
                    </div>

                    <div class="p-2">
                        <small><i class="far fa-thumbs-up text-primary"></i>{{ $feed->likeCount }}</small>
                        <span class="float-right">
                        <small class="post_cmt_btn">{{ $feed->commentCount }} comments</small>
                      </span>
                    </div>

                    <hr class="m-1"/>

                    <div class="row text-center">

                        <div class="col-md-4">
                          {{--  <a href="javascript:void(0);" class="text-dark"><i class="far fa-thumbs-up"></i> Like</a> --}}
                        </div>
                        <div class="col-md-4">
                           {{-- <a href="javascript:void(0);" class="text-dark"><i class="far fa-comment-alt"></i> Comments</a>--}}
                        </div>
                        <div class="col-md-4">

                            <a href="javascript:void(0);" class="text-dark" data-toggle="modal" data-target="#incpostModal" id="resocio_button" data-id="{{$feed->postId}}">
                              <span class="resocio_btn" data-toggle="tooltip" data-placement="top"
                                    title="Using re-socio you can share this post with your own content.">
                                <i class="fas fa-retweet text-primary"></i> re-socio
                              </span>
                            </a>
                        </div>
                    </div>


                    <div class="post_cmt_div">
                        <hr class="m-1"/>
                        <div class="media p-2">
                            <img class="rounded-circle mr-3 pp_50"
                                 src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"
                                 alt="ChanchalSantra"/>
                            <div class="media-body">
                                <div class="mt-2 mb-0">
                                    <input type="text" class="form-control rounded-pill" id="post_cmt"
                                           placeholder="Type your comments"/>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    @endforeach
</div>