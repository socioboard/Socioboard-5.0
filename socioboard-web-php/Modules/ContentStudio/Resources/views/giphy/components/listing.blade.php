@if(!isset($error))

@foreach($data as $key => $item)
    @include('contentstudio::components.image')
@endforeach

@endif
