@extends('User::master')

@section('title')
    <title>SocioBoard | 2-steps authentication</title>
@endsection

@section('twoStepAuth')
<section class="container">
    <div class="row justify-content-md-center margin-bottom-50 margin-top-50">
        <div class="col col-md-6">
            <div class="card shadow mb-5">
                <div class="card-body" style="padding: 40px;">
                    <h3 class="text-center" style="color: #282828; font-weight: bold;">2 - Steps Authentication</h3>

                        <div class="form-group">
                            <label for="country_code">Country Code<span class="text-orange-dark"></span></label>
                            <input value="+1" class="form-control" id="country">
                        </div>
                        <div class="form-group">
                            <label for="phone_number">Enter Phone Number<span class="text-orange-dark"></span></label>
                            <input placeholder="Phone number" class="form-control" id="phone" >
                        </div>
                        <div class="row">
                            <div class="col-md-12 col-sm-12">
                                <button type="submit" class="btn bg-orange-dark float-right col-12" onclick="smsLogin();">Login
                                    via SMS</button>
                            </div>
                        </div>

                </div>
            </div>
        </div>

        <form id="login_success" name="login" action="https://localhost.socioboard.com/two-step-authentication" method="POST" style="display: none;">
            <input id="_token" type="hidden" name="csrf" value ="{{ $csrf}}"/>
            <input id="code" type="hidden" name="code" />
            <input type="submit" value="Submit">
        </form>
    </div>
</section>


@endsection
@section('script')
<script src="https://sdk.accountkit.com/en_US/sdk.js"></script>
<script>
    //    alert(document.getElementById('_token').value);

    AccountKit_OnInteractive = function() {
        AccountKit.init({
            appId: "{{env('FB_ID')}}",
            state: document.getElementById('_token').value,
            version: 'v1.0'
        });
    };

    function loginCallback(response) {

        if (response.status === "PARTIALLY_AUTHENTICATED") {
            document.getElementById('code').value = response.code;
            document.getElementById('_token').value = response.state;
            document.getElementById('login_success').submit();
        }

        else if (response.status === "NOT_AUTHENTICATED") {
            // handle authentication failure
            alert('You are not Authenticated');
        }
        else if (response.status === "BAD_PARAMS") {
            // handle bad parameters
            alert('wrong inputs');
        }
    }

    // phone form submission handler
    function smsLogin() {
        var countryCode = document.getElementById('country').value;
        var phoneNumber = document.getElementById('phone').value;
        AccountKit.login(
                'PHONE',
                {countryCode: countryCode, phoneNumber: phoneNumber},
                loginCallback
        );
    }
    // email form submission handler
    function emailLogin() {
        var emailAddress = document.getElementById("email").value;
        AccountKit.login('EMAIL', {emailAddress: emailAddress}, loginCallback);
    }

</script>
<script>

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
        'name': 'twoStep',
        'sessionControl': 'start',
        'alwaysSendReferrer': true
    });
    ga('twoStep.send', 'pageview');
    ga('twoStep.send', 'event', {
        'eventCategory': 'Open',
        'eventAction': 'Two-Step-Authentication'
    });
    ga(function(){

    });


</script>
<!-- End Google Analytics -->
@endsection

