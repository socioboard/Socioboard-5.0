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

$(document).on('keyup','#emailOrUsername', function () {
    $('#validEmail').remove();
});

$(document).on('keyup','#password', function () {
    $('#validPassword').remove();
});

$("#new_password a").on('click', function(event) {
    event.preventDefault();
    if($('#new_password input').attr("type") === "text"){
        $('#new_password input').attr('type', 'password');
        $('#new_password i').addClass( "fa-eye-slash" );
        $('#new_password i').removeClass( "fa-eye" );
    }else if($('#new_password input').attr("type") === "password"){
        $('#new_password input').attr('type', 'text');
        $('#new_password i').removeClass( "fa-eye-slash" );
        $('#new_password i').addClass( "fa-eye" );
    }
});

$(document).ready(function () {
    $(document).on('submit', '#login_form', function (e) {
        e.preventDefault();
        $('#login_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Signing In');
        let form = document.getElementById('login_form');
        let formData = new FormData(form);
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
                console.log('Response:', response);
                $('#login_button').empty().append('Sign In');
                if (response.code === 200) {
                    window.location.href = "/dashboard";
                    } else if (response.code === 400) {
                    toastr.error(response.error);
                }else if (response.code === 401){
                    toastr.error(response.error);
                }else {
                    toastr.error(response.message, "Sign-In error!");
                }
            },
            error: function(error) {
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
                }else{
                    toastr.error("Some error occured.. Please try again later");
                }
            },
        });
    })
});
