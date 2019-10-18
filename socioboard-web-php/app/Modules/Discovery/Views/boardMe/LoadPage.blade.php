@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard |  BoardMe</title>
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
                    > Create Board</a>
        </div>
        <div class="col-md-12">
            <div class="card border-0 shadow mb-3">
                <div class="card-body">
                    <table class="table table-borderless" id="boardTable">
                        <thead>
                        <tr>
                            {{--<th scope="col">#</th>--}}
                            <th scope="col">Board Name</th>
                            <th scope="col">Keyword</th>
                            <th scope="col">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {{--<tr>--}}
                            {{--<th scope="row">1</th>--}}
                            {{--<td>--}}
                                {{--<a href="boardme.html" class="text-dark">Board 1</a>--}}
                            {{--</td>--}}
                            {{--<td>--}}
                                {{--<a href="#" class="btn btn-sm btn-primary" title="VIEW">--}}
                                    {{--<i class="far fa-eye"></i>--}}
                                {{--</a>--}}
                                {{--<a href="#" class="btn btn-sm btn-danger" title="DELETE">--}}
                                    {{--<i class="far fa-trash-alt"></i>--}}
                                {{--</a>--}}
                                {{--<a href="#" class="btn btn-sm btn-info" title="EDIT">--}}
                                    {{--<i class="fas fa-edit"></i>--}}
                                {{--</a>--}}

                            {{--</td>--}}
                        {{--</tr>--}}
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

    <!-- edit board modal -->
    <div
            class="modal fade"
            id="editBoardModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="editBoardModalLabel"
            aria-hidden="true"
            >
        <div class="modal-dialog  modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">EDIT Board</h5>
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
                    <form id="boardEdit">
                        <div class="form-group">
                            <label for="boardname">Board Name</label>
                            <input type="text" class="form-control" id="boardName" name="boardName" value="" readonly="readonly"  />
                        </div>
                        <div class="form-group">
                            <label for="boardId" style="display: none">Board ID</label>
                            <input type="text" class="form-control" id="boardId" name="boardId" value="" readonly="readonly" style="display: none"/>
                        </div>
                        <div class="form-group">
                            <label for="old-keyword">Old-Keyword</label>
                            <input type="text" class="form-control" id="oldKeyword" name="oldKeyword" value="" readonly="readonly"/>
                        </div>
                        <div class="form-group">
                            <label for="keyword">New-Keyword</label>
                            <input type="text" class="form-control" id="boardKeyword" name="boardKeyword" placeholder="Keyword" />
                        </div> <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">
                                Close
                            </button>
                            <button type="button" class="btn btn-primary" id="BoardEdit">Update</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>
    @endsection

@section('script')
    <script>
        //for GA
        var eventCategory = 'User';
        var eventAction = 'Board-Me';
        getAllBoards();

        $(document).on("click", ".open-editModal", function () {
            var boardName = $(this).data('name');
            var boardId = $(this).data('id');
            var keyword = $(this).data('keyword');
            $(".modal-body #boardName").val(boardName);
            $(".modal-body #boardId").val(boardId);
            $(".modal-body #oldKeyword").val(keyword);
        });


        //EditBoard
        $(document).on('click','#BoardEdit',function() {
            var newKeyword = $('#boardKeyword').val();
            var oldKeyword = $('#oldKeyword').val();
            var boardId = $('#boardId').val();
            console.log(boardId);
            var board = $('#boardName').val();
            var form = document.getElementById('boardEdit');
            var formData = new FormData(form);
            console.log(newKeyword+boardId);

            $.ajax({
                url: "/board-edit",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){

                },
                success: function (response) {
                    if(response.code == 200){
                        $('#'+oldKeyword).text(newKeyword);
                        swal("Updated Successfully");
                        $('#editBoardModal').modal('hide');
                        $("#boardEdit").trigger("reset");
                        document.getElementById(oldKeyword).setAttribute('id', newKeyword);
                        $("tr#"+boardId).replaceWith("<tr id="+boardId+">"+"<td id='board-name'>"+
                                "<p class='text-dark'>"+board+"</p>"+
                                "</td>"+
                                "<td id='board-keyword'>"+
                                "<p class='text-dark' id="+newKeyword+">"+newKeyword+"</p>"+
                                "</td>"+
                                "<td id='action'>"+
                                "<a id='search' href='{{env('APP_URL')}}boardView?boardName="+board+"&key="+newKeyword+"' class='btn btn-sm btn-primary' title='VIEW' target='_blank'><i class='far fa-eye'></i></a>"+
                                "<a id='edit' class='open-editModal btn btn-sm btn-info' href='#' data-toggle='modal' data-target='#editBoardModal' title='EDIT' data-name="+board+" data-keyword="+newKeyword+" data-id="+boardId+"> <i  class='fas fa-edit'></i></a>"+
                                "<a id='delete' href='#'  onclick='deleteBoard("+boardId+")' class='btn btn-sm btn-danger' title='DELETE'><i class='far fa-trash-alt'></i></a>"+
                                "</td></tr>");
                    }else{
                        swal(response.message);
                    }
                },
                error:function(error){
                    console.log(error)
                    $('#editBoardModal').modal('hide');
                }
            })

            document.getElementById('oldKeyword').innerHTML = '+newKeyword+';
        });


        function deleteBoard(boardId){

            $.ajax({
                type: 'post',
                url: "/delete-board",
                data :{boardId:boardId} ,
                cache: false,
                success: function (response) {
                    if (response.code == 200){

//                        setTimeout(function(){
//                            window.location.reload();
//                        }, 2000);

                        swal(response.message);
                    }

                    else
                        swal("Could not delete the Board!!!!");
                },
                error:function(error){
                }
            })
            var td = event.target.parentNode;
            var trr = td.parentNode; // the row to be removed
            trr.closest("tr").remove();

        }




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
                    if(response.code == 200){
                        swal(response.Data.board_name+" Board created successfully");
                        $('#createBoardModal').modal('hide');
                        $("#boardAdd").trigger("reset");
                    }else{
                        swal(response.message);

                    }
                    var boardName = response.Data.board_name;
                    var keyword = response.Data.keyword;
                    var boardId = response.Data.id;
                    $("#boardTable tbody").append( "<tr id="+boardId+">"+
                            "<td id='board-name'>"+
                            "<p class='text-dark'>"+response.Data.board_name+"</p>"+
                            "</td>"+
                            "<td id='board-keyword'>"+
                            "<p class='text-dark' id="+response.Data.keyword+">"+response.Data.keyword+"</p>"+
                            "</td>"+
                            "<td id='action'>"+
                            "<a id='search' href='{{env('APP_URL')}}boardView?boardName="+boardName+"&key="+keyword+"' class='btn btn-sm btn-primary' title='VIEW' target='_blank'><i class='far fa-eye'></i></a>"+
                            "<a id='edit' class='open-editModal btn btn-sm btn-info' href='#' data-toggle='modal' data-target='#editBoardModal' title='EDIT' data-name="+boardName+" data-keyword="+keyword+" data-id="+boardId+"> <i  class='fas fa-edit'></i></a>"+
                            "<a id='delete' href='#'  onclick='deleteBoard("+boardId+")' class='btn btn-sm btn-danger' title='DELETE'><i class='far fa-trash-alt'></i></a>"+
                            "</td>"+  "</tr>");


                },
                error:function(error){
                    console.log(error)
                    $('#createBoardModal').modal('hide');
                }
            })
