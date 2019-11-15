@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Schedule History</title>
@endsection


@section('style')
    <style>

        /* data table */
        .dataTables_wrapper .dataTables_paginate .paginate_button.current, .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover{
            border-radius: 5px;
            border: 1px solid #92b9ee !important;
            background-color: #1d6ad2 !important;
            background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #bfdaff), color-stop(100%, #76a5e4));
            background: -webkit-linear-gradient(top, #bfdaff 0%, #76a5e4 100%) !important;
            background: -moz-linear-gradient(top, #bfdaff 0%, #76a5e4 100%) !important;
            background: -ms-linear-gradient(top, #bfdaff 0%, #76a5e4 100%) !important;
            background: -o-linear-gradient(top, #bfdaff 0%, #76a5e4 100%) !important;
            background: linear-gradient(to bottom, #bfdaff 0%, #76a5e4 100%) !important;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button{
            padding: 0.1em 0.1em !important;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover{
            border-radius: 5px;
        }
        .dataTables_wrapper .dataTables_filter input{
            border-radius: 5px;
        }
        table.dataTable tr th.select-checkbox.selected::after {
            content: "?";
            margin-top: -11px;
            margin-left: -4px;
            text-align: center;
            text-shadow: rgb(176, 190, 217) 1px 1px, rgb(176, 190, 217) -1px -1px, rgb(176, 190, 217) 1px -1px, rgb(176, 190, 217) -1px 1px;
        }
        table.dataTable thead td.select-checkbox::before, table.dataTable thead th.select-checkbox::before {
            content:' ';
            margin-top: -6px;
            margin-left: 12px;
            border: 1px solid black;
            border-radius: 3px;
        }


    </style>
    @endsection

@section('post_hitory')
    <main>
        <div class="container margin-top-60">
            <div class="row margin-top-10">
                <div class="col-md-12">
                    <h4>Scheduled Post History</h4>
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="card border-0">
                        <div class="card-body shadow p-2">
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link tab active" id="socioqueue-tab" data-toggle="tab" href="#socioqueue" role="tab" aria-controls="socioqueue" aria-selected="true" onClick="dis_element(this.id)">SocioQueue</a>
                                </li>
                                <li class="nav-item">
                                    <a  class="nav-link tab" id="daywise-tab" data-toggle="tab"  href="#daywise"  role="tab" aria-controls="daywise" aria-selected="false" onClick="dis_element(this.id)">Day Wise</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link tab" id="draft-tab" data-toggle="tab" href="#draft" role="tab" aria-controls="draft" aria-selected="false" onClick="dis_element(this.id)">Draft</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link tab" id="history-tab" data-toggle="tab" href="#history" role="tab" aria-controls="history" aria-selected="false" onClick="dis_element(this.id)">History</a>
                                </li>
                                {{--<li class="nav-item">--}}
                                    {{--<a class="nav-link tab" id="post-history-tab" data-toggle="tab" href="#postHistory" role="tab" aria-controls="postHistory" aria-selected="false">Post now draft</a>--}}
                                {{--</li>--}}
                            </ul>
                            <div class="tab-content" id="myTabContent">
                                <div class="tab-pane fade show active" id="socioqueue" role="tabpanel" aria-labelledby="socioqueue-tab">
                                    <table id="socioqueue_table" class="display table" cellspacing="0" width="100%">
                                        <thead>
                                        <tr>

                                            <th scope="col">Sent From</th>
                                            <th scope="col">Message</th>
                                            <th scope="col">Network</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                            {{--<th scope="col">Edit</th>--}}
                                        </tr>
                                        </thead>
                                        <tbody  id="socioTbody">



                                        </tbody>
                                        {{--changing--}}
                                        <div class="float-right btn-group btn-group-sm ">
                                            <button id="prev" class="btn btn-primary btn-sm prevSocio" data-toggle="tooltip" data-placement="top" title="Previous"><i class="fas fa-angle-left" ></i></button>
                                            <button  id="next" class="btn btn-primary btn-sm nextSocio" data-toggle="tooltip" data-placement="top" title="Next"><i class="fas fa-angle-right"></i></button>
                                        </div>
                                    </table>

                                </div>
                                <div class="tab-pane fade" id="daywise" role="tabpanel" aria-labelledby="daywise-tab">
                                    <table id="daywise_table" class="display table" cellspacing="0" width="100%">
                                        <thead>
                                        <tr>

                                            <th scope="col">Sent From</th>
                                            <th scope="col">Message</th>
                                            <th scope="col">Network</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>

                                        </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                        <div class="float-right btn-group btn-group-sm">
                                            <button class="btn btn-primary btn-sm prevDaywise" data-toggle="tooltip" data-placement="top" title="Previous"><i class="fas fa-angle-left" ></i></button>
                                            <button  class="btn btn-primary btn-sm nextDaywise" data-toggle="tooltip" data-placement="top" title="Next"><i class="fas fa-angle-right"></i></button>
                                        </div>
                                    </table>
                                </div>
                                <div class="tab-pane fade" id="draft" role="tabpanel" aria-labelledby="draft-tab">
                                    <table id="draft_table" class="display table" cellspacing="0" width="100%">
                                        <thead>
                                        <tr>
                                            <th scope="col">Sent From</th>
                                            <th scope="col">Message</th>
                                            <th scope="col">Network</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                        <div class="float-right btn-group btn-group-sm">
                                            <button  class="btn btn-primary btn-sm prevDraft" data-toggle="tooltip" data-placement="top" title="Previous"><i class="fas fa-angle-left" ></i></button>
                                            <button   class="btn btn-primary btn-sm nextDraft" data-toggle="tooltip" data-placement="top" title="Next"><i class="fas fa-angle-right"></i></button>
                                        </div>
                                    </table>
                                </div>
                                <div class="tab-pane fade" id="history" role="tabpanel" aria-labelledby="history-tab">
                                    <table id="history_table" class="display table" cellspacing="0" width="100%">
                                        <thead>
                                        <tr>
                                            <th scope="col">Sent From</th>
                                            <th scope="col">Message</th>
                                            <th scope="col">Network</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                        <div class="float-right btn-group btn-group-sm">
                                            <button class="btn btn-primary btn-sm prevHistory" data-toggle="tooltip" data-placement="top" title="Previous"><i class="fas fa-angle-left" ></i></button>
                                            <button class="btn btn-primary btn-sm nextHistory" data-toggle="tooltip" data-placement="top" title="Next"><i class="fas fa-angle-right"></i></button>
                                        </div>
                                    </table>
                                </div>
                                <div class="tab-pane fade" id="postHistory" role="tabpanel" aria-labelledby="history-tab">
                                    <table id="history_table1" class="display table" cellspacing="0" width="100%">
                                        <thead>
                                        <tr>
                                            <th scope="col">Sent From</th>
                                            <th scope="col">Message</th>
                                            <th scope="col">Network</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                        <div class="float-right btn-group btn-group-sm">
                                            <button class="btn btn-primary btn-sm prevpostHistory" data-toggle="tooltip" data-placement="top" title="Previous"><i class="fas fa-angle-left" ></i></button>
                                            <button class="btn btn-primary btn-sm nextpostHistory" data-toggle="tooltip" data-placement="top" title="Next"><i class="fas fa-angle-right"></i></button>
                                        </div>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>

    </main>
    @endsection


@section('script')
    <script>
        function dis_element(id){
            document.getElementById(id).setAttribute("disabled","disabled");
            console.log("ID===",id);
        }

        //for GA
        var eventCategory = 'Schedule';
        var eventAction = 'Schedule-Post-History';

        // socioqueue table
        let checkbox_table = $('#socioqueue_table, #daywise_table, #draft_table, #history_table').DataTable({
//            columnDefs: [{
//                orderable: false,
//                className: 'select-checkbox',
//                targets: 0
//            }],
//            select: {
//                style: 'os',
//                selector: 'td:first-child'
//            },
//            order: [
//                [1, 'asc']
//            ],
        "bPaginate": false,
        "bFilter": false
        });
        checkbox_table.on("click", "th.select-checkbox", function() {
            if ($("th.select-checkbox").hasClass("selected")) {
                checkbox_table.rows().deselect();
                $("th.select-checkbox").removeClass("selected");
            } else {
                checkbox_table.rows().select();
                $("th.select-checkbox").addClass("selected");
            }
        }).on("select deselect", function() {
            ("Some selection or deselection going on")
            if (checkbox_table.rows({
                        selected: true
                    }).count() !== checkbox_table.rows().count()) {
                $("th.select-checkbox").removeClass("selected");
            } else {
                $("th.select-checkbox").addClass("selected");
            }
        });


        var pageID = 1;
        var category = 0;
        var tableID = "#socioqueue_table";
        var tabDivId = "#socioqueue";
        var method = "socio";
        var next = "next";
        var prev ="prev";
        var countonload = 0;
        var table ="";

        $(document).on('click','#next',function(){

            pageID++;
            getScheduledPostHistory(1,category,pageID,method)
        });
        $(document).on('click' ,"#prev",function(){
            pageID--;
            document.getElementById("next").disabled = false;
            getScheduledPostHistory(1,category,pageID,method)
        });


        $(document).ready(function(){
           getScheduledPostHistory(1,category,pageID,method);


//            $("#nextd").click(function(){
//                 next ="nextd"
//                prev ="prevd"
//                pageID++;
//                getScheduledPostHistory(1,category,pageID,method)
//            });
//            $("#prevd").click(function(){
//                 next ="nextd"
//                prev ="prevd"
//                pageID--;
//                document.getElementById("nextd").disabled = false;
//                getScheduledPostHistory(1,category,pageID,method)
//            });
//            $("#nextdr").click(function(){
//                 next ="nextdr"
//                prev ="prevdr"
//                pageID++;
//                getScheduledPostHistory(1,category,pageID,method)
//            });
//            $("#prevdr").click(function(){
//                 next ="nextdr"
//                prev ="prevdr"
//                pageID--;
//                document.getElementById("nextdr").disabled = false;
//                getScheduledPostHistory(1,category,pageID,method)
//            });
//            $("#nexth").click(function(){
//                 next ="nexth"
//                prev ="prevh"
//                pageID++;
//                getScheduledPostHistory(1,category,pageID,method)
//            });
//            $("#prevh").click(function(){
//                 next ="nexth";
//                prev ="prevh";
//                pageID--;
//                document.getElementById("nexth").disabled = false;
//                getScheduledPostHistory(1,category,pageID,method)
//            });

            $('.tab').click(
                    function () {
                        $("#next").removeAttr("id");
                        $("#prev").removeAttr("id");
                        pageID = 1;
                        tabDivId = $(this).attr('href');
                        tableID = '#' + ($(tabDivId).find('table').attr('id'));
                        if (tabDivId == '#daywise') {
                            category = 1;
                            method = 'daywise';
                            $('.nextDaywise').attr("id", "next");
                            $('.prevDaywise').attr("id", "prev");
                            getScheduledPostHistory(1, category, pageID, method)
                        } else if (tabDivId == '#socioqueue') {
                            category = 0;
                            method = 'socio';
                            $('.nextSocio').attr("id", "next");
                            $('.prevSocio').attr("id", "prev");
                            getScheduledPostHistory(1, category, pageID, method)
                        } else if (tabDivId == '#draft') {
                            method = 'draft';
                            $('.nextDraft').attr("id", "next");
                            $('.prevDraft').attr("id", "prev");
                            getScheduledPostHistory(1, category, pageID, method)
                        } else if (tabDivId == "#history") {
                            method = 'history';
                            $('.nextHistory').attr("id", "next");
                            $('.prevHistory').attr("id", "prev");
                            getScheduledPostHistory(1, category, pageID, method)
                        }
                        else if(tabDivId == '#postHistory'){
                             method = 'postHistory';
                            $('.nextHistory').attr("id", "next");
                            $('.prevHistory').attr("id", "prev");
                            getDraftHistory(1, category, pageID, method);
                        }
                    })
            });
        function getScheduledPostHistory(scheuleStatus, scheduleCategory, pageId,method){
            var appendData ="";
            if(countonload == 0){
                document.getElementById("prev").disabled = true;

//                document.getElementById("prevd").disabled = true;
//                document.getElementById("prevdr").disabled = true;
//                document.getElementById("prevh").disabled = true;
            }
            if(pageId == 1){
                document.getElementById(prev).disabled = true; // disabling prev
            }else{
                document.getElementById(prev).disabled = false;
            }
            $.ajax({
                type: "POST",
                url: "get-post-history",
                data:{
                    scheuleStatus: scheuleStatus,
                    scheduleCategory: scheduleCategory,
                    pageId: pageId,
                    methods: method
                },
                beforeSend: function(){
                    $(tableID).DataTable().destroy();
                    $(tableID+' tbody').empty();
                },
                cache: false,
                success: function(data){
//                        document.getElementById("Button").disabled = true;
                    if(data.code == 200){
                        if(data.content.length == 0){
                            document.getElementById(next).disabled = true;
                            $(tableID).DataTable().destroy();
                            $(tableID+' tbody').empty();

//                            $(appendData).appendTo($('#socioqueue .table > tbody'));
                            $(tableID).DataTable(
                                    {
                                        "bPaginate": false,
                                        "bFilter": false
                                    }
                            );
                        }
                        for(var i=0; i < data.content.length ;i++ ){
                            if(data.content[i].message !== "" ){
                                appendData = '<tr> <td>'+data.content[i].schedulername+'</td> ' +
                                        '<td>'+ data.content[i].message +'</td> <td> '+ data.content[i].postingSocialIds +' </td> <td> '+ data.content[i].scheduleStatus +'      <td><a onclick="deleteSchedule('+ data.content[i].scheduleId+',0)" data-toggle="tooltip" title="Delete schedule"><i class="fas fa-trash-alt"></i> </a> '+ data.content[i].cancel +' ' +data.content[i].edit +
                                        '</td>  </tr>';
                            }else{
                                appendData = '<tr> <td>'+data.content[i].schedulername+'</td> ' +
                                        '<td>No message</td> <td> '+ data.content[i].postingSocialIds +' </td> <td> '+ data.content[i].scheduleStatus +'      <td><a onclick="deleteSchedule('+ data.content[i].scheduleId+',0)" data-toggle="tooltip" title="Delete schedule"><i class="fas fa-trash-alt"></i> </a> '+ data.content[i].cancel +' ' +data.content[i].edit+
                                        '</td>  </tr>';
                            }
//<a data-toggle="tooltip" title="Edit schedule" onclick="deleteSchedule('+ data.content[i].scheduleId+')"> <i class="fas fa-pen-square"></i></a>
                            $(tableID).DataTable().destroy();
                            $(appendData).appendTo($(tabDivId+' .table > tbody'));
                            table=    $(tableID).DataTable(
                                    {
                                        "bPaginate": false,
                                        "bFilter": false
                                    }
                            );
                        }
                    }else{
                        document.getElementById(next).disabled = true;
                        swal(data.message);
                    }

                },
                error: function(error){
                    console.log(error)
                    document.getElementById(next).disabled = true;
                    document.getElementById(prev).disabled = true;
                }
            })
        }

        //for post-now-draft
        function getDraftHistory(scheduleStatus, scheduleCategory, pageId,method){

            var appendData ="";
            if(countonload == 0){
                document.getElementById("prev").disabled = true;

//                document.getElementById("prevd").disabled = true;
//                document.getElementById("prevdr").disabled = true;
//                document.getElementById("prevh").disabled = true;
            }
            if(pageId == 1){
                document.getElementById(prev).disabled = true; // disabling prev
            }else{
                document.getElementById(prev).disabled = false;
            }
            $.ajax({
                type: "POST",
                url: "get-draft-history",
                data:{
                    scheduleStatus: scheduleStatus,
                    scheduleCategory: scheduleCategory,
                    pageId: pageId,
                    methods: method
                },
                beforeSend: function(){
                    $(tableID).DataTable().destroy();
                    $(tableID+' tbody').empty();
                },
                cache: false,
                success: function(data){
                    if(data.code == 200){
                        if(data.content.length == 0){
                            document.getElementById(next).disabled = true;
                            $(tableID).DataTable().destroy();
                            $(tableID+' tbody').empty();

//                            $(appendData).appendTo($('#socioqueue .table > tbody'));
                            $(tableID).DataTable(
                                    {
                                        "bPaginate": false,
                                        "bFilter": false
                                    }
                            );
                        }
                        for(var i=0; i < data.content.length ;i++ ){
                            if(data.content[i].message === "" ){
                                appendData = '<tr> <td>'+data.content[i].schedulername+'</td> ' +
                                        '<td>'+ data.content[i].message +'</td> <td> '+ data.content[i].postingSocialIds +' </td> <td> '+ data.content[i].scheduleStatus +'      <td><a onclick="deleteSchedule('+ data.content[i].scheduleId+',0)" data-toggle="tooltip" title="Delete schedule"><i class="fas fa-trash-alt"></i> </a> '+ data.content[i].cancel +'' +
                                        '</td>  </tr>';
                            }else{
                                appendData = '<tr> <td>'+data.content[i].schedulername+'</td> ' +
                                        '<td>No message</td> <td> '+ data.content[i].postingSocialIds +' </td> <td> '+ data.content[i].scheduleStatus +'      <td><a onclick="deleteSchedule('+ data.content[i].scheduleId+',0)" data-toggle="tooltip" title="Delete schedule"><i class="fas fa-trash-alt"></i> </a> '+ data.content[i].cancel +'' +
                                        '</td> <a onclick="deleteSchedule('+ data.content[i].scheduleId+',0)" data-toggle="tooltip" title="Delete schedule"><i class="fas fa-trash-alt"></i> </a> </tr>';
                            }
//<a data-toggle="tooltip" title="Edit schedule" onclick="deleteSchedule('+ data.content[i].scheduleId+')"> <i class="fas fa-pen-square"></i></a>
                            $(tableID).DataTable().destroy();
                            $(appendData).appendTo($(tabDivId+' .table > tbody'));
                            table=    $(tableID).DataTable(
                                    {
                                        "bPaginate": false,
                                        "bFilter": false
                                    }
                            );
                        }
                    }else{
                        document.getElementById(next).disabled = true;
                        swal(data.message);
                    }

                },
                error: function(error){
                    console.log(error)
                    document.getElementById(next).disabled = true;
                    document.getElementById(prev).disabled = true;
                }
            })
        }

        function deleteSchedule(scheduleId, deleteAction) {
            $.ajax({
                type: "POST",
                url: "schedule-action",
                data: {
                    scheduleId: scheduleId,
                    deleteAction: deleteAction
                },
                beforeSend: function () {

                },
                cache: false,
                success: function (response) {
                    swal(response.message)
                    getScheduledPostHistory(1, category, pageID, method);

                },
                error: function (error) {
                    console.log("internal server error");
                }
            });
        }
    </script>
    @endsection
