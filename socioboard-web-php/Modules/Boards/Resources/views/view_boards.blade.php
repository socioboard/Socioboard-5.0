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
                <!--begin::Boards-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-12">
                        <!--begin::Borad-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <div>
                                    <h3 class="card-title font-weight-bolder">BoardMe</h3>
                                    <p>This feature allows us to save some long search keywords with a conventional naming and provide us to search those keywords in YouTube with one-click</p>
                                </div>

                                <div class="card-toolbar">
                                    <a href="javascript:;" class="btn btn-sm createBoardButtonDiv" data-toggle="modal" data-target="#createBoardModal" >
                                        Create Board
                                    </a>
                                </div>
                            </div>
                            <!--end::Header-->
                        </div>
                        <!--end::Borad-->
                    </div>

                    @if(isset($ErrorMessage))
                        <div class="card-body">
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                </div>
                                <h6>{{$ErrorMessage}}</h6>
                            </div>
                        </div>
                    @endif

                    @if(isset($accounts))
                        @if(count($accounts['data']) !== 0)
                            @foreach ($accounts['data'] as $account )

                                <div class="col-xl-3 d-flex align-items-stretch board-card" id="board{{$account->id}}">
                                    <!--begin::Borad-->
                                    <div class="card card-custom p-2 mb-8">
                                        <div class="card-body">
                                            <div class="row">
                                                <!--begin::Content-->
                                                <div class="col-sm-12">
                                                    <h2 class="mb-4 keywordNamediv">{{$account->keyword}}</h2>
                                                    <h4 class="text-primary line-height-lg boardName">
                                                        {{$account->board_name}}
                                                    </h4>
                                                </div>
                                                <!--end::Content-->
                                                @php
                                                    $keyword = str_replace("#","",$account->keyword);@endphp
                                                <!--begin::Button-->
                                                <div class="col-sm-12 d-flex align-items-center justify-content-center">
                                                    <a href="/boards/board-me/{{$keyword}}/{{'real'}}/{{$account->id}}" class="btn text-warning font-weight-bolder text-uppercase font-size-lg py-3 px-6 mr-5 viewButtonDiv" title="Search In youtube">View</a>
                                                    <a href="boardme/board.html" class="btn text-warning font-weight-bolder text-uppercase font-size-lg py-3 px-6 mr-5 editButtonDiv" data-toggle="modal" data-target="#updateBoardModal{{$account->id}}">Edit</a>
                                                    <a href="javascript:;" class="btn text-danger font-weight-bolder text-uppercase font-size-lg py-3 px-6 deleteButtonDiv" data-toggle="modal" data-target="#deleteBoardModal{{$account->id}}">Delete</a>
                                                </div>
                                                <!--end::Button-->
                                            </div>
                                        </div>
                                    </div>
                                    <!--end::Borad-->
                                    <div class="modal fade" id="deleteBoardModal{{$account->id}}" tabindex="-1" role="dialog" aria-labelledby="deleteBoardModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="deleteBoardModalLabel">Delete Board</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <i aria-hidden="true" class="ki ki-close"></i>
                                                    </button>
                                                </div>
                                                <div class="modal-body">
                                                    <div class="text-center">
                                                        <span class="font-weight-bolder font-size-h4 ">Are you sure want to delete this board?</span>
                                                    </div>
                                                    <div class="d-flex justify-content-center">
                                                        <a href="javascript:;" type="button" onclick=" deleteIt('{{$account->id}}')" class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" id="board-delete">Delete it</a>
                                                        <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No thanks.</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal fade" id="updateBoardModal{{$account->id}}" tabindex="-1" role="dialog" aria-labelledby="updateBoardModalLabel" aria-hidden="true">
                                        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                            <div class="modal-content">
                                                <div class="modal-header">
                                                    <h5 class="modal-title" id="deleteBoardModalLabel">Update Board</h5>
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <i aria-hidden="true" class="ki ki-close"></i>
                                                    </button>
                                                </div>
                                                <form id="update_board">
                                                    @csrf
                                                    <div class="modal-body">
                                                        <!--begin::Form group-->
                                                        <div class="form-group">
                                                            <div class="input-icon">
                                                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6{{$account->id}}" id="boardname{{$account->id}}"  type="text" name="boardname" autocomplete="off" placeholder="Enter Board NAme" disabled value="{{$account->board_name}}"/>
                                                                <span><i class="fas fa-chalkboard-teacher"></i></span>
                                                            </div>
                                                            <span id="validboardname" style="color: red;font-size: medium;" role="alert"></span>
                                                        </div>
                                                        <!--end::Form group-->
                                                        <!--begin::Form group-->
                                                        <div class="form-group">
                                                            <div class="input-icon{{$account->id}}">
                                                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6{{$account->id}}" id="keyword{{$account->id}}" type="text" name="keywords" autocomplete="off" placeholder="Enter Keyword" value="{{$account->keyword}}"/>
                                                                <input type="hidden" id="id{{$account->id}}" name="id" value="{{$account->id}}">
                                                            </div>
                                                            <span id="validkeywords" style="color: red;font-size: medium;" role="alert"></span>
                                                        </div>
                                                        <!--end::Form group-->
                                                        <div class="d-flex justify-content-center">
                                                            <a class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" id="update_button{{$account->id}}" onclick="updateForm('{{$account->id}}');">Update</a>
                                                            <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">Close</a>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            @endforeach
                        @else
                            <div class="card-body">
                                <div class="text-center">
                                    <div class="symbol symbol-150">
                                        <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                    </div>
                                    <h6>Currently no boards added</h6>
                                </div>
                            </div>
                            @endif
                    @endif

                </div>
                <!--end::Row-->
                <!--end::Boards-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>

    <!-- begin::Delete board modal-->

    <!-- end::Delete board modal-->

    <div class="modal fade" id="createBoardModal" tabindex="-1" role="dialog" aria-labelledby="createBoardModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createBoardModalLabel">Create Board</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <form id="create_board">
                    @csrf
                    <div class="modal-body">
                        <!--begin::Form group-->
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text" name="boardname" autocomplete="off" placeholder="Enter Board Name"/>
                                <span><i class="fas fa-chalkboard-teacher"></i></span>
                            </div>
                            <span id="validboardname" style="color: red;font-size: medium;" role="alert"></span>
                        </div>
                        <!--end::Form group-->
                        <!--begin::Form group-->
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text" name="keywords" autocomplete="off" placeholder="Enter Keyword"/>
                                <span><i class="fas fa-hashtag"></i></span>
                            </div>
                            <span id="validkeywords" style="color: red;font-size: medium;" role="alert"></span>
                        </div>
                        <!--end::Form group-->
                        <div class="d-flex justify-content-center">
                            <button type="submit" id="create_button" onclick="" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Create</button>
                            <a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">Close</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>


