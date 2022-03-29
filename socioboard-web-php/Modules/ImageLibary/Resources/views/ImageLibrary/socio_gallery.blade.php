@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Gallery</title>
@endsection
@section('links')
{{--    <link rel="stylesheet" type="text/css" href="../plugins/custom/dropify/dist/css/dropify.min.css" />--}}
    <link rel="stylesheet"  type="text/css" href="../plugins/custom/emojionearea/css/emojionearea.min.css" />
@endsection

@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">

                <!--begin::Board-->
                <!--begin::Row-->
                <div class="card-columns" id="privateImages">
                        @if($images["code"] == 200 && isset($images["data"]->data) && !empty($images["data"]->data))
                        @foreach($images["data"]->data as $image)
                    <div class="card" id="Image{{$image->id}}">
                        <img src="{{env('API_URL_PUBLISH').$image->media_url}}"  class="card-img-top" alt="...">
                        <div class="card-body">
                            <div class="d-flex justify-content-center">
                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal"
                                   onclick="oneClickImage('{{$image->media_url}}','{{$image->title}}')" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5"><i
                                            class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                            </div>
                        </div>
                    </div>
                        @endforeach
                    @elseif($images["code"] == 200 && isset($images["data"]->data) && empty($images["data"]->data))
                        <div class="card-body text-danger">No Data Found</div>
                     @elseif($images["code"] && !empty($images["code"]))
                        <div class="card-body text-danger">{{$images["message"]}}</div>
                        @else
                        <div class="card-body text-danger">Some error occurred while fetching data Please reload it... </div>
                    @endif
                </div>
                <!--end::Row-->
                <!-- Begin::Loader -->
                <div class="mb-10" id="loader_id">
                </div>
                <div class="mb-10" id="loader_text_id">
                </div>
                <!-- end::Loader -->
                <!--end::Board-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
    <!-- begin::Re-socio-->
    @include('imagelibary::ImageLibrary.re_socio_image_library')
    <script>
        let API_URL = '{{env('API_URL_PUBLISH')}}';
        let IMAGE_TYPE = 3;
        $(document).ready(function () {
            $("#imageLibrary").trigger('click');
        })
        </script>
@endsection
@section('scripts')
    <script src="../js/IncJsFiles/ImageLibrary/private_images.js"></script>
    <script src="../js/IncJsFiles/ImageLibrary/re_socio.js"></script>
@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>