<div class="card mb-2">

    <div class="text-center">
        <a data-pin-do="embedPin" data-pin-width="large" href="{{$feed->url}}"></a>
    </div>

    <div class="card mb-3">
        <p id="pinterest-link" style="display: none" data-link="{{$feed->link}}"></p>
        <p id="pinterest-note" style="display: none" data-note="{{$feed->note}}"></p>
        <div class="row mt-2">
            <div class="col-md-4">
            </div>

            <div class="col-md-4">
            </div>

            <div class="col-md-4">
                <a href="javascript:void(0);" class="text-dark" data-toggle="modal" data-target="#incpostModal" id="re-socio-button" data-id="{{$feed->id}}">
                  <span data-toggle="tooltip" data-placement="top" title="Using re-socio you can share this post with your own content.">
                    <i class="fas fa-retweet text-primary"></i> re-socio </span>
                </a>
            </div>
        </div>

        <div class="post_cmt_div" id="post_cmt_div_{{ $feed->id}}" style="display: none;">
            <hr class="m-1"/>
            <div class="media p-2">
                <img class="rounded-circle mr-3 pp_50" src="{{$userProfile->profile_pic_url}}"
                     alt="{{$userProfile->first_name}} {{$userProfile->last_name}}"/>
                <div class="media-body">
                    <div class="mt-2 mb-0">
                        <input type="text" class="form-control rounded-pill post_cmt_fld" data-postid="{{ (integer)$feed->id }}"
                               id="post_cmt_{{ $feed->id }}" placeholder="Type your comments"/>
                    </div>
                </div>
            </div>
        </div>


    </div>


</div>


