<script async src="//assets.pinterest.com/js/pinit.js?rand={{rand(1,999999999)}}"></script>

<div class="tab-content" id="v-pills-tabContent">

    @if ( !is_array($feeds))
        {{ $feeds}}
    @else

    <div class="tab-pane fade show active" id="v-pills-boardone" role="tabpanel" aria-labelledby="v-pills-boardone-tab">
        <div class="pin_feeds_div">
            @foreach($feeds as $feed)
                @include('Team::Pinterest.resocio')
            @endforeach
            <!-- end of re-socio -->
        </div>
    </div>
    {{--
        <div class="tab-pane fade" id="v-pills-profile" role="tabpanel" aria-labelledby="v-pills-profile-tab">
            <div class="pin_feeds_div">
                @include('Team::Pinterest.resocio')
            </div>
        </div>
        --}}
</div>

{{--
@foreach ($feeds as $feed)
    <a href="{{$feed->url}}">
        <img src="{{$feed->link}}">
        #{{$feed->id}}:
        {{$feed->note}}
    </a>
@endforeach
--}}

@endif
