let next = false;
let searshData = false;
$(window).scroll(function () {
    if (Math.ceil($(window).scrollTop()) === Math.ceil(($(document).height() - $(window).height()))) {
        if (next === true && searshData)
            $('#list').after('<p id="loading-more-message" class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading More...</p>');
        getDataNextAjax();
    }
});

$(".nav-link").on("click", function () {
    searshData = false;
})

// drag drop section
let dragAndDrop = function dragAndDrop(e) {

    if(!document.querySelector(".publish_assistant_wrapper")) {
        return false;
    }
// var dragSrcEl;
    let items = document.querySelectorAll('#list .publishContentItem');
    if (!items){
        return false;
    }
    let optionUpload = document.querySelector("#option_upload");
    let hintUpload = document.querySelector("#hint_brand");
    let publishContentForm = document.querySelector('#publishContentForm');
    let inputScheduleUrl = publishContentForm.querySelector("input[name=outgoingUrl]");


    function handleDrop(e) {
        // e.preventDefault();

        // if (document.documentElement.clientWidth > 768)
        //     e.stopPropagation();

        hintUpload.innerHTML = "";
        let randomDataId = (Math.random() + 1).toString(10).substring(10);
        var dataUrlSrc = dragSrcEl.getAttribute('data-media-url');
        // ----------------------------------
        // let itemDataId = e.dataTransfer.getData("id");
        // ----------------------------------
        if (dragSrcEl.querySelector('.info_card_body')) {
            const resultSectionPreviewText = document.querySelector("#facebook_preview_ids .postText")

            let infoText = dragSrcEl.querySelector('.info_card_body').innerHTML;
            let textArea = publishContentForm.querySelector('.emojionearea-editor');
            textArea.innerHTML = infoText;
            resultSectionPreviewText.innerHTML = infoText;
        }

        if (dragSrcEl.getAttribute("data-type") === "image") {
            $("body").find('.imageShow').innerHTML = "";
            let mediaBlock = dragSrcEl.querySelector('img.card-img-top');
            var imgSrc = mediaBlock.getAttribute('src');

            inputScheduleUrl.value = dataUrlSrc;

            let mediaFile =
                `<ul id="media-list" class="clearfix">
                 <li> 
                   <img src="${imgSrc}" >
                  <div class="post-thumb">
                       <div class="inner-post-thumb">
                            <a href="javascript:void(0);"
                               class="remove-pic"
                                data-id="${randomDataId}"
                               >
                                <i class="fa fa-times" aria-hidden="true"></i>
                             </a>
                        </div>
                   </div>
                 </li>
                 <li class="myupload">
                    <span>
                        <i class="fa fa-plus" aria-hidden="true"></i>
                        <input type="file" click-type="img-video-upload" id="picupload"
                            class="picupload"  multiple accept=".jpg, .png, .jpeg" title="Click to Add File" style="width: 100px"/>
                    </span>
                 </li>
                 </ul>`

            optionUpload.style.display = "none";
            hintUpload.style.display = "block";
            hintUpload.innerHTML = mediaFile;
            $("body").find('#draft_Schedule_id .imageShow').html("")
            $("body").find('.imageShow').append(`<img src="${imgSrc}" class='img-fluid image${randomDataId}' style="object-fit:contain;">`);

        }

        if (dragSrcEl.getAttribute("data-type") === "video") {
            inputScheduleUrl.value = dataUrlSrc;
            let mediaBlock = dragSrcEl.querySelector('.embed-responsive iframe');
            var videoSrc = mediaBlock.getAttribute('src');

            let mediaFile =
                `<ul id="media-list" class="clearfix">
                 <li> 
                     <iframe class="embed-responsive-item rounded" src="${videoSrc}" allowfullscreen=""></iframe>
                  <div class="post-thumb">
                       <div class="inner-post-thumb">
                            <a href="javascript:void(0);"
                               class="remove-pic"
                                data-id="${randomDataId}"
                               >
                                <i class="fa fa-times" aria-hidden="true"></i>
                             </a>
                        </div>
                   </div>
                 </li>
                 <li class="myupload">
                    <span>
                        <i class="fa fa-plus" aria-hidden="true"></i>
                        <input type="file" click-type="img-video-upload" id="picupload"
                            class="picupload"  multiple accept=".jpg, .png, .jpeg" title="Click to Add File" style="width: 100px"/>
                    </span>
                 </li>
                 </ul>`

            optionUpload.style.display = "none";
            hintUpload.style.display = "block";
            hintUpload.innerHTML = mediaFile;

            $("body").find('#draft_Schedule_id .imageShow').html("")
            $("body").find('.imageShow').append(` <iframe class="embed-responsive-item rounded image${randomDataId}" src="${videoSrc}" allowfullscreen=""></iframe>`);
        }
        // return false;
    }

    // desktop drag drop
    if (document.documentElement.clientWidth > 768) {
        function handleDragStart(e) {
            this.style.opacity = '0.4';
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragEnd(e) {
            e.preventDefault();
            this.style.opacity = '1';

            items.forEach(function (item) {
                item.classList.remove('over');
            });
        }

        function handleDragOver(e) {
            e.preventDefault();
            if (e.preventDefault) {
                e.preventDefault();
            }

            return false;
        }

        function handleDragEnter(e) {
            e.preventDefault();
            this.classList.add('over');
        }

        function handleDragLeave(e) {
            e.preventDefault();
            this.classList.remove('over');
        }

        items.forEach(function(item) {
            item.addEventListener('dragstart', handleDragStart, false);
            item.addEventListener('dragover', handleDragOver, false);
            item.addEventListener('dragenter', handleDragEnter, false);
            item.addEventListener('dragleave', handleDragLeave, false);
            item.addEventListener('dragend', handleDragEnd, false);
        });

        publishContentForm.addEventListener("dragover", function (event) {
            event.preventDefault();
        });
        publishContentForm.addEventListener("dragleave", function (event) {
            event.preventDefault();
        });
        publishContentForm.addEventListener('drop', function (event) {
            event.preventDefault();
            handleDrop();
        });

    } else {
        // mobile drag drop
        function handlerMobileDrop(e) {
            items.forEach(function(item) {
                item.style.opacity = '1';
            });
            this.style.opacity = '0.4';
            dragSrcEl = this;
            handleDrop();
        }

        items.forEach(function(item) {
            item.addEventListener('click', handlerMobileDrop, false);
        });
    }
};


// end:images and videos drag&dro

function getDataNextAjax(pageId) {
    if (!searshData) return
    next = false;
    $('.error-message').html('');
    $('#pageId').val(parseInt($('#pageId').val()) + 1);
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
            if (data.error) {
                list.append(data.error);
            } else {
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
                            $("#error-" + key).html(`${value}`);
                            toastr.error(`${value}`);
                        });
                    }
                });
            }
            console.log('getDataNextAjax Error', error);
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
        if (!$("#right_sidebar_assistant"))
        getDataAjax($('#search')[0], $('#search').attr('action'));
    }

//    # modalKeyword and default search > discovery > content studio
    $(function (){
        const formSearch = document.querySelector("#search");
        const keywordInput = formSearch.querySelector("#keyword");
        const modalKeyword = formSearch.querySelector("#modalKeyword");
        keywordInput.value = plugSearch
        getDataAjax(formSearch, $("#search").attr('action'));
        keywordInput.value = "";
        modalKeyword.classList.add("modalActive");
        setTimeout( function (){
            modalKeyword.classList.remove("modalActive");
        },5000)
    });

    $('body').off('submit', '#search').on('submit', '#search', function (e) {
        e.preventDefault();
        $(this).find('#searchBtn').html("<i class='fa fa-spinner fa-spin '></i> Processing");
        getDataAjax(this, $(this).attr('action'));
        searshData = true;
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
                $('body').find('#searchBtn').html('Search');
                $('#loading-more-message').remove();
                $('#notification').remove();

                $(".publish_assistant .publish_assistant_card").addClass("result_assistance")
                $('#list').append(data);
                dragAndDrop();
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



