<!DOCTYPE html>
<html>
@include('Team::dashboard.incHead')
<body>
<?php
//for socket getting teams id
$data = Session::get('team')['teamSocialAccountDetails'];
foreach($data as $team){
$teamId[] = $team[0]->team_id;
}
$value = json_encode($teamId);

//gettting current team id
$teamId =Session::get('currentTeam')['team_id'];

?>
<input type="hidden" id="userID" value={{session()->get('user')['userDetails']->user_id}} />
<input type="hidden" id="teamSocket" value="{{$value}}" />
<input style="display:none" id="teamId" value="{{$teamId}}">
<input style="display: none" id="planInput" value="{{session()->get('user')['userDetails']->Activations->user_plan}}" >

    <header>
        @include('Team::dashboard.incNav')
    </header>
    <main>
        @yield('feed')
    </main>

    <!-- post modal -->
    @yield('postModal')

    <!-- JavaScripts -->
    @yield('incJS')
<script>

</script>
    @include('User::dashboard.incNotificationJs')
            <!-- Google Analytics -->
    <script>
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
        ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
            'name': 'event'
        });
        ga('event.send', 'pageview');
        ga('event.send', 'event', {
            'eventCategory': eventCategory,
            'eventAction': eventAction,
            'eventLabel': '{{session('user')['userDetails']->email}}'
        });
    </script>
    <script async src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->
</body>
</html>