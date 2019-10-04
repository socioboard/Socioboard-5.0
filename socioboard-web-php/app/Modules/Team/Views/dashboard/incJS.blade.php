<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-58515856-3"></script>
<script type="text/javascript" src="/assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="/assets/plugins/popper/umd/popper.min.js"></script>
<script type="text/javascript" src="/assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="/assets/plugins/dropify/dist/js/dropify.min.js"></script>
<script type="text/javascript" src="/assets/plugins/emojionearea/js/emojionearea.min.js"></script>
<script type="text/javascript" src="/assets/plugins/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
<script type="text/javascript" src="/assets/js/jquery.cookie.js"></script>
<script type="text/javascript" src="/assets/js/main.js"></script>

<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "UA-58515856-3");
</script>

<!-- sidebar toggle -->
<script type="text/javascript">
    $(document).ready(function () {
        $("#sidebar").mCustomScrollbar({
            theme: "minimal"
        });

        $("#dismiss, .overlay").on("click", function () {
            $("#sidebar").removeClass("active");
            $(".overlay").removeClass("active");
        });

        $("#sidebarCollapse").on("click", function () {
            $("#sidebar").addClass("active");
            $(".overlay").addClass("active");
            $(".collapse.in").toggleClass("in");
            $("a[aria-expanded=true]").attr("aria-expanded", "false");
        });

        // loading content for the first page

        //loadPageContent(currentPage);
    });
</script>

