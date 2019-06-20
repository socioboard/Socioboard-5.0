@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard |  BoardMe list</title>
@endsection

@section('style')
    <style type="text/css">
        .profile_action_dropdown .dropdown-toggle::before {
            content: none;
        }
    </style>
    @endsection

@section('boardMeList')
    <div class="row mt-5">
        <div class="col-md-12 mt-2">
            <h4 class="float-left">BoardMe</h4>
            <a
                    class="btn btn-sm btn-primary float-right"
                    href="#"
                    data-toggle="modal"
                    data-target="#createBoardModal"
                    >
                Create Board</a
                    >
        </div>
        <div class="col-md-12">
            <div class="card border-0 shadow mb-3">
                <div class="card-body">
                    <table class="table table-borderless">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Board Name</th>
                            <th scope="col">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th scope="row">1</th>
                            <td>
                                <a href="boardme.html" class="text-dark">Board 1</a>
                            </td>
                            <td>
                                <a href="boardme.html" class="btn btn-sm btn-primary">
                                    <i class="far fa-eye"></i>
                                </a>
                                <a href="#" class="btn btn-sm btn-danger">
                                    <i class="far fa-trash-alt"></i>
                                </a>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>


    <!-- create board modal -->
    <div
            class="modal fade"
            id="createBoardModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="createBoardModalLabel"
            aria-hidden="true"
            >
        <div class="modal-dialog  modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Board</h5>
                    <button
                            type="button"
                            class="close"
                            data-dismiss="modal"
                            aria-label="Close"
                            >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="boardAdd">
                        <div class="form-group">
                            <label for="boardname">Board Name</label>
                            <input type="text" class="form-control" id="boardname" name="boardName" placeholder="Enter Board Name"/>
                        </div>
                        <div class="form-group">
                            <label for="keyword">Keyword</label>
                            <input type="text" class="form-control" id="keyword" name="boardKeyword" placeholder="Keyword"/>
                        </div> <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">
                                Close
                            </button>
                            <button type="button" class="btn btn-primary" id="BoardMeAdd">Create</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
    @endsection

@section('script')
    <script>
        $(document).on('click','#BoardMeAdd',function() {
            var form = document.getElementById('boardAdd');

            var formData = new FormData(form);

            $.ajax({
                url: "/board-me-add",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){

                },
                success: function (response) {
                    console.log(response);
                    $('#createBoardModal').modal('hide');

                },
                error:function(error){
                    console.log(error)
                    $('#createBoardModal').modal('hide');
                }
            })
        });
    </script>
    @endsection
