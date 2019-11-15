@extends('Team::AppInsight.master')

@section('Facebook')
    <div class="container margin-top-60">
        <div class="row margin-top-10">
            <div class="col-md-6">
                <h4>Twitter reports</h4>
            </div>
            <div class="col-md-6">
                <div class="float-right mt-1" id="reportrange">
                    <i class="far fa-calendar-alt fa-fw text-primary"></i>
                    <span></span> <i class="fa fa-caret-down"></i>
                </div>
            </div>
        </div>
        @include("Team::AppInsight.incProfileSelect")
        <input id="accountidFetch" value="{{$profileData->account_id}}" style="display: none;"/>
        <div class="row">
            <!-- facebook profi le-->
            <div class="col-md-4">
                <div class="shadow mb-5 bg-white fb-card rounded">
                    <div class="card-body">
                <span class="card_social_ribbon">
                  <i class="fab fa-twitter"></i>
                </span>
                        <div class="text-center">
                            <img
                                    class="rounded-circle"
                                    src="{{$profileData->profile_pic_url}}"
                                    alt="No profile"
                                    />
                            <h5 class="card-title no-space">{{$profileData->first_name}}</h5>
                            <p class="card-text"> </p>
                        </div>
                        <div class="row text-center mt-1"><div class="col-md-6"> <h5>
                                    {{$profileData->friendship_counts}}
                                </h5></div> <div class="col-md-6">
                                <h5>Friends</h5>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent">
                        {{--Redirect once feeds is done--}}
                        <a href="{{env('APP_URL')}}view-twitter-feeds/{{$profileData->account_id}}" class="btn btn-outline-dark col-md-12 margin-top-10">View Feeds</a>
                    </div>
                </div>
            </div>
            <div class="col-md-8 margin-bottom-50">
                <!-- facebook Reports -->
                <div class="fb_reports_div">
                    <div class="shadow mb-5 bg-white fb-card rounded">
                        <div class="card-body">
                            <h5 class="feeds_title blue lighten-3 white-text mb-0">
                                <i class="fab fa-twitter-square"></i> TWITTER STATS
                            </h5>
                            <small>Stats for your Twitter account in the Socioboard group.</small>
                            <hr/>
                            <p id="accountInactive" style="display: none; color: red"></p>
                            {{--<h5><i class="far fa-flag fa-fw"></i> MY FACEBOOK PAGES</h5>--}}
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="chart" id="fb_pages"></div>
                                </div>
                            </div>
                            {{--<hr />--}}
                            {{--<h5>--}}
                            {{--<i class="far fa-flag fa-fw"></i> IMPRESSIONS BY AGE &--}}
                            {{--GENDER--}}
                            {{--</h5>--}}
                            <div class="row">
                                {{--<div class="col-md-12">--}}
                                {{--<div class="chart" id="fb_impressions_gender"></div>--}}
                                {{--</div>--}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @endsection

    @section('script')
            <!-- facebook pages stats -->
    <script>

        var count =0;
        var fbId = document.getElementById('accountidFetch').value ;
        var firstDate = new Date();
        var chartData = [];
        var filterPeriod = 1;
        var  chart = [];
        getFacebookInsight(fbId,filterPeriod,-1,-1);




        function  getFacebookInsight(accountId, filterPeriod, since, until){
            var nowDate = new Date();
            var Thisdate = nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate();
            $.ajax({
                type: "POST",
                url: "/get-twitter-insight",
                data:{
                    accountId: accountId,
                    filterPeriod: filterPeriod,
                    since: since,
                    until: until
                },
                beforeSend: function(){
                    chartData =[];
                    chart = am4core.create("fb_pages", am4charts.XYChart);
                },
                cache: false,
                success: function(response){

                    // Add data
                    if(response.code == 200){
                        am4core.useTheme(am4themes_animated);
                        // Increase contrast by taking evey second color
                        chart.colors.step = 2;
                        if(response.data.length != 0){
                            $.each(response.data, function(key,value){
                                chartData.push({
                                    date: value.date,
                                    follower:  value.followerCount,
                                    following: value.followingCount,
                                    posts: value.postsCount
                                });
                            });
                        }else{
                            chartData.push({
                                date: Thisdate,
                                follower:  0,
                                following: 0,
                                posts: 0
                            });
                        }

                    }else if(response.code == 400){
                        swal(response.message);
                    }else if(response.code == 400){
                        $('#accountInactive').text(response.message).css('display','block');
                        $('#fb_pages').css('display','none');
                    }else{
                        chartData.push({
                            date: Thisdate,
                            follower:  0,
                            following: 0,
                            posts: 0
                        });
                    }

                    chart.data =  chartData;
                    // Create axes
                    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
                    dateAxis.renderer.minGridDistance = 50;

                    // Create series


                    createAxisAndSeries("follower", "Follower", false, "circle");
                    createAxisAndSeries("following", "Following", true, "triangle");
                    createAxisAndSeries("posts", "Posts", true, "rectangle");

                    chart.legend = new am4charts.Legend();


                    chart.cursor = new am4charts.XYCursor();


                },
                error: function (error) {
                    console.log(error);

                    chartData.push({
                            date: Thisdate,
                            follower:  0,
                            following: 0,
                            posts: 0
                        });


        chart.data =  chartData;

        // Create axes
        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;

        // Create series


        createAxisAndSeries("follower", "Follower", false, "circle");
        createAxisAndSeries("following", "Following", true, "triangle");
        createAxisAndSeries("posts", "Posts", true, "rectangle");

        chart.legend = new am4charts.Legend();


        chart.cursor = new am4charts.XYCursor();
                }
            });
        }

        function createAxisAndSeries(field, name, opposite, bullet) {
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            var series = chart.series.push(new am4charts.LineSeries());

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

//            range.contents.stroke = am4core.color("#396478");
//            range.contents.fill = range.contents.stroke;
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

//            var start = moment().subtract(29, 'days');
            var start = moment();
            var end = moment();

            function cb(start, end) {

                $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
                if(count>0){
                    setTimeout(function(){ $('#reportrange').click()
                        var filterTpe = $($('.ranges>ul').find('.active')).attr('data-range-key');
                        switch(filterTpe){
                            case "Today":
                                filterPeriod=1;
                                break;
                            case "Yesterday":
                                filterPeriod=2;
                                break;
                            case "Last Week":
                                filterPeriod=3;
                                break;
                            case "Last 30 Days":
                                filterPeriod=4;
                                break;
                            case "This Month":
                                filterPeriod=5;
                                break;
                            case "Last Month":
                                filterPeriod=6;
                                break;
                            case "Custom Range":
                                filterPeriod=7;
                                break;
                            default :
                                filterPeriod=1;
                                break;
                        }
                        getFacebookInsight(fbId,filterPeriod,start.format('MMMM D, YYYY'),end.format('MMMM D, YYYY'));
                        $('.daterangepicker').css('display','none');
                    }, 100);

//                    if()

//                    this.find('.ranges li')
//                    getFacebookInsight(fbId,1,-1,-1);

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

    </script>

    <!-- fb_impressions_gender stats -->
    {{--<script>--}}
    {{--// Themes begin--}}
    {{--am4core.useTheme(am4themes_animated);--}}
    {{--// Themes end--}}

    {{--// Create chart instance--}}
    {{--var chart = am4core.create("fb_impressions_gender", am4charts.PieChart);--}}

    {{--// Add and configure Series--}}
    {{--var pieSeries = chart.series.push(new am4charts.PieSeries());--}}
    {{--pieSeries.dataFields.value = "litres";--}}
    {{--pieSeries.dataFields.category = "country";--}}

    {{--// Let's cut a hole in our Pie chart the size of 30% the radius--}}
    {{--chart.innerRadius = am4core.percent(30);--}}

    {{--// Put a thick white border around each Slice--}}
    {{--pieSeries.slices.template.stroke = am4core.color("#fff");--}}
    {{--pieSeries.slices.template.strokeWidth = 2;--}}
    {{--pieSeries.slices.template.strokeOpacity = 1;--}}
    {{--// change the cursor on hover to make it apparent the object can be interacted with--}}
    {{--pieSeries.slices.template.cursorOverStyle = [--}}
    {{--{--}}
    {{--property: "cursor",--}}
    {{--value: "pointer"--}}
    {{--}--}}
    {{--];--}}

    {{--pieSeries.alignLabels = false;--}}
    {{--pieSeries.labels.template.bent = true;--}}
    {{--pieSeries.labels.template.radius = 3;--}}
    {{--pieSeries.labels.template.padding(0, 0, 0, 0);--}}

    {{--pieSeries.ticks.template.disabled = true;--}}

    {{--// Create a base filter effect (as if it's not there) for the hover to return to--}}
    {{--var shadow = pieSeries.slices.template.filters.push(--}}
    {{--new am4core.DropShadowFilter()--}}
    {{--);--}}
    {{--shadow.opacity = 0;--}}

    {{--// Create hover state--}}
    {{--var hoverState = pieSeries.slices.template.states.getKey("hover"); // normally we have to create the hover state, in this case it already exists--}}

    {{--// Slightly shift the shadow and make it more prominent on hover--}}
    {{--var hoverShadow = hoverState.filters.push(new am4core.DropShadowFilter());--}}
    {{--hoverShadow.opacity = 0.7;--}}
    {{--hoverShadow.blur = 5;--}}

    {{--// Add a legend--}}
    {{--chart.legend = new am4charts.Legend();--}}

    {{--chart.data = [--}}
    {{--{--}}
    {{--country: "Male",--}}
    {{--litres: 40--}}
    {{--},--}}
    {{--{--}}
    {{--country: "Female",--}}
    {{--litres: 60--}}
    {{--}--}}
    {{--];--}}
    {{--</script>--}}
@endsection
