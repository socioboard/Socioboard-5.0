<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />
    <title>SocioBoard | Team Reports</title>
    <meta name="google-site-verification" content="" />
    <meta name="description"
          content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
    <meta name="keywords"
          content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">

    <link rel="apple-touch-icon" sizes="57x57" href="../../assets/imgs/favicon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="../../assets/imgs/favicon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="../../assets/imgs/favicon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="../../assets/imgs/favicon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="../../assets/imgs/favicon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="../../assets/imgs/favicon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="../../assets/imgs/favicon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="../../assets/imgs/favicon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../../assets/imgs/favicon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../../assets/imgs/favicon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../../assets/imgs/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="../../assets/imgs/favicon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../../assets/imgs/favicon/favicon-16x16.png">
    <link rel="manifest" href="../../assets/imgs/favicon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="../../assets/imgs/favicon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <meta property="og:site_name" content="socioboard.com">
    <meta property="og:title"
          content="Socioboard - Open Source Social Technology Enabler | Find More Customers on Social Media">
    <meta property="og:description"
          content="Be�it�marketing(finding�leads/customers)�on�Social�media,�or�listening�to�customer�complaints,�replying�to�them,�managing�multiple�social�media�accounts�from�one�single�dashboard,�finding�influencers�in�a�particular�category�and�reaching�out�to�them�and�many�more�things,�Socioboard�products�can�do�it.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="http://i.imgur.com/1B8wv5m.png">
    <meta property="og:url" content="https://www.facebook.com/SocioBoard">
    <meta itemprop="name" content="Socioboard" />
    <meta itemprop="description"
          content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />


    <link rel="stylesheet" type="text/css" href="../../assets/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/fontawesome/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/dropify/dist/css/dropify.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/emojionearea/css/emojionearea.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/daterangepicker/daterangepicker.css">
    <!-- Scrollbar Custom CSS -->
    <link rel="stylesheet" href="../../assets/plugins/scrollbar/jquery.mCustomScrollbar.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/css/style.css">
    <style type="text/css">

    </style>

</head>

<body>
<!-- Sidebar  -->


<header>
    @include('User::dashboard.incSidebar')
    @include('User::dashboard.incNav')
