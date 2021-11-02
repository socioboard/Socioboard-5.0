
"use strict";

var SBCalendarBasic = function() {

    return {
        //main function to initiate the module
        init: function(data) {
            let calendarEl = document.getElementById('sb_calendar');
            let calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: [ 'bootstrap', 'interaction', 'dayGrid', 'timeGrid', 'list' ],
                themeSystem: 'bootstrap',

                isRTL: SBUtil.isRTL(),

                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },

                height: 800,
                contentHeight: 780,
                aspectRatio: 3,  // see: https://fullcalendar.io/docs/aspectRatio

                nowIndicator: true,

                views: {
                    dayGridMonth: { buttonText: 'month' },
                    timeGridWeek: { buttonText: 'week' },
                    timeGridDay: { buttonText: 'day' }
                },

                defaultView: 'dayGridMonth',
                editable: false,
                eventLimit: true, // allow "more" link when too many events
                navLinks: true,
                events:data,
                eventClick: function(info) {
                    $('#title').empty().append(info.event.title);
                    $('#description').empty().append(info.event.extendedProps.description);
                    $('#redirection').empty().append('<a href="'+info.event.extendedProps.redirection+'" class="btn text-hover-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 "\n' +
                        '                                           >Edit</a>');
                    $('#editcalenderbtn').modal('show')
                },


                eventRender: function(info) {
                    var element = $(info.el);


                    if (info.event.extendedProps && info.event.extendedProps.description) {
                        if (element.hasClass('fc-day-grid-event')) {

                            element.find('.fc-content').append('<div class="mt-3 calender-crud"><button class="btn btn-primary btn-sm ml-2" >Edit</button></div>');

                            element.data('content', info.event.extendedProps.description);
                            element.data('placement', 'top');
                            SBApp.initPopover(element);
                        } else if (element.hasClass('fc-time-grid-event')) {
                            element.find('.fc-title').append('<div class="fc-description">' + info.event.extendedProps.description + '</div>');
                        } else if (element.find('.fc-list-item-title').lenght !== 0) {
                            element.find('.fc-list-item-title').append('<div class="fc-description">' + info.event.extendedProps.description + '</div>');
                        }

                    }
                }
            });

            calendar.render();
        }
    };
}();

jQuery(document).ready(function() {
    function getData(data = null) {
        $.ajax({
            url: '/calendar-data',
            type: 'get',
            data: {
                id: data
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            cache: false,
            beforeSend: function () {
                $('#sb_calendar').append('<div class="d-flex justify-content-center" >\n' +
                    '        <div class="spinner-border" role="status"  id="" style="display: none;">\n' +
                    '            <span class="sr-only">Loading...</span>\n' +
                    '        </div>\n' +
                    '\n' +
                    '        </div>');
                $(".spinner-border").css("display", "block");
            },
            success: function (response) {
                $('#sb_calendar').empty();
                let events = [];
                if (response.code === 200) {
                    let i = 0;
                    response.data.map(element => {
                        if (element.scheduleCategory === 1) {
                            events[i] = {
                                title: "Day Wise Schedule",
                                start: element.createdDate,
                                extendedProps:  {
                                    redirection: response.url+'home/publishing/socioQueue-scheduling/'+element._id+'/1',
                                },
                                description: element.description,
                                className: "fc-event-danger fc-event-solid-warning",
                            }
                        } else if (element.scheduleCategory === 0) {
                            events[i] = {
                                title: "Normal Schedule",
                                start: element.createdDate,
                                extendedProps:  {
                                    redirection: response.url+'home/publishing/socioQueue-scheduling/'+element._id+'/1',
                                },
                                description: element.description,
                                className: "fc-event-solid-danger fc-event-light",
                            }
                        } else {
                            events[i] = {
                                title: "History",
                                start: element.createdDate,
                                description: element.description,
                                className: "fc-event-solid-info fc-event-light",
                            }
                        }
                        i++;
                    })
                }
                SBCalendarBasic.init(events);
            },
            error: function (error) {

            }
        })
    }

    $("#categories").change(function(){
        let status = this.value;
        getData(status);
    });
    getData();
});
      