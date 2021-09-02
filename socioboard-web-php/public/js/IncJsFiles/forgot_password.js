let forgotPasswordSubmit = function () {
    $('#forgotPasswordEmailError1').html("");
    $.ajax({
        type: "post",
        url: "/forgot-password-email",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            emailID: $('#forgotPasswordEmailId').val()
        },
        beforeSend: function () {
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success(response.message);
                $('#forgotPasswordEmailId').val("");

            } else if (response.code === 400) {
                $("#forgotPasswordEmailError1").html(response);
                toastr.error(response.error ?? "Some Error Occurred In Mailing");
            } else {
                toastr.error(response.message ?? "Some Error Occurred In Mailing");
            }
        },
        error: function (error) {
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
};