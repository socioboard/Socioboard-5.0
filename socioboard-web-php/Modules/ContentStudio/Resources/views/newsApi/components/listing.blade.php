@if(isset($data) && isset($data->newsApiDetails) && !empty($data->newsApiDetails))
	@foreach($data->newsApiDetails as $item)
	    @include('contentstudio::components.image')
	@endforeach
@endif

