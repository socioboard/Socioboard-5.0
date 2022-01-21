@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Medium Feeds</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="/plugins/custom/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="/css/images-grid.css"/>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row" data-sticky-container>
                    <div class="col-xl-4 ">
                        <div class="sticky" data-sticky="true" data-margin-top="160px" data-sticky-for="1023"
                             data-sticky-class="kt-sticky">

                            <!-- begin:Accounts list -->
                            <div class="form-group">
                                <select
                                        class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                        onchange="call(this)">
                                    @if($message=== 'success')
                                        <script>
                                            let accounId = <?php echo $accounts[0]->account_id; ?>;
                                        </script>
                                        <option disabled>Select Account</option>
                                        @foreach($accounts as $data)
                                            <option
                                                    value="{{$data->account_id}}">{{$data->first_name}}
                                            </option>
                                        @endforeach
                                    @elseif($message=== 'failed')
                                        <option selected value="failed">No
                                            accounts,Some error occured
                                        </option>
                                    @elseif($message=== 'No Medium Account has been  added yet!')
                                        <option selected value="failed">No Medium Account has been added for this team yet! or
                                            accounts have been locked
                                        </option>
                                    @endif
                                </select>
                            </div>
                            <!-- end:Accounts list -->
                            <!--begin::Profile-->
                            <div class="card card-custom gutter-b ">
                                @if(count($accounts)>0)
                                    <div class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                        <div class="ribbon-target bg-medium" style="top: -2px; right: 20px;">
                                            <img src="/media/png/medium-logo.png">
                                        </div>
                                        <!--begin::User-->
                                        <div class="d-flex align-items-center" id="mediumProfileDiv">
                                            <div class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                <div class="symbol-label"
                                                     style="background-image:url('{{$accounts[0]->profile_pic_url}}')"></div>
                                            </div>
                                            <div>
                                                <a href="{{$accounts[0]->profile_url}}"
                                                   class="font-weight-bolder font-size-h5 text-hover-primary"
                                                   target="_blank">
                                                    {{$accounts[0]->first_name}}
                                                </a>
                                                <div class="text-muted">
                                                    {{$accounts[0]->user_name}}
                                                </div>
                                            </div>
                                        </div>
                                        <!--end::User-->
                                        <div class="mt-2">
                                            <div class="d-flex justify-content-around">
                                                <button type="button"
                                                        class="btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-6"
                                                        onclick="getUserPublications()">
                                                    User's
                                                    Publications
                                                </button>
                                                <button type="button"
                                                        class="btn text-hover-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-6 schedule-post-btn"
                                                        onclick="getUserPosts()">
                                                    User's
                                                    Posts
                                                </button>
                                            </div>
                                            <a href="javascript:;"
                                               class="btn btn-lg btn-block font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                               data-target="#mediumfeedModal{{$accounts[0]->account_id}}"
                                               data-toggle="modal">Create Post On User's Medium Profile</a>
                                        </div>
                                        <!--begin::Contact-->
                                        <div class="py-9">
                                        </div>
                                        <!--end::Contact-->
                                    </div>
                                @else
                                    <div class="card-body">
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently, no Medium account added to this team or Accounts have been
                                                locked.</h6>
                                        </div>
                                    </div>
                            @endif


                            <!-- begin:: No accounts -->

                                <!-- end:: No accounts -->
                            </div>
                            <!--end::Profile-->

                        </div>

                    </div>
                    <div class="col-xl-8">
                        <!--begin::Feeds-->
                        <div class="card card-custom gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder" id="userPublications">All Publications</h3>
                            </div>
                            <!--end::Header-->
                            <div class="card-body medium-story">
                                <div class="row" id="mediumFeeds">
                                    @if($message === 'failed')
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Can not get publications as :Some error occured in getting
                                                publicatiosn</h6>
                                        </div>
                                    @else
                                        @if(isset($publications))
                                            @if($publications['code']=== 200)
                                                @foreach($publications['data'] as $data)
                                                    <div class="col-xl-6">
                                                        <div class="card">
                                                            <div class="card-body">
                                                                <a href="#">
                                                                    <img src="{{$data->imageUrl}}" alt="image"
                                                                         class="img-fluid card-img">
                                                                </a>
                                                                <div class="mt-5">
                                                                    <a href="{{$data->url}}" target="_blank"
                                                                       class="font-weight-bolder font-size-h5 text-hover-primary">
                                                                        {{$data->name}}
                                                                    </a>
                                                                    <p class="mt-2">{{$data->description}}</p>
                                                                </div>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                @endforeach
                                            @elseif($publications['code']=== 400)
                                                <div class="text-center">
                                                    <div class="symbol symbol-150">
                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                    </div>
                                                    <h6>{{$publications['error']}}</h6>
                                                </div>@else
                                                <div class="text-center">
                                                    <div class="symbol symbol-150">
                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                    </div>
                                                    <h6>Some error occured, can not get publications</h6>
                                                    @endif
                                                    @else
                                                        <div class="text-center">
                                                            <div class="symbol symbol-150">
                                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                            </div>
                                                            <h6>Can not get User's publications as :Currently no Medium
                                                                Account has
                                                                been
                                                                added for this team yet! or Accounts has been locked</h6>
                                                        </div>
                                                    @endif
                                                    @endif

                                                </div>
                                </div>
                            </div>
                            <!--end::Feeds-->
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
    @foreach($accounts as $data)
        <!--begin::medium feed modal-->
            <div class="modal fade mediumfeedModal" id="mediumfeedModal{{$data->account_id}}" tabindex="-1"
                 aria-labelledby="mediumfeedLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mediumfeedLabel">Create a post</h5>
                            <button type="button" class="close btn btn-xs btn-icon btn-light btn-hover-primary"
                                    data-dismiss="modal"
                                    aria-label="Close" id="Sb_quick_user_close">
                                <i class="ki ki-close icon-xs text-muted"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Title:</label>
                                <input type="text"
                                       class="form-control form-control-solid py-4 rounded-lg font-size-h6 mb-4"
                                       placeholder="Enter text" id="titleText">
                            </div>
                            <div class="form-group">
                                <label>Description:</label>
                                <textarea class="form-control border-0 p-4" rows="6"
                                          placeholder="Type a message" id="descriptionText"></textarea>
                            </div>
                            <div class="form-group medium_feeds_group">
                                <label for="medium_feeds_tags">Tags</label>
                                <select class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                        id="medium_feeds_tags" name="param" multiple="multiple" style="width: 100%">
                                    <option label="Label"></option>
                                </select>
                            </div>
                            <div class="modal-footer">
                                <button type="button"
                                        class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                        data-dismiss="modal">Close
                                </button>
                                <button type="button" id="publishButton"
                                        class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                        onclick="publishOnMedium('{{$data->account_id}}')">Publish
                                    Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!--end::medium feed modal-->
                @endforeach

                @endsection
                @section('scripts')
                    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
                    <script src="{{asset('js/images-grid.js')}}"></script>
                    <script src="{{asset('js/accounts.js')}}"></script>
                    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
                    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
                    <script>

                        // multi select
                        $('#medium_feeds_tags').select2({
                            placeholder: 'Tags',
                            tags: true,
                            width: 'resolve' //
                        });

                        $("#discovery").trigger("click");

                        // begin::sticky
                        var sticky = new Sticky('.sticky');
                        // end::sticky

                        // begin:normal post emoji
                        $("#normal_post_area").emojioneArea({
                            pickerPosition: "right",
                            tonesStyle: "bullet"
                        });
                        // end:normal post emoji
                        // begin:images and videos upload
                        $(function () {
                            let names = [];
                            $("#hint_brand").css("display", "none");
                            $("body").on("change", ".picupload", function (event) {
                                let getAttr = $(this).attr("click-type");
                                let files = event.target.files;
                                let output = document.getElementById("media-list");
                                let z = 0;
                                if (getAttr == "type1") {
                                    $("#media-list").html("");
                                    $("#media-list").html(
                                        '<li class="myupload"><span><i class="fas fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" multiple></span></li>'
                                    );
                                    $("#hint_brand").css("display", "block");
                                    $("#option_upload").css("display", "none");
                                    for (let i = 0; i < files.length; i++) {
                                        let file = files[i];
                                        names.push($(this).get(0).files[i].name);
                                        if (file.type.match("image")) {
                                            let picReader = new FileReader();
                                            picReader.fileName = file.name;
                                            picReader.addEventListener("load", function (event) {
                                                let picFile = event.target;
                                                let div = document.createElement("li");
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
                                            let picReader = new FileReader();
                                            picReader.fileName = file.name;
                                            picReader.addEventListener("load", function (event) {
                                                let picFile = event.target;
                                                let div = document.createElement("li");
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
                                    for (let i = 0; i < files.length; i++) {
                                        let file = files[i];
                                        names.push($(this).get(0).files[i].name);
                                        if (file.type.match("image")) {
                                            let picReader = new FileReader();
                                            picReader.fileName = file.name;
                                            picReader.addEventListener("load", function (event) {
                                                let picFile = event.target;
                                                let div = document.createElement("li");
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
                                            let picReader = new FileReader();
                                            picReader.fileName = file.name;
                                            picReader.addEventListener("load", function (event) {
                                                let picFile = event.target;
                                                let div = document.createElement("li");
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
                                }
                            });

                            $("body").on("click", ".remove-pic", function () {
                                $(this)
                                    .parent()
                                    .parent()
                                    .parent()
                                    .remove();
                                let removeItem = $(this).attr("data-id");
                                let yet = names.indexOf(removeItem);
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

                        /**
                         * TODO we've to get  the twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                         * This function is used for getting twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
                         * @param {this} data- account id of that particular twitter account.
                         * ! Do not change this function without referring API format of getting the twitter feeds.
                         */
                        function call(data) {
                            $(function() {
                                $('body').scrollTop(0);
                            });
                            accounId = data.value;//accountid of particular twitter account from dropdown
                            getUserPublications(data.value);
                        }

                        let pageId;
                        $(window).scroll(function () {
                            if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
                                if (feedsLength >= 25) {
                                    getNextMediumFeeds(accounId, pageId);
                                    pageId++;
                                }
                            }
                        });

                        function getNextMediumFeeds(accounId, pageId) {
                            $.ajax({
                                type: 'get',
                                url: '/get-user-posts',
                                dataType: 'json',
                                data: {accID: accounId, pageId: pageId},
                                beforeSend: function () {
                                    $('#mediumFeeds').append('<div class="d-flex justify-content-center" >\n' +
                                        '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                        '<span class="sr-only">Loading...</span>\n' +
                                        '</div>\n' +
                                        '</div>');
                                    $(".spinner-border").css("display", "block");
                                },
                                success: function (response) {
                                    $(".spinner-border").css("display", "none");
                                    if (response.code === 200) {
                                        feedsLength = response.posts.length;
                                        pageId = response.data.next;
                                        let appendData = '';
                                        let publishedDate = 0;
                                        let imageurls = [];
                                        let urls;
                                        let m;
                                        let title;
                                        let paragraphs;
                                        let isUrl;
                                        let unix_timestamp;
                                        let rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
                                        if (response.data.posts.length > 0) {
                                            response.data.posts.map(element => {
                                                imageurls = element.imageUrl;
                                                paragraphs = element.description;
                                                isUrl = isValidURL(paragraphs);
                                                title = element.title;
                                                // unix_timestamp = element.createdAt;
                                                // publishedDate = timeConverter(unix_timestamp);
                                                appendData += '<div class="col-xl-12">\n' +
                                                    '<div class="card card-custom gutter-b">\n';
                                                appendData += '<div class="mb-5">\n' +
                                                    ' <div class="d-flex align-items-center">\n' +
                                                    ' <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                                    ' <span class="symbol-label">\n' +
                                                    '<img\n' +
                                                    'src="' + response.profileData.imageUrl + '"\n' +
                                                    'class="h-75 align-self-end" alt=""/>\n' +
                                                    '</span>\n' +
                                                    '</div>\n' +
                                                    '<div class="d-flex flex-column flex-grow-1">\n' +
                                                    '<a href="' + element.url + '"\n' +
                                                    'class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank" data-toggle="tooltip" title="Click here to view Original post">' + response.profileData.name + '</a>\n' +
                                                    // '<span\n' +
                                                    // 'class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                                    '</div>\n' +
                                                    '</div>\n' +
                                                    '<div class="pt-4">\n';
                                                appendData += '<h1 class="font-size-h1 font-weight-normal pt-5 mb-2">\n' +
                                                    '' + element.title + '\n' +
                                                    '</h1>\n';
                                                if (isUrl === true) {
                                                    appendData += '<a href="' + paragraphs + '"\n' +
                                                        'class="font-size-lg font-weight-normal pt-5 mb-2"\n' +
                                                        'target=_blank>\n' +
                                                        '' + paragraphs + '</a>';
                                                } else {
                                                    appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                        '' + paragraphs + '\n' +
                                                        '</p>\n';
                                                }
                                                if (imageurls !== '') {
                                                    appendData += '<div class="">\n' +
                                                        '<img src="' + imageurls + '"\n' +
                                                        'class="img-fluid"/>\n' +
                                                        '</div>\n';
                                                }
                                                appendData += '<br>\n';
                                                appendData += '<div class="d-flex align-items-center">\n';
                                                if (imageurls !== '') {
                                                    appendData += '<a id="reSocioButton"\n' +
                                                        'onclick="resocioButton(\'' + title + '\',\'' + imageurls + '\',\'' + 'image' + '\',null,null)"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio\n' +
                                                        '</a>\n';
                                                } else if (isUrl === true) {
                                                    appendData += '<a id="reSocioButton"\n' +
                                                        'onclick="resocioButton(\'' + paragraphs + '\',null,null,null,null,\'' + paragraphs + '\')"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio\n' +
                                                        '</a>\n';
                                                } else {
                                                    if (paragraphs !== '') {
                                                        appendData += '<a id="reSocioButton"\n' +
                                                            'onclick="resocioButton(\'' + paragraphs + '\',null,null,null,null,null)"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio\n' +
                                                            '</a>\n';
                                                    } else {
                                                        appendData += '<a id="reSocioButton"\n' +
                                                            'onclick="resocioButton(\'' + title + '\',null,null,null,null,null)"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio\n' +
                                                            '</a>\n';
                                                    }

                                                }
                                                appendData += '</div>\n';
                                                appendData += '</div>\n' +
                                                    '</div>\n';
                                                appendData += '</div>\n' +
                                                    '</div>\n';
                                            });
                                            $('#mediumFeeds').append(appendData);
                                        }
                                    } else if (response.code === 400) {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            response.error + '</div>');
                                    } else {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            'Some error occured, Can not get User posts' + '</div>');
                                    }
                                }
                            });
                        }

                        function getUserPosts() {
                            $('#userPublications').html('All Posts');
                            $.ajax({
                                type: 'get',
                                url: '/get-user-posts',
                                dataType: 'json',
                                data: {accID: accounId, pageId: 1},
                                beforeSend: function () {
                                    $('#mediumFeeds').empty().append('<div class="d-flex justify-content-center" >\n' +
                                        '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                        '<span class="sr-only">Loading...</span>\n' +
                                        '</div>\n' +
                                        '</div>');
                                    $(".spinner-border").css("display", "block");
                                },
                                success: function (response) {
                                    $(".spinner-border").css("display", "none");
                                    if (response.code === 200) {
                                        feedsLength = response.data.posts.length;
                                        pageId = response.data.next;
                                        let appendData = '';
                                        let publishedDate = 0;
                                        let imageurls = [];
                                        let urls;
                                        let m;
                                        let title;
                                        let paragraphs;
                                        let isUrl;
                                        let unix_timestamp;
                                        let rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
                                        if (response.data.posts.length > 0) {
                                            response.data.posts.map(element => {
                                                imageurls = element.imageUrl;
                                                paragraphs = element.description;
                                                isUrl = isValidURL(paragraphs);
                                                title = element.title;
                                                // unix_timestamp = element.createdAt;
                                                // publishedDate = timeConverter(unix_timestamp);
                                                appendData += '<div class="col-xl-12">\n' +
                                                    '<div class="card card-custom gutter-b">\n';
                                                appendData += '<div class="mb-5">\n' +
                                                    ' <div class="d-flex align-items-center">\n' +
                                                    ' <div class="symbol symbol-40 symbol-light-success mr-5">\n' +
                                                    ' <span class="symbol-label">\n' +
                                                    '<img\n' +
                                                    'src="' + response.profileData.imageUrl + '"\n' +
                                                    'class="h-75 align-self-end" alt=""/>\n' +
                                                    '</span>\n' +
                                                    '</div>\n' +
                                                    '<div class="d-flex flex-column flex-grow-1">\n' +
                                                    '<a href="' + element.url + '"\n' +
                                                    'class="text-hover-primary mb-1 font-size-lg font-weight-bolder" target="_blank" data-toggle="tooltip" title="Click here to view Original post">' + response.profileData.name + '</a>\n' +
                                                    // '<span\n' +
                                                    // 'class="text-muted font-weight-bold">' + publishedDate + '</span>\n' +
                                                    '</div>\n' +
                                                    '</div>\n' +
                                                    '<div class="pt-4">\n';
                                                appendData += '<h1 class="font-size-h1 font-weight-normal pt-5 mb-2">\n' +
                                                    '' + element.title + '\n' +
                                                    '</h1>\n';
                                                if (isUrl === true) {
                                                    appendData += '<a href="' + paragraphs + '"\n' +
                                                        'class="font-size-lg font-weight-normal pt-5 mb-2"\n' +
                                                        'target=_blank>\n' +
                                                        '' + paragraphs + '</a>';
                                                } else {
                                                    appendData += '<p class="font-size-lg font-weight-normal pt-5 mb-2">\n' +
                                                        '' + paragraphs + '\n' +
                                                        '</p>\n';
                                                }
                                                if (imageurls !== '') {
                                                    appendData += '<div class="">\n' +
                                                        '<img src="' + imageurls + '"\n' +
                                                        'class="img-fluid"/>\n' +
                                                        '</div>\n';
                                                }
                                                appendData += '<br>\n';
                                                appendData += '<div class="d-flex align-items-center">\n';
                                                if (imageurls !== '') {
                                                    appendData += '<a id="reSocioButton"\n' +
                                                        'onclick="resocioButton(\'' + title + '\',\'' + imageurls + '\',\'' + 'image' + '\',null,null)"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio\n' +
                                                        '</a>\n';
                                                } else if (isUrl === true) {
                                                    appendData += '<a id="reSocioButton"\n' +
                                                        'onclick="resocioButton(\'' + paragraphs + '\',null,null,null,null,\'' + paragraphs + '\')"\n' +
                                                        'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                        '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                        '<i class="fas fa-pencil-alt"></i>\n' +
                                                        '</span>Re-socio\n' +
                                                        '</a>\n';
                                                } else {
                                                    if (paragraphs !== '') {
                                                        appendData += '<a id="reSocioButton"\n' +
                                                            'onclick="resocioButton(\'' + paragraphs + '\',null,null,null,null,null)"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio\n' +
                                                            '</a>\n';
                                                    } else {
                                                        appendData += '<a id="reSocioButton"\n' +
                                                            'onclick="resocioButton(\'' + title + '\',null,null,null,null,null)"\n' +
                                                            'class="btn btn-hover-text-success btn-hover-icon-success btn-sm bg-hover-light-danger rounded font-weight-bolder font-size-sm p-2">\n' +
                                                            '<span class="svg-icon svg-icon-md svg-icon-dark-25 pr-1">\n' +
                                                            '<i class="fas fa-pencil-alt"></i>\n' +
                                                            '</span>Re-socio\n' +
                                                            '</a>\n';
                                                    }

                                                }
                                                appendData += '</div>\n';
                                                appendData += '</div>\n' +
                                                    '</div>\n';
                                                appendData += '</div>\n' +
                                                    '</div>\n';
                                            });
                                            $('#mediumFeeds').append(appendData);
                                        }
                                    } else if (response.code === 400) {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            response.error + '</div>');
                                    } else {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            'Some error occured, Can not get User posts' + '</div>');
                                    }
                                }
                            });
                        }

                        function getUserPublications() {
                            $('#userPublications').html('All Publications');
                            $.ajax({
                                type: 'get',
                                url: '/get-user-publications',
                                dataType: 'json',
                                data: {accID: accounId},
                                beforeSend: function () {
                                    $('#mediumFeeds,#mediumProfileDiv').empty();
                                    $('#mediumFeeds').empty().append('<div class="d-flex justify-content-center" >\n' +
                                        '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                        '<span class="sr-only">Loading...</span>\n' +
                                        '</div>\n' +
                                        '</div>');
                                    $('#mediumProfileDiv').append('<div class="d-flex justify-content-center" >\n' +
                                        '<div class="spinner-border" role="status"  style="display: none;">\n' +
                                        '<span class="sr-only">Loading...</span>\n' +
                                        '</div></div>');
                                    $(".spinner-border").css("display", "block");
                                },
                                success: function (response) {
                                    $(".spinner-border").css("display", "none");
                                    let appendData = '';
                                    if (response.code === 200) {
                                        $('#mediumProfileDiv').append('<div class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                            '<div class="symbol-label"\n' +
                                            'style="background-image:url(' + response.profileData.imageUrl + ')"></div>\n' +
                                            '</div>\n' +
                                            '<div>\n' +
                                            '<a href="' + response.profileData.url + '"\n' +
                                            'class="font-weight-bolder font-size-h5 text-hover-primary"\n' +
                                            'target="_blank">\n' +
                                            '' + response.profileData.name + ' <i\n' +
                                            '</a>\n' +
                                            '<div class="text-muted">\n' +
                                            '' + response.profileData.username +
                                            '</div>\n' +
                                            '</div>');
                                        response.data.map(element => {
                                            appendData += '<div class="col-xl-6">\n' +
                                                '<div class="card">\n' +
                                                '<div class="card-body">\n' +
                                                '<a href="#">\n' +
                                                '<img src="' + element.imageUrl + '" alt="image"\n' +
                                                'class="img-fluid card-img">\n' +
                                                '</a>\n' +
                                                '<div class="mt-5">\n' +
                                                '<a href="' + element.url + '" target="_blank"\n' +
                                                'class="font-weight-bolder font-size-h5 text-hover-primary">\n' +
                                                '' + element.name + '' +
                                                '</a>\n' +
                                                '<p class="mt-2">' + element.description + '</p>\n' +
                                                '</div>\n' +
                                                '</a>\n' +
                                                '</div>\n' +
                                                '</div>\n' +
                                                '</div>';
                                        });
                                        $('#mediumFeeds').append(appendData);
                                    } else if (response.code === 400) {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            response.error + '</div>');
                                    } else {
                                        $('#mediumFeeds').append('<div style="color: Red;text-align:center;">\n' +
                                            'Some error occured, Can not get User publications' + '</div>');
                                    }
                                }
                            });
                        }

                        function publishOnMedium(id) {
                            let title = $('#titleText').val();
                            let desc = $('#descriptionText').val();
                            let tags = [];
                            $('.select2-selection__choice').each(function () {
                                tags.push($('.select2-selection__choice').attr('title'));
                            });
                            let tagsLength = $('li.select2-selection__choice').length;
                            if (title === '') {
                                toastr.error('Please Enter the title');
                            } else if (desc === '') {
                                toastr.error('Please Enter the Description');

                            } else if (tagsLength === 0) {
                                toastr.error('Please Enter Some Tags to post');

                            } else {
                                $.ajax({
                                    type: 'post',
                                    url: '/publishOnMedium',
                                    dataType: 'json',
                                    data: {accID: accounId, descriptionText: desc, titleText: title, tags: tags},
                                    headers: {
                                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                    },
                                    beforeSend: function () {
                                        $('#publishButton').html('Publishing...');
                                    },
                                    success: function (response) {
                                        $('#publishButton').html('Publish Now');
                                        if (response.code === 200) {
                                            toastr.success('Successfully Published on Medium profile');
                                            $('.mediumfeedModal').modal('hide');
                                            $('#titleText').empty();
                                            $('#descriptionText').empty();
                                            $('.select2-selection__choice').remove();

                                        } else if (response.code === 400) {
                                            toastr.error(response.error);
                                            $('.mediumfeedModal').modal('hide');
                                            $('#titleText').empty();
                                            $('#descriptionText').empty();
                                            $('.select2-selection__choice').remove();

                                        } else {
                                            toastr.error('Some error occured, in publishing , please reoload page');
                                            $('.mediumfeedModal').modal('hide');
                                            $('#titleText').empty();
                                            $('#descriptionText').empty();
                                            $('.select2-selection__choice').remove();

                                        }
                                    }
                                });
                            }
                        }


                        function isValidURL(str) {
                            let regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
                            if (!regex.test(str)) {
                                return false;
                            } else {
                                return true;
                            }
                        }

                        function timeConverter(UNIX_timestamp) {
                            let a = new Date(UNIX_timestamp * 1000);
                            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            let year = a.getFullYear();
                            let month = months[a.getMonth()];
                            let date = a.getDate();
                            let hour = a.getHours();
                            let min = a.getMinutes();
                            let sec = a.getSeconds();
                            let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
                            return time;
                        }

                        $('#chatID').tootip();

                        /**
                         * TODO We have to publish particular twitter post from particular twitter feed on multiple social account.
                         * This function is used for publishing  particular twitter post from particular twitter feed on multiple social account
                         * @param {string} description-description of particular twitter post .
                         * @param {string} mediaUrl- link of image or video in the twitter post.
                         * @param {string} type- type of the post video ,image or no media urls.
                         * @param {string} title- title on post.
                         * @param {sourceUrl} sourceUrlon post.
                         * ! Do not change this function without referring API format of resocio.
                         */
                        function resocioButton(description, mediaUrl, type, title, sourceUrl) {
                            publishOrFeeds = 1;
                            $('body').find('#resocioModal').remove();
                            let action = '/discovery/content_studio/publish-content/feeds-modal';
                            let isType = (type == null) ? 'no media' : type;
                            $.ajax({
                                headers: {
                                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                },
                                type: 'post',
                                url: action,
                                data: {
                                    mediaUrl, sourceUrl,
                                    description, type, isType
                                },
                                success: function (data) {
                                    $('body').append(data.html);
                                    $('body').find('#resocioModal').modal('show');
                                    // begin:normal post emoji
                                    $('body').find("#normal_post_area").emojioneArea({
                                        pickerPosition: "right",
                                        tonesStyle: "bullet"
                                    });
                                    downloadMediaUrl();
                                },
                                error: function (error) {
                                    if (error.responseJSON.message) {
                                        toastr.error(`${error.responseJSON.message}`);
                                    }
                                },
                            });
                        };

                        // end:images and videos upload
                    </script>
@endsection
