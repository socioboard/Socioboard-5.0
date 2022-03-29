@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Discovery</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Row-->
                <h4 class="text-center mb-5">Newspaper Management</h4>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-body">
                                <form id="news_paper_form" enctype="multipart/form-data">
                                    @csrf
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="image-input image-input-empty image-input-outline profile-pic" id="Sb_team_pic"
                                             style="background-image: url(media/logos/sb-icon.svg)">
                                            <div class="image-input-wrapper"></div>
                                            <label class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow" data-action="change"
                                                   data-toggle="tooltip" title="" data-original-title="Change avatar">
                                                <i class="fas fa-camera icon-md cameraIcon"></i>
                                                <input type="file" name="profile_avatar" accept=".png, .jpg, .jpeg" id="profile" class="file-upload" onchange="readURL(this);" />
                                                <input type="hidden" name="profile_avatar_remove" />
                                            </label>
                                        </div>
                                        <div class="mt-5">
                                            <button type="submit" id="newsAdd" class="btn btn-block newsAdd" style="width: inherit">Add newspaper</button>
                                        </div>
                                    </div>
                                    <div class="col-md-8 ">
                                            <div class="form-group newsPaperName">
                                                <label>Newspaper</label>
                                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 " type="text" name="newspaper" placeholder="ALARABIYA">
                                            </div>
                                            <div class="newspaper-container">
                                                <div class="row newspaper-keyword">
                                                    <div class="col-md-2 addPlusButton">
                                                        <button type="button" class="add-rss-info-btn btn btn-sm"><i class="fa fa-plus pr-0"></i></button>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-group">
                                                            <label>RSS Url Name</label>
                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="rss_url[]"
                                                                   placeholder="Url">
                                                        </div>

                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-group">
                                                            <label>Keywords</label>
                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text"  name="keywords[]"
                                                                   placeholder="Write some keywords">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="row newspaper-keyword d-none">
                                                    <div class="col-md-2">
                                                        <button type="button" class="remove-rss-info-btn btn btn-sm"><i class="fa fa-minus pr-0"></i></button>
                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-group">
                                                            <label>RSS Url Name</label>
                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text"  name="rss_url[]"
                                                                   placeholder="Url">
                                                        </div>

                                                    </div>
                                                    <div class="col-md-5">
                                                        <div class="form-group">
                                                            <label>Keywords</label>
                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="keywords[]"
                                                                   placeholder="Write some keywords">
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                    </div>
                                </div>
                                </form>
                            </div>
                        </div>

                    </div>
                    <div class="col-md-6">
                        <div class="card added addedNewsDivs">
                            <div class="card-body">
                                <h5 class="text-center ">Added Newspapers</h5>
                                <div class="rss-tags mt-5">
                                    @if(isset($channels) && sizeof($channels['data']) > 0)
                                        @foreach($channels['data'] as $data)
                                                <button type="button" class="btn" id="news{{$data->id}}">{{$data->title}}
                                                    <span class="nwsp-icon">
                                                    <a href="" class="btn-icon text-hover-info ml-2 deleteButton" data-toggle="modal" data-target="#deleteRssModal{{$data->id}}">
                                                    <i data-toggle="tooltip" data-placement="top" class="fas fa-trash" data-original-title="Delete"></i>
                                                    </a>
                                                </span>
                                                </button>&nbsp;&nbsp;
                                                <div class="modal fade" id="deleteRssModal{{$data->id}}" tabindex="-1" role="dialog" aria-labelledby="deleteRssModalLabel"
                                                     aria-hidden="true">
                                                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="deleteRssModalLabel">Delete</h5>
                                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                    <i aria-hidden="true" class="ki ki-close"></i>
                                                                </button>
                                                            </div>
                                                            <div class="modal-body">
                                                                <div class="text-center">
                                                                    <i class="icon-xl far fa-newspaper"></i><br>
                                                                    <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Newspaper?<br />It will delete all content as well</span>
                                                                </div>
                                                                <div class="d-flex justify-content-center">
                                                                    <a href="javascript:;" type="button" onclick=" deleteIt('{{$data->id}}')" class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal" id="board-delete">Delete it!</a>
                                                                    <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                       data-dismiss="modal">No thanks.</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!--begin::editnews modal-->
                                                <div class="modal fade" id="editnews{{$data->id}}" tabindex="-1" aria-labelledby="editnewsLabel" aria-hidden="true">
                                                    <div class="modal-dialog modal-lg">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="editnewsLabel">Edit</h5>
                                                                <button type="button" class="close btn btn-xs btn-icon btn-light btn-hover-primary" data-dismiss="modal"
                                                                        aria-label="Close" id="Sb_quick_user_close">
                                                                    <i class="ki ki-close icon-xs text-muted"></i>
                                                                </button>
                                                            </div>
                                                            <form id="news_update_form{{$data->id}}" enctype="multipart/form-data">
                                                                @csrf
                                                            <div class="modal-body">

                                                                <div class="row">
                                                                    <div class="col-md-4">
                                                                        <div class="image-input image-input-empty image-input-outline profile-pic" id="Sb_team_pic"
                                                                             style="background-image: url({{$data->logo_url}})">
                                                                            <div class="image-input-wrapper"></div>
                                                                            <label class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow" data-action="change"
                                                                                   data-toggle="tooltip" title="" data-original-title="Change avatar">
                                                                                <i class="fas fa-camera icon-md "></i>
                                                                                <input type="file" name="profile_avatar" accept=".png, .jpg, .jpeg" id="profiles" value="{{$data->logo_url}}" class="file-upload" onchange="readURL(this);" />
                                                                                <input type="hidden" name="profile_avatar_remove" />
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-md-8">
                                                                        <div class="form-group">
                                                                            <label>Newspaper</label>
                                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="newspaper" value="{{$data->title}}" placeholder="ALARABIYA">
                                                                        </div>
                                                                        <div class="newspaper-containers">
                                                                            @foreach($data->links as $links)
                                                                            <div class="row newspaper-keyword">
                                                                                <div class="col-md-5">
                                                                                    <div class="form-group">

                                                                                        <label>RSS Url Name</label>
                                                                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="rss_url[]" value="{{$links->url}}"
                                                                                               placeholder="Url">
                                                                                        <input type="hidden" value="{{$data->logo_url}}" name="logo_url">
                                                                                        <input type="hidden" value="{{$data->id}}" name="id">
                                                                                    </div>

                                                                                </div>
                                                                                <div class="col-md-5">
                                                                                    <div class="form-group">
                                                                                        <label>Keywords</label>
                                                                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text"  name="keywords[]" value="{{$links->category}}"
                                                                                               placeholder="Write some keywords">
                                                                                    </div>
                                                                                </div>
                                                                                <div class="col-md-5">
                                                                                    <div class="form-group">
                                                                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="hidden"  name="link_ids[]" value="{{$links->id}}"
                                                                                        >
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            @endforeach

                                                                        </div>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                                                        data-dismiss="modal">Close</button>
                                                                <a type="" onclick="updateForm('{{$data->id}}');" class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Save changes</a>
                                                            </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!--end::editnews modal-->

                                        @endforeach
                                    @else
                                        <div class="card-body">
                                            <div class="text-center">
                                                <div class="symbol symbol-150">
                                                    <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                                </div>
                                                <h6>Currently no News Paper Added</h6>
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection

