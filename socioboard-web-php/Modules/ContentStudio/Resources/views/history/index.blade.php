@extends('home::layouts.UserLayout')

@section('title')
    <title>{{env('WEBSITE_TITLE')}} | History</title>
@endsection

@section('content')
	<!--begin::Content-->
	<div class="content  d-flex flex-column flex-column-fluid" id="Sb_content" data-page="{{$page}}" data-slug="{{$slug}}">
		<!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::HIstory-->
                <div class="card card-custom card-stretch gutter-b">
                        <!--begin::Header-->
                        <div class="card-header border-0 py-5">
                            <h3 class="card-title align-items-start flex-column">
                                <span class="card-label font-weight-bolder ">{{ isset($pageTitle) ? $pageTitle : 'Listing' }}</span>
                            </h3>
                            <div class="card-toolbar">
                                <a href="{{ route('publish_content.scheduling') }}" class="btn font-weight-bolder font-size-sm scheduled-create_btn">Create Schedule Post</a>
                            </div>
                        </div>
                        <!--end::Header-->
                        {{-- begin::Body  --}}
                        <div id="table-div">
                        	<div class="card-body pt-0 pb-3">
							    <!--begin::Table-->
							    <div class="table-responsive">
                                    {{-- beigin::Table --}}
							        <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
							            <thead>
							                <tr class="">
							                    <th style="max-width: 270px" class="pl-7"><span style="text-transform: capitalize;">Post (Mouse hover on Network Icons to see the Account Name)</span></th>
							                    <th style="min-width: 150px">Type</th>
							                    <th style="min-width: 150px">Created Date</th>
							                    <th style="min-width: 150px">Post Date / Day(s) and Timings(s)</th>
							                    <th style="min-width: 130px">Status</th>
												@if(isset($pageTitle) && $pageTitle != "History")
							                    <th style="min-width: 150px">Action</th>
												@endif
												@if(isset($pageTitle) && $pageTitle === "History")
												<th style="min-width: 150px">Post details</th>
												@endif
							                </tr>
							            </thead>
							            <tbody>
                							@include("contentstudio::history.parts._item")
							            </tbody>

							        </table>
									<div id="sb_loader" style="max-width: 1100px; margin: 40px auto; "></div>
							    </div>
							    <!--end::Table-->
							</div>
                        </div>
                        <!--end::Table-->
                        <!--end::Body-->
                    </div>
                <!--end::HIstory-->
            </div>
            <!--end::Container-->
        </div>
    <!--end::Entry-->
	</div>
	<!--end::Content-->
@endsection

@section('scripts')
	<script>
        {!! file_get_contents(Module::find('ContentStudio')->getPath() . '/js/history.js'); !!}
    </script>
@endsection