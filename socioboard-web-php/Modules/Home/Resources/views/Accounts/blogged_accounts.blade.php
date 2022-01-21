@extends('home::layouts.UserLayout')
<head>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | blogged Accounts</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Accounts-->
                <div class="row">
                    <div class="col-xl-12">
                        <!--begin::Accounts-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Blogging Accounts(Medium & Tumblr)</h3>
                                <div class="card-toolbar">
                                    <!--begin::Row-->
                                    <a href="javascript:;" class="btn btn-sm font-weight-bold" data-toggle="modal"
                                       data-target="#mediumAccountsModal">
                                        <i class="fas fa-plus fa-fw"></i> Add Accounts
                                    </a>
                                </div>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <div class="row d-flex justify-content-center">
                                    <?php $medium = 0; $tumblr = 0;  ?>
                                    @if(isset($accountsCount))
                                        @if($accountsCount->code === 200)
                                            @foreach($accountsCount->data as $data)
                                                @switch($data->account_type)
                                                    @case(16)
                                                    <?php $tumblr = $data->count  ?>
                                                    @break
                                                    @case(14)
                                                    <?php $medium = $data->count  ?>
                                                    @break
                                                @endswitch
                                            @endforeach
                                        @endif
                                    @else
                                    @endif
                                    <div class="col-md-1 col-sm-12 card bg-medium border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2 bitly-image" data-toggle="tooltip" data-placement="top" title="Medium">
                                                        <img src="/media/png/medium-logo.png">
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$medium}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-tumblr border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2" data-toggle="tooltip" data-placement="top" title="Tumblr">
                                                            <i class="fab fa-tumblr fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$tumblr}}</b>
                                                    </span>
                                    </div>
                                </div>

                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Accounts-->
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-3">
                        <div class="form-group">
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                    onchange="updateStartValue(this)">
                                <option selected disabled>Select Star</option>
                                <option value="One">One</option>
                                <option value="Two">Two</option>
                                <option value="Three">Three</option>
                                <option value="Four">Four</option>
                                <option value="Five">Five</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <select class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                    id="sb_select2_accounts" name="param" multiple="multiple">
                                <option value="14">Medium</option>
                                <option value="16">Tumblr</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       id="userName"
                                       type="text" name="username" autocomplete="off" placeholder="User Name"/>
                                <span><i class="far fa-user"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="submit" class="btn font-weight-bolder font-size-h6 px-8 py-4"
                                onclick="searchAccountsFilter2()">Search
                        </button>
                    </div>
                </div>
                <div class="row" id="bloggedAccountsSectionView">
                    <?php $count = 0; ?>
                    @if(isset($ErrorMessage))
                        <div style="color: red;text-align:center;">
                            {{$ErrorMessage}}
                        </div>
                    @else
                        @if(isset($accounts))
                            @if($accounts->code  === 200 )
                                @if(count($accounts->data->teamSocialAccountDetails[0]->SocialAccount)!==0)
                                    @foreach($accounts->data->teamSocialAccountDetails[0]->SocialAccount as $account)
                                        @if( $account->account_type === 14 || $account->account_type === 16)
                                            <div class="col-xl-6" id="accountsSection{{$account->account_id}}">
                                                <div class="card card-custom gutter-b card-stretch">
                                                    <div class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                                        @if($account->account_type === 14 )
                                                            <div class="ribbon-target bg-medium"
                                                                 style="top: -2px; right: 20px;">
                                                                <!-- <i class="fab fa-facebook-f"></i> -->
                                                                <img src="/media/png/medium-logo.png">
                                                            </div>
                                                        @else
                                                            <div class="ribbon-target bg-tumblr"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-tumblr"></i>
                                                            </div>
                                                    @endif

                                                    <!--begin::User-->
                                                        <div
                                                                class="d-flex align-items-center  ribbon ribbon-clip ribbon-left">
                                                            <div id="status{{$account->account_id}}">
                                                                @if($account->join_table_teams_social_accounts->is_account_locked == true)
                                                                    <div class="ribbon-target" style="top: 12px;"
                                                                         onclick="lock('{{$account->account_id}}',0 )">
                                                                        <span class="ribbon-inner bg-danger"></span>
                                                                        <i
                                                                                class="fas fa-user-lock fa-fw mr-2 text-white"></i>
                                                                        Un-Lock
                                                                    </div>
                                                                @else
                                                                    <div class="ribbon-target" style="top: 80px;"
                                                                         onclick="lock('{{$account->account_id}}',1 )">
                                                                        <span class="ribbon-inner bg-info"></span>
                                                                        <i
                                                                                class="fas fa-lock-open fa-fw mr-2 text-white"></i>
                                                                        Lock
                                                                    </div>
                                                                @endif
                                                            </div>
                                                            <div
                                                                    class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                                <div class="symbol-label"
                                                                     style="background-image:url({{$account->profile_pic_url}})"></div>
                                                                <i class="symbol-badge bg-success"></i>
                                                            </div>
                                                            <div>
                                                                @if($account->join_table_teams_social_accounts->is_account_locked === false)
                                                                    @if($account->account_type === 13)
                                                                        <a>
                                                                            {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                        </a>
                                                                    @else
                                                                        <a href="{{$account->profile_url}}"
                                                                           target="_blank">
                                                                            {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                        </a>
                                                                    @endif
                                                                @else
                                                                    <a
                                                                    >
                                                                        {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                    </a>
                                                                @endif
                                                                <!-- begin:account star rating -->
                                                                <div class="rating-css">
                                                                    <div class="star-icon">
                                                                        <input type="radio"
                                                                               <?php if ($account->rating === 1) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating1{{$account->account_id}}"
                                                                               onclick="ratingUpdate('1', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating1{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 2) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating2{{$account->account_id}}"
                                                                               onclick="ratingUpdate('2', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating2{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 3) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating3{{$account->account_id}}"
                                                                               onclick="ratingUpdate('3', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating3{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 4) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating4{{$account->account_id}}"
                                                                               onclick="ratingUpdate('4', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating4{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 5) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating5{{$account->account_id}}"
                                                                               onclick="ratingUpdate('5', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating5{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                    </div>
                                                                </div>
                                                                <!-- end:account star rating -->

                                                                <div class="mt-2">
                                                                    @if($account->join_table_teams_social_accounts->is_account_locked === false)
                                                                        @if($account->account_type === 14)
                                                                            <a href="{{env('APP_URL')}}feeds/medium{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1">Profile</a>
                                                                        @elseif($account->account_type === 16)
                                                                            <a href="{{env('APP_URL')}}feeds/Tumblr{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1">Profile</a>
                                                                        @endif
                                                                    @else
                                                                        <a href="#"
                                                                           target="_blank" id="profileDivButton"
                                                                           onclick="return false"
                                                                           title="The Account is  Locked"
                                                                           class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1">Profile</a>
                                                                    @endif
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!--end::User-->

                                                        <!--begin::Contact-->
                                                        <div class="py-9">
                                                            {{--                                                            <div class="d-flex align-items-center justify-content-between mb-2">--}}
                                                            {{--                                                                <span class="font-weight-bold mr-2">Following:</span>--}}
                                                            {{--                                                                <a href="javascript:;"--}}
                                                            {{--                                                                   class=" text-hover-primary">9k</a>--}}
                                                            {{--                                                            </div>--}}
                                                            {{--                                                            <div class="d-flex align-items-center justify-content-between mb-2">--}}
                                                            {{--                                                                <span class="font-weight-bold mr-2">Followers:</span>--}}
                                                            {{--                                                                <span class="">99</span>--}}
                                                            {{--                                                            </div>--}}
                                                            {{--                                                            <div class="d-flex align-items-center justify-content-between mb-2">--}}
                                                            {{--                                                                <span class="font-weight-bold mr-2">Feeds:</span>--}}
                                                            {{--                                                                <span class="">0</span>--}}
                                                            {{--                                                            </div>--}}
                                                            <div
                                                                    class="d-flex align-items-center justify-content-between">
                                                                    <span
                                                                            class="font-weight-bold mr-2">Cron Update:</span>
                                                                <span class="switch switch-sm switch-icon"
                                                                      id="cronModify{{$account->account_id}}">


                                                        <label>
                                                          <input type="checkbox" id="cronUpdate{{$account->account_id}}"
                                                                 <?php if ($account->refresh_feeds == 2) echo "checked" ?> name="select"
                                                                 onclick="cronUpdate({{$account->account_id}}, {{$account->refresh_feeds}});">
                                                            <span></span>
                                                        </label>
                                                    </span>
                                                            </div>
                                                        </div>
                                                        <!--end::Contact-->
                                                        <!-- begin:Delete button -->
                                                        <div>
                                                            <a href="javascript:;"
                                                               class="btn text-danger font-weight-bolder font-size-h6 px-8 py-4 my-3 col-12"
                                                               data-toggle="modal"
                                                               data-target="#accountDeleteModal{{$account->account_id}}">Delete
                                                                account</a>
                                                        </div>
                                                        <!-- end:Delete button -->


                                                    </div>
                                                </div>
                                            </div>
                                        @else
                                            <?php $count++;?>
                                        @endif<!-- begin::Delete team modal-->
                                        <div class="modal fade" id="accountDeleteModal{{$account->account_id}}"
                                             tabindex="-1"
                                             role="dialog"
                                             aria-labelledby="teamDeleteModalLabel"
                                             aria-hidden="true">
                                            <div class="modal-dialog modal-dialog-centered modal-lg"
                                                 role="document">
                                                <div class="modal-content">
                                                    <div class="modal-header">
                                                        <h5 class="modal-title" id="teamDeleteModalLabel">Delete
                                                            This Account</h5>
                                                        <button type="button" class="close" data-dismiss="modal"
                                                                aria-label="Close">
                                                            <i aria-hidden="true" class="ki ki-close"></i>
                                                        </button>
                                                    </div>
                                                    <div class="modal-body">
                                                        <div class="text-center">
                                                            <img
                                                                    src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                                                            <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Account?</span>
                                                        </div>
                                                        <div class="d-flex justify-content-center">
                                                            <button type="submit"
                                                                    onclick="deleteSocialAcc('{{$account->account_id}}','{{$account->account_type}}')"
                                                                    class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                    id="{{$account->account_id}}"
                                                                    data-dismiss="modal">
                                                                Delete it
                                                            </button>
                                                            <a href="javascript:;" type="button"
                                                               class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                               data-dismiss="modal">No
                                                                thanks.</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- end::Delete account modal-->
                                    @endforeach
                                    @if($count === count($accounts->data->teamSocialAccountDetails[0]->SocialAccount))
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <div style="color: Red;text-align:center;">
                                                No Blogged Accounts present now
                                            </div>
                                        </div>
                                    @endif
                                @else
                                    <div class="text-center">
                                        <div class="symbol symbol-150">
                                            <img src="/media/svg/illustrations/no-accounts.svg"/>
                                        </div>
                                        <div style="color: Red;text-align:center;">
                                            No Social Accounts present now
                                        </div>
                                    </div>
                                @endif
                            @elseif($accounts['code']  === 400 )
                                <div style="color: Red;text-align:center;">
                                    Can not get Accounts as:,{{$accounts['error'] }}
                                </div>
                            @endif
                        @else
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <div style="color: Red;text-align:center;">
                                    Can not get Accounts Some error occured,please reload the page
                                </div>
                            </div>
                        @endif
                    @endif
                </div>
                <!--end::Row-->
                <!--end::Accounts-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
    <!-- begin:Add Accounts Modal for medium and bitly-->
    <div class="modal fade" id="mediumAccountsModal" tabindex="-1" role="dialog" aria-labelledby="addAccountsModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="mediumAccountsModalLabel">Add Accounts</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="">
                        <ul class="nav justify-content-center nav-pills" id="mediumAccountsTab" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active" id="medium-tab-accounts" data-toggle="tab"
                                   href="#medium-add-accounts">
        <span class="nav-text medium-black-logo"><img
                    src="/media/png/medium-logo-black.png"></span>
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="tumblr-tab-accounts"
                                   data-toggle="tab"
                                   href="#tumblr-add-accounts"
                                   aria-controls="tumblr">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-tumblr fa-2x"></i></span>

                                </a>
                            </li>
                        </ul>
                        <div class="tab-content mt-5" id="mediumAccountsTabContent">
                            <div class="medium-profile-info tab-pane fade show active" id="medium-add-accounts"
                                 role="tabpanel" aria-labelledby="medium-tab-accounts">
                                <p>Socioboard needs permission to access and publish content to your Medium account on Socioboard's
                                    behalf. To add a medium account please add your integration token of your medium
                                    account.</p>
                                <div>
                                    <input type="text"
                                           class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                           placeholder="Add Integration Token" id="accessTokenValue">
                                </div>
                                <div class="d-flex justify-content-center">
                                    <a type="button" onclick="addMediumProfile()"
                                       class="btn btn-medium font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add a
                                        medium Profile</a>
                                </div>

                            </div>
                            <div class="tab-pane fade"
                                 id="tumblr-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="tumblr-tab-accounts">
                                <p>Grant access to your profile to share updates , publish and view
                                    your feed.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/Tumblr" type="button"
                                       class="btn btn-tumblr font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Tumblr Profile</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end:Add Accounts Modal -->
@endsection
@section('scripts')
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="{{asset('js/accounts.js')}}"></script>
    <script>
        $('#sb_select2_accounts').select2({
            placeholder: 'Select Social Media',
        });
        $("#home_tab").trigger("click");
        $(document).ready(function () {
            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            });
        });
        function addMediumProfile() {
            let accessToken;
            accessToken = $('#accessTokenValue').val();
            if (accessToken === '') {
                toastr.error('Please enter Integration Token');

            } else {
                $.ajax({
                    url: 'add-medium-account',
                    data: {accessToken},
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    type: 'post',
                    dataType: 'json',
                    beforeSend: function () {
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            $('#mediumAccountsModal').modal('hide');
                            toastr.success("Medium Account has been added, Successfully", "", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                        } else {
                            toastr.error('Some error occured,in adding medium Profile');
                        }
                    }
                });
            }

        }

        /**
         * TODO we've to delete particular social account from socioboard.
         * This function is used for delete particular social account added in socioboard.
         * @param {integer) account id of particular social account   (twitter ,facebook ,youtube).
         * @param {integer) account type of particular social account   (twitter ,facebook ,youtube).
         * ! Do not change this function without referring API format of deleting social account.
         */
        function deleteSocialAcc(id, type) {
            $.ajax({
                url: 'delete-social-account',
                data: {accid: id},
                type: 'get',
                dataType: 'json',
                success: function (response) {
                    if (response.code === 200) {
                        $('div#accountsSection' + id).remove();
                        if (type === '2') {
                            toastr.success("Page Deleted Successfully", "", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                            toastr.success("Page Deleted Successfully");
                        } else {
                            toastr.success("Medium Account Deleted Successfully", "", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    } else if (response.code === 400) {
                        toastr.error(response.message, "Unable To Delete Account");
                    } else {
                        toastr.error('Some error occured', "Unable To Delete Account");
                    }
                }
            });
        }

        let last_selected;
        let team_selected;
        let social_media_selected;

        function updateStartValue(data) {//This function updates values of current star value selected from dropdown.
            last_selected = data.value;
        }

        function searchAccountsFilter2() {
            let selectedAccountTypes = [];
            let selecteddepartmentNames = [];

            $('#sb_select2_accounts').select2('data').forEach(function (dept) {
                selectedAccountTypes.push(dept.id);
                selecteddepartmentNames.push(dept.text);
            });
            let username = $('#userName').val();
            let selected_star;
            if (last_selected === undefined && username === '' && selecteddepartmentNames.length === 0) {
                toastr.error('Please first select any search filter value');
            } else {
                if (last_selected === 'One') {
                    selected_star = 1;
                } else if (last_selected === 'Two') {
                    selected_star = 2;
                } else if (last_selected === 'Three') {
                    selected_star = 3;
                } else if (last_selected === 'Four') {
                    selected_star = 4;
                } else if (last_selected === 'Five') {
                    selected_star = 5;
                } else {
                    selected_star = null;
                }
                $.ajax({
                    url: "search-Accounts-filter",
                    type: 'POST',
                    data: {
                        selected_star, username, selectedAccountTypes
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    beforeSend: function () {
                        $('#bloggedAccountsSectionView').empty().append('<div class="d-flex justify-content-center" >\n' +
                            '<div class="spinner-border" role="status"  style="display: none;">\n' +
                            '<span class="sr-only">Loading...</span>\n' +
                            '</div>\n' +
                            '</div>');
                        $(".spinner-border").css("display", "block");
                    },
                    success: function (response) {
                        $(".spinner-border").css("display", "none");
                        if (response.data.code === 200) {
                            let appendData = '';
                            let noBloggsCounts = 0;
                            if (response.data.data.teamSocialAccountDetails.length > 0) {
                                response.data.data.teamSocialAccountDetails[0].SocialAccount.map(element => {
                                        if (element.account_type === 14 || element.account_type === 16) {
                                            appendData += '<div class="col-xl-6">\n' +
                                                '<div class="card card-custom gutter-b card-stretch">\n' +
                                                '<div\n' +
                                                'class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">';
                                            if (element.account_type === 14) {
                                                appendData += '<div class="ribbon-target bg-medium" style="top: -2px; right: 20px;">\n' +
                                                    '<img src="/media/png/medium-logo.png">\n' +
                                                    '</div>';
                                            } else {
                                                appendData += '<div class="ribbon-target bg-tumblr"\n' +
                                                    'style="top: -2px; right: 20px;">\n' +
                                                    '<i class="fab fa-tumblr"></i>\n' +
                                                    '</div>';
                                            }
                                            appendData += '<div\n' +
                                                'class="d-flex align-items-center  ribbon ribbon-clip ribbon-left">\n' +
                                                '<div id="status' + element.account_id + '">';
                                            if (element.join_table_teams_social_accounts.is_account_locked === true) {
                                                appendData += ' <div class="ribbon-target" style="top: 12px;"\n' +
                                                    'onclick="lock(' + element.account_id + ',0 )">\n' +
                                                    '<span class="ribbon-inner bg-danger"></span>\n' +
                                                    '<i\n' +
                                                    'class="fas fa-user-lock fa-fw mr-2 text-white"></i>\n' +
                                                    'Un-Lock\n' +
                                                    '</div>';
                                            } else {
                                                appendData += '<div class="ribbon-target" style="top: 80px;"\n' +
                                                    'onclick="lock(' + element.account_id + ',1 )">\n' +
                                                    '<span class="ribbon-inner bg-info"></span>\n' +
                                                    '<i\n' +
                                                    'class="fas fa-lock-open fa-fw mr-2 text-white"></i>\n' +
                                                    'Lock\n' +
                                                    '</div>';
                                            }
                                            appendData += '</div><div\n' +
                                                'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                                '<div class="symbol-label"\n' +
                                                'style="background-image:url(' + element.profile_pic_url + ')"></div>\n' +
                                                '<i class="symbol-badge bg-success"></i>\n' +
                                                '</div>';
                                            appendData += '<div>\n';
                                            if (element.account_type !== 13) {
                                                appendData += '<a href="' + element.profile_url + '"\n' +
                                                    'target="_blank">\n' +
                                                    '' + element.first_name + " " + element.last_name + '\n' +
                                                    '</a>\n';
                                            } else {
                                                appendData += '<a' +
                                                    'target="_blank">\n' +
                                                    '' + element.first_name + " " + element.last_name + '\n' +
                                                    '</a>\n';
                                            }
                                            appendData += ' <div class="rating-css">\n' +
                                                '<div class="star-icon">\n' +
                                                '<input type="radio"';
                                            if (element.rating === 1) appendData += ' checked ';
                                            appendData += 'name="rating1' + element.account_id + '" id="rating1' + element.account_id + '"\n' +
                                                'onclick="ratingUpdate(\'1\', \'' + element.account_id + '\');">\n' +
                                                '<label\n' +
                                                'for="rating1' + element.account_id + '"\n' +
                                                'class="fas fa-star"></label>\n' +
                                                '<input type="radio"';
                                            if (element.rating === 2) appendData += ' checked ';
                                            appendData += ' name="rating2' + element.account_id + '" id="rating2' + element.account_id + '"\n' +
                                                'onclick="ratingUpdate(\'2\', \'' + element.account_id + '\');">\n' +
                                                '<label\n' +
                                                'for="rating2' + element.account_id + '"\n' +
                                                'class="fas fa-star"></label>\n' +
                                                '<input type="radio"';
                                            if (element.rating === 3) appendData += ' checked ';
                                            appendData += ' name="rating3' + element.account_id + '" id="rating3' + element.account_id + '"\n' +
                                                'onclick="ratingUpdate(\'3\', \'' + element.account_id + '\');">\n' +
                                                '<label\n' +
                                                'for="rating3' + element.account_id + '"\n' +
                                                'class="fas fa-star"></label>\n' +
                                                '<input type="radio"';
                                            if (element.rating === 4) appendData += ' checked ';
                                            appendData += ' name="rating4' + element.account_id + '" id="rating4' + element.account_id + '"\n' +
                                                'onclick="ratingUpdate(\'4\', \'' + element.account_id + '\');">\n' +
                                                '<label\n' +
                                                'for="rating4' + element.account_id + '"\n' +
                                                'class="fas fa-star"></label>\n' +
                                                '<input type="radio"';
                                            if (element.rating === 5) appendData += ' checked ';
                                            appendData += ' name="rating5' + element.account_id + '" id="rating5' + element.account_id + '"\n' +
                                                'onclick="ratingUpdate(\'5\', \'' + element.account_id + '\');">\n' +
                                                '<label\n' +
                                                'for="rating5' + element.account_id + '"\n' +
                                                'class="fas fa-star"></label>\n' +
                                                '</div>\n' +
                                                '</div>';
                                            appendData += '<div class="mt-2">\n';
                                            if (element.account_type === 14) {
                                                appendData += '<a href="{{env('APP_URL')}}feeds/medium' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1">Profile</a>';
                                            } else if (element.account_type === 16) {
                                                appendData += '<a href="{{env('APP_URL')}}feeds/Tumblr' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1">Profile</a>';
                                            }
                                            appendData +=
                                                '</div>\n' +
                                                '</div>\n' +
                                                '</div>';
                                            appendData +=`<div class="py-9">`;
                                            appendData += '<div\n' +
                                                'class="d-flex align-items-center justify-content-between">\n' +
                                                '<span\n' +
                                                'class="font-weight-bold mr-2">Cron Update:</span>\n' +
                                                '<span class="switch switch-sm switch-icon"\n' +
                                                'id="cronModify' + element.account_id + '">\n' +
                                                '<label>\n' +
                                                '<input type="checkbox" id="cronUpdate' + element.account_id + '"\n';
                                            if (element.refresh_feeds === 2) appendData += 'checked ';
                                            appendData += 'name="select"\n'
                                            appendData += 'onclick="cronUpdate(' + element.account_id + ', ' + element.refresh_feeds + ');">\n' +
                                                '<span></span>\n' +
                                                '</label>\n' +
                                                '</span>\n' +
                                                '</div>' +
                                                '</div>';
                                                '</div>';
                                            appendData += '<div>\n' +
                                                '<a href="javascript:;" class="btn text-danger font-weight-bolder font-size-h6 px-8 py-4 my-3 col-12" data-toggle="modal" data-target="#accountDeleteModal' + element.account_id + '" >Delete account</a> \n' +
                                                '</div>';
                                            appendData += '</div>\n' +
                                                '</div>\n' +
                                                '</div>';
                                            switch (element.account_type) {
                                                case 2:
                                                    appendData += '<br><br>';
                                                    break;
                                                case 9:
                                                    appendData += '<br><br>';
                                                    break;
                                            }
                                            appendData += '<div class="modal fade" id="accountDeleteModal' + element.account_id + '"\n' +
                                                'tabindex="-1"\n' +
                                                'role="dialog"\n' +
                                                'aria-labelledby="teamDeleteModalLabel"\n' +
                                                'aria-hidden="true">\n' +
                                                '<div class="modal-dialog modal-dialog-centered modal-lg"\n' +
                                                'role="document">\n' +
                                                '<div class="modal-content">\n' +
                                                '<div class="modal-header">\n' +
                                                '<h5 class="modal-title" id="teamDeleteModalLabel">Delete\n' +
                                                'This Account</h5>\n' +
                                                '<button type="button" class="close" data-dismiss="modal"\n' +
                                                'aria-label="Close">\n' +
                                                '<i aria-hidden="true" class="ki ki-close"></i>\n' +
                                                '</button>\n' +
                                                '</div>\n' +
                                                '<div class="modal-body">\n' +
                                                '<div class="text-center">\n' +
                                                '<img\n' +
                                                'src="/media/svg/icons/Communication/Delete-user.svg"/><br>\n' +
                                                '<span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Account?</span>\n' +
                                                '</div>\n' +
                                                '<div class="d-flex justify-content-center">\n' +
                                                '<button type="submit"\n' +
                                                'onclick="deleteSocialAcc(' + element.account_id + ')"\n' +
                                                'class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                                'id="' + element.account_id + '"\n' +
                                                'data-dismiss="modal">\n' +
                                                'Delete it\n' +
                                                '</button>\n' +
                                                '<a href="javascript:;" type="button"\n' +
                                                'class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                                'data-dismiss="modal">No\n' +
                                                'thanks.</a>\n' +
                                                '</div>\n' +
                                                '</div>\n' +
                                                '</div>\n' +
                                                '</div>\n' +
                                                '</div>';
                                        } else {
                                            noBloggsCounts++;
                                        }
                                    }
                                );
                                if (response.data.data.teamSocialAccountDetails[0].SocialAccount.length === noBloggsCounts) {
                                    $('#bloggedAccountsSectionView').append('<div class="text-center">\n' +
                                        '<div class="symbol symbol-150">\n' +
                                        '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                        '</div>\n' +
                                        '<h6>No Blogged Account has been found for this search filter</h6>\n' +
                                        '</div>');
                                } else {
                                    $('#bloggedAccountsSectionView').append(appendData);

                                }
                            } else {
                                $('#bloggedAccountsSectionView').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>\n' +
                                    '<h6>No Social Account has been found for this search filter</h6>\n' +
                                    '</div>');
                            }
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                        } else {
                            toastr.error('Some error occured,in adding medium Profile');
                        }
                    }
                });
            }
        }
    </script>
@endsection