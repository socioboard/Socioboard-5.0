@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Auto Email Reports</title>
@endsection
@section('content')
    <div class="container-fluid table-responsive mt-12">
        <div class="card card-custom card-stretch gutter-b">
            <!--begin::Header-->
            <div class="card-header border-0 py-5 align-items-center">
                <h3 class="card-title align-items-start flex-column">
                    <span class="card-label font-weight-bolder ">Schedule Reports List</span>
                </h3>
                <div class="card-toolbar">
                    <!--begin::Actions-->
                    <button type="button" data-toggle="modal" data-target="#autoEmailReport"
                            class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "><i
                                class="fa fa-envelope"></i>Create New
                        Reports
                    </button>
                    <!--end::Actions-->
                </div>
            </div>
            <!--end::Header-->
            <!--begin::Body-->
            <div class="card-body pt-0 pb-3">
                <div class="table-responsive">
                    @if(sizeof($data))
                    <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Frequency</th>
                            <th>Recipients</th>
                            <th>Content</th>
                            <th colspan="2">Action</th>
                        </tr>
                        </thead>
                        <tbody id="table_body">
                        @foreach($data as $report)
                            <script>
                                var feedsLength = <?php echo count($data)  ?>;
                            </script>
                            <tr>
                                <td>{{$report[0]['report_title']}}</td>
                                <td>{{$report[0]['frequency'] == '0' ? "Daily" : ($report[0]['frequency'] == '1' ? "Weeekly" : ($report[0]['frequency'] == '2' ? "Monthly" : ""))}}</td>
                                <td>
                                    @foreach($report[0]['emails'] as $email)
                                        {{$email}} <br>
                                    @endforeach
                                </td>
                                <td>{{($report[0]['teamReport'] !== [])? "Team Report," : ""}} {{($report[0]['youTube'] !== [])? "Youtube Report," : ""}} {{($report[0]['twitterReport'] !== [ ])? "Twitter Report" : ""}}</td>
                                <td class="pr-0">
                                    <button href="" class="btn btn-icon text-hover-info btn-sm" data-toggle="modal"
                                            data-target="#editautoEmailReport{{$report[0]['id']}}"
                                            id="{{$report[0]['id']}}" onclick="modelOpen('{{$report[0]['id']}}')">
                                                    <span class="svg-icon svg-icon-md svg-icon-info">
                                                        <i class="fas fa-pen-square"></i>
                                                    </span>
                                    </button>
                                </td>
                                <td class="pr-0">
                                    <a href="" class="btn btn-icon text-hover-info btn-sm" data-toggle="modal"
                                       data-target="#reportDeleteModal{{$report[0]['id']}}">
                                                    <span class="svg-icon svg-icon-md svg-icon-info">
                                                        <i class="fas fa-trash"></i>
                                                    </span>
                                    </a>
                                </td>
                            </tr>
                            <div class="modal fade" id="reportDeleteModal{{$report[0]['id']}}" tabindex="-1"
                                 role="dialog" aria-labelledby="reportDeleteModalLabel"
                                 aria-hidden="true">
                                <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="reportDeleteModalLabel">Delete Report</h5>
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <i aria-hidden="true" class="ki ki-close"></i>
                                            </button>
                                        </div>
                                        <div class="modal-body">
                                            <div class="text-center">
                                                <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Report??</span>
                                            </div>
                                            <div class="d-flex justify-content-center">
                                                <a href="javascript:;" type="button"
                                                   onclick="deleteReport('{{$report[0]['id']}}')"
                                                   class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                   data-dismiss="modal"
                                                   id="account_delete">Delete it!!</a>
                                                <a href="javascript:;" type="button"
                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                   data-dismiss="modal">No thanks.</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal fade" id="editautoEmailReport{{$report[0]['id']}}" tabindex="-1"
                                 aria-labelledby="editautoEmailReportLabel" aria-hidden="true">
                                <div class="modal-dialog modal-lg">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="editautoEmailReportLabel">Edit Email
                                                Reports</h5>
                                            <button type="button"
                                                    class="close btn btn-xs btn-icon btn-light btn-hover-primary"
                                                    data-dismiss="modal"
                                                    aria-label="Close" id="Sb_quick_user_close">
                                                <i class="ki ki-close icon-xs"></i>
                                            </button>
                                        </div>
                                        <form action="" method="post" id="update_data{{$report[0]['id']}}">
                                            @csrf
                                            <div class="modal-body">
                                                <div class="form-group">
                                                    <label for="recipient-name"
                                                           class="col-form-label font-weight-bolder font-size-lg">Reports
                                                        Title
                                                        : </label>
                                                    <input type="text" name="update_reportstitle" id="title"
                                                           class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                                           id="recipient-name"
                                                           value="{{isset($report[0]['report_title']) ? $report[0]['report_title'] : ""}}">
                                                </div>
                                                <div class="form-group">
                                                    <p class="font-weight-bolder font-size-lg">Frequency : </p>
                                                    <div class="form-check-inline">
                                                        <label class="radio radio-lg mb-7">
                                                            <input type="radio" name="update_frequency" id="0"
                                                                   value="0" {{($report[0]['frequency'] == 0) ? "checked" : ""}} />
                                                            <span></span>
                                                            <div class="font-size-lg font-weight-bold ml-4">Daily</div>
                                                        </label>
                                                        <label class="radio radio-lg mb-7 ml-6">
                                                            <input type="radio" name="update_frequency" id="1"
                                                                   value="1" {{($report[0]['frequency'] == 1) ? "checked" : ""}}/>
                                                            <span></span>
                                                            <div class="font-size-lg font-weight-bold ml-4">Weekly</div>
                                                        </label>
                                                        <label class="radio radio-lg mb-7 ml-6">
                                                            <input type="radio" name="update_frequency" id="2"
                                                                   value="2" {{($report[0]['frequency'] == 2) ? "checked" : ""}}/>
                                                            <span></span>
                                                            <div class="font-size-lg font-weight-bold ml-4">Monthly
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <label for="font-weight-bolder font-size-lg">Recipients :</label>
                                                    <span class="font-weight-bolder font-size-lg">Separate the email ids using comma !</span>
                                                    @php
                                                        $recipients_email = "";
                                                    foreach($report[0]['emails'] as $email){
                                                        $recipients_email = $recipients_email. $email.',';
                                                    }
                                                    @endphp
                                                    <input type="text" name="update_recipient_emails"
                                                           class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                                           value="{{$recipients_email}}">
                                                </div>
                                                <div class="form-group">
                                                    <label for="contents"
                                                           class="col-form-label font-weight-bolder font-size-lg">Contents to include in reports :
                                                        :</label>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="form-group">
                                                                <label for="contents"
                                                                       class="col-form-label font-weight-bolder font-size-lg">Team
                                                                    Report :</label>
                                                                <select
                                                                        class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controls"
                                                                        id="sb_select2_team_report{{$report[0]['id']}}"
                                                                        name="update_teams[]" multiple="multiple"
                                                                        style="width: 100%">
                                                                    @if(isset($teamdetails))
                                                                        @foreach($teamdetails as $teams)
                                                                            <option value="{{$teams->team_id}}"{{(isset($report[0]['teamReport']) ?(in_array($teams->team_id , $report[0]['teamReport'] ) ? "selected" : "") : "")}} >{{$teams->team_name}}</option>
                                                                        @endforeach
                                                                    @endif
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="form-group">
                                                                <label for="contents"
                                                                       class="col-form-label font-weight-bolder font-size-lg">Twitter
                                                                    Report :</label>
                                                                <select
                                                                        class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controls"
                                                                        id="sb_select2_twitter report{{$report[0]['id']}}"
                                                                        name="update_twitter[]" multiple="multiple"
                                                                        style="width: 100%">
                                                                    @if(isset($twitterAccounts))
                                                                        @foreach($twitterAccounts as $twitter)
                                                                            <option value="{{$twitter->account_id}}" {{(isset($report[0]['twitterReport']) ?(in_array($twitter->account_id , $report[0]['twitterReport'] ) ? "selected" : "") : "")}}>{{$twitter->first_name}}</option>
                                                                        @endforeach
                                                                    @endif
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="form-group">
                                                                <label for="contents"
                                                                       class="col-form-label font-weight-bolder font-size-lg">Youtube
                                                                    Report :</label>
                                                                <select
                                                                        class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controls"
                                                                        id="sb_select2_youtube_report{{$report[0]['id']}}"
                                                                        name="update_youtube[]" multiple="multiple"
                                                                        style="width: 100%">
                                                                    @if(isset($youtubeAccounts))
                                                                        @foreach($youtubeAccounts as $twitter)
                                                                            <option value="{{$twitter->account_id}}" {{(isset($report[0]['youTube']) ?(in_array($twitter->account_id , $report[0]['youTube'] ) ? "selected" : "") : "")}}>{{$twitter->first_name}}</option>
                                                                        @endforeach
                                                                    @endif
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <p class="font-weight-bolder font-size-lg">Reports :</p>
                                                    <div class="form-check-inline form-check">
                                                        <label class="checkbox checkbox-lg mb-7">
                                                            <input type="checkbox" name="update_type[]"
                                                                   value="1" {{$report[0]['report_type'] == '1' || $report[0]['report_type'] == '0' ? "checked" : "" }} />
                                                            <span></span>
                                                            <div class="font-size-lg font-weight-bold ml-3">PDF</div>
                                                        </label>
                                                    </div>
                                                    <div class="form-check-inline form-check">
                                                        <label class="checkbox checkbox-lg mb-7">
                                                            <input type="checkbox" name="update_type[]"
                                                                   value="2" {{$report[0]['report_type'] == '2' || $report[0]['report_type'] == '0' ? "checked" : "" }}/>
                                                            <span></span>
                                                            <div class="font-size-lg font-weight-bold ml-3">CSV</div>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button"
                                                        class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                                        data-dismiss="modal">Close
                                                </button>
                                                <a id="update_button"
                                                   class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                                   onclick="updateForm('{{$report[0]['id']}}');"
                                                >Update</a>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                        </tbody>
                    </table>
                    @else
                        <div class="card-body">
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-feeds.svg" class="">
                                </div>
                                <h6>Currently no Added Scheduled reports</h6>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
            <!--end::Body-->

        </div>

    </div>
    <div class="modal fade" id="autoEmailReport" tabindex="-1" aria-labelledby="autoEmailReportLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="autoEmailReportLabel">Add/Edit Email Reports</h5>
                    <button type="button" class="close"
                            data-dismiss="modal"
                            aria-label="Close" id="Sb_quick_user_close">
                        <i class="ki ki-close icon-xs"></i>
                    </button>
                </div>
                <form action="/save-auto-email-reports" method="POST" id="form_data">
                    @csrf
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="recipient-name" class="col-form-label font-weight-bolder font-size-lg">Reports
                                Title
                                : </label>
                            <input type="text" name="reportstitle"
                                   class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                   id="recipient-name">
                        </div>
                        <div class="form-group">
                            <p class="font-weight-bolder font-size-lg">Frequency : </p>
                            <div class="form-check-inline">
                                <label class="radio radio-lg mb-7">
                                    <input type="radio" name="frequency" value="0"/>
                                    <span></span>
                                    <div class="font-size-lg font-weight-bold ml-4">Daily</div>
                                </label>
                                <label class="radio radio-lg mb-7 ml-6">
                                    <input type="radio" name="frequency" value="1"/>
                                    <span></span>
                                    <div class="font-size-lg font-weight-bold ml-4">Weekly</div>
                                </label>
                                <label class="radio radio-lg mb-7 ml-6">
                                    <input type="radio" name="frequency" value="2"/>
                                    <span></span>
                                    <div class="font-size-lg font-weight-bold ml-4">Monthly</div>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="recipients_tags">Recipients :</label>
                            <select style="width:100%"
                                    class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                    id="recipients_tags" name="recipient_emails[]" multiple="multiple">
                                <option label="Label"></option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contents" class="col-form-label font-weight-bolder font-size-lg">Contents to include in Report
                                :</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="contents" class="col-form-label font-weight-bolder font-size-lg">Team
                                            Report :</label>
                                        <select
                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-control"
                                                id="sb_select2_team_report" name="teams[]" multiple="multiple"
                                                style="width: 100%">
                                            @if(isset($teamdetails))
                                                @foreach($teamdetails as $teams)
                                                    <option value="{{$teams->team_id}}">{{$teams->team_name}}</option>
                                                @endforeach
                                            @endif
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="contents" class="col-form-label font-weight-bolder font-size-lg">Twitter
                                            Report :</label>
                                        <select
                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-control"
                                                id="sb_select2_twitter report" name="twitter[]" multiple="multiple"
                                                style="width: 100%">
                                            @if(isset($twitterAccounts))
                                                @foreach($twitterAccounts as $twitter)
                                                    <option value="{{$twitter->account_id}}">{{$twitter->first_name}}</option>
                                                @endforeach
                                            @endif
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="contents" class="col-form-label font-weight-bolder font-size-lg">Youtube
                                            Report :</label>
                                        <select
                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-control"
                                                id="sb_select2_youtube_report" name="youtube[]" multiple="multiple"
                                                style="width: 100%">
                                            @if(isset($youtubeAccounts))
                                                @foreach($youtubeAccounts as $twitter)
                                                    <option value="{{$twitter->account_id}}">{{$twitter->first_name}}</option>
                                                @endforeach
                                            @endif
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <p class="font-weight-bolder font-size-lg">Reports :</p>
                            <div class="form-check-inline form-check">
                                <label class="checkbox checkbox-lg mb-7">
                                    <input type="checkbox" name="type[]" value="1"/>
                                    <span></span>
                                    <div class="font-size-lg font-weight-bold ml-3">PDF</div>
                                </label>
                            </div>
                            <div class="form-check-inline form-check">
                                <label class="checkbox checkbox-lg mb-7">
                                    <input type="checkbox" name="type[]" value="2"/>
                                    <span></span>
                                    <div class="font-size-lg font-weight-bold ml-3">CSV</div>
                                </label>
                            </div>
                        </div>
                        <button type="submit" value="0" id="test_mail"
                                class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "><i
                                    class="fa fa-envelope mr-2"></i>Send Test Mail
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button"
                                class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                data-dismiss="modal">Close
                        </button>
                        <button type="submit" id="publish_button"
                                class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                value="1"
                        >Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="modal fade" id="autoEmailReportss" tabindex="-1" aria-labelledby="autoEmailReportLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="autoEmailReportLabel">Add/Edit Email Reports</h5>
                    <button type="button" class="close btn btn-xs btn-icon btn-light btn-hover-primary"
                            data-dismiss="modal"
                            aria-label="Close" id="Sb_quick_user_close">
                        <i class="ki ki-close icon-xs text-muted"></i>
                    </button>
                </div>
                <form action="" method="" id="update_datas">

                    <div class="modal-body">
                        <div class="form-group" id="title_report">

                        </div>
                        <div class="form-group" id="frequencies">

                        </div>
                        <div class="form-group" id="emailss">

                        </div>
                        <div class="form-group">
                            <label for="contents" class="col-form-label font-weight-bolder font-size-lg">Contents
                                :</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group" id="team_idss">

                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group" id="twitter_idsss">

                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group" id="youtube_idss">

                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-group" id="report_typess">

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button"
                                class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "
                                data-dismiss="modal">Close
                        </button>
                        <a type="submit" id="button"
                           class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 " value="1"
                           onclick="updateFormData()"
                        >Update</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div id="delete_idd">
        <div class="modal fade" id="reportDeleteModalss" tabindex="-1" role="dialog"
             aria-labelledby="reportDeleteModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="reportDeleteModalLabel">Delete Report</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center">
                            <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Report??</span>
                        </div>
                        <div class="d-flex justify-content-center" id="model_data">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
