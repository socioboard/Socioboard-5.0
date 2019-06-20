<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<!-- sidebar toggle -->
<script type="text/javascript">
    $(document).ready(function () {
        // comments div open
        $(".post_cmt_div").hide();

/*
        $(document).on("click", ".post_cmt_btn", function () {
            $(".post_cmt_div").toggle();
        });
*/

        // like toogle
        $(document).on("click", ".button-like", function () {
            $(".button-like").toggleClass("liked");
        });
    });
</script>

<div id="container"></div>

<script>
    function loadPageContent(pageNum) {
        // Ajax loading first content page
        if (pageLoadingProcessing != 1) {
            pageLoadingProcessing = 1;
            $.ajax({
                url: "/view-twitter-feeds/{{$account_id}}/" + pageNum,
            }).done(function (content) {
                if (content.length > 100) {// not empty result
                    $('.fb_feeds_div').append(content);
                    pageLoadingProcessing = 0;
                    currentPage++;
                }
            });
        }
    }
</script>
