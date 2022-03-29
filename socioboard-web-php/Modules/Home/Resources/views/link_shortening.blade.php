@extends('home::layouts.UserLayout')
<head>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Link Shortening</title>
@endsection
@section('content')
    @if(session('failed'))
        <script>
            Swal.fire({
                icon: 'error',
                text: "{{session('failed')}}",
            });
        </script>
    @elseif(session('success'))
        <script>
            Swal.fire({
                    icon: 'success',
                    title: "{{session('success')}}"
                }
            );
        </script>
    @endif

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <div class="card p-5">
                    <div class="card-title align-items-start flex-column">
                        <h3 class="card-label font-weight-bolder">Link Shortener</h3>
                    </div>
                    <!--begin::Profile-->
                    <div class="row">
                        <!--begin::Aside-->
                        <div class="col-md-6">
                            <!--begin::Profile Card-->
                            <div class="card card-custom card-stretch">
                                <!--begin::Body-->
                                <div class="card-body pt-4">
                                    <label class="radio radio-lg mb-2 link-shortening-label radioButtonShortening">
                                        <input type="checkbox" name="social" id="usage" />
                                        <span></span>
                                        <div class="font-size-lg font-weight-bold ml-4">No Shortening</div>
                                    </label>
                                    <p class="mt-5">Clicks on links will not be tracked</p>
                                </div>
                                <!--end::Body-->
                            </div>
                            <!--end::Profile Card-->
                        </div>
                        <!--end::Aside-->
                        <!--begin::Content-->
                        @if(session('bitly') !== "false")
                        <div class="col-md-6 link-shortening" id="inputss">
                            <div class="card card-custom card-stretch">
                                <!--begin::Body-->
                                <div class="card-body pt-4">
                                    <label class="radio radio-lg mb-2 link-shortening-label">
                                        <input type="checkbox" name="socialss" id="bitly" {{session('bitly') !== "false" ? "checked" : ""}} />
                                        <span></span>
                                        <div class="font-size-lg font-weight-bold ml-4 bityRadioBtn">bit.ly</div>
                                    </label>
                                    <script>
                                        let visiblity = localStorage.getItem("visible");
                                    </script>
                                    @if(session('bitly') !== "false")
                                    <div class="card-body pt-4 bg-colored" id="visibleId">
                                    <p class="mt-5">All URLs will be sent as shortened and simplified URLs while publishing.</p>
                                    @if(session('bitly') === "false")
                                    <a href="/add-accounts/Bitly" type="button" class="btn font-weight-bolder mr-2 px-8">Connect</a><br>
                                    @else
                                            <div class="mb-3 d-flex align-items-center justify-content-centr">
                                                <div class="form-group mr-3 mb-0">
                                                    <input class="form-control form-control-solid py-7 mr-5 rounded-lg font-size-h6 nameTextBoxDiv" type="text" autocomplete="off" disabled
                                                           placeholder="Enter Account" value="{{$SocialAccounts['bitly']['account'][0]->user_name}}">
                                                </div>
                                                <div class="form-group mr-3 mb-0">
                                                    @php
                                                        $date = new DateTime($SocialAccounts['bitly']['account'][0]->create_on);
                                                        $new_date_format = $date->format('Y-m-d');
                                                    @endphp
                                                    <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" disabled
                                                           id="schedule_normal_post_daterange" placeholder="Select date & time" value="{{$new_date_format}}"  />
                                                </div>
                                                <button type="button" class="btn font-weight-bolder  px-8" data-toggle="modal" data-target="#deleteImageModal">Delete</button>

                                                <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel"
                                                     aria-hidden="true">
                                                    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                                        <div class="modal-content">
                                                            <div class="modal-header">
                                                                <h5 class="modal-title" id="deleteImageModalLabel">Delete Account</h5>
                                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                    <i aria-hidden="true" class="ki ki-close"></i>
                                                                </button>
                                                            </div>
                                                            <div class="modal-body">
                                                                    <div class="text-center">
                                                                        <span class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this Account? </span>
                                                                    </div>
                                                                    <div class="d-flex justify-content-center">
                                                                        <a type="submit" onclick="deleteIt('{{$SocialAccounts['bitly']['account'][0]->account_id}}')"
                                                                                class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                                id="image-delete">Delete it! </a>
                                                                        <a href="javascript:;" type="button"
                                                                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                                                                            thanks. </a>
                                                                    </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    <button type="button" class="btn symbol-label font-weight-bolder mr-2  mt-5 px-8" disabled>Connected</button>
                                    @endif
                                    <form id="shortUrl">
                                        @csrf
                                        @if(session('bitly') === "true")
                                    <div class="form-group mt-5 d-flex" id="input_urls_for_short">
                                        <input class="form-control form-control-solid py-7 mr-6 rounded-lg font-size-h6 short_link_URL" type="text" name="short_link" autocomplete="off" placeholder="Enter URL">
                                        <button type="submit" id="submitButton" class="btn font-weight-bolder mr-2  px-8">Generate</button>
                                    </div>
                                            @endif
                                    </form>
                                    <div id="OutputURL">

                                    </div>
                                    </div>
                                        @else
                                        <div class="card-body pt-4 link-shortening" id="visibleId">
                                            <p class="mt-5">All URLs will be sent as shortened and simplified URLs while publishing.</p>
                                            @if(session('bitly') === "false")
                                                <a href="/add-accounts/Bitly" type="button" class="btn font-weight-bolder mr-2 px-8">Connect</a><br>
                                            @endif
                                            <form id="shortUrl">
                                                @csrf
                                                @if(session('bitly') === "true")
                                                    <div class="form-group mt-5 d-flex" id="input_urls_for_short">
                                                        <input class="form-control form-control-solid py-7 mr-6 rounded-lg font-size-h6" type="text" name="short_link" autocomplete="off" placeholder="Enter URL">
                                                        <button type="submit" id="submitButton" class="btn font-weight-bolder mr-2  px-8">Generate</button>
                                                    </div>
                                                @endif
                                            </form>
                                            <div id="OutputURL">

                                            </div>
                                        </div>
                                    @endif
                                </div>
                                <!--end::Body-->
                            </div>
                        </div>
                        @else
                            <div class="col-md-6 link-shortening" id="inputss">
                                <div class="card card-custom card-stretch">
                                    <!--begin::Body-->
                                    <div class="card-body pt-4">
                                        <label class="radio radio-lg mb-2 link-shortening-label">
                                            <input type="checkbox" name="socialss" id="bitly" {{session('bitly') !== "false" ? "checked" : ""}} />
                                            <span></span>
                                            <div class="font-size-lg font-weight-bold ml-4 bityRadioBtn">bit.ly</div>
                                        </label>
                                        <script>
                                            let visiblity = localStorage.getItem("visible");
                                        </script>
                                        @if(session('bitly') !== "false")
                                            <div class="card-body pt-4" id="visibleId">
                                                <p class="mt-5">All URLs will be sent as shortened and simplified URLs while publishing.</p>
                                                @if(session('bitly') === "false")
                                                    <a href="/add-accounts/Bitly" type="button" class="btn font-weight-bolder mr-2 px-8">Connect</a><br>
                                                @else
                                                    <div class="mb-3 d-flex align-items-center justify-content-centr">
                                                        <div class="form-group mr-3 mb-0">
                                                            <input class="form-control form-control-solid py-7 mr-5 rounded-lg font-size-h6" type="text" autocomplete="off" disabled
                                                                   placeholder="Enter Account" value="{{$SocialAccounts['bitly']['account'][0]->user_name}}">
                                                        </div>
                                                        <div class="form-group mr-3 mb-0">
                                                            @php
                                                                $date = new DateTime($SocialAccounts['bitly']['account'][0]->create_on);
                                                                $new_date_format = $date->format('Y-m-d');
                                                            @endphp
                                                            <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" disabled
                                                                   id="schedule_normal_post_daterange" placeholder="Select date & time" value="{{$new_date_format}}"  />
                                                        </div>
                                                        <button type="button" class="btn font-weight-bolder  px-8" data-toggle="modal" data-target="#deleteImageModal">Delete</button>

                                                        <div class="modal fade" id="deleteImageModal" tabindex="-1" role="dialog" aria-labelledby="deleteImageModalLabel"
                                                             aria-hidden="true">
                                                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                                                <div class="modal-content">
                                                                    <div class="modal-header">
                                                                        <h5 class="modal-title" id="deleteImageModalLabel">Delete Account</h5>
                                                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                                            <i aria-hidden="true" class="ki ki-close"></i>
                                                                        </button>
                                                                    </div>
                                                                    <div class="modal-body">
                                                                        <div class="text-center">
                                                                            <span class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this Account? </span>
                                                                        </div>
                                                                        <div class="d-flex justify-content-center">
                                                                            <a type="submit" onclick="deleteIt('{{$SocialAccounts['bitly']['account'][0]->account_id}}')"
                                                                               class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                               id="image-delete">Delete it! </a>
                                                                            <a href="javascript:;" type="button"
                                                                               class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                                                                                thanks. </a>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button type="button" class="btn symbol-label font-weight-bolder mr-2  mt-5 px-8" disabled>Connected</button>
                                                @endif
                                                <form id="shortUrl">
                                                    @csrf
                                                    @if(session('bitly') === "true")
                                                        <div class="form-group mt-5 d-flex" id="input_urls_for_short">
                                                            <input class="form-control form-control-solid py-7 mr-6 rounded-lg font-size-h6" type="text" name="short_link" autocomplete="off" placeholder="Enter URL">
                                                            <button type="submit" id="submitButton" class="btn font-weight-bolder mr-2  px-8">Generate</button>
                                                        </div>
                                                    @endif
                                                </form>
                                                <div id="OutputURL">

                                                </div>
                                            </div>
                                        @else
                                            <div class="card-body pt-4" id="visibleId">
                                                <p class="mt-5">All URLs will be sent as it is without simplify while publishing.</p>
                                                @if(session('bitly') === "false")
                                                    <a href="/add-accounts/Bitly" type="button" class="btn font-weight-bolder mr-2 px-8">Connect</a><br>
                                                @endif
                                                <form id="shortUrl">
                                                    @csrf
                                                    @if(session('bitly') === "true")
                                                        <div class="form-group mt-5 d-flex" id="input_urls_for_short">
                                                            <input class="form-control form-control-solid py-7 mr-6 rounded-lg font-size-h6" type="text" name="short_link" autocomplete="off" placeholder="Enter URL">
                                                            <button type="submit" id="submitButton" class="btn font-weight-bolder mr-2  px-8">Generate</button>
                                                        </div>
                                                    @endif
                                                </form>
                                                <div id="OutputURL">

                                                </div>
                                            </div>
                                        @endif
                                    </div>
                                    <!--end::Body-->
                                </div>
                            </div>
                        @endif
                        <!--end::Content-->
                    </div>
                </div>
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection
@section('scripts')
    <script>
    $('#home_tab').trigger('click');
    $(document).ready(function() {
        // $('#visibleId').hide();
        $(document).on('click','#usage', function () {
            if($("input:checkbox[name='social']").is(":checked")) {
                $('#inputss').hide();
            }else{

                $('#inputss').show();
            }
        });

        $(document).on('click','#bitly', function () {
            let elem = document.getElementById('visibleId');
            if($("input:checkbox[name='socialss']").is(":checked")) {
                elem.style.display = 'block';
            }else{
                elem.style.display = 'none';
            }
        });
    });

    $(document).on('submit','#shortUrl', function (e) {
        e.preventDefault();
        $('#submitButton').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
        let form = document.getElementById('shortUrl');
        let formData = new FormData(form);
        $.ajax({
            type: "post",
            url: "/bitly/get-shortened-link",
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: formData,
            processData: false,
            cache: false,
            contentType: false,
            success: function (response) {
                $('#submitButton').empty().append('Submit');
                if (response.code === 200){
                    $('#OutputURL').empty().append('<div class="link-shortening-text" id="responseURL">'+response.data.link+'<span class="ml-auto"><i class="icon-md far fa-file-alt" onclick="myFunction()"></i><i class="icon-md fas fa-check-circle ml-4"></i></span></div>')
                }else if (response.error == "\"long_url\" must be a string"){
                    toastr.error("URL field is required");
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                $('#submitButton').empty().append('Submit');
                toastr.error(error.message);
            },
        });
    })

    function myFunction() {
        let copyText = document.getElementById("responseURL");
        let elementText = copyText.textContent; //get the text content from the element
        navigator.clipboard.writeText(elementText);
        toastr.success('Copied')
    }

    function deleteIt(id) {
        $.ajax({
            type: "delete",
            url: 'bitly/delete',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: {id},
            success: function (response) {
                $("#deleteImageModal").modal("hide");
                if (response.code === 200) {
                    toastr.success(response.message);
                    window.location.reload();
                } else {
                    toastr.alert(response.data.message);
                }
            },
            error: function (error) {
                toastr.alert(error.message);
            }
        })
    }

    </script>


@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

