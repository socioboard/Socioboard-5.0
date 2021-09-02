let remove_avatar_value = 0;

$(document).ready(function () {
    let append = "";
    let replace_timezone = "";
    append += '<option id="" value="nil" disabled selected>Select timezone</option>';
    timezones.forEach(function (time) {
        replace_timezone = time.zone.replace('/', "");
        append += '<option  id="' + time.zone + '_' + time.offset + '" value="' + replace_timezone + '">' + time.name + '</option>';
    });

    let lan_append = "";
    lan_append += '<option id="" value="null" disabled selected>Select language</option>';
    ALL_LANGUAGES.forEach(function (lang) {
        lan_append += '<option value="' + lang.value + '">' + lang.name + '</option>';
    });
    $('#timezone_id').empty();
    $('#timezone_id').append(append);
    $('#languages_id').empty();
    $('#languages_id').append(lan_append);
});

setTimeout(function () {
    $("#languages_id").val(JSON.parse($("#languageData").val()));
    $("#timezone_id").val(JSON.parse($("#timeZoneData").val()));
},3000)

let changePassword = function () {
    $('#current_password_Error, #new_password_Error, #conform_password_Error').html("");
    $.ajax({
        type: "post",
        url: "/change-password",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            current_passwords: $('#cuurent_password_ids').val(),
            new_passwords: $('#new_password_ids').val(),
            confirm_passwords: $('#conform_password_ids').val(),
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                localStorage.setItem('random_key', response.new_password);
                toastr.success(response.message);
            } else if (response.code === 201) {
                let i;
                for (i of response.message) {
                    switch (i) {
                        case 'Current Password is required':
                            $('#current_password_Error').html(i);
                            break;
                        case 'New password is required':
                            $('#new_password_Error').html(i);
                            break;
                        case 'Password must consist atleast 1 uppercase, 1 lowercase, 1 special character, 1 numeric value and minimum 8 charecters':
                            $('#new_password_Error').html(i);
                            break;
                        case 'confirm password is required':
                            $('#conform_password_Error').html(i);
                            break;
                        case 'password mismatch':
                            $('#conform_password_Error').html(i);
                            break;
                    }
                }
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error("Not able to load");
        }
    });
}

//  Remove Avatar
function removeAvatar() {
    remove_avatar_value = 1 ;
    $('#kt_profile_avatar').css('background-image', 'url(media/svg/avatars/001-boy.svg)');
};


function cancelPasswordChanges() {
    document.getElementById('reset_password_form_id').reset();
};
function updateProfileCancel() {
    window.location.reload();
};

function numbersOnly(event) {
    let k;
    document.all ? k = event.keyCode : k = event.which;
    return (k == 8 || (k >= 48 && k <= 57));
}

