
<!DOCTYPE html>
<html lang="en" >
<!--begin::Head-->
<head>
    <base href="../">
    <meta charset="utf-8"/>
    <title>SocioBoard - Add accounts</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

    <meta name="google-site-verification" content="" />
    <meta name="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
    <meta name="keywords" content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">

    <!--begin::Fonts-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"/>
    <!--end::Fonts-->

    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->


    <!--begin::Global Theme Styles(used by all pages)-->
    <link href="/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/plugins/custom/prismjs/prismjs.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/css/style.css" rel="stylesheet" type="text/css"/>
    <link href="/css/dark.css" rel="stylesheet" type="text/css" id="theme-link"/>
    <!--end::Global Theme Styles-->

    <!--begin::Layout Themes(used by all pages)-->

    <!--end::Layout Themes-->

    <link rel="shortcut icon" href="/media/logos/favicon.ico"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

</head>
<!--end::Head-->

<!--begin::Body-->
<body>

<div class="d-flex justify-content-center mt-5">
    <div class="theme-switch-wrapper mt-3 mr-5 text-center">
        <span class="opacity-50 font-weight-bold font-size-sm text-center d-none d-md-inline mt-4">Switch Theme</span>
        <span class="switch switch-outline switch-icon switch-dark switch-sm text-center">
                    <span><i class="fas fa-sun fa-fw text-warning mt-1"></i></span>
                    <label class="theme-switch" for="checkbox">
                        <input type="checkbox" id="checkbox" name="select" onclick="switchTheme(event)">
                        <span></span>
                    </label>
                    <span><i class="fas fa-moon fa-fw text-primary mt-1"></i></span>
                </span>
    </div>
</div>
<div class="container justify-content-end align-items-center">
    <div class="card invitation-instruction">
        <div class="logo">
            <!--begin::Logo-->
            <a href="index.html" class="mr-2">
                <img alt="SocioBoard" src="/media/logos/sb-icon.svg" class="mt-10">
            </a>
            <!--end::Logo-->
        </div>
        <div class="text-center my-5">
            <h5>Instructions</h5>
        </div>
        <div class="p-10">
            <p>Welcome to Socioboard</p>
            <p>Socioboard takes a step towards enhancing social media based measures for seamles Interaction. we add social accounts to the Respected Account Holder.</p>
            <p>Socioboard request you to authorize and add your account with username started below to our flatform and allow access of account details to the respective User.</p>
            <p>Account username: <b>{{$userName}}</b></p>
            <div class="text-center">
                <button class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 text-center" onclick="location.href='{{$redirectUrl}}';">Add Accounts</button>
            </div>

        </div>

    </div>
</div>





<!--begin::Global Theme Bundle(used by all pages)-->
<script src="/plugins/global/plugins.bundle.js"></script>
<script src="/plugins/custom/prismjs/prismjs.bundle.js"></script>
<script src="/js/main.js"></script>
<script src="/js/custom.js"></script>

<script>
    $(document).ready(function () {
        $('#checkbox').click();
    });
</script>

</body>
<!--end::Body-->
</html>