function imageIdForDelete(id,size) {
    $("#imageId").val(id)
    $("#imageSize").val(size)
}

function imageId(id) {
    $("#imageId").val(id)
}

function imageInfo(env, url, title, rating, createdDate, type, size) {
    $('#imageDiv').empty().append('<img src="' + env + url + '" alt="image" class="img-fluid">');
    $('#title_id').empty().append(title);
    $('#model_header').empty().append('<h5 class="modal-title" id="imageGalleryInfoLabel">' + title + '</h5>' +
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
        '                        <i aria-hidden="true" class="ki ki-close"></i>\n' +
        '                    </button>');
    $('#size_id').empty().append(Number(size)/(1024*1024) + ' MB');
    var gmtDateTime = moment.utc(createdDate, "YYYY-MM-DD h:mm:ss")
    var local = gmtDateTime.local().format('YYYY-MMM-DD h:mm:ss A');
    $('#create_date').empty().append(local);
    $('#type').empty().append(type);
    $('#ratng').empty().append('<i class="fas fa-star">' + rating + '</i></b></span>');

}

function clearDataBeforeUpload() {
    $('.dropify-clear').click();
    $('#image_name_error1, #image_name_error2').html("");
}

function updateRating(rating, accountId) {
    $.ajax({
        type: "put",
        url: '/imagelibary/rate-image',
        data: {accountId, rating},
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            if (response.code === 200) {
                toastr.success('Rating successfully updated', "", {
                    timeOut: 1000,
                    fadeOut: 1000,
                    onHidden: function () {
                        window.location.reload();
                    }
                });
            } else if (response.code === 400) {
                toastr.error(response.message, {
                    timeOut: 1000,
                    fadeOut: 1000,
                });
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}

$(document).on('click', '#search_button', function (e) {
    let  idvalue =  $("#type_of_view").find(".active").attr('id')
    document.getElementById("vieww").value = idvalue;
    $('#search_button').empty().append('<i class="fa fa-spinner fa-spin"></i>Searching');
})

$(document).on('click', '#search_buttonss', function (e) {
    let  idvalue =  $("#type_of_views").find(".active").attr('id')
    document.getElementById("vieww").value = idvalue;
    $('#search_buttonss').empty().append('<i class="fa fa-spinner fa-spin"></i>Searching');
})

let pageId = 2;
let IS_LAST = false;

function getScrollXY() {
    let scrOfX = 0, scrOfY = 0;
    if (typeof (window.pageYOffset) == 'number') {
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [scrOfX, scrOfY];
}

function getDocHeight() {
    let D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}


// Add Global variable for last load restrictions
document.addEventListener("scroll", function (event) {
    if (IS_LAST == false) {
        if (matchBottomScroll(getDocHeight(), Math.ceil(getScrollXY()[1] + window.innerHeight), 4)) getImages(pageId);
    }
});

let matchBottomScroll = (documentSize, scrollSize, frequency = 5) => {
    return Math.abs(documentSize - scrollSize) <= frequency ? true : false
}

function deleteImage() {
    let mediaId = $("#imageId").val();
    let size = Number($("#imageSize").val());
    // let size = Number($("#Images" + mediaId).attr("data-value"));
    let isForceDelete = 1;
    $.ajax({
        url: "/imagelibary/delete-image",
        type: 'delete',
        data: {mediaId, isForceDelete},
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        success: function (response) {
            if (response.code === 200) {
                $("#usedSize").empty();
                USEDSIZE = Number(USEDSIZE - size);
                $("#usedSize").append(sizeConverter(USEDSIZE));
                toastr.success(response.message);
                $("#Image" + mediaId).remove();
                $("#Images" + mediaId).remove();
                window.location.reload();
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            // toastr.error("Not able to load");
        }
    })

}

function imageUpload(privacy) {
    let file_data = $('#file-upload').prop('files')[0];
    let form_data = new FormData();
    form_data.append('title', $("#image_name").val());
    form_data.append('file', file_data);
    form_data.append('privacy', privacy);
    $.ajax({
        url: "/imagelibary/upload-image",
        type: 'post',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: form_data,
        enctype: 'multipart/form-data',
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            if (response.code === 200) {
                $("#privateImagesError1, #privateImagesError2").html("");
                let append = "";
                $(".modal-backdrop").remove();
                $('#uploadImageModal').hide().removeClass("hide");
                $("#image_name").val("");
                $("#file-upload").val("");
                response.data.map(function (image) {
                    $("#usedSize").empty();
                    USEDSIZE = Number(USEDSIZE + image.media_size);
                    $("#usedSize").append(sizeConverter(USEDSIZE));
                });
                toastr.success("successfully uploaded", "", {
                    timeOut: 2000,
                    fadeOut: 2000,
                    onHidden: function () {
                        window.location.reload();
                    }
                });
            } else if (response.code === 201) {
                // $('#uploadImageModal').modal('show');
                let i;
                for (i of response.msg) {
                    switch (i) {
                        case 'File name is Required':
                            $('#image_name_error1, #image_name_error2').html(i);
                            break;
                        case 'The file must be a file of type: jpeg, jpg, png.':
                            toastr.error(i);
                            break;
                    }
                }
            } else if (response.code === 202) {
                toastr.error(response.msg);
            } else if(response.code === 400 && response.error === "Data too long for column 'title' at row 1"){
                toastr.error('Title is too long');
            } else {
                $('#uploadImageModal').modal('hide');
                toastr.error(response.message);
            }
        },
        error: function () {
            // toastr.error("Not able to load");
        }
    })
}

function sizeConverter(size) {
    let totalSize = 0;
    totalSize = Number(size / (1024 * 1024)).toFixed(2) + "/" + (Number(TOTALSIZE / (1024 * 1024))).toFixed(2) + "MB";
    return totalSize;
}

function getImages(pageID) {
    $('#loader_id').show();
    loadingFunction("Loading...", 1);
    let urls;
    if (IMAGE_TYPE === Number(0)) urls = "/imagelibary/public-images";
    else if (IMAGE_TYPE === Number(1)) urls = "/imagelibary/private-images";
    else if (IMAGE_TYPE === Number(3)) urls = "/imagelibary/gallery-images";
    pageId++;
    $.ajax({
        type: "post",
        url: urls,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {pageID},
        success: function (response) {
            let append = '';
            let x = '';
            if (response.code === 200) {
                $('#loader_id, #loader_text_id').hide();
                if (response.data.data.length > 0) {
                    for (x of response.data.data) {
                        if ((IMAGE_TYPE === Number(0)) || (IMAGE_TYPE === Number(1))) {
                            append += '<div class="card" id="Image' + x.id + '" data-value="' + x.media_size + '">' +
                                ' <img src=" ' + API_URL + x.media_url + '" class="card-img-top" alt="...">' +
                                ' <div class="card-body">' +
                                ' <div class="d-flex justify-content-center">' +
                                ' <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" ' +
                                ' onclick="oneClickImage(\'' + x.media_url + '\')" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5">' +
                                ' <i class="far fa-hand-point-up fa-fw"></i> 1 click</a>' +
                                ' <a href="javascript:;" data-toggle="modal" data-target="#deleteImageModal" onclick="imageIdForDelete(\'' + x.id + '\',\'' + x.media_size + '\')"' +
                                ' class="btn btn-hover-text-danger btn-hover-icon-danger rounded font-weight-bolder"><i class="far fa-trash-alt fa-fw"></i> Delete</a>' +
                                ' </div></div></div>';
                        } else if (IMAGE_TYPE === Number(3)) {
                            append += '<div class="card" id="Image' + x.id + '">' +
                                '<img src=" ' + API_URL + x.media_url + '" class="card-img-top" alt="...">' +
                                ' <div class="card-body">' +
                                ' <div class="d-flex justify-content-center">' +
                                ' <a href="javascript:;" data-toggle="modal" data-target="#resocioModal" ' +
                                ' onclick="oneClickImage(\'' + x.media_url + '\')" class="btn btn-hover-text-success btn-hover-icon-success rounded font-weight-bolder mr-5">' +
                                ' <i class="far fa-hand-point-up fa-fw"></i> 1 click</a>' +
                                ' </div></div></div>';
                        }
                    }
                    $('#privateImages').append(append);

                } else {
                    $('#loader_id').hide();
                    IS_LAST = true;
                    loadingFunction("", 2);
                }
            } else {
                $('#loader_id').hide();
                loadingFunction(response.message, 2);
            }
        },
        error: function () {
            // toastr.error("Not able to load");
        }
    })
}

function loadingFunction(text, val) {
    let loader_text = '';
    let loader = '';
    if (val === 1) {
        loader += '<div class="d-flex justify-content-center">' +
            '<div class="spinner spinner-primary spinner-lg mr-15"></div></div>';
        $('#loader_id').empty().append(loader);
    }
    loader_text += '<div class="d-flex justify-content-center">';
    loader_text += (val === 1) ? '<span>' + text + '</span></div>' : '<span style="color:red">' + text + '</span></div>';
    $('#loader_text_id').empty().append(loader_text);
    $('#loader_text_id').show();
}