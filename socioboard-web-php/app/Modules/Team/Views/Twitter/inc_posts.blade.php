

    <!-- twt fedds -->

    <!--
      [mediaUrls] => Array
        (
            [0] => https://pbs.twimg.com/media/D6_8p29XsAALe9V.jpg
        )
    [_id] => 5ce3b02a5c5d49f71cd96730
    [tweetId] => 1130399921344061440
    [accountId] => 1130397883050541000
    [batchId] => 1558425642
    [descritpion] => Bottles in bodega Antonio Mendelez, Spain https://t.co/44JXcWjhpi
    [favoriteCount] => 0
    [isApplicationPost] =>
    [postedAccountId] => 1130397883050541056
    [postedAccountScreenName] => AIakovliev
    [publishedDate] => 2019-05-20T09:08:37.000Z
    [retweetCount] => 0
    [tweetUrl] => https://twitter.com/AIakovliev/status/1130399921344061440
    [version] => 4.0.0
    [createdDate] => 2019-06-03T07:04:16.626Z
    -->


    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

    @foreach($feeds as $post)

    <div class="card mb-3">

        <blockquote class="twitter-tweet">
            <div id="container"></div>
           {{$post->descritpion}}
            <a href="{{ $post->tweetUrl }}"></a>
        </blockquote>

        <div class="row mt-2 text-center">

            <div class="col-md-4">
                <button class="button button-like post_like_btn" data-postId="{{ $post->tweetId }}"><i class="fa fa-heart"></i><span>Like</span></button>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark post_cmt_btn" data-id="{{ $post->tweetId }}"><i class="far fa-comment-alt"></i> Comments </a>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark" data-toggle="modal" data-target="#postModal">
                          <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content.">
                            <i class="fas fa-retweet text-primary"></i> re-socio
                          </span>
                </a>
            </div>
        </div>

        <div class="post_cmt_div" id="post_cmt_div_{{ $post->tweetId }}" style="display: none;">
            <hr class="m-1"/>
            <div class="media p-2">
                <img class="rounded-circle mr-3 pp_50" src="{{$userProfile->profile_pic_url}}" alt="{{$userProfile->first_name}} {{$userProfile->last_name}}"/>
                <div class="media-body">
                    <div class="mt-2 mb-0">
                        <input type="text" class="form-control rounded-pill post_cmt_fld" data-postid="{{ $post->tweetId }}" id="post_cmt_{{ $post->tweetId }}" placeholder="Type your comments"/>
                    </div>
                </div>
            </div>
        </div>

    </div>
    @endforeach

{{--
    <div class="card mb-3">
        <blockquote class="twitter-tweet" data-dnt="true">
            <a href="https://twitter.com/ChanchalSantra/status/1105144818403991557"></a>
        </blockquote>
        <div class="row mt-2 text-center">
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark">
                    <i class="far fa-thumbs-up"></i> Like
                </a>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark c">
                    <i class="far fa-comment-alt"></i> Comments
                </a>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark" data-toggle="modal"
                   data-target="#postModal">
                      <span data-toggle="tooltip" data-placement="top"
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

    <div class="card">
        <blockquote class="twitter-tweet" data-dnt="true">
            <a href="https://twitter.com/taylornation13/status/1100655995674607616"></a>
        </blockquote>
        <div class="row mt-2 text-center">
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark">
                    <i class="far fa-thumbs-up"></i> Like
                </a>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark post_cmt_btn">
                    <i class="far fa-comment-alt"></i> Comments
                </a>
            </div>
            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark" data-toggle="modal"
                   data-target="#postModal">
                      <span data-toggle="tooltip" data-placement="top"
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
--}}

    <!-- twt -->