@extends("User::dashboard.master")
@section('title')
    <title>SocioBoard | Public Image Library</title>
@endsection

@section('style')
    <style type="text/css">
        .profile_action_dropdown .dropdown-toggle::before {
            content: none;
        }
    </style>
@endsection

@section("public_library")
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4 class="float-left">Public Image Library <span id="memory"></span> </h4>
            <button class="btn btn-dark btn-sm float-right"  data-toggle="modal" data-target="#imgUploadModal">Upload Image</button>
        </div>

        <p style="color: red" id="noData"></p>
        @if($errors->any())
            <h4 style="color: red">{{$errors->first()}}</h4>
        @endif
        <div class="col-md-12">

            <div class="card-columns" id="media">

            </div>
            <div class="d-flex justify-content-center" >
                <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    </div>
    <!-- img upload modal -->
    <div class="modal fade" id="imgUploadModal" tabindex="-1" role="dialog" aria-labelledby="postModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header p-1 bg-light">
                    <h5 class="modal-title">Upload Image</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-2">
                    <form id="uploadMediaForm">
                        <div class="form-group">
                            <label for="boardname">Image Title</label>
                            <input type="text" class="form-control" id="img_title" placeholder="Enter image title" name="title"/>
                        </div>
                        <p style="color: red" id="titleError"></p>
                        <div class="form-group">
                            <input type="file" class="dropify" name="media" accept="image/*"/>
                        </div>
                        <p style="color: red" id="mediaError"></p>
                        <button style="float: right" onclick="uploadMedia(0);" type="button" class="btn btn-primary has-spinner">
                            Upload
                        </button>
                    </form>
                </div>


            </div>
        </div>
    </div>
    @endsection
{{--@include('Schedule::imageLibrary.incJsUploadViewImageModal')--}}
{{--@include('User::dashboard.incModalPost')--}}



@section("script")
    <script>
     //for GA
        var eventCategory = 'Schedule';
        var eventAction = 'Public-Image-Library';</script>
        @include('Schedule::imageLibrary.incUploadImageJs')
    <script>
        var pageId=1;
        var appendData = "";
        var imageType = 0;
        var action = "inactive";
        if (action == 'inactive') {
            action = "active";
            onLoadImage(pageId,imageType);
        }


        @include('Schedule::imageLibrary.incImageLibraryJs')



    </script>


    @endsection