@endsection

@section('scripts')


@endsection

@section('page-scripts')

    <script>
        // delete account
        $('#account-delete').click(function (event) {

            toastr.error("Your account has been deleted!", "Deleted");
        });
    </script>
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script type="text/javascript">
        $(document).ready(function(){
            $("#boards").trigger('click');
        });
    </script>
    <script>

        $(document).ready(function () {
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
                        $('#create_button').empty().append('Create board');
                        $("#createBoardModal").modal('hide');
                        if (response.code === 200) {
                            toastr.success(response.status,"Board Created successfully!!", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
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
                                    $('#validkeywords').html(errors.errors['boardname']);
                                    $('#validboardname').html(errors.errors['keywords']);
                                }
                            });
                        }
                    }
                })
            });
            $("#boards").trigger('click');
        })

        function updateForm(id) {
            var datastring = $("#keyword" + id).val();
            $('#update_button'+id).empty().append('<i class="fa fa-spinner fa-spin"></i>Updating board');
            $.ajax({
                url: "/boards/update-boards",
                type: "post",
                data: {
                    id: id,
                    keywords: datastring
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $("#updateBoardModal"+id).modal('hide');
                    $('#update_button'+id).empty().append('Update');
                    if (response['code'] === 200) {
                        toastr.success("", "Updated Successfully!!", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        })
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    $("#updateBoardModal"+id).modal('hide');
                    $('#update_button'+id).empty().append('Update');
                    toastr.error(error.ErrorMessage);
                }
            })
        }

        function deleteIt(id) {
            $.ajax({
                url: "/boards/board-delete/"+id,
                type: "delete",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response['code'] === 200) {
                        toastr.success("", "Board Deleted Successfully");
                        $('#board'+id).remove();
                        window.location.reload();
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    toastr.error(error.ErrorMessage);
                }
            })
        }

        function getSteps() {
            let StepsViewBoardsPage = [
                {
                    intro: 'Welcome to View Boards  Page'
                },
                {
                    element: document.querySelector('.selectAccountsDiv'),
                    intro: 'From here you can select Twitter  accounts of which You want to look for Feeds'
                },
            ];
            return StepsViewBoardsPage;
        }

        $('.introjs-step-0').click(function () {
            introStart();
        });

        const introStart = () => {
            introJs().setOptions({
                skipLabel: 'Skip',
                doneLabel: 'Finish',
                steps: getSteps()
            }).start();
        }
    </script>
@endsection


