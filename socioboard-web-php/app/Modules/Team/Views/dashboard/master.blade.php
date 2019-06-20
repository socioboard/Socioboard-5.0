<!DOCTYPE html>
<html>
@include('Team::dashboard.incHead')
<body>

    <header>
        @include('Team::dashboard.incNav')
    </header>

    <main>
        @yield('facebookFeed')
    </main>

    <!-- post modal -->
    @yield('postModal')

    <!-- JavaScripts -->
    @yield('incJS')
</body>
</html>