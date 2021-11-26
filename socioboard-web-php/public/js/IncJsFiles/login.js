function emailLogin() {
    $('#emailLoginError1').html("");
    $.ajax({
        type: "post",
        url: "/email-login",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            emailID: $('#emailLoginId').val()
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                $('#emailSignInModal').toggle();
                toastr.success(response.message);
                window.location.reload();
            } else if (response.code === 201) {
                $("#emailLoginError1").html(response.message[0]);
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("Not able to load");
        }
    });
}

$(document).on('submit', '#activationForm', function (e) {
    e.preventDefault();
    $('#emailError1').html("");
    $('#activation').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
    let form = document.getElementById('activationForm');
    let formData = new FormData(form);
    $.ajax({
        type: "post",
        url: "/get-activation-link",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: formData,
        processData: false,
        cache: false,
        contentType: false,
        success: function (response) {
            $('#activation').empty().append('Submit');
            if (response.code === 200) {
                $("#emailActivationModalLabel").modal('hide');
                toastr.success(response.message);
            } else if (response.code === 201) {
                $("#emailError1").html(response.message[0]);
                toastr.error(response.message[0]);
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            $('#activation').empty().append('Submit');
            toastr.error("Not able to load");
        }
    });
})

$(document).on('submit', '#forgot_form', function (e) {
    e.preventDefault();
    $('#forgotPasswordEmailError1').html("");
    $('#forgot_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
    let form = document.getElementById('forgot_form');
    let formData = new FormData(form);
    $.ajax({
        type: "post",
        url: "/forgot-password-email",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: formData,
        processData: false,
        cache: false,
        contentType: false,
        success: function (response) {
            $('#forgot_button').empty().append('Submit');
            if (response.code === 200) {
                toastr.success(response.message);
                $('#forgotPasswordEmailId').val("");

            } else if (response.code === 400) {
                toastr.error(response.message ?? "Some Error Occurred In mailing");
            } else {
                toastr.error(response.message ?? "Some Error Occurred In Mailing");
            }
        },
        error: function (error) {
            $('#forgot_button').empty().append('Submit');
            if (error.status === 422) {
                let errors = $.parseJSON(error.responseText);
                $.each(errors, function (key, value) {
                    $('#response').addClass("alert alert-danger");
                    if ($.isPlainObject(value)) {
                        $.each(value, function (key, value) {
                            $("#forgotPasswordEmailError1").html(`${value}`);
                            toastr.error(`${value}`);
                        });
                    }
                });
            }
        },
    });
});

$(document).on('keyup', '#emailId', function () {
    $('#emailError1').remove();
});

$(document).on('keyup', '#emailOrUsername', function () {
    $('#validEmail').remove();
});

$(document).on('keyup', '#password', function () {
    $('#validPassword').remove();
});

$("#new_password a").on('click', function (event) {
    event.preventDefault();
    if ($('#new_password input').attr("type") === "text") {
        $('#new_password input').attr('type', 'password');
        $('#new_password i').addClass("fa-eye-slash");
        $('#new_password i').removeClass("fa-eye");
    } else if ($('#new_password input').attr("type") === "password") {
        $('#new_password input').attr('type', 'text');
        $('#new_password i').removeClass("fa-eye-slash");
        $('#new_password i').addClass("fa-eye");
    }
});

$(document).ready(function () {
    $(document).on('submit', '#login_form', function (e) {
        e.preventDefault();
        $('#login_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Signing In');
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let form = document.getElementById('login_form');
        let formData = new FormData(form);
        formData.append('timezone', timezone);
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: '/login',
            data: formData,
            type: 'POST',
            processData: false,
            cache: false,
            contentType: false,
            success: function (response) {
                $('#login_button').empty().append('Sign In');
                if (response.code === 200) {
                    window.location.href = "/dashboard";
                } else if (response.code === 400) {
                    toastr.error(response.error);
                } else if (response.code === 401) {
                    toastr.error(response.error);
                } else if (response.code === 403) {
                    window.location.href = "/plan-details-view";
                } else if (response.code === 501) {
                    $('#custId').trigger('click');
                } else {
                    toastr.error(response.message, "Sign-In error!");
                }
            },
            error: function (error) {
                $('#login_button').empty().append('Sign In');
                if (error.status === 422) {
                    let errors = $.parseJSON(error.responseText);
                    $.each(errors, function (key, value) {
                        $('#response').addClass("alert alert-danger");
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                $("#forgotPasswordEmailError1").html(`${value}`);
                                toastr.error(`${value}`);
                            });
                            $('#validEmail').html(errors.errors['emailOrUsername']);
                            $('#validPassword').html(errors.errors['password']);
                        }
                    });
                } else {
                    toastr.error("Some error occured.. Please try again later");
                }
            },
        });
    })

    if (window.history && window.history.pushState) {
        window.history.pushState('login', null, './login');
    }
});
