@if(!isset($downloadMedia))
    @if(isset($mediaData['type']) && $mediaData['type'] == 'image') 
        @if(isset($mediaData) && isset($mediaData['mediaUrl'])) 
            <img src="{!! $mediaData['mediaUrl'] !!}" class="img-fluid" style="object-fit:contain;" /> 
        @elseif(isset($mediaUrl))
            @foreach($mediaUrl as $key => $media) 
                <img src="{!! $site_url.$media !!}" class="img-fluid image{{$key}}" style="object-fit:contain;" /> 
            @endforeach
        @endif 

    @elseif( isset($mediaData['type']) && strtolower($mediaData['type']) == 'video' )
        @if(isset($mediaUrl))
            @foreach( $mediaUrl as $key => $value )
                <video class="video{{$key}}" autoplay controls style="object-fit: contain;">
                    <source src="{{$site_url.$value}}">
                </video>
            @endforeach
        @endif
    @else 
        <img src="{{asset('/media/svg/illustrations/dashboard-boy.svg') }}" class="img-fluid defaultImage"/>
    @endif
@endif
