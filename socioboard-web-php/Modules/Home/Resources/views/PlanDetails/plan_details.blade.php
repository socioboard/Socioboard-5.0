@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Plan Details</title>
@endsection
@section('content')

    <!--begin::Content-->
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
                            <span class="card-icon"><i class="fas fa-receipt text-success"></i></span>
                            <h3 class="card-label">SocioBoard Plans</h3>
                        </div>
                    </div>
                    <div class="card-body">
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
@endsection
@section('scripts')
    <script src="../js/IncJsFiles/PlanDetails/plan_details.js"></script>
@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

