<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"
            />
    <title>SocioBoard | Facebook Report</title>
    <meta name="google-site-verification" content="" />
    <meta
            name="description"
            content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it."
            />
    <meta
            name="keywords"
            content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management"
            />
    <meta name="author" content="Socioboard Technologies" />
    <meta name="designer" content="Chanchal Santra" />

    <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="../../assets/imgs/favicon/apple-icon-57x57.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="60x60"
            href="../../assets/imgs/favicon/apple-icon-60x60.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="../../assets/imgs/favicon/apple-icon-72x72.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="76x76"
            href="../../assets/imgs/favicon/apple-icon-76x76.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="../../assets/imgs/favicon/apple-icon-114x114.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="../../assets/imgs/favicon/apple-icon-120x120.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="../../assets/imgs/favicon/apple-icon-144x144.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="../../assets/imgs/favicon/apple-icon-152x152.png"
            />
    <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="../../assets/imgs/favicon/apple-icon-180x180.png"
            />
    <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="../../assets/imgs/favicon/android-icon-192x192.png"
            />
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/imgs/favicon/favicon-32x32.png"/>
    <link rel="icon" type="image/png" sizes="96x96" href="../../assets/imgs/favicon/favicon-96x96.png"/>
    <link rel="icon" type="image/png" sizes="16x16" href="../../assets/imgs/favicon/favicon-16x16.png"/>
    <link rel="manifest" href="../../assets/imgs/favicon/manifest.json" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="../../assets/imgs/favicon/ms-icon-144x144.png"/>
    <meta name="theme-color" content="#ffffff" />
    <meta property="og:site_name" content="socioboard.com" />
    <meta property="og:title" content="Socioboard - Open Source Social Technology Enabler | Find More Customers on Social Media"/>
    <meta property="og:description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it."/>
    <meta property="og:type" content="website" />
    <meta property="og:image" content="http://i.imgur.com/1B8wv5m.png" />
    <meta property="og:url" content="https://www.facebook.com/SocioBoard" />
    <meta itemprop="name" content="Socioboard" />
    <meta itemprop="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it."/>

    <link rel="stylesheet" type="text/css" href="../../assets/plugins/bootstrap/css/bootstrap.min.css"/>
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/fontawesome/css/all.min.css"/>
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/dropify/dist/css/dropify.min.css"/>
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/emojionearea/css/emojionearea.min.css"/>
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/daterangepicker/daterangepicker.css">
    <link rel="stylesheet" type="text/css" href="../../assets/css/style.css" />
    <style type="text/css"></style>
</head>

<body>
<header>
    <!-- Sidebar  -->

    @include('User::dashboard.incSidebar')
    @include('User::dashboard.incNav')
</header>
<main>




    <div class="container margin-top-60">
        @yield('Facebook')
    </div>
</main>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-58515856-3"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "UA-58515856-3");
</script>

<script type="text/javascript" src="../../assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/popper/umd/popper.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/dropify/dist/js/dropify.min.js"></script>

<script type="text/javascript" src="../../assets/plugins/emojionearea/js/emojionearea.min.js"></script>

<script src="../../assets/plugins/amcharts/core.js"></script>
<script src="../../assets/plugins/amcharts/charts.js"></script>
<script src="../../assets/plugins/amcharts/themes/animated.js"></script>
<script type="text/javascript" src="../../assets/plugins/moment.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/daterangepicker/daterangepicker.js"></script>

<script type="text/javascript" src="../../assets/js/main.js"></script>
<script src="../../assets/js/sweetalert.min.js"></script>


<script>
    // fb comments div open
    $(".fb_cmt_div").css({
        display: "none"
    });
    $(".fb_cmt_btn").click(function() {
        $(".fb_cmt_div").toggle();
    });

    // normal post emoji
    $("#normal_post_area").emojioneArea({
        pickerPosition: "right",
        tonesStyle: "bullet"
    });

    // all social list div open
    $(".all_social_div").css({
        display: "none"
    });
    $(".all_social_btn").click(function() {
        $(".all_social_div").css({
            display: "block"
        });
        $(".all_social_btn").css({
            display: "none"
        });
    });


</script>

@yield('script')


</body>
</html>
