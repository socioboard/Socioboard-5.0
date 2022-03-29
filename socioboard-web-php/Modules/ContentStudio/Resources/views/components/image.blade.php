<div class="card publishContentItem"
data-media-url="{{ $item->mediaUrl }}"
data-source-url="{{ isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL) ? $item->sourceUrl : null }}"
data-publisher-name="{{ isset($item->publisherName) ? $item->publisherName : null }}"
data-title="{{ $item->title }}"
data-description="{{ $item->description }}"
data-type="image"
>
    <img src="{{ $item->mediaUrl }}" class="card-img-top" onerror=" this.onerror=null;this.src='https://i.imgur.com/eRkLsuQ.png';">
    <div class="card-body">
        <div class="board-card">
    	<div class="d-flex align-items-center">
            <!--begin::Info-->
            <div class="d-flex flex-column flex-grow-1">
            	@if(isset($item->publisherName))
            		@if(isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL))
                		<a href="{{$item->sourceUrl}}" class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank">{{ $item->publisherName }}</a>
            		@else
            			<span class="mb-1 font-size-lg font-weight-bolder" target="_blank">{{ $item->publisherName }}</span>
            		@endif
                @endif

                @if(isset($item->publishedDate) && $item->publishedDate)
	                @if(is_string($item->publishedDate) && $item->publishedDate != '')
	                    {{-- <span class="text-muted font-weight-bold">Yestarday at 5:06 PM</span> --}}
	                    <span class="text-muted font-weight-bold">{{ $helperClass->time_elapsed_string($item->publishedDate) }}</span>
	                @else
	                    <span class="text-muted font-weight-bold">{{ $helperClass->time_elapsed_string(date('Y-m-d H:m:s', $item->publishedDate)) }}</span>
	                @endif
                @endif
            </div>
            <!--end::Info-->
        </div>
        <h5 class="card-title mb-1 mt-2">{{ $item->title }}</h5>
        <p class="card-text">{{ $item->description }}</p>
        <div class="d-flex justify-content-center">
            <a href="#" data-toggle="modal" data-target="#resocioModal" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5 publishContentItemShareBtn"><i class="far fa-hand-point-up fa-fw"></i> One Click</a>
            <form action="{{ route('publish_content.scheduling')  }}" method="POST">
                @csrf
                <input type="hidden" name="mediaUrl" value="{{ $item->mediaUrl }}">
                <input type="hidden" name="sourceUrl" value="{{ isset($item->sourceUrl) && filter_var($item->sourceUrl, FILTER_VALIDATE_URL) ? $item->sourceUrl : null }}">
                <input type="hidden" name="publisherName" value="{{ isset($item->publisherName) ? $item->publisherName : null }}">
                <input type="hidden" name="title" value="{{ $item->title }}">
                <input type="hidden" name="type" value="image">
                @if(isset($pagetype) && $pagetype === 'DailyMotion')
                    <input type="hidden" name="pageType" value="dailymotion">
                @else
                    <input type="hidden" name="pageType" value="other">
                @endif
                <textarea name="description" style="display: none">{{ $item->description }}</textarea>
                <button type="submit"  class="btn btn-hover-text-info btn-hover-icon-info rounded font-weight-bolder"><i class="fas fa-history fa-fw"></i> Schedule</button>
            </form>

        </div>
        </div>
    </div>
</div>
