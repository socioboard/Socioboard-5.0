@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Private Images</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="../plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="../plugins/custom/emojionearea/css/emojionearea.min.css"/>
@endsection

@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">

                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-12">
                        <!--begin::Borad-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder"> Image Library : Total Used Space -
                                    <span class="text-primary ml-3" id="usedSize"> @if($images["code"] == 200) {{number_format($images["data"]->usedSize/(1024*1024), 2)}}MB / {{number_format($images["data"]->totalSize/(1024*1024), 2)}}MB </span>
                                    @else  {{$images["message"]}}   @endif
                                </h3>

                                <div class="card-toolbar">
                                    <!--begin::Teams Actions Dropdown-->
                                    <a href="javascript:;" class="btn btn-hover-text-success btn-sm" data-toggle="modal"
                                       data-target="#uploadImageModal" onclick="clearDataBeforeUpload()">
                                        Upload Images
                                    </a>
                                    <!--end::Teams Actions Dropdown-->
                                </div>
                            </div>
                            <!--end::Header-->
                        </div>
                        <!--end::Borad-->
                    </div>

                </div>
                <!--end::Row-->
                <!--begin::Board-->
                <!--begin::Row-->
                <div class="card-columns" id="privateImages">
                        @if($images["code"] == 200 && isset($images["data"]->data) && !empty($images["data"]->data))
                        @foreach($images["data"]->data as $image)
                            <div class="card" id="Image{{$image->id}}" data-value="{{$image->media_size}}">
                                <img src="{{env('API_URL_PUBLISH').$image->media_url}}" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <div class="d-flex justify-content-center">
                                                                                <a href="javascript:;" data-toggle="modal" data-target="#resocioModal"
                                                                                   onclick="oneClickImage('{{$image->media_url}}')" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5"><i
                                                                                        class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                                        <a href="javascript:;" data-toggle="modal" data-target="#deleteImageModal"
                                           onclick="imageId('{{$image->id}}')"
                                           class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder"><i
                                                    class="far fa-trash-alt fa-fw"></i> Delete</a>
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
                <!-- End::Loader -->
                <!--end::Board-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
    <input type="hidden" value="" id="imageId">
    <!-- begin::Re-socio-->
    @include('imagelibary::ImageLibrary.re_socio_image_library')

    <!-- begin::Delete Image modal-->
    <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteImageModalLabel">Delete Image</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <img src="../media/svg/icons/Communication/Delete-user.svg"/><br>
                        <span class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this Image? </span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal" id="image-delete" onclick="deleteImage();">Delete it! </a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                            thanks. </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete Image modal-->

    <!-- begin::Upload Image modal-->
    <div class="modal fade" id="uploadImageModal" tabindex="-1" role="dialog" aria-labelledby="uploadImageModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="uploadImageModalLabel">Upload Image</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="">
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       type="text" name="outgoing-url" autocomplete="off" id="image_name"
                                       placeholder="Enter Image Name"/>
                                <span><i class="fas fa-image"></i></span>
                                <div class="error text-danger" id="image_name_error1"></div>
                            </div>
                        </div>
                        <input type="file" class="dropify" id="file-upload" accept=".jpeg, .png, .jpg"/>
                        <div class="error text-danger" id="upload_image_error"></div>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-primary font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           id="image-upload" onclick="imageUpload(1)">Upload it! </a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                            thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Upload Image modal-->

    <script src="../plugins/custom/dropify/dist/js/dropify.min.js"></script>
    <script src="../plugins/custom/emojionearea/js/emojionearea.min.js"></script>

    <script>
        let API_URL = '{{env('API_URL_PUBLISH')}}';
        let USEDSIZE = (Number('{{json_encode($images["data"]->usedSize)}}'));
        let TOTALSIZE = (Number('{{json_encode($images["data"]->totalSize)}}'));
        let IMAGE_TYPE = 1;
        $(document).ready()
        {
            // Image upload
            $('.dropify').dropify();
        }
        // accounts list div open
        $(".accounts-list-div").css({
            display: "none"
        });
        $(".accounts-list-btn").click(function () {
            $(".accounts-list-div").css({
                display: "block"
            });
        });

        // begin:normal post emoji
        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });
        // end:normal post emoji
        // begin:images and videos upload
        $(function () {
            var names = [];
            $("#hint_brand").css("display", "none");
            $("body").on("change", ".picupload", function (event) {
                var getAttr = $(this).attr("click-type");
                var files = event.target.files;
                var output = document.getElementById("media-list");
                var z = 0;
                if (getAttr == "type1") {
                    $("#media-list").html("");
                    $("#media-list").html(
                        '<li class="myupload"><span><i class="fas fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" multiple></span></li>'
                    );
                    $("#hint_brand").css("display", "block");
                    $("#option_upload").css("display", "none");
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        names.push($(this).get(0).files[i].name);
                        if (file.type.match("image")) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML =
                                    "<img src='" +
                                    picFile.result +
                                    "'" +
                                    "title='" +
                                    picFile.name +
                                    "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" +
                                    event.target.fileName +
                                    "' class='remove-pic'><i class='fas fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        } else {
                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML =
                                    "<video src='" +
                                    picFile.result +
                                    "'" +
                                    "title='" +
                                    picFile.name +
                                    "'></video><div id='" +
                                    z +
                                    "'  class='post-thumb'><div class='inner-post-thumb'><a data-id='" +
                                    event.target.fileName +
                                    "' href='javascript:void(0);' class='remove-pic'><i class='fas fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                } else if (getAttr == "type2") {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        names.push($(this).get(0).files[i].name);
                        if (file.type.match("image")) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML =
                                    "<img src='" +
                                    picFile.result +
                                    "'" +
                                    "title='" +
                                    picFile.name +
                                    "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" +
                                    event.target.fileName +
                                    "' class='remove-pic'><i class='fas fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        } else {
                            var picReader = new FileReader();
                            picReader.fileName = file.name;
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;

                                var div = document.createElement("li");

                                div.innerHTML =
                                    "<video src='" +
                                    picFile.result +
                                    "'" +
                                    "title='" +
                                    picFile.name +
                                    "'></video><div class='post-thumb'><div  class='inner-post-thumb'><a href='javascript:void(0);' data-id='" +
                                    event.target.fileName +
                                    "' class='remove-pic'><i class='fas fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                    // return array of file name
                }
            });

            $("body").on("click", ".remove-pic", function () {
                $(this)
                    .parent()
                    .parent()
                    .parent()
                    .remove();
                var removeItem = $(this).attr("data-id");
                var yet = names.indexOf(removeItem);
                if (yet != -1) {
                    names.splice(yet, 1);
                }
                // return array of file name
            });
            $("#hint_brand").on("hide", function (e) {
                names = [];
                z = 0;
            });
        });
        // end:images and videos upload

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

