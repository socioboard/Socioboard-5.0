"use strict";

// Class definition

let adminData = [];
let teamMembersAcceptedDatas = [];
let teamMembersPendingDatas = [];
let leftFromTeamDatas = [];
let teamSocialAccounts = [];
let availableSocialAccounts = [];
let acctype = '';
let profilePicDefault = '';

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

const SocialDefaultImages = [
    {},
    {
        accountType: 'Facebook',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUSuMWEcCUPi4dy_q-HfMpQYrlwDOxWOILlQ&usqp=CAU'
    }, {
        accountType: 'Fb Page',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUSuMWEcCUPi4dy_q-HfMpQYrlwDOxWOILlQ&usqp=CAU'
    },
    {}, {
        accountType: 'Twitter',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIy0G6PWiqV0NM13Zd3OBB0H6SixdDsPxcgQ&usqp=CAU'
    }, {
        accountType: 'Instagram',
        profilePicDefault: 'https://i.imgur.com/TMVAonx.png'
    }, {
        accountType: 'LinkedIn',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAazafiWiEDZc4wDZ6pSbidJPw4CTOuLwSBA&usqp=CAU'
    }, {
        accountType: 'LinkedIn Page',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAazafiWiEDZc4wDZ6pSbidJPw4CTOuLwSBA&usqp=CAU'
    }, {
        accountType: 'Google'
    }, {
        accountType: 'Youtube',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2p64RiNbHCKAGcrR7ZnOHjaiULOeG1KWpuQ&usqp=CAU'
    }, {
        accountType: 'Google'
    }, {
        accountType: 'Pinterest',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTldN9DuPhILuicsJc5JDGmDRWCI7Y-BXDLEA&usqp=CAU'
    }, {
        accountType: 'Insta-Business',
        profilePicDefault: 'https://i.imgur.com/TMVAonx.png'
    },
    {},
    {
        accountType: 'Medium',
    }, {
        accountType: 'DailyMotion'
    },
    {
        accountType: 'Tumblr',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIqlxS7Cw_ggWMFVpVEQv-zWvfXqc36Bt0Lw&usqp=CAU'
    },{},
    {
        accountType: 'TikTok',
        profilePicDefault: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOg6a1JGvLre53ishmhjU63uwyz7Ok7_LSAw&usqp=CAU'
    }
];

