@if(isset($data) && isset($data->pixabayDetails) && !empty($data->pixabayDetails))
	@foreach($data->pixabayDetails as $item)
	    @include('contentstudio::components.image')
	@endforeach
@endif