@section('scripts')
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>

    <script>
        // multi select
        $('.multi-select-control').select2({
            width: 'resolve' //
        });

        $('.multi-select-controls').select2({
            width: 'resolve' //
        });

        $('.multi-select-controlss').select2({
            width: 'resolve' //
        });

        $('#recipients_tags').select2({
            placeholder: 'Tags',
            tags: true,
            width: 'resolve',
            language: {
                noResults: function () {
                    return 'Please enter the reciever email';
                }
            }
        });

        $('#recipients_tagsedit').select2({
            placeholder: 'Tags',
            tags: true,
            width: 'resolve'
        });

        $(document).ready(function () {
            $("#home_tab").trigger('click');
        });

        $(document).on('submit', '#form_data', function (e) {
            e.preventDefault();
            let value = $(document.activeElement).val();
            let form = document.getElementById('form_data');
            let formData = new FormData(form);
            formData.append('submit_type', value);
            $.ajax({
                url: "/save-auto-email-reports",
                data: formData,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                type: 'POST',
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response.code === 201) {
                        for (let i = 0; i < response.msg.length; i++) {
                            toastr.error(response.msg[i]);
                        }
                    }
                    if (response.code === 400) {
                        toastr.error(response.error)
                    }
                    if (response.code === 401) {
                        toastr.error(response.error)
                    }
                    if (response.code === 200) {
                        $("#autoEmailReport").modal('hide');
                        toastr.success(response.data, "", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        });
                    }
                },
                error: function (error) {
                    toastr.success(error.error);
                }
            })
        });

        function deleteReport(id) {
            $('#account_delete').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing.');
            $.ajax({
                url: "/delete-auto-email-reports/" + id,
                type: 'DELETE',
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $('#account_delete').empty().append('Create');
                    if (response.code === 400) {
                        toastr.error(response.error)
                    }
                    if (response.code === 200) {
                        $("#reportDeleteModal" + id).modal('hide');
                        toastr.success(response.data, "", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        });
                    }
                },
                error: function (error) {
                    $('#account_delete').empty().append('Delete It');
                    toastr.success(error.error);
                }
            })
        }

        function updateForm(id) {
            $('#publish_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing.');
            let form = document.getElementById('update_data' + id);
            let formData = new FormData(form);
            formData.append('id', id);
            $.ajax({
                url: "update-auto-email-reports",
                type: "post",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response.code === 201) {
                        for (let i = 0; i < response.msg.length; i++) {
                            toastr.error(response.msg[i]);
                        }
                    }
                    if (response.code === 400) {
                        toastr.error(response.error)
                    }
                    if (response.code === 200) {
                        $("#autoEmailReport").modal('hide');
                        toastr.success(response.data, "", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        });
                    }
                },
                error: function (error) {
                    toastr.success(error.error);
                }
            })
        }

        $(function () {
            var names = [];
            $("#hint_brand").css("display", "none");
            var pageid = 2;

            function getScrollXY() {
                var scrOfX = 0, scrOfY = 0;
                if (typeof (window.pageYOffset) == 'number') {
                    //Netscape compliant
                    scrOfY = window.pageYOffset;
                    scrOfX = window.pageXOffset;
                } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
                    //DOM compliant
                    scrOfY = document.body.scrollTop;
                    scrOfX = document.body.scrollLeft;
                } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
                    //IE6 standards compliant mode
                    scrOfY = document.documentElement.scrollTop;
                    scrOfX = document.documentElement.scrollLeft;
                }
                return [scrOfX, scrOfY];
            }

            //taken from http://james.padolsey.com/javascript/get-document-height-cross-browser/
            let pageId = 2;

            function getDocHeight() {
                let D = document;
                return Math.max(
                    D.body.scrollHeight, D.documentElement.scrollHeight,
                    D.body.offsetHeight, D.documentElement.offsetHeight,
                    D.body.clientHeight, D.documentElement.clientHeight
                );
            }

            document.addEventListener("scroll", function (event) {
                if (feedsLength >= 12) {
                    if (getDocHeight() == getScrollXY()[1] + window.innerHeight) {
                        getNextReports(pageid);
                        pageid++;
                    }
                }
            });

        });

        function getNextReports(id) {
            $.ajax({
                url: "get-next-email-reports/" + id,
                type: "GET",
                success: function (response) {
                    let data;
                    response.map(element => {
                        let emails = []
                        let i = 0;
                        element[0].emails.map(details => {
                            emails[i] = details;
                            i++;
                        })
                        $('#table_body').append('<tr>\n' +
                            '                            <td>' + element[0].report_title + '</td>' +
                            '                            <td>' + (element[0].frequency == 0 ? "Daily" : (element[0].frequency == 1 ? "Weekly" : (element[0].frequency == 2 ? "Monthly" : ""))) + '</td>' +
                            '                            <td> ' + emails + '</td>' +
                            '                            <td>' + (element[0].teamReport.length > 0 ? "Team Report," : "") + (element[0].twitterReport.length > 0 ? "Twitter Report," : "") + (element[0].youTube.length > 0 ? "YouTube Report" : "") + '</td>\n' +
                            '                            <td class="pr-0"><button href="" class="btn btn-icon text-hover-info btn-sm" onclick="updateModel(' + element[0].id + ')" data-toggle="modal" data-target="#autoEmailReportss">\n' +
                            '                                                    <span class="svg-icon svg-icon-md svg-icon-info">\n' +
                            '                                                        <i class="fas fa-pen-square"></i>\n' +
                            '                                                    </span>\n' +
                            '                                </button></td>' +
                            '                            <td class="pr-0"><a href="" onclick="deleteModel(' + element[0].id + ')" class="btn btn-icon text-hover-info btn-sm" data-toggle="modal"\n' +
                            '                                   data-target="#reportDeleteModalss">\n' +
                            '                                                    <span class="svg-icon svg-icon-md svg-icon-info">\n' +
                            '                                                        <i class="fas fa-trash"></i>\n' +
                            '                                                    </span>\n' +
                            '                                </a></td>' +
                            '</tr>');
                    });
                },
                error: function (error) {

                }
            });
        }

        function deleteModel(id) {
            $('#model_data').empty().append('<a href="javascript:;" type="button"  class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" onclick="deleteReport(' + id + ')" data-dismiss="modal" id="account-delete">Delete it!!</a>' +
                '<a href="javascript:;" type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"data-dismiss="modal">No thanks.</a>')
        }

        function updateModel(id) {
            $.ajax({
                url: "get-perticular-report/" + id,
                type: "get",
                success: function (response) {

                    let emails = "";
                    let i = 0;
                    response[0].emails.map(details => {
                        emails = emails + details + ',';
                        i++;
                    })
                    $('#title_report').empty().append('<label for="recipient-name" class="col-form-label font-weight-bolder font-size-lg">Reports Title\n' +
                        '                                : </label>\n' +
                        '                            <input type="text" name="update_reportstitle"\n' +
                        '                                   class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"\n' +
                        '                                   id="recipient-name" value="' + response[0].report_title + '">' +
                        '<input type="hidden" name="id" value= "' + id + '">');

                    $('#frequencies').empty().append('<p class="font-weight-bolder font-size-lg">Frequency : </p>\n' +
                        '                            <div class="form-check-inline">\n' +
                        '                                <label class="radio radio-lg mb-7">\n' +
                        '                                    <input type="radio" name="update_frequency" value="0"' + (response[0].frequency == 0 ? "checked" : "") + '/>\n' +
                        '                                    <span></span>\n' +
                        '                                    <div class="font-size-lg font-weight-bold ml-4">Daily</div>\n' +
                        '                                </label>\n' +
                        '                                <label class="radio radio-lg mb-7 ml-6">\n' +
                        '                                    <input type="radio" name="update_frequency" value="1"' + (response[0].frequency == "1" ? "checked" : "") + '/>\n' +
                        '                                    <span></span>\n' +
                        '                                    <div class="font-size-lg font-weight-bold ml-4">Weekly</div>\n' +
                        '                                </label>\n' +
                        '                                <label class="radio radio-lg mb-7 ml-6">\n' +
                        '                                    <input type="radio" name="update_frequency" value="2"' + (response[0].frequency == "2" ? "checked" : "") + ' />\n' +
                        '                                    <span></span>\n' +
                        '                                    <div class="font-size-lg font-weight-bold ml-4">Monthly</div>\n' +
                        '                                </label>\n' +
                        '                            </div>');

                    $('#emailss').empty().append('<label for="font-weight-bolder font-size-lg">Recipients :</label>\n' +
                        '                                                <span class="font-weight-bolder font-size-lg">Separate the email ids using comma !</span><input type="text" name="update_recipient_emails"\n' +
                        '                                                       class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"\n' +
                        '                                                        value="' + emails + '">');

                    $('#report_typess').empty().append('<p class="font-weight-bolder font-size-lg">Reports :</p>\n' +
                        '                            <div class="form-check-inline form-check">\n' +
                        '                                <label class="checkbox checkbox-lg mb-7">\n' +
                        '                                    <input type="checkbox" name="update_type[]" value="1" ' + (response[0].report_type == "1" || response[0].report_type == 0 ? "checked" : "") + '  />\n' +
                        '                                    <span></span>\n' +
                        '                                    <div class="font-size-lg font-weight-bold ml-3">PDF</div>\n' +
                        '                                </label>\n' +
                        '                            </div>\n' +
                        '                            <div class="form-check-inline form-check">\n' +
                        '                                <label class="checkbox checkbox-lg mb-7">\n' +
                        '                                    <input type="checkbox" name="update_type[]"  value="2" ' + (response[0].report_type == "2" || response[0].report_type == 0 ? "checked" : "") + '/>\n' +
                        '                                    <span></span>\n' +
                        '                                    <div class="font-size-lg font-weight-bold ml-3">CSV</div>\n' +
                        '                                </label>\n' +
                        '                            </div>');
                    let array = "";
                    (response[0].twitter.map(data => {
                        array = array + '<option value="' + data.account_id + '" ' + (response[0].twitterReport.includes(data.account_id.toString()) ? "selected" : "") + '>' + data.first_name + '</option>'
                    }));

                    $('#twitter_idsss').empty().append('<label for="contents" class="col-form-label font-weight-bolder font-size-lg">Twitter\n' +
                        '                                            Report :</label>\n' +
                        '                                        <select\n' +
                        '                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controlss"\n' +
                        '                                                id="sb_select2_twitter_report' + id + '" name="update_twitter[]" multiple="multiple"\n' +
                        '                                                style="width: 100%">\n' + array +
                        '                                        </select>');

                    let youtube = "";
                    (response[0].youtube.map(datas => {
                        youtube = youtube + '<option value="' + datas.account_id + '" ' + (response[0].youTubeReport.includes(datas.account_id.toString()) ? "selected" : "") + '>' + datas.first_name + '</option>'
                    }));

                    $('#youtube_idss').empty().append('<label for="contents" class="col-form-label font-weight-bolder font-size-lg">Youtube\n' +
                        '                                            Report :</label>\n' +
                        '                                        <select\n' +
                        '                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controlss"\n' +
                        '                                                id="sb_select2_youtube_report" name="update_youtube[]" multiple="multiple"\n' +
                        '                                                style="width: 100%">\n' + youtube +
                        '                                        </select>');


                    let team = "";
                    (response[0].team.map(datas => {
                        team = team + '<option value="' + datas.team_id + '" ' + (response[0].teamReport.includes(datas.team_id.toString()) ? "selected" : "") + '>' + datas.team_name + '</option>'
                    }));

                    $('#team_idss').empty().append('<label for="contents" class="col-form-label font-weight-bolder font-size-lg">Team\n' +
                        '                                            Report :</label>\n' +
                        '                                        <select\n' +
                        '                                                class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 multi-select-controlss"\n' +
                        '                                                id="sb_select2_team_report" name="update_teams[]" multiple="multiple"\n' +
                        '                                                style="width: 100%">\n' + team +
                        '                                        </select>');

                    $('.multi-select-controlss').select2({
                        width: 'resolve' //
                    });

                },
                error: function (error) {

                }
            })
        }

        function updateFormData() {
            let form = document.getElementById('update_datas');
            let formData = new FormData(form);
            $.ajax({
                url: "update-auto-email-reports",
                type: "post",
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response.code === 201) {
                        for (let i = 0; i < response.msg.length; i++) {
                            toastr.error(response.msg[i]);
                        }
                    }
                    if (response.code === 400) {
                        toastr.error(response.error)
                    }
                    if (response.code === 200) {
                        $("#autoEmailReport").modal('hide');
                        toastr.success(response.data, "", {
                            timeOut: 1000,
                            fadeOut: 1000,
                            onHidden: function () {
                                window.location.reload();
                            }
                        });
                    }
                },
                error: function (error) {
                    toastr.success(error.error);
                }
            })
        }

    </script>
    <!-- begin:password show toggle -->
@endsection
