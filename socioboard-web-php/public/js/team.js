"use strict";

// Class definition

let adminData = [];
let teamMembersAcceptedDatas = [];
let teamMembersPendingDatas = [];
let leftFromTeamDatas = [];
let teamSocialAccounts = [];
let availableSocialAccounts = [];
let acctype = '';

function withDrawInvitaion(email) {
    let id = parseInt(window.location.pathname.split("/")[2]);
    jQuery.ajax({
        url: '/withdraw-invitation',
        type: 'get',
        data: {
            teamId: id,
            email: email
        },
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success(response.message, 'SuccessFully withdrawn invitaion', {
                    timeOut: 2000,
                    fadeOut: 2000,
                    onHidden: function () {
                        window.location.reload();
                    }
                });
            } else if (response.code === 400) {
                toastr.error(response.message);
            } else {
                toastr.error(response.message);
            }
        }
    });
}

var SBKanbanBoard = function () {
    let id = parseInt(window.location.pathname.split("/")[2]);//to get teamid
    var sb_teams = async function () {
        await jQuery.ajax({
            url: '/get-team-details',
            type: 'get',
            data: {teamid: id},
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                let profilepic;
                if (response.code === 200) {
                    if (response.adminData.length > 0) {
                        adminData = response.adminData.map(element => {
                            profilepic = element.profile_picture;
                            if (isValidURL(element.profile_picture) === true) {
                                profilepic = element.profile_picture;
                            } else {
                                profilepic =  (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                            }
                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">Admin</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    if (response.teamSocialAccounts.length > 0) {
                        teamSocialAccounts = response.teamSocialAccounts.map(element => {
                            if (isValidURL(element.profile_pic_url) === true) {
                                profilepic = element.profile_pic_url;
                            } else {
                                profilepic = '../' + element.profile_pic_url;
                            }
                            if (element.account_type === 1 || element.account_type === 2 || element.account_type === 3) {
                                acctype = 'Facebook';
                            } else if (element.account_type === 4) {
                                acctype = 'Twitter';
                            } else if (element.account_type === 5) {
                                acctype = 'Instagram';
                            } else if (element.account_type === 6 ) {
                                acctype = 'LinkedIn';
                            } else if (element.account_type === 8 || element.account_type === 10) {
                                acctype = 'Google';
                            } else if (element.account_type === 9) {
                                acctype = 'Youtube';
                            } else if (element.account_type === 12) {
                                acctype = 'Instagram Business';
                            }else if(element.account_type === 7)
                            {
                                acctype = 'LinkedIn Page';
                            }
                            else {
                                acctype = 'Pinterest';
                            }
                            return {
                                'id': element.account_id,
                                'username': element.first_name,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">' + acctype + '</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    if (response.teamMembersAcceptedDatas.length > 0) {
                        let profilepic;
                        teamMembersAcceptedDatas = response.teamMembersAcceptedDatas.map(element => {
                            profilepic = element.user.profile_picture;
                            if (isValidURL(element.user.profile_picture) === true) {
                                profilepic = element.user.profile_picture;
                            } else {
                                profilepic =  (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.user.profile_picture);
                            }
                            return {
                                'id': element.user.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.user.first_name + ' ' + element.user.last_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">' + element.label + '</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    if (response.teamMembersPendingDatas.length > 0) {
                        let profilepic;
                        teamMembersPendingDatas = response.teamMembersPendingDatas.map(element => {
                            profilepic = element.profile_picture;
                            if (isValidURL(element.profile_picture) === true) {
                                profilepic = element.profile_picture;
                            } else {
                                profilepic =  (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                            }
                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold  mb-1">Pending</span>' +
                                    '<a type="button" class="label label-inline label-danger font-weight-bold" onclick="withDrawInvitaion(\'' + element.email + '\')">Withdraw</a>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    if (response.availableSocialAccounts.length > 0) {
                        let profilepic;
                        availableSocialAccounts = response.availableSocialAccounts.map(element => {
                            profilepic = element.profile_picture;
                            if (isValidURL(element.profile_pic_url) === true) {
                                profilepic = element.profile_pic_url;
                            } else {
                                profilepic =  (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_pic_url);
                            }
                            if (element.account_type === 1 || element.account_type === 2 || element.account_type === 3) {
                                acctype = 'Facebook';
                            } else if (element.account_type === 4) {
                                acctype = 'Twitter';
                            } else if (element.account_type === 5) {
                                acctype = 'Instagram';
                            } else if (element.account_type === 6) {
                                acctype = 'LinkedIn';
                            } else if (element.account_type === 8 || element.account_type === 10) {
                                acctype = 'Google';
                            } else if (element.account_type === 9) {
                                acctype = 'Youtube';
                            }
                            else if (element.account_type === 7) {
                                acctype = 'LinkedIn page';
                            }
                            else if (element.account_type === 12) {
                                acctype = 'Instagram Business';
                            }
                            else {
                                acctype = 'Pinterest';
                            }
                            return {
                                'id': element.account_id,
                                'username': element.first_name,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">' + acctype + '</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    if (response.leftFromTeamDatas.length > 0) {
                        let profilepic;
                        leftFromTeamDatas = response.leftFromTeamDatas.map(element => {
                            profilepic = element.profile_picture;
                            if (isValidURL(element.profile_picture) === true) {
                                profilepic = element.profile_picture;
                            } else {
                                profilepic =  (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                            }
                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '"></img>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">Left</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }

                } else if (response.code === 400) {
                    toastr.error(response.message);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function (error) {
            }

        });
        var kanban = new jKanban({
            element: '#Sb_teams',
            gutter: '0',
            click: function (el) {
            },
            boards: [{
                'id': '_admin',
                'title': 'Admin',
                'class': 'light-success',
                'item': adminData
            },
                {
                    'id': '_teamSocialAccounts',
                    'title': 'Team Social Accounts<br><small>Drag profile here to add in your team</small>',
                    'class': 'light-dark',
                    'item': teamSocialAccounts
                },
                {
                    'id': '_allSocialAccounts',
                    'title': 'All Social Accounts Available to add in a team',
                    'class': 'light-info',
                    'item': availableSocialAccounts
                },
                {
                    'id': '_teamMembers',
                    'title': 'Team Members',
                    'class': 'light',
                    'item': teamMembersAcceptedDatas
                },
                {
                    'id': '_pendingTeamMembers',
                    'title': 'Pending Team Member',
                    'class': 'primary-light',
                    'item': teamMembersPendingDatas
                },
                {
                    'id': '_leftTeamMembers',
                    'title': 'Left or Removed Team Members<br><small>Drag here to remove member from a team</small>',
                    'class': 'light-warning',
                    'item': leftFromTeamDatas
                }
            ],
            dropEl: function (el, target, source) {
                jQuery.ajax({
                    url: '/drag-drop-team-operations',
                    type: 'get',
                    data: {
                        sourceValue: source.parentElement.dataset.id,
                        targetValue: target.parentElement.dataset.id,
                        email: el.dataset.username,
                        id: el.dataset.eid,
                        teamid: id
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success(response.message);
                        } else if (response.code === 400) {
                            toastr.error(response.message, 'error', {
                                timeOut: 2000,
                                fadeOut: 2000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        }
                        else if (response.code === 501) {
                            toastr.info(response.message, 'warning', {
                                timeOut: 2000,
                                fadeOut: 2000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        }
                        else if (response.code === 500) {
                            toastr.error(response.message, '!!error', {
                                timeOut: 2000,
                                fadeOut: 2000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    },
                    error: function (error) {
                    }

                })
            },
        });

        var toDoButton = document.getElementById('inviteMembers');
        toDoButton.addEventListener('click', function () {
            kanban.addElement(
                '_invited', {
                    'title': `
                        <div class="d-flex align-items-center">
                            <div class="symbol symbol-light-primary mr-3">
                                <span class="symbol-label font-size-h4">SB</span>
                            </div>
                            <div class="d-flex flex-column align-items-start">
                                <span class="text-dark-50 font-weight-bold mb-1">Chanchal</span>
                                <span class="label label-inline label-light-warning font-weight-bold">In progress</span>
                            </div>
                        </div>
                    `
                }
            );
        });

        var addBoardDefault = document.getElementById('addDefault');
        addBoardDefault.addEventListener('click', function () {
            kanban.addBoards(
                [{
                    'id': '_default',
                    'title': 'New Board',
                    'class': 'primary-light',
                    'item': []
                }]
            )
        });

        var removeBoard = document.getElementById('removeBoard');
        removeBoard.addEventListener('click', function () {
            kanban.removeBoard('_admin');
        });
    }

    // Public functions
    return {
        init: function () {
            sb_teams();
        }
    };
}();

jQuery(document).ready(function () {
    SBKanbanBoard.init();
});

function isValidURL(str) {
    var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (!regex.test(str)) {
        return false;
    } else {
        return true;
    }
}

