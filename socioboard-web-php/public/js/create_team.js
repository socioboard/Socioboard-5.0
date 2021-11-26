"use strict";

// Class definition
let list = [];
let data = [];
let team_id;
let availableMembers = [];
let invitedMembers = [];

jQuery(document).ready(function () {
    SBKanbanBoard.init();
});

let SBKanbanBoard = function () {
    let create_team = async function () {
        await jQuery.ajax({
            url: '/get-available-members',
            type: 'get',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    let data = response.data;
                    availableMembers = data.map(element => {
                        return {
                            'id': element.user_id,
                            'username': element.email,
                            'title': '<div class="d-flex align-items-center">' +
                                '<div class="symbol symbol-success mr-3">' +
                                '<img class="symbol-label font-size-h4" src="' + (element.profile_picture === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : element.profile_picture) + '"></img>' +
                                '</div>' +
                                '<div class="d-flex flex-column align-items-start">' +
                                '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                '<span class="label label-inline label-light-success font-weight-bold">Processing</span>' +
                                '</div>' +
                                '</div>'
                        };
                    });

                }
            },
            error: function (error) {
            }

        })
        await jQuery.ajax({
            url: '/get-invited-members',
            type: 'get',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                if (response.code === 200) {
                    let data = response.data;
                    invitedMembers = data.map(element => {
                        return {
                            'id': element.user_id,
                            'username': element.email,
                            'title': '<div class="d-flex align-items-center">' +
                                '<div class="symbol symbol-success mr-3">' +
                                '<img class="symbol-label font-size-h4" src="' + element.profile_picture + '"></img>' +
                                '</div>' +
                                '<div class="d-flex flex-column align-items-start">' +
                                '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                '<span class="label label-inline label-light-success font-weight-bold">Info</span>' +
                                '</div>' +
                                '</div>'
                        };
                    });

                }
            },
            error: function (error) {
            }

        });
        var kanban = new jKanban({
            element: '#create_team',
            gutter: '0',
            click: function (el) {
                console.log(list)
            },
            dragItems: true,
            boards: [{
                'id': '_memberlist',
                'title': 'Profiles Available for Connection<br><small>Drag profile to add in your team</small>',
                'item': availableMembers
            },
                {
                    'id': '_invited',
                    'title': 'Invited Members',
                    'class': 'light-info',
                    'item': invitedMembers
                },
            ],
            dragBoards: false,
            dropEl: function (el, target, source) {

                jQuery.ajax({
                    url: '/drag-invite',
                    type: 'get',
                    data: {
                        sourceValue: source.parentElement.dataset.id,
                        targetValue: target.parentElement.dataset.id,
                        email: el.dataset.username,
                        id: el.dataset.eid
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success(response.message);
                        } else if (response.code === 400) {

                            toastr.error(response.message);
                        } else {
                            toastr.error(response.message);
                        }
                    },
                    error: function (error) {
                        toastr.error(error.ErrorMessage);
                   }


                })

            },
        });

        let addBoardDefault = document.getElementById('form_field');
        let team_id;


        let removeBoard = document.getElementById('_' + team_id);

        removeBoard.addEventListener('click', function () {
            kanban.removeBoard('_done');
        });

    }
    $(document).on('submit','#form_field', function (e) {
        e.preventDefault();
        $('#create_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Creating team');
        let formData = new FormData(form_field);
        jQuery.ajax({
            url: '/create-team',
            type: 'post',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                $('#create_button').empty().append('Create Team');
                if (response['code'] === 200) {
                    // $("#teamCreateModal").modal('hide');
                    toastr.success(response.message);
                    window.location.href = "/team/"+response.data.team_id;
                    // let name = response['data']['team_name'];
                    // let team_logo = response['data']['team_logo'];
                    // let team_id = response['data']['team_id'];
                    // kanban.addBoards(
                    //     [ {
                    //         'id': 'admin' ,
                    //         'title': 'Admin',
                    //         'class': 'primary-light',
                    //         'item': [{
                    //             'id': response.admin_id,
                    //             'username': response.email,
                    //             'title': '<div class="d-flex align-items-center">' +
                    //                 '<div class="symbol symbol-success mr-3">' +
                    //                 '<img class="symbol-label font-size-h4" src="' + response.admin_profile + '"></img>' +
                    //                 '</div>' +
                    //                 '<div class="d-flex flex-column align-items-start">' +
                    //                 '<span class="text-dark-50 font-weight-bold mb-1">' + response.admin + '</span>' +
                    //                 '<span class="label label-inline label-light-success font-weight-bold">Admin</span>' +
                    //                 '</div>' +
                    //                 '</div>'
                    //         }
                    //         ]
                    //     },
                    //         {
                    //             'id': '_team' + team_id,
                    //             'title': '<div class="card-title" style="display: flex;"><div class="symbol symbol-50"><img src="'+ team_logo+'"/></div><h3 class="card-label" style="margin: 15px 0 0 0; line-height: 1.2;">&nbsp;&nbsp;'+ name+'</h3></div>',
                    //             'class': 'primary-light',
                    //             'item': []
                    //         },
                    //     ]
                    // );
                } else if (response['code'] === 204) {
                    toastr.error(response.message)
                } else {
                    toastr.error(response.error)
                }
            },
            error: function (error) {
                $('#create_button').empty().append('Create Team');
                toastr.error(error.error)
            }

        });

    });

    // Public functions
    return {
        init: function () {
            create_team();
        }
    };
}();
