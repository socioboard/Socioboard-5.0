@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Pinterest Boards</title>
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
                                    <h3 class="card-title font-weight-bolder">Pinterest Boards</h3>
                                    <p>If You want see latest boards and pins then update the cron in the view accounts section. </p>
                                </div>
                                <div class="ml-auto">
                                    <div class="row d-flex align-items-center justify-content-center">
                                        @if($message === 'success' || $message === 'No Boards have found yet! for Pinterest account'  )
                                            <div class="col-md-4" id="imageDiv">
                                                <div class="view-board-pic"><img
                                                            src="{{$accounts[0]->profile_pic_url}}">
                                                </div>
                                            </div>
                                        @endif
                                        <div class="col-md-8">
                                            <div class="form-group mb-0">
                                                <select
                                                        class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 selectAccountsDiv"
                                                        onchange="call(this)">
                                                    @if($message=== 'success' || $message === 'No Boards have found yet! for Pinterest account' )
                                                        <script>
                                                            var accounId = <?php echo $accounts[0]->account_id; ?>;
                                                        </script>
                                                        <option disabled>Select Account</option>
                                                        @foreach($accounts as $data)
                                                            <option
                                                                    value="{{$data->account_id}}">{{$data->first_name}}
                                                            </option>
                                                        @endforeach
                                                    @elseif($message=== 'failed')
                                                        <option selected value="failed"> Sorry some error ,occurred
                                                            please reload page
                                                        </option>
                                                    @elseif($message=== 'No Pinterest account added yet! or Account has locked')
                                                        <option selected value="failed">No Pinterest accounts to show
                                                        </option>
                                                    @else
                                                        <option selected value="failed"> {{$message}}
                                                        </option>
                                                    @endif
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!--end::Header-->
                        </div>
                        <!--end::Borad-->
                    </div>
                </div>
                <div id="boardRow" class="text-center row">
                        @if($message === 'success')
                            @foreach($boards as $data)
                                <div class="col-xl-4">
                                    <!--begin::Borad-->
                                    <div class="card card-custom p-6 mb-8">
                                        <div class="card-body">
                                            <div class="d-flex align-items-center justify-content-between">
                                                <!--begin::Content-->
                                                <div class="boardNameDiv">

                                                    <h2 class="mb-4"><a href="{{$data->board_url}}"
                                                                        target="_blank">{{$data->board_name}}</a>
                                                    </h2>
                                                </div>
                                                <!--end::Content-->

                                                <!--begin::Button-->
                                                <div class="">
                                                    <a href="get-pinterest-pins?boardId={{$data->board_id}}'&accId={{$data->social_account_id}}'&baordname={{$data->board_name}}"
                                                       class="btn text-danger font-weight-bolder text-uppercase font-size-lg py-3 px-6" >View
                                                        Pins</a>
                                                </div>
                                                <!--end::Button-->
                                            </div>
                                        </div>
                                    </div>
                                    <!--end::Borad-->
                                </div>
                            @endforeach
                        @elseif($message === 'failed')

                            <div class="symbol symbol-150 text-center">
                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                            </div>
                        <h3>Some error occured,Can not show Boards of pinterest account</h3>
                        @else
                            <div class="symbol symbol-150 noPinterestBoardsDiv">

                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                            </div>
                    @if($message === 'No Pinterest account added yet! or Account has locked')
                            <h3 class="text-center">Can not show Pinterest Boards as, no Pinterest account added yet! or Account has been locked</h3>
                        @else
                            <h3 class="text-center">Can not show Pinterest Boards as ,{{$message}}</h3>
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
    <!--end::Content-->
@endsection
@section('scripts')
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script>
        $(document).ready(function () {
            $("#discovery").trigger("click");
        });

        /**
         * TODO we've to get  the twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
         * This function is used for getting twitter feeds and data of a particular twitter account on change of twitter accounts from dropdown.
         * @param {this} data- account id of that particular twitter account.
         * ! Do not change this function without referring API format of getting the twitter feeds.
         */
        function call(data) {
            accounId = data.value;//accountid of particular twitter account from dropdown
            getPinterestBoards(data.value);
        }

        function getPinterestBoards(accID) {
            $.ajax({
                type: 'post',
                url: '/get-boards-on-change',
                data: {
                    accID
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#boardRow').empty();
                    $('#imageDiv').empty();
                    $('#boardRow').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status"  style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div></div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        let appendData = '';
                        if (response.data.length > 0) {
                            response.data.map(element => {
                                appendData += '<div class="col-xl-4">\n' +
                                    '<div class="card card-custom p-2 mb-8">\n' +
                                    '<div class="card-body">\n' +
                                    '<div class="row">\n' +
                                    '<div class="boardNameDiv">\n' +
                                    ' <h2 class="mb-4"><a href="' + element.board_url + '"\n' +
                                    'target="_blank">' + element.board_name + '</a>\n' +
                                    '</h2>\n' +
                                    '</div>\n' +
                                    '<div class="col-sm-12 d-flex align-items-center justify-content-sm-end">\n' +
                                    '<a href="get-pinterest-pins?boardId=' + element.board_id + '&accId=' + element.social_account_id + '&baordname=' + element.board_name + '"\n' +
                                    'class="btn text-danger font-weight-bolder text-uppercase font-size-lg py-3 px-6" target="_blank">View\n' +
                                    'Pins</a>\n' +
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</div>\n' +
                                    '</div>';
                            });
                        } else {
                            $('#boardRow').append('<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                '<h3>' + 'No Boards found for this account' + '</h3>');
                        }

                        $('#boardRow').append(appendData);
                        $('#imageDiv').append('<div class="view-board-pic"><img src="' + response.profilePic + '">\n' +
                            '</div>');
                    } else if (response.code === 400) {
                        $('#boardRow').append('<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h3>' + response.message + '</h3>');

                    } else {
                        $('#boardRow').append('<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h3>Some error occured,Can not show Boards of pinterest account</h3>');
                    }
                }
            });
        }

    </script>
@endsection
