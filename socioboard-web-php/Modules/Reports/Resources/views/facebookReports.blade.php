@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Facebook Reports</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->

            <div class=" container-fluid ">
                <!--begin::Report-->
                <div class="d-flex">
                    <script>
                        var fbValue = false;
                    </script>
                <?php $fbValue = false ?>
                    <!-- begin:Team list -->
                    <div class="form-group" id="youtubeReports">
                        <script>
                            var teamid = <?php echo session()->get('team')['teamid']?>
                        </script>
                        @if(count($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount)>0)
                            @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                @if($data->account_type === 2)
                                    <script>
                                        var fbpageID = <?php echo $data->account_id ?>;
                                        var fbValue = true;
                                    </script>
                                    <?php $fbPageId = $data->account_id?>
                                    <?php $fbValue = true ?>
                                    @break
                                @endif
                            @endforeach
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 faceBookAccountsData"
                                    onchange="changeFacebookData(this)">
                                <option disabled id="selectDropdown2">Select Account</option>
                                @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                    @if($data->account_type === 2)
                                        <option
                                                value="{{$data->account_id }}">{{$data->first_name }}</option>
                                        <script>
                                            var fbValue = true;
                                        </script>
                                    @endif
                                @endforeach
                            </select>
                        @else
                            <div class="text-center noFbPageAccountsDiv">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <h6>Currently, no facebook pages account added to this team.</h6>
                            </div>
                        @endif
                    </div>
                    <!-- end:Team list -->
                    <div class="ml-auto">
                        <!-- datepicker -->
                        <div class="form-group team_Date_Range">
                            <div class="input-icon" id='twt-daterange' style="width: 300px">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" id="twt-daterange_id"
                                       type="text" name="datepicker" autocomplete="off"
                                       placeholder="Select Date Range"/>
                                <span><i class="far fa-calendar-alt"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-6 facebookChartsDiv" id="ss-scheduled">
                        <div class="card card-custom gutter-b card-stretch">
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-scheduled_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-scheduled_md6" style="
    display: none;"></span>
                            </div>


                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Page Fan</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="like_unlike_chart" class="card-rounded-bottom "
                                         style="height: 200px"></div>
                                </div>
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                            <i class="fas fa-heart fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="newLikes"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">New Likes</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-danger mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-danger">
                                                                        <i class="fas fa-heart-broken fa-2x text-danger "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="unLikes"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Unlikes</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->


                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                    <div class="col-xl-6 pageImpressionsDiv" id="ss-page-impressions">
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-page-impressions_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-page-impressions_md6" style="
    display: none;"></span>
                            </div>

                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Page Impressions</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="page_unique_viral_chart" class="card-rounded-bottom "
                                         style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->

                                <!--begin::Stats-->
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                        <i class="fas fa-user-tie fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder totalImpressionsCountDiv"
                                                         id="totalImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1 ">Total Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-success-info">
                                                                        <i class="fas fa-user-tag fa-2x text-success "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder uniqueImpressionDiv"
                                                         id="uniqueImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Unique Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                                        <i class="fas fa-user-injured fa-2x text-warning"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder viralImpressionsDiv"
                                                         id="viralImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Viral Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->


                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                    <div class="col-xl-6 pageOrganicDiv" id="ss-page-organic">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-page-organic_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-page-organic_md6" style="
    display: none;"></span>
                            </div>

                            <!--end::Header-->


                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Page Organic & Paid Impressions</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="page_organic_paid_chart" class="card-rounded-bottom "
                                         style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->

                                <!--begin::Stats-->
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                        <i class="fas fa-weight fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder organicImpressionsDiv"
                                                         id="organicImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Organic
                                                        Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                                        <i class="fas fa-dollar-sign fa-2x text-success "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder paidImpressionsDiv"
                                                         id="paidImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Paid Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>

                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                    <div class="col-xl-6"  id="ss-page-stories">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-page-stories_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-page-stories_md6" style="
    display: none;"></span>
                            </div>

                            <div class="card-body d-flex flex-column pt-0 pageStoriesDiv">
                                <h3 class="card-title font-weight-bolder">Page Stories</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="page_stories_chart" class="card-rounded-bottom "
                                         style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->

                                <!--begin::Stats-->
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                        <i class="fas fa-house-user fa-2x text-primary "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder pageImpByStoryDivCount"
                                                         id="pagesStoriesByType"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Page Impressions By
                                                        Story Type
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                                            <i class="far fa-smile fa-2x text-success "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder viralImpressionsDivCount"
                                                         id="viralImpressionsStories"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Viral Impressions By
                                                        Story Type
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->


                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                </div>
                <!--end::Row-->
                <!--end::Report-->
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
            setTimeout(function () {
                getFacebookReports(teamid, fbpageID, 3, 0, 0);
            }, 2000);
        });
        // team date ranges
        var start = moment().subtract(6, 'days');
        $("li[data-range-key='Last 30 Days']").removeAttr('class');
        $("li[data-range-key='Last 7 Days']").attr("class", "active");
        let DefaultRange = `${moment().subtract(6, 'days').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;
        var end = moment();

        $('#twt-daterange').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',

            startDate: start,
            endDate: end,
            maxDate: new Date(),
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, function (start, end, label) {
            changeTeamResponseCalendar(start, end);
            $('#twt-daterange .form-control').val(start.format('MMM DD, YYYY') + ' -> ' + end.format('MMM DD, YYYY'));
        });

        $('#twt-daterange_id').attr('value', DefaultRange);


        // delete account
        $('#account-delete').click(function (event) {
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };

            toastr.error("Your account has been deleted!", "Deleted");

        });

        function formatDate(date) {
            let d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        let dates = [];

        /**
         * TODO We have get the reports of the facebook accounts added.
         * This function is used getting reports of the facebook accounts added based on dates filter.
         * @param {integer} teamid- current teamid of the particular User.
         * @param {string} accid- link of image or video in the facebook.
         * @param {string} filterPeriod- time value of range.
         * @param {string} startDate- Start date of the filter range.
         * @param {sourceUrl} endDate  end  date of the filter range.
         * ! Do not change this function without referring API format of getting the youtube reports.
         */
        function getFacebookReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-facebook-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#page_unique_viral_chart, #like_unlike_chart, #page_organic_paid_chart, #page_stories_chart').empty();
                    $('#page_unique_viral_chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $('#like_unlike_chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $('#page_organic_paid_chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $('#page_stories_chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $(".spinner-border").css("display", "block");
                    $('#newLikes, #unLikes, #totalImpressions, #uniqueImpressions,#viralImpressions,#viralImpressionsStories,#organicImpressions,#paidImpressions,#paidImpressions,#pageStories,#pagesStoriesByType').empty();
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    let totalImpressions = [];
                    let uniqueImpressions = [];
                    let viralImpressions = [];
                    let newLikes = [];
                    let newUnlikes = [];
                    let paidImpressions = [];
                    let organicImpressions = [];
                    let pageStoriesByStoryType = [];
                    let totalNewLikes = 0;
                    let totalUnLikes = 0;
                    let totalImpressionsCount = 0;
                    let uniqueImpressionsCount = 0;
                    let viralImpressionsCount = 0;
                    let organicImpressionsCount = 0;
                    let paidImpressionsCount = 0;
                    let pageStoriesStoryTypeCount = 0;
                    if (response.code === 200) {
                        response.data.data.map(element => {
                            if (element.name === "page_impressions" && element.title === 'Daily Total Impressions') {
                                element.values.map(element => {
                                    totalImpressions.push(element.value);
                                    totalImpressionsCount += element.value;
                                    dates.push(element.end_time.substring(0, 10));
                                });
                            }
                            if (element.name === "page_impressions_unique" && element.title === 'Daily Total Reach' ) {
                                element.values.map(element => {
                                    uniqueImpressionsCount += element.value;
                                    uniqueImpressions.push(element.value);
                                });
                            }
                            if (element.name === "page_impressions_viral" && element.title === 'Daily Viral impressions' ) {
                                element.values.map(element => {
                                    viralImpressionsCount += element.value;
                                    viralImpressions.push(element.value);
                                });
                            }
                            if (element.title === 'Daily New Likes') {
                                element.values.map(element => {
                                    totalNewLikes += element.value;
                                    newLikes.push(element.value);
                                });
                            }
                            if (element.title === 'Daily Unlikes') {
                                element.values.map(element => {
                                    totalUnLikes += element.value;
                                    newUnlikes.push(element.value);
                                });
                            }
                            if (element.title === 'Daily Organic impressions') {
                                element.values.map(element => {
                                    organicImpressionsCount += element.value;
                                    organicImpressions.push(element.value);
                                });
                            }
                            if (element.name === "page_impressions_paid" && element.title === 'Daily Paid Impressions') {
                                element.values.map(element => {
                                    paidImpressionsCount += element.value;
                                    paidImpressions.push(element.value);
                                });
                            }
                            if (element.name === 'page_content_activity'&& element.title === '28 Days Page Stories') {
                                element.values.map(element => {
                                    pageStoriesStoryTypeCount += element.value;
                                    pageStoriesByStoryType.push(element.value);
                                });
                            }
                        });
                        $('#newLikes').append(totalNewLikes);
                        $('#unLikes').append(totalUnLikes);
                        $('#totalImpressions').append(totalImpressionsCount);
                        $('#uniqueImpressions').append(uniqueImpressionsCount);
                        $('#organicImpressions').append(organicImpressionsCount);
                        $('#paidImpressions').append(paidImpressionsCount);
                        $('#pagesStoriesByType').append(pageStoriesStoryTypeCount);
                        $('#viralImpressionsStories').append(viralImpressionsCount);
                        $('#viralImpressions').append(viralImpressionsCount);
                        impressionsGraph(totalImpressions, uniqueImpressions, viralImpressions);
                        likeUnlikeGraph(newLikes, newUnlikes);
                        pageOrganicImpressionsGraph(organicImpressions, paidImpressions);
                        getPageStoriesGraph(pageStoriesByStoryType, viralImpressions);
                    } else if (response.code === 400) {
                        $('#page_unique_viral_chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '                                            </div>');
                        $('#like_unlike_chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                        $('#page_organic_paid_chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                        $('#page_stories_chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        /**
         * TODO We have get the reports facebook impressions graph of the facebook accounts added.
         * @param {integer} totalImpressions- current totalImpressions of the facebook accounts.
         * @param {integer} uniqueImpressions- uniqueImpressions  video in the facebook accounts.
         * @param {integer} viralImpressions- viralImpressions  of range.
         * ! Do not change this function without referring API format of getting the facebook reports.
         */
        function impressionsGraph(totalImpressions, uniqueImpressions, viralImpressions) {
            var optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    zoom: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 2,
                        blur: 4,
                        opacity: 1,
                    }
                },
                tooltip: {
                    theme: 'dark'
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                series: [{
                    name: "Total Impressions",
                    data: totalImpressions
                },
                    {
                        name: "Unique Impressions",
                        data: uniqueImpressions
                    },
                    {
                        name: "Viral Impressions",
                        data: viralImpressions
                    }
                ],
                title: {
                    text: 'Facebook Stats',
                    align: 'left',
                    offsetY: 25,
                    offsetX: 20
                },
                subtitle: {
                    offsetY: 55,
                    offsetX: 20
                },
                markers: {
                    size: 6,
                    strokeWidth: 0,
                    hover: {
                        size: 9
                    }
                },
                grid: {
                    show: true,
                    padding: {
                        bottom: 0
                    }
                },
                labels: dates,
                xaxis: {
                    tooltip: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            var chartLine = new ApexCharts(document.querySelector('#page_unique_viral_chart'), optionsLine);
            chartLine.render();
        }

        /**
         * TODO We have get the reports facebook like unlike graph of the facebook accounts added.
         * @param {integer} newLikes- current newLikes of the facebook accounts.
         * @param {integer} newUnlikes- newUnlikes   of  the facebook accounts.
         * ! Do not change this function without referring API format of getting the facebook reports.
         */
        function likeUnlikeGraph(newLikes, newUnlikes) {
            // Like Count Stats
            var optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    zoom: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 2,
                        blur: 4,
                        opacity: 1,
                    }
                },
                tooltip: {
                    theme: 'dark'
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                colors: ["#008ffb", '#F64E60'],
                series: [{
                    name: "New Likes",
                    data: newLikes
                },
                    {
                        name: "Unlikes",
                        data: newUnlikes
                    }
                ],
                title: {
                    text: 'Facebook Stats',
                    align: 'left',
                    offsetY: 25,
                    offsetX: 20
                },
                subtitle: {
                    offsetY: 55,
                    offsetX: 20
                },
                markers: {
                    size: 6,
                    strokeWidth: 0,
                    hover: {
                        size: 9
                    }
                },
                grid: {
                    show: true,
                    padding: {
                        bottom: 0
                    }
                },
                labels: dates,
                xaxis: {
                    tooltip: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            var chartLine = new ApexCharts(document.querySelector('#like_unlike_chart'), optionsLine);
            chartLine.render();
        }

        /**
         * TODO We have get the reports facebook like unlike graph of the facebook accounts added.
         * @param {integer} organicData- current organicData of the facebook accounts.
         * @param {integer} paidImpressions- current paidImpressions   of  the facebook accounts.
         * ! Do not change this function without referring API format of getting the facebook reports.
         */
        function pageOrganicImpressionsGraph(organicData, paidImpressions) {
            var optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    zoom: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 2,
                        blur: 4,
                        opacity: 1,
                    }
                },
                tooltip: {
                    theme: 'dark'
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                // colors: ["#3F51B5", '#2196F3'],
                series: [{
                    name: "Organic Impressions",
                    data: organicData
                },
                    {
                        name: "Paid Impressions",
                        data: paidImpressions
                    }
                ],
                title: {
                    text: 'Facebook Stats',
                    align: 'left',
                    offsetY: 25,
                    offsetX: 20
                },
                subtitle: {
                    offsetY: 55,
                    offsetX: 20
                },
                markers: {
                    size: 6,
                    strokeWidth: 0,
                    hover: {
                        size: 9
                    }
                },
                grid: {
                    show: true,
                    padding: {
                        bottom: 0
                    }
                },
                labels: dates,
                xaxis: {
                    tooltip: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            var chartLine = new ApexCharts(document.querySelector('#page_organic_paid_chart'), optionsLine);
            chartLine.render();
        }

        /**
         * TODO We have get the reports facebook page stories graph of the facebook accounts added.
         * @param {integer} pagestories- current pagestories of the facebook accounts.
         * @param {integer} viralImpressions- current viralImpressions   of  the facebook accounts.
         * ! Do not change this function without referring API format of getting the facebook PageStories.
         */
        function getPageStoriesGraph(pagestories, viralImpressions) {
            var optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    zoom: {
                        enabled: true
                    },
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 2,
                        blur: 4,
                        opacity: 1,
                    }
                },
                tooltip: {
                    theme: 'dark'
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                series: [{
                    name: "Page Impressions By Story Type",
                    data: pagestories
                },
                    {
                        name: "Viral Impressions By Story Type",
                        data: viralImpressions
                    }
                ],
                title: {
                    text: 'Facebook Stats',
                    align: 'left',
                    offsetY: 25,
                    offsetX: 20
                },
                subtitle: {
                    text: 'Page Stories',
                    offsetY: 55,
                    offsetX: 20
                },
                markers: {
                    size: 6,
                    strokeWidth: 0,
                    hover: {
                        size: 9
                    }
                },
                grid: {
                    show: true,
                    padding: {
                        bottom: 0
                    }
                },
                labels: dates,
                xaxis: {
                    tooltip: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            var chartLine = new ApexCharts(document.querySelector('#page_stories_chart'), optionsLine);
            chartLine.render();
        }

        /**
         * TODO We have get the reports facebook page stories graph of the facebook accounts added.
         */
        function formatDate(date) {
            let d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        function changeFacebookData(data) {
            fbpageID = data.value;
            setTimeout(function () {
                getFacebookReports(teamid, fbpageID, 3, 0, 0);
            }, 2000);
        }


        function changeTeamResponseCalendar(a, b) {
            let startDate = formatDate(a);
            let endDate = formatDate(b);
            setTimeout(function () {
                getFacebookReports(teamid, fbpageID, 7, startDate, endDate);
            }, 2000);
        }

        let noFacebookPage = ' <div class="text-center noFbPageAccountsDiv">\n' +
            '<div class="symbol symbol-150">\n' +
            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
            '</div>\n' +
            '<h6>Currently, no facebook page added to this team.</h6>\n' +
            '</div>';

        $(document).ready(function () {
            $("#reportsButton").trigger("click");
            if (fbValue === false) {
                $("#selectDropdown2").remove();
                $("#youtubeReports").remove();
                $('#page_unique_viral_chart, #like_unlike_chart, #like_unlike_chart, #page_organic_paid_chart,#page_stories_chart').empty();
                $('#newLikes, #unLikes, #totalImpressions, #uniqueImpressions,#viralImpressions,#viralImpressionsStories,#organicImpressions,#paidImpressions,#paidImpressions,#pageStories,#pagesStoriesByType').append(0);
                $('#page_unique_viral_chart').append(noFacebookPage);
                $('#like_unlike_chart').append(noFacebookPage);
                $('#page_organic_paid_chart').append(noFacebookPage);
                $('#page_stories_chart').append(noFacebookPage);
            }
        });

    </script>

@endsection
