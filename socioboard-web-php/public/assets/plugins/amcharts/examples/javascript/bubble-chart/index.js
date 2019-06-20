/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */
am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

var chart = am4core.create("chartdiv", am4charts.XYChart);

var valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
var valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.valueX = "x";
series.dataFields.valueY = "y";
series.dataFields.value = "value";
series.strokeOpacity = 0;
series.sequencedInterpolation = true;
series.tooltip.pointerOrientation = "vertical";

var bullet = series.bullets.push(new am4charts.CircleBullet());
bullet.fill = am4core.color("#ff0000");
bullet.propertyFields.fill = "color";
bullet.strokeOpacity = 0;
bullet.strokeWidth = 2;
bullet.fillOpacity = 0.5;
bullet.stroke = am4core.color("#ffffff");
bullet.hiddenState.properties.opacity = 0;
bullet.circle.tooltipText = "[bold]{title}:[/]\nPopulation: {value.value}\nIncome: {valueX.value}\nLife expectancy:{valueY.value}";

var outline = chart.plotContainer.createChild(am4core.Circle);
outline.fillOpacity = 0;
outline.strokeOpacity = 0.8;
outline.stroke = am4core.color("#ff0000");
outline.strokeWidth = 2;
outline.hide(0);

var blurFilter = new am4core.BlurFilter();
outline.filters.push(blurFilter);

bullet.events.on("over", function(event) {
    var target = event.target;
    chart.cursor.triggerMove({ x: target.pixelX, y: target.pixelY }, "hard");
    chart.cursor.lineX.y = target.pixelY;
    chart.cursor.lineY.x = target.pixelX - chart.plotContainer.pixelWidth;
    valueAxisX.tooltip.disabled = false;
    valueAxisY.tooltip.disabled = false;

    outline.radius = target.circle.pixelRadius + 2;
    outline.x = target.pixelX;
    outline.y = target.pixelY;
    outline.show();
})

bullet.events.on("out", function(event) {
    chart.cursor.triggerMove(event.pointer.point, "none");
    chart.cursor.lineX.y = 0;
    chart.cursor.lineY.x = 0;
    valueAxisX.tooltip.disabled = true;
    valueAxisY.tooltip.disabled = true;
    outline.hide();
})

var hoverState = bullet.states.create("hover");
hoverState.properties.fillOpacity = 1;
hoverState.properties.strokeOpacity = 1;

series.heatRules.push({ target: bullet.circle, min: 2, max: 60, property: "radius" });

bullet.circle.adapter.add("tooltipY", function (tooltipY, target) {
    return -target.radius;
})

chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "zoomXY";

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();