let updateProfileData = function (profileType) {
    $('#first_name_Error1, #last_name_Error1, #phone_number_Error1, #location_Error1, #company_Error1, #user_name_Error1, #language_Error1, #timezone_Error1').html("");
    var file_data = $('#profile_avatar').prop('files')[0];
    var form_data = new FormData();
    form_data.append('first_name', $('#first_name_id').val());
    form_data.append('last_name', $('#last_name_id').val());
    form_data.append('company_name', $('#company_name_id').val());
    form_data.append('phone_number', $('#phone_number_id').val());
    form_data.append('location', $('#location_name_id').val());
    form_data.append('user_name', $('#user_name_id').val());
    if($('#languages_id').val() !== null ) form_data.append('language', $('#languages_id').val());
    if($('#timezone_id').val() !== null ) form_data.append('timezone', $('#timezone_id').val());
    form_data.append('country', $("#phone_number_id").prev().children().children().attr('class').slice(-2));
    form_data.append('phone_code', '+'+$("#phone_number_id").prev().children().attr('title').split("+")[1]);
    form_data.append('remove_avatar_value', remove_avatar_value);
    form_data.append('file', file_data);
    form_data.append('profileType', profileType);
    $.ajax({
        type: "post",
        url: "/update-profile-data",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: form_data,
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                $('#phone_number_append, #location_append, #user_name_append, #last_name_append').empty();
                $('#phone_number_append').append(response.data.user.phone_no);
                $('#location_append').append(response.data.user.address);
                $('#user_name_append').append(response.data.user.first_name);
                $('#last_name_append').append(response.data.user.last_name);
                $('#profile_picture_append, #header_profile_picture, #header_picture').css('background-image', 'url(../' + response.data.user.profile_picture  + ')');
                $('#header_image_out').attr("src", response.data.user.profile_picture);
                remove_avatar_value = 0;
                toastr.success(response.message);
            } else if(response.code === 201) {
                let i;
                for (i of response.message) {
                    switch (i) {
                        case 'Minimum 3 Charecters Required':
                            $('#first_name_Error1').html(i);
                            break;
                        case 'First name should contain Only alphabets':
                            $('#first_name_Error1').html(i);
                            break;
                        case 'Last name should contain Only alphabets':
                            $('#last_name_Error1').html(i);
                            break;
                        case 'Phone Number is required':
                            $('#phone_number_Error1').html(i);
                            break;
                        case 'Location name should contain Only alphabets':
                            $('#location_Error1').html(i);
                            break;
                        case 'Location name should contain Minimum 3 Charecters':
                            $('#location_Error1').html(i);
                            break;
                        case 'Company Name is required':
                            $('#company_Error1').html(i);
                            break;
                            case 'Company Name should contain Only alphabets':
                            $('#company_Error1').html(i);
                            break;
                        case 'User Name is required':
                            $('#user_name_Error1').html(i);
                            break;
                        case 'Language is required':
                            $('#language_Error1').html(i);
                            break;
                        case 'Timezone is required':
                            $('#timezone_Error1').html(i);
                            break;
                    }
                }
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error("Not able to load");
        }
    });
}

let deletingAccount = function () {
    $.ajax({
        type: "get",
        url: "/delete-user",
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success(response.message);
                setTimeout(function () {
                    window.location.href = '' + APP_URL + 'logout'
                }, 1000);
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error("Not able to load");
        }
    });
}

let holdingAccount = function () {
    $.ajax({
        type: "get",
        url: "/hold-user",
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success(response.message);
                setTimeout(function () {
                    window.location.href = '' + APP_URL + 'logout'
                }, 1000);
            } else {
                toastr.error(response.message);
            }
        },
        error: function (error) {
            toastr.error("Not able to load");
        }
    });
}

 // Checking UserName is available or not
function usernameUpdate() {
    $('#account_information_save_id').attr("disabled", false);
    $('#user_name_success, #user_name_Error').html("");
    $regex = /^[a-zA-Z0-9-_]{3,32}$/;
    if ($regex.test($('#user_name_id').val())) {
        $.ajax({
            url: API_URL + API_VERSION + '/check-username-availability?username=' + $('#user_name_id').val(),
            type: 'GET',
            processData: false,
            contentType: false,
            success: function (response) {
                if (response.code == 200) {
                    $('#user_name_success').html('✅ Valid username').css('color', 'green');
                    $('#account_information_save_id').attr("disabled", false);
                } else if (response.code == 400) {
                    $('#user_name_Error').html('❌ Already used.').css('color', 'red');
                    $('#account_information_save_id').attr("disabled", true);
                } else {
                    $('#user_name_Error').html(response.error).css('color', 'red');
                    $('#account_information_save_id').attr("disabled", true);
                }
            },
            error: function (error) {
                $('#user_name_Error').html(error).css('color', 'red');
                $('#account_information_save_id').attr("disabled", true);
            }
        });
    } else {
        $('#user_name_Error').html('❌ Invalid Username').css('color', 'red')
        $('#account_information_save_id').attr("disabled", true);
    }
}
