<base href="">
<meta charset="utf-8"/>
@yield('title')
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
<meta name="api-url" content="{{ \App\ApiConfig\ApiConfig::get() }}"/>
<meta name="google-site-verification" content="" />
<meta name="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
<meta name="keywords" content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
<meta name="author" content="Socioboard Technologies">
<meta name="designer" content="Chanchal Santra">
<meta name="csrf-token" content="{{ csrf_token() }}"/>
<link href="{{asset('/plugins/custom/intl-tel-input/build/css/intlTelInput.css')}}" rel="stylesheet"
      type="text/css"/>
@include('user::Layouts._common_styles_links')
<script>
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);

        if (currentTheme === 'dark') {
            toggleSwitch.checked = true;
        }
    }
</script>