//            getAllBoards();
        });


        function getAllBoards(){
            $.ajax({
                type: 'get',
                url: "/get-all-boards",
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    var brd = response['message'];
                    if (response.code == 200) {

                        var l = brd['length']-1 ;
                        var i = 0;
                        for(i; i <= l; i++) {
                           var boardId = brd[i]['id'];

                            $("#boardTable tbody").append("<tr id="+boardId+">" +
                                    "<td id='board-name'>" +
                                    "<p class='text-dark'>" + brd[i]['board_name'] + "</p>" +
                                    "</td>" +
                                    "<td id='board-keyword'>" +
                                    "<p class='text-dark' id="+brd[i]['keyword']+">" + brd[i]['keyword'] + "</p>" +
                                    "</td>" +
                                    "<td id='action'>" +
                                    "<a id='search' href='{{env('APP_URL')}}boardView?boardName=" + brd[i]['board_name'] + "&key=" + brd[i]['keyword'] + "' class='btn btn-sm btn-primary' title='VIEW' target='_blank'><i class='far fa-eye'></i></a>" +
                                    "<a id='edit' class='open-editModal btn btn-sm btn-info' href='#' data-toggle='modal' data-target='#editBoardModal' title='EDIT' data-keyword="+ brd[i]['keyword']+" data-name="+brd[i]['board_name']+" data-id="+boardId+"> <i  class='fas fa-edit'></i></a>"+
                                    "<a id='delete' href='JavaScript:Void(0);' class='btn btn-sm btn-danger' onclick='deleteBoard("+boardId+")' title='DELETE'><i class='far fa-trash-alt'></i></a>" +
                                    "</td>" + "</tr>");

                        }
                    } else swal("Could not fetch Boards' details currently!!!");
                },
                error:function(error){
                    console.log(error)
                }
            })

        }




    </script>
    <!-- Google Analytics -->
    <script>
        var email = document.getElementById("ga_email").value;
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
        ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
            'name': 'boards'
        });
        ga('boards.send', 'pageview');
        ga('boards.send', 'event', {
            'eventCategory': 'User',
            'eventAction': 'Board-Me',
            'eventLabel': '{{session('user')['userDetails']->email}}'
        });
    </script>
    <script async src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->
@endsection
