@if(isset($data) && isset($data->dailymotionDetails) && !empty($data->dailymotionDetails))
	@foreach($data->dailymotionDetails as $item)
	    @include('contentstudio::components.video')
	@endforeach
@endif

