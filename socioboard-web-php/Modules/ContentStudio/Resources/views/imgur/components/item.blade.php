<div class="card publishContentItem"
data-media-url="{{ is_array($item->mediaUrl) ? $item->mediaUrl[0] : $item->mediaUrl }}"
data-source-url="{{ isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL) ? $item->sourceUrl : null }}"
data-publisher-name="{{ isset($item->publisherName) ? $item->publisherName : null }}"
data-title="{{ $item->title }}"
data-description="{{ $item->description }}"
data-type="{{ !$isImage ? 'video' : 'image'  }}"
data-id="{{ $item->imgurId }}"
data-api="imgur">
    @if(!$isImage)
        <div class="embed-responsive embed-responsive-16by9">
            {{-- <iframe class="embed-responsive-item rounded" src="{{ $mediaUrl }}" allowfullscreen=""></iframe> --}}
            <video class="w-100" height="240" controls>
                <source src="{{$mediaUrl}}" type="video/mp4">
                <source src="{{$mediaUrl}}" type="video/ogg">
                Your browser does not support the video tag.
            </video>
        </div>
    @else
        <img src="{{ $mediaUrl }}" class="card-img-top" alt="">
    @endif

    <div class="card-body">
        <div class="board-card">
        @if(isset($item->publisherName))
            @if(isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL))
                <a href="{{$item->sourceUrl}}" class="d-block text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">{{ $item->publisherName }}</a>
            @else
                <span class="d-block mb-1 font-size-lg font-weight-bolder" target="_blank">{{ $item->publisherName }}</span>
            @endif
        @endif
        @if(isset($item->publishedDate) && $item->publishedDate && is_string($item->publishedDate))
            {{-- <span class="text-muted font-weight-bold">Yestarday at 5:06 PM</span> --}}
            <span class="text-muted font-weight-bold">{{ $helperClass->time_elapsed_string($item->publishedDate) }}</span>
        @else
            <span class="text-muted font-weight-bold">{{ $helperClass->time_elapsed_string(date('Y-m-d H:m:s', $item->publishedDate)) }}</span>
        @endif
        <h5 class="card-title">{{ $item->title }}</h5>
        <p class="card-text">{{ $item->description }}</p>
        <div class="d-flex justify-content-center">
            <a href="#" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5 publishContentItemShareBtn"><i class="far fa-hand-point-up fa-fw"></i> One Click</a>
            <form action="{{ route('publish_content.scheduling')  }}" method="POST">
                @csrf
                <input type="hidden" name="mediaUrl" value="{{ $mediaUrl }}">
                <input type="hidden" name="sourceUrl" value="{{ isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL) ? $item->sourceUrl : null }}">
                <input type="hidden" name="publisherName" value="{{ isset($item->publisherName) ? $item->publisherName : null }}">
                <input type="hidden" name="title" value="{{ $item->title }}">
                <input type="hidden" name="type" value="{{ !$isImage ? 'video' : 'image' }}">
                <textarea name="description" style="display: none">{{ $item->description }}</textarea>
                <button type="submit"  class="btn btn-hover-text-info btn-hover-icon-info rounded font-weight-bolder"><i class="fas fa-history fa-fw"></i> Schedule</button>
            </form>
        </div>
        </div>
    </div>
</div>
