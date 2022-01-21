let next = false;

$(window).scroll(function () {
    if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
        if (next === true)
            $('#list').after('<p id="loading-more-message" class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading More...</p>');
        getDataNextAjax();
    }
});

function getDataNextAjax(pageId) {
    next = false;
    $('.error-message').html('');
    $('#pageId').val(parseInt($('#pageId').val()) + 1);
    nextUrl === 'news_api' ? nextUrl = 'newsapi' : nextUrl;
    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        type: 'post',
        url: '/discovery/content_studio/' + nextUrl + '/search/next',
        data: $('form#search').serialize(),
        dataType: 'JSON',
        success: function (data) {
            next = true;
            $('body').find('#searchBtn').html('Search');
            $('#loading-more-message').remove();
            let list = $('#list');
            if (!data.error) {
                list.append(data);
            }
        },
        error: function (error) {
            $('body').find('#searchBtn').html('Search');
            $('#loading-more-message').remove();
            if (error.status === 422) {
                let errors = $.parseJSON(error.responseText);
                $.each(errors, function (key, value) {
                    if ($.isPlainObject(value)) {
                        $.each(value, function (key, value) {
                            $("#error-" + key).empty().html(`${value}`);
                            toastr.error(`${value}`);
                        });
                    }
                });
            }
        },
    });
}

$(document).ready(function () {
    if (window.location.href.indexOf('?') > -1) {
        let url = new URL(window.location.href);
        let params = new URLSearchParams(url.search);
        let obj = {};
        for (let [key, value] of params) {
            obj[key] = value
        }
        getDataAjax($('#search')[0], $('#search').attr('action'));
    }


    $('body').off('submit', '#search').on('submit', '#search', function (e) {
        e.preventDefault();
        $(this).find('#searchBtn').html("<i class='fa fa-spinner fa-spin '></i> Processing");
        getDataAjax(this, $(this).attr('action'));
    });

    function getDataAjax(formData, action) {
        $('#list').html('');
        $('.error-message').html('');
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
                if (data.error !== "undefined" && data.error === 'No data available'){
                    toastr.error(data.error);
                }
                $('body').find('#searchBtn').html('Search');
                $('#loading-more-message').remove();
                $('#notification').remove();
                $('#list').append(data);
                next = true;
                window.history.pushState(null, null, addOrUpdateUrlParam(new FormData(formData)));
            },
            error: function (error) {
                $('body').find('#searchBtn').html('Search');
                if (error.status === 422) {
                    let errors = $.parseJSON(error.responseText);
                    $.each(errors, function (key, value) {
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                $("#error-" + key).html(`${value}`);
                                toastr.error(`${value}`);
                            });
                        }
                    });
                }
                console.log('getDataAjax Error', error);
            },
        });
    }
});

let get_url = '';
if (window.location.href.indexOf('?') > -1) {
    get_url = window.location.href.split('?')[0];
} else {
    get_url = window.location.href;
}

function addOrUpdateUrlParam(formdata) {
    let url = '',
        count = true;
    for (let [key, value] of formdata) {
        if (count === true) {
            url += `?${key}=${value}`;
        } else {
            url += `&${key}=${value}`;
        }
        count = false;
    }
    return get_url + url;
}

window.onscroll = function (e) {
// called when the window is scrolled.
    // begin::sticky
    var sticky = new Sticky('.sticky');
// end::sticky

// accounts list div open
    $(".accounts-list-div").css({
        display: "none"
    });
    $(".accounts-list-btn").click(function () {
        $(".accounts-list-div").css({
            display: "block"
        });
    });
}