@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script>
        // Add Row
        var $newspapercontainer = $('.newspaper-container');
        $('.add-rss-info-btn').click(function () {
            var $clone = $newspapercontainer.find('.d-none').clone(true).removeClass('d-none');
            $newspapercontainer.append($clone);
        });

        $('.remove-rss-info-btn').click(function () {
            $(this).parents('.newspaper-keyword').detach();
        });
        //
        // var $newspapercontainer = $('.newspaper-containers');
        // $('.add-rss-info-btn mod').click(function () {
        //     var $clone = $newspapercontainer.find('.d-none').clone(true).removeClass('d-none');
        //     $newspapercontainer.append($clone);
        // });
        //
        // $('.remove-rss-info-btn').click(function () {
        //     $(this).parents('.newspaper-keyword').detach();
        // });
    </script>
@endsection

@section('page-scripts')

    <script>
        $(document).ready(function () {
            $("#boards").trigger('click');
        })

        $(document).ready(function () {
            $("#discovery").trigger('click');
            let readURL = function (input) {

                if (input.files && input.files[0]) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        $('.profile-pic').css('background-image', 'url("' + e.target.result + '")');
                        $('#profile').val(e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            };
            $(".file-upload").on('change', function () {
                readURL(this);
            });
            $(".upload-button").on('click', function (){
                $(".file-upload").click();
            });

            let readURLs = function (input) {

                if (input.files && input.files[0]) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        $('.profile-pic').css('background-images', 'url("' + e.target.result + '")');
                        $('#profile').val(e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            };
            $(".file-upload").on('change', function () {
                readURLs(this);
            });
            $(".upload-button").on('click', function (){
                $(".file-upload").click();
            });

        });
        $(document).on('submit', '#news_paper_form', function (e) {
           e.preventDefault();
            $('#newsAdd').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
            let form = document.getElementById('news_paper_form');
            let formData = new FormData(form);
            $.ajax({
                type: "post",
                url: "/discovery/add-newspaper",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: formData,
                processData: false,
                cache: false,
                contentType: false,
                success: function (response) {
                    $('#newsAdd').empty().append('Add NewsPaper');
                    if (response.code === 200) {
                        toastr.success('Added Newspaper Successfully');
                        window.location.reload();
                    }else if(response.error === '"links[0].url" must be a valid uri'){
                        toastr.error("RSS links with keyword is required and URL should be valid");
                    }else if(response.error === '"links[0].url" must be a string') {
                        toastr.error("RSS link field is required");
                    }else if(response.message === 'Invalid links!') {
                        toastr.error("Invalid RSS links!");
                    }
                    else if(response.error === 'The channel already exist') {
                        toastr.error("The Newspaper already exist");
                    }else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    $('#newsAdd').empty().append('Add NewsPaper');

                },
            });
        });

        $(document).on('submit', '#update_form', function (e) {
            e.preventDefault();
            $('#update_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
            let form = document.getElementById('update_form');
            let formData = new FormData(form);

        });

        // The DOM element you wish to replace with Tagify
        var taginput1 = document.querySelector('input[name=tag1]'),
            tagify1 = new Tagify( taginput1 );

        var taginput2 = document.querySelector('input[name=tag2]'),
            tagify2 = new Tagify(taginput2);

        var taginput3 = document.querySelector('input[name=tag3]'),
            tagify3 = new Tagify(taginput3);

        var taginput4 = document.querySelector('input[name=tag4]'),
            tagify4 = new Tagify(taginput4);

        function deleteIt(id) {
            $.ajax({
                url: "/discovery/newspaper-delete/"+id,
                type: "delete",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response['code'] === 200) {
                        toastr.success("", "Deleted Successfully!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                        });
                        $('#news'+id).remove();
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else if(response.code === 500) {
                        toastr.error(response.error);
                    }else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    toastr.error(error.ErrorMessage);
                }
            })
        }

        function updateForm(id) {
            let form = document.getElementById('news_update_form'+id);
            let formData = new FormData(form);
            $.ajax({
                type: "post",
                url: "/discovery/update-newspaper",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data: formData,
                processData: false,
                cache: false,
                contentType: false,
                success: function (response) {
                    $('#newsAdd').empty().append('Add NewsPaper');
                    if (response.code === 200) {
                        toastr.success('Updated Newspaper Successfully');
                        window.location.reload();
                    }else{
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    $('#newsAdd').empty().append('Add NewsPaper');

                },
            });
        }
    </script>
@endsection


