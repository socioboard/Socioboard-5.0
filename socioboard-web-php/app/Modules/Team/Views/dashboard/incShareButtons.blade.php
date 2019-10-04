<div class="row text-center pt-1 m-0 border">

    @if ($userProfile->account_type !== 5)  {{-- not an Instagram --}}
    <div class="col-md-4">
        <a href="javascript:void(0);" class="text-dark post_like_btn @if ($feed->liked) visited @endif"
           data-accountId="{{ $request->get('account_id')}}"
           data-postId="{{ $feed->postId }}">
            <span class="counter">{{$feed->likeCount}}</span> <i class="far fa-thumbs-up"></i> Like</a>
    </div>
    @endif

    @if ($userProfile->account_type !== 5)  {{-- not an Instagram --}}
    <div class="col-md-4">
        <a href="javascript:void(0);" class="text-dark post_cmt_btn" data-id="{{$feed->postId}}">
            <i class="far fa-comment-alt"></i> Comments </a>
    </div>
    @endif

    <div class="col-md-4">
        <a href="javascript:void(0);" data-toggle="modal" data-target="#incpostModal" data-link="https://www.facebook.com/{{$feed->socialAccountId}}/posts/{{$feed->postId}}">
            <span data-toggle="tooltip" data-placement="top" class="resocio_btn"
                  title="Using re-socio you can share this post with your own content.">
              <i class="fas fa-retweet text-primary"></i> re-socio
            </span>
        </a>
    </div>
</div>

{{--  <div class="fb_off_option"></div> --}}

<div class="post_cmt_div" id="post_cmt_div_{{$feed->postId}}">
    <hr class="m-1"/>
    <div class="media p-2">
        <img class="rounded-circle mr-3 pp_50" src="{{ $userProfile->profile_pic_url }}" alt="{{$userProfile->first_name}} {{$userProfile->last_name}}" />
        <div class="media-body">
            <div class="mt-2 mb-0">
                <input type="text" class="form-control rounded-pill post_cmt_fld" data-postId="{{$feed->postId}}" id="post_cmt_{{$feed->postId}}" placeholder="Type your comments" />
            </div>
        </div>
    </div>
</div>