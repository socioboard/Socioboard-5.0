<script type="text/javascript" src="/assets/plugins/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
<script type="text/javascript" src="/assets/js/jquery.cookie.js"></script>
<script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>

<script>
    window.fbAsyncInit = function () {
        FB.init({
            //xfbml: true,
            version: 'v3.1',
            appId: 730896073595509,
            autoLogAppEvents: true,
            //data-show-text: true
        });
    };
</script>

<script>
    function loadPageContent(pageNum) {
        // Ajax loading first content page
        if (pageLoadingProcessing != 1) {
            pageLoadingProcessing = 1;

            $.ajax({
                url: "/view-facebook-feeds/{{$account_id}}/" + pageNum,
            }).done(function (content) {
                //console.log('new page content arrived, size=' + content.length + ' bytes');

                if (content.length > 100) {// not empty result
                    $('.fb_feeds_div').append(content);
                    pageLoadingProcessing = 0;
                    currentPage++;
                    // renew FB objects
                    FB.XFBML.parse();
                    //FB.XFBML.parse(document.getElementById('ddd'));
                    //FB.XFBML.parse(document.getElementsByClassName('fb-post'));
                }
            });
        }
    }
</script>
