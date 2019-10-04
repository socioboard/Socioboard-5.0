@inject('carbon','Carbon\Carbon' )
@inject('request','Illuminate\Http\Request' )
<!-- facebook fedes -->
@foreach ($feeds as $feed)


@if((string)$feed->privacy == "EVERYONE")
    <div class="card border-0 mb-2">
        <div class="card-body p-0">

            <div>
            @switch( $feed->postType )

                @case( 'video' )
                <!--  --------------- post:video start ----------------  -->
                    <div media p-2">
                    <img class="mr-2 pp_40" src="{{$userProfile->profile_pic_url}}"
                         alt="{{$userProfile->first_name}} {{$userProfile->last_name}}"/>
                    <div class="media-body">
                        <h5 class="mt-1 mb-0 page_name text-dark font-weight-bold">{{$userProfile->first_name}} {{$userProfile->last_name}}</h5>
                        <b style="font-size: 12px; color: #90949c;">{{$carbon::parse($feed->publishedDate)->diffForHumans()}}</b>
                    </div>
            </div>
            <div class="facebook-container">
                    <?php
                    $mediaUrls=implode(',', $feed->mediaUrls)?>
                    <p style="display: none" class="fb-mediaUrl"  data-url={{$mediaUrls}}></p>
                <p style="display: none" class="fb-description" data-desc={{$feed->description}}></p>
                <div class="fb-video" data-href="{{$feed->postUrl}}" data-width="750" data-show-text="true">
                    <blockquote cite="{{$feed->postUrl}}" class="fb-xfbml-parse-ignore"></blockquote>
                </div>

                {{--  @if ($userProfile->account_type ==2) --}}
                @include('Team::dashboard.incShareButtons')
                {{-- @endif --}}
            </div>
            <!--  -------------- post:video end --------------  -->
        @break

        @default
        <!--  -------- post:{{ $feed->postType }} start ---------  -->
            <div class="facebook-container">
                <?php
                $mediaUrls=implode(',', $feed->mediaUrls)?>
                <p style="display: none" class="fb-mediaUrl"  data-url={{$mediaUrls}}></p>
                <p style="display: none" class="fb-description" >{{$feed->description}}</p>
                <div class="fb-post" data-show-text="true"
                     data-href="https://www.facebook.com/{{$feed->socialAccountId}}/posts/{{$feed->postId}}/"
                     data-width="auto" data-show-text="true">
                    <blockquote
                            cite="https://developers.facebook.com/{{$feed->socialAccountId}}/posts/{{$feed->postId}}/"
                            class="fb-xfbml-parse-ignore">
                    </blockquote>
                </div>
                {{--Aishwarya M added below line--}}
                <div class="fb_off_option"></div>

                {{-- @if ($userProfile->account_type ==2) --}}
                @include('Team::dashboard.incShareButtons')
                {{-- @endif --}}
            </div>
        <!--  ------ post:{{ $feed->postType }} end -------  -->
            @break

            {{--
    @case( 'link' )
    @case( 'status' )
    @case( 'photo' )
    @break
--}}
            @endswitch

        </div>

    </div>
    </div>
    @endif
@endforeach
