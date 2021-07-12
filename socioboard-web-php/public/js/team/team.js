$(document).ready(function () {
    let uploader = document.createElement('input');
    uploader.type = 'file';
    uploader.accept = 'image/*';
    $(document).on('click', '.change-avatar', function () {
        uploader.click();
    });
    uploader.onchange = function () {
        let reader = new FileReader();
        reader.onload = function (evt) {
            $('#Sb_team_pic').css('background-image', 'url(' + evt.target.result + ')');
            file(evt.target.result, 'images', 'create', $('#logoUrl'));
        };
        reader.readAsDataURL(uploader.files[0]);
    };
    $(document).on('click', '.destroy', function () {
        file($(this).find('input').val(), 'images', 'destroy', $('#logoUrl'),$(this).find('input').attr('data-url'))
    });

    function file(response, folder, action, inputFileName,dataUrl = null) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: 'POST',
            url: '/file/' + action,
            data: {response: response, folder: folder,dataUrl:dataUrl},
            success: function (data) {
                if (action === 'create') {
                    $('.change-avatar').removeClass('change-avatar').addClass('destroy').find('i').removeClass('fa-pen').addClass('fa-times');
                }
                if (action === 'destroy') {
                    $('.destroy').removeClass('destroy').addClass('change-avatar').find('i').removeClass('fa-times').addClass('fa-pen');
                }
                inputFileName.val(window.location.hostname + '/public/' + data);
                inputFileName.attr('data-url',data);
                $('#Sb_team_pic').css('background-image', 'url(' + data + ')');
            }
        });
    }

    $(document).off('submit', '#teamCreate').on('submit', '#teamCreate', function (e) {
        e.preventDefault();
        sendTeamAjax(this, $(this).attr('action'));
    });

    $(document).off('click', '#createModal').on('click', '#createModal', function (e) {
        e.preventDefault();
        teamModel('create')
    });

    $(document).off('click', '#inviteModal').on('click', '#inviteModal', function (e) {
        e.preventDefault();
        teamModel('invite')
    });

    function sendTeamAjax(formData, action) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: 'post',
            url: action,
            data: new FormData(formData),
            dataType: 'JSON',
            contentType: false,
            cache: false,
            processData: false,
            success: function (data) {
                if (data.code === 200) {
                    toastr.success("You have successfully created a team", "Success");
                    $('#' + $(formData).attr('id')).closest('.modal').modal('hide');
                } else {
                    toastr.error(`${data.error}`)
                }
            },
            error: function (data) {
                if (data.status === 422) {
                    let errors = $.parseJSON(data.responseText);
                    $.each(errors, function (key, value) {
                        $('#response').addClass("alert alert-danger");
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                toastr.error(`${value}`)
                            });
                        }
                    });
                }
            }
        })
    }
    function teamModel(modal)
    {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: "post",
            url: '/get/team/modal',
            data: {modal: modal},
            success: function (data) {
                $('.modal').remove();
                if(modal === 'create')
                {
                    $('#teamCreateModal').remove();
                }
                if(modal === 'invite')
                {
                    $('#teamInviteModal').remove();
                }
                $('body').append(data.html);
                jQuery.noConflict();
                if(modal === 'create')
                {
                    $('#teamCreateModal').modal("show").on('hide', function() {
                        $('#teamCreateModal').modal('hide')
                    });
                }
                if(modal === 'invite')
                {
                    $('#teamInviteModal').modal("show").on('hide', function() {
                        $('#teamInviteModal').modal('hide')
                    });
                }
            }
        });
    }
});


