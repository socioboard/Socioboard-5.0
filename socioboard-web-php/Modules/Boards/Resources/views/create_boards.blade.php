@extends('home::layouts.UserLayout')

@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Boards</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Dashboard-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-md-6 offset-md-3">
                        <!--begin::Borad-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">BoardMe</h3>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <form id="create_board">
                                @csrf
                                <div class="card-body pt-2 position-relative overflow-hidden">
                                    <div class="">
                                        <!--begin::Form group-->
                                        <div class="form-group">
                                            <div class="input-icon">
                                                <input
                                                    class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                                    type="text" name="boardname" autocomplete="off" id="board_name"
                                                    placeholder="Enter Board Name"/>
                                                <span><i class="fas fa-chalkboard-teacher"></i></span>
                                            </div>
                                            <span id="validboardname" style="color: red;font-size: medium;" role="alert"></span>
                                        </div>
                                        <!--end::Form group-->
                                        <!--begin::Form group-->
                                        <div class="form-group">
                                            <div class="input-icon">
                                                <input
                                                    class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                                    type="text" name="keywords" autocomplete="off" id="keyword"
                                                    placeholder="Enter Keyword"/>
                                                <span><i class="fas fa-hashtag"></i></span>
                                            </div>
                                            <span id="validkeywords" style="color: red;font-size: medium;" role="alert"></span>
                                        </div>
                                        <!--end::Form group-->
                                        <div class="d-flex justify-content-center">
                                            <button type="submit" id="create_button"
                                                    class="btn text-primary font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">
                                                Create Board
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <!--end::Body-->
                        </div>
                        <!--end::Borad-->
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Dashboard-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>


@endsection

@section('scripts')
@endsection

@section('page-scripts')

    <script>

        $(document).ready(function () {
            $(document).on('keyup','#board_name', function () {
                $('#validboardname').remove();
            });

            $(document).on('keyup','#keyword', function () {
                $('#validkeywords').remove();
            });
            $(document).on('submit', '#create_board', function (e) {
                e.preventDefault();
                $('#create_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Creating board');
                let form = document.getElementById('create_board');
                let formData = new FormData(form);
                $.ajax({
                    url: '/boards/create-boards',
                    data: formData,
                    type: 'post',
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success(response.status,"Board Created successfully!!", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.href = "/boards/view-boards";
                                }
                            });
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                        }else if (response.code === 401){
                            toastr.error("Only alphanumeric values are allowed",response.message);
                        }else {
                            toastr.error(response.message, "error!");
                        }
                    },
                    error: function (error) {
                        if (error.status === 422) {
                            $('#create_button').empty().append('Create Board');
                            let errors = $.parseJSON(error.responseText);
                            $.each(errors, function (key, value) {
                                $('#response').addClass("alert alert-danger");
                                if ($.isPlainObject(value)) {
                                    $.each(value, function (key, value) {
                                        toastr.error(`${value}`);
                                    });
                                    $('#validboardname').html(errors.errors['boardname']);
                                    $('#validkeywords').html(errors.errors['keywords']);
                                }
                            });
                        }
                    }
                })
            });
            $("#boards").trigger('click');

        })
    </script>

@endsection