chart.data = [
    {
        "title": "Afghanistan",
        "id": "AF",
        "color": "#eea638",
        "continent": "asia",
        "x": 1349.69694102398,
        "y": 60.524,
        "value": 33397058
    },
    {
        "title": "Albania",
        "id": "AL",
        "color": "#d8854f",
        "continent": "europe",
        "x": 6969.30628256456,
        "y": 77.185,
        "value": 3227373
    },
    {
        "title": "Algeria",
        "id": "DZ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 6419.12782939372,
        "y": 70.874,
        "value": 36485828
    },
    {
        "title": "Angola",
        "id": "AO",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 5838.15537582502,
        "y": 51.498,
        "value": 20162517
    },
    {
        "title": "Argentina",
        "id": "AR",
        "color": "#86a965",
        "continent": "south_america",
        "x": 15714.1031814398,
        "y": 76.128,
        "value": 41118986
    },
    {
        "title": "Armenia",
        "id": "AM",
        "color": "#d8854f",
        "continent": "europe",
        "x": 5059.0879636443,
        "y": 74.469,
        "value": 3108972
    },
    {
        "title": "Australia",
        "id": "AU",
        "color": "#8aabb0",
        "continent": "australia",
        "x": 36064.7372768548,
        "y": 82.364,
        "value": 22918688
    },
    {
        "title": "Austria",
        "id": "AT",
        "color": "#d8854f",
        "continent": "europe",
        "x": 36731.6287741081,
        "y": 80.965,
        "value": 8428915
    },
    {
        "title": "Azerbaijan",
        "id": "AZ",
        "color": "#d8854f",
        "continent": "europe",
        "x": 9291.02626998762,
        "y": 70.686,
        "value": 9421233
    },
    {
        "title": "Bahrain",
        "id": "BH",
        "color": "#eea638",
        "continent": "asia",
        "x": 24472.896235865,
        "y": 76.474,
        "value": 1359485
    },
    {
        "title": "Bangladesh",
        "id": "BD",
        "color": "#eea638",
        "continent": "asia",
        "x": 1792.55023464123,
        "y": 70.258,
        "value": 152408774
    },
    {
        "title": "Belarus",
        "id": "BY",
        "color": "#d8854f",
        "continent": "europe",
        "x": 13515.1610255056,
        "y": 69.829,
        "value": 9527498
    },
    {
        "title": "Belgium",
        "id": "BE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 32585.0119650436,
        "y": 80.373,
        "value": 10787788
    },
    {
        "title": "Benin",
        "id": "BJ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1464.13825459126,
        "y": 59.165,
        "value": 9351838
    },
    {
        "title": "Bhutan",
        "id": "BT",
        "color": "#eea638",
        "continent": "asia",
        "x": 6130.86235464324,
        "y": 67.888,
        "value": 750443
    },
    {
        "title": "Bolivia",
        "id": "BO",
        "color": "#86a965",
        "continent": "south_america",
        "x": 4363.43264453337,
        "y": 66.969,
        "value": 10248042
    },
    {
        "title": "Bosnia and Herzegovina",
        "id": "BA",
        "color": "#d8854f",
        "continent": "europe",
        "x": 7664.15281166303,
        "y": 76.211,
        "value": 3744235
    },
    {
        "title": "Botswana",
        "id": "BW",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 14045.9403255843,
        "y": 47.152,
        "value": 2053237
    },
    {
        "title": "Brazil",
        "id": "BR",
        "color": "#86a965",
        "continent": "south_america",
        "x": 10383.5405937283,
        "y": 73.667,
        "value": 198360943
    },
    {
        "title": "Brunei",
        "id": "BN",
        "color": "#eea638",
        "continent": "asia",
        "x": 45658.2532642054,
        "y": 78.35,
        "value": 412892
    },
    {
        "title": "Bulgaria",
        "id": "BG",
        "color": "#d8854f",
        "continent": "europe",
        "x": 11669.7223127119,
        "y": 73.448,
        "value": 7397873
    },
    {
        "title": "Burkina Faso",
        "id": "BF",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1363.77981282077,
        "y": 55.932,
        "value": 17481984
    },
    {
        "title": "Burundi",
        "id": "BI",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 484.090924612833,
        "y": 53.637,
        "value": 8749387
    },
    {
        "title": "Cambodia",
        "id": "KH",
        "color": "#eea638",
        "continent": "asia",
        "x": 2076.68958647462,
        "y": 71.577,
        "value": 14478320
    },
    {
        "title": "Cameroon",
        "id": "CM",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 2094.09541317011,
        "y": 54.61,
        "value": 20468943
    },
    {
        "title": "Canada",
        "id": "CA",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 35992.8327204722,
        "y": 81.323,
        "value": 34674708
    },
    {
        "title": "Cape Verde",
        "id": "CV",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 3896.04113919638,
        "y": 74.771,
        "value": 505335
    },
    {
        "title": "Central African Rep.",
        "id": "CF",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 718.264633200085,
        "y": 49.517,
        "value": 4575586
    },
    {
        "title": "Chad",
        "id": "TD",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1768.88201756553,
        "y": 50.724,
        "value": 11830573
    },
    {
        "title": "Chile",
        "id": "CL",
        "color": "#86a965",
        "continent": "south_america",
        "x": 15403.7608144625,
        "y": 79.691,
        "value": 17423214
    },
    {
        "title": "China",
        "id": "CN",
        "color": "#eea638",
        "continent": "asia",
        "x": 9501.57424554247,
        "y": 75.178,
        "value": 1353600687
    },
    {
        "title": "Colombia",
        "id": "CO",
        "color": "#86a965",
        "continent": "south_america",
        "x": 8035.65638212719,
        "y": 73.835,
        "value": 47550708
    },
    {
        "title": "Comoros",
        "id": "KM",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1027.40854349726,
        "y": 60.661,
        "value": 773344
    },
    {
        "title": "Congo, Dem. Rep.",
        "id": "CD",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 403.164594003407,
        "y": 49.643,
        "value": 69575394
    },
    {
        "title": "Congo, Rep.",
        "id": "CG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 4106.51173855966,
        "y": 58.32,
        "value": 4233063
    },
    {
        "title": "Costa Rica",
        "id": "CR",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 10827.6787293035,
        "y": 79.712,
        "value": 4793725
    },
    {
        "title": "Cote d'Ivoire",
        "id": "CI",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1491.51631215108,
        "y": 50.367,
        "value": 20594615
    },
    {
        "title": "Croatia",
        "id": "HR",
        "color": "#d8854f",
        "continent": "europe",
        "x": 13388.9902780816,
        "y": 76.881,
        "value": 4387376
    },
    {
        "title": "Cuba",
        "id": "CU",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 10197.4191892126,
        "y": 79.088,
        "value": 11249266
    },
    {
        "title": "Cyprus",
        "id": "CY",
        "color": "#d8854f",
        "continent": "europe",
        "x": 23092.089792339,
        "y": 79.674,
        "value": 1129166
    },
    {
        "title": "Czech Rep.",
        "id": "CZ",
        "color": "#d8854f",
        "continent": "europe",
        "x": 22565.2975367042,
        "y": 77.552,
        "value": 10565678
    },
    {
        "title": "Denmark",
        "id": "DK",
        "color": "#d8854f",
        "continent": "europe",
        "x": 32731.2903910132,
        "y": 79.251,
        "value": 5592738
    },
    {
        "title": "Djibouti",
        "id": "DJ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 2244.60241376688,
        "y": 61.319,
        "value": 922708
    },
    {
        "title": "Dominican Rep.",
        "id": "DO",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 6978.89657264408,
        "y": 73.181,
        "value": 10183339
    },
    {
        "title": "Ecuador",
        "id": "EC",
        "color": "#86a965",
        "continent": "south_america",
        "x": 7903.09487034651,
        "y": 76.195,
        "value": 14864987
    },
    {
        "title": "Egypt",
        "id": "EG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 6013.821462967,
        "y": 70.933,
        "value": 83958369
    },
    {
        "title": "El Salvador",
        "id": "SV",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 5833.63022804714,
        "y": 72.361,
        "value": 6264129
    },
    {
        "title": "Equatorial Guinea",
        "id": "GQ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 13499.2115504397,
        "y": 52.562,
        "value": 740471
    },
    {
        "title": "Eritrea",
        "id": "ER",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 613.716963797415,
        "y": 62.329,
        "value": 5580862
    },
    {
        "title": "Estonia",
        "id": "EE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 18858.0538247661,
        "y": 74.335,
        "value": 1339762
    },
    {
        "title": "Ethiopia",
        "id": "ET",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 958.694705985043,
        "y": 62.983,
        "value": 86538534
    },
    {
        "title": "Fiji",
        "id": "FJ",
        "color": "#8aabb0",
        "continent": "australia",
        "x": 4195.03497178682,
        "y": 69.626,
        "value": 875822
    },
    {
        "title": "Finland",
        "id": "FI",
        "color": "#d8854f",
        "continent": "europe",
        "x": 31551.9534459533,
        "y": 80.362,
        "value": 5402627
    },
    {
        "title": "France",
        "id": "FR",
        "color": "#d8854f",
        "continent": "europe",
        "x": 29896.4182238854,
        "y": 81.663,
        "value": 63457777
    },
    {
        "title": "Gabon",
        "id": "GA",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 13853.4616556007,
        "y": 63.115,
        "value": 1563873
    },
    {
        "title": "Gambia",
        "id": "GM",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 747.68096900917,
        "y": 58.59,
        "value": 1824777
    },
    {
        "title": "Georgia",
        "id": "GE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 4943.23814339098,
        "y": 74.162,
        "value": 4304363
    },
    {
        "title": "Germany",
        "id": "DE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 34131.8745974324,
        "y": 80.578,
        "value": 81990837
    },
    {
        "title": "Ghana",
        "id": "GH",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1728.47847396661,
        "y": 60.979,
        "value": 25545939
    },
    {
        "title": "Greece",
        "id": "GR",
        "color": "#d8854f",
        "continent": "europe",
        "x": 21811.3302462212,
        "y": 80.593,
        "value": 11418878
    },
    {
        "title": "Guatemala",
        "id": "GT",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 5290.75202738533,
        "y": 71.77,
        "value": 15137569
    },
    {
        "title": "Guinea",
        "id": "GN",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 965.699260160386,
        "y": 55.865,
        "value": 10480710
    },
    {
        "title": "Guinea-Bissau",
        "id": "GW",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 593.074251034428,
        "y": 54.054,
        "value": 1579632
    },
    {
        "title": "Guyana",
        "id": "GY",
        "color": "#86a965",
        "continent": "south_america",
        "x": 4265.10644905906,
        "y": 66.134,
        "value": 757623
    },
    {
        "title": "Haiti",
        "id": "HT",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 1180.36719611488,
        "y": 62.746,
        "value": 10255644
    },
    {
        "title": "Honduras",
        "id": "HN",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 3615.1565803195,
        "y": 73.503,
        "value": 7912032
    },
    {
        "title": "Hong Kong, China",
        "id": "HK",
        "color": "#eea638",
        "continent": "asia",
        "x": 43854.4129062733,
        "y": 83.199,
        "value": 7196450
    },
    {
        "title": "Hungary",
        "id": "HU",
        "color": "#d8854f",
        "continent": "europe",
        "x": 17065.6047342876,
        "y": 74.491,
        "value": 9949589
    },
    {
        "title": "Iceland",
        "id": "IS",
        "color": "#d8854f",
        "continent": "europe",
        "x": 34371.1793657215,
        "y": 81.96,
        "value": 328290
    },
    {
        "title": "India",
        "id": "IN",
        "color": "#eea638",
        "continent": "asia",
        "x": 3229.14788745778,
        "y": 66.168,
        "value": 1258350971
    },
    {
        "title": "Indonesia",
        "id": "ID",
        "color": "#eea638",
        "continent": "asia",
        "x": 4379.69981934714,
        "y": 70.624,
        "value": 244769110
    },
    {
        "title": "Iran",
        "id": "IR",
        "color": "#eea638",
        "continent": "asia",
        "x": 12325.1280322371,
        "y": 73.736,
        "value": 75611798
    },
    {
        "title": "Iraq",
        "id": "IQ",
        "color": "#eea638",
        "continent": "asia",
        "x": 4160.84708826172,
        "y": 69.181,
        "value": 33703068
    },
    {
        "title": "Ireland",
        "id": "IE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 35856.1099094562,
        "y": 80.531,
        "value": 4579498
    },
    {
        "title": "Israel",
        "id": "IL",
        "color": "#eea638",
        "continent": "asia",
        "x": 27321.205182135,
        "y": 81.641,
        "value": 7694670
    },
    {
        "title": "Italy",
        "id": "IT",
        "color": "#d8854f",
        "continent": "europe",
        "x": 25811.7393303661,
        "y": 82.235,
        "value": 60964145
    },
    {
        "title": "Jamaica",
        "id": "JM",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 6945.70274711582,
        "y": 73.338,
        "value": 2761331
    },
    {
        "title": "Japan",
        "id": "JP",
        "color": "#eea638",
        "continent": "asia",
        "x": 31273.9932002261,
        "y": 83.418,
        "value": 126434653
    },
    {
        "title": "Jordan",
        "id": "JO",
        "color": "#eea638",
        "continent": "asia",
        "x": 5242.51826246118,
        "y": 73.7,
        "value": 6457260
    },
    {
        "title": "Kazakhstan",
        "id": "KZ",
        "color": "#eea638",
        "continent": "asia",
        "x": 11982.6526657273,
        "y": 66.394,
        "value": 16381297
    },
    {
        "title": "Kenya",
        "id": "KE",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1517.69754383602,
        "y": 61.115,
        "value": 42749418
    },
    {
        "title": "Korea, Dem. Rep.",
        "id": "KP",
        "color": "#eea638",
        "continent": "asia",
        "x": 1540.44018783769,
        "y": 69.701,
        "value": 24553672
    },
    {
        "title": "Korea, Rep.",
        "id": "KR",
        "color": "#eea638",
        "continent": "asia",
        "x": 26199.4035642374,
        "y": 81.294,
        "value": 48588326
    },
    {
        "title": "Kuwait",
        "id": "KW",
        "color": "#eea638",
        "continent": "asia",
        "x": 42045.05923634,
        "y": 74.186,
        "value": 2891553
    },
    {
        "title": "Kyrgyzstan",
        "id": "KG",
        "color": "#eea638",
        "continent": "asia",
        "x": 2078.20824171434,
        "y": 67.37,
        "value": 5448085
    },
    {
        "title": "Laos",
        "id": "LA",
        "color": "#eea638",
        "continent": "asia",
        "x": 2807.04752629832,
        "y": 67.865,
        "value": 6373934
    },
    {
        "title": "Latvia",
        "id": "LV",
        "color": "#d8854f",
        "continent": "europe",
        "x": 15575.2762808015,
        "y": 72.045,
        "value": 2234572
    },
    {
        "title": "Lebanon",
        "id": "LB",
        "color": "#eea638",
        "continent": "asia",
        "x": 13711.975683994,
        "y": 79.716,
        "value": 4291719
    },
    {
        "title": "Lesotho",
        "id": "LS",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1970.47114938861,
        "y": 48.947,
        "value": 2216850
    },
    {
        "title": "Liberia",
        "id": "LR",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 499.809082037359,
        "y": 60.23,
        "value": 4244684
    },
    {
        "title": "Libya",
        "id": "LY",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 9136.34462458268,
        "y": 75.13,
        "value": 6469497
    },
    {
        "title": "Lithuania",
        "id": "LT",
        "color": "#d8854f",
        "continent": "europe",
        "x": 18469.9748244583,
        "y": 71.942,
        "value": 3292454
    },
    {
        "title": "Macedonia, FYR",
        "id": "MK",
        "color": "#d8854f",
        "continent": "europe",
        "x": 8918.81131421927,
        "y": 75.041,
        "value": 2066785
    },
    {
        "title": "Madagascar",
        "id": "MG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 981.478674981018,
        "y": 64.28,
        "value": 21928518
    },
    {
        "title": "Malawi",
        "id": "MW",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 848.191013907702,
        "y": 54.798,
        "value": 15882815
    },
    {
        "title": "Malaysia",
        "id": "MY",
        "color": "#eea638",
        "continent": "asia",
        "x": 14202.2119391177,
        "y": 74.836,
        "value": 29321798
    },
    {
        "title": "Mali",
        "id": "ML",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1070.55152828447,
        "y": 54.622,
        "value": 16318897
    },
    {
        "title": "Mauritania",
        "id": "MR",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1898.35192059663,
        "y": 61.39,
        "value": 3622961
    },
    {
        "title": "Mauritius",
        "id": "MU",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 13082.7750766535,
        "y": 73.453,
        "value": 1313803
    },
    {
        "title": "Mexico",
        "id": "MX",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 12030.3862129571,
        "y": 77.281,
        "value": 116146768
    },
    {
        "title": "Moldova",
        "id": "MD",
        "color": "#d8854f",
        "continent": "europe",
        "x": 2963.99305976246,
        "y": 68.779,
        "value": 3519266
    },
    {
        "title": "Mongolia",
        "id": "MN",
        "color": "#eea638",
        "continent": "asia",
        "x": 4300.13326887206,
        "y": 67.286,
        "value": 2844081
    },
    {
        "title": "Montenegro",
        "id": "ME",
        "color": "#d8854f",
        "continent": "europe",
        "x": 10064.1609429569,
        "y": 74.715,
        "value": 632796
    },
    {
        "title": "Morocco",
        "id": "MA",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 4514.51993561297,
        "y": 70.714,
        "value": 32598536
    },
    {
        "title": "Mozambique",
        "id": "MZ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1058.44192915498,
        "y": 49.91,
        "value": 24475186
    },
    {
        "title": "Myanmar",
        "id": "MM",
        "color": "#eea638",
        "continent": "asia",
        "x": 1657.04593430092,
        "y": 65.009,
        "value": 48724387
    },
    {
        "title": "Namibia",
        "id": "NA",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 5535.83674233219,
        "y": 64.014,
        "value": 2364433
    },
    {
        "title": "Nepal",
        "id": "NP",
        "color": "#eea638",
        "continent": "asia",
        "x": 1264.49264527071,
        "y": 67.989,
        "value": 31011137
    },
    {
        "title": "Netherlands",
        "id": "NL",
        "color": "#d8854f",
        "continent": "europe",
        "x": 36257.0874018501,
        "y": 80.906,
        "value": 16714228
    },
    {
        "title": "New Zealand",
        "id": "NZ",
        "color": "#8aabb0",
        "continent": "australia",
        "x": 25223.5351395532,
        "y": 80.982,
        "value": 4461257
    },
    {
        "title": "Nicaragua",
        "id": "NI",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 3098.48351674394,
        "y": 74.515,
        "value": 5954898
    },
    {
        "title": "Niger",
        "id": "NE",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 706.79424834157,
        "y": 57.934,
        "value": 16644339
    },
    {
        "title": "Nigeria",
        "id": "NG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 2483.98940927953,
        "y": 52.116,
        "value": 166629383
    },
    {
        "title": "Norway",
        "id": "NO",
        "color": "#d8854f",
        "continent": "europe",
        "x": 47383.6245293861,
        "y": 81.367,
        "value": 4960482
    },
    {
        "title": "Oman",
        "id": "OM",
        "color": "#eea638",
        "continent": "asia",
        "x": 26292.8480723207,
        "y": 76.287,
        "value": 2904037
    },
    {
        "title": "Pakistan",
        "id": "PK",
        "color": "#eea638",
        "continent": "asia",
        "x": 2681.12078190231,
        "y": 66.42,
        "value": 179951140
    },
    {
        "title": "Panama",
        "id": "PA",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 13607.1433621853,
        "y": 77.342,
        "value": 3624991
    },
    {
        "title": "Papua New Guinea",
        "id": "PG",
        "color": "#8aabb0",
        "continent": "australia",
        "x": 2391.5795121997,
        "y": 62.288,
        "value": 7170112
    },
    {
        "title": "Paraguay",
        "id": "PY",
        "color": "#86a965",
        "continent": "south_america",
        "x": 4467.15872465943,
        "y": 72.181,
        "value": 6682943
    },
    {
        "title": "Peru",
        "id": "PE",
        "color": "#86a965",
        "continent": "south_america",
        "x": 9277.57076044381,
        "y": 74.525,
        "value": 29733829
    },
    {
        "title": "Philippines",
        "id": "PH",
        "color": "#eea638",
        "continent": "asia",
        "x": 3677.10197520058,
        "y": 68.538,
        "value": 96471461
    },
    {
        "title": "Poland",
        "id": "PL",
        "color": "#d8854f",
        "continent": "europe",
        "x": 17851.9477668397,
        "y": 76.239,
        "value": 38317090
    },
    {
        "title": "Portugal",
        "id": "PT",
        "color": "#d8854f",
        "continent": "europe",
        "x": 19576.4108427574,
        "y": 79.732,
        "value": 10699333
    },
    {
        "title": "Romania",
        "id": "RO",
        "color": "#d8854f",
        "continent": "europe",
        "x": 11058.1809744544,
        "y": 73.718,
        "value": 21387517
    },
    {
        "title": "Russia",
        "id": "RU",
        "color": "#d8854f",
        "continent": "europe",
        "x": 15427.6167470064,
        "y": 67.874,
        "value": 142703181
    },
    {
        "title": "Rwanda",
        "id": "RW",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1223.52570881561,
        "y": 63.563,
        "value": 11271786
    },
    {
        "title": "Saudi Arabia",
        "id": "SA",
        "color": "#eea638",
        "continent": "asia",
        "x": 26259.6213479005,
        "y": 75.264,
        "value": 28705133
    },
    {
        "title": "Senegal",
        "id": "SN",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1753.48800936096,
        "y": 63.3,
        "value": 13107945
    },
    {
        "title": "Serbia",
        "id": "RS",
        "color": "#d8854f",
        "continent": "europe",
        "x": 9335.95911484282,
        "y": 73.934,
        "value": 9846582
    },
    {
        "title": "Sierra Leone",
        "id": "SL",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1072.95787930719,
        "y": 45.338,
        "value": 6126450
    },
    {
        "title": "Singapore",
        "id": "SG",
        "color": "#eea638",
        "continent": "asia",
        "x": 49381.9560054179,
        "y": 82.155,
        "value": 5256278
    },
    {
        "title": "Slovak Republic",
        "id": "SK",
        "color": "#d8854f",
        "continent": "europe",
        "x": 20780.9857840812,
        "y": 75.272,
        "value": 5480332
    },
    {
        "title": "Slovenia",
        "id": "SI",
        "color": "#d8854f",
        "continent": "europe",
        "x": 23986.8506836646,
        "y": 79.444,
        "value": 2040057
    },
    {
        "title": "Solomon Islands",
        "id": "SB",
        "color": "#8aabb0",
        "continent": "australia",
        "x": 2024.23067334134,
        "y": 67.465,
        "value": 566481
    },
    {
        "title": "Somalia",
        "id": "SO",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 953.275713662563,
        "y": 54,
        "value": 9797445
    },
    {
        "title": "South Africa",
        "id": "ZA",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 9657.25275417241,
        "y": 56.271,
        "value": 50738255
    },
    {
        "title": "South Sudan",
        "id": "SS",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1433.03720057714,
        "y": 54.666,
        "value": 10386101
    },
    {
        "title": "Spain",
        "id": "ES",
        "color": "#d8854f",
        "continent": "europe",
        "x": 26457.7572559653,
        "y": 81.958,
        "value": 46771596
    },
    {
        "title": "Sri Lanka",
        "id": "LK",
        "color": "#eea638",
        "continent": "asia",
        "x": 5182.66658831813,
        "y": 74.116,
        "value": 21223550
    },
    {
        "title": "Sudan",
        "id": "SD",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 2917.61641581811,
        "y": 61.875,
        "value": 35335982
    },
    {
        "title": "Suriname",
        "id": "SR",
        "color": "#86a965",
        "continent": "south_america",
        "x": 8979.80549248675,
        "y": 70.794,
        "value": 534175
    },
    {
        "title": "Swaziland",
        "id": "SZ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 4979.704126513,
        "y": 48.91,
        "value": 1220408
    },
    {
        "title": "Sweden",
        "id": "SE",
        "color": "#d8854f",
        "continent": "europe",
        "x": 34530.2628238397,
        "y": 81.69,
        "value": 9495392
    },
    {
        "title": "Switzerland",
        "id": "CH",
        "color": "#d8854f",
        "continent": "europe",
        "x": 37678.3928108684,
        "y": 82.471,
        "value": 7733709
    },
    {
        "title": "Syria",
        "id": "SY",
        "color": "#eea638",
        "continent": "asia",
        "x": 4432.01553897559,
        "y": 71,
        "value": 21117690
    },
    {
        "title": "Taiwan",
        "id": "TW",
        "color": "#eea638",
        "continent": "asia",
        "x": 32840.8623523232,
        "y": 79.45,
        "value": 23114000
    },
    {
        "title": "Tajikistan",
        "id": "TJ",
        "color": "#eea638",
        "continent": "asia",
        "x": 1952.10042735043,
        "y": 67.118,
        "value": 7078755
    },
    {
        "title": "Tanzania",
        "id": "TZ",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1330.05614548839,
        "y": 60.885,
        "value": 47656367
    },
    {
        "title": "Thailand",
        "id": "TH",
        "color": "#eea638",
        "continent": "asia",
        "x": 8451.15964058768,
        "y": 74.225,
        "value": 69892142
    },
    {
        "title": "Timor-Leste",
        "id": "TL",
        "color": "#eea638",
        "continent": "asia",
        "x": 3466.08281224683,
        "y": 67.033,
        "value": 1187194
    },
    {
        "title": "Togo",
        "id": "TG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 975.396852535221,
        "y": 56.198,
        "value": 6283092
    },
    {
        "title": "Trinidad and Tobago",
        "id": "TT",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 17182.0954558471,
        "y": 69.761,
        "value": 1350999
    },
    {
        "title": "Tunisia",
        "id": "TN",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 7620.47056462131,
        "y": 75.632,
        "value": 10704948
    },
    {
        "title": "Turkey",
        "id": "TR",
        "color": "#d8854f",
        "continent": "europe",
        "x": 9287.29312549815,
        "y": 74.938,
        "value": 74508771
    },
    {
        "title": "Turkmenistan",
        "id": "TM",
        "color": "#eea638",
        "continent": "asia",
        "x": 7921.2740619558,
        "y": 65.299,
        "value": 5169660
    },
    {
        "title": "Uganda",
        "id": "UG",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1251.09807015907,
        "y": 58.668,
        "value": 35620977
    },
    {
        "title": "Ukraine",
        "id": "UA",
        "color": "#d8854f",
        "continent": "europe",
        "x": 6389.58597273257,
        "y": 68.414,
        "value": 44940268
    },
    {
        "title": "United Arab Emirates",
        "id": "AE",
        "color": "#eea638",
        "continent": "asia",
        "x": 31980.24143802,
        "y": 76.671,
        "value": 8105873
    },
    {
        "title": "United Kingdom",
        "id": "GB",
        "color": "#d8854f",
        "continent": "europe",
        "x": 31295.1431522074,
        "y": 80.396,
        "value": 62798099
    },
    {
        "title": "United States",
        "id": "US",
        "color": "#a7a737",
        "continent": "north_america",
        "x": 42296.2316492477,
        "y": 78.797,
        "value": 315791284
    },
    {
        "title": "Uruguay",
        "id": "UY",
        "color": "#86a965",
        "continent": "south_america",
        "x": 13179.2310803465,
        "y": 77.084,
        "value": 3391428
    },
    {
        "title": "Uzbekistan",
        "id": "UZ",
        "color": "#eea638",
        "continent": "asia",
        "x": 3117.27386553102,
        "y": 68.117,
        "value": 28077486
    },
    {
        "title": "Venezuela",
        "id": "VE",
        "color": "#86a965",
        "continent": "south_america",
        "x": 11685.1771941737,
        "y": 74.477,
        "value": 29890694
    },
    {
        "title": "West Bank and Gaza",
        "id": "PS",
        "color": "#eea638",
        "continent": "asia",
        "x": 4328.39115760087,
        "y": 73.018,
        "value": 4270791
    },
    {
        "title": "Vietnam",
        "id": "VN",
        "color": "#eea638",
        "continent": "asia",
        "x": 3073.64961158389,
        "y": 75.793,
        "value": 89730274
    },
    {
        "title": "Yemen, Rep.",
        "id": "YE",
        "color": "#eea638",
        "continent": "asia",
        "x": 2043.7877761328,
        "y": 62.923,
        "value": 25569263
    },
    {
        "title": "Zambia",
        "id": "ZM",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 1550.92385858124,
        "y": 57.037,
        "value": 13883577
    },
    {
        "title": "Zimbabwe",
        "id": "ZW",
        "color": "#de4c4f",
        "continent": "africa",
        "x": 545.344601005788,
        "y": 58.142,
        "value": 13013678
    }
];


