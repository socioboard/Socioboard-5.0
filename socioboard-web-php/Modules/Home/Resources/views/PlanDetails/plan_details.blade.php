@extends('home::layouts.UserLayout')
<head>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-72806503-3"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-72806503-3');
    </script>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Plan Details</title>
@endsection
@section('content')

<script>
    //aMemberData for autoLogin
    localStorage.setItem('browser_id', '<?php echo(session()->get('user')['userDetails']['user_name']);?>');
    localStorage.setItem('random_key', '<?php echo(session()->get('user')['userDetails']['password']);?>');
</script>

    @if(session('failed'))
        <script>
            Swal.fire({
                icon: 'error',
                text: "{{session('failed')}}",
            });
        </script>
    @endif
    <!--begin::Contentt-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Plans-->
                <!--begin::Card-->
                <div class="card card-custom">
                    <div class="card-header">
                        <div class="card-title">
                            <span class="card-icon"><i class="fas fa-clipboard-list"></i></span>
                            <h3 class="card-label">SocioBoard Plans</h3>
                        </div>
                    </div>
                    <div class="card-body">
                        @if($expired_date  != false)
                        <div class="alert alert-danger text-center font-weight-bold font-size-h6" role="alert">
                           Your Plan Has Expired on: @php echo $expired_date; @endphp, Please Upgrade Your Plan To Continue.
                        </div>
                        @endif
                        <div class="row my-10" id="all_plans_data_id">

                        </div>
                    </div>
                </div>
                <!--end::Card-->
                <!--end::Plans-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>

    <!-- begin::Plan Details -->
    <div class="modal fade" id="plan_details_modal" tabindex="-1" role="dialog" aria-labelledby="plan_details_modalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="plan_details_modalLabel">Plan Details</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body" >
                    <div class="row" id="selected_plan_Details_id">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Plan Details -->
    <!--end::Content-->
    <div style="display: none;">
        <input type="hidden" id="all_plans_data" data-list="{{json_encode($getPlanDetails) }}">
        <input type="hidden" id="user_plan_data" data-list="{{json_encode($userPlanData) }}">
    </div>
    <div class="modal fade" id="emailModal" tabindex="-1" role="dialog"
         aria-labelledby="emailModal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="emailModal">Please configure email to purchase a plan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <div class="input-icon">
                            <label for="emailLoginId" style="display: none"></label>
                            <input
                                    class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                    type="text" name="emailLoginName" id="emailLoginId"
                                    autocomplete="off"
                                    placeholder="Email"/>
                            <div class="error text-danger" id="emailLoginError1"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 8px 21px 20px 21px">
                    <button type="button" class="btn font-weight-bolder "
                            onclick="submitEmail()">Submit
                    </button>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('scripts')
    <script src="../js/IncJsFiles/PlanDetails/plan_details.js"></script>
@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

