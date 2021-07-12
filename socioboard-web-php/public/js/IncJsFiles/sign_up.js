$(document).ready(function() {

    let validCss = {"color": "#1BC5BD", "margin-top": "0.25rem", "width": "100%" ,"font-size": "0.9rem"};
    let invalidCss = {"color": "#F64E60", "margin-top": "0.25rem", "width": "100%" ,"font-size": "0.9rem"};
    // new passwd
    $("#new_password a").on('click', function(event) {
        event.preventDefault();
        if($('#new_password input').attr("type") == "text"){
            $('#new_password input').attr('type', 'password');
            $('#new_password i').addClass( "fa-eye-slash" );
            $('#new_password i').removeClass( "fa-eye" );
        }else if($('#new_password input').attr("type") == "password"){
            $('#new_password input').attr('type', 'text');
            $('#new_password i').removeClass( "fa-eye-slash" );
            $('#new_password i').addClass( "fa-eye" );
        }
    });
    // confirm new passwd
    $("#confirm_password a").on('click', function(event) {
        event.preventDefault();
        if($('#confirm_password input').attr("type") == "text"){
            $('#confirm_password input').attr('type', 'password');
            $('#confirm_password i').addClass( "fa-eye-slash" );
            $('#confirm_password i').removeClass( "fa-eye" );
        }else if($('#confirm_password input').attr("type") == "password"){
            $('#confirm_password input').attr('type', 'text');
            $('#confirm_password i').removeClass( "fa-eye-slash" );
            $('#confirm_password i').addClass( "fa-eye" );
        }
    });

    let apiUrl = $('meta[name="api-url"]').attr("content");
    $(document).on('submit', '#sign_up_form', function (e) {
        e.preventDefault();
        let form = document.getElementById('sign_up_form');
        let formData = new FormData(form);
        $.ajax({
            url: "/register",
            data: formData,
            type: 'POST',
            processData: false,
            contentType: false,
            success: function (response) {
                show_resat(response);
                if (response['code'] === 200) {
                    document.getElementById("sign_up_form").reset();
                    toastr.success(response.message, "Registered Successfully!");
                    setTimeout(function () {
                        window.location = '/';
                    }, 1000);
                } else {
                    toastr.error(`${response['error']}`);
                }
            },
            error: function (error) {
                show_resat(error);
                if (error.status === 422) {
                    let errors = $.parseJSON(error.responseText);
                    $.each(errors, function (key, value) {
                        $('#response').addClass("alert alert-danger");
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                $("#" + key + 'Error').html(`${value}`).css(invalidCss);
                                toastr.error(`${value}`);
                            });
                        }
                    });
                    toastr.error(error.message, "Registration failed!!");
                }
                else{
                    toastr.error(error.message, "Registration failed!!");
                }
            }
        })
    });
    $(document).on('click', '#Sb_login_signup_cancel', function (e) {
        $('#firstNameError').remove();
        $('#lastNameError').remove();
        $('#userNameError').remove();
        $('#emailError').remove();
        $('#passwordError').remove();
        $('#passwordConfirmationError').remove();
        $('#agreeError').remove();
    });

    $(document).on('keyup','#email', function () {

        let $regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if ($regex.test($(this).val())) {
            $.ajax({
                url: apiUrl + '/check-email-availability?email=' + $(this).val(),
                type: 'GET',
                success: function (response) {
                    if (response['code'] === 200) {
                        $('#emailError').html('<div>Success! You have done it.</div>').css(validCss);
                    }
                    if (response['code'] === 400) {
                        $('#emailError').html('❌ Already used (or) Not valid.').css(invalidCss);
                    }
                },
                error: function (error) {
                    $('#emailError').html(error).css('color', 'red');
                }
            });

        } else {
            $('#emailError').html('❌ Invalid Email format').css(invalidCss);
        }
    });
    //checking First name is valid or not
    $(document).on('keyup','#firstName', function () {
        let $regex = /^[a-zA-Z]*$/;
        if ($regex.test($(this).val()) && $(this).val().length >= 3) {
            $('#firstNameError').html('✅ Valid first Name').css(validCss);
        } else {
            $('#firstNameError').html('❌ Invalid first Name(first name should not contain numeric and spaces,should contain min 3 characters)').css(invalidCss)
        }
    });

    //Checking last name valid or not
    $(document).on('keyup','#lastName',function () {
        let $regex = /^[a-zA-Z]*$/;
        if ($regex.test($(this).val()) && $(this).val().length >= 3) {
            $('#lastNameError').html('✅ Valid').css(validCss)
        } else {
            $('#lastNameError').html('❌ Invalid (last name should not contain numeric and spaces,should contain min 3 characters)').css(invalidCss)
        }
    });

    //Checking UserName is available or not
    $(document).on('keyup', '#userName',function () {
        let $regex = /^[a-zA-Z0-9-_]{3,32}$/;
        if ($regex.test($(this).val())) {
            $.ajax({
                url: apiUrl + '/check-username-availability?username=' + $(this).val(),
                type: 'GET',
                processData: false,
                contentType: false,
                success: function (response) {
                    if (response['code'] === 200) {
                        $('#userNameError').html('<div>Success! You\'ve done it.</div>').css(validCss);
                    }
                    if (response['code'] === 400) {
                        $('#userNameError').html('<div>Invalid Username(Should contain minimum 3 charecters)</div>').css(invalidCss);
                    }
                },
                error: function (error) {
                    $('#userNameError').html(error).css(invalidCss);
                }
            });
        } else {
            $('#userNameError').html('<div>Invalid Username(Should contain minimum 3 charecters)</div>').css(invalidCss)
        }
    });

    //Checking Password is available or not
    $(document).on('keyup', '#password',function () {
        let $regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-/])[A-Za-z\d@$!%*?&-/]{8,}$/;
        if ($regex.test($(this).val())) {
            $('#passwordError').html('<div>Success! You\'ve done it.</div>').css(validCss);
        } else {
            $('#passwordError').html('<div>Shucks, check the formatting of that and try again.[ minimum 8 charecters, 1 upper case, 1 lower case, 1 special charecter, 1 numeric ]</div>').css(invalidCss);
        }
    });

    //Checking Confirmation Password is available or not
    $(document).on('keyup','#passwordConfirmation', function () {
        if ($(this).val() === $('#password').val() && $(this).val().length !== 0) {
            $('#passwordConfirmationError').html('✅ Matching').css(validCss);
        } else {
            $('#passwordConfirmationError').html('❌ Not Matching(Confirm Password Should match Password)').css(invalidCss);
        }
    });
    // $(document).on('change','#agree', function (){
    //     if ($(this).is(':checked')){
    //         $('#agreeError').html('👌 Valid Agree').css('color', 'green');
    //     } else{
    //         $('#agreeError').html('❌ The agree field is required.').css('color', 'red');
    //     }
    // });

    function show_resat(data){
        if (data['firstName'] === undefined) document.getElementById('firstNameError').innerHTML = '';
        if (data['lastName'] === undefined) document.getElementById('lastNameError').innerHTML = '';
        if (data['userName'] === undefined) document.getElementById('userNameError').innerHTML = '';
        if (data['email'] === undefined) document.getElementById('emailError').innerHTML = '';
        if (data['password'] === undefined) document.getElementById('passwordError').innerHTML = '';
        if (data['passwordConfirmation'] === undefined) document.getElementById('passwordConfirmationError').innerHTML = '';
    }
});