</header>
<main>
    <div class="container margin-top-60">
        <div class="row margin-top-10">
            <div class="col-md-6">
                <h4><strong>{{session()->get('currentTeam')['team_name']}}</strong> Team Report</h4>
            </div>
            <div class="col-md-6">
                <div class="float-right mt-1" id="reportrange">
                    <i class="far fa-calendar-alt fa-fw text-primary"></i>
                    <span></span> <i class="fa fa-caret-down"></i>
                </div>
            </div>
            <!-- GROUP STATS -->
            <div class="col-md-3">
                <div class="shadow mb-5 bg-white rounded">
                    <div class="card-body">
                        <div>
                            <h5>No. Of Team Members</h5>
                            <h2 id="team-member-count"></h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="shadow mb-5 bg-white rounded">
                    <div class="card-body">
                        <div>
                            <h5>Invitation Sent</h5>
                            <h2 id="inv-count"></h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="shadow mb-5 bg-white rounded">
                    <div class="card-body">
                        <div>
                            <h5>Social Profiles Added</h5>
                            <h2 id="profile-count"></h2>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="shadow mb-5 bg-white rounded">
                    <div class="card-body">
                        <div>
                            <h5>No. Of Posts published</h5>
                            <h2>0</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <!-- twitter stats -->
            <div class="col-md-6 col-sm-12 mb-5">
                <div class="bg-white twt-card">
                    <div class="card-body">
                        <h5 class="feeds_title blue lighten-3 white-text mb-0">
                            <i class="fab fa-twitter-square fa-fw text-twt"></i>TWITTER STATS
                        </h5>
                        <small>Stats for Twitter accounts in the <strong>{{session()->get('currentTeam')['team_name']}}</strong> group.</small>
                        <hr>

                        <!-- <h5><i class="far fa-flag fa-fw"></i> TWITTER STATS</h5>
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>New followers in this time period</h6>
                            </div>
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>Mentions</h6>
                            </div>
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>Retweets</h6>
                            </div>
                        </div>
                        <hr>
                        <h5><i class="far fa-flag fa-fw"></i> OUTBOUND TWEET CONTENT</h5>
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>Plain Text</h6>
                            </div>
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>Links to Pages</h6>
                            </div>
                            <div class="col-md-4 text-center">
                                <h5><strong class="text-primary">111</strong></h5>
                                <h6>Photo Links</h6>
                            </div>
                        </div> -->
                        <!-- <hr> -->
                        <h5><i class="far fa-flag fa-fw"></i> TWITTER DAILY ENGAGEMENT</h5>
                        <p id="accountInactiveTwitter" style="display: none; color: red"></p>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="chart" id="twt_stats"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- facebook stats -->
            <div class="col-md-6 col-sm-12 mb-5">
                <div class="bg-white fb-card">
                    <div class="card-body">
                        <h5 class="feeds_title blue lighten-3 white-text mb-0">
                            <i class="fab fa-facebook fa-fw text-fb"></i>FACEBOOK STATS
                        </h5>
                        <small>Stats for Facebook accounts in the <strong>{{session()->get('currentTeam')['team_name']}}</strong> group.</small>
                        <hr>
                        <h5><i class="far fa-flag fa-fw"></i> MY FACEBOOK PAGES</h5>
                        <p id="accountInactiveFb" style="display: none; color: red"></p>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="chart" id="fb_stats"></div>
                            </div>
                        </div>
                        <hr>
                        <!-- <h5><i class="far fa-flag fa-fw"></i> IMPRESSIONS BY AGE & GENDER</h5>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="chart" id="fb_impressions_gender"></div>
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>

            <!-- instagram stats -->
            <div class="col-md-6 col-sm-12 mb-5">
                <div class="bg-white inst-card">
                    <div class="card-body">
                        <h5 class="feeds_title blue lighten-3 white-text mb-0">
                            <i class="fab fa-instagram fa-fw text-inst"></i>INSTAGRAM STATS
                        </h5>
                        <small>Stats for Instagram accounts in the <strong>{{session()->get('currentTeam')['team_name']}}</strong> group.</small>
                        <p id="accountInactiveInsta" style="display: none; color: red"></p>
                        <hr>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="chart" id="inst_stats"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- youtube stats -->
            <div class="col-md-6 col-sm-12 mb-5">
                <div class="bg-white yt-card">
                    <div class="card-body">
                        <h5 class="feeds_title blue lighten-3 white-text mb-0">
                            <i class="fab fa-youtube fa-fw text-yt"></i>YOUTUBE STATS
                        </h5>
                        <small>Stats for YouTube accounts in the <strong>{{session()->get('currentTeam')['team_name']}}</strong> group.</small>
                        <p id="accountInactiveYoutube" style="display: none; color: red"></p>
                        <hr>
                        <div class="row">
                            <div class="col-md-12">
                                <div class="chart" id="yt_stats"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-58515856-3"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'UA-58515856-3');
</script>

<script type="text/javascript" src="../../assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/popper/umd/popper.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/dropify/dist/js/dropify.min.js"></script>

<script type="text/javascript" src="../../assets/plugins/emojionearea/js/emojionearea.min.js"></script>
<!-- jQuery Custom Scroller CDN -->
<script src="../../assets/plugins/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>

<script src="../../assets/plugins/amcharts/core.js"></script>
<script src="../../assets/plugins/amcharts/charts.js"></script>
<script src="../../assets/plugins/amcharts/themes/animated.js"></script>

<script type="text/javascript" src="../../assets/plugins/moment.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/daterangepicker/daterangepicker.js"></script>

