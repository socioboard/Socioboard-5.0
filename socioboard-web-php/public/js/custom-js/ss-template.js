$(document.body).on('click', '#addToCart', function () {
    if (custom_report === '1') {
        $('#addToCart').tooltip('disable');
        if ($(this).children('.addtcartclose').hasClass('ss')) {
            let spanid = $(this).children('.addtcartclose').attr('node-id');
            $('#' + spanid).css("display", "block");
            var nodeId = $(this).children('.addtcartclose').attr('node-id').split('_'),
                id = nodeId[0],
                title = nodeId[1];
            $(this).children('.addtcartclose').parent().remove();
            setTimeout(() => {
                uploadScreenShots(id, title, spanid);
            }, 1500);

        }
    } else {
        toastr.error("Please upgrade your plan first!", "", {
            timeOut: 2000,
            fadeOut: 3000,
            onHidden: function () {
                document.location.href = 'https://appv5.socioboard.com/plan-details-view';
            }
        });
    }

});

function getContentFromDivWithoutLoader(id, spanId) {
    $(`#${spanId}`).remove();
    return document.getElementById(id);
}

/**
 * TODO We have to convert the particular div to screen shot.
 * This function is used for converting the  particular div into the  Screen shots.
 * @param {string} id-id of of particular div .
 * @param {string} title- title of the div.
 * @param {string} spanid of the particular span  div inside div.
 * ! Do not change this function without referring API format of upload Screen shot.
 */
function uploadScreenShots(id, title, spanid) {
    html2canvas(getContentFromDivWithoutLoader(id, spanid), {
        scrollY: -window.scrollY,
        useCORS: true,
    }).then(function (canvas) {
        var image = canvas.toDataURL("image/png", 1);
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: 'post',
            url: '/upload-screenshots',
            data: {
                image, title
            },
            success: function (response) {
                if (response.code === 200) {
                    $.ajax({
                        type: 'get',
                        url: '/get-reports-Images-onload',
                        beforeSend: function () {
                            $('#reportsCount').empty();
                        },
                        success: function (response) {
                            $('#' + spanid).css("display", "none");
                            if (response.code === 200) {
                                let cart_no = response.data.length;
                                setTimeout(() => {
                                    $('#reportsCount').append(cart_no++);
                                }, 100);
                            }
                        }
                    });
                    toastr.success('Successfully added to custom reports');
                } else if (response.code === 400) {
                    toastr.error(response.error);
                } else {
                    toastr.error('Some error occured');
                }
            }
        });
    });
}
