# amCharts 4 Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/).

Please note, that this project, while following numbering syntax, it DOES NOT
adhere to [Semantic Versioning](http://semver.org/spec/v2.0.0.html) rules.

## [4.2.6] - 2019-03-21

### Fixed
- `CategoryAxis` was breaking down after dynamic data update since 4.2.4.


## [4.2.5] - 2019-03-21

### Added
- New property `minPolylinestep` added to global `am4core.options`. Setting to bigger value (default: `0.5`) allows simplification of multi-point lines.
- Export: new setting `useSimplifiedExport` (default: `true`). Setting to `false` will force use of external library (canvg) for all exports.

### Fixed
- `XYCursor` with pan behavior used to remain in "grabbing" mode after click on zoom out button.
- Export: Menu was not working properly on Mobile Safari.
- Export: Menu was not working properly on Android Chrome.
- Export: Exporting of PDF/XSLX is now supported on Mobile Safari.
- Export: Exporting images in IE9 was broken.
- Stacks with pre-hidden series were showing incorrectly.
- `DateAxis` no longer ignores `renderer.tooltipLocation`.


## [4.2.4] - 2019-03-19

### Added
- `autoGapCount` added to `LineSeries`. If `connect = false` and distance between two data points is bigger than `baseInterval * autoGapCount`, a line will break automatically.

### Fixed
- `IPlugin` now accepts `Optional<Sprite>`.
- `XYCursor` will not longer obstruct page scroll if its `behavior` is set to `"none"`.
- JSON config: setting `geodata` by name (e.g. "worldLow") directly in `MapSeries` was not working.
- JSON config: Instantiating new `ColorSet` objects was not working properly.
- `DateFormatter` was not parsing dates like "20180101" (no separators) correctly.
- An issue with `DateAxis` and milliseconds fixed.
- `dataItem.locations.dateX` on `LineSeries` was not working properly.


## [4.2.3] - 2019-03-14

### Fixed
- Exporting via API from a chart that did not have `ExportMenu` set, was resulting in error.
- Fixed tooltip flickering that were set directly on series objects (columns/bullets).
- Because of daylight saving, sometimes `DateAxis` could mistake yearly data for monthly data if `baseInterval` was not set explicitly.
- Sometimes Sankey nodes did not perfectly fit into chart area.
- Tick `location` on Y axis was being ignored.
- Ticks were positioned incorrectly when multiple axes were on the same side of the `XYChart`.
- Issue with `strictMinMax` and single data item fixed.
- `valueY` (or any other value) wasn't working in `legendSettings.itemLabelText`.


## [4.2.2] - 2019-03-13

### Added
- `cursorHoverEnabled` added to `XYSeries`. Controls whether to trigger hover state on columns/bullets of the all series under hovered category/date.
- A new `plugins` property on all `Sprite`. [More info](https://www.amcharts.com/docs/v4/concepts/plugins/).
- New plugin: Regression. [More info](https://www.amcharts.com/docs/v4/tutorials/regression-trend-lines/).
- New `ExportMenu` setting: `closeOnClick` (default `true`). Will force export menu to close when export is initiated.

### Changed
- `DateFormat` will now parse even partial dates, e.g. format `"yyyy-MM-dd"` will parse `"2018"` correctly, and will assume Jan 1st.

### Fixed
- Export: `getImage()`/`getSVG()` will now correctly omit `exportable = false` elements.
- Export: Data export was not taking in additional columns after data updates.
- Some chart cloning issues fixed.
- Inccorrect behavior of Series' tooltip with `minBulletDistance` set fixed.
- Sometimes, when series had only one data item, chart used to zoom-in right after the init.
- In-line date formatting will now use `DateFormatter`'s parsing functions for string-based dates.
- `DateAxis` issues with certain timezones fixed.


## [4.2.1] - 2019-03-08

### Fixed
- Various graphical issues when using `<base>` tag (mostly affects Angular).
- `NumberFormatter` did not have a public accessor to set `negativeBase`.


## [4.2.0] - 2019-03-06

### Added
- Added read-only property of `CategoryAxis`: `frequency`. Indicates every X label is shown.
- Added JSON example of Candle stick chart (json/candlestick-series).
- New `Export` property: `extraSprites`. May contain a list of references to other `Sprites` (e.g. external legend or even other chart) to attach to exported image. [More info](https://www.amcharts.com/docs/v4/concepts/exporting/#Including_external_elements).
- Experimental responsive features and default rules are now active. [More info](https://www.amcharts.com/docs/v4/concepts/responsive/).

### Changed
- Accessibility: Default role of the Legend's item containers was changed to "switch".

### Fixed
- Accessibility: Legend's containers when toggling items were setting value of `aria-checked` incorrectly.


## [4.1.14] - 2019-03-01

### Changed
- Hiding or showing an element will now automatically set its `readerHidden` attribute accordingly.

### Fixed
- JSON: Using `children` with an array value was duplicating elements.
- Working around a bug with Angular's dead code elimination in `--prod` mode.
- Fixed `ValueAxis` issue with animation when there's only single data item.


## [4.1.13] - 2019-02-26

### Added
- New `Tooltip` proprety: `keepTargetHover` - will make target element hovered as long as its tooltip is hovered, good for bullets and map images.
- New `Tooltip` proprety: `targetSprite` - contains reference to element this tooltip is displayed for, if any.
- New `PictorialStackedSeries` properties: `startLocation` and `endLocation` - allow setting relative start and end positions of the shape to fill.
- New `FunnelSeries`/`PyramidSeries`/`PictorialStackedSeries` property: `labelsOpposite` - allows controlling which side of the series to show labels when `alignLabels = true`.

### Fixed
- Sometimes axis ticks on a chart with a lot of data/series were not positioned properly.


## [4.1.12] - 2019-02-25

### Changed
- On `MapPolygon` default value of `nonScalingStroke` is now set to `true` (as `false`).
- When calculating font size for a word on a `WordCloud` chart it now uses smaller side of the series area instead of height.
- `Tooltip`'s label `paddingBottom` default value changed from `6` to `4` pixels for better centering of text.

### Fixed
- Sometimes `baseInterval = "year"` on a `DateAxis` could cause stack overflow.


## [4.1.11] - 2019-02-25

### Changed
- Default value of `minFontSize` in `WordCloudSeries` to `2%`.
- Default value of `maxFontSize` in `WordCloudSeries` to `20%`.
- Label sizing algorithm updated in `WordCloudSeries`.


## [4.1.10] - 2019-02-24

### Added
- New chart type: [WordCloud](https://www.amcharts.com/docs/v4/chart-types/wordcloud/).

### Changed
- Rotated axis labels (`rotation != 0`) of the vertical and horizontal axes no longer have their `verticalCenter` and `horizontalCenter` overridden by renderer. This gives more freedom for positioning rotated labels.

### Fixed
- `exportable = false` was not working when set on various Series item templates.
- On Gantt chart date axis tooltip was snapping randomly when moving mouse.
- Export: For very large data sets (2MB and up) data export was failing silently in Chrome.


## [4.1.9] - 2019-02-20

### Added
- New `Sprite` property: `baseSprite`. On objects, even deep in hierarchy it will contain a reference to the main chart object.

### Changed
- Axis `min`/`max` calculation algorightm updated.

### Fixed
- On a chart with `DateAxis` and multiple series with same-date data items, bullets could sometimes disappear while scrolling the chart.
- On `DateAxis` with yearly granularity could sometimes show wrong year.
- Updating chart `data` with less data points was sometimes resulting in JavaScript error.
- `DateAxis` labels/ticks/grid was not placed in the correct position if `baseInterval.count > 1` and `location > 0`.
- Dynamically changing `ZoomControl` value of `layout` was not working correctly.


## [4.1.8] - 2019-02-15

### Added
- JSON: You can now specify both list of items and template settings for `ListTemplate`, e.g.: `titles: { template: { ... }, values: [{ ... }] }`. Specifying it the old way will still work.

### Changed
- `DateAxis` will now pay attention to `dateFormatter.firstDayOfWeek` when grid is in "weekly" mode.

### Fixed
- Using `proprtyFields` on a `LineSeries` sometimes could result in an error. (fix by @AndiLi99)
- French locale (fr_FR) updated for correct decimal/thousands separators.
- Export: `scale` in image export options was being ignored.
- JSON: `cursor.snapToSeries` was not working in JSON configs.
- Selection was acting funky when zooming `DateAxis` and cursor moved out of plot area.
- An infinite error message loop fixed which was happening if series was added and there was no X or Y axes defined.
- Tooltip on the last available data item was left visible even if cursor moved to the date where the series had no data points.
- When `snapToSeries` was enabled in `XYCursor`, vertical line was not shown.
- [Issue 933.](https://github.com/amcharts/amcharts4/issues/933)


## [4.1.7] - 2019-02-14

### Fixed
- `DateAxis` sometimes could show date/time in UTC even if not explicitly enabled.


## [4.1.6] - 2019-02-12

### Added
- New plugin chart type: [`Sunburst`](https://www.amcharts.com/docs/v4/chart-types/sunburst/)!
- New `Sprite` adapter: `criticalError`. Takes `Error` object as an argument. Modify it's `message` property.

### Fixed
- Export was somewhat broken in Angular apps or pages with `<base>` since 4.1.5.
- `DateAxis` was not positioning elements properly when spanning switch to/from daylight savings time.
- `valign` property of the horizontal axis labels now work properly.


## [4.1.5] - 2019-02-11

### Added
- New property `contextMenuDisabled` (default `false`) added to `Sprite`. If set to `true` it will prevent context menu (such as one displayed on right click) from displayed.

### Changed
- Setting `data` on `ColorSet` will now automatically reset iterator.

### Fixed
- `"rightclick"` event was essentially not working.
- Angular with router enabled were breaking charts in Safari and older Firefox.


## [4.1.4] - 2019-02-08

### Added
- `DateAxis.gridInterval` accessor added. Returns current grid interval.

### Fixed
- Calling `useTheme()` with the same theme multiple times used to cause that theme applied multiple times as well.
- Sometimes `ValueAxis` would not zoom-out to show new selected range when data was updated.
- Sometimes axis fills were not visible after zoom-in / zoom-out.
- `totalPercent` was not properly calculated with negative values.


## [4.1.3] - 2019-02-06

### Fixed
- `ExportMenu` items will be revalidated if data of the chart is updated. This helps avoid missing "Data" export items in menu if data is loaded later than the chart itself.
- In stacked axes setup axis tooltips were shown in wrong positions.
- Preloader was not always shown when needed.
- JavaScript error when hovering cursor over missing data items fixed.
- `TreeMap` data change performance improved.
- Horizontal `ZoomControl` (`layout = "horizontal"`) button text vertical align fix.
- Accellerated panning of zoomed-in axis problem fixed.


## [4.1.2] - 2019-02-05

### Added
- New `Sprite` property `strokeDashoffset` added. Can be used in conjunction with `strokeDasharray`.
- `Label` has two new properties: `path` and `locationOnPath`. If set, will layout the SVG text along a curvature of the SVG path. HTML and multi-line text is not supported.
- `AxisLabelCircular` new property `bent` added. If set to `true`, the label will be bent to follow the curvature of the circle. Distance from the circle can be adjusted using `radius` and `label.paddingBottom`. For `PieSeries` the alignLabels need to to be set to `false` for this feature to work.

### Fixed
- JSON: Having property values with both percent and minus signs in them, was resulting in error.
- "Z" code in `DateFormatter` was not taking UTC setting into account.
- Exporting SVG with Unicode characters in Edge/IE was resulting in invalid SVG.
- Fixed JavaScript error which used happen when disposing chart/changing data in some cases.
- Gantt chart sometimes was not displaying first/last data item.
- Newly added `MapLine` elements were not respecting `nonScalingStroke = true` until zoom level changed.
- Series' tooltip was not always visible with `DateAxis`.


## [4.1.1] - 2019-01-31

### Added
- `keepSelection` added to `ValueAxis` (will work on DateAxis too). With this set to `true`, axis will keep the relative selection when data changes (is updated). This is useful for "pre-zooming" a date axis: just set it's `start` property (e.g. `axis.start = 0.8`).

### Changed
- If `ValueAxis` has `strictMinMax = true` set but `min` and `max` are not set, axis will fix the min and max and real high/low values.

### Fixed
- `cursorTooltipDisabled = true` was not working properly in some cases.
- Sometimes duplicate `MapLineObjects` used to appear on map lines.
- Some fixes made so that vertically and horizontally stacked axes on `XYChart` are now possible. Check new example in `examples/vertically-stacked-axes`.


## [4.1.0] - 2019-01-30

### Changed
- Standalone scripts were recompiled to use unique Webpack scope, to avoid conflicts with other Webpack packages. If you are using map charts, to avoid breakage, make sure you update to 4.1 version of geodata package as well.

### Fixed
- Performance optimizations of date-based charts, especially with more than one series.
- Overlapping tooltips of series with gaps in date-based data fixed.
- Bullets were not hidden when series was hidden in some cases.
- `simplifiedProcessing` moved from `ColumnSeries` to `Series`. If set to `true` (default `false`) the chart will not auto-calculate derivative values for data items, like sum, average, change, etc.
- Last grid of monthly data was not always drawn.


## [4.0.24] - 2019-01-25

### Fixed
- `nonScalingStroke` (broken in 4.0.23) fixed.
- Legend custom adapters problem (broken in 4.0.23) fixed.


## [4.0.23] - 2019-01-25

### Changed
- `PieChart3D` property `angle` is now limited to 0-90 range.

### Fixed
- `LabelBullet` was not showing text on `RadarChart` without some additional tweaking.
- Clicking and releasing on plot area without moving cursor sometimes could result in chart zooming in.
- Bullets for `PieSeries`, `FunnelSeries` were not positioned properly.
- Labels of `PieSeries3D` were not being positioned properly if `alignLabels = false` and `label.radius < 0`.
- Axis' grid was not hidden when axis was hidden.
- It was not possible to disable funnel series ticks if `alignLabels = true`.
- Adding a `MapLine` on zoomed `MapChart` ignored `nonScalinStroke = true` until zoom.
- On Gantt chart horizontal axis' labels/grid used to bleed out outside the plot area when zoomed in significantly.
- Columns of `ColumnSeries` with `strokeOpacity > 0` could leave lines at the beginning/end of the plot area when zoomed-in.
- Adapters for `fontSize`, `textDecoration` and some other `Label`-related properties were not working properly.
- Chart legend was not updated if data was set directly on `PercentSeries`.
- `MapChart` was drawing only 109 MapLines in some cases.
- `MapLine` tooltip was not being positioned properly.
- When `invalidateRawData()` was called for a chart with a `DateAxis` while it was zoomed-in, the chart was not keeping current zoom.
- If data was added to a series while it was hidden, bullets of new data items were not hidden.
- `columns` of `ColumnSeries` were not being cleared when data was updated.
- `propertyFields.fill`/`stroke` was not respected when value was outside zoom range.
- Ticks on a `PieChart3D` were misaligned.
- `Preloader` of a second and any subsequent chart on the same page was not being centered.
- `PercentChart` legend markers where black if `legend.useDefaultMarker = true`.
- `PercentChart` legend markers could blink black initially before obtaining true color.
- The color scale on a vertical `HeatLegend` with `markersCount > 2` was being drawn reversed.


## [4.0.22] - 2019-01-23

### Added
- 23 new locales: Arabic, Bosnian, Catalan, Czech, Greek, Estonian, Finnish, Hebrew, Hindi, Croatian, Hungarian, Indonesian, Japanese, Korean, Latvian, Polish, Romanian, Serbian, Thai, Turkish, Vietnamese, Chinese (simplified and traditional versions). Thanks Bjorn Svensson!

### Fixed
- It is no longer necessary to use `"strictFunctionTypes": false`, [thanks to goloveychuk for their help](https://github.com/amcharts/amcharts4/pull/645).
- Broken images were causing export to fail.
- Setting Series' `name` to a number with percent sign was resulting in breakage of the whole chart.


## [4.0.21] - 2019-01-11

### Fixed
- Issues that caused errors in Map an Percent charts on data update and dispose fixed.


## [4.0.20] - 2019-01-11

### Fixed
- Chart with `ColumnSeries` was failing with an error when `data` was updated.


## [4.0.19] - 2019-01-11

### Fixed
- `MapLineSeries` with direct `data` set were somewhat broken since last update.


## [4.0.18] - 2019-01-10

### Added
- JSON: Better id checking and error reporting.

### Fixed
- Export menu no longer shows DATA menu for `MapChart` (and other charts if data is empty).
- JSON: Some empty properties like `dummyData` were not being set properly.
- Disposing a chart or series when `Legend` was enbled was resulting in error.


## [4.0.17] - 2019-01-09

### Fixed
- Dramatically improved performance for data-heavy charts (with 10s and 100s of thousands of data points).
- `SmallMap` viewport indicator rectangle was positioned incorrectly.
- Clicking on `SmallMap` was not moving map to corthis.component.rect location.
- Lines from GeoJSON were not drawn by `MapLineSeries`.
- Issue with multiple data points on the same date fixed (not all data points were visible at the end of selection).


## [4.0.16] - 2019-01-05

### Added
- New locales: Norwegian Bokmål (np_NO), Danish (da_DK).

### Changed
- Renamed Swedish locale to `sv_SE`.

### Fixed
- Interactions on MacOS Safari was broken sincle last update.


## [4.0.15] - 2019-01-04

### Added
- `color` property added to `LegendDataItem`. Can be used for coloring `label` or `valueLabel` text like `text = "[{color}] {name}"`.
- `minZoomCount` added to `Component`.
- Export now allows formatting numberic values as durations. Use newly added `durationFields` and `durationFormat` settings.

### Changed
- Export: When exporting date to XLSX, date fields will now export as true date fields in Excel (which in turn will format them according to regional settings), unless `useLocal` is set to `false`.

### Fixed
- Charts were not working properly in FireFox Extended Support Release.
- Some computer setups were not properly registering mouse movement.
- `legendSettings` was being ignored initially if legend was in external container.
- "Week year" (format code `"YYYY"`) was not being properly calculated.


## [4.0.14] - 2019-01-02

### Added
- New setting `zoomStep` added to `MapChart`. Allows controlling zoom in/out speed.

### Fixed
- `Series.hidden` did not work as expected.
- World map did not work in Ember.
- Eliminated multiple warnings in recent version of Chrome regarding wheel events being active.
- Fixed mousewheel zoom in IEs.
- Draggable/resizable items were not working properly on some Android browsers.
- Setting `height` to a relative value for a horizontal `ColumnSeries` column template was not working propertly.


## [4.0.13] - 2018-12-26

### Fixed
- Charts were broken in IE9.


## [4.0.12] - 2018-12-24

### Fixed
- Cursor/mouse operations were somewhat broken in IE11 and lower.


## [4.0.11] - 2018-12-24

### Added
- `"disabled"` and `"enabled"` events added to `Sprite`.
- `cursorTooltipEnabled` added to `XYSeries`  If set to `false` cursor will not trigger bullet/item tooltips on series.

### Changed
- IMPORTANT (CODE-BREAKING CHANGES) For performance reasons we no longer create axis elements if they are disabled. For the same reasons we disabled by `axis.ticks` and `axis.axisFills` by default. Previously to enable them you had to set their `strokeOpacity` and/or `fillOpacity` to non-zero. This no longer will work. You will need to set `disabled` to `false` instead.
- `axisRanges` now take their default values from `dateAxis.axisRanges.template` items (`axisFill`, `grid`, `tick`, `label`). Previously they were using the defaults from `dateAxis.renderer.label` etc. This was not comfortable and counter-intuitive.

### Fixed
- `XYChartScrollbar`'s value axis was calculating `min`/`max` with a very big step.
- Ember plugin was throwing console errors.
- Fixed occasional zoom-in issue on Mobile Safari.
- `MapChart` mouse wheel zoom direction was inverted on some browsers.
- Cursor was not snapping correctly to `DateAxis` items.
- Multiple floating columns on the same category were disappearing when scrolling the chart.
- Date range fills were off when zooming on Gantt Chart.
- Overlapping tooltips problem solved.
- When `snapToSeries` was set for a tooltip, it was flickering a lot on slower browsers.
- `alignLabels = false` on a `PieSeries3D` was causing labels to be positioned incorrectly.
- `PieSeries.dataFields.radiusValue` was not accounting for `chart.innerRadius`.
- Dynamically updating `alignLabels` for `PieSeries` did not work correctly.
- Legend: `itemValueText` only worked if `valueText` was set.
- `ValueAxis` setting `maxZoomFactor = 1` was not working as expected.
- Changing values for all data items sometimes was resulting in `ValueAxis` scale going into negative.
- Some more tooltip and cursor related issues fixed.
- Axis Fill did not properly fill the whole span when axis was scaled.


## [4.0.10] - 2018-12-20

### Fixed
- In some situations, when `geodataSource` had events set, it was producing error.
- `DateAxis` was not rounding intervals properly, could display grid at `15:01`, `15:31` etc.
- Cloning an object was cloning sometimes was causing event handlers to be duplicated.
- A leftover console debug line was removed.


## [4.0.9] - 2018-12-19

### Added
- `snapToSeries` added to `XYCursor`. Allows setting series to which cursor lines should be snapped. Works if one of the axis of the series is `DateAxis` or `CategoryAxis`. Won't work if both axes are `ValueAxis`.
- New example: Pie charts in Columns using JSON config.
- Export: `emptyAs` added to both CSV and Excel export options. If set, missing values will be replaced with this value (default is empty string).
- New event `"beforedisposed"` added to `Sprite`. Kicks in right before the element starts to dismantle itself.
- Italian translation.

### Changed
- Export: if no `dataFields` specify it will now look for fields in all of the data, not just the first line.
- When creating a new state on an object, it will not automatically propagate itself on object's clones if `applyOnClones = true`.
- Setting `Container`'s `setStateOnChildren` will now propage to the new value to its existing clones if `applyOnClones = true`.
- In case `deepInvalidate()` is called on `Container`, it forces labels to redraw.
- `filters` on `SpriteState` is now `List` (was `ListTemplate`). It's better for performance which does not require creating Filter template object.

### Fixed
- Clicking a hoverable/clickable object was resultin in "over" and "out" events generated next to "hit".
- JSON: properties to existing `List` items were not being applied properly.
- Using geodata in Ember app was causing errors (Issue 672).
- Export to CSV/Excel was following first line of data values. It now respects `dataFields` setting, and will replace missing values with `emptyAs` (new options setting).
- Wheel-scrolling in MacOS Safari was very slow.
- HTML-based tooltips were too small to fit the actual contents on MaCOS Safari.
- `DateFormatter` was not parsing `"i"` format as local timezone, rather than UTC.
- Sometimes bullets with `Rectangle` element in them were not positioned properly.
- If category was named `"undefined"`, it was messing up label positions on `CategoryAxis`.
- State's property value was not being applied if current value of the property was `undefined`.
- Performance of `PieChart` and `RadarChart` improved dramatically under IEs.
- In some cases `"ready"` event was not being fired.
- `FunnelSeries` with 0 (zero) value slices was not rendered correctly.


## [4.0.8] - 2018-12-11

### Added
- `currentStep` added to `ColorSet`. Allows setting current position of the color iterator.
- Adapters added for `Sprite` properties: `inertiaOptions`, `hitOptions`, `hoverOptions`, `swipeOptions`, `keyboardOptions`, `cursorOptions`.

### Changed
- `nonScaling` of `AxisLabel` is no longer set to `true` by default, to improve performance.

### Fixed
- `ValueAxis` was not updating its scale if series was hidden and animated theme was not enabled.
- Zooming an `XYChart` with all values equal was broken.
- Series in an `XYChartScrollbar` sometimes was not visible initially.
- `ColumnSeries` was drawing 1px line for `null` value data items.
- `DateAxis`' `snapTooltip = true` was working incorrectly with `skipEmptyPeriods = true`.
- Logarithmic `ValueAxis` with axis breaks was resulting in stack overflows.
- JSON: Chaining multiple adapters in an array (e.g. `adapter: [{...}, {...}]`), was not working.
- JSON: Adding elements to `children` via array syntax was not working properly.
- JSON: `Container` elements can now be created via JSON config.
- Setting `dataFields` in `Export` was only affecting column names. Values for all data fields were still being included in export.


## [4.0.7] - 2018-12-07

### Added
- `snapTooltip` with default value `true` added to `DateAxis`. Cursor will snap to the nearest date at which series has values.

### Changed
- Default value of `showOnInit` set to `false` for `TreeMapSeries`.

### Fixed
- Solved tooltip overlapping bug.
- In `TreeMap`, when series is toggled off, remaining series will be resized to take up freed space.


## [4.0.6] - 2018-12-06

### Added
- `snapTooltip` added to `XYSeries`, with default value `false`. If set to `true`, the series will show nearest available tooltip when cursor is over plot area.
- Slovenian translation.

### Fixed
- Automatic `DateAxis` interval detection improved.


## [4.0.5] - 2018-12-06

### Changed
- `DateFormatter` will now automatically format "negative" year values to "BC" (era) format. So not `"-1000"`, but `"1000BC"`. These are translatable via language.
- `DropShadowFilter` of the tooltip removed. Instead it is now applied on background of tooltip. This helps to avoid text distortion.

### Fixed
- Heat rules were not working if all the values were the same. Now middle value between min and max is applied in this case.
- Updated algorithm to deal with date axes breaks. It's faster now and does not cause stackoverflow if the gaps are very big.
- Series on `HeatMap` charts were ignoring scrollbars.
- `DateAxis` was not properly placing labels if `location > 0` and grid interval was bigger than one time unit.
- `DateAxis` with very big date difference (thousands of years) displayed too many grid/labels/ticks.
- Masking of a sprite with a container updated. It now pays proper attention to container's position.
- Automatic `DateAxis` interval detection improved. Previously it detected intervals like minutes, hours, days, years. Now it will detect intervals like 15 min, 30 min, 5 days etc. This can still be set manually using axis' `baseInterval` property.


## [4.0.4] - 2018-12-03

### Added
- `zoomLevel` and `zoomGeoPoint` properties added to `MapSeriesDataItem` and `IMapSeriesDataFields`. If set, these settings instead of automatically-calculated will be used when `zoomToMapObject()` method is invoked.

### Changed
- `verticalCenter` and `horizontalCenter` is no longer applied to rotated axis labels. If you are setting `rotation` on axis labels, make sure to adjust these settings as well as per your requirement.

### Fixed
- Setting `axis.renderer.inside` was ignored if set after chart was already initialized.
- Changing `align` of the a sprite was ignored if set after it was already initialized.
- Top level `TreeMap` segment tooltip was positioned incorrectly after drilling down and back up.
- `min`/`max` of `ValueAxis` was not being updated after `invalidateRawData()` call, and series were stacked.
- Tooltip sometimes was pointing outside chart container.
- `ChordLink` bullets were not properly positioned on init.
- `DateAxis` was not working well if `baseInterval.count > 1`.


## [4.0.3] - 2018-11-30

### Added
- Ability to set default locale via `am4core.options.defaultLocale`. When set, all new charts will automatically assume that locale, freeing you from setting locale for each chart individually.
- `reverseOrder` added to `Container`. Allows reversing order of its `children`.

### Changed
- Moved `Legend` of a `MapChart` from `chartAndLegendContainer` to `chartContainer`. In order to position legend on map chart, use `legend.align` / `legend.valign` properties.
- Default value of `showOnInit` on any `Series` is now `false`. Except if you are using "animated" theme, which sets it to `true` by default.

### Fixed
- JSON: Using `type: "Sprite"` in JSON config was not creating elements properly.
- Initial chart rendering optimized Charts should build faster.
- Some more performance optimizations.
- Setting `hiddenInLegend` on `Series` after chart was already built had no effect.


## [4.0.2] - 2018-11-28

### Added
- New method `setInterval()` on all base objects added. Works exactly like JS's `setInterval` but is automatically killed when target object is disposed.
- Added array utilities to `am4core`.

### Changed
- Removed unused `"label"` adapter from `Axis`.

### Fixed
- [Issue 588.](https://github.com/amcharts/amcharts4/issues/588)
- Fixed mouse wheel and zoom control zooming of a map which does not occupies all the div size.
- Fixed map scaling issues of a map which does not occupies all the div size.
- Sometimes axis labels were not formatted using number or other formatters.
- Adapters of data items were not being copied to clones.
- `text` property of `AxisDataItem` was not being copied to clones.


## [4.0.1] - 2018-11-24

### Fixed
- Issues with stacked series and `min`/`max` of `ValueAxis` fixed.
- Chart cursor now dispatches `"panning"` event only if moved by at least 3 pixels. This solves problem with panning on click.
- If `extraMin`/`extraMax` were set on `ValueAxis`, some unnecessary zoom used to happen.


## [4.0.0] - 2018-11-22

### Changed
- Droping BETA tag!
- `DropShadowFilter` will now always use balck by default instead of `"alternativeBackground"` from the theme.

### Fixed
- Setting `hiddenInLegend = true` on Series was causing the chart to hang.


## [4.0.0-beta.87] - 2018-11-22

### Added
- Full source code for amCharts 4 is now included under `/src/`.

### Changed
- Full language files are now under `/src/lang/`. If you need to make a translation, do a PR on those files/dir.


## [4.0.0-beta.86] - 2018-11-20

### Fixed
- In some situations waiting for `"ready"` event was producing unnecessary frame requests.


## [4.0.0-beta.85] - 2018-11-20

### Added
- `"ready"` event added to `Sprite`. Sprite fires it right after `"init"` event. `Container` fires it when all of its children are ready.
- `system.isPaused` property added. Setting it to `true` will effectively pause any chart activity, making them completely static.
- `ErrorBullet` class added. Allows drawing error charts. (Check `error-chart` and `xy-error-chart` examples for code samples)
- JSON: String-based `cursorOverStyle` and `cursorDownStyle` are not supported.

### Fixed
- JSON: Setting `ColorSet` properties `baseColor` or `list`  was not working properly.
- Accessibility: Legend item was not properly referring to a Series via `labelled-by`.
- `Label.wrap` was breaking lines mid-word even if there where words that would fit into alotted space.
- Memory leak fixed.
- Sometimes `Animation` was not firing `"animationended"` event (when elastic easing was used).


## [4.0.0-beta.84] - 2018-11-18

### Added
- `exportable` (default `true`) property added to `Sprite`. If set to `true` this element will not appear in the exported image of the chart.

### Changed
- `exportable` is now set to `false` by default on `Scrollbar` grips, zoom out button.

### Fixed
- JSON: `dateFormats` was being ignored.


## [4.0.0-beta.83] - 2018-11-15

### Added
- [`hideOverflow`](https://www.amcharts.com/docs/v4/reference/svgcontainer/#hideOverflow_property) added to `SVGContainer` class. If set to `true` it will apply `overflow: hidden` to chart container so that all chart elements are contained within. Default is `false`, except on `MapChart`, which has it at `true`.

### Fixed
- Some adjustments and fixes to animations associated with `hide()`/`show()` functions.
- If a legend was initially disabled, it was not appearing when enabled later.
- `chart.addData()` was not adding data to `XYChart` scrollbar series.


## [4.0.0-beta.82] - 2018-11-14

### Added
- JSON: `forceCreate` property added. If found in an item of an array, it will force creation of the new object, even if object with same index already exists in target `List`.
- French locale.

### Changed
- Adjusted animation durations in "animated" theme.

### Fixed
- JSON: String-based percent and color values were not being parsed correctly in some cases.
- JSON: `HeatLegend` was erroring if its `series` property was referencing to Series by id.
- Disposing an item with a custom `id` set was not clearing it from id map properly resulting in errors if item with the same id was being added later.
- `SankeyDiagram` was not taking chart's padding into account when sizing itself.
- Axis ticks were not being positioned properly after data update.
- Map using `deltaLongitude` was being positioned incorrectly.
- 3D columns z-indexing was sometimes incorrect.
- `PieChart` label placement with custom `startAngle`/`endAngle` was sometimes off.
- Label bullets on columns were not being restored from truncated state when width of the columns was increasing.
- Series `show()`/`hide()` were using `interpolationDuration` setting instead of `defaultState`/`hiddenState` transition duration when showing/hiding.


## [4.0.0-beta.81] - 2018-11-13

### Fixed
- `chart.hiddenState.properties.opacity` is no longer set to `1` by default. Removed this in order it to be `0` so that charts using animated theme would always fade-in.
- Better initial rendering of `ValueAxis` (removed unneeded animations).
- Sometimes map was not positioning itself at `homeGeoPoint`.
- Map with Eckert6 projection in some cases was not displayed properly.


## [4.0.0-beta.80] - 2018-11-13

### Fixed
- Legend in external container was resulting in infinite loop.
- Rendering an arrow on a `MapLine` with same source and destination point was resulting in error.

## [4.0.0-beta.79] - 2018-11-12

### Fixed
- `goHome()` on `MapChart` was not working properly.
- `projection` change on `MapChart` was not working properly.


## [4.0.0-beta.78] - 2018-11-11

### Changed
- `DataParser` property `type` was renamed to `contentType` in order not to conincide with JSON-based config built-in keyword `type`.

### Fixed
- Some rendering issues fixed.


## [4.0.0-beta.77] - 2018-11-10

### Fixed
- Removed console debug (yes, again).


## [4.0.0-beta.76] - 2018-11-10

### Fixed
- Removed console debug.


## [4.0.0-beta.75] - 2018-11-10

### Added
- You can now use `"{percent}"` placeholder in `tooltipText` of `HeatMapSeries` items.

### Fixed
- Draggable/trackable areas of the chart were intercepting all mouse buttons, including right and back/forward.
- Fixed `MapChart` issue with dragging map by touch on hybrid devices.


## [4.0.0-beta.74] - 2018-11-08

### Fixed
- `ColumnSeries3D` were broken since last release.


## [4.0.0-beta.73] - 2018-11-07

### Changed
- `axisFills.template.interactionsEnabled` is now set to `false` by default. If you need to attach events on an axis fill, you will need to set it to `true`.

### Added
- `autoDispose` property added to `Series` and `Axis` classes with default value `true`. This means that series/axis will be automatically disposed when removed from chart's `series`, `xAxes`, or `yAxes` lists.
- It is now possible to have 3D stacked columns (by setting `clustered = false` on series).

### Fixed
- If chart container was moved in DOM tree, it stopped sensing resize and was not updating its size anymore.
- Sometimes `ValueAxis` could show zero label with a minus sign.
- Arrows on `MapLine` were not drawn.
- It was not possible to change the text color of the tooltip on `TreeMap` diagram.
- `axis.tooltipPosition = "pointer"` was not working as it should - always follow the mouse/pointer.
- If series had `data` set directly, it was still using chart's global `data`, resulting in combined datasets and potentially visual anomalies.
- Setting `cellStartLocation` did not have any effect on an already inited chart.
- Line series could be cut off in the beginning (when zoomed-in closely).
- Vertical axis ticks were not being positioned properly if axis had a title.
- 3D columns were not using chart's `depth`/`angle`.


## [4.0.0-beta.72] - 2018-11-03

### Changed
- For any `XYSeries` if the `itemReaderText` is not set explicitly, it will automatically try to fill with values from `dataFields`, so that each series element, like a Column has at least rudimentary screen-reader text.

### Fixed
- Added in TypeScript 3.x support.
- `ColumnSeries` with two category axes anomaly fixed.


## [4.0.0-beta.71] - 2018-11-01

### Fixed
- Calling `dispose()` on a `TreeMap` was causing an error.
- Legend items were being duplicated every time its disabled property was reset back to `false`.


## [4.0.0-beta.70] - 2018-10-31

### Fixed
- Keyboard dragging of elements such as scrollbar grips was not working.
- "hoverable" elements were not staying "hovered" after tap in Mobile Safari.
- `addData()` with more than one data item added was not working well.
- Zoomout button was visible on initial animation.
- Dynamically changing `Legend.position` was not updating its layout properly.
- Vertical axis tick position with rotated labels was incorrect.


## [4.0.0-beta.69] - 2018-10-30

### Fixed
- Some charts were not properly displayed if initialized in a hidden (`display: none`) container, then revealed (`display: block`).
- Last slice of the `PyramidSeries` was not visible for certain widths.
- Adding `Legend` to a chart that had series with bullets using heatrules was causing an error.
- Label rotation was being ignored on `SlicedChart`.
- Labels of `PyramidSeries` were not centered (when `alignLabels = false`).
- Animation of labels for horizontal `PictorialSeries` was very jumpy.
- `position` and `rotation` of labels in `PyramidSeries` was not working properly.
- An error was occurring if chart's with a category axis data was updated and it contained less data points than before.


## [4.0.0-beta.68] - 2018-10-30

### Changed
- `tooltip.defaultState.transitionDuration` and `tooltip.hiddenState.transitionDuration` default values of animated theme set to `400`.

### Fixed
- Chart was not being drawn properly when instantiated in a hiden container.


## [4.0.0-beta.67] - 2018-10-29

### Fixed
- Chart `Cursor` was preventing hovers on series' elements like columns or bullets.
- Mouse cursor's down styles (like on scrollbar) were not being reset back properly in some cases.


## [4.0.0-beta.66] - 2018-10-28

### Fixed
- Axis glitches in `XYChart3D`.
- `XYCursor` movement issues.


## [4.0.0-beta.65] - 2018-10-28

### Changed
- `tooltip.hiddenState.transtionDuration` and `tooltip.defaultState.transitionDuration` are now set to 1 (on non-animated theme) to avoid some tooltip flickering.
- Individual legend items (label, value label, and marker) now have their  `interactionsEnabled = false` set by default to avoid double events. If you need to add events to these particular elements (as opposed to the whole legend item), you will need to set `interactionsEnabled = true` on that element.

### Fixed
- Calling `show()` on a `MapSeries` object was resulting in an error.
- 3D columns were not visible if their value was zero.
- Bullets are now hidden if `minBulletDistance` is set.


## [4.0.0-beta.64] - 2018-10-27

### Added
- `shouldClone` flag added to `EventDispatcher`'s `on` and `once` methods. Can be used to restrict cloning of events when object itself is cloned.
- [`showOnInit`](https://www.amcharts.com/docs/v4/reference/sprite/#showOnInit_property) property added to `Sprite`. If this is set to `true`, the `Sprite`, when inited will be instantly hidden ("hidden" state applied) and then shown (animate properties form "hidden" state to "default" state). Animation will take `defaultState.transitionDuration`. `Series`, `Chart` classes has this set to `true`, so that they would perform initial animations. If you want a sprite (chart, series) not to be shown initially, you can set Sprite's [`hidden`](https://www.amcharts.com/docs/v4/reference/sprite/#hidden_property) to `true`. (`setting sprite.visible = true` won't work as expected anymore).

### Changed
- If chart rendering takes too long, it now is split into chunks, which makes the browser/page remain responsive even if you have a lot of charts to build.
- Changed how pre-hiding Series works. If you want series to be initially hidden, use `series.hidden = true` instead of `series.visible = false`.
- Removed `"hold"` and `"rotate"` interaction events and releated options and functionality, since they weren't used anywhere.
- Removed `"delayFirstHit"` option from `Sprite.hitOptions`.
- `chart.defaultState.transitionDuration` is set to `1`. This allows the chart to appear one frame after init and helps to avoid various flickers that happen while chart is building. Animated theme has this value set to `2000`.

### Fixed
- Performance enhancements.
- Non-draggable/trackable but otherwise interactive elements of the chart no longer prevent scrolling and other gestures on touch screens.
- `PieSeries` labels sometimes were positioned incorrectly (using non-default start/end angles).
- Slices (also columns of `RadarChart`) were not drawn if `radius <= 0` (even if `innerRadius > 0`). This resulted in radar columns not rendered in some cases.
- `MapChart` was not resizing properly when div size changed.
- `PictorialStackedSeries`, while `containerdiv` was resized did flicker a lot.
- If a Tooltip is visible while its Sprite changes size/position, it updates its position as well.
- Setting `chart.data = []` was not clearing data properly.


## [4.0.0-beta.63] - 2018-10-20

### Fixed
- In some cases a `PieChart` could overlap its legend.
- `PieChart` flicker after `invalidateData` fixed.
- An error was occurring when data was updated on chart with series with bullet while hovering it with cursor.


## [4.0.0-beta.62] - 2018-10-19

### Fixed
- Tooltip issue fixed.

## [4.0.0-beta.61] - 2018-10-19

### Changed
- If element has `url` set, when clicked, it will now parse for data placeholders in curcly brackets, e.g. `"{category}"` allowing have dynamic data-driven URLs. Note, the elements are not url-encoded so you need to specify encoding manually, e.g.: `series.columns.template.url = "https://www.google.com/search?q={category.urlEncode()}";`.

### Fixed
- `Label.fullWords = false` was not working properly.
- `AxisLabelCircular` was positioning labels incorrectly, if label.radius was negative (since 59).
- `"grid"` layout in `Container` was incorrectly layouting elements if their `width` was set in percent.
- [IE] Multi-line truncated labels were not working properly on IE.
- [IE] was incorrectly zIndexing elemens (since version 56).
- [IE] tooltip initial flicker solved.
- [IE] was incorrectly sorting multiple series tooltips (if `Cursor` was used).


## [4.0.0-beta.60] - 2018-10-18

### Changed
- `"hidden"` data field added to series' `dataFields`. Removed `"visible"` data field from `PercentSeries`. You should use `"hidden"` data field to set which slices/columns/etc. are hidden initally.
- `AxisLabelCircular`'s `radius` can now be set in `Percent`. `PieChart`'s label radius default value was set to `5%`.

### Fixed
- Multi-line labels were not being aligned properly in IEs.
- In some cases, `fillModifier` was not applied if set after `fill`.
- In some cases, a chart with `seriesContainer` disabled, or when `seriesContainer`'s height/width was 0, could produce a JS error.
- Some performance tuneups, especially for charts with axes and more data.


## [4.0.0-beta.59] - 2018-10-17

### Added
- [`widthRatio`](https://www.amcharts.com/docs/v4/reference/image/#widthRatio_property) and [`heightRatio`](https://www.amcharts.com/docs/v4/reference/image/#heightRatio_property) properties on `Image`.

### Fixed
- Some adapters for Axis elements were being applied twice.


## [4.0.0-beta.58] - 2018-10-17

### Added
- `ExportMenu`'s "custom" items can now have `"callback"` which is a function to call when clicked on such custom item.

### Changed
- Slice labels on a `PieChart` now move with the slice (if `alignLables = false`).

### Fixed
- `requestAnimationFrame` now is called only when needed. This reduces idle CPU usage.
- Fixed `m4core.color()` result caching issue.
- Charts were broken in IEs since beta.57.
- `Tooltip` on `LineSeries` was not updating color if segment changed color.
- `MapChart` without any series was displaying an error in console.
- Axis tooltip was trimmed when `renderer.inside = true`.
- `StepLineSeries` `startLocation`/`endLocation` bug fixed.
- `"hover"` state was not being applied to series' bullet if it did not hav `tooltipText` set.
- `bulletLocation` for horizontal `ColumnSeries` fixed.
- Value labels of `Legend` were not in correct positions if `Legend` was positioned at the top or bottom (too close to legend label).


## [4.0.0-beta.57] - 2018-10-15

### Changed
- All charts (that inherit from `Chart`) now will apply "hidden" state right after they are validated, then immediately "default" state. This allows creating initial animations such as fade-in (if using animated theme). All you need to do is set: `chart.hiddenState.properties.opacity = 0;`.

### Fixed
- Mouse wheel zoom was broken since beta.56 on `MapChart`.
- Pushing `Sprite` to `Container.children` directly (instead of setting parent) used to produce a JS error.


## [4.0.0-beta.56] - 2018-10-12

### Added
- New `Sprite` adapter: `"populateString"`. Applied to strings after `Sprite` replaces data binders with real values, but before any formatting by `Label` kicks in.
- New `Label` property: [`ignoreFormatting`](https://www.amcharts.com/docs/v4/reference/label/#ignoreFormatting_property). If set to `true` will treat formatting blocks in square brackes (e.g. `"[red bold]"`) as regular text and will display them as such.

### Changed
- Default big, small, and byte suffixes in `NumberFormatter` are now translatable via locale files.
- The suffix for thousands "kilo", was changed to lowercase "k", as per [standards](https://en.wikipedia.org/wiki/International_System_of_Units#Prefixes).
- On `XYChart`, default for [`mouseWheelBehavior`](https://www.amcharts.com/docs/v4/reference/xychart/#mouseWheelBehavior_property) changed to `"none"` (was `"zoomX"`).

### Fixed
- Improved performance! All charts types are now noticably, some drastically are faster. Some memory leakages fixed as well.
- Now `MapPolygonSeries` will not inherit chart's global `geodata` if it has own `geodataSource` set.
- `DateFormatter` was not parsing all AM/PM string dates correctly.
- `DateFormatter` was not parsing `MMM` (short month names like "Jan", "Feb") propertly.
- In-line date formatter was not working correctly in some cases, e.g. `"{dateX.formatDate()}"`.
- Setting `chart.mouseWheelBehavior = "none"` did not release wheel scrolling of the web page when hovering over chart.
- `DataSource`'s' `"done"` event was being called if parsing of loaded data failed. Not anymore. `"done"` is called only on successful load. To catch any load (including one that ended in http or parse error) use `"ended"`.
- `DataSource`'s' `reloadFrequency` was broken if error occurred during one of the loads. This has been fixed. Even if error occurrs, loader will try to reload data in the next reload slot.
- JSON: `heatRules` did not work properly with their target set to a list template, e.g. `mapPolygons.template`.
- Auto-calculated `DateAxis.baseInterval` was not being carried over to the `XYChartScrollbar`.
- `DurationAxis` scale sometimes was dropping to negative values, even there were no negative values in data.
- `PieChart` and `Legend` were not working properly with `chart.zoom()` or `legend.zoom()` methods.


## [4.0.0-beta.55] - 2018-09-26

### Added
- New series type suitable for `SlicedChart`: `PictorialStackedSeries`. (check `pictorial-stacked-chart` and `pictorial-stacked-chart-horizontal` demos)
- New themes: "dataviz", "moorisekingdom", "frozen", "spiritedaway".
- New Chart property: `logo`. If you are using amCharts with a free license, it holds reference to amCharts logo. Use it to position logo with `align` and `valign` properties.
- New `FunnelTick` properties: `locationX` and `locationY`. Allow specifying a relative location within target element where tick is pointing to.

### Changed
- `FunnelChart` was renamed to `SlicedChart`. The previous name did not correctly represent capabilities of the chart type that can display not only funnel series, but also pyramids and stacked pictorial series. `FunnelSeries` remains as it was before.

### Fixed
- Mouse wheel zoom was extremely slow in FireFox.
- Sometimes colors duplicate colors were generated by `ColorSet`.
- HTML-based labels were not accounting for "pixel ratio" on Retina displays, making tooltips larger then they are supposed to be.


## [4.0.0-beta.54] - 2018-09-22

### Fixed
- Chart Cursor was working only for the first chart on the same page.
- `CSVParser` was not parsing `dateFields` and `numberFields` correctly.
- Issues with labels rendering in incorrect position fixed.
- `LinearGradientModifier` was not copying gradient properties to clones (since last version only).
- `FunnelSlice` sometimes rendered slice edges with no anti-aliasing.
- When calculating area of the Pyramid slices height of `sliceConnector` was not being taken into account.
- Reset `label.renderingFrequency` back to `1` to solve some unwanted label flickering.
- `MapImage` items were not showing if added via `series.data` (since last version only).


## [4.0.0-beta.53] - 2018-09-21

### Added
- New property `durationFormat` on `DurationFormatter`. If set, it will force this format to be used, instead of one determined by `baseUnit`.


## [4.0.0-beta.52] - 2018-09-21

### Added
- `CurvedColumnSeries` added. Allows having columns as curves or as triangles. Check `curved-column-chart` and `triangle-column-chart` in examples folder.
- `RadialGradientModifier` class added. Allows building more donut-like pie charts. Check `semi-circle-donut-chart` in examples.
- New chart type: `FunnelChart`, which can show regular FunnelSeries and PyramidSeries.
- New axis type: `DurationAxis`. Values on it are treated and formatted like time durations.
- `extraMin` and `extraMax` properties added to `ValueAxis`. Can be used to relatively adjust calculated minimum and maximum scale values.
- Two new read-only properties added to `Container`: `contentWidth` and `contentHeight`. Will hold width/height in pixels of the actual dimensions of elements in Container.

### Changed
- `DurationFormatter` now uses `TimeUnit` for its `baseUnit`, rather than arbitrary codes.
- `durationFormat` property was removed from `DurationFormatter`. Use [`getFormat()`](https://www.amcharts.com/docs/v4/reference/durationformatter/#getFormat_method) method to get correct format instead, then pass in to `format()`.
- Series will not show a tooltip (if one axis is `CategoryAxis`) if there is no value for this category (used to show tooltip if it had some extra text).

### Fixed
- Legend `valueLabel` values were not shown on chart initial render.
- 3D pie slices were not showing full stroke, only on the upper part of a slice.
- Sometimes `XYChart` did some additional animation even after all series finished animating, causing zoom-out flashing briefly.
- `XYChartScrollbar` was not showing series if data to the original series was added later (or changed).
- Chrome was not showing line series in `XYChartScrollbar` if all values were equal.
- Creating an empty line (without `multiGeoLine` set) was resulting in critical error.


## [4.0.0-beta.51] - 2018-09-13

### Changed
- Changed `Label.renderingFrequency` to `2`, for better performance.

### Fixed
- Performance tweaking.
- `DateAxis.baseInterval` was ignored in JSON-based configs.
- `"hoverActive"` state was not always being correctly applied.
- Better handling of cursor zoom and pan when outside chart area.
- Fixed occasional error when formatting dates or numbers.
- Line chart starts new segement only if properties (like `stroke`, `fill`, `strokeDashArray`, etc.) in data have changed. It used to start new segment if properties in data were defined resulting in reduced performance and disabled smoothed lines.
- Labels were not updating their position if their `fontSize` changed.
- `Sprite.nonScalingStroke = true` was ignored if set after `Sprite.strokeWidth`.
- `LineSeries` could leave some garbage lines while zooming.
- `ColumnSeries` could leave some garbage columns while zooming.
- `DateAxis` with one date only in chart data was not rendered properly.
- The chart was not zooming out after data validation.
- Added `ghostLabel` to `Axis` which is an invisible label and it helps to avoid unwanted changes of axis widht/height when the scale changes, e.g. on zoom.
- `zoomToMapObject`, if used with `MapPolygon` and custom `zoomLevel` was not working properly.
- `"hidden"` event of Series was called on initial chart initialization.


## [4.0.0-beta.50] - 2018-09-10

### Added
- `am4core.unuseAllThemes()` method added. Any chart created after this method call will not have any theme applied to it.
- New property `am4core.registry.baseSprites` will now hold all active (non-disposed) instances of top-level elements, such as charts.
- `startLocation`/`endLocation` properties added to `CategoryAxis` (previously available on `DateAxis` only). Allows to specify location the first and last cells of the axis should start on respectively.
- `innerRadius` of a Slice can now be set as `Percent` (e.g. `am4core.percent(50)`).
- You can now set custom radii (`radius` property) on Pie series (if you have more than one, you might want one to be larger and another smaller).

### Changed
- [`MapLine.imagesToConnect`](https://www.amcharts.com/docs/v4/reference/mapline/#imagesToConnect_property) now accepts an array of string IDs that can reference images by their `id` property.
- Changed `tooltip` inheritance so that it checks for `virtualParent` rather than direct `parent`. E.g. series' bullets use series' tooltip and not chart tooltip as it was before.

### Fixed
- Map polygon stroke thickness could be rendered incorrectly when zooming quickly. (Issue #175)
- Calling `addData()` more than once before data was validated resulted only last data item to be added. (Issue #222)
- `DateAxis.baseInterval` was ignored if data was set directly on series.
- `MapLine` was not paying attention to the properties set on template.
- `HeatLegend` was not updating its label count after its size changed. This could have been resulting in very few labels if initial container (div) size was small.
- The map portion of `MapChart` was incorrectly positioned after container (div) resize.
- Object properties, like `"name"` in GeoJSON were overriding same properties in `MapSeries` data. Now, the values specified in data are used over ones in GeoJSON. (Issue #307)
- Axis ranges used to reset `axisRange.label.text`. (Issue #308)
- Fixed issues with disposing series and charts.
- Updated to [canvg 1.5.3](https://github.com/canvg/canvg/releases/tag/v1.5.3) to fix em/rem text issue for epoxrt fallbacks.


## [4.0.0-beta.49] - 2018-09-05

### Added
- JSON config: added `callback` property, which if it holds a reference to function will call it within the scope of the object being prepared.
- Adapters for `url` and `urlTarget` properties.
- Chart can now be panned or zoomed using mouse wheel. To set what it does use `mouseWheelBehavior` on `XYChart` (see next point)
- [`mouseWheelBehavior`](https://www.amcharts.com/docs/v4/reference/xychart/#mouseWheelBehavior_property) added to `XYChart`. Options: `"zoomX"` (default), `"zoomY"`, `"zoomXY"`, `"panX"`, `"panY"`, `"panXY"`, `"none"`.
- [`mouseWheelBehavior`](https://www.amcharts.com/docs/v4/reference/mapchart/#mouseWheelBehavior_property) added to `MapChart`. Options: `"zoom"` (default), `"none"`.

### Changed
- Second parameter to `Cursor`'s [`triggerMove()`](https://www.amcharts.com/docs/v4/reference/cursor/#triggerMove_method) method was changed from boolean to enumeration of "stickiness" level: `"hard"`, `"soft"`, `"none"` (default).

### Fixed
- Error fixed when `Popup` object was being disposed.
- Over-panning of an `XYChart` did not disappear after mouse button was released outside chart.
- Multiple memory leaks fixed.
- `MapChart` was rounding lat/long coordinates too much which was resulting in pixelated maps for small-area maps.


## [4.0.0-beta.48] - 2018-08-31

### Added
- `useWebFonts` setting in `Export`. Allows disabling of download of web fonts when exporting.
- `useRetina` setting in `Export`. Images are now exported scaled up on retina displays by default. Set `useRetina = false` to disable.

### Changed
- Export fallback mechanism for older browsers changed from FabricJS to canvg, which is much lighter and has better text formatting support.
- On retina displays images will now export supersized in order not to lose quality. Set `useRetina = false` to disable.
- amCharts logo will now auto-hide on supersmall chart sizes.

### Fixed
- Cursor was zooming the chart even if drag motion was performed on an external element positioned over the chart.
- Cursor was not hidden when it was no longer hovering the chart area if chart had no padding.
- `urlTarget` was not carried over from `ListTemplate` template to new items.
- Cursor could cause chart to freeze up on a DateAxis with empty cells in the axis' beginning or end.
- Export will now correctly handle web fonts, such as Google Fonts. Please note that FontAwesome is not supported, since they forbit any kind of usage, except inclusion via CSS.


## [4.0.0-beta.47] - 2018-08-24

### Added
- New series type: `OHLCSeries`.
- `goHome()` method added to `MapChart`. Calling it will reset map to `homeZoomLevel` and `homeGeoPoint`.
- `homeGeoPoint` added to `MapChart`. Allows setting initial `geoPoint` at which map will be centered.
- `homeZoomLevel` added to `MapChart`. Allows setting initial `zoomLevel`.
- `maxPanOut` property added to `MapChart`, with default value `0.7`. It prevents map to be dragged out of the chart area.
- `noRisers` property added to `StepLineSeries`. It allows step line chart without vertical (or horizontal, depending on orientation) lines.
- Step line without risers now allows making Waterfall chart. Example added.
- `startLocation` and `endLocation` added to `StepLineSeries`, that allow controling locations at which step should start/end.
- `maxPrecision` added for `ValueAxis`. Use it to restrict Value axis to show value labels with less than desired precision (set 0 if you only want integers).
- Portugese (Portugal) translation added.

### Changed
- `Cursor` will now not move if there's some element obstructing the chart's plot area, e.g. a popup or some other element outside the chart.

### Fixed
- Series' and axes' tooltips will now correctly inherit formatters.
- Errors when hovering mouse cursor over open Modal.
- JSON: `children` property of `Container`-type objects was not being processed correctly.
- Popup/Modal now sets `aria-label` automatically if title is set.
- Removing bullet template from series or disposing it will remove/dispose all the bullets created from it.
- Tooltips were overlapping each other, fixed for the most part, but might still be some situations where they overlap.
- Changing data for `MapImageSeries` and `MapLineSeries` used to result runtime error.


## [4.0.0-beta.46] - 2018-08-19

### Fixed
- `TreeMap.homeText` was not working.
- `TreeMap` used to display upper level bullets/labels when drilled-down.
- `TreeMap` had issues with hiding items using legend (when not using animated state).
- Chart cursor was not visible if data was set directly on axis/series but not on chart.


## [4.0.0-beta.45] - 2018-08-17

### Added
- New hardcoded `Sprite` state name added `"hoverActive"` which (if defined) is applied on active elements on hover. This state is applied last in the chain.
- New property on `DataSource`: `keepCount`. If set to `true` incremental updates will remove data items from the beginning of the current dataset, when adding the newly-loaded ones.
- New property on `DataSource`: `incrementalParams`. It's an object whose key/value pairs will be added to URL as parameters when DataSource is making an incremental load request.
- `Popup` (and `Modal`) now have an event dispatcher (`events`) with two events: `"opened"` and `"closed"`. ([more info](https://www.amcharts.com/docs/v4/concepts/popups-and-modals/#Event_handlers))

### Changed
- Legend now respects `itemContainers.template.togglable = false`, which disables default functionality of toggling items when clicked in legend, allowing users to attach their own funcitonality to legend item clicks.
- Toggling of items in Legend can now be disabled by setting `chart.legend.itemContainers.template.togglable = false`.
- In `XYChart` with a `DateAxis`, cursor and data at irregular intervals will now display a Tooltip for nearest available series' data item.
- `zoomToCategories` method of `CategoryAxis` now zooms to the end of the "to" category.
- Default `urlTarget` of amCharts logo is now `"_blank"`.

### Fixed
- In `DataSource` the formatters `inputDateFormat` was ignored.
- Incremental data load via `DataSource` was not working.
- Tooltip used to flicker ar 0,0 position in some cases when hovering over elements.
- Fixed issue which caused chart to gradually shrink to invisibility under some conditions.
- Fixed rendering errors for charts that were initialized in hidden containers.
- `XYCursor` lines and axis tooltips were not shown if chart did not have any data (data was set directly on axis/series).


## [4.0.0-beta.44] - 2018-08-14

### Added
- `TreeMap` now supports legend. Legend will be displayed if a) `TreeMap` data is at least two levels deep (legend displays items from a second level); b) `chart.maxLevels` is set to `2` (without setting it no second-level series are created so legend does not have anything to build itself from). [More info](https://www.amcharts.com/docs/v4/chart-types/treemap/#Legend).
- Swedish translation.

### Changed
- `DateFormatter` will now automatically capitalize month/weekday name if it's the first (or only) word in resulting formatted date. This can be turned off by setting formatter's [`capitalize`](https://www.amcharts.com/docs/v4/reference/dateformatter/#capitalize_property) to `false`.

### Fixed
- Removed `@deprecated` commented out methods/properties that were confusing tslint.
- Issue that caused the chart to shrink was fixed.


## [4.0.0-beta.43] - 2018-08-12

### Changed
- `$net.load()` options parameter now supports `responseType`. If set to `"blob"` will return response as `Blob` object in `result.blob`.

### Fixed
- Value axis min/max calculation algorithm adjusted. Fixed an issue with `strictMinMax = true` and issue with min/max when axis size was very small.
- Export now correctly uses external fonts included via `@import`, such as Google Fonts.
- Non-clickable columns in `ColumnSeries` will no longer gain focus on click/tap, unless its `hitOptions.noFocus` is set to `false`.
- Noon was incorrectly formatted as "AM", instead of "PM".
- `TextFormatter` was producing invalid `style` value on empty formatting blocks (`"[]"`).
- `parent` was not being set for a `Sprite` that was pushed directly to `Container.children`.
- If axis labels were disabled, ranges labels were not visible.
- Axis used to reset some of the user-set values when initing renderer, e.g. `dateAxis.renderer.grid.template.location = 0.5` was not working.
- `XYChart` with category axis + date axis was not working properly.
- Stacked chart with logarithmic axis was not working properly.
- JSON: local formatter instances were not being instantiated properly, so all children objects were reusing chart's main formatters.
- JSON: Patterns are now supported.


## [4.0.0-beta.42] - 2018-08-05

### Fixed
- Updated default Popup CSS to eliminate a rare scrollbar flashing issue.
- Fixed an error with PDF exporting.

## [4.0.0-beta.41] - 2018-08-03

### Added
- `MapSeries` now has `geodata` and `geodataSource`. This allows setting separate maps to each separate map series, which no longer rely on single chart-wide `geodata`. Also, setting `geodata` for `MapSeries` will automatically set `useGeodata = true`, so no need to set it manually.

### Changed
- Removed unused `boldUnitChange` from `DateAxis`.
- Labels on `DateAxis` will now pay attention to `label.location` if label represents full time period between grids. It no longer will force labels to be in the middle.
- `label.currentText` is now public.

### Fixed
- Fixed parsing of string dates in ISO format (`"i"`).
- Legend marker was not aligned with the text (when marker was smaller).
- Solved legend error which happens if you show/hide series after series was added/removed.
- Dynamically adding series was not automatically adjusting axis scales.
- Vertical `CategoryAxis` was not paying attention to `grid.location`.
- Map issues at `minZoomLevel < 1` fixed.


## [4.0.0-beta.40] - 2018-08-02

### Added
- German translation. (de_DE)

### Changed
- [`XYChart.getUpdatedRange()`](https://www.amcharts.com/docs/v4/reference/xychart/#getUpdatedRange_method) method is now public so you can use it to recalculate absolute axis range into a relative that takes current zoom and inversion into account.
- `Language` now supports `null` in translations which means an empty string.
- Interface `iColorSetStepOptions` was renamed to `IColorSetStepOptions` to maintain consistency.
- Interface `ColorPurpose` was renamed to `IColorPurpose` to maintain consistency.
- `FlowDiagramNode` `value` property renamed to `total`, added `totalIncoming` and `totalOutgoing` properties which hold sum of all incoming/outgoing links.
- Removed aliases `startCategory`, `startValue`, and `startDate` from Axes data items. (use `category`, `value`, and `date` respectively)

### Fixed
- Improved performance of Sankey/Chord Diagrams.
- Elements of `TreeMapChart` were not respecting locale.
- Fixed-height bars were drawn incorrectly.
- Pre-hidden series were not taken into account when calculating min/max of value axes in some cases.
- Setting chart data with less data items then there were before resulted in an error.


## [4.0.0-beta.39] - 2018-07-27

### Added
- `useChartAngles` added to `AxisRendererCircular`. If set to `false` allows to set `startAngle`/`endAngle` to each circular axis individually.

### Fixed
- Fixed problem with custom `Legend` data and initial visibility, you can now use `visible: false` to pre-hide custom legend items.
- Grid Layout fixed, affects Legend.


## [4.0.0-beta.38] - 2018-07-26

### Fixed
- Using `PieSeries` data field `"visible"` was not graying out Legend's marker.


## [4.0.0-beta.37] - 2018-07-26

### Added
- You can now make series initially to be hidden by setting `series.visible = false`.
- `visible` added to `PieSeries.dataFields`. It allows making some of the slices initially hidden.

### Changed
- Sankey/Chord diagrams has now toggling nodes enabled by default. To disable, set `chart.nodes.template.togglable = false`.

### Fixed
- Text formatter now correctly escapes double square/curly brackets, as well as empty formatting blocks `[]`.
- Setting `series.visible = false` or `series.hide()` wasn't toggling off related item in Legend.
- Setting `isActive` did not affect `Container`'s background (assuming it had `"active"` state).


## [4.0.0-beta.36] - 2018-07-25

### Added
- `elements` property in `Popup`. Returns an object consisting of references to various elements of the Popup, like content block, close button, etc.

### Changed
- `am4core.getSystem()` has been changed to `am4core.system`

### Fixed
- Fixed double "amcharts" in Popup's class names.
- Fixed dragging on of absolute-positioned Popups.
- Escaping square brackets in text (by repeating them twice) was not working.
- Fixed a lot of disposer leaks.
- Fixed an issue that caused runtime errors with Rollup.


## [4.0.0-beta.35] - 2018-07-23

### Added
- New adapter on `Component` (and everything that inherits it including charts and series): `"data"`.
- New adapter on `Popup`: `"closable"`.

### Changed
- `showModal()` and `hideModal()` methods were renamed to `openModal()` and `closeModal()` respectively.
- `show()` and `hide()` methods on `Popup`/`Modal` were renamed to `open()` and `close()` respectively.

### Fixed
- More performance-related improvements, especially with `CategoryAxis`.
- Changing `interactionsEnabled` from `false` to `true` was not working properly in IE.
- Setting `axisRenderer.inside = true` after chart was already built didn't work.
- `zoomlevelchanged` event of `MapChart` was being fired even if zoom level did not change.
- Setting `MapChart.deltaLongitude` was ignored if it was set before projection was set.
- Map tooltip bounds were not being updated when map container's size changed.


## [4.0.0-beta.34] - 2018-07-22

### Fixed
- Dramatic performance improvements!


## [4.0.0-beta.33] - 2018-07-19

### Added
- `calculatePercent` flag added to `Series`. Default value is `false`, except for `PieSeries`. Series will not calculate percent values of each data item if this is not explicitly set to `true`. Since it wasn't been used anywhere but Pie chart, this should improve performance of initial data parsing.

### Fixed
- Performance improvements. Especially when zooming/scrolling chart with a lot of data.
- `lineSeries` was not paying attention to `propertyField` values set in data.
- Radar and Gauge charts were not centered properly when resizing window.
- Container's background properties were not copied when cloning container.


## [4.0.0-beta.32] - 2018-07-17

### Important (potentially breaking changes)
- To maintain event-naming consistency, events `"insert"` and `"remove"` were renamed to `"inserted"` and `"removed"` respectively in `List` and its inheriting classes. [#132]
- To maintain event-naming consistency, events `"clear"` and `"remove"` were renamed to `"cleared"` and `"removed"` respectively in `Dictionary` and its inheriting classes.

### Fixed
- Significant performance improvements were made.
- JSON config: Filters could not be used.
- Some properties were not being copied when cloning objects, e.g. `segments` in `LineSeries`. (`interactionsEnabled` and some others)
- Circular axis was not properly drawing grid lines if `radius` was < `percent(100)`.
- `Button` label was "stealing" interactions from the button itself.
- `Tooltip` was sometimes drawn without pointer if "animated" theme was not enabled.
- Fixed label alignment of Y axis.

### Changed
- Improved `contentAlign` (when content size is bigger than actual size of a container).

### Added
- Two new adapters added to `Label`: `"textOutput"` and `"htmlOutput"`. Both are applied **after** label contents (text or HTML respectively) are populated with data.
- Added `"custom"` option to export menu types, which now allows creating clickable custom items in the `ExportMenu`.
- `Legend` now accepts "raw" data, enabling creating custom items: `legend.data = [{name:"name 1", fill:"#ff0000"}, {name:"name 2", fill:"#00ff00"}]`. Important: a legend with custom items must be added to some chart container manually (e.g. `chart.chartContainer`). Assigning it to `chart.legend` will overwrite its data.

## [4.0.0-beta.31] - 2018-07-06

### Important
- Layouting mechanism was revamped to make it more consistent and intuitive. If you see some layout issues with your chart, please let us know!

### Added
- New chart type: [`ChordDiagram`](https://www.amcharts.com/docs/v4/chart-types/chord-diagram/).

### Changed
- The `Adapter` `keys` property is now a 0-argument function and not a property.
- `Adapter` callback now has third parameter `key`, which is a string indentifier of the adapter being applied.
- `ChordDiagram`, same as `SankeyDiagram` now extend `FlowDiagram` class. `FlowDiagram` can not be instantiated alone, it's a base class for those two.
- `minWidth`/`minHeight` is now set to some small amount on a `PieChart` so that it remains visible even, if the oversized legend does not fit into container.
- `heatRules` no longer override properties if they are set using `propertyFields`.

### Fixed
- Printing in Firefox was broken after latest updates in export/print.
- Re-enabled data export on legacy IEs.
- If a legend was initially disabled, it did not show up after enabling it later.
- Series tooltip was not disposed when series was disposed. This could result in tooltips hanging and not hidin in such charts as `TreeMap` after data was changed.
- `Tooltip` was sometimes flickeing at 0,0 position when first hovered on columns of a series.
- When all values were 0, `XYChart` was not displayed properly.
- When all values were equal and less than 0, `XYChart` was not displayed properly.
- Zero-value slices were shown as black rectangles in the pie chart legend.
- Labels were not showing tooltips.
- `LineSeries` was not displayed properly if colors were set in data. (using `propertyFields`)
- Tooltips were shown with white background when first hovered over slices/columns/etc.
- Setting `interactionsEnabled = true` did not if it was set to `false` previously.
- `axisFill` was not showing `innerRadius` correctly if it was set as `Percent`.
- Data update on `SankyDiagram` was resulting in error.

## [4.0.0-beta.30] - 2018-06-22

### Fixed
- JSON config: `heatRules` can now refer to bullets in `tartget` using syntax `"bullets.0.property"`, e.g. `"bullets.0.circle"`. (meaning use "circle" property of the first bullet as heat rule target)
- Export: fixed SVG export on Firefox.
- Export: fixed SVG/CSV/JSON export for Edge/IE.
- Export: fixed sheet name limitations for Excel export.
- Export: print option was printing the whole page instead of just chart on IEs.
- Export: fixed bitmap image export on IEs.
- [Issue 65.](https://github.com/amcharts/amcharts4/issues/65)

### Changed
- `class` attribute is no longer applied to elements by default. To enable it use new setting `am4core.options.autoSetClassName`.
- `class` attributes now will contain the whole inheritance chain, e.g. `"amcharts-Sprite amcharts-Container amcharts-Button"`. Class names are no longer lowercased.
- The `svgContainer` property is now an `SVGContainer`, not an `HTMLElement`.

### Added
- New global option `am4core.options.autoSetClassName` (default `false`). If set to `true` will set `class` attribute of all elements that reflect class element was created in, including inheritance, e.g. `"amcharts-Sprite amcharts-Container amcharts-Button"`.

### Removed
- Element-level `classNamePrefix` is no longer available. Use global `am4core.options.autoSetClassName` instead.

## [4.0.0-beta.29] - 2018-06-16

### Fixed
- Wrong `Cursor` behavior in Edge browser on hybrid touch screens.
- Malfunctioning colors in IE9.
- Console errors, triggered by mouse hover in IE9.
- A bunch of errors and bugs on Popup/Modal in IE9.
- Enabling `ExportMenu` on IEs was breaking the chart.
- `"dragstop"` event was not being triggered on touch and hybrid devices.

### Changed
- Dramatically improved performance of dragging of Popup.
- The `dataItem` of the tooltip is now set sooner, which enables it to be used in its various adapters.

### Added
- `Sprite` now has [`hoverOptions`](https://www.amcharts.com/docs/v4/reference/sprite/#hoverOptions_property) which can be used to set up how touch "hovering" works.

## [4.0.0-beta.28] - 2018-06-05

### Fixed
- Using chart `Cursor` now prevents default browser gestures on touch and hybrid displays.
- Disabling elements (e.g. Legend or Axis labels) will now make other elements take up vacant space automatically.
- Tooltips on `XYSeries` data items with zero value were not being shown.
- Sometimes `XYSeries` tooltips were messed up and shown in incorrect position.
- Updating chart data with stacked series could result incorrect min/max values on `ValueAxis`.
- `Treemap` was not showing all the required levels on zoom-out unless animated theme was being used.
- Sometimes unpredictable behavior of labels on a logarithmic value axis was fixed.
- `DateAxis` with `skipEmptyPeriods = true` was showing axis tooltip at incorrect positions in some cases.

### Changed
- `Sprite.mouseEnabled` was renamed to `interactionsEnabled`.
- An option `"mouse"` for `tooltipPosition` was renamed to `"pointer"`.

## [4.0.0-beta.27] - 2018-06-01

### Fixed
- Issue with `Label` text truncation.
- Huge performance improvements, especially on initial chart load.
- `Animation.resume()` was not working.

### Changed
- Default `tooltipLocation` on `SankeyLink` is now `0.5`.
- Default value of `series.hiddenState.opacity` is now `0` (was `1`). Animated theme sets it to `1`, because it animates stuff by interpolation, rather than fade.

### Added
- `pt_BR` and `en_CA` locales.
- `fullWords` property on `Label`. Works only when `truncate = true`. Setting to `false` will force non-fitting label to be truncated in the middle of the word.

## [4.0.0-beta.26] - 2018-05-30

### Fixed
- Error with `EventDispatcher is disposed`.
- Having "stray" axis objects (not attached to any chart) was resulting in critical error.
- Zooming was broken on `RadarCursor` since last update.
- `PieSeries.legendSettings` were being ingored.
- `Cursor` was incorrectly doing `panY` (inverted).
- Date axis tooltip was not rounding dates to `baseDuration`.
- Date axis was not working properly with `min`/`max` values set.

### Changed
- Redone chart print functionality. Now printing is done via `<iframe>` by default. An alternative CSS option is also available.
- If series' bullets have hover state set, it will be applied whenever chart cursor is over position, even if not directly hovering over bullet.
- `XYSeries` used hidden/default state `transitionDuration` for interpolating values when showing/hiding series. Now they use `series.interpolationDuration`.
- ZoomOut button was under the cursor lines making it impossible to click.
- `easing` renamed to `transitionEasing` in SpriteState, for consistency.
- When setting `width`/`height` for an element in pixels, `minWidth` and `maxWidth` is also set to the same values.
- If `interpolationDuration` is 0 and `hiddenState.transitionDuration > 0`, the series will transit to hidden state first and then instantly interpolate values to 0.

### Added
- Finished cursor updates to support cursor syncing.

## [4.0.0-beta.25] - 2018-05-25

### Fixed
- Using `tooltipHTML` was very buggy.
- Text formatting with two adjacent formatting blocks (`[...][...]`) was broken.
- `DateFormatter` was ignoring `utc` setting when formatting dates.
- Popup no longer obstructs the chart around it.
- Popup/Modal and Export Menu now temporarily disable all interactivity behind it.

### Added
- `DataSource` now has property [`requestOptions`](https://www.amcharts.com/docs/v4/reference/datasource/#requestOptions_property) which you can use to add custom request headers to HTTP(S) requests.
- `Popup.title` property.
- `Popup.draggable` property (boolean). Default `true`. Makes popups draggable.
- `ru_RU` (Russian) and `nl_NL` (Dutch) translations.
- `Dictionary`, `DictionaryTemplate`, `List`, `ListTemplate`, `OrderedList`, `OrderedListTemplate`, `SortedList`, and `SortedListTemplate` have these new methods:
- `each` (which calls a function for each element in the data structure)
- `Symbol.iterator` (which is used for the ES6 iterator protocol)
- New `Cursor` event: `"behaviorcanceled"`. (called when zoom/pan/select operation is abandoned)
- New `Cursor` methods: [`triggerMove()`](https://www.amcharts.com/docs/v4/reference/cursor/#triggerMove_method), [`triggerDown()`](https://www.amcharts.com/docs/v4/reference/cursor/#triggerDown_method), and [`triggerUp()`](https://www.amcharts.com/docs/v4/reference/cursor/#triggerUp_method) for improving cursor syncing and manual placement.
- Support for `Series.heatRules` in JSON chart config.
- JSON config now supports arrays in `events` and `adapter`.

### Changed
- HTML labels now take `fill` (color) parameter into account by translating it into `color` CSS property of the style.
- Now when data loader gracefully handles CORS and other critical load errors.
- `Chart.openPopup()` now does not ignore second parameter. (title)
- Changed default International English time with seconds format to `"HH:mm:ss"`.
- Date format on `DateAxis` tooltip will now use axis' `minPeriod` rather than current label period.
- `EventDispatacher.has()` function's second parameter (callback) is now optional. If it's not specified it will check whether **any** event handlers are present for this particular event type.

## [4.0.0-beta.24] - 2018-05-16
### Fixed
- Mouse/touch-related functionality was preventing text selection on the whole document.

### Added
- Added examples in JSON format. (available in JS-oriented packages and GitHub only)
- New events on `ExportMenu`: `"branchselected"`, `"branunselected"`, `"closed"`.
- Added [`Sprite.hoverOnFocus`](https://www.amcharts.com/docs/v4/reference/sprite/#hoverOnFocus_property) boolean setting. If set to `true` element will also trigger hover events on it when it gains focus, e.g. display tooltip. (accessibility feature)

## [4.0.0-beta.23] - 2018-05-13
### Fixed
- Various internal things were not properly disposed.

## [4.0.0-beta.22] - 2018-05-13
### Fixed
- Heights of vertical `HeatLegend`'s gradient band and value axis (labels) were different.
- `HeatLegend` without its `series` set was resulting in critical error.
- `HeatLegend` did not respect `dataField` setting in `Series.heatRules`.

### Removed
- `newStack` from Series which was redundant.

## [4.0.0-beta.21] - 2018-05-10
### Added
- New element class [`Popup`](https://www.amcharts.com/docs/v4/reference/popup/).
- New way to display pop-ups on charts via [`Sprite.popups`](https://www.amcharts.com/docs/v4/reference/sprite/#popups_property) and [`Sprite.openPopup`](https://www.amcharts.com/docs/v4/reference/sprite/#openPopup_method).
- New example "adding-live-data".
- Added this `CHANGELOG.md`.

### Fixed
- Fixed automatically-calculated RadarChart radius on non-full-circle chart setups.
- Improved incremental data updates.

## [4.0.0-beta.20] - 2018-05-09
- Internal maintenance release

## [4.0.0-beta.19] - 2018-05-09
- Internal maintenance release

## [4.0.0-beta.18] - 2018-05-09
- Internal maintenance release

## [4.0.0-beta.17] - 2018-05-09
- Internal maintenance release

## [4.0.0-beta.16] - 2018-05-09
- Internal maintenance release

## [4.0.0-beta.15] - 2018-05-09
### Fixed
- `createFromConfig()` was not working properly if chart type was passed as a class reference.
- In JSON-based config, axes properties were not being set.
- In JSON-based config, referring to Series in `XYChartScrollbar` was giving an error.
- One-ended `SankeyLink` was not being drawn correctly.

## [4.0.0-beta.14] - 2018-05-0
- Internal maintenance release

## [4.0.0-beta.13] - 2018-05-04
- Internal maintenance release

## [4.0.0-beta.12] - 2018-05-04
- Internal maintenance release

## [4.0.0-beta.11] - 2018-05-03
### Added
- Added ability to automatically load geodata via `MapChart.geodataSource`. ([more info](https://www.amcharts.com/docs/v4/chart-types/map/#Loading_external_maps))

### Changed
- `DateAxis.baseInterval` now defaults to 1.

### Fixed
- Fixed bad tooltip behavior on the right-side axis.
- Fixed `DateAxis.skipEmptyTimeUnits` which was not working properly.
