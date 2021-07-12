<script>
    
$(document).ready(function () {
    $(document).on('submit', '#create_board', function (e) {
        e.preventDefault();
        let form = document.getElementById('create_board');
        let formData = new FormData(form);
        $.ajax({
            url: '/boards/create-boards',
            data: formData,
            type: 'post',
            processData: false,
            contentType: false,
            success: function (response) {

            },
            error: function (error) {
                if (error.status === 422) {
                    let errors = $.parseJSON(error.responseText);
                    $.each(errors, function (key, value) {
                        $('#response').addClass("alert alert-danger");
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                toastr.error(`${value}`);
                            });
                            $('#validkeywords').html(errors.errors['boardname']);
                            $('#validboardname').html(errors.errors['keywords']);
                        }
                    });
                }
            }
        })
    });
    $("#boards").trigger('click');
})
</script>
