let newPasswordSubmit = function () {
    $('#new_password_Error1, #conform_password_Error1').html("");
    $.ajax({
        type: "post",
        url: "/new-password",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            new_password: $('#new_password_Id').val(),
            confirm_password: $('#conform_password_Id').val(),
            email
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success(response.message);
                setTimeout(function () {
                    window.location = '/login';
                }, 1000);
            } else if (response.code === 201) {
                let i;
                for (i of response.message) {
                    switch (i) {
                        case 'password is required':
                            $('#new_password_Error1').html(i);
                            break;
                        case 'Password must consist atleast 1 uppercase, 1 lowercase, 1 special character, 1 numeric value and minimum 8 charecters':
                            $('#new_password_Error1').html(i);
                            break;
                        case 'confirm password is required':
                            $('#conform_password_Error1').html(i);
                            break;
                        case 'password mismatch':
                            $('#conform_password_Error1').html(i);
                            break;
                    }
                }
            } else if (response.code === 500 || response.code === 403) {
                toastr.error(response.message);
            } else {
                toastr.error(response.message);
                // setTimeout(function () {
                //     window.location.href = '' + APP_URL + 'forgot-password'
                // }, 1000);
            }

        },
        error: function (error) {
            toastr.error("Not able to load");
        }
    });
}
