@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Public Images</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="../plugins/custom/dropify/dist/css/dropify.min.css" />
    <link rel="stylesheet"  type="text/css" href="../plugins/custom/emojionearea/css/emojionearea.min.css" />
    <link href="/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css"/>
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
                                <h3 class="card-title font-weight-bolder publicImageDescDiv"> Image Library : Total Used Space - <span class="text-primary ml-3" id="usedSize"> {{number_format($images["data"]->usedSize/(1024*1024), 2)}}MB / {{number_format($images["data"]->totalSize/(1024*1024), 2)}}MB</span></h3>

                                <div class="card-toolbar">
                                    <!--begin::Teams Actions Dropdown-->
                                    <a href="javascript:;" class="btn btn-hover-text-success btn-sm uploadImageButton" data-toggle="modal" data-target="#uploadImageModal" onclick="clearDataBeforeUpload()">
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
                <form id="search_form" class="formSerachDiv" method="POST" action="/imagelibary/search-public-image">
                    @csrf
                    <div class="row mb-5 align-items-center">
                        <div class="col-md-3">
                            <input type="hidden" name="typeofview" id="vieww">
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6" name="order">
                                <option disabled>Sort by</option>
                                <option value="desc" @if (isset($search) && $search['order'] === "desc" ) selected @endif>Descending order(created date)</option>
                                <option value="asc" @if (isset($search) && $search['order'] === "asc" ) selected @endif>Ascending order(created date)</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6" name="rating">
                                <option selected disabled>Rating</option>
                                <option value="1" @if (isset($search) && $search['rating'] == "1" ) selected @endif>One</option>
                                <option value="2" @if (isset($search) && $search['rating'] == "2" ) selected @endif>Two</option>
                                <option value="3" @if (isset($search) && $search['rating'] == "3" ) selected @endif>Three</option>
                                <option value="4" @if (isset($search) && $search['rating'] == "4" ) selected @endif>Four</option>
                                <option value="5" @if (isset($search) && $search['rating'] == "5" ) selected @endif>Five</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="title" value="{{isset($search) ? $search['title'] : "" }}"
                                       placeholder="Title" />
                                <span></span>
                            </div>
                        </div>
                        <input type="hidden" name="type" value="0">

                        <div class="col-md-1">
                            <button type="submit" id="search_button" class="btn font-weight-bolder font-size-h6 px-8 py-4">Search</button>
                        </div>
                        <div class="col-md-2">
                            <a href="/imagelibary/public-images" class="btn font-weight-bolder font-size-h6 px-8 py-4">Clear</a>
                        </div>
                        <div class="col-md-2">
                            <!--begin::Tabs-->
                            <ul class="nav nav-bold nav-pills px-8 justify-content-end" id="type_of_view"
                                role="tablist">
                                <li class="nav-item grid-View_class">
                                    <a class="nav-link active" data-toggle="tab" id="grid" href="#imagelibrary-grid"><i
                                                class="fas fa-th"></i></a>
                                </li>
                                <li class="nav-item list-View_class">
                                    <a class="nav-link" data-toggle="tab" href="#imagelibrary-list" id="list"><i
                                                class="fas fa-list"></i></a>
                                </li>
                            </ul>
                            <!--end::Tabs-->
                        </div>
                    </div>
                </form>

                <!--begin::Board-->
                <div class="tab-content">
                    <!--begin::Tabpane-->
                    <div class="tab-pane active show" id="imagelibrary-grid" role="tabpanel">
                        <div class="row" id="imagsss">
                            @if($images["code"] == 200 && isset($images["data"]->data) && !empty($images["data"]->data))
                                @foreach($images["data"]->data as $image)
                                    <div class="col-md-3" id="Images{{$image->id}}" >
                                        <div class="card imagelibrary-card">
                                            <div class="img-card">
                                                <img src="{{env('API_URL_PUBLISH').$image->media_url}}" class="card-img-top" alt="...">
                                                <button class="info-btn btn btn-hover-text-success btn-sm description-icon" data-toggle="modal" data-target="#imageGalleryInfoss" onclick="imageInfo('{{env('API_URL_PUBLISH')}}','{{$image->media_url}}','{{$image->title}}','{{$image->rating}}','{{$image->created_date}}','{{$image->privacy_type === 1 ? "Private" : "Public"}}','{{$image->media_size}}')">
                                                    <i class="fas fa-info-circle"></i>
                                                </button>
                                            </div>
                                            <div class="card-body p-3">
                                                <div class="d-flex">
                                                    <h4 class="card-title mb-2">{{$image->title}}</h4>
                                                    <div class="rating-css ml-auto ">
                                                        <div class="star-icon">
                                                            <input type="radio"
                                                                   <?php if ($image->rating === 1) echo "checked";?> name="rating1{{$image->id}}"
                                                                   id="rating1{{$image->id}}"
                                                                   onclick="updateRating('1', '{{$image->id}}');">
                                                            <label
                                                                    for="rating1{{$image->id}}"
                                                                    class="fas fa-star"></label>
                                                            <input type="radio"
                                                                   <?php if ($image->rating == 2) echo "checked";?> name="rating1{{$image->id}}"
                                                                   id="rating2{{$image->id}}"
                                                                   onclick="updateRating('2', '{{$image->id}}');">
                                                            <label
                                                                    for="rating2{{$image->id}}"
                                                                    class="fas fa-star"></label>
                                                            <input type="radio"
                                                                   <?php if ($image->rating == 3) echo "checked";?> name="rating1{{$image->id}}"
                                                                   id="rating3{{$image->id}}"
                                                                   onclick="updateRating('3', '{{$image->id}}');">
                                                            <label
                                                                    for="rating3{{$image->id}}"
                                                                    class="fas fa-star"></label>
                                                            <input type="radio"
                                                                   <?php if ($image->rating == 4) echo "checked";?> name="rating1{{$image->id}}"
                                                                   id="rating4{{$image->id}}"
                                                                   onclick="updateRating('4', '{{$image->id}}');">
                                                            <label
                                                                    for="rating4{{$image->id}}"
                                                                    class="fas fa-star"></label>
                                                            <input type="radio"
                                                                   <?php if ($image->rating == 5) echo "checked";?> name="rating1{{$image->id}}"
                                                                   id="rating5{{$image->id}}"
                                                                   onclick="updateRating('5', '{{$image->id}}');">
                                                            <label
                                                                    for="rating5{{$image->id}}"
                                                                    class="fas fa-star"></label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <?php
                                                    $date=date_create($image->created_date);
                                                    date_add($date,date_interval_create_from_date_string("330 mins"));
                                                    ?>
                                                    Created - <b>{{date_format($date,"Y-m-d H:i:s")}}</b>
                                                </div>
                                                <hr />
                                                <div class="d-flex justify-content-center">
                                                    <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" onclick="oneClickImage('{{$image->media_url}}','{{$image->title}}')"
                                                       class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5"><i
                                                                class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                                                    <a href="javascript:;" data-toggle="modal" data-target="#deleteImageModal" onclick="imageId('{{$image->id}}')"
                                                       class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder"><i
                                                                class="far fa-trash-alt fa-fw"></i> Delete</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @elseif($images["code"] == 200 && isset($images["data"]->data) && empty($images["data"]->data))
                                <div class="card-body text-danger" id="privateImagesError1" style="text-align: center">No Data Found</div>
                            @elseif($images["code"] && !empty($images["code"]))
                                <div class="card-body text-danger" id="privateImagesError2" style="text-align: center">{{$images["message"]}}</div>
                            @else
                                <div class="card-body text-danger" style="text-align: center">Some error occurred while fetching data Please reload
                                    it...
                                </div>
                            @endif
                        </div>
                    </div>

                    <div class="tab-pane" id="imagelibrary-list" role="tabpanel">
                        @if($images["code"] == 200 && isset($images["data"]->data) && !empty($images["data"]->data))
                            @foreach($images["data"]->data as $image)
                                <div class="imagelibrary-list-row" id="Image{{$image->id}}" >
                                    <div class="img-card">
                                        <img src="{{env('API_URL_PUBLISH').$image->media_url}}" class="card-img-top" alt="...">
                                    </div>
                                    <div>
                                        <h4 class="card-title mb-2">{{$image->title}}</h4>
                                        <div>
                                            <div class="rating-css ml-auto">
                                                <div class="star-icon">
                                                    <input type="radio"
                                                           <?php if ($image->rating === 1) echo "checked";?> name="ratings1{{$image->id}}"
                                                           id="ratings1{{$image->id}}"
                                                           onclick="updateRating('1', '{{$image->id}}');">
                                                    <label
                                                            for="ratings1{{$image->id}}"
                                                            class="fas fa-star"></label>
                                                    <input type="radio"
                                                           <?php if ($image->rating == 2) echo "checked";?> name="ratings1{{$image->id}}"
                                                           id="ratings2{{$image->id}}"
                                                           onclick="updateRating('2', '{{$image->id}}');">
                                                    <label
                                                            for="ratings2{{$image->id}}"
                                                            class="fas fa-star"></label>
                                                    <input type="radio"
                                                           <?php if ($image->rating == 3) echo "checked";?> name="ratings1{{$image->id}}"
                                                           id="ratings3{{$image->id}}"
                                                           onclick="updateRating('3', '{{$image->id}}');">
                                                    <label
                                                            for="ratings3{{$image->id}}"
                                                            class="fas fa-star"></label>
                                                    <input type="radio"
                                                           <?php if ($image->rating == 4) echo "checked";?> name="ratings1{{$image->id}}"
                                                           id="ratings4{{$image->id}}"
                                                           onclick="updateRating('4', '{{$image->id}}');">
                                                    <label
                                                            for="ratings4{{$image->id}}"
                                                            class="fas fa-star"></label>
                                                    <input type="radio"
                                                           <?php if ($image->rating == 5) echo "checked";?> name="ratings1{{$image->id}}"
                                                           id="ratings5{{$image->id}}"
                                                           onclick="updateRating('5', '{{$image->id}}');">
                                                    <label
                                                            for="ratings5{{$image->id}}"
                                                            class="fas fa-star"></label>
                                                </div>
                                            </div>
                                            <?php
                                            $date=date_create($image->created_date);
                                            date_add($date,date_interval_create_from_date_string("330 mins"));
                                            ?>
                                            Created - <b>{{date_format($date,"Y-m-d H:i:s")}}</b>
                                        </div>
                                    </div>
                                    <div class="ml-auto d-flex">
                                        <button class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5 align-self-start "
                                                data-toggle="modal" data-target="#imageGalleryInfoss" onclick="imageInfo('{{env('API_URL_PUBLISH')}}','{{$image->media_url}}','{{$image->title}}','{{$image->rating}}','{{$image->created_date}}','{{$image->privacy_type === 1 ? "Private" : "Public"}}','{{$image->media_size}}')">
                                            <i class="fas fa-info-circle "></i> Info
                                        </button>
                                        <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" onclick="oneClickImage('{{$image->media_url}}','{{$image->title}}')"
                                           class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5 align-self-start"><i
                                                    class="far fa-hand-point-up fa-fw"></i> 1 click</a>
                                        <a href="javascript:;" data-toggle="modal" data-target="#deleteImageModal" onclick="imageId('{{$image->id}}')"
                                           class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder align-self-start"><i
                                                    class="far fa-trash-alt fa-fw"></i> Delete</a>
                                    </div>
                                </div>
                            @endforeach
                        @elseif($images["code"] == 200 && isset($images["data"]->data) && empty($images["data"]->data))
                            <div class="card-body text-danger" id="privateImagesError1" style="text-align: center">>No Data Found</div>
                        @elseif($images["code"] && !empty($images["code"]))
                            <div class="card-body text-danger" id="privateImagesError2" style="text-align: center">>{{$images["message"]}}</div>
                        @else
                            <div class="card-body text-danger" style="text-align: center">>Some error occurred while fetching data Please reload
                                it...
                            </div>
                        @endif
                    </div>
                </div>

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
    <input type="hidden" value="" id="imageSize">
    <!-- begin::Delete Image modal-->
    <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel" aria-hidden="true">
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
                        {{--                        <img src="../media/svg/icons/Communication/Delete-user.svg"/><br>--}}
                        <span class="font-weight-bolder font-size-h4 "> Are you sure want to delete this Image? </span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button" class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal" id="image-delete" onclick="deleteImage();">Delete it </a>
                        <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete Image modal-->

    <!-- begin::image gallery info-->
    <div class="modal fade" id="imageGalleryInfoss" tabindex="-1" role="dialog" aria-labelledby="imageGalleryInfoLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="imageGalleryInfoLabel">Nature</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6" id="imageDiv">
                            <img src="" alt="image" class="img-fluid">
                            <!-- <div class="text-center">
                                <button class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mt-5">Download</button>
                            </div> -->
                        </div>
                        <div class="col-md-6">
                            <p><span>Title - <b id="title_id"></b></span></p>
                            <p><span>Size - <b id="size_id"></b></span></p>
                            <p><span>Created Date - <b id="create_date"></b></span></p>
                            <p><span>Rating - <b id="ratng"><i class="fas fa-star"></i></b></span></p>
                            <p><span>Type - <b id="type"></b></span></p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    <!-- end::image gallery info-->

    <!-- begin::Upload Image modal-->
    <div class="modal fade" id="uploadImageModal" tabindex="-1" role="dialog" aria-labelledby="uploadImageModalLabel" aria-hidden="true">
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
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="outgoing-url" autocomplete="off" id="image_name" placeholder="Enter Image Name"/>
                                <span><i class="fas fa-image"></i></span>
                                <div class="error text-danger" id="image_name_error2"></div>
                            </div>
                        </div>
                        <input type="file" class="dropify" id="file-upload" accept=".jpeg, .png, .jpg" name="image"/>
                        <div class="error text-danger" id="upload_image_error"></div>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button" class="btn text-primary font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" id="image-upload" onclick="imageUpload(0)">Upload it! </a>
                        <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Upload Image modal-->
    <!-- begin::Re-socio-->
    @include('imagelibary::ImageLibrary.re_socio_image_library')

    <script src="../plugins/custom/dropify/dist/js/dropify.min.js"></script>
    <script src="../plugins/custom/emojionearea/js/emojionearea.min.js"></script>

    <script>
        let API_URL = '{{env('API_URL_PUBLISH')}}';
        let USEDSIZE = (Number('{{json_encode($images["data"]->usedSize)}}'));
        let TOTALSIZE = (Number('{{json_encode($images["data"]->totalSize)}}'));
        let IMAGE_TYPE = 0;

        // Image upload
        $('.dropify').dropify();

        // accounts list div open
        $(".accounts-list-div").css({
            display: "none"
        });
        $(".accounts-list-btn").click(function() {
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
        $(function() {
            var names = [];
            $("#hint_brand").css("display", "none");
            $("body").on("change", ".picupload", function(event) {
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
                            picReader.addEventListener("load", function(event) {
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
                            picReader.addEventListener("load", function(event) {
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
                            picReader.addEventListener("load", function(event) {
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
                            picReader.addEventListener("load", function(event) {
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

            $("body").on("click", ".remove-pic", function() {
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
            $("#hint_brand").on("hide", function(e) {
                names = [];
                z = 0;
            });
        });
        $(document).ready(function () {
            $("#imageLibrary").trigger('click');
            var sessionId = "<?php echo session()->get('view'); ?>";
            $('#'+sessionId).trigger('click');
        })
        // end:images and videos upload

    </script>
@endsection
@section('scripts')
    <script src="../js/IncJsFiles/ImageLibrary/private_images.js"></script>
    <script src="../js/IncJsFiles/ImageLibrary/re_socio.js"></script>
@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

