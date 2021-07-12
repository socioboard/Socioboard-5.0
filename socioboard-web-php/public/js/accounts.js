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
                toastr.success('Sucessfully Update Rating', {
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

function lock(id, type) {
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
                    append += '<div class="ribbon-target" style="top: 12px;" onclick="lock(' + data + ',0 );"><span class="ribbon-inner bg-danger"></span><i class="fas fa-user-lock fa-fw mr-2 text-white"></i> Un-Lock </div>';
                    $("#status" + data).append(append);
                    toastr.success("Account Locked Successfully!", "");
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
                    append += '<div class="ribbon-target" style="top: 80px;" onclick="lock(' + data + ',1 );"><span class="ribbon-inner bg-info"></span><i class="fas fa-user-lock fa-fw mr-2 text-white"></i> Lock </div>';
                    $("#status" + data).append(append);
                    toastr.success("Account Un-Locked Successfully!", "");
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
