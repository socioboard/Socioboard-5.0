am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.RadarChart);


chart.data = [
    {
        category: "One",
        startDate1: "2018-01-01",
        endDate1: "2018-03-01"
    },
    {
        category: "One",
        startDate1: "2018-04-01",
        endDate1: "2018-08-15"
    },
    {
        category: "Two",
        startDate2: "2018-03-01",
        endDate2: "2018-06-01"
    },
    {
        category: "Two",
        startDate2: "2018-08-01",
        endDate2: "2018-10-01"
    },
    {
        category: "Three",
        startDate3: "2018-02-01",
        endDate3: "2018-07-01"
    },
    {
        category: "Four",
        startDate4: "2018-06-09",
        endDate4: "2018-09-01"
    },
    {
        category: "Four",
        startDate4: "2018-10-01",
        endDate4: "2019-01-01"
    },
    {
        category: "Five",
        startDate5: "2018-02-01",
        endDate5: "2018-04-15"
    },
    {
        category: "Five",
        startDate5: "2018-10-01",
        endDate5: "2018-12-31"
    }
];

chart.padding(20, 20, 20, 20);
chart.colors.step = 2;
chart.dateFormatter.inputDateFormat = "YYYY-MM-dd";
chart.innerRadius = am4core.percent(40);

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.labels.template.location = 0.5;
categoryAxis.renderer.labels.template.horizontalCenter = "right";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.tooltipLocation = 0.5;
categoryAxis.renderer.grid.template.strokeOpacity = 0.07;
categoryAxis.renderer.minGridDistance = 10;
categoryAxis.interactionsEnabled = false;
categoryAxis.tooltip.disabled = true;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.labels.template.horizontalCenter = "left";
dateAxis.strictMinMax = true;
dateAxis.renderer.maxLabelPosition = 0.99;
dateAxis.renderer.grid.template.strokeOpacity = 0.07;
dateAxis.min = new Date(2018, 0, 1, 0, 0, 0).getTime();
dateAxis.max = new Date(2019, 0, 1, 0, 0, 0).getTime();
dateAxis.interactionsEnabled = false;
dateAxis.tooltip.disabled = true;
dateAxis.periodChangeDateFormats.setKey("month", dateAxis.language.translate("_date_month"));
dateAxis.baseInterval = { count: 1, timeUnit: "day" };

var series1 = chart.series.push(new am4charts.RadarColumnSeries());
series1.name = "Series 1";
series1.dataFields.openDateX = "startDate1";
series1.dataFields.dateX = "endDate1";
series1.dataFields.categoryY = "category";
series1.clustered = false;
series1.columns.template.radarColumn.cornerRadius = 30;
series1.columns.template.tooltipText = "{category}: {openDateX} - {dateX}";
series1.columns.template.hiddenState.properties.opacity = 0;
series1.dataItems.template.locations.dateX = 0;

var series2 = chart.series.push(new am4charts.RadarColumnSeries());
series2.name = "Series 2";
series2.dataFields.openDateX = "startDate2";
series2.dataFields.dateX = "endDate2";
series2.dataFields.categoryY = "category";
series2.clustered = false;
series2.columns.template.radarColumn.cornerRadius = 30;
series2.columns.template.tooltipText = "{category}: {openDateX} - {dateX}";
series2.columns.template.hiddenState.properties.opacity = 0;
series2.dataItems.template.locations.dateX = 0;

var series3 = chart.series.push(new am4charts.RadarColumnSeries());
series3.name = "Series 3";
series3.dataFields.openDateX = "startDate3";
series3.dataFields.dateX = "endDate3";
series3.dataFields.categoryY = "category";
series3.clustered = false;
series3.columns.template.radarColumn.cornerRadius = 30;
series3.columns.template.tooltipText = "{category}: {openDateX} - {dateX}";
series3.columns.template.hiddenState.properties.opacity = 0;
series3.dataItems.template.locations.dateX = 0;

var series4 = chart.series.push(new am4charts.RadarColumnSeries());
series4.name = "Series 4";
series4.dataFields.openDateX = "startDate4";
series4.dataFields.dateX = "endDate4";
series4.dataFields.categoryY = "category";
series4.clustered = false;
series4.columns.template.radarColumn.cornerRadius = 30;
series4.columns.template.tooltipText = "{category}: {openDateX} - {dateX}";
series4.columns.template.hiddenState.properties.opacity = 0;
series4.dataItems.template.locations.dateX = 0;

var series5 = chart.series.push(new am4charts.RadarColumnSeries());
series5.name = "Series 5";
series5.dataFields.openDateX = "startDate5";
series5.dataFields.dateX = "endDate5";
series5.dataFields.categoryY = "category";
series5.clustered = false;
series5.columns.template.radarColumn.cornerRadius = 30;
series5.columns.template.tooltipText = "{category}: {openDateX} - {dateX}";
series5.columns.template.hiddenState.properties.opacity = 0;
series5.dataItems.template.locations.dateX = 0;

chart.seriesContainer.zIndex = -1;

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();

chart.cursor = new am4charts.RadarCursor();
chart.cursor.innerRadius = am4core.percent(40);
chart.cursor.lineY.disabled = true;

var yearLabel = chart.radarContainer.createChild(am4core.Label);
yearLabel.text = "2018";
yearLabel.fontSize = 30;
yearLabel.horizontalCenter = "middle";
yearLabel.verticalCenter = "middle";