<script>
    // fb comments div open
    $(".post_cmt_div").css("display", "none");

    $(document).on('click', ".post_cmt_btn", function () {
        var currentDiv = $('#post_cmt_div_' + $(this).data('id'));

        currentDiv.toggle(function () {
            $(".fb_off_option").removeClass('fb_off_option_e');
        });
    });

    // submit the like
    $(document).on('click', '.post_like_btn', function (e) {
        var visitedClassName = 'visited';
        var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/') // /view-facebook-feeds
        var cookieName = 'fb_liked_' + $(this).attr('data-postId');
        var animationParams = {
            opacity: 0.25,
            //left: "+=50",
            //height: "toggle"
        };

        // send only first time
        if (1 != Cookies.get(cookieName)) {
        //if (1==1) {
            // animation
            $(this).animate(animationParams, 1500, function () {
                // styling
                $(this).addClass('visited');
                // Set a cookie
                Cookies.set(cookieName, '1');
                // increment
                $(this).find('span').html(parseInt($(this).find('span').html()) + 1);
            });

            $.ajax({
                method: "POST",
                url: currentDirectory + "/{{$account_id}}/sendLike",
                data: {
                    accountId:{{$account_id}},
                    postId: $(this).attr('data-postId'),
                },
            })
                .done(function (response) {
                    var msg = jQuery.parseJSON(response);
                    modalDialogShow(msg.status, msg.message);
                });
        }
        else {
            console.log('liked yet with cookie ' + cookieName);
        }

    });

    // submit the comment in the text input
    $(document).on('keypress', '.post_cmt_fld', function (e) {

        var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/') // /view-facebook-feeds
        if (e.which == 13) {

            // hide the input
            var postId = $(this).attr('data-postId');
            var currentDiv = $('#post_cmt_div_' + $(this).attr('data-postid'));
            var comment = $(this).val();

            currentDiv.toggle(function () {
                $(".fb_off_option").removeClass('fb_off_option_e');
            });

            $.ajax({
                method: "POST",
                url: currentDirectory+"/{{$account_id}}/sendComment",
                data: {
                    accountId: {{$account_id}},
                    postId: postId,
                    comment: comment,
                }
            })
                .done(function (response) {
                    var msg = jQuery.parseJSON(response);
                    modalDialogShow(msg.status, msg.message);
                });
            // clear the field
            $(this).val('');

        }
    });


    // content for Re-social
    $(document).on('click', '.post_rsc_btn', function () {
        var content = $(this).parent().parent().parent().find('div').first();

        //link
        $('.modal-content button[data-role=send]').data('link', $(this).attr('data-link'));

        // $('#carouselExampleIndicators').html(content);

        $('#socialDoubledContainer').html('<div>' + content.html() + '</div>');
        // $('#socialDoubledContainer').html('Should I return Gallery here?');
    })


    // Click button on modal window
    $(document).on('click', '.modal-content button', function () {
        if ($(this).data('role') == 'send') {
            var modalDialog = $('#postModal');
            var mediaPaths = [];
            var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/') // /view-facebook-feeds


            // array of files
            $("#media-list li").each(function () {
                if (null != $(this).data('media-id')) {
                    mediaPaths.push($(this).data('media-path'));
                }
            });

            $.ajax({
                method: "POST",
               // url: currentDirectory + "/{{$account_id}}/reShare", // /view-facebook-feeds  /view-twitter-feeds
                 url: currentDirectory + "/reShare", // /view-facebook-feeds  /view-twitter-feeds
                data: {
                    accountId: {{$account_id}},
                    teamId: {{Session::get('currentTeam')['team_id']}},
                    link: $(this).data('link'),
                    mediaPaths: mediaPaths,
                    accountIds: getCheckedAccounts(),
                    boardIds: getCheckedBoards(),
                    message: modalDialog.find('div .emojionearea-editor').html(),
                },
                beforeSend: function () {
                    modalDialog.modal('hide');
                }
            })
                .done(function (req) {

                    var msg = jQuery.parseJSON(req);
                    modalDialogShow(msg.status, msg.message);
                });
        }
    })


    // normal post emoji
    $("#normal_post_area").emojioneArea({
        pickerPosition: "right",
        tonesStyle: "bullet"
    });

    // all social list div open
    $(".all_social_div").css({
        display: "none"
    });

    $(document).on('click', '.all_social_btn', function () {
        $('.all_social_div').css({
            'display': 'block'
        });
        $('.all_social_btn').css({
            'display': 'none'
        });
    });


    //    images and videos upload
    $(function () {
        var names = [];
        $("#hint_brand").css("display", "none");
        $("body").on("change", ".picupload", function (event) {
            var getAttr = $(this).attr("click-type");
            var files = event.target.files;


            //var output = document.getElementById("media-list");
            var z = 0;

            if (getAttr === "type1") {
                $("#media-list").html("");
                $("#media-list").html('' +
                    '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>' +
                    '<li class="myupload" data-link="">' +
                    '   <span>' +
                    '       <i class="fa fa-plus" aria-hidden="true"></i>' +
                    '       <input type="file" click-type="type2" id="picupload" class="picupload" multiple>' +
                    '   </span>' +
                    '</li>'
                );
                $("#hint_brand").css("display", "block");
                $("#option_upload").css("display", "none");
            }
            ;


            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var filename = $(this).get(0).files[i].name;
                var picReader = new FileReader();

                names.push(filename);
                picReader.fileName = file.name;

                picReader.addEventListener("load", function (event) {

                    $.ajax({
                        method: "POST",
                        url: "/view-facebook-feeds/{{$account_id}}/postFiles",
                        data: {
                            teamId: {{Session::get('currentTeam')['team_id']}},
                            name: event.target.fileName,
                            content: event.target.result,
                        }
                    })
                        .done(function (req) {
                            var msg = jQuery.parseJSON(req);
                            mediaUploadFinished(msg.localFileId, msg.path);
                        });

                    // interface adding content
                    var div = document.createElement("li");
                    z++;
                    div.innerHTML = addFileContainer(event, file, z);
                    $("#media-list").prepend(div);

                    // upload sterting
                    mediaUploadStarted($("#media-list li:first"), event.target.fileName);
                });

                picReader.readAsDataURL(file);

            } // end for

            // return array of file name
        });

        // removing media object from list
        $("body").on("click", ".remove-pic", function () {
            $(this).closest('li').remove();

            var removeItem = $(this).attr("data-id");
            var yet = names.indexOf(removeItem);
            if (yet != -1) {
                names.splice(yet, 1);
            }
            // return array of file name
        });
        $("#hint_brand").on("hide", function (e) {
            names = [];
            z = 0;
        });
    });
    //    images and videos upload finish



    // Modal dialog - showing the window and filling with content
    function modalDialogShow(status, message) {

        if (status != 'success') {
            status = 'error'
        };

        //if ( (status == 'success') || (status == 'error') )
        {
            var containerStr = '#' + status + 'CommentModal';
            $(containerStr + ' .modal-dialog h2').html(status);
            $(containerStr + ' .modal-dialog h5').html(message);
            $(containerStr).modal('show');
        }
    }

    /* adding class when uploading get started */
    function mediaUploadStarted(target, fileId) {
        target.attr('data-media-id', fileId);
        target.addClass('media-uploading');
    }

    /* removing class when uploading get completed */
    function mediaUploadFinished(fileId, path) {
        $('*[data-media-id="' + fileId + '"]').removeClass('media-uploading'); // remove progressbar
        $('*[data-media-id="' + fileId + '"]').attr('data-media-path', path); // path with file in API
    }

    // trick to save FB widget content
    $(document).on('click', '#postModal button', function () {
        $('#postModal #socialDoubledContainer').html('');
    });

    // returns
    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }


    function addFileContainer(event, file, z) {
        var picFile = event.target;
        var content = '';

        if (file.type.match("image")) {
            content += "<img src='" + picFile.result + "'" + "title='" + picFile.name + "'  />";
        }
        else {
            content += "<video src='" + picFile.result + "'" + "title='" + picFile.name + "' ></video>";
        }

        content += "" +
            "<div id='" + z + "'  class='post-thumb'>" +
            "   <div  class='inner-post-thumb'>" +
            "       <a data-id='" + picFile.fileName + "' href='javascript:void(0);' class='remove-pic'>" +
            "       <i class='fa fa-times' aria-hidden='true'></i>" +
            "       </a>" +
            "   <div>" +
            "</div>";
        return content;
    }

    function getCheckedAccounts() {
        var out = [];
        $('#media-popup-fb-accounts li input:checked').each(function () {
            out.push($(this).data('account-id'));

        });
        return out;
    }


    function getCheckedBoards() {
        var out = [];
        $('#media-popup-fb-accounts li input:checked').each(function () {
            out.push($(this).data('board-id'));
        });

        return out;
    }

    $('#postModal').on('hide.bs.modal show.bs.modal', function () {
        var activeElement = $(document.activeElement).attr('id');

        if (activeElement == 'modalButtonDraft') {
        }
        else {
            // resetting content
            $('#postModal textarea').html('');
            $('#postModal .emojionearea-editor').html('');

            // cleaning
            var lastLi = '<li class="myupload">' + $('#postModal #media-list li.myupload').html() + '</li>';
            $('#postModal ul#media-list').html('');
           // $('#postModal ul#media-list').append(lastLi);  // add [+] to upload files
        }
    })
</script>



<script>
    // add files and upload to server
    function addExternalMediaToList(id, type, src, text) {
        // show file in the list
        $('#media-list').prepend('<li class="media_for_upload" data-media-id="' + id + '"><img src="' + src + '" title="' + text + '" /></li>');

        // add CSS style for uploading process
        mediaUploadStarted($("#media-list li:first"), id);

        // upload sterting
        $.ajax({
            method: "POST",
            url: "/view-facebook-feeds/{{$account_id}}/postFiles",
            data: {
                teamId: {{Session::get('currentTeam')['team_id']}},
                name: id,
                src: src,
                type: type,
                // message: text,
            }
        })
            .done(function (req) {
                var msg = jQuery.parseJSON(req);
                mediaUploadFinished(msg.localFileId, msg.path);
            });

    }
</script>


<div id="container"></div>


