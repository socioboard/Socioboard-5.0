@foreach($data as $key => $item)
    @php
        $mediaUrl = gettype($item->mediaUrl) === 'array' ? $item->mediaUrl[0] : $item->mediaUrl;
        $isImage = strpos($item->mediaType, 'image') !== false ? true : false;
    @endphp
    @include('contentstudio::imgur.components.item')
@endforeach