let SBKanbanBoard = function () {
    let id = parseInt(window.location.pathname.split("/")[2]);//to get teamid
    let socialAccounts = [], allSocialAccounts = [];
    let sb_teams = async function () {
        await jQuery.ajax({
            url: '/get-team-details',
            type: 'get',
            data: {teamid: id},
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                let profilePicture;
                if (response.code === 200) {
                    response.teamSocialAccounts.map(element => {
                        if (element.account_type !== 13) {
                            socialAccounts.push(element);
                        }
                    });
                    if (response.adminData.length > 0) {
                        adminData = response.adminData.map(element => {
                            profilePicture = element.profile_picture;
                            if (isValidURL(element.profile_picture) === true) profilePicture = element.profile_picture;
                            else profilePicture = profilePicture === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture;

                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilePicture + '" alt="ProfilePic"/>' +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + element.first_name + ' ' + element.last_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">Admin</span>' +
                                    '</div>' +
                                    '</div>'
                            };
                        });
                    }
                    let profile_name;
                    if (response.teamSocialAccounts.length > 0) {
                        teamSocialAccounts = socialAccounts.map(element => {
                            profilePicDefault = '';
                            profile_name = element.first_name;
                            if(element.account_type === 18)
                            {
                                profile_name = element.user_name;

                            }
                            if (isValidURL(element.profile_pic_url) === true) {
                                profilePicture = element.profile_pic_url;
                            } else {
                                profilePicture = '../' + element.profile_pic_url;
                            }
                            let defaultImage = SocialDefaultImages[element.account_type]?.profilePicDefault ?? profilePicture;
                            let accountType = SocialDefaultImages[element.account_type]?.accountType ?? 'Social Account';
                            return {
                                'id': element.account_id,
                                'username': element.first_name,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    `<img class="symbol-label font-size-h4" src="${profilePicture}" onerror=" this.onerror=null;this.src='${defaultImage}';" alt="ProfilePic"/>` +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + profile_name + '</span>' +
                                    '<span class="label label-inline label-light-success font-weight-bold">' + accountType + '</span>' +
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
                                profilepic = (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.user.profile_picture);
                            }
                            return {
                                'id': element.user.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '" alt="ProfilePic"/>' +
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
                                profilepic = (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                            }
                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '" alt="ProfilePic"/>' +
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
                        let profile_name;
                        response.availableSocialAccounts.map(element => {
                            if (element.account_type !== 13) {
                                allSocialAccounts.push(element);
                            }
                        });
                        availableSocialAccounts = allSocialAccounts.map(element => {
                            profilepic = element.profile_picture;
                            profile_name = element.first_name;
                            if (isValidURL(element.profile_pic_url) === true) {
                                profilepic = element.profile_pic_url;
                            } else {
                                profilepic = (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_pic_url);
                            }
                            if (element.account_type === 1) {
                                acctype = 'Facebook';
                            } else if (element.account_type === 2) {
                                acctype = 'Fb Page';
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
                            } else if (element.account_type === 7) {
                                acctype = 'LinkedIn page';
                            } else if (element.account_type === 12) {
                                acctype = 'Instagram Business';
                            } else if (element.account_type === 14) {
                                acctype = 'Medium';
                            } else if (element.account_type === 16) {
                                acctype = 'Tumblr';
                            } else if (element.account_type === 11) {
                                acctype = 'Pinterest';
                            } else if (element.account_type === 15) {
                                acctype = 'DailyMotion';
                            }
                            else if (element.account_type === 18) {
                                acctype = 'TikTok';
                                profile_name=element.user_name;
                            }
                            else {
                                acctype = 'Social Account';
                            }
                            let defaultImage = SocialDefaultImages[element.account_type]?.profilePicDefault ?? profilePicture;
                            let accountType = SocialDefaultImages[element.account_type]?.accountType ?? 'Social Account';
                            return {
                                'id': element.account_id,
                                'username': element.first_name,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    `<img class="symbol-label font-size-h4" src="${profilepic}" onerror=" this.onerror=null;this.src='${defaultImage}';" alt="ProfilePic"/>` +
                                    '</div>' +
                                    '<div class="d-flex flex-column align-items-start">' +
                                    '<span class="text-dark-50 font-weight-bold mb-1">' + profile_name + '</span>' +
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
                                profilepic = (profilepic === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                            }
                            return {
                                'id': element.user_id,
                                'username': element.email,
                                'title': '<div class="d-flex align-items-center">' +
                                    '<div class="symbol symbol-success mr-3">' +
                                    '<img class="symbol-label font-size-h4" src="' + profilepic + '" alt="ProfilePic"/>' +
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
        let kanban = new jKanban({
            element: '#Sb_teams',
            gutter: '0',
            click: function (el) {
            },
            boards: [{
                'id': '_admin',
                'title': 'Admin<br><small>Drag a profile from Team Members to here to make as Admin</small>',
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
                    'title': 'Team Members<br><small>Drag a profile here to make as Team Member</small>',
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
                    'title': 'Left Team Members<br><small>Drag here to make a Team member leave from a team</small>',
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
                        } else if (response.code === 501) {
                            toastr.info(response.message, 'warning', {
                                timeOut: 2000,
                                fadeOut: 2000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        } else if (response.code === 500) {
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

        const toDoButton = document.getElementById('inviteMembers');
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

        let addBoardDefault = document.getElementById('addDefault');
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

        let removeBoard = document.getElementById('removeBoard');
        removeBoard.addEventListener('click', function () {
            kanban.removeBoard('_admin');
        });
    };

    // Public functions
    return {
        init: function () {
            sb_teams().then(r => console.log(r));
        }
    };
}();

jQuery(document).ready(function () {
    SBKanbanBoard.init();
});

function isValidURL(str) {
    const regex = /(http|https):\/\/(\w+:?\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%\-\/]))?/;
    return regex.test(str);
}

