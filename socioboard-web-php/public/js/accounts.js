function ratingUpdate(rating, accountId) {
    $.ajax({
        type: "post",
        url: '/update-rating',
        data: {accountId, rating},
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success('Sucessfully Updated Rating', {
                    timeOut: 1000,
                    fadeOut: 1000,
                });
            } else if (response.code === 400) {
                toastr.error(response.message, {
                    timeOut: 1000,
                    fadeOut: 1000,
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}

function cronUpdate(accountId, cronvalue) {
    if (cronvalue === 1) cronvalue = 2;
    else cronvalue = 1;

    $.ajax({
        type: "post",
        url: '/update-cron',
        data: {accountId, cronvalue},
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                let append = "";
                $("#cronModify" + accountId).empty();
                append += '<label><input type="checkbox" id="cronUpdate' + accountId + '" name="select" onclick="cronUpdate(' + accountId + ',' + cronvalue + ');"';
                if (cronvalue === 2) append += 'checked';
                append += '><span></span>\n' +
                    '</label>';
                $("#cronModify" + accountId).append(append);
                toastr.success('The Cron Updated', {
                    timeOut: 1000,
                    fadeOut: 1000,
                });
            } else if (response.code === 400) {
                toastr.error(response.error, {
                    timeOut: 1000,
                    fadeOut: 1000,
                });
            }
            else{
                toastr.error('Some error occured, cant update cron');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}

function lock(id, type,className1,className2,url1,url2) {
    var data = id;
    if (type === 1) {
        $.ajax({
            url: '/lock-accounts/' + data,
            type: 'GET',
            processData: false,
            cache: false,
            success: function (response) {
                if (response.code === 200) {
                    let append = "";
                    $("#status" + data).empty();
                    append += '<div class="ribbon-target accounts-lock-unlock" style="top: 12px;" onclick="lock(' + data + ',0 ,\'' + className1+ '\',\'' + className2+ '\',\'' + url1+ '\',\'' + url2+ '\');"><span class="ribbon-inner bg-danger"></span><i class="fas fa-user-lock fa-fw mr-2 text-white"></i> Un-Lock </div>';
                    $("#status" + data).append(append);
                    toastr.success("Account Locked Successfully!");
                    $("."+className1).attr("onclick","return false");
                    $("."+className1).attr("title","The Account is  Locked");
                    $("."+className2).removeAttr("href");
                } else if (response.code === 400) {
                    toastr.error(response.message, "Locking Error!");
                } else if (response.code === 401) {
                    toastr.error(response.message, "Locking Failed!");
                } else {
                    toastr.error(response.message, "Lock Error!");
                }
            },
            error: function (error) {

            }
        })
    } else if (type === 0) {
        $.ajax({
            url: '/unlock-accounts/' + data,
            type: 'GET',
            processData: false,
            cache: false,
            success: function (response) {
                if (response.code === 200) {
                    let append = "";
                    $("#status" + data).empty();
                    append += '<div class="ribbon-target accounts-lock-unlock" style="top: 80px;" onclick="lock(' + data + ',1 ,\'' + className1+ '\',\'' + className2+ '\',\'' + url1+ '\',\'' + url2+ '\');"><span class="ribbon-inner bg-info"></span><i class="fas fa-user-lock fa-fw mr-2 text-white"></i> Lock </div>';
                    $("#status" + data).append(append);
                    toastr.success("Account Un-Locked Successfully!");
                    $("."+className1).removeAttr("onclick");
                    $("."+className1).removeAttr("title");
                    $("."+className1).attr('href',url1);
                    $("."+className2).attr('href',url2);
                } else if (response.code === 400) {
                    toastr.error(response.message, "Account Un-Locked Successfully!");
                } else if (response.code === 401) {
                    toastr.error(response.message, "Un-Locking Failed!");
                } else {
                    toastr.error(response.message, "Un-Locking Failed!");
                }
            },
            error: function (error) {

            }
        })
    }
}


/**
 * TODO We have to append the teams names in the dropdown value of the selects.
 * This function is used for appending teams names  dropdowns UI of invite.
 * ! Do not change this function without getting the teams names of Social accounts.
 */

function appendTeams() {
    $.ajax({
        url: "append-teams-name",
        type: 'get',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            $('#teamDropDown1').empty();
            $('#teamDropDown1').append('<option selected disabled>Select Teams</option>');
            if (response.code === 200) {
                allTeamsValue = response.data.teamSocialAccountDetails;
                response.data.teamSocialAccountDetails.map(data => {
                    $('#teamDropDown1').append('<option value="' + data[0].team_id + '" >' + data[0].team_name + '</option>');
                });
            } else if (response.code === 400) {
                $('#teamDropDown1').append('<option selected disabled>' + response.error + '</option>');

            } else {
                $('#teamDropDown1').append('<option selected disabled>Can not get Teams</option>');
            }
        }
    });
}

/**
 * TODO We have to Sending the invite to the  Social media user based on all in the dropdown value of the selects and text fileds.
 * This function is used for Sending invites by getting all values from  dropdowns UI of invite.
 * ! Do not change this function without referring API format of Sending the invites names of Social accounts.
 */

function sendInvite() {
    let network = [];
    let requestData = {};
    for (let i = 1; i <= GlobalValue; i++) {
        let temp = {
            "teamId": $("#teamDropDown" + i).val(),
            "userName": "@" + $("#userID" + i).val(),
            "accName": $("#accountName" + i).val(),
            "email": $("#emailID" + i).val(),
            "network": $("#socialMediaSelected" + i).val(),
        };
        network.push(temp);
    }
    requestData["data"] = network;
    ajaxInvitation(requestData);
}


/**
 * TODO We have get  Selected value of team from dropdown select .
 * This function is used for getting Selected value from  Select Team dropdowns UI of invite.
 */
function getSelectedTeamValue() {
    team_selected = document.getElementById("teamDropDown1").value;
}

/**
 * TODO We have get  Selected value of Social from dropdown select accounts .
 * This function is used for getting Selected value from  Select accounts dropdowns UI of invite.
 */
function getSelectedSocialValue() {
    social_media_selected = document.getElementById("socialMediaSelected1").value;
}

let GlobalValue = 1;

let count = 1;

/**
 * TODO We have to Add a row from UI of invite table when click on + icon in UI.
 * This function is used for Adding row from UI of invite of invite table.
 */
function addRow(value) {
    if (count > 2) {
        toastr.error('We can not add more than 3 row');
    } else {
        GlobalValue = GlobalValue + value;
        let append = "";
        append = '<tr id="socialRows' + GlobalValue + '">\n' +
            '<td></td>\n' +
            '<td>\n' +
            '<a class="table-remove btn btn-danger btn-sm mt-2"><i class=" fa fa-minus" onclick="removeRow(' + GlobalValue + ');"></i></a>\n' +
            '</td>' +
            '<td>\n' +
            '<select class="form-control h-auto py-4" id="socialMediaSelected' + GlobalValue + '"\n' +
            'onchange="getSelectedSocialValue()">\n' +
            '<option selected disabled>Select Account</option>\n' +
            '<option value="Facebook">Facebook</option>\n' +
            '<option value="Twitter">Twitter</option>\n' +
            '<option value="Instagram">Instagram</option>\n' +
            '<option value="LinkedIn">LinkedIn</option>\n' +
            '</select>\n' +
            '</td>\n' +
            '<td>\n' +
            '<select class="form-control h-auto py-4" id="teamDropDown' + GlobalValue + '"\n' +
            'onchange="getSelectedTeamValue()">\n' + teamDropDownValue() +
            '</select>\n' +
            '</td>\n' +
            '<td>\n' +
            '<input id="userID' + GlobalValue + '" type="text" class="form-control h-auto py-4"\n' +
            'placeholder="type User ID">\n' +
            '</td>\n' +
            '<td>\n' +
            '<input id="emailID' + GlobalValue + '" type="email" class="form-control h-auto py-4"\n' +
            'placeholder="Email ID">\n' +
            '</td>\n' +
            '<td>\n' +
            '<input id="accountName' + GlobalValue + '" type="text" class="form-control h-auto py-4"\n' +
            'placeholder="Account name">\n' +
            '</td>\n' +
            '</tr>';
        $("#socialRows").append(append);
        count++;
    }

}

/**
 * TODO We have append the team Values in select dropdown area UI with teamids and values.
 * This function is used for appending the with teamids and values from  dropdowns UI of select Teams.
 * ! Do not change this function without referring API format of getting sll team values with ids.
 */
function teamDropDownValue() {
    let teams = '';
    teams = '<option selected disabled>Select Teams</option>\n';
    allTeamsValue.map(data => {
        teams += '<option value="' + data[0].team_id + '" >' + data[0].team_name + '</option>'
    });
    return teams;

}

/**
 * TODO We have to removing a row from UI of invite table when click on - icon.
 * This function is used for removing row from UI of invite of invite table.
 */
function removeRow(value) {
    $("#socialRows" + value).remove();
    count--;
    GlobalValue--;
}

/**
 * TODO We have to Sending the invite to the  Social media user based on all in the dropdown value of the selects and text fileds.
 * This function is used for Sending invites by getting all values from  dropdowns UI of invite.
 * ! Do not change this function without referring API format of Sending the invites names of Social accounts.
 */
function ajaxInvitation(requestData) {
    $.ajax({
        type: "post",
        url: '/send-invite-to-add-account',
        data: {
            datas: requestData,
        },
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                for (let i = 1; i <= GlobalValue; i++) {
                    $("#userID" + i).val("");
                    $("#emailID" + i).val("");
                    $("#accountName" + i).val("");
                }
                $('#inviteModal').modal('hide');
                toastr.success('Mail sent successfully');
            } else if (response.code === 400) {
                toastr.error(response.error);
            } else if (response.code === 401) {
                toastr.error(response.error);
            } else {
                toastr.error('Some error occured');
            }

        }
    });
}

/**
 * TODO We have to Sending the bulk invite to the  Social media user based on all values from the xlsx file uploaded.
 * This function is used for Sending  bulk invites by uploading Xlsx fole in  UI of invite.
 * xlsx contains values of multiple invite.
 * ! Do not change this function without referring API format of Sending the invites names of Social accounts.
 */
function bulkInvite() {
    let file = $("#upload-bulk").get(0).files.length;
    if (file == 0) {
        toastr.error('Please select a file first in .xlxs format');
        return;
    }
    let file_data = $("#upload-bulk").prop("files")[0];
    let form_data = new FormData();
    form_data.append("file", file_data);
    $.ajax({
        type: "post",
        url: '/bulk-invite',
        data: form_data,
        cache: false,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        beforeSend: function () {
            $('#bulkInvites').html('Sending Invite...');
        },
        success: function (response) {
            $('#bulkInvites').html('Bulk Invite');
            if (response.code === 200) {
                $('#invite').modal('hide');
                toastr.success('Mail sent successfully');
                document.getElementById("upload-bulk").value = "";
            } else if (response.code === 400) {
                toastr.error(response.error);
            } else if (response.code === 401) {
                toastr.error(response.error);
            } else {
                toastr.error(response.message);

            }
        }
    });

}