<script type="text/javascript" src="../../assets/js/main.js"></script>
<script src="//www.amcharts.com/lib/4/core.js"></script>
<script src="//www.amcharts.com/lib/4/charts.js"></script>
<script src="//www.amcharts.com/lib/4/maps.js"></script>
<!-- sidebar toggle -->
<script type="text/javascript">
    var count = 0;
    var teamId = '<?php echo ($teamId) ; ?>';
    var firstdate = new Date();

    var filterPeriod = 1;
    var i = 0;
    getTeamInsights(teamId, filterPeriod, -1, -1);

    function getTeamInsights(team, filter, since, until){

        // chartDataPush
        var chartData = [];
        var instaChartData = [];
        var fbChartData = [];
        var youtubeChartData = [];

        //charts
        var chartTwitter = [];
        var chartInsta = [];
        var chartFb = [];
        var chartYoutube = [];


        $('#accountInactiveTwitter').text(" ").css('display','block');
        // $('#twt_stats').css('display','none');
        $('#accountInactiveInsta').text(" ").css('display','block');
        // $('#int_stats').css('display','none');
        $('#accountInactiveYoutube').text(" ").css('display','block');
        // $('#yt_stats').css('display','none');
        $('#accountInactiveFb').text(" ").css('display','block');
        // $('#fb_stats').css('display','none');

            var stats = [];
            var instaStats = [];
            var fbStats = [];
            var youtubeStats = [];

            var nowDate = new Date();
            var Thisdate = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
            $.ajax({
                type: "POST",
                url: "/get-team-insight",
                data:{
                    teamId: team,
                    filterPeriod: filter,
                    since: since,
                    until: until
                },
                beforeSend: function(){
                    chartData =[];
                    chartTwitter = am4core.create("twt_stats", am4charts.XYChart);
                    chartInsta = am4core.create("inst_stats", am4charts.XYChart);
                    // chartInsta.data = [];
                    chartYoutube = am4core.create("yt_stats", am4charts.XYChart);
                    // chartYoutube.data = [];
                    chartFb = am4core.create("fb_stats", am4charts.XYChart);
                    // chartFb.data = [];
                    // console.log("Chartb-->", chartTwitter);
                },
                cache: false,
                success: function(response){
                     stats = response.twitter;
                     instaStats = response.insta;
                     fbStats = response.facebook;
                     youtubeStats = response.youtube;

                    // Add data
                    if(response.code == 200){

                        //for team member stats
                        document.getElementById("team-member-count").innerHTML = response.teamMemberStats.invitedList;
                        document.getElementById("inv-count").innerHTML = response.teamMemberStats.socialProfilesCount;
                        document.getElementById("profile-count").innerHTML = response.teamMemberStats.teamMembersCount;

                        am4core.useTheme(am4themes_animated);
                        // Increase contrast by taking evey second color
                        chartTwitter.colors.step = chartInsta.colors.step = chartFb.colors.step = chartYoutube.colors.step = 2;

                        //twitter stats
                        if(stats.length != 0){
                            $('#twt_stats').css('display','block');
                            for(i=0; i<stats.length; i++){
                                if(stats[i].twitterInsights !== undefined){
                                    chartData.push({
                                        date: stats[i].twitterInsights.date,
                                        follower: stats[i].twitterInsights.follower_count,
                                        following: stats[i].twitterInsights.following_count,
                                        posts: stats[i].twitterInsights.total_post_count
                                    });
                                }
                            }
                            //chart Data
                            if(chartData != '') chartTwitter.data =  chartData;
                            else{
                                    $('#accountInactiveTwitter').text("No Twitter Stats in this specified time interval....").css('display','block');
                                    $('#twt_stats').css('display','none');
                            }

                            // Create axes
                            var dateAxis = chartTwitter.xAxes.push(new am4charts.DateAxis());
                            dateAxis.renderer.minGridDistance = 50;

                            // Create series
                            createAxisAndSeriesReport("follower", "Follower", false, "circle", chartTwitter.yAxes.push(new am4charts.ValueAxis()), chartTwitter.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("following", "Following", true, "triangle", chartTwitter.yAxes.push(new am4charts.ValueAxis()), chartTwitter.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("posts", "Posts", true, "rectangle", chartTwitter.yAxes.push(new am4charts.ValueAxis()), chartTwitter.series.push(new am4charts.LineSeries()));

                            chartTwitter.legend = new am4charts.Legend();
                            chartTwitter.cursor = new am4charts.XYCursor();
                        }else{
                                $('#accountInactiveTwitter').text("No Twitter Stats in this specified time interval....").css('display','block');
                                // $('#twt_stats').css('display','none');
                        }


                        //insta stats(following_count and friendship_count are same)
                        if(instaStats.length != 0){
                            $('#inst_stats').css('display','block');
                            for(i=0; i<instaStats.length; i++){
                                if(instaStats[i].instagramBusinessInsights !== undefined){
                                    instaChartData.push({
                                        date: instaStats[i].instagramBusinessInsights.date,
                                        follower: instaStats[i].instagramBusinessInsights.follower_count,
                                        following: instaStats[i].instagramBusinessInsights.following_count,
                                        posts: instaStats[i].instagramBusinessInsights.total_post_count
                                    });
                                }
                            }

                            //chart data
                            if(instaChartData != '') chartInsta.data = instaChartData;
                            else{
                                $('#accountInactiveInsta').text("No Instagram Stats in this specified time interval....").css('display','block');
                                // $('#inst_stats').css('display','none');
                            }

                            // Create axes
                            var dateAxis = chartInsta.xAxes.push(new am4charts.DateAxis());
                            dateAxis.renderer.minGridDistance = 50;

                            // Create series
                            createAxisAndSeriesReport("follower", "Follower", false, "circle", chartInsta.yAxes.push(new am4charts.ValueAxis()), chartInsta.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("following", "Following", true, "triangle", chartInsta.yAxes.push(new am4charts.ValueAxis()), chartInsta.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("posts", "Posts", true, "rectangle", chartInsta.yAxes.push(new am4charts.ValueAxis()), chartInsta.series.push(new am4charts.LineSeries()));

                            chartInsta.legend = new am4charts.Legend();
                            chartInsta.cursor = new am4charts.XYCursor();
                        }
                        else{
                            $('#accountInactiveInsta').text("No Instagram Stats in this specified time interval....").css('display','block');
                            // $('#inst_stats').css('display','none');
                        }

                        //youtube stats
                        if(youtubeStats.length != 0){
                            $('#yt_stats').css('display','block');
                            for(i=0; i<youtubeStats.length; i++){
                                if(youtubeStats[i].youtubeInsights !== undefined){
                                    youtubeChartData.push({
                                        date: youtubeStats[i].youtubeInsights.date,
                                        subscription_count: youtubeStats[i].youtubeInsights.subscription_count,
                                        posts: youtubeStats[i].youtubeInsights.total_post_count
                                    });
                                }
                            }

                            //chart data
                            if(youtubeChartData != '') chartYoutube.data = youtubeChartData;
                            else{
                                $('#accountInactiveYoutube').text("No Youtube Stats in this specified time interval....").css('display','block');
                                // $('#yt_stats').css('display','none');
                            }


                            // Create axes
                            var dateAxis = chartYoutube.xAxes.push(new am4charts.DateAxis());
                            dateAxis.renderer.minGridDistance = 50;

                            // Create series
                            createAxisAndSeriesReport("subscription_count", "Subscriptions", false, "triangle", chartYoutube.yAxes.push(new am4charts.ValueAxis()), chartYoutube.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("posts", "Posts", true, "rectangle", chartYoutube.yAxes.push(new am4charts.ValueAxis()), chartYoutube.series.push(new am4charts.LineSeries()));

                            chartYoutube.legend = new am4charts.Legend();
                            chartYoutube.cursor = new am4charts.XYCursor();

                        }else{
                            $('#accountInactiveYoutube').text("No Youtube Stats in this specified time interval....").css('display','block');
                            // $('#yt_stats').css('display','none');
                        }

                        //fb stats
                        if(fbStats.length != 0){
                            $('#fb_stats').css('display','block');
                            for(i=0; i<fbStats.length; i++){
                                if(fbStats[i].facebookInsights !== undefined){
                                    fbChartData.push({
                                        date: fbStats[i].facebookInsights.date,
                                        friendship_count: fbStats[i].facebookInsights.friendship_count,
                                        page_count: fbStats[i].facebookInsights.page_count
                                    });
                                }
                            }

                            //chart data
                            if(fbChartData != '') chartFb.data = fbChartData;
                            else{
                                $('#accountInactiveFb').text("No Facebook Stats in this specified time interval....");
                                // $('#fb_stats').css('display','none');
                            }

                            //Create axes
                            var dateAxis = chartFb.xAxes.push(new am4charts.DateAxis());
                            dateAxis.renderer.minGridDistance = 50;

                            //Create Series
                            createAxisAndSeriesReport("friendship_count", "Friends", false, "triangle", chartFb.yAxes.push(new am4charts.ValueAxis()), chartFb.series.push(new am4charts.LineSeries()));
                            createAxisAndSeriesReport("page_count", "FbPages", true, "rectangle", chartFb.yAxes.push(new am4charts.ValueAxis()), chartFb.series.push(new am4charts.LineSeries()));

                            chartFb.legend = new am4charts.Legend();
                            chartFb.cursor = new am4charts.XYCursor();
                        }
                        else{
                            $('#accountInactiveFb').text("No Facebook Stats in this specified time interval....").css('display','block');
                            // $('#fb_stats').css('display','none');
                        }

                    }
                    else if(response.code == 201){

                            $('#accountInactiveTwitter').text(response.error).css('display','block');
                            $('#twt_stats').css('display','none');


                            $('#accountInactiveInsta').text(response.error).css('display','block');
                            $('#int_stats').css('display','none');


                            $('#accountInactiveYoutube').text(response.error).css('display','block');
                            $('#yt_stats').css('display','none');


                            $('#accountInactiveFb').text(response.error).css('display','block');
                            $('#fb_stats').css('display','none');

                    }else{
                        chartData.push({
                            date: Thisdate,
                            follower:  0,
                            following: 0,
                            posts: 0
                        });
                    }

                },
                error: function (error) {
                    console.log(error);

                    chartData.push({
                            date: Thisdate,
                            follower:  0,
                            following: 0,
                            posts: 0
                        });
                }


            });
    }

    //for twitter, instagram and facebook-pages stats
    function createAxisAndSeriesReport(field, name, opposite, bullet, valueAxis, series) {




            //passed valueAxis and series in respective social stats
            // var valueAxis = chartTwitter.yAxes.push(new am4charts.ValueAxis());
            // var series = chartTwitter.series.push(new am4charts.LineSeries());

            var range = valueAxis.createSeriesRange(series);
            range.value = 0;
            range.endValue = 1100;
            series.dataFields.valueY = field;
            series.dataFields.dateX = "date";
            series.strokeWidth = 2;
            series.yAxis = valueAxis;
            series.name = name;
            series.tooltipText = "{name}: [bold]{valueY}[/]";
            series.tensionX = 0.8;

            // Create value axis range
            //range.contents.stroke = am4core.color("#396478");
            //range.contents.fill = range.contents.stroke;
            var interfaceColors = new am4core.InterfaceColorSet();

            switch(bullet) {
                case "triangle":
                    var bullet = series.bullets.push(new am4charts.Bullet());
                    bullet.width = 12;
                    bullet.height = 12;
                    bullet.horizontalCenter = "middle";
                    bullet.verticalCenter = "middle";

                    var triangle = bullet.createChild(am4core.Triangle);
                    triangle.stroke = interfaceColors.getFor("background");
                    triangle.strokeWidth = 2;
                    triangle.direction = "top";
                    triangle.width = 12;
                    triangle.height = 12;
                    break;
                case "rectangle":
                    var bullet = series.bullets.push(new am4charts.Bullet());
                    bullet.width = 10;
                    bullet.height = 10;
                    bullet.horizontalCenter = "middle";
                    bullet.verticalCenter = "middle";

                    var rectangle = bullet.createChild(am4core.Rectangle);
                    rectangle.stroke = interfaceColors.getFor("background");
                    rectangle.strokeWidth = 2;
                    rectangle.width = 10;
                    rectangle.height = 10;
                    break;
                default:
                    var bullet = series.bullets.push(new am4charts.CircleBullet());
                    bullet.circle.stroke = interfaceColors.getFor("background");
                    bullet.circle.strokeWidth = 2;
                    break;
            }

            valueAxis.renderer.line.strokeOpacity = 1;
            valueAxis.renderer.line.strokeWidth = 2;
            valueAxis.renderer.line.stroke = series.stroke;
            valueAxis.renderer.labels.template.fill = series.stroke;
            valueAxis.renderer.opposite = opposite;
            valueAxis.renderer.grid.template.disabled = true;
        }
    $(function () {

        // var start = moment().subtract(29, 'days');
        var start = moment();
        var end = moment();

        function cb(start, end) {
            $('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
            if(count > 0){
                setTimeout(function(){ $('#reportrange').click()
                    var filterType = $($('.ranges>ul').find('.active')).attr('data-range-key');
                    switch(filterType){
                        case "Today":
                            filterPeriod = 1;
                            break;
                        case "Yesterday":
                            filterPeriod = 2;
                            break;
                        case "Last Week":
                            filterPeriod = 3;
                            break;
                        case "Last 30 Days":
                            filterPeriod = 4;
                            break;
                        case "This Month":
                            filterPeriod = 5;
                            break;
                        case "Last Month":
                            filterPeriod = 6;
                            break;
                        case "Custom Range":
                            filterPeriod = 7;
                            break;
                        default:filterPeriod = 1;
                            break;
                    }
                    getTeamInsights(teamId, filterPeriod, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
                    $('.daterangepicker').css('display','none');
            }, 100);
            }
            count++;
        }

        $('#reportrange').daterangepicker({
            startDate: start,
            endDate: end,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last Week': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, cb);

        cb(start, end);

    });


    $(document).ready(function () {
        $("#sidebar").mCustomScrollbar({
            theme: "minimal"
        });

        $('#dismiss, .overlay').on('click', function () {
            $('#sidebar').removeClass('active');
            $('.overlay').removeClass('active');
        });

        $('#sidebarCollapse').on('click', function () {
            $('#sidebar').addClass('active');
            $('.overlay').addClass('active');
            $('.collapse.in').toggleClass('in');
            $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        });
    });
</script>
@include('User::dashboard.incNotificationJs')

</body>

</html>
