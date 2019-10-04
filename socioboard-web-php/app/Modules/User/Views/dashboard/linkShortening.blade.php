@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Link Shortening</title>
@endsection

@section('style')
    <style type="text/css">
        .tab-pane {
            min-height: 500px;
        }
    </style>
@endsection

@section('link-shortening')
    <div class="border-0" style="padding: 50px 0;">
        <div class="card-body shadow bg-white rounded">
            <p>Are your links feeling a little long? Well worry no longer, choose one of our link shorteners and Socioboard will make sure that your links are shortened whenever you post.</p>
            <div class="row p-0">
                <div class="col-md-12 col-12">
                    <div class="card bg-light border-light col-6 p-2 mb-2">
                        <div class="custom-control custom-radio">
                            @if($status == 0)
                                <input type="radio" value="0"  id="no_short" name="customRadio" class="custom-control-input" checked>
                            @else
                                <input type="radio" value="0" id="no_short" name="customRadio" class="custom-control-input">
                            @endif
                            <label class="custom-control-label" for="no_short">
                                <h4><b>No Shortening</b></h4>
                                <p>Clicks on links will not be tracked</p>
                            </label>
                        </div>
                    </div>
                    <div class="card bg-light border-light col-6 p-2 mb-2">
                        <div class="custom-control custom-radio">
                            @if($status == 1)
                                <input type="radio" value="1" id="bitly" name="customRadio" class="custom-control-input" checked>
                            @else
                                <input type="radio" value="1"  id="bitly" name="customRadio" class="custom-control-input">
                            @endif
                            <label class="custom-control-label" for="bitly">
                                <h4><b>bit.ly</b></h4>
                                <p>Shortened links will have aggregated click tracking</p>
                            </label>
                        </div>
                    </div>
                    {{--<div class="card bg-light border-light col-6 p-2 mb-2">--}}
                    {{--<div class="custom-control custom-radio">--}}
                    {{--<input type="radio" id="jmp" name="customRadio" class="custom-control-input">--}}
                    {{--<label class="custom-control-label" for="jmp">--}}
                    {{--<h4><b>j.mp</b></h4>--}}
                    {{--<p>Shortened links will have aggregated click tracking</p>--}}
                    {{--</label>--}}
                    {{--</div>--}}
                    {{--</div>--}}
                </div>
            </div>
        </div>
    </div>
@endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'Schedule';
        var eventAction = 'Link-Shortening';
        $(document).on('change','.custom-control-input', function () {

            $.ajax({
                type: "POST",
                url: "link-shortening",
                data: {
                    status: $(this).attr('value')
                },
                success: function(response){
                    swal(response.message);
                }
            })
        })
    </script>
@endsection