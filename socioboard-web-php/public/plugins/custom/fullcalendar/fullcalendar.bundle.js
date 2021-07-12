/*!
FullCalendar Core Package v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.FullCalendar = {}));
}(this, function (exports) { 'use strict';

    // Creating
    // ----------------------------------------------------------------------------------------------------------------
    var elementPropHash = {
        className: true,
        colSpan: true,
        rowSpan: true
    };
    var containerTagHash = {
        '<tr': 'tbody',
        '<td': 'tr'
    };
    function createElement(tagName, attrs, content) {
        var el = document.createElement(tagName);
        if (attrs) {
            for (var attrName in attrs) {
                if (attrName === 'style') {
                    applyStyle(el, attrs[attrName]);
                }
                else if (elementPropHash[attrName]) {
                    el[attrName] = attrs[attrName];
                }
                else {
                    el.setAttribute(attrName, attrs[attrName]);
                }
            }
        }
        if (typeof content === 'string') {
            el.innerHTML = content; // shortcut. no need to process HTML in any way
        }
        else if (content != null) {
            appendToElement(el, content);
        }
        return el;
    }
    function htmlToElement(html) {
        html = html.trim();
        var container = document.createElement(computeContainerTag(html));
        container.innerHTML = html;
        return container.firstChild;
    }
    function htmlToElements(html) {
        return Array.prototype.slice.call(htmlToNodeList(html));
    }
    function htmlToNodeList(html) {
        html = html.trim();
        var container = document.createElement(computeContainerTag(html));
        container.innerHTML = html;
        return container.childNodes;
    }
    // assumes html already trimmed and tag names are lowercase
    function computeContainerTag(html) {
        return containerTagHash[html.substr(0, 3) // faster than using regex
        ] || 'div';
    }
    function appendToElement(el, content) {
        var childNodes = normalizeContent(content);
        for (var i = 0; i < childNodes.length; i++) {
            el.appendChild(childNodes[i]);
        }
    }
    function prependToElement(parent, content) {
        var newEls = normalizeContent(content);
        var afterEl = parent.firstChild || null; // if no firstChild, will append to end, but that's okay, b/c there were no children
        for (var i = 0; i < newEls.length; i++) {
            parent.insertBefore(newEls[i], afterEl);
        }
    }
    function insertAfterElement(refEl, content) {
        var newEls = normalizeContent(content);
        var afterEl = refEl.nextSibling || null;
        for (var i = 0; i < newEls.length; i++) {
            refEl.parentNode.insertBefore(newEls[i], afterEl);
        }
    }
    function normalizeContent(content) {
        var els;
        if (typeof content === 'string') {
            els = htmlToElements(content);
        }
        else if (content instanceof Node) {
            els = [content];
        }
        else { // Node[] or NodeList
            els = Array.prototype.slice.call(content);
        }
        return els;
    }
    function removeElement(el) {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
    // Querying
    // ----------------------------------------------------------------------------------------------------------------
    // from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
    var matchesMethod = Element.prototype.matches ||
        Element.prototype.matchesSelector ||
        Element.prototype.msMatchesSelector;
    var closestMethod = Element.prototype.closest || function (selector) {
        // polyfill
        var el = this;
        if (!document.documentElement.contains(el)) {
            return null;
        }
        do {
            if (elementMatches(el, selector)) {
                return el;
            }
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
    function elementClosest(el, selector) {
        return closestMethod.call(el, selector);
    }
    function elementMatches(el, selector) {
        return matchesMethod.call(el, selector);
    }
    // accepts multiple subject els
    // returns a real array. good for methods like forEach
    function findElements(container, selector) {
        var containers = container instanceof HTMLElement ? [container] : container;
        var allMatches = [];
        for (var i = 0; i < containers.length; i++) {
            var matches = containers[i].querySelectorAll(selector);
            for (var j = 0; j < matches.length; j++) {
                allMatches.push(matches[j]);
            }
        }
        return allMatches;
    }
    // accepts multiple subject els
    // only queries direct child elements
    function findChildren(parent, selector) {
        var parents = parent instanceof HTMLElement ? [parent] : parent;
        var allMatches = [];
        for (var i = 0; i < parents.length; i++) {
            var childNodes = parents[i].children; // only ever elements
            for (var j = 0; j < childNodes.length; j++) {
                var childNode = childNodes[j];
                if (!selector || elementMatches(childNode, selector)) {
                    allMatches.push(childNode);
                }
            }
        }
        return allMatches;
    }
    // Attributes
    // ----------------------------------------------------------------------------------------------------------------
    function forceClassName(el, className, bool) {
        if (bool) {
            el.classList.add(className);
        }
        else {
            el.classList.remove(className);
        }
    }
    // Style
    // ----------------------------------------------------------------------------------------------------------------
    var PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i;
    function applyStyle(el, props) {
        for (var propName in props) {
            applyStyleProp(el, propName, props[propName]);
        }
    }
    function applyStyleProp(el, name, val) {
        if (val == null) {
            el.style[name] = '';
        }
        else if (typeof val === 'number' && PIXEL_PROP_RE.test(name)) {
            el.style[name] = val + 'px';
        }
        else {
            el.style[name] = val;
        }
    }

    function pointInsideRect(point, rect) {
        return point.left >= rect.left &&
            point.left < rect.right &&
            point.top >= rect.top &&
            point.top < rect.bottom;
    }
    // Returns a new rectangle that is the intersection of the two rectangles. If they don't intersect, returns false
    function intersectRects(rect1, rect2) {
        var res = {
            left: Math.max(rect1.left, rect2.left),
            right: Math.min(rect1.right, rect2.right),
            top: Math.max(rect1.top, rect2.top),
            bottom: Math.min(rect1.bottom, rect2.bottom)
        };
        if (res.left < res.right && res.top < res.bottom) {
            return res;
        }
        return false;
    }
    function translateRect(rect, deltaX, deltaY) {
        return {
            left: rect.left + deltaX,
            right: rect.right + deltaX,
            top: rect.top + deltaY,
            bottom: rect.bottom + deltaY
        };
    }
    // Returns a new point that will have been moved to reside within the given rectangle
    function constrainPoint(point, rect) {
        return {
            left: Math.min(Math.max(point.left, rect.left), rect.right),
            top: Math.min(Math.max(point.top, rect.top), rect.bottom)
        };
    }
    // Returns a point that is the center of the given rectangle
    function getRectCenter(rect) {
        return {
            left: (rect.left + rect.right) / 2,
            top: (rect.top + rect.bottom) / 2
        };
    }
    // Subtracts point2's coordinates from point1's coordinates, returning a delta
    function diffPoints(point1, point2) {
        return {
            left: point1.left - point2.left,
            top: point1.top - point2.top
        };
    }

    // Logic for determining if, when the element is right-to-left, the scrollbar appears on the left side
    var isRtlScrollbarOnLeft = null;
    function getIsRtlScrollbarOnLeft() {
        if (isRtlScrollbarOnLeft === null) {
            isRtlScrollbarOnLeft = computeIsRtlScrollbarOnLeft();
        }
        return isRtlScrollbarOnLeft;
    }
    function computeIsRtlScrollbarOnLeft() {
        var outerEl = createElement('div', {
            style: {
                position: 'absolute',
                top: -1000,
                left: 0,
                border: 0,
                padding: 0,
                overflow: 'scroll',
                direction: 'rtl'
            }
        }, '<div></div>');
        document.body.appendChild(outerEl);
        var innerEl = outerEl.firstChild;
        var res = innerEl.getBoundingClientRect().left > outerEl.getBoundingClientRect().left;
        removeElement(outerEl);
        return res;
    }
    // The scrollbar width computations in computeEdges are sometimes flawed when it comes to
    // retina displays, rounding, and IE11. Massage them into a usable value.
    function sanitizeScrollbarWidth(width) {
        width = Math.max(0, width); // no negatives
        width = Math.round(width);
        return width;
    }

    function computeEdges(el, getPadding) {
        if (getPadding === void 0) { getPadding = false; }
        var computedStyle = window.getComputedStyle(el);
        var borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0;
        var borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0;
        var borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
        var borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
        // must use offset(Width|Height) because compatible with client(Width|Height)
        var scrollbarLeftRight = sanitizeScrollbarWidth(el.offsetWidth - el.clientWidth - borderLeft - borderRight);
        var scrollbarBottom = sanitizeScrollbarWidth(el.offsetHeight - el.clientHeight - borderTop - borderBottom);
        var res = {
            borderLeft: borderLeft,
            borderRight: borderRight,
            borderTop: borderTop,
            borderBottom: borderBottom,
            scrollbarBottom: scrollbarBottom,
            scrollbarLeft: 0,
            scrollbarRight: 0
        };
        if (getIsRtlScrollbarOnLeft() && computedStyle.direction === 'rtl') { // is the scrollbar on the left side?
            res.scrollbarLeft = scrollbarLeftRight;
        }
        else {
            res.scrollbarRight = scrollbarLeftRight;
        }
        if (getPadding) {
            res.paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
            res.paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
            res.paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
            res.paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
        }
        return res;
    }
    function computeInnerRect(el, goWithinPadding) {
        if (goWithinPadding === void 0) { goWithinPadding = false; }
        var outerRect = computeRect(el);
        var edges = computeEdges(el, goWithinPadding);
        var res = {
            left: outerRect.left + edges.borderLeft + edges.scrollbarLeft,
            right: outerRect.right - edges.borderRight - edges.scrollbarRight,
            top: outerRect.top + edges.borderTop,
            bottom: outerRect.bottom - edges.borderBottom - edges.scrollbarBottom
        };
        if (goWithinPadding) {
            res.left += edges.paddingLeft;
            res.right -= edges.paddingRight;
            res.top += edges.paddingTop;
            res.bottom -= edges.paddingBottom;
        }
        return res;
    }
    function computeRect(el) {
        var rect = el.getBoundingClientRect();
        return {
            left: rect.left + window.pageXOffset,
            top: rect.top + window.pageYOffset,
            right: rect.right + window.pageXOffset,
            bottom: rect.bottom + window.pageYOffset
        };
    }
    function computeViewportRect() {
        return {
            left: window.pageXOffset,
            right: window.pageXOffset + document.documentElement.clientWidth,
            top: window.pageYOffset,
            bottom: window.pageYOffset + document.documentElement.clientHeight
        };
    }
    function computeHeightAndMargins(el) {
        return el.getBoundingClientRect().height + computeVMargins(el);
    }
    function computeVMargins(el) {
        var computed = window.getComputedStyle(el);
        return parseInt(computed.marginTop, 10) +
            parseInt(computed.marginBottom, 10);
    }
    // does not return window
    function getClippingParents(el) {
        var parents = [];
        while (el instanceof HTMLElement) { // will stop when gets to document or null
            var computedStyle = window.getComputedStyle(el);
            if (computedStyle.position === 'fixed') {
                break;
            }
            if ((/(auto|scroll)/).test(computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX)) {
                parents.push(el);
            }
            el = el.parentNode;
        }
        return parents;
    }
    function computeClippingRect(el) {
        return getClippingParents(el)
            .map(function (el) {
            return computeInnerRect(el);
        })
            .concat(computeViewportRect())
            .reduce(function (rect0, rect1) {
            return intersectRects(rect0, rect1) || rect1; // should always intersect
        });
    }

    // Stops a mouse/touch event from doing it's native browser action
    function preventDefault(ev) {
        ev.preventDefault();
    }
    // Event Delegation
    // ----------------------------------------------------------------------------------------------------------------
    function listenBySelector(container, eventType, selector, handler) {
        function realHandler(ev) {
            var matchedChild = elementClosest(ev.target, selector);
            if (matchedChild) {
                handler.call(matchedChild, ev, matchedChild);
            }
        }
        container.addEventListener(eventType, realHandler);
        return function () {
            container.removeEventListener(eventType, realHandler);
        };
    }
    function listenToHoverBySelector(container, selector, onMouseEnter, onMouseLeave) {
        var currentMatchedChild;
        return listenBySelector(container, 'mouseover', selector, function (ev, matchedChild) {
            if (matchedChild !== currentMatchedChild) {
                currentMatchedChild = matchedChild;
                onMouseEnter(ev, matchedChild);
                var realOnMouseLeave_1 = function (ev) {
                    currentMatchedChild = null;
                    onMouseLeave(ev, matchedChild);
                    matchedChild.removeEventListener('mouseleave', realOnMouseLeave_1);
                };
                // listen to the next mouseleave, and then unattach
                matchedChild.addEventListener('mouseleave', realOnMouseLeave_1);
            }
        });
    }
    // Animation
    // ----------------------------------------------------------------------------------------------------------------
    var transitionEventNames = [
        'webkitTransitionEnd',
        'otransitionend',
        'oTransitionEnd',
        'msTransitionEnd',
        'transitionend'
    ];
    // triggered only when the next single subsequent transition finishes
    function whenTransitionDone(el, callback) {
        var realCallback = function (ev) {
            callback(ev);
            transitionEventNames.forEach(function (eventName) {
                el.removeEventListener(eventName, realCallback);
            });
        };
        transitionEventNames.forEach(function (eventName) {
            el.addEventListener(eventName, realCallback); // cross-browser way to determine when the transition finishes
        });
    }

    var DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    // Adding
    function addWeeks(m, n) {
        var a = dateToUtcArray(m);
        a[2] += n * 7;
        return arrayToUtcDate(a);
    }
    function addDays(m, n) {
        var a = dateToUtcArray(m);
        a[2] += n;
        return arrayToUtcDate(a);
    }
    function addMs(m, n) {
        var a = dateToUtcArray(m);
        a[6] += n;
        return arrayToUtcDate(a);
    }
    // Diffing (all return floats)
    function diffWeeks(m0, m1) {
        return diffDays(m0, m1) / 7;
    }
    function diffDays(m0, m1) {
        return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60 * 24);
    }
    function diffHours(m0, m1) {
        return (m1.valueOf() - m0.valueOf()) / (1000 * 60 * 60);
    }
    function diffMinutes(m0, m1) {
        return (m1.valueOf() - m0.valueOf()) / (1000 * 60);
    }
    function diffSeconds(m0, m1) {
        return (m1.valueOf() - m0.valueOf()) / 1000;
    }
    function diffDayAndTime(m0, m1) {
        var m0day = startOfDay(m0);
        var m1day = startOfDay(m1);
        return {
            years: 0,
            months: 0,
            days: Math.round(diffDays(m0day, m1day)),
            milliseconds: (m1.valueOf() - m1day.valueOf()) - (m0.valueOf() - m0day.valueOf())
        };
    }
    // Diffing Whole Units
    function diffWholeWeeks(m0, m1) {
        var d = diffWholeDays(m0, m1);
        if (d !== null && d % 7 === 0) {
            return d / 7;
        }
        return null;
    }
    function diffWholeDays(m0, m1) {
        if (timeAsMs(m0) === timeAsMs(m1)) {
            return Math.round(diffDays(m0, m1));
        }
        return null;
    }
    // Start-Of
    function startOfDay(m) {
        return arrayToUtcDate([
            m.getUTCFullYear(),
            m.getUTCMonth(),
            m.getUTCDate()
        ]);
    }
    function startOfHour(m) {
        return arrayToUtcDate([
            m.getUTCFullYear(),
            m.getUTCMonth(),
            m.getUTCDate(),
            m.getUTCHours()
        ]);
    }
    function startOfMinute(m) {
        return arrayToUtcDate([
            m.getUTCFullYear(),
            m.getUTCMonth(),
            m.getUTCDate(),
            m.getUTCHours(),
            m.getUTCMinutes()
        ]);
    }
    function startOfSecond(m) {
        return arrayToUtcDate([
            m.getUTCFullYear(),
            m.getUTCMonth(),
            m.getUTCDate(),
            m.getUTCHours(),
            m.getUTCMinutes(),
            m.getUTCSeconds()
        ]);
    }
    // Week Computation
    function weekOfYear(marker, dow, doy) {
        var y = marker.getUTCFullYear();
        var w = weekOfGivenYear(marker, y, dow, doy);
        if (w < 1) {
            return weekOfGivenYear(marker, y - 1, dow, doy);
        }
        var nextW = weekOfGivenYear(marker, y + 1, dow, doy);
        if (nextW >= 1) {
            return Math.min(w, nextW);
        }
        return w;
    }
    function weekOfGivenYear(marker, year, dow, doy) {
        var firstWeekStart = arrayToUtcDate([year, 0, 1 + firstWeekOffset(year, dow, doy)]);
        var dayStart = startOfDay(marker);
        var days = Math.round(diffDays(firstWeekStart, dayStart));
        return Math.floor(days / 7) + 1; // zero-indexed
    }
    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        // first-week day -- which january is always in the first week (4 for iso, 1 for other)
        var fwd = 7 + dow - doy;
        // first-week day local weekday -- which local weekday is fwd
        var fwdlw = (7 + arrayToUtcDate([year, 0, fwd]).getUTCDay() - dow) % 7;
        return -fwdlw + fwd - 1;
    }
    // Array Conversion
    function dateToLocalArray(date) {
        return [
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        ];
    }
    function arrayToLocalDate(a) {
        return new Date(a[0], a[1] || 0, a[2] == null ? 1 : a[2], // day of month
        a[3] || 0, a[4] || 0, a[5] || 0);
    }
    function dateToUtcArray(date) {
        return [
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        ];
    }
    function arrayToUtcDate(a) {
        // according to web standards (and Safari), a month index is required.
        // massage if only given a year.
        if (a.length === 1) {
            a = a.concat([0]);
        }
        return new Date(Date.UTC.apply(Date, a));
    }
    // Other Utils
    function isValidDate(m) {
        return !isNaN(m.valueOf());
    }
    function timeAsMs(m) {
        return m.getUTCHours() * 1000 * 60 * 60 +
            m.getUTCMinutes() * 1000 * 60 +
            m.getUTCSeconds() * 1000 +
            m.getUTCMilliseconds();
    }

    var INTERNAL_UNITS = ['years', 'months', 'days', 'milliseconds'];
    var PARSE_RE = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/;
    // Parsing and Creation
    function createDuration(input, unit) {
        var _a;
        if (typeof input === 'string') {
            return parseString(input);
        }
        else if (typeof input === 'object' && input) { // non-null object
            return normalizeObject(input);
        }
        else if (typeof input === 'number') {
            return normalizeObject((_a = {}, _a[unit || 'milliseconds'] = input, _a));
        }
        else {
            return null;
        }
    }
    function parseString(s) {
        var m = PARSE_RE.exec(s);
        if (m) {
            var sign = m[1] ? -1 : 1;
            return {
                years: 0,
                months: 0,
                days: sign * (m[2] ? parseInt(m[2], 10) : 0),
                milliseconds: sign * ((m[3] ? parseInt(m[3], 10) : 0) * 60 * 60 * 1000 + // hours
                    (m[4] ? parseInt(m[4], 10) : 0) * 60 * 1000 + // minutes
                    (m[5] ? parseInt(m[5], 10) : 0) * 1000 + // seconds
                    (m[6] ? parseInt(m[6], 10) : 0) // ms
                )
            };
        }
        return null;
    }
    function normalizeObject(obj) {
        return {
            years: obj.years || obj.year || 0,
            months: obj.months || obj.month || 0,
            days: (obj.days || obj.day || 0) +
                getWeeksFromInput(obj) * 7,
            milliseconds: (obj.hours || obj.hour || 0) * 60 * 60 * 1000 + // hours
                (obj.minutes || obj.minute || 0) * 60 * 1000 + // minutes
                (obj.seconds || obj.second || 0) * 1000 + // seconds
                (obj.milliseconds || obj.millisecond || obj.ms || 0) // ms
        };
    }
    function getWeeksFromInput(obj) {
        return obj.weeks || obj.week || 0;
    }
    // Equality
    function durationsEqual(d0, d1) {
        return d0.years === d1.years &&
            d0.months === d1.months &&
            d0.days === d1.days &&
            d0.milliseconds === d1.milliseconds;
    }
    function isSingleDay(dur) {
        return dur.years === 0 && dur.months === 0 && dur.days === 1 && dur.milliseconds === 0;
    }
    // Simple Math
    function addDurations(d0, d1) {
        return {
            years: d0.years + d1.years,
            months: d0.months + d1.months,
            days: d0.days + d1.days,
            milliseconds: d0.milliseconds + d1.milliseconds
        };
    }
    function subtractDurations(d1, d0) {
        return {
            years: d1.years - d0.years,
            months: d1.months - d0.months,
            days: d1.days - d0.days,
            milliseconds: d1.milliseconds - d0.milliseconds
        };
    }
    function multiplyDuration(d, n) {
        return {
            years: d.years * n,
            months: d.months * n,
            days: d.days * n,
            milliseconds: d.milliseconds * n
        };
    }
    // Conversions
    // "Rough" because they are based on average-case Gregorian months/years
    function asRoughYears(dur) {
        return asRoughDays(dur) / 365;
    }
    function asRoughMonths(dur) {
        return asRoughDays(dur) / 30;
    }
    function asRoughDays(dur) {
        return asRoughMs(dur) / 864e5;
    }
    function asRoughMinutes(dur) {
        return asRoughMs(dur) / (1000 * 60);
    }
    function asRoughSeconds(dur) {
        return asRoughMs(dur) / 1000;
    }
    function asRoughMs(dur) {
        return dur.years * (365 * 864e5) +
            dur.months * (30 * 864e5) +
            dur.days * 864e5 +
            dur.milliseconds;
    }
    // Advanced Math
    function wholeDivideDurations(numerator, denominator) {
        var res = null;
        for (var i = 0; i < INTERNAL_UNITS.length; i++) {
            var unit = INTERNAL_UNITS[i];
            if (denominator[unit]) {
                var localRes = numerator[unit] / denominator[unit];
                if (!isInt(localRes) || (res !== null && res !== localRes)) {
                    return null;
                }
                res = localRes;
            }
            else if (numerator[unit]) {
                // needs to divide by something but can't!
                return null;
            }
        }
        return res;
    }
    function greatestDurationDenominator(dur, dontReturnWeeks) {
        var ms = dur.milliseconds;
        if (ms) {
            if (ms % 1000 !== 0) {
                return { unit: 'millisecond', value: ms };
            }
            if (ms % (1000 * 60) !== 0) {
                return { unit: 'second', value: ms / 1000 };
            }
            if (ms % (1000 * 60 * 60) !== 0) {
                return { unit: 'minute', value: ms / (1000 * 60) };
            }
            if (ms) {
                return { unit: 'hour', value: ms / (1000 * 60 * 60) };
            }
        }
        if (dur.days) {
            if (!dontReturnWeeks && dur.days % 7 === 0) {
                return { unit: 'week', value: dur.days / 7 };
            }
            return { unit: 'day', value: dur.days };
        }
        if (dur.months) {
            return { unit: 'month', value: dur.months };
        }
        if (dur.years) {
            return { unit: 'year', value: dur.years };
        }
        return { unit: 'millisecond', value: 0 };
    }

    /* FullCalendar-specific DOM Utilities
    ----------------------------------------------------------------------------------------------------------------------*/
    // Given the scrollbar widths of some other container, create borders/margins on rowEls in order to match the left
    // and right space that was offset by the scrollbars. A 1-pixel border first, then margin beyond that.
    function compensateScroll(rowEl, scrollbarWidths) {
        if (scrollbarWidths.left) {
            applyStyle(rowEl, {
                borderLeftWidth: 1,
                marginLeft: scrollbarWidths.left - 1
            });
        }
        if (scrollbarWidths.right) {
            applyStyle(rowEl, {
                borderRightWidth: 1,
                marginRight: scrollbarWidths.right - 1
            });
        }
    }
    // Undoes compensateScroll and restores all borders/margins
    function uncompensateScroll(rowEl) {
        applyStyle(rowEl, {
            marginLeft: '',
            marginRight: '',
            borderLeftWidth: '',
            borderRightWidth: ''
        });
    }
    // Make the mouse cursor express that an event is not allowed in the current area
    function disableCursor() {
        document.body.classList.add('fc-not-allowed');
    }
    // Returns the mouse cursor to its original look
    function enableCursor() {
        document.body.classList.remove('fc-not-allowed');
    }
    // Given a total available height to fill, have `els` (essentially child rows) expand to accomodate.
    // By default, all elements that are shorter than the recommended height are expanded uniformly, not considering
    // any other els that are already too tall. if `shouldRedistribute` is on, it considers these tall rows and
    // reduces the available height.
    function distributeHeight(els, availableHeight, shouldRedistribute) {
        // *FLOORING NOTE*: we floor in certain places because zoom can give inaccurate floating-point dimensions,
        // and it is better to be shorter than taller, to avoid creating unnecessary scrollbars.
        var minOffset1 = Math.floor(availableHeight / els.length); // for non-last element
        var minOffset2 = Math.floor(availableHeight - minOffset1 * (els.length - 1)); // for last element *FLOORING NOTE*
        var flexEls = []; // elements that are allowed to expand. array of DOM nodes
        var flexOffsets = []; // amount of vertical space it takes up
        var flexHeights = []; // actual css height
        var usedHeight = 0;
        undistributeHeight(els); // give all elements their natural height
        // find elements that are below the recommended height (expandable).
        // important to query for heights in a single first pass (to avoid reflow oscillation).
        els.forEach(function (el, i) {
            var minOffset = i === els.length - 1 ? minOffset2 : minOffset1;
            var naturalHeight = el.getBoundingClientRect().height;
            var naturalOffset = naturalHeight + computeVMargins(el);
            if (naturalOffset < minOffset) {
                flexEls.push(el);
                flexOffsets.push(naturalOffset);
                flexHeights.push(naturalHeight);
            }
            else {
                // this element stretches past recommended height (non-expandable). mark the space as occupied.
                usedHeight += naturalOffset;
            }
        });
        // readjust the recommended height to only consider the height available to non-maxed-out rows.
        if (shouldRedistribute) {
            availableHeight -= usedHeight;
            minOffset1 = Math.floor(availableHeight / flexEls.length);
            minOffset2 = Math.floor(availableHeight - minOffset1 * (flexEls.length - 1)); // *FLOORING NOTE*
        }
        // assign heights to all expandable elements
        flexEls.forEach(function (el, i) {
            var minOffset = i === flexEls.length - 1 ? minOffset2 : minOffset1;
            var naturalOffset = flexOffsets[i];
            var naturalHeight = flexHeights[i];
            var newHeight = minOffset - (naturalOffset - naturalHeight); // subtract the margin/padding
            if (naturalOffset < minOffset) { // we check this again because redistribution might have changed things
                el.style.height = newHeight + 'px';
            }
        });
    }
    // Undoes distrubuteHeight, restoring all els to their natural height
    function undistributeHeight(els) {
        els.forEach(function (el) {
            el.style.height = '';
        });
    }
    // Given `els`, a set of <td> cells, find the cell with the largest natural width and set the widths of all the
    // cells to be that width.
    // PREREQUISITE: if you want a cell to take up width, it needs to have a single inner element w/ display:inline
    function matchCellWidths(els) {
        var maxInnerWidth = 0;
        els.forEach(function (el) {
            var innerEl = el.firstChild; // hopefully an element
            if (innerEl instanceof HTMLElement) {
                var innerWidth_1 = innerEl.getBoundingClientRect().width;
                if (innerWidth_1 > maxInnerWidth) {
                    maxInnerWidth = innerWidth_1;
                }
            }
        });
        maxInnerWidth++; // sometimes not accurate of width the text needs to stay on one line. insurance
        els.forEach(function (el) {
            el.style.width = maxInnerWidth + 'px';
        });
        return maxInnerWidth;
    }
    // Given one element that resides inside another,
    // Subtracts the height of the inner element from the outer element.
    function subtractInnerElHeight(outerEl, innerEl) {
        // effin' IE8/9/10/11 sometimes returns 0 for dimensions. this weird hack was the only thing that worked
        var reflowStyleProps = {
            position: 'relative',
            left: -1 // ensure reflow in case the el was already relative. negative is less likely to cause new scroll
        };
        applyStyle(outerEl, reflowStyleProps);
        applyStyle(innerEl, reflowStyleProps);
        var diff = // grab the dimensions
         outerEl.getBoundingClientRect().height -
            innerEl.getBoundingClientRect().height;
        // undo hack
        var resetStyleProps = { position: '', left: '' };
        applyStyle(outerEl, resetStyleProps);
        applyStyle(innerEl, resetStyleProps);
        return diff;
    }
    /* Selection
    ----------------------------------------------------------------------------------------------------------------------*/
    function preventSelection(el) {
        el.classList.add('fc-unselectable');
        el.addEventListener('selectstart', preventDefault);
    }
    function allowSelection(el) {
        el.classList.remove('fc-unselectable');
        el.removeEventListener('selectstart', preventDefault);
    }
    /* Context Menu
    ----------------------------------------------------------------------------------------------------------------------*/
    function preventContextMenu(el) {
        el.addEventListener('contextmenu', preventDefault);
    }
    function allowContextMenu(el) {
        el.removeEventListener('contextmenu', preventDefault);
    }
    /* Object Ordering by Field
    ----------------------------------------------------------------------------------------------------------------------*/
    function parseFieldSpecs(input) {
        var specs = [];
        var tokens = [];
        var i;
        var token;
        if (typeof input === 'string') {
            tokens = input.split(/\s*,\s*/);
        }
        else if (typeof input === 'function') {
            tokens = [input];
        }
        else if (Array.isArray(input)) {
            tokens = input;
        }
        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            if (typeof token === 'string') {
                specs.push(token.charAt(0) === '-' ?
                    { field: token.substring(1), order: -1 } :
                    { field: token, order: 1 });
            }
            else if (typeof token === 'function') {
                specs.push({ func: token });
            }
        }
        return specs;
    }
    function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
        var i;
        var cmp;
        for (i = 0; i < fieldSpecs.length; i++) {
            cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i]);
            if (cmp) {
                return cmp;
            }
        }
        return 0;
    }
    function compareByFieldSpec(obj0, obj1, fieldSpec) {
        if (fieldSpec.func) {
            return fieldSpec.func(obj0, obj1);
        }
        return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field])
            * (fieldSpec.order || 1);
    }
    function flexibleCompare(a, b) {
        if (!a && !b) {
            return 0;
        }
        if (b == null) {
            return -1;
        }
        if (a == null) {
            return 1;
        }
        if (typeof a === 'string' || typeof b === 'string') {
            return String(a).localeCompare(String(b));
        }
        return a - b;
    }
    /* String Utilities
    ----------------------------------------------------------------------------------------------------------------------*/
    function capitaliseFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function padStart(val, len) {
        var s = String(val);
        return '000'.substr(0, len - s.length) + s;
    }
    /* Number Utilities
    ----------------------------------------------------------------------------------------------------------------------*/
    function compareNumbers(a, b) {
        return a - b;
    }
    function isInt(n) {
        return n % 1 === 0;
    }
    /* Weird Utilities
    ----------------------------------------------------------------------------------------------------------------------*/
    function applyAll(functions, thisObj, args) {
        if (typeof functions === 'function') { // supplied a single function
            functions = [functions];
        }
        if (functions) {
            var i = void 0;
            var ret = void 0;
            for (i = 0; i < functions.length; i++) {
                ret = functions[i].apply(thisObj, args) || ret;
            }
            return ret;
        }
    }
    function firstDefined() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            if (args[i] !== undefined) {
                return args[i];
            }
        }
    }
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    // https://github.com/jashkenas/underscore/blob/1.6.0/underscore.js#L714
    function debounce(func, wait) {
        var timeout;
        var args;
        var context;
        var timestamp;
        var result;
        var later = function () {
            var last = new Date().valueOf() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            }
            else {
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            }
        };
        return function () {
            context = this;
            args = arguments;
            timestamp = new Date().valueOf();
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            return result;
        };
    }
    // Number and Boolean are only types that defaults or not computed for
    // TODO: write more comments
    function refineProps(rawProps, processors, defaults, leftoverProps) {
        if (defaults === void 0) { defaults = {}; }
        var refined = {};
        for (var key in processors) {
            var processor = processors[key];
            if (rawProps[key] !== undefined) {
                // found
                if (processor === Function) {
                    refined[key] = typeof rawProps[key] === 'function' ? rawProps[key] : null;
                }
                else if (processor) { // a refining function?
                    refined[key] = processor(rawProps[key]);
                }
                else {
                    refined[key] = rawProps[key];
                }
            }
            else if (defaults[key] !== undefined) {
                // there's an explicit default
                refined[key] = defaults[key];
            }
            else {
                // must compute a default
                if (processor === String) {
                    refined[key] = ''; // empty string is default for String
                }
                else if (!processor || processor === Number || processor === Boolean || processor === Function) {
                    refined[key] = null; // assign null for other non-custom processor funcs
                }
                else {
                    refined[key] = processor(null); // run the custom processor func
                }
            }
        }
        if (leftoverProps) {
            for (var key in rawProps) {
                if (processors[key] === undefined) {
                    leftoverProps[key] = rawProps[key];
                }
            }
        }
        return refined;
    }
    /* Date stuff that doesn't belong in datelib core
    ----------------------------------------------------------------------------------------------------------------------*/
    // given a timed range, computes an all-day range that has the same exact duration,
    // but whose start time is aligned with the start of the day.
    function computeAlignedDayRange(timedRange) {
        var dayCnt = Math.floor(diffDays(timedRange.start, timedRange.end)) || 1;
        var start = startOfDay(timedRange.start);
        var end = addDays(start, dayCnt);
        return { start: start, end: end };
    }
    // given a timed range, computes an all-day range based on how for the end date bleeds into the next day
    // TODO: give nextDayThreshold a default arg
    function computeVisibleDayRange(timedRange, nextDayThreshold) {
        if (nextDayThreshold === void 0) { nextDayThreshold = createDuration(0); }
        var startDay = null;
        var endDay = null;
        if (timedRange.end) {
            endDay = startOfDay(timedRange.end);
            var endTimeMS = timedRange.end.valueOf() - endDay.valueOf(); // # of milliseconds into `endDay`
            // If the end time is actually inclusively part of the next day and is equal to or
            // beyond the next day threshold, adjust the end to be the exclusive end of `endDay`.
            // Otherwise, leaving it as inclusive will cause it to exclude `endDay`.
            if (endTimeMS && endTimeMS >= asRoughMs(nextDayThreshold)) {
                endDay = addDays(endDay, 1);
            }
        }
        if (timedRange.start) {
            startDay = startOfDay(timedRange.start); // the beginning of the day the range starts
            // If end is within `startDay` but not past nextDayThreshold, assign the default duration of one day.
            if (endDay && endDay <= startDay) {
                endDay = addDays(startDay, 1);
            }
        }
        return { start: startDay, end: endDay };
    }
    // spans from one day into another?
    function isMultiDayRange(range) {
        var visibleRange = computeVisibleDayRange(range);
        return diffDays(visibleRange.start, visibleRange.end) > 1;
    }
    function diffDates(date0, date1, dateEnv, largeUnit) {
        if (largeUnit === 'year') {
            return createDuration(dateEnv.diffWholeYears(date0, date1), 'year');
        }
        else if (largeUnit === 'month') {
            return createDuration(dateEnv.diffWholeMonths(date0, date1), 'month');
        }
        else {
            return diffDayAndTime(date0, date1); // returns a duration
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function parseRecurring(eventInput, allDayDefault, dateEnv, recurringTypes, leftovers) {
        for (var i = 0; i < recurringTypes.length; i++) {
            var localLeftovers = {};
            var parsed = recurringTypes[i].parse(eventInput, localLeftovers, dateEnv);
            if (parsed) {
                var allDay = localLeftovers.allDay;
                delete localLeftovers.allDay; // remove from leftovers
                if (allDay == null) {
                    allDay = allDayDefault;
                    if (allDay == null) {
                        allDay = parsed.allDayGuess;
                        if (allDay == null) {
                            allDay = false;
                        }
                    }
                }
                __assign(leftovers, localLeftovers);
                return {
                    allDay: allDay,
                    duration: parsed.duration,
                    typeData: parsed.typeData,
                    typeId: i
                };
            }
        }
        return null;
    }
    /*
    Event MUST have a recurringDef
    */
    function expandRecurringRanges(eventDef, duration, framingRange, dateEnv, recurringTypes) {
        var typeDef = recurringTypes[eventDef.recurringDef.typeId];
        var markers = typeDef.expand(eventDef.recurringDef.typeData, {
            start: dateEnv.subtract(framingRange.start, duration),
            end: framingRange.end
        }, dateEnv);
        // the recurrence plugins don't guarantee that all-day events are start-of-day, so we have to
        if (eventDef.allDay) {
            markers = markers.map(startOfDay);
        }
        return markers;
    }

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    // Merges an array of objects into a single object.
    // The second argument allows for an array of property names who's object values will be merged together.
    function mergeProps(propObjs, complexProps) {
        var dest = {};
        var i;
        var name;
        var complexObjs;
        var j;
        var val;
        var props;
        if (complexProps) {
            for (i = 0; i < complexProps.length; i++) {
                name = complexProps[i];
                complexObjs = [];
                // collect the trailing object values, stopping when a non-object is discovered
                for (j = propObjs.length - 1; j >= 0; j--) {
                    val = propObjs[j][name];
                    if (typeof val === 'object' && val) { // non-null object
                        complexObjs.unshift(val);
                    }
                    else if (val !== undefined) {
                        dest[name] = val; // if there were no objects, this value will be used
                        break;
                    }
                }
                // if the trailing values were objects, use the merged value
                if (complexObjs.length) {
                    dest[name] = mergeProps(complexObjs);
                }
            }
        }
        // copy values into the destination, going from last to first
        for (i = propObjs.length - 1; i >= 0; i--) {
            props = propObjs[i];
            for (name in props) {
                if (!(name in dest)) { // if already assigned by previous props or complex props, don't reassign
                    dest[name] = props[name];
                }
            }
        }
        return dest;
    }
    function filterHash(hash, func) {
        var filtered = {};
        for (var key in hash) {
            if (func(hash[key], key)) {
                filtered[key] = hash[key];
            }
        }
        return filtered;
    }
    function mapHash(hash, func) {
        var newHash = {};
        for (var key in hash) {
            newHash[key] = func(hash[key], key);
        }
        return newHash;
    }
    function arrayToHash(a) {
        var hash = {};
        for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
            var item = a_1[_i];
            hash[item] = true;
        }
        return hash;
    }
    function hashValuesToArray(obj) {
        var a = [];
        for (var key in obj) {
            a.push(obj[key]);
        }
        return a;
    }
    function isPropsEqual(obj0, obj1) {
        for (var key in obj0) {
            if (hasOwnProperty.call(obj0, key)) {
                if (!(key in obj1)) {
                    return false;
                }
            }
        }
        for (var key in obj1) {
            if (hasOwnProperty.call(obj1, key)) {
                if (obj0[key] !== obj1[key]) {
                    return false;
                }
            }
        }
        return true;
    }

    function parseEvents(rawEvents, sourceId, calendar, allowOpenRange) {
        var eventStore = createEmptyEventStore();
        for (var _i = 0, rawEvents_1 = rawEvents; _i < rawEvents_1.length; _i++) {
            var rawEvent = rawEvents_1[_i];
            var tuple = parseEvent(rawEvent, sourceId, calendar, allowOpenRange);
            if (tuple) {
                eventTupleToStore(tuple, eventStore);
            }
        }
        return eventStore;
    }
    function eventTupleToStore(tuple, eventStore) {
        if (eventStore === void 0) { eventStore = createEmptyEventStore(); }
        eventStore.defs[tuple.def.defId] = tuple.def;
        if (tuple.instance) {
            eventStore.instances[tuple.instance.instanceId] = tuple.instance;
        }
        return eventStore;
    }
    function expandRecurring(eventStore, framingRange, calendar) {
        var dateEnv = calendar.dateEnv;
        var defs = eventStore.defs, instances = eventStore.instances;
        // remove existing recurring instances
        instances = filterHash(instances, function (instance) {
            return !defs[instance.defId].recurringDef;
        });
        for (var defId in defs) {
            var def = defs[defId];
            if (def.recurringDef) {
                var duration = def.recurringDef.duration;
                if (!duration) {
                    duration = def.allDay ?
                        calendar.defaultAllDayEventDuration :
                        calendar.defaultTimedEventDuration;
                }
                var starts = expandRecurringRanges(def, duration, framingRange, calendar.dateEnv, calendar.pluginSystem.hooks.recurringTypes);
                for (var _i = 0, starts_1 = starts; _i < starts_1.length; _i++) {
                    var start = starts_1[_i];
                    var instance = createEventInstance(defId, {
                        start: start,
                        end: dateEnv.add(start, duration)
                    });
                    instances[instance.instanceId] = instance;
                }
            }
        }
        return { defs: defs, instances: instances };
    }
    // retrieves events that have the same groupId as the instance specified by `instanceId`
    // or they are the same as the instance.
    // why might instanceId not be in the store? an event from another calendar?
    function getRelevantEvents(eventStore, instanceId) {
        var instance = eventStore.instances[instanceId];
        if (instance) {
            var def_1 = eventStore.defs[instance.defId];
            // get events/instances with same group
            var newStore = filterEventStoreDefs(eventStore, function (lookDef) {
                return isEventDefsGrouped(def_1, lookDef);
            });
            // add the original
            // TODO: wish we could use eventTupleToStore or something like it
            newStore.defs[def_1.defId] = def_1;
            newStore.instances[instance.instanceId] = instance;
            return newStore;
        }
        return createEmptyEventStore();
    }
    function isEventDefsGrouped(def0, def1) {
        return Boolean(def0.groupId && def0.groupId === def1.groupId);
    }
    function transformRawEvents(rawEvents, eventSource, calendar) {
        var calEachTransform = calendar.opt('eventDataTransform');
        var sourceEachTransform = eventSource ? eventSource.eventDataTransform : null;
        if (sourceEachTransform) {
            rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform);
        }
        if (calEachTransform) {
            rawEvents = transformEachRawEvent(rawEvents, calEachTransform);
        }
        return rawEvents;
    }
    function transformEachRawEvent(rawEvents, func) {
        var refinedEvents;
        if (!func) {
            refinedEvents = rawEvents;
        }
        else {
            refinedEvents = [];
            for (var _i = 0, rawEvents_2 = rawEvents; _i < rawEvents_2.length; _i++) {
                var rawEvent = rawEvents_2[_i];
                var refinedEvent = func(rawEvent);
                if (refinedEvent) {
                    refinedEvents.push(refinedEvent);
                }
                else if (refinedEvent == null) {
                    refinedEvents.push(rawEvent);
                } // if a different falsy value, do nothing
            }
        }
        return refinedEvents;
    }
    function createEmptyEventStore() {
        return { defs: {}, instances: {} };
    }
    function mergeEventStores(store0, store1) {
        return {
            defs: __assign({}, store0.defs, store1.defs),
            instances: __assign({}, store0.instances, store1.instances)
        };
    }
    function filterEventStoreDefs(eventStore, filterFunc) {
        var defs = filterHash(eventStore.defs, filterFunc);
        var instances = filterHash(eventStore.instances, function (instance) {
            return defs[instance.defId]; // still exists?
        });
        return { defs: defs, instances: instances };
    }

    function parseRange(input, dateEnv) {
        var start = null;
        var end = null;
        if (input.start) {
            start = dateEnv.createMarker(input.start);
        }
        if (input.end) {
            end = dateEnv.createMarker(input.end);
        }
        if (!start && !end) {
            return null;
        }
        if (start && end && end < start) {
            return null;
        }
        return { start: start, end: end };
    }
    // SIDE-EFFECT: will mutate ranges.
    // Will return a new array result.
    function invertRanges(ranges, constraintRange) {
        var invertedRanges = [];
        var start = constraintRange.start; // the end of the previous range. the start of the new range
        var i;
        var dateRange;
        // ranges need to be in order. required for our date-walking algorithm
        ranges.sort(compareRanges);
        for (i = 0; i < ranges.length; i++) {
            dateRange = ranges[i];
            // add the span of time before the event (if there is any)
            if (dateRange.start > start) { // compare millisecond time (skip any ambig logic)
                invertedRanges.push({ start: start, end: dateRange.start });
            }
            if (dateRange.end > start) {
                start = dateRange.end;
            }
        }
        // add the span of time after the last event (if there is any)
        if (start < constraintRange.end) { // compare millisecond time (skip any ambig logic)
            invertedRanges.push({ start: start, end: constraintRange.end });
        }
        return invertedRanges;
    }
    function compareRanges(range0, range1) {
        return range0.start.valueOf() - range1.start.valueOf(); // earlier ranges go first
    }
    function intersectRanges(range0, range1) {
        var start = range0.start;
        var end = range0.end;
        var newRange = null;
        if (range1.start !== null) {
            if (start === null) {
                start = range1.start;
            }
            else {
                start = new Date(Math.max(start.valueOf(), range1.start.valueOf()));
            }
        }
        if (range1.end != null) {
            if (end === null) {
                end = range1.end;
            }
            else {
                end = new Date(Math.min(end.valueOf(), range1.end.valueOf()));
            }
        }
        if (start === null || end === null || start < end) {
            newRange = { start: start, end: end };
        }
        return newRange;
    }
    function rangesEqual(range0, range1) {
        return (range0.start === null ? null : range0.start.valueOf()) === (range1.start === null ? null : range1.start.valueOf()) &&
            (range0.end === null ? null : range0.end.valueOf()) === (range1.end === null ? null : range1.end.valueOf());
    }
    function rangesIntersect(range0, range1) {
        return (range0.end === null || range1.start === null || range0.end > range1.start) &&
            (range0.start === null || range1.end === null || range0.start < range1.end);
    }
    function rangeContainsRange(outerRange, innerRange) {
        return (outerRange.start === null || (innerRange.start !== null && innerRange.start >= outerRange.start)) &&
            (outerRange.end === null || (innerRange.end !== null && innerRange.end <= outerRange.end));
    }
    function rangeContainsMarker(range, date) {
        return (range.start === null || date >= range.start) &&
            (range.end === null || date < range.end);
    }
    // If the given date is not within the given range, move it inside.
    // (If it's past the end, make it one millisecond before the end).
    function constrainMarkerToRange(date, range) {
        if (range.start != null && date < range.start) {
            return range.start;
        }
        if (range.end != null && date >= range.end) {
            return new Date(range.end.valueOf() - 1);
        }
        return date;
    }

    function removeExact(array, exactVal) {
        var removeCnt = 0;
        var i = 0;
        while (i < array.length) {
            if (array[i] === exactVal) {
                array.splice(i, 1);
                removeCnt++;
            }
            else {
                i++;
            }
        }
        return removeCnt;
    }
    function isArraysEqual(a0, a1) {
        var len = a0.length;
        var i;
        if (len !== a1.length) { // not array? or not same length?
            return false;
        }
        for (i = 0; i < len; i++) {
            if (a0[i] !== a1[i]) {
                return false;
            }
        }
        return true;
    }

    function memoize(workerFunc) {
        var args;
        var res;
        return function () {
            if (!args || !isArraysEqual(args, arguments)) {
                args = arguments;
                res = workerFunc.apply(this, arguments);
            }
            return res;
        };
    }
    /*
    always executes the workerFunc, but if the result is equal to the previous result,
    return the previous result instead.
    */
    function memoizeOutput(workerFunc, equalityFunc) {
        var cachedRes = null;
        return function () {
            var newRes = workerFunc.apply(this, arguments);
            if (cachedRes === null || !(cachedRes === newRes || equalityFunc(cachedRes, newRes))) {
                cachedRes = newRes;
            }
            return cachedRes;
        };
    }

    var EXTENDED_SETTINGS_AND_SEVERITIES = {
        week: 3,
        separator: 0,
        omitZeroMinute: 0,
        meridiem: 0,
        omitCommas: 0
    };
    var STANDARD_DATE_PROP_SEVERITIES = {
        timeZoneName: 7,
        era: 6,
        year: 5,
        month: 4,
        day: 2,
        weekday: 2,
        hour: 1,
        minute: 1,
        second: 1
    };
    var MERIDIEM_RE = /\s*([ap])\.?m\.?/i; // eats up leading spaces too
    var COMMA_RE = /,/g; // we need re for globalness
    var MULTI_SPACE_RE = /\s+/g;
    var LTR_RE = /\u200e/g; // control character
    var UTC_RE = /UTC|GMT/;
    var NativeFormatter = /** @class */ (function () {
        function NativeFormatter(formatSettings) {
            var standardDateProps = {};
            var extendedSettings = {};
            var severity = 0;
            for (var name_1 in formatSettings) {
                if (name_1 in EXTENDED_SETTINGS_AND_SEVERITIES) {
                    extendedSettings[name_1] = formatSettings[name_1];
                    severity = Math.max(EXTENDED_SETTINGS_AND_SEVERITIES[name_1], severity);
                }
                else {
                    standardDateProps[name_1] = formatSettings[name_1];
                    if (name_1 in STANDARD_DATE_PROP_SEVERITIES) {
                        severity = Math.max(STANDARD_DATE_PROP_SEVERITIES[name_1], severity);
                    }
                }
            }
            this.standardDateProps = standardDateProps;
            this.extendedSettings = extendedSettings;
            this.severity = severity;
            this.buildFormattingFunc = memoize(buildFormattingFunc);
        }
        NativeFormatter.prototype.format = function (date, context) {
            return this.buildFormattingFunc(this.standardDateProps, this.extendedSettings, context)(date);
        };
        NativeFormatter.prototype.formatRange = function (start, end, context) {
            var _a = this, standardDateProps = _a.standardDateProps, extendedSettings = _a.extendedSettings;
            var diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, context.calendarSystem);
            if (!diffSeverity) {
                return this.format(start, context);
            }
            var biggestUnitForPartial = diffSeverity;
            if (biggestUnitForPartial > 1 && // the two dates are different in a way that's larger scale than time
                (standardDateProps.year === 'numeric' || standardDateProps.year === '2-digit') &&
                (standardDateProps.month === 'numeric' || standardDateProps.month === '2-digit') &&
                (standardDateProps.day === 'numeric' || standardDateProps.day === '2-digit')) {
                biggestUnitForPartial = 1; // make it look like the dates are only different in terms of time
            }
            var full0 = this.format(start, context);
            var full1 = this.format(end, context);
            if (full0 === full1) {
                return full0;
            }
            var partialDateProps = computePartialFormattingOptions(standardDateProps, biggestUnitForPartial);
            var partialFormattingFunc = buildFormattingFunc(partialDateProps, extendedSettings, context);
            var partial0 = partialFormattingFunc(start);
            var partial1 = partialFormattingFunc(end);
            var insertion = findCommonInsertion(full0, partial0, full1, partial1);
            var separator = extendedSettings.separator || '';
            if (insertion) {
                return insertion.before + partial0 + separator + partial1 + insertion.after;
            }
            return full0 + separator + full1;
        };
        NativeFormatter.prototype.getLargestUnit = function () {
            switch (this.severity) {
                case 7:
                case 6:
                case 5:
                    return 'year';
                case 4:
                    return 'month';
                case 3:
                    return 'week';
                default:
                    return 'day';
            }
        };
        return NativeFormatter;
    }());
    function buildFormattingFunc(standardDateProps, extendedSettings, context) {
        var standardDatePropCnt = Object.keys(standardDateProps).length;
        if (standardDatePropCnt === 1 && standardDateProps.timeZoneName === 'short') {
            return function (date) {
                return formatTimeZoneOffset(date.timeZoneOffset);
            };
        }
        if (standardDatePropCnt === 0 && extendedSettings.week) {
            return function (date) {
                return formatWeekNumber(context.computeWeekNumber(date.marker), context.weekLabel, context.locale, extendedSettings.week);
            };
        }
        return buildNativeFormattingFunc(standardDateProps, extendedSettings, context);
    }
    function buildNativeFormattingFunc(standardDateProps, extendedSettings, context) {
        standardDateProps = __assign({}, standardDateProps); // copy
        extendedSettings = __assign({}, extendedSettings); // copy
        sanitizeSettings(standardDateProps, extendedSettings);
        standardDateProps.timeZone = 'UTC'; // we leverage the only guaranteed timeZone for our UTC markers
        var normalFormat = new Intl.DateTimeFormat(context.locale.codes, standardDateProps);
        var zeroFormat; // needed?
        if (extendedSettings.omitZeroMinute) {
            var zeroProps = __assign({}, standardDateProps);
            delete zeroProps.minute; // seconds and ms were already considered in sanitizeSettings
            zeroFormat = new Intl.DateTimeFormat(context.locale.codes, zeroProps);
        }
        return function (date) {
            var marker = date.marker;
            var format;
            if (zeroFormat && !marker.getUTCMinutes()) {
                format = zeroFormat;
            }
            else {
                format = normalFormat;
            }
            var s = format.format(marker);
            return postProcess(s, date, standardDateProps, extendedSettings, context);
        };
    }
    function sanitizeSettings(standardDateProps, extendedSettings) {
        // deal with a browser inconsistency where formatting the timezone
        // requires that the hour/minute be present.
        if (standardDateProps.timeZoneName) {
            if (!standardDateProps.hour) {
                standardDateProps.hour = '2-digit';
            }
            if (!standardDateProps.minute) {
                standardDateProps.minute = '2-digit';
            }
        }
        // only support short timezone names
        if (standardDateProps.timeZoneName === 'long') {
            standardDateProps.timeZoneName = 'short';
        }
        // if requesting to display seconds, MUST display minutes
        if (extendedSettings.omitZeroMinute && (standardDateProps.second || standardDateProps.millisecond)) {
            delete extendedSettings.omitZeroMinute;
        }
    }
    function postProcess(s, date, standardDateProps, extendedSettings, context) {
        s = s.replace(LTR_RE, ''); // remove left-to-right control chars. do first. good for other regexes
        if (standardDateProps.timeZoneName === 'short') {
            s = injectTzoStr(s, (context.timeZone === 'UTC' || date.timeZoneOffset == null) ?
                'UTC' : // important to normalize for IE, which does "GMT"
                formatTimeZoneOffset(date.timeZoneOffset));
        }
        if (extendedSettings.omitCommas) {
            s = s.replace(COMMA_RE, '').trim();
        }
        if (extendedSettings.omitZeroMinute) {
            s = s.replace(':00', ''); // zeroFormat doesn't always achieve this
        }
        // ^ do anything that might create adjacent spaces before this point,
        // because MERIDIEM_RE likes to eat up loading spaces
        if (extendedSettings.meridiem === false) {
            s = s.replace(MERIDIEM_RE, '').trim();
        }
        else if (extendedSettings.meridiem === 'narrow') { // a/p
            s = s.replace(MERIDIEM_RE, function (m0, m1) {
                return m1.toLocaleLowerCase();
            });
        }
        else if (extendedSettings.meridiem === 'short') { // am/pm
            s = s.replace(MERIDIEM_RE, function (m0, m1) {
                return m1.toLocaleLowerCase() + 'm';
            });
        }
        else if (extendedSettings.meridiem === 'lowercase') { // other meridiem transformers already converted to lowercase
            s = s.replace(MERIDIEM_RE, function (m0) {
                return m0.toLocaleLowerCase();
            });
        }
        s = s.replace(MULTI_SPACE_RE, ' ');
        s = s.trim();
        return s;
    }
    function injectTzoStr(s, tzoStr) {
        var replaced = false;
        s = s.replace(UTC_RE, function () {
            replaced = true;
            return tzoStr;
        });
        // IE11 doesn't include UTC/GMT in the original string, so append to end
        if (!replaced) {
            s += ' ' + tzoStr;
        }
        return s;
    }
    function formatWeekNumber(num, weekLabel, locale, display) {
        var parts = [];
        if (display === 'narrow') {
            parts.push(weekLabel);
        }
        else if (display === 'short') {
            parts.push(weekLabel, ' ');
        }
        // otherwise, considered 'numeric'
        parts.push(locale.simpleNumberFormat.format(num));
        if (locale.options.isRtl) { // TODO: use control characters instead?
            parts.reverse();
        }
        return parts.join('');
    }
    // Range Formatting Utils
    // 0 = exactly the same
    // 1 = different by time
    // and bigger
    function computeMarkerDiffSeverity(d0, d1, ca) {
        if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) {
            return 5;
        }
        if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) {
            return 4;
        }
        if (ca.getMarkerDay(d0) !== ca.getMarkerDay(d1)) {
            return 2;
        }
        if (timeAsMs(d0) !== timeAsMs(d1)) {
            return 1;
        }
        return 0;
    }
    function computePartialFormattingOptions(options, biggestUnit) {
        var partialOptions = {};
        for (var name_2 in options) {
            if (!(name_2 in STANDARD_DATE_PROP_SEVERITIES) || // not a date part prop (like timeZone)
                STANDARD_DATE_PROP_SEVERITIES[name_2] <= biggestUnit) {
                partialOptions[name_2] = options[name_2];
            }
        }
        return partialOptions;
    }
    function findCommonInsertion(full0, partial0, full1, partial1) {
        var i0 = 0;
        while (i0 < full0.length) {
            var found0 = full0.indexOf(partial0, i0);
            if (found0 === -1) {
                break;
            }
            var before0 = full0.substr(0, found0);
            i0 = found0 + partial0.length;
            var after0 = full0.substr(i0);
            var i1 = 0;
            while (i1 < full1.length) {
                var found1 = full1.indexOf(partial1, i1);
                if (found1 === -1) {
                    break;
                }
                var before1 = full1.substr(0, found1);
                i1 = found1 + partial1.length;
                var after1 = full1.substr(i1);
                if (before0 === before1 && after0 === after1) {
                    return {
                        before: before0,
                        after: after0
                    };
                }
            }
        }
        return null;
    }

    /*
    TODO: fix the terminology of "formatter" vs "formatting func"
    */
    /*
    At the time of instantiation, this object does not know which cmd-formatting system it will use.
    It receives this at the time of formatting, as a setting.
    */
    var CmdFormatter = /** @class */ (function () {
        function CmdFormatter(cmdStr, separator) {
            this.cmdStr = cmdStr;
            this.separator = separator;
        }
        CmdFormatter.prototype.format = function (date, context) {
            return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(date, null, context, this.separator));
        };
        CmdFormatter.prototype.formatRange = function (start, end, context) {
            return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(start, end, context, this.separator));
        };
        return CmdFormatter;
    }());

    var FuncFormatter = /** @class */ (function () {
        function FuncFormatter(func) {
            this.func = func;
        }
        FuncFormatter.prototype.format = function (date, context) {
            return this.func(createVerboseFormattingArg(date, null, context));
        };
        FuncFormatter.prototype.formatRange = function (start, end, context) {
            return this.func(createVerboseFormattingArg(start, end, context));
        };
        return FuncFormatter;
    }());

    // Formatter Object Creation
    function createFormatter(input, defaultSeparator) {
        if (typeof input === 'object' && input) { // non-null object
            if (typeof defaultSeparator === 'string') {
                input = __assign({ separator: defaultSeparator }, input);
            }
            return new NativeFormatter(input);
        }
        else if (typeof input === 'string') {
            return new CmdFormatter(input, defaultSeparator);
        }
        else if (typeof input === 'function') {
            return new FuncFormatter(input);
        }
    }
    // String Utils
    // timeZoneOffset is in minutes
    function buildIsoString(marker, timeZoneOffset, stripZeroTime) {
        if (stripZeroTime === void 0) { stripZeroTime = false; }
        var s = marker.toISOString();
        s = s.replace('.000', '');
        if (stripZeroTime) {
            s = s.replace('T00:00:00Z', '');
        }
        if (s.length > 10) { // time part wasn't stripped, can add timezone info
            if (timeZoneOffset == null) {
                s = s.replace('Z', '');
            }
            else if (timeZoneOffset !== 0) {
                s = s.replace('Z', formatTimeZoneOffset(timeZoneOffset, true));
            }
            // otherwise, its UTC-0 and we want to keep the Z
        }
        return s;
    }
    function formatIsoTimeString(marker) {
        return padStart(marker.getUTCHours(), 2) + ':' +
            padStart(marker.getUTCMinutes(), 2) + ':' +
            padStart(marker.getUTCSeconds(), 2);
    }
    function formatTimeZoneOffset(minutes, doIso) {
        if (doIso === void 0) { doIso = false; }
        var sign = minutes < 0 ? '-' : '+';
        var abs = Math.abs(minutes);
        var hours = Math.floor(abs / 60);
        var mins = Math.round(abs % 60);
        if (doIso) {
            return sign + padStart(hours, 2) + ':' + padStart(mins, 2);
        }
        else {
            return 'GMT' + sign + hours + (mins ? ':' + padStart(mins, 2) : '');
        }
    }
    // Arg Utils
    function createVerboseFormattingArg(start, end, context, separator) {
        var startInfo = expandZonedMarker(start, context.calendarSystem);
        var endInfo = end ? expandZonedMarker(end, context.calendarSystem) : null;
        return {
            date: startInfo,
            start: startInfo,
            end: endInfo,
            timeZone: context.timeZone,
            localeCodes: context.locale.codes,
            separator: separator
        };
    }
    function expandZonedMarker(dateInfo, calendarSystem) {
        var a = calendarSystem.markerToArray(dateInfo.marker);
        return {
            marker: dateInfo.marker,
            timeZoneOffset: dateInfo.timeZoneOffset,
            array: a,
            year: a[0],
            month: a[1],
            day: a[2],
            hour: a[3],
            minute: a[4],
            second: a[5],
            millisecond: a[6]
        };
    }

    var EventSourceApi = /** @class */ (function () {
        function EventSourceApi(calendar, internalEventSource) {
            this.calendar = calendar;
            this.internalEventSource = internalEventSource;
        }
        EventSourceApi.prototype.remove = function () {
            this.calendar.dispatch({
                type: 'REMOVE_EVENT_SOURCE',
                sourceId: this.internalEventSource.sourceId
            });
        };
        EventSourceApi.prototype.refetch = function () {
            this.calendar.dispatch({
                type: 'FETCH_EVENT_SOURCES',
                sourceIds: [this.internalEventSource.sourceId]
            });
        };
        Object.defineProperty(EventSourceApi.prototype, "id", {
            get: function () {
                return this.internalEventSource.publicId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventSourceApi.prototype, "url", {
            // only relevant to json-feed event sources
            get: function () {
                return this.internalEventSource.meta.url;
            },
            enumerable: true,
            configurable: true
        });
        return EventSourceApi;
    }());

    var EventApi = /** @class */ (function () {
        function EventApi(calendar, def, instance) {
            this._calendar = calendar;
            this._def = def;
            this._instance = instance || null;
        }
        /*
        TODO: make event struct more responsible for this
        */
        EventApi.prototype.setProp = function (name, val) {
            var _a, _b;
            if (name in DATE_PROPS) ;
            else if (name in NON_DATE_PROPS) {
                if (typeof NON_DATE_PROPS[name] === 'function') {
                    val = NON_DATE_PROPS[name](val);
                }
                this.mutate({
                    standardProps: (_a = {}, _a[name] = val, _a)
                });
            }
            else if (name in UNSCOPED_EVENT_UI_PROPS) {
                var ui = void 0;
                if (typeof UNSCOPED_EVENT_UI_PROPS[name] === 'function') {
                    val = UNSCOPED_EVENT_UI_PROPS[name](val);
                }
                if (name === 'color') {
                    ui = { backgroundColor: val, borderColor: val };
                }
                else if (name === 'editable') {
                    ui = { startEditable: val, durationEditable: val };
                }
                else {
                    ui = (_b = {}, _b[name] = val, _b);
                }
                this.mutate({
                    standardProps: { ui: ui }
                });
            }
        };
        EventApi.prototype.setExtendedProp = function (name, val) {
            var _a;
            this.mutate({
                extendedProps: (_a = {}, _a[name] = val, _a)
            });
        };
        EventApi.prototype.setStart = function (startInput, options) {
            if (options === void 0) { options = {}; }
            var dateEnv = this._calendar.dateEnv;
            var start = dateEnv.createMarker(startInput);
            if (start && this._instance) { // TODO: warning if parsed bad
                var instanceRange = this._instance.range;
                var startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity); // what if parsed bad!?
                if (options.maintainDuration) {
                    this.mutate({ datesDelta: startDelta });
                }
                else {
                    this.mutate({ startDelta: startDelta });
                }
            }
        };
        EventApi.prototype.setEnd = function (endInput, options) {
            if (options === void 0) { options = {}; }
            var dateEnv = this._calendar.dateEnv;
            var end;
            if (endInput != null) {
                end = dateEnv.createMarker(endInput);
                if (!end) {
                    return; // TODO: warning if parsed bad
                }
            }
            if (this._instance) {
                if (end) {
                    var endDelta = diffDates(this._instance.range.end, end, dateEnv, options.granularity);
                    this.mutate({ endDelta: endDelta });
                }
                else {
                    this.mutate({ standardProps: { hasEnd: false } });
                }
            }
        };
        EventApi.prototype.setDates = function (startInput, endInput, options) {
            if (options === void 0) { options = {}; }
            var dateEnv = this._calendar.dateEnv;
            var standardProps = { allDay: options.allDay };
            var start = dateEnv.createMarker(startInput);
            var end;
            if (!start) {
                return; // TODO: warning if parsed bad
            }
            if (endInput != null) {
                end = dateEnv.createMarker(endInput);
                if (!end) { // TODO: warning if parsed bad
                    return;
                }
            }
            if (this._instance) {
                var instanceRange = this._instance.range;
                // when computing the diff for an event being converted to all-day,
                // compute diff off of the all-day values the way event-mutation does.
                if (options.allDay === true) {
                    instanceRange = computeAlignedDayRange(instanceRange);
                }
                var startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity);
                if (end) {
                    var endDelta = diffDates(instanceRange.end, end, dateEnv, options.granularity);
                    if (durationsEqual(startDelta, endDelta)) {
                        this.mutate({ datesDelta: startDelta, standardProps: standardProps });
                    }
                    else {
                        this.mutate({ startDelta: startDelta, endDelta: endDelta, standardProps: standardProps });
                    }
                }
                else { // means "clear the end"
                    standardProps.hasEnd = false;
                    this.mutate({ datesDelta: startDelta, standardProps: standardProps });
                }
            }
        };
        EventApi.prototype.moveStart = function (deltaInput) {
            var delta = createDuration(deltaInput);
            if (delta) { // TODO: warning if parsed bad
                this.mutate({ startDelta: delta });
            }
        };
        EventApi.prototype.moveEnd = function (deltaInput) {
            var delta = createDuration(deltaInput);
            if (delta) { // TODO: warning if parsed bad
                this.mutate({ endDelta: delta });
            }
        };
        EventApi.prototype.moveDates = function (deltaInput) {
            var delta = createDuration(deltaInput);
            if (delta) { // TODO: warning if parsed bad
                this.mutate({ datesDelta: delta });
            }
        };
        EventApi.prototype.setAllDay = function (allDay, options) {
            if (options === void 0) { options = {}; }
            var standardProps = { allDay: allDay };
            var maintainDuration = options.maintainDuration;
            if (maintainDuration == null) {
                maintainDuration = this._calendar.opt('allDayMaintainDuration');
            }
            if (this._def.allDay !== allDay) {
                standardProps.hasEnd = maintainDuration;
            }
            this.mutate({ standardProps: standardProps });
        };
        EventApi.prototype.formatRange = function (formatInput) {
            var dateEnv = this._calendar.dateEnv;
            var instance = this._instance;
            var formatter = createFormatter(formatInput, this._calendar.opt('defaultRangeSeparator'));
            if (this._def.hasEnd) {
                return dateEnv.formatRange(instance.range.start, instance.range.end, formatter, {
                    forcedStartTzo: instance.forcedStartTzo,
                    forcedEndTzo: instance.forcedEndTzo
                });
            }
            else {
                return dateEnv.format(instance.range.start, formatter, {
                    forcedTzo: instance.forcedStartTzo
                });
            }
        };
        EventApi.prototype.mutate = function (mutation) {
            var def = this._def;
            var instance = this._instance;
            if (instance) {
                this._calendar.dispatch({
                    type: 'MUTATE_EVENTS',
                    instanceId: instance.instanceId,
                    mutation: mutation,
                    fromApi: true
                });
                var eventStore = this._calendar.state.eventStore;
                this._def = eventStore.defs[def.defId];
                this._instance = eventStore.instances[instance.instanceId];
            }
        };
        EventApi.prototype.remove = function () {
            this._calendar.dispatch({
                type: 'REMOVE_EVENT_DEF',
                defId: this._def.defId
            });
        };
        Object.defineProperty(EventApi.prototype, "source", {
            get: function () {
                var sourceId = this._def.sourceId;
                if (sourceId) {
                    return new EventSourceApi(this._calendar, this._calendar.state.eventSources[sourceId]);
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "start", {
            get: function () {
                return this._instance ?
                    this._calendar.dateEnv.toDate(this._instance.range.start) :
                    null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "end", {
            get: function () {
                return (this._instance && this._def.hasEnd) ?
                    this._calendar.dateEnv.toDate(this._instance.range.end) :
                    null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "id", {
            // computable props that all access the def
            // TODO: find a TypeScript-compatible way to do this at scale
            get: function () { return this._def.publicId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "groupId", {
            get: function () { return this._def.groupId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "allDay", {
            get: function () { return this._def.allDay; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "title", {
            get: function () { return this._def.title; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "url", {
            get: function () { return this._def.url; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "rendering", {
            get: function () { return this._def.rendering; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "startEditable", {
            get: function () { return this._def.ui.startEditable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "durationEditable", {
            get: function () { return this._def.ui.durationEditable; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "constraint", {
            get: function () { return this._def.ui.constraints[0] || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "overlap", {
            get: function () { return this._def.ui.overlap; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "allow", {
            get: function () { return this._def.ui.allows[0] || null; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "backgroundColor", {
            get: function () { return this._def.ui.backgroundColor; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "borderColor", {
            get: function () { return this._def.ui.borderColor; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "textColor", {
            get: function () { return this._def.ui.textColor; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "classNames", {
            // NOTE: user can't modify these because Object.freeze was called in event-def parsing
            get: function () { return this._def.ui.classNames; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventApi.prototype, "extendedProps", {
            get: function () { return this._def.extendedProps; },
            enumerable: true,
            configurable: true
        });
        return EventApi;
    }());

    /*
    Specifying nextDayThreshold signals that all-day ranges should be sliced.
    */
    function sliceEventStore(eventStore, eventUiBases, framingRange, nextDayThreshold) {
        var inverseBgByGroupId = {};
        var inverseBgByDefId = {};
        var defByGroupId = {};
        var bgRanges = [];
        var fgRanges = [];
        var eventUis = compileEventUis(eventStore.defs, eventUiBases);
        for (var defId in eventStore.defs) {
            var def = eventStore.defs[defId];
            if (def.rendering === 'inverse-background') {
                if (def.groupId) {
                    inverseBgByGroupId[def.groupId] = [];
                    if (!defByGroupId[def.groupId]) {
                        defByGroupId[def.groupId] = def;
                    }
                }
                else {
                    inverseBgByDefId[defId] = [];
                }
            }
        }
        for (var instanceId in eventStore.instances) {
            var instance = eventStore.instances[instanceId];
            var def = eventStore.defs[instance.defId];
            var ui = eventUis[def.defId];
            var origRange = instance.range;
            var normalRange = (!def.allDay && nextDayThreshold) ?
                computeVisibleDayRange(origRange, nextDayThreshold) :
                origRange;
            var slicedRange = intersectRanges(normalRange, framingRange);
            if (slicedRange) {
                if (def.rendering === 'inverse-background') {
                    if (def.groupId) {
                        inverseBgByGroupId[def.groupId].push(slicedRange);
                    }
                    else {
                        inverseBgByDefId[instance.defId].push(slicedRange);
                    }
                }
                else {
                    (def.rendering === 'background' ? bgRanges : fgRanges).push({
                        def: def,
                        ui: ui,
                        instance: instance,
                        range: slicedRange,
                        isStart: normalRange.start && normalRange.start.valueOf() === slicedRange.start.valueOf(),
                        isEnd: normalRange.end && normalRange.end.valueOf() === slicedRange.end.valueOf()
                    });
                }
            }
        }
        for (var groupId in inverseBgByGroupId) { // BY GROUP
            var ranges = inverseBgByGroupId[groupId];
            var invertedRanges = invertRanges(ranges, framingRange);
            for (var _i = 0, invertedRanges_1 = invertedRanges; _i < invertedRanges_1.length; _i++) {
                var invertedRange = invertedRanges_1[_i];
                var def = defByGroupId[groupId];
                var ui = eventUis[def.defId];
                bgRanges.push({
                    def: def,
                    ui: ui,
                    instance: null,
                    range: invertedRange,
                    isStart: false,
                    isEnd: false
                });
            }
        }
        for (var defId in inverseBgByDefId) {
            var ranges = inverseBgByDefId[defId];
            var invertedRanges = invertRanges(ranges, framingRange);
            for (var _a = 0, invertedRanges_2 = invertedRanges; _a < invertedRanges_2.length; _a++) {
                var invertedRange = invertedRanges_2[_a];
                bgRanges.push({
                    def: eventStore.defs[defId],
                    ui: eventUis[defId],
                    instance: null,
                    range: invertedRange,
                    isStart: false,
                    isEnd: false
                });
            }
        }
        return { bg: bgRanges, fg: fgRanges };
    }
    function hasBgRendering(def) {
        return def.rendering === 'background' || def.rendering === 'inverse-background';
    }
    function filterSegsViaEls(context, segs, isMirror) {
        var calendar = context.calendar, view = context.view;
        if (calendar.hasPublicHandlers('eventRender')) {
            segs = segs.filter(function (seg) {
                var custom = calendar.publiclyTrigger('eventRender', [
                    {
                        event: new EventApi(calendar, seg.eventRange.def, seg.eventRange.instance),
                        isMirror: isMirror,
                        isStart: seg.isStart,
                        isEnd: seg.isEnd,
                        // TODO: include seg.range once all components consistently generate it
                        el: seg.el,
                        view: view
                    }
                ]);
                if (custom === false) { // means don't render at all
                    return false;
                }
                else if (custom && custom !== true) {
                    seg.el = custom;
                }
                return true;
            });
        }
        for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
            var seg = segs_1[_i];
            setElSeg(seg.el, seg);
        }
        return segs;
    }
    function setElSeg(el, seg) {
        el.fcSeg = seg;
    }
    function getElSeg(el) {
        return el.fcSeg || null;
    }
    // event ui computation
    function compileEventUis(eventDefs, eventUiBases) {
        return mapHash(eventDefs, function (eventDef) {
            return compileEventUi(eventDef, eventUiBases);
        });
    }
    function compileEventUi(eventDef, eventUiBases) {
        var uis = [];
        if (eventUiBases['']) {
            uis.push(eventUiBases['']);
        }
        if (eventUiBases[eventDef.defId]) {
            uis.push(eventUiBases[eventDef.defId]);
        }
        uis.push(eventDef.ui);
        return combineEventUis(uis);
    }
    // triggers
    function triggerRenderedSegs(context, segs, isMirrors) {
        var calendar = context.calendar, view = context.view;
        if (calendar.hasPublicHandlers('eventPositioned')) {
            for (var _i = 0, segs_2 = segs; _i < segs_2.length; _i++) {
                var seg = segs_2[_i];
                calendar.publiclyTriggerAfterSizing('eventPositioned', [
                    {
                        event: new EventApi(calendar, seg.eventRange.def, seg.eventRange.instance),
                        isMirror: isMirrors,
                        isStart: seg.isStart,
                        isEnd: seg.isEnd,
                        el: seg.el,
                        view: view
                    }
                ]);
            }
        }
        if (!calendar.state.eventSourceLoadingLevel) { // avoid initial empty state while pending
            calendar.afterSizingTriggers._eventsPositioned = [null]; // fire once
        }
    }
    function triggerWillRemoveSegs(context, segs, isMirrors) {
        var calendar = context.calendar, view = context.view;
        for (var _i = 0, segs_3 = segs; _i < segs_3.length; _i++) {
            var seg = segs_3[_i];
            calendar.trigger('eventElRemove', seg.el);
        }
        if (calendar.hasPublicHandlers('eventDestroy')) {
            for (var _a = 0, segs_4 = segs; _a < segs_4.length; _a++) {
                var seg = segs_4[_a];
                calendar.publiclyTrigger('eventDestroy', [
                    {
                        event: new EventApi(calendar, seg.eventRange.def, seg.eventRange.instance),
                        isMirror: isMirrors,
                        el: seg.el,
                        view: view
                    }
                ]);
            }
        }
    }
    // is-interactable
    function computeEventDraggable(context, eventDef, eventUi) {
        var calendar = context.calendar, view = context.view;
        var transformers = calendar.pluginSystem.hooks.isDraggableTransformers;
        var val = eventUi.startEditable;
        for (var _i = 0, transformers_1 = transformers; _i < transformers_1.length; _i++) {
            var transformer = transformers_1[_i];
            val = transformer(val, eventDef, eventUi, view);
        }
        return val;
    }
    function computeEventStartResizable(context, eventDef, eventUi) {
        return eventUi.durationEditable && context.options.eventResizableFromStart;
    }
    function computeEventEndResizable(context, eventDef, eventUi) {
        return eventUi.durationEditable;
    }

    // applies the mutation to ALL defs/instances within the event store
    function applyMutationToEventStore(eventStore, eventConfigBase, mutation, calendar) {
        var eventConfigs = compileEventUis(eventStore.defs, eventConfigBase);
        var dest = createEmptyEventStore();
        for (var defId in eventStore.defs) {
            var def = eventStore.defs[defId];
            dest.defs[defId] = applyMutationToEventDef(def, eventConfigs[defId], mutation, calendar.pluginSystem.hooks.eventDefMutationAppliers, calendar);
        }
        for (var instanceId in eventStore.instances) {
            var instance = eventStore.instances[instanceId];
            var def = dest.defs[instance.defId]; // important to grab the newly modified def
            dest.instances[instanceId] = applyMutationToEventInstance(instance, def, eventConfigs[instance.defId], mutation, calendar);
        }
        return dest;
    }
    function applyMutationToEventDef(eventDef, eventConfig, mutation, appliers, calendar) {
        var standardProps = mutation.standardProps || {};
        // if hasEnd has not been specified, guess a good value based on deltas.
        // if duration will change, there's no way the default duration will persist,
        // and thus, we need to mark the event as having a real end
        if (standardProps.hasEnd == null &&
            eventConfig.durationEditable &&
            (mutation.startDelta || mutation.endDelta)) {
            standardProps.hasEnd = true; // TODO: is this mutation okay?
        }
        var copy = __assign({}, eventDef, standardProps, { ui: __assign({}, eventDef.ui, standardProps.ui) });
        if (mutation.extendedProps) {
            copy.extendedProps = __assign({}, copy.extendedProps, mutation.extendedProps);
        }
        for (var _i = 0, appliers_1 = appliers; _i < appliers_1.length; _i++) {
            var applier = appliers_1[_i];
            applier(copy, mutation, calendar);
        }
        if (!copy.hasEnd && calendar.opt('forceEventDuration')) {
            copy.hasEnd = true;
        }
        return copy;
    }
    function applyMutationToEventInstance(eventInstance, eventDef, // must first be modified by applyMutationToEventDef
    eventConfig, mutation, calendar) {
        var dateEnv = calendar.dateEnv;
        var forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true;
        var clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false;
        var copy = __assign({}, eventInstance);
        if (forceAllDay) {
            copy.range = computeAlignedDayRange(copy.range);
        }
        if (mutation.datesDelta && eventConfig.startEditable) {
            copy.range = {
                start: dateEnv.add(copy.range.start, mutation.datesDelta),
                end: dateEnv.add(copy.range.end, mutation.datesDelta)
            };
        }
        if (mutation.startDelta && eventConfig.durationEditable) {
            copy.range = {
                start: dateEnv.add(copy.range.start, mutation.startDelta),
                end: copy.range.end
            };
        }
        if (mutation.endDelta && eventConfig.durationEditable) {
            copy.range = {
                start: copy.range.start,
                end: dateEnv.add(copy.range.end, mutation.endDelta)
            };
        }
        if (clearEnd) {
            copy.range = {
                start: copy.range.start,
                end: calendar.getDefaultEventEnd(eventDef.allDay, copy.range.start)
            };
        }
        // in case event was all-day but the supplied deltas were not
        // better util for this?
        if (eventDef.allDay) {
            copy.range = {
                start: startOfDay(copy.range.start),
                end: startOfDay(copy.range.end)
            };
        }
        // handle invalid durations
        if (copy.range.end < copy.range.start) {
            copy.range.end = calendar.getDefaultEventEnd(eventDef.allDay, copy.range.start);
        }
        return copy;
    }

    function reduceEventStore (eventStore, action, eventSources, dateProfile, calendar) {
        switch (action.type) {
            case 'RECEIVE_EVENTS': // raw
                return receiveRawEvents(eventStore, eventSources[action.sourceId], action.fetchId, action.fetchRange, action.rawEvents, calendar);
            case 'ADD_EVENTS': // already parsed, but not expanded
                return addEvent(eventStore, action.eventStore, // new ones
                dateProfile ? dateProfile.activeRange : null, calendar);
            case 'MERGE_EVENTS': // already parsed and expanded
                return mergeEventStores(eventStore, action.eventStore);
            case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
            case 'NEXT':
            case 'SET_DATE':
            case 'SET_VIEW_TYPE':
                if (dateProfile) {
                    return expandRecurring(eventStore, dateProfile.activeRange, calendar);
                }
                else {
                    return eventStore;
                }
            case 'CHANGE_TIMEZONE':
                return rezoneDates(eventStore, action.oldDateEnv, calendar.dateEnv);
            case 'MUTATE_EVENTS':
                return applyMutationToRelated(eventStore, action.instanceId, action.mutation, action.fromApi, calendar);
            case 'REMOVE_EVENT_INSTANCES':
                return excludeInstances(eventStore, action.instances);
            case 'REMOVE_EVENT_DEF':
                return filterEventStoreDefs(eventStore, function (eventDef) {
                    return eventDef.defId !== action.defId;
                });
            case 'REMOVE_EVENT_SOURCE':
                return excludeEventsBySourceId(eventStore, action.sourceId);
            case 'REMOVE_ALL_EVENT_SOURCES':
                return filterEventStoreDefs(eventStore, function (eventDef) {
                    return !eventDef.sourceId; // only keep events with no source id
                });
            case 'REMOVE_ALL_EVENTS':
                return createEmptyEventStore();
            case 'RESET_EVENTS':
                return {
                    defs: eventStore.defs,
                    instances: eventStore.instances
                };
            default:
                return eventStore;
        }
    }
    function receiveRawEvents(eventStore, eventSource, fetchId, fetchRange, rawEvents, calendar) {
        if (eventSource && // not already removed
            fetchId === eventSource.latestFetchId // TODO: wish this logic was always in event-sources
        ) {
            var subset = parseEvents(transformRawEvents(rawEvents, eventSource, calendar), eventSource.sourceId, calendar);
            if (fetchRange) {
                subset = expandRecurring(subset, fetchRange, calendar);
            }
            return mergeEventStores(excludeEventsBySourceId(eventStore, eventSource.sourceId), subset);
        }
        return eventStore;
    }
    function addEvent(eventStore, subset, expandRange, calendar) {
        if (expandRange) {
            subset = expandRecurring(subset, expandRange, calendar);
        }
        return mergeEventStores(eventStore, subset);
    }
    function rezoneDates(eventStore, oldDateEnv, newDateEnv) {
        var defs = eventStore.defs;
        var instances = mapHash(eventStore.instances, function (instance) {
            var def = defs[instance.defId];
            if (def.allDay || def.recurringDef) {
                return instance; // isn't dependent on timezone
            }
            else {
                return __assign({}, instance, { range: {
                        start: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start, instance.forcedStartTzo)),
                        end: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end, instance.forcedEndTzo))
                    }, forcedStartTzo: newDateEnv.canComputeOffset ? null : instance.forcedStartTzo, forcedEndTzo: newDateEnv.canComputeOffset ? null : instance.forcedEndTzo });
            }
        });
        return { defs: defs, instances: instances };
    }
    function applyMutationToRelated(eventStore, instanceId, mutation, fromApi, calendar) {
        var relevant = getRelevantEvents(eventStore, instanceId);
        var eventConfigBase = fromApi ?
            { '': {
                    startEditable: true,
                    durationEditable: true,
                    constraints: [],
                    overlap: null,
                    allows: [],
                    backgroundColor: '',
                    borderColor: '',
                    textColor: '',
                    classNames: []
                } } :
            calendar.eventUiBases;
        relevant = applyMutationToEventStore(relevant, eventConfigBase, mutation, calendar);
        return mergeEventStores(eventStore, relevant);
    }
    function excludeEventsBySourceId(eventStore, sourceId) {
        return filterEventStoreDefs(eventStore, function (eventDef) {
            return eventDef.sourceId !== sourceId;
        });
    }
    // QUESTION: why not just return instances? do a general object-property-exclusion util
    function excludeInstances(eventStore, removals) {
        return {
            defs: eventStore.defs,
            instances: filterHash(eventStore.instances, function (instance) {
                return !removals[instance.instanceId];
            })
        };
    }

    // high-level segmenting-aware tester functions
    // ------------------------------------------------------------------------------------------------------------------------
    function isInteractionValid(interaction, calendar) {
        return isNewPropsValid({ eventDrag: interaction }, calendar); // HACK: the eventDrag props is used for ALL interactions
    }
    function isDateSelectionValid(dateSelection, calendar) {
        return isNewPropsValid({ dateSelection: dateSelection }, calendar);
    }
    function isNewPropsValid(newProps, calendar) {
        var view = calendar.view;
        var props = __assign({ businessHours: view ? view.props.businessHours : createEmptyEventStore(), dateSelection: '', eventStore: calendar.state.eventStore, eventUiBases: calendar.eventUiBases, eventSelection: '', eventDrag: null, eventResize: null }, newProps);
        return (calendar.pluginSystem.hooks.isPropsValid || isPropsValid)(props, calendar);
    }
    function isPropsValid(state, calendar, dateSpanMeta, filterConfig) {
        if (dateSpanMeta === void 0) { dateSpanMeta = {}; }
        if (state.eventDrag && !isInteractionPropsValid(state, calendar, dateSpanMeta, filterConfig)) {
            return false;
        }
        if (state.dateSelection && !isDateSelectionPropsValid(state, calendar, dateSpanMeta, filterConfig)) {
            return false;
        }
        return true;
    }
    // Moving Event Validation
    // ------------------------------------------------------------------------------------------------------------------------
    function isInteractionPropsValid(state, calendar, dateSpanMeta, filterConfig) {
        var interaction = state.eventDrag; // HACK: the eventDrag props is used for ALL interactions
        var subjectEventStore = interaction.mutatedEvents;
        var subjectDefs = subjectEventStore.defs;
        var subjectInstances = subjectEventStore.instances;
        var subjectConfigs = compileEventUis(subjectDefs, interaction.isEvent ?
            state.eventUiBases :
            { '': calendar.selectionConfig } // if not a real event, validate as a selection
        );
        if (filterConfig) {
            subjectConfigs = mapHash(subjectConfigs, filterConfig);
        }
        var otherEventStore = excludeInstances(state.eventStore, interaction.affectedEvents.instances); // exclude the subject events. TODO: exclude defs too?
        var otherDefs = otherEventStore.defs;
        var otherInstances = otherEventStore.instances;
        var otherConfigs = compileEventUis(otherDefs, state.eventUiBases);
        for (var subjectInstanceId in subjectInstances) {
            var subjectInstance = subjectInstances[subjectInstanceId];
            var subjectRange = subjectInstance.range;
            var subjectConfig = subjectConfigs[subjectInstance.defId];
            var subjectDef = subjectDefs[subjectInstance.defId];
            // constraint
            if (!allConstraintsPass(subjectConfig.constraints, subjectRange, otherEventStore, state.businessHours, calendar)) {
                return false;
            }
            // overlap
            var overlapFunc = calendar.opt('eventOverlap');
            if (typeof overlapFunc !== 'function') {
                overlapFunc = null;
            }
            for (var otherInstanceId in otherInstances) {
                var otherInstance = otherInstances[otherInstanceId];
                // intersect! evaluate
                if (rangesIntersect(subjectRange, otherInstance.range)) {
                    var otherOverlap = otherConfigs[otherInstance.defId].overlap;
                    // consider the other event's overlap. only do this if the subject event is a "real" event
                    if (otherOverlap === false && interaction.isEvent) {
                        return false;
                    }
                    if (subjectConfig.overlap === false) {
                        return false;
                    }
                    if (overlapFunc && !overlapFunc(new EventApi(calendar, otherDefs[otherInstance.defId], otherInstance), // still event
                    new EventApi(calendar, subjectDef, subjectInstance) // moving event
                    )) {
                        return false;
                    }
                }
            }
            // allow (a function)
            var calendarEventStore = calendar.state.eventStore; // need global-to-calendar, not local to component (splittable)state
            for (var _i = 0, _a = subjectConfig.allows; _i < _a.length; _i++) {
                var subjectAllow = _a[_i];
                var subjectDateSpan = __assign({}, dateSpanMeta, { range: subjectInstance.range, allDay: subjectDef.allDay });
                var origDef = calendarEventStore.defs[subjectDef.defId];
                var origInstance = calendarEventStore.instances[subjectInstanceId];
                var eventApi = void 0;
                if (origDef) { // was previously in the calendar
                    eventApi = new EventApi(calendar, origDef, origInstance);
                }
                else { // was an external event
                    eventApi = new EventApi(calendar, subjectDef); // no instance, because had no dates
                }
                if (!subjectAllow(calendar.buildDateSpanApi(subjectDateSpan), eventApi)) {
                    return false;
                }
            }
        }
        return true;
    }
    // Date Selection Validation
    // ------------------------------------------------------------------------------------------------------------------------
    function isDateSelectionPropsValid(state, calendar, dateSpanMeta, filterConfig) {
        var relevantEventStore = state.eventStore;
        var relevantDefs = relevantEventStore.defs;
        var relevantInstances = relevantEventStore.instances;
        var selection = state.dateSelection;
        var selectionRange = selection.range;
        var selectionConfig = calendar.selectionConfig;
        if (filterConfig) {
            selectionConfig = filterConfig(selectionConfig);
        }
        // constraint
        if (!allConstraintsPass(selectionConfig.constraints, selectionRange, relevantEventStore, state.businessHours, calendar)) {
            return false;
        }
        // overlap
        var overlapFunc = calendar.opt('selectOverlap');
        if (typeof overlapFunc !== 'function') {
            overlapFunc = null;
        }
        for (var relevantInstanceId in relevantInstances) {
            var relevantInstance = relevantInstances[relevantInstanceId];
            // intersect! evaluate
            if (rangesIntersect(selectionRange, relevantInstance.range)) {
                if (selectionConfig.overlap === false) {
                    return false;
                }
                if (overlapFunc && !overlapFunc(new EventApi(calendar, relevantDefs[relevantInstance.defId], relevantInstance))) {
                    return false;
                }
            }
        }
        // allow (a function)
        for (var _i = 0, _a = selectionConfig.allows; _i < _a.length; _i++) {
            var selectionAllow = _a[_i];
            var fullDateSpan = __assign({}, dateSpanMeta, selection);
            if (!selectionAllow(calendar.buildDateSpanApi(fullDateSpan), null)) {
                return false;
            }
        }
        return true;
    }
    // Constraint Utils
    // ------------------------------------------------------------------------------------------------------------------------
    function allConstraintsPass(constraints, subjectRange, otherEventStore, businessHoursUnexpanded, calendar) {
        for (var _i = 0, constraints_1 = constraints; _i < constraints_1.length; _i++) {
            var constraint = constraints_1[_i];
            if (!anyRangesContainRange(constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, calendar), subjectRange)) {
                return false;
            }
        }
        return true;
    }
    function constraintToRanges(constraint, subjectRange, // for expanding a recurring constraint, or expanding business hours
    otherEventStore, // for if constraint is an even group ID
    businessHoursUnexpanded, // for if constraint is 'businessHours'
    calendar // for expanding businesshours
    ) {
        if (constraint === 'businessHours') {
            return eventStoreToRanges(expandRecurring(businessHoursUnexpanded, subjectRange, calendar));
        }
        else if (typeof constraint === 'string') { // an group ID
            return eventStoreToRanges(filterEventStoreDefs(otherEventStore, function (eventDef) {
                return eventDef.groupId === constraint;
            }));
        }
        else if (typeof constraint === 'object' && constraint) { // non-null object
            return eventStoreToRanges(expandRecurring(constraint, subjectRange, calendar));
        }
        return []; // if it's false
    }
    // TODO: move to event-store file?
    function eventStoreToRanges(eventStore) {
        var instances = eventStore.instances;
        var ranges = [];
        for (var instanceId in instances) {
            ranges.push(instances[instanceId].range);
        }
        return ranges;
    }
    // TODO: move to geom file?
    function anyRangesContainRange(outerRanges, innerRange) {
        for (var _i = 0, outerRanges_1 = outerRanges; _i < outerRanges_1.length; _i++) {
            var outerRange = outerRanges_1[_i];
            if (rangeContainsRange(outerRange, innerRange)) {
                return true;
            }
        }
        return false;
    }
    // Parsing
    // ------------------------------------------------------------------------------------------------------------------------
    function normalizeConstraint(input, calendar) {
        if (Array.isArray(input)) {
            return parseEvents(input, '', calendar, true); // allowOpenRange=true
        }
        else if (typeof input === 'object' && input) { // non-null object
            return parseEvents([input], '', calendar, true); // allowOpenRange=true
        }
        else if (input != null) {
            return String(input);
        }
        else {
            return null;
        }
    }

    function htmlEscape(s) {
        return (s + '').replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#039;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '<br />');
    }
    // Given a hash of CSS properties, returns a string of CSS.
    // Uses property names as-is (no camel-case conversion). Will not make statements for null/undefined values.
    function cssToStr(cssProps) {
        var statements = [];
        for (var name_1 in cssProps) {
            var val = cssProps[name_1];
            if (val != null && val !== '') {
                statements.push(name_1 + ':' + val);
            }
        }
        return statements.join(';');
    }
    // Given an object hash of HTML attribute names to values,
    // generates a string that can be injected between < > in HTML
    function attrsToStr(attrs) {
        var parts = [];
        for (var name_2 in attrs) {
            var val = attrs[name_2];
            if (val != null) {
                parts.push(name_2 + '="' + htmlEscape(val) + '"');
            }
        }
        return parts.join(' ');
    }
    function parseClassName(raw) {
        if (Array.isArray(raw)) {
            return raw;
        }
        else if (typeof raw === 'string') {
            return raw.split(/\s+/);
        }
        else {
            return [];
        }
    }

    var UNSCOPED_EVENT_UI_PROPS = {
        editable: Boolean,
        startEditable: Boolean,
        durationEditable: Boolean,
        constraint: null,
        overlap: null,
        allow: null,
        className: parseClassName,
        classNames: parseClassName,
        color: String,
        backgroundColor: String,
        borderColor: String,
        textColor: String
    };
    function processUnscopedUiProps(rawProps, calendar, leftovers) {
        var props = refineProps(rawProps, UNSCOPED_EVENT_UI_PROPS, {}, leftovers);
        var constraint = normalizeConstraint(props.constraint, calendar);
        return {
            startEditable: props.startEditable != null ? props.startEditable : props.editable,
            durationEditable: props.durationEditable != null ? props.durationEditable : props.editable,
            constraints: constraint != null ? [constraint] : [],
            overlap: props.overlap,
            allows: props.allow != null ? [props.allow] : [],
            backgroundColor: props.backgroundColor || props.color,
            borderColor: props.borderColor || props.color,
            textColor: props.textColor,
            classNames: props.classNames.concat(props.className)
        };
    }
    function processScopedUiProps(prefix, rawScoped, calendar, leftovers) {
        var rawUnscoped = {};
        var wasFound = {};
        for (var key in UNSCOPED_EVENT_UI_PROPS) {
            var scopedKey = prefix + capitaliseFirstLetter(key);
            rawUnscoped[key] = rawScoped[scopedKey];
            wasFound[scopedKey] = true;
        }
        if (prefix === 'event') {
            rawUnscoped.editable = rawScoped.editable; // special case. there is no 'eventEditable', just 'editable'
        }
        if (leftovers) {
            for (var key in rawScoped) {
                if (!wasFound[key]) {
                    leftovers[key] = rawScoped[key];
                }
            }
        }
        return processUnscopedUiProps(rawUnscoped, calendar);
    }
    var EMPTY_EVENT_UI = {
        startEditable: null,
        durationEditable: null,
        constraints: [],
        overlap: null,
        allows: [],
        backgroundColor: '',
        borderColor: '',
        textColor: '',
        classNames: []
    };
    // prevent against problems with <2 args!
    function combineEventUis(uis) {
        return uis.reduce(combineTwoEventUis, EMPTY_EVENT_UI);
    }
    function combineTwoEventUis(item0, item1) {
        return {
            startEditable: item1.startEditable != null ? item1.startEditable : item0.startEditable,
            durationEditable: item1.durationEditable != null ? item1.durationEditable : item0.durationEditable,
            constraints: item0.constraints.concat(item1.constraints),
            overlap: typeof item1.overlap === 'boolean' ? item1.overlap : item0.overlap,
            allows: item0.allows.concat(item1.allows),
            backgroundColor: item1.backgroundColor || item0.backgroundColor,
            borderColor: item1.borderColor || item0.borderColor,
            textColor: item1.textColor || item0.textColor,
            classNames: item0.classNames.concat(item1.classNames)
        };
    }

    var NON_DATE_PROPS = {
        id: String,
        groupId: String,
        title: String,
        url: String,
        rendering: String,
        extendedProps: null
    };
    var DATE_PROPS = {
        start: null,
        date: null,
        end: null,
        allDay: null
    };
    var uid = 0;
    function parseEvent(raw, sourceId, calendar, allowOpenRange) {
        var allDayDefault = computeIsAllDayDefault(sourceId, calendar);
        var leftovers0 = {};
        var recurringRes = parseRecurring(raw, // raw, but with single-event stuff stripped out
        allDayDefault, calendar.dateEnv, calendar.pluginSystem.hooks.recurringTypes, leftovers0 // will populate with non-recurring props
        );
        if (recurringRes) {
            var def = parseEventDef(leftovers0, sourceId, recurringRes.allDay, Boolean(recurringRes.duration), calendar);
            def.recurringDef = {
                typeId: recurringRes.typeId,
                typeData: recurringRes.typeData,
                duration: recurringRes.duration
            };
            return { def: def, instance: null };
        }
        else {
            var leftovers1 = {};
            var singleRes = parseSingle(raw, allDayDefault, calendar, leftovers1, allowOpenRange);
            if (singleRes) {
                var def = parseEventDef(leftovers1, sourceId, singleRes.allDay, singleRes.hasEnd, calendar);
                var instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo);
                return { def: def, instance: instance };
            }
        }
        return null;
    }
    /*
    Will NOT populate extendedProps with the leftover properties.
    Will NOT populate date-related props.
    The EventNonDateInput has been normalized (id => publicId, etc).
    */
    function parseEventDef(raw, sourceId, allDay, hasEnd, calendar) {
        var leftovers = {};
        var def = pluckNonDateProps(raw, calendar, leftovers);
        def.defId = String(uid++);
        def.sourceId = sourceId;
        def.allDay = allDay;
        def.hasEnd = hasEnd;
        for (var _i = 0, _a = calendar.pluginSystem.hooks.eventDefParsers; _i < _a.length; _i++) {
            var eventDefParser = _a[_i];
            var newLeftovers = {};
            eventDefParser(def, leftovers, newLeftovers);
            leftovers = newLeftovers;
        }
        def.extendedProps = __assign(leftovers, def.extendedProps || {});
        // help out EventApi from having user modify props
        Object.freeze(def.ui.classNames);
        Object.freeze(def.extendedProps);
        return def;
    }
    function createEventInstance(defId, range, forcedStartTzo, forcedEndTzo) {
        return {
            instanceId: String(uid++),
            defId: defId,
            range: range,
            forcedStartTzo: forcedStartTzo == null ? null : forcedStartTzo,
            forcedEndTzo: forcedEndTzo == null ? null : forcedEndTzo
        };
    }
    function parseSingle(raw, allDayDefault, calendar, leftovers, allowOpenRange) {
        var props = pluckDateProps(raw, leftovers);
        var allDay = props.allDay;
        var startMeta;
        var startMarker = null;
        var hasEnd = false;
        var endMeta;
        var endMarker = null;
        startMeta = calendar.dateEnv.createMarkerMeta(props.start);
        if (startMeta) {
            startMarker = startMeta.marker;
        }
        else if (!allowOpenRange) {
            return null;
        }
        if (props.end != null) {
            endMeta = calendar.dateEnv.createMarkerMeta(props.end);
        }
        if (allDay == null) {
            if (allDayDefault != null) {
                allDay = allDayDefault;
            }
            else {
                // fall back to the date props LAST
                allDay = (!startMeta || startMeta.isTimeUnspecified) &&
                    (!endMeta || endMeta.isTimeUnspecified);
            }
        }
        if (allDay && startMarker) {
            startMarker = startOfDay(startMarker);
        }
        if (endMeta) {
            endMarker = endMeta.marker;
            if (allDay) {
                endMarker = startOfDay(endMarker);
            }
            if (startMarker && endMarker <= startMarker) {
                endMarker = null;
            }
        }
        if (endMarker) {
            hasEnd = true;
        }
        else if (!allowOpenRange) {
            hasEnd = calendar.opt('forceEventDuration') || false;
            endMarker = calendar.dateEnv.add(startMarker, allDay ?
                calendar.defaultAllDayEventDuration :
                calendar.defaultTimedEventDuration);
        }
        return {
            allDay: allDay,
            hasEnd: hasEnd,
            range: { start: startMarker, end: endMarker },
            forcedStartTzo: startMeta ? startMeta.forcedTzo : null,
            forcedEndTzo: endMeta ? endMeta.forcedTzo : null
        };
    }
    function pluckDateProps(raw, leftovers) {
        var props = refineProps(raw, DATE_PROPS, {}, leftovers);
        props.start = (props.start !== null) ? props.start : props.date;
        delete props.date;
        return props;
    }
    function pluckNonDateProps(raw, calendar, leftovers) {
        var preLeftovers = {};
        var props = refineProps(raw, NON_DATE_PROPS, {}, preLeftovers);
        var ui = processUnscopedUiProps(preLeftovers, calendar, leftovers);
        props.publicId = props.id;
        delete props.id;
        props.ui = ui;
        return props;
    }
    function computeIsAllDayDefault(sourceId, calendar) {
        var res = null;
        if (sourceId) {
            var source = calendar.state.eventSources[sourceId];
            res = source.allDayDefault;
        }
        if (res == null) {
            res = calendar.opt('allDayDefault');
        }
        return res;
    }

    var DEF_DEFAULTS = {
        startTime: '09:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        rendering: 'inverse-background',
        classNames: 'fc-nonbusiness',
        groupId: '_businessHours' // so multiple defs get grouped
    };
    /*
    TODO: pass around as EventDefHash!!!
    */
    function parseBusinessHours(input, calendar) {
        return parseEvents(refineInputs(input), '', calendar);
    }
    function refineInputs(input) {
        var rawDefs;
        if (input === true) {
            rawDefs = [{}]; // will get DEF_DEFAULTS verbatim
        }
        else if (Array.isArray(input)) {
            // if specifying an array, every sub-definition NEEDS a day-of-week
            rawDefs = input.filter(function (rawDef) {
                return rawDef.daysOfWeek;
            });
        }
        else if (typeof input === 'object' && input) { // non-null object
            rawDefs = [input];
        }
        else { // is probably false
            rawDefs = [];
        }
        rawDefs = rawDefs.map(function (rawDef) {
            return __assign({}, DEF_DEFAULTS, rawDef);
        });
        return rawDefs;
    }

    function memoizeRendering(renderFunc, unrenderFunc, dependencies) {
        if (dependencies === void 0) { dependencies = []; }
        var dependents = [];
        var thisContext;
        var prevArgs;
        function unrender() {
            if (prevArgs) {
                for (var _i = 0, dependents_1 = dependents; _i < dependents_1.length; _i++) {
                    var dependent = dependents_1[_i];
                    dependent.unrender();
                }
                if (unrenderFunc) {
                    unrenderFunc.apply(thisContext, prevArgs);
                }
                prevArgs = null;
            }
        }
        function res() {
            if (!prevArgs || !isArraysEqual(prevArgs, arguments)) {
                unrender();
                thisContext = this;
                prevArgs = arguments;
                renderFunc.apply(this, arguments);
            }
        }
        res.dependents = dependents;
        res.unrender = unrender;
        for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            var dependency = dependencies_1[_i];
            dependency.dependents.push(res);
        }
        return res;
    }

    var EMPTY_EVENT_STORE = createEmptyEventStore(); // for purecomponents. TODO: keep elsewhere
    var Splitter = /** @class */ (function () {
        function Splitter() {
            this.getKeysForEventDefs = memoize(this._getKeysForEventDefs);
            this.splitDateSelection = memoize(this._splitDateSpan);
            this.splitEventStore = memoize(this._splitEventStore);
            this.splitIndividualUi = memoize(this._splitIndividualUi);
            this.splitEventDrag = memoize(this._splitInteraction);
            this.splitEventResize = memoize(this._splitInteraction);
            this.eventUiBuilders = {}; // TODO: typescript protection
        }
        Splitter.prototype.splitProps = function (props) {
            var _this = this;
            var keyInfos = this.getKeyInfo(props);
            var defKeys = this.getKeysForEventDefs(props.eventStore);
            var dateSelections = this.splitDateSelection(props.dateSelection);
            var individualUi = this.splitIndividualUi(props.eventUiBases, defKeys); // the individual *bases*
            var eventStores = this.splitEventStore(props.eventStore, defKeys);
            var eventDrags = this.splitEventDrag(props.eventDrag);
            var eventResizes = this.splitEventResize(props.eventResize);
            var splitProps = {};
            this.eventUiBuilders = mapHash(keyInfos, function (info, key) {
                return _this.eventUiBuilders[key] || memoize(buildEventUiForKey);
            });
            for (var key in keyInfos) {
                var keyInfo = keyInfos[key];
                var eventStore = eventStores[key] || EMPTY_EVENT_STORE;
                var buildEventUi = this.eventUiBuilders[key];
                splitProps[key] = {
                    businessHours: keyInfo.businessHours || props.businessHours,
                    dateSelection: dateSelections[key] || null,
                    eventStore: eventStore,
                    eventUiBases: buildEventUi(props.eventUiBases[''], keyInfo.ui, individualUi[key]),
                    eventSelection: eventStore.instances[props.eventSelection] ? props.eventSelection : '',
                    eventDrag: eventDrags[key] || null,
                    eventResize: eventResizes[key] || null
                };
            }
            return splitProps;
        };
        Splitter.prototype._splitDateSpan = function (dateSpan) {
            var dateSpans = {};
            if (dateSpan) {
                var keys = this.getKeysForDateSpan(dateSpan);
                for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                    var key = keys_1[_i];
                    dateSpans[key] = dateSpan;
                }
            }
            return dateSpans;
        };
        Splitter.prototype._getKeysForEventDefs = function (eventStore) {
            var _this = this;
            return mapHash(eventStore.defs, function (eventDef) {
                return _this.getKeysForEventDef(eventDef);
            });
        };
        Splitter.prototype._splitEventStore = function (eventStore, defKeys) {
            var defs = eventStore.defs, instances = eventStore.instances;
            var splitStores = {};
            for (var defId in defs) {
                for (var _i = 0, _a = defKeys[defId]; _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (!splitStores[key]) {
                        splitStores[key] = createEmptyEventStore();
                    }
                    splitStores[key].defs[defId] = defs[defId];
                }
            }
            for (var instanceId in instances) {
                var instance = instances[instanceId];
                for (var _b = 0, _c = defKeys[instance.defId]; _b < _c.length; _b++) {
                    var key = _c[_b];
                    if (splitStores[key]) { // must have already been created
                        splitStores[key].instances[instanceId] = instance;
                    }
                }
            }
            return splitStores;
        };
        Splitter.prototype._splitIndividualUi = function (eventUiBases, defKeys) {
            var splitHashes = {};
            for (var defId in eventUiBases) {
                if (defId) { // not the '' key
                    for (var _i = 0, _a = defKeys[defId]; _i < _a.length; _i++) {
                        var key = _a[_i];
                        if (!splitHashes[key]) {
                            splitHashes[key] = {};
                        }
                        splitHashes[key][defId] = eventUiBases[defId];
                    }
                }
            }
            return splitHashes;
        };
        Splitter.prototype._splitInteraction = function (interaction) {
            var splitStates = {};
            if (interaction) {
                var affectedStores_1 = this._splitEventStore(interaction.affectedEvents, this._getKeysForEventDefs(interaction.affectedEvents) // can't use cached. might be events from other calendar
                );
                // can't rely on defKeys because event data is mutated
                var mutatedKeysByDefId = this._getKeysForEventDefs(interaction.mutatedEvents);
                var mutatedStores_1 = this._splitEventStore(interaction.mutatedEvents, mutatedKeysByDefId);
                var populate = function (key) {
                    if (!splitStates[key]) {
                        splitStates[key] = {
                            affectedEvents: affectedStores_1[key] || EMPTY_EVENT_STORE,
                            mutatedEvents: mutatedStores_1[key] || EMPTY_EVENT_STORE,
                            isEvent: interaction.isEvent,
                            origSeg: interaction.origSeg
                        };
                    }
                };
                for (var key in affectedStores_1) {
                    populate(key);
                }
                for (var key in mutatedStores_1) {
                    populate(key);
                }
            }
            return splitStates;
        };
        return Splitter;
    }());
    function buildEventUiForKey(allUi, eventUiForKey, individualUi) {
        var baseParts = [];
        if (allUi) {
            baseParts.push(allUi);
        }
        if (eventUiForKey) {
            baseParts.push(eventUiForKey);
        }
        var stuff = {
            '': combineEventUis(baseParts)
        };
        if (individualUi) {
            __assign(stuff, individualUi);
        }
        return stuff;
    }

    // Generates HTML for an anchor to another view into the calendar.
    // Will either generate an <a> tag or a non-clickable <span> tag, depending on enabled settings.
    // `gotoOptions` can either be a DateMarker, or an object with the form:
    // { date, type, forceOff }
    // `type` is a view-type like "day" or "week". default value is "day".
    // `attrs` and `innerHtml` are use to generate the rest of the HTML tag.
    function buildGotoAnchorHtml(allOptions, dateEnv, gotoOptions, attrs, innerHtml) {
        var date;
        var type;
        var forceOff;
        var finalOptions;
        if (gotoOptions instanceof Date) {
            date = gotoOptions; // a single date-like input
        }
        else {
            date = gotoOptions.date;
            type = gotoOptions.type;
            forceOff = gotoOptions.forceOff;
        }
        finalOptions = {
            date: dateEnv.formatIso(date, { omitTime: true }),
            type: type || 'day'
        };
        if (typeof attrs === 'string') {
            innerHtml = attrs;
            attrs = null;
        }
        attrs = attrs ? ' ' + attrsToStr(attrs) : ''; // will have a leading space
        innerHtml = innerHtml || '';
        if (!forceOff && allOptions.navLinks) {
            return '<a' + attrs +
                ' data-goto="' + htmlEscape(JSON.stringify(finalOptions)) + '">' +
                innerHtml +
                '</a>';
        }
        else {
            return '<span' + attrs + '>' +
                innerHtml +
                '</span>';
        }
    }
    function getAllDayHtml(allOptions) {
        return allOptions.allDayHtml || htmlEscape(allOptions.allDayText);
    }
    // Computes HTML classNames for a single-day element
    function getDayClasses(date, dateProfile, context, noThemeHighlight) {
        var calendar = context.calendar, options = context.options, theme = context.theme, dateEnv = context.dateEnv;
        var classes = [];
        var todayStart;
        var todayEnd;
        if (!rangeContainsMarker(dateProfile.activeRange, date)) {
            classes.push('fc-disabled-day');
        }
        else {
            classes.push('fc-' + DAY_IDS[date.getUTCDay()]);
            if (options.monthMode &&
                dateEnv.getMonth(date) !== dateEnv.getMonth(dateProfile.currentRange.start)) {
                classes.push('fc-other-month');
            }
            todayStart = startOfDay(calendar.getNow());
            todayEnd = addDays(todayStart, 1);
            if (date < todayStart) {
                classes.push('fc-past');
            }
            else if (date >= todayEnd) {
                classes.push('fc-future');
            }
            else {
                classes.push('fc-today');
                if (noThemeHighlight !== true) {
                    classes.push(theme.getClass('today'));
                }
            }
        }
        return classes;
    }

    // given a function that resolves a result asynchronously.
    // the function can either call passed-in success and failure callbacks,
    // or it can return a promise.
    // if you need to pass additional params to func, bind them first.
    function unpromisify(func, success, failure) {
        // guard against success/failure callbacks being called more than once
        // and guard against a promise AND callback being used together.
        var isResolved = false;
        var wrappedSuccess = function () {
            if (!isResolved) {
                isResolved = true;
                success.apply(this, arguments);
            }
        };
        var wrappedFailure = function () {
            if (!isResolved) {
                isResolved = true;
                if (failure) {
                    failure.apply(this, arguments);
                }
            }
        };
        var res = func(wrappedSuccess, wrappedFailure);
        if (res && typeof res.then === 'function') {
            res.then(wrappedSuccess, wrappedFailure);
        }
    }

    var Mixin = /** @class */ (function () {
        function Mixin() {
        }
        // mix into a CLASS
        Mixin.mixInto = function (destClass) {
            this.mixIntoObj(destClass.prototype);
        };
        // mix into ANY object
        Mixin.mixIntoObj = function (destObj) {
            var _this = this;
            Object.getOwnPropertyNames(this.prototype).forEach(function (name) {
                if (!destObj[name]) { // if destination doesn't already define it
                    destObj[name] = _this.prototype[name];
                }
            });
        };
        /*
        will override existing methods
        TODO: remove! not used anymore
        */
        Mixin.mixOver = function (destClass) {
            var _this = this;
            Object.getOwnPropertyNames(this.prototype).forEach(function (name) {
                destClass.prototype[name] = _this.prototype[name];
            });
        };
        return Mixin;
    }());

    /*
    USAGE:
      import { default as EmitterMixin, EmitterInterface } from './EmitterMixin'
    in class:
      on: EmitterInterface['on']
      one: EmitterInterface['one']
      off: EmitterInterface['off']
      trigger: EmitterInterface['trigger']
      triggerWith: EmitterInterface['triggerWith']
      hasHandlers: EmitterInterface['hasHandlers']
    after class:
      EmitterMixin.mixInto(TheClass)
    */
    var EmitterMixin = /** @class */ (function (_super) {
        __extends(EmitterMixin, _super);
        function EmitterMixin() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        EmitterMixin.prototype.on = function (type, handler) {
            addToHash(this._handlers || (this._handlers = {}), type, handler);
            return this; // for chaining
        };
        // todo: add comments
        EmitterMixin.prototype.one = function (type, handler) {
            addToHash(this._oneHandlers || (this._oneHandlers = {}), type, handler);
            return this; // for chaining
        };
        EmitterMixin.prototype.off = function (type, handler) {
            if (this._handlers) {
                removeFromHash(this._handlers, type, handler);
            }
            if (this._oneHandlers) {
                removeFromHash(this._oneHandlers, type, handler);
            }
            return this; // for chaining
        };
        EmitterMixin.prototype.trigger = function (type) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            this.triggerWith(type, this, args);
            return this; // for chaining
        };
        EmitterMixin.prototype.triggerWith = function (type, context, args) {
            if (this._handlers) {
                applyAll(this._handlers[type], context, args);
            }
            if (this._oneHandlers) {
                applyAll(this._oneHandlers[type], context, args);
                delete this._oneHandlers[type]; // will never fire again
            }
            return this; // for chaining
        };
        EmitterMixin.prototype.hasHandlers = function (type) {
            return (this._handlers && this._handlers[type] && this._handlers[type].length) ||
                (this._oneHandlers && this._oneHandlers[type] && this._oneHandlers[type].length);
        };
        return EmitterMixin;
    }(Mixin));
    function addToHash(hash, type, handler) {
        (hash[type] || (hash[type] = []))
            .push(handler);
    }
    function removeFromHash(hash, type, handler) {
        if (handler) {
            if (hash[type]) {
                hash[type] = hash[type].filter(function (func) {
                    return func !== handler;
                });
            }
        }
        else {
            delete hash[type]; // remove all handler funcs for this type
        }
    }

    /*
    Records offset information for a set of elements, relative to an origin element.
    Can record the left/right OR the top/bottom OR both.
    Provides methods for querying the cache by position.
    */
    var PositionCache = /** @class */ (function () {
        function PositionCache(originEl, els, isHorizontal, isVertical) {
            this.originEl = originEl;
            this.els = els;
            this.isHorizontal = isHorizontal;
            this.isVertical = isVertical;
        }
        // Queries the els for coordinates and stores them.
        // Call this method before using and of the get* methods below.
        PositionCache.prototype.build = function () {
            var originEl = this.originEl;
            var originClientRect = this.originClientRect =
                originEl.getBoundingClientRect(); // relative to viewport top-left
            if (this.isHorizontal) {
                this.buildElHorizontals(originClientRect.left);
            }
            if (this.isVertical) {
                this.buildElVerticals(originClientRect.top);
            }
        };
        // Populates the left/right internal coordinate arrays
        PositionCache.prototype.buildElHorizontals = function (originClientLeft) {
            var lefts = [];
            var rights = [];
            for (var _i = 0, _a = this.els; _i < _a.length; _i++) {
                var el = _a[_i];
                var rect = el.getBoundingClientRect();
                lefts.push(rect.left - originClientLeft);
                rights.push(rect.right - originClientLeft);
            }
            this.lefts = lefts;
            this.rights = rights;
        };
        // Populates the top/bottom internal coordinate arrays
        PositionCache.prototype.buildElVerticals = function (originClientTop) {
            var tops = [];
            var bottoms = [];
            for (var _i = 0, _a = this.els; _i < _a.length; _i++) {
                var el = _a[_i];
                var rect = el.getBoundingClientRect();
                tops.push(rect.top - originClientTop);
                bottoms.push(rect.bottom - originClientTop);
            }
            this.tops = tops;
            this.bottoms = bottoms;
        };
        // Given a left offset (from document left), returns the index of the el that it horizontally intersects.
        // If no intersection is made, returns undefined.
        PositionCache.prototype.leftToIndex = function (leftPosition) {
            var lefts = this.lefts;
            var rights = this.rights;
            var len = lefts.length;
            var i;
            for (i = 0; i < len; i++) {
                if (leftPosition >= lefts[i] && leftPosition < rights[i]) {
                    return i;
                }
            }
        };
        // Given a top offset (from document top), returns the index of the el that it vertically intersects.
        // If no intersection is made, returns undefined.
        PositionCache.prototype.topToIndex = function (topPosition) {
            var tops = this.tops;
            var bottoms = this.bottoms;
            var len = tops.length;
            var i;
            for (i = 0; i < len; i++) {
                if (topPosition >= tops[i] && topPosition < bottoms[i]) {
                    return i;
                }
            }
        };
        // Gets the width of the element at the given index
        PositionCache.prototype.getWidth = function (leftIndex) {
            return this.rights[leftIndex] - this.lefts[leftIndex];
        };
        // Gets the height of the element at the given index
        PositionCache.prototype.getHeight = function (topIndex) {
            return this.bottoms[topIndex] - this.tops[topIndex];
        };
        return PositionCache;
    }());

    /*
    An object for getting/setting scroll-related information for an element.
    Internally, this is done very differently for window versus DOM element,
    so this object serves as a common interface.
    */
    var ScrollController = /** @class */ (function () {
        function ScrollController() {
        }
        ScrollController.prototype.getMaxScrollTop = function () {
            return this.getScrollHeight() - this.getClientHeight();
        };
        ScrollController.prototype.getMaxScrollLeft = function () {
            return this.getScrollWidth() - this.getClientWidth();
        };
        ScrollController.prototype.canScrollVertically = function () {
            return this.getMaxScrollTop() > 0;
        };
        ScrollController.prototype.canScrollHorizontally = function () {
            return this.getMaxScrollLeft() > 0;
        };
        ScrollController.prototype.canScrollUp = function () {
            return this.getScrollTop() > 0;
        };
        ScrollController.prototype.canScrollDown = function () {
            return this.getScrollTop() < this.getMaxScrollTop();
        };
        ScrollController.prototype.canScrollLeft = function () {
            return this.getScrollLeft() > 0;
        };
        ScrollController.prototype.canScrollRight = function () {
            return this.getScrollLeft() < this.getMaxScrollLeft();
        };
        return ScrollController;
    }());
    var ElementScrollController = /** @class */ (function (_super) {
        __extends(ElementScrollController, _super);
        function ElementScrollController(el) {
            var _this = _super.call(this) || this;
            _this.el = el;
            return _this;
        }
        ElementScrollController.prototype.getScrollTop = function () {
            return this.el.scrollTop;
        };
        ElementScrollController.prototype.getScrollLeft = function () {
            return this.el.scrollLeft;
        };
        ElementScrollController.prototype.setScrollTop = function (top) {
            this.el.scrollTop = top;
        };
        ElementScrollController.prototype.setScrollLeft = function (left) {
            this.el.scrollLeft = left;
        };
        ElementScrollController.prototype.getScrollWidth = function () {
            return this.el.scrollWidth;
        };
        ElementScrollController.prototype.getScrollHeight = function () {
            return this.el.scrollHeight;
        };
        ElementScrollController.prototype.getClientHeight = function () {
            return this.el.clientHeight;
        };
        ElementScrollController.prototype.getClientWidth = function () {
            return this.el.clientWidth;
        };
        return ElementScrollController;
    }(ScrollController));
    var WindowScrollController = /** @class */ (function (_super) {
        __extends(WindowScrollController, _super);
        function WindowScrollController() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        WindowScrollController.prototype.getScrollTop = function () {
            return window.pageYOffset;
        };
        WindowScrollController.prototype.getScrollLeft = function () {
            return window.pageXOffset;
        };
        WindowScrollController.prototype.setScrollTop = function (n) {
            window.scroll(window.pageXOffset, n);
        };
        WindowScrollController.prototype.setScrollLeft = function (n) {
            window.scroll(n, window.pageYOffset);
        };
        WindowScrollController.prototype.getScrollWidth = function () {
            return document.documentElement.scrollWidth;
        };
        WindowScrollController.prototype.getScrollHeight = function () {
            return document.documentElement.scrollHeight;
        };
        WindowScrollController.prototype.getClientHeight = function () {
            return document.documentElement.clientHeight;
        };
        WindowScrollController.prototype.getClientWidth = function () {
            return document.documentElement.clientWidth;
        };
        return WindowScrollController;
    }(ScrollController));

    /*
    Embodies a div that has potential scrollbars
    */
    var ScrollComponent = /** @class */ (function (_super) {
        __extends(ScrollComponent, _super);
        function ScrollComponent(overflowX, overflowY) {
            var _this = _super.call(this, createElement('div', {
                className: 'fc-scroller'
            })) || this;
            _this.overflowX = overflowX;
            _this.overflowY = overflowY;
            _this.applyOverflow();
            return _this;
        }
        // sets to natural height, unlocks overflow
        ScrollComponent.prototype.clear = function () {
            this.setHeight('auto');
            this.applyOverflow();
        };
        ScrollComponent.prototype.destroy = function () {
            removeElement(this.el);
        };
        // Overflow
        // -----------------------------------------------------------------------------------------------------------------
        ScrollComponent.prototype.applyOverflow = function () {
            applyStyle(this.el, {
                overflowX: this.overflowX,
                overflowY: this.overflowY
            });
        };
        // Causes any 'auto' overflow values to resolves to 'scroll' or 'hidden'.
        // Useful for preserving scrollbar widths regardless of future resizes.
        // Can pass in scrollbarWidths for optimization.
        ScrollComponent.prototype.lockOverflow = function (scrollbarWidths) {
            var overflowX = this.overflowX;
            var overflowY = this.overflowY;
            scrollbarWidths = scrollbarWidths || this.getScrollbarWidths();
            if (overflowX === 'auto') {
                overflowX = (scrollbarWidths.bottom || // horizontal scrollbars?
                    this.canScrollHorizontally() // OR scrolling pane with massless scrollbars?
                ) ? 'scroll' : 'hidden';
            }
            if (overflowY === 'auto') {
                overflowY = (scrollbarWidths.left || scrollbarWidths.right || // horizontal scrollbars?
                    this.canScrollVertically() // OR scrolling pane with massless scrollbars?
                ) ? 'scroll' : 'hidden';
            }
            applyStyle(this.el, { overflowX: overflowX, overflowY: overflowY });
        };
        ScrollComponent.prototype.setHeight = function (height) {
            applyStyleProp(this.el, 'height', height);
        };
        ScrollComponent.prototype.getScrollbarWidths = function () {
            var edges = computeEdges(this.el);
            return {
                left: edges.scrollbarLeft,
                right: edges.scrollbarRight,
                bottom: edges.scrollbarBottom
            };
        };
        return ScrollComponent;
    }(ElementScrollController));

    var Theme = /** @class */ (function () {
        function Theme(calendarOptions) {
            this.calendarOptions = calendarOptions;
            this.processIconOverride();
        }
        Theme.prototype.processIconOverride = function () {
            if (this.iconOverrideOption) {
                this.setIconOverride(this.calendarOptions[this.iconOverrideOption]);
            }
        };
        Theme.prototype.setIconOverride = function (iconOverrideHash) {
            var iconClassesCopy;
            var buttonName;
            if (typeof iconOverrideHash === 'object' && iconOverrideHash) { // non-null object
                iconClassesCopy = __assign({}, this.iconClasses);
                for (buttonName in iconOverrideHash) {
                    iconClassesCopy[buttonName] = this.applyIconOverridePrefix(iconOverrideHash[buttonName]);
                }
                this.iconClasses = iconClassesCopy;
            }
            else if (iconOverrideHash === false) {
                this.iconClasses = {};
            }
        };
        Theme.prototype.applyIconOverridePrefix = function (className) {
            var prefix = this.iconOverridePrefix;
            if (prefix && className.indexOf(prefix) !== 0) { // if not already present
                className = prefix + className;
            }
            return className;
        };
        Theme.prototype.getClass = function (key) {
            return this.classes[key] || '';
        };
        Theme.prototype.getIconClass = function (buttonName) {
            var className = this.iconClasses[buttonName];
            if (className) {
                return this.baseIconClass + ' ' + className;
            }
            return '';
        };
        Theme.prototype.getCustomButtonIconClass = function (customButtonProps) {
            var className;
            if (this.iconOverrideCustomButtonOption) {
                className = customButtonProps[this.iconOverrideCustomButtonOption];
                if (className) {
                    return this.baseIconClass + ' ' + this.applyIconOverridePrefix(className);
                }
            }
            return '';
        };
        return Theme;
    }());
    Theme.prototype.classes = {};
    Theme.prototype.iconClasses = {};
    Theme.prototype.baseIconClass = '';
    Theme.prototype.iconOverridePrefix = '';

    var guid = 0;
    var ComponentContext = /** @class */ (function () {
        function ComponentContext(calendar, theme, dateEnv, options, view) {
            this.calendar = calendar;
            this.theme = theme;
            this.dateEnv = dateEnv;
            this.options = options;
            this.view = view;
            this.isRtl = options.dir === 'rtl';
            this.eventOrderSpecs = parseFieldSpecs(options.eventOrder);
            this.nextDayThreshold = createDuration(options.nextDayThreshold);
        }
        ComponentContext.prototype.extend = function (options, view) {
            return new ComponentContext(this.calendar, this.theme, this.dateEnv, options || this.options, view || this.view);
        };
        return ComponentContext;
    }());
    var Component = /** @class */ (function () {
        function Component() {
            this.everRendered = false;
            this.uid = String(guid++);
        }
        Component.addEqualityFuncs = function (newFuncs) {
            this.prototype.equalityFuncs = __assign({}, this.prototype.equalityFuncs, newFuncs);
        };
        Component.prototype.receiveProps = function (props, context) {
            this.receiveContext(context);
            var _a = recycleProps(this.props || {}, props, this.equalityFuncs), anyChanges = _a.anyChanges, comboProps = _a.comboProps;
            this.props = comboProps;
            if (anyChanges) {
                if (this.everRendered) {
                    this.beforeUpdate();
                }
                this.render(comboProps, context);
                if (this.everRendered) {
                    this.afterUpdate();
                }
            }
            this.everRendered = true;
        };
        Component.prototype.receiveContext = function (context) {
            var oldContext = this.context;
            this.context = context;
            if (!oldContext) {
                this.firstContext(context);
            }
        };
        Component.prototype.render = function (props, context) {
        };
        Component.prototype.firstContext = function (context) {
        };
        Component.prototype.beforeUpdate = function () {
        };
        Component.prototype.afterUpdate = function () {
        };
        // after destroy is called, this component won't ever be used again
        Component.prototype.destroy = function () {
        };
        return Component;
    }());
    Component.prototype.equalityFuncs = {};
    /*
    Reuses old values when equal. If anything is unequal, returns newProps as-is.
    Great for PureComponent, but won't be feasible with React, so just eliminate and use React's DOM diffing.
    */
    function recycleProps(oldProps, newProps, equalityFuncs) {
        var comboProps = {}; // some old, some new
        var anyChanges = false;
        for (var key in newProps) {
            if (key in oldProps && (oldProps[key] === newProps[key] ||
                (equalityFuncs[key] && equalityFuncs[key](oldProps[key], newProps[key])))) {
                // equal to old? use old prop
                comboProps[key] = oldProps[key];
            }
            else {
                comboProps[key] = newProps[key];
                anyChanges = true;
            }
        }
        for (var key in oldProps) {
            if (!(key in newProps)) {
                anyChanges = true;
                break;
            }
        }
        return { anyChanges: anyChanges, comboProps: comboProps };
    }

    /*
    PURPOSES:
    - hook up to fg, fill, and mirror renderers
    - interface for dragging and hits
    */
    var DateComponent = /** @class */ (function (_super) {
        __extends(DateComponent, _super);
        function DateComponent(el) {
            var _this = _super.call(this) || this;
            _this.el = el;
            return _this;
        }
        DateComponent.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            removeElement(this.el);
        };
        // Hit System
        // -----------------------------------------------------------------------------------------------------------------
        DateComponent.prototype.buildPositionCaches = function () {
        };
        DateComponent.prototype.queryHit = function (positionLeft, positionTop, elWidth, elHeight) {
            return null; // this should be abstract
        };
        // Validation
        // -----------------------------------------------------------------------------------------------------------------
        DateComponent.prototype.isInteractionValid = function (interaction) {
            var calendar = this.context.calendar;
            var dateProfile = this.props.dateProfile; // HACK
            var instances = interaction.mutatedEvents.instances;
            if (dateProfile) { // HACK for DayTile
                for (var instanceId in instances) {
                    if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
                        return false;
                    }
                }
            }
            return isInteractionValid(interaction, calendar);
        };
        DateComponent.prototype.isDateSelectionValid = function (selection) {
            var calendar = this.context.calendar;
            var dateProfile = this.props.dateProfile; // HACK
            if (dateProfile && // HACK for DayTile
                !rangeContainsRange(dateProfile.validRange, selection.range)) {
                return false;
            }
            return isDateSelectionValid(selection, calendar);
        };
        // Pointer Interaction Utils
        // -----------------------------------------------------------------------------------------------------------------
        DateComponent.prototype.isValidSegDownEl = function (el) {
            return !this.props.eventDrag && // HACK
                !this.props.eventResize && // HACK
                !elementClosest(el, '.fc-mirror') &&
                (this.isPopover() || !this.isInPopover(el));
            // ^above line ensures we don't detect a seg interaction within a nested component.
            // it's a HACK because it only supports a popover as the nested component.
        };
        DateComponent.prototype.isValidDateDownEl = function (el) {
            var segEl = elementClosest(el, this.fgSegSelector);
            return (!segEl || segEl.classList.contains('fc-mirror')) &&
                !elementClosest(el, '.fc-more') && // a "more.." link
                !elementClosest(el, 'a[data-goto]') && // a clickable nav link
                !this.isInPopover(el);
        };
        DateComponent.prototype.isPopover = function () {
            return this.el.classList.contains('fc-popover');
        };
        DateComponent.prototype.isInPopover = function (el) {
            return Boolean(elementClosest(el, '.fc-popover'));
        };
        return DateComponent;
    }(Component));
    DateComponent.prototype.fgSegSelector = '.fc-event-container > *';
    DateComponent.prototype.bgSegSelector = '.fc-bgevent:not(.fc-nonbusiness)';

    var uid$1 = 0;
    function createPlugin(input) {
        return {
            id: String(uid$1++),
            deps: input.deps || [],
            reducers: input.reducers || [],
            eventDefParsers: input.eventDefParsers || [],
            isDraggableTransformers: input.isDraggableTransformers || [],
            eventDragMutationMassagers: input.eventDragMutationMassagers || [],
            eventDefMutationAppliers: input.eventDefMutationAppliers || [],
            dateSelectionTransformers: input.dateSelectionTransformers || [],
            datePointTransforms: input.datePointTransforms || [],
            dateSpanTransforms: input.dateSpanTransforms || [],
            views: input.views || {},
            viewPropsTransformers: input.viewPropsTransformers || [],
            isPropsValid: input.isPropsValid || null,
            externalDefTransforms: input.externalDefTransforms || [],
            eventResizeJoinTransforms: input.eventResizeJoinTransforms || [],
            viewContainerModifiers: input.viewContainerModifiers || [],
            eventDropTransformers: input.eventDropTransformers || [],
            componentInteractions: input.componentInteractions || [],
            calendarInteractions: input.calendarInteractions || [],
            themeClasses: input.themeClasses || {},
            eventSourceDefs: input.eventSourceDefs || [],
            cmdFormatter: input.cmdFormatter,
            recurringTypes: input.recurringTypes || [],
            namedTimeZonedImpl: input.namedTimeZonedImpl,
            defaultView: input.defaultView || '',
            elementDraggingImpl: input.elementDraggingImpl,
            optionChangeHandlers: input.optionChangeHandlers || {}
        };
    }
    var PluginSystem = /** @class */ (function () {
        function PluginSystem() {
            this.hooks = {
                reducers: [],
                eventDefParsers: [],
                isDraggableTransformers: [],
                eventDragMutationMassagers: [],
                eventDefMutationAppliers: [],
                dateSelectionTransformers: [],
                datePointTransforms: [],
                dateSpanTransforms: [],
                views: {},
                viewPropsTransformers: [],
                isPropsValid: null,
                externalDefTransforms: [],
                eventResizeJoinTransforms: [],
                viewContainerModifiers: [],
                eventDropTransformers: [],
                componentInteractions: [],
                calendarInteractions: [],
                themeClasses: {},
                eventSourceDefs: [],
                cmdFormatter: null,
                recurringTypes: [],
                namedTimeZonedImpl: null,
                defaultView: '',
                elementDraggingImpl: null,
                optionChangeHandlers: {}
            };
            this.addedHash = {};
        }
        PluginSystem.prototype.add = function (plugin) {
            if (!this.addedHash[plugin.id]) {
                this.addedHash[plugin.id] = true;
                for (var _i = 0, _a = plugin.deps; _i < _a.length; _i++) {
                    var dep = _a[_i];
                    this.add(dep);
                }
                this.hooks = combineHooks(this.hooks, plugin);
            }
        };
        return PluginSystem;
    }());
    function combineHooks(hooks0, hooks1) {
        return {
            reducers: hooks0.reducers.concat(hooks1.reducers),
            eventDefParsers: hooks0.eventDefParsers.concat(hooks1.eventDefParsers),
            isDraggableTransformers: hooks0.isDraggableTransformers.concat(hooks1.isDraggableTransformers),
            eventDragMutationMassagers: hooks0.eventDragMutationMassagers.concat(hooks1.eventDragMutationMassagers),
            eventDefMutationAppliers: hooks0.eventDefMutationAppliers.concat(hooks1.eventDefMutationAppliers),
            dateSelectionTransformers: hooks0.dateSelectionTransformers.concat(hooks1.dateSelectionTransformers),
            datePointTransforms: hooks0.datePointTransforms.concat(hooks1.datePointTransforms),
            dateSpanTransforms: hooks0.dateSpanTransforms.concat(hooks1.dateSpanTransforms),
            views: __assign({}, hooks0.views, hooks1.views),
            viewPropsTransformers: hooks0.viewPropsTransformers.concat(hooks1.viewPropsTransformers),
            isPropsValid: hooks1.isPropsValid || hooks0.isPropsValid,
            externalDefTransforms: hooks0.externalDefTransforms.concat(hooks1.externalDefTransforms),
            eventResizeJoinTransforms: hooks0.eventResizeJoinTransforms.concat(hooks1.eventResizeJoinTransforms),
            viewContainerModifiers: hooks0.viewContainerModifiers.concat(hooks1.viewContainerModifiers),
            eventDropTransformers: hooks0.eventDropTransformers.concat(hooks1.eventDropTransformers),
            calendarInteractions: hooks0.calendarInteractions.concat(hooks1.calendarInteractions),
            componentInteractions: hooks0.componentInteractions.concat(hooks1.componentInteractions),
            themeClasses: __assign({}, hooks0.themeClasses, hooks1.themeClasses),
            eventSourceDefs: hooks0.eventSourceDefs.concat(hooks1.eventSourceDefs),
            cmdFormatter: hooks1.cmdFormatter || hooks0.cmdFormatter,
            recurringTypes: hooks0.recurringTypes.concat(hooks1.recurringTypes),
            namedTimeZonedImpl: hooks1.namedTimeZonedImpl || hooks0.namedTimeZonedImpl,
            defaultView: hooks0.defaultView || hooks1.defaultView,
            elementDraggingImpl: hooks0.elementDraggingImpl || hooks1.elementDraggingImpl,
            optionChangeHandlers: __assign({}, hooks0.optionChangeHandlers, hooks1.optionChangeHandlers)
        };
    }

    var eventSourceDef = {
        ignoreRange: true,
        parseMeta: function (raw) {
            if (Array.isArray(raw)) { // short form
                return raw;
            }
            else if (Array.isArray(raw.events)) {
                return raw.events;
            }
            return null;
        },
        fetch: function (arg, success) {
            success({
                rawEvents: arg.eventSource.meta
            });
        }
    };
    var ArrayEventSourcePlugin = createPlugin({
        eventSourceDefs: [eventSourceDef]
    });

    var eventSourceDef$1 = {
        parseMeta: function (raw) {
            if (typeof raw === 'function') { // short form
                return raw;
            }
            else if (typeof raw.events === 'function') {
                return raw.events;
            }
            return null;
        },
        fetch: function (arg, success, failure) {
            var dateEnv = arg.calendar.dateEnv;
            var func = arg.eventSource.meta;
            unpromisify(func.bind(null, {
                start: dateEnv.toDate(arg.range.start),
                end: dateEnv.toDate(arg.range.end),
                startStr: dateEnv.formatIso(arg.range.start),
                endStr: dateEnv.formatIso(arg.range.end),
                timeZone: dateEnv.timeZone
            }), function (rawEvents) {
                success({ rawEvents: rawEvents }); // needs an object response
            }, failure // send errorObj directly to failure callback
            );
        }
    };
    var FuncEventSourcePlugin = createPlugin({
        eventSourceDefs: [eventSourceDef$1]
    });

    function requestJson(method, url, params, successCallback, failureCallback) {
        method = method.toUpperCase();
        var body = null;
        if (method === 'GET') {
            url = injectQueryStringParams(url, params);
        }
        else {
            body = encodeParams(params);
        }
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (method !== 'GET') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                try {
                    var res = JSON.parse(xhr.responseText);
                    successCallback(res, xhr);
                }
                catch (err) {
                    failureCallback('Failure parsing JSON', xhr);
                }
            }
            else {
                failureCallback('Request failed', xhr);
            }
        };
        xhr.onerror = function () {
            failureCallback('Request failed', xhr);
        };
        xhr.send(body);
    }
    function injectQueryStringParams(url, params) {
        return url +
            (url.indexOf('?') === -1 ? '?' : '&') +
            encodeParams(params);
    }
    function encodeParams(params) {
        var parts = [];
        for (var key in params) {
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        return parts.join('&');
    }

    var eventSourceDef$2 = {
        parseMeta: function (raw) {
            if (typeof raw === 'string') { // short form
                raw = { url: raw };
            }
            else if (!raw || typeof raw !== 'object' || !raw.url) {
                return null;
            }
            return {
                url: raw.url,
                method: (raw.method || 'GET').toUpperCase(),
                extraParams: raw.extraParams,
                startParam: raw.startParam,
                endParam: raw.endParam,
                timeZoneParam: raw.timeZoneParam
            };
        },
        fetch: function (arg, success, failure) {
            var meta = arg.eventSource.meta;
            var requestParams = buildRequestParams(meta, arg.range, arg.calendar);
            requestJson(meta.method, meta.url, requestParams, function (rawEvents, xhr) {
                success({ rawEvents: rawEvents, xhr: xhr });
            }, function (errorMessage, xhr) {
                failure({ message: errorMessage, xhr: xhr });
            });
        }
    };
    var JsonFeedEventSourcePlugin = createPlugin({
        eventSourceDefs: [eventSourceDef$2]
    });
    function buildRequestParams(meta, range, calendar) {
        var dateEnv = calendar.dateEnv;
        var startParam;
        var endParam;
        var timeZoneParam;
        var customRequestParams;
        var params = {};
        startParam = meta.startParam;
        if (startParam == null) {
            startParam = calendar.opt('startParam');
        }
        endParam = meta.endParam;
        if (endParam == null) {
            endParam = calendar.opt('endParam');
        }
        timeZoneParam = meta.timeZoneParam;
        if (timeZoneParam == null) {
            timeZoneParam = calendar.opt('timeZoneParam');
        }
        // retrieve any outbound GET/POST data from the options
        if (typeof meta.extraParams === 'function') {
            // supplied as a function that returns a key/value object
            customRequestParams = meta.extraParams();
        }
        else {
            // probably supplied as a straight key/value object
            customRequestParams = meta.extraParams || {};
        }
        __assign(params, customRequestParams);
        params[startParam] = dateEnv.formatIso(range.start);
        params[endParam] = dateEnv.formatIso(range.end);
        if (dateEnv.timeZone !== 'local') {
            params[timeZoneParam] = dateEnv.timeZone;
        }
        return params;
    }

    var recurring = {
        parse: function (rawEvent, leftoverProps, dateEnv) {
            var createMarker = dateEnv.createMarker.bind(dateEnv);
            var processors = {
                daysOfWeek: null,
                startTime: createDuration,
                endTime: createDuration,
                startRecur: createMarker,
                endRecur: createMarker
            };
            var props = refineProps(rawEvent, processors, {}, leftoverProps);
            var anyValid = false;
            for (var propName in props) {
                if (props[propName] != null) {
                    anyValid = true;
                    break;
                }
            }
            if (anyValid) {
                var duration = null;
                if ('duration' in leftoverProps) {
                    duration = createDuration(leftoverProps.duration);
                    delete leftoverProps.duration;
                }
                if (!duration && props.startTime && props.endTime) {
                    duration = subtractDurations(props.endTime, props.startTime);
                }
                return {
                    allDayGuess: Boolean(!props.startTime && !props.endTime),
                    duration: duration,
                    typeData: props // doesn't need endTime anymore but oh well
                };
            }
            return null;
        },
        expand: function (typeData, framingRange, dateEnv) {
            var clippedFramingRange = intersectRanges(framingRange, { start: typeData.startRecur, end: typeData.endRecur });
            if (clippedFramingRange) {
                return expandRanges(typeData.daysOfWeek, typeData.startTime, clippedFramingRange, dateEnv);
            }
            else {
                return [];
            }
        }
    };
    var SimpleRecurrencePlugin = createPlugin({
        recurringTypes: [recurring]
    });
    function expandRanges(daysOfWeek, startTime, framingRange, dateEnv) {
        var dowHash = daysOfWeek ? arrayToHash(daysOfWeek) : null;
        var dayMarker = startOfDay(framingRange.start);
        var endMarker = framingRange.end;
        var instanceStarts = [];
        while (dayMarker < endMarker) {
            var instanceStart 
            // if everyday, or this particular day-of-week
            = void 0;
            // if everyday, or this particular day-of-week
            if (!dowHash || dowHash[dayMarker.getUTCDay()]) {
                if (startTime) {
                    instanceStart = dateEnv.add(dayMarker, startTime);
                }
                else {
                    instanceStart = dayMarker;
                }
                instanceStarts.push(instanceStart);
            }
            dayMarker = addDays(dayMarker, 1);
        }
        return instanceStarts;
    }

    var DefaultOptionChangeHandlers = createPlugin({
        optionChangeHandlers: {
            events: function (events, calendar, deepEqual) {
                handleEventSources([events], calendar, deepEqual);
            },
            eventSources: handleEventSources,
            plugins: handlePlugins
        }
    });
    function handleEventSources(inputs, calendar, deepEqual) {
        var unfoundSources = hashValuesToArray(calendar.state.eventSources);
        var newInputs = [];
        for (var _i = 0, inputs_1 = inputs; _i < inputs_1.length; _i++) {
            var input = inputs_1[_i];
            var inputFound = false;
            for (var i = 0; i < unfoundSources.length; i++) {
                if (deepEqual(unfoundSources[i]._raw, input)) {
                    unfoundSources.splice(i, 1); // delete
                    inputFound = true;
                    break;
                }
            }
            if (!inputFound) {
                newInputs.push(input);
            }
        }
        for (var _a = 0, unfoundSources_1 = unfoundSources; _a < unfoundSources_1.length; _a++) {
            var unfoundSource = unfoundSources_1[_a];
            calendar.dispatch({
                type: 'REMOVE_EVENT_SOURCE',
                sourceId: unfoundSource.sourceId
            });
        }
        for (var _b = 0, newInputs_1 = newInputs; _b < newInputs_1.length; _b++) {
            var newInput = newInputs_1[_b];
            calendar.addEventSource(newInput);
        }
    }
    // shortcoming: won't remove plugins
    function handlePlugins(inputs, calendar) {
        calendar.addPluginInputs(inputs); // will gracefully handle duplicates
    }

    var config = {}; // TODO: make these options
    var globalDefaults = {
        defaultRangeSeparator: ' - ',
        titleRangeSeparator: ' \u2013 ',
        defaultTimedEventDuration: '01:00:00',
        defaultAllDayEventDuration: { day: 1 },
        forceEventDuration: false,
        nextDayThreshold: '00:00:00',
        // display
        columnHeader: true,
        defaultView: '',
        aspectRatio: 1.35,
        header: {
            left: 'title',
            center: '',
            right: 'today prev,next'
        },
        weekends: true,
        weekNumbers: false,
        weekNumberCalculation: 'local',
        editable: false,
        // nowIndicator: false,
        scrollTime: '06:00:00',
        minTime: '00:00:00',
        maxTime: '24:00:00',
        showNonCurrentDates: true,
        // event ajax
        lazyFetching: true,
        startParam: 'start',
        endParam: 'end',
        timeZoneParam: 'timeZone',
        timeZone: 'local',
        // allDayDefault: undefined,
        // locale
        locales: [],
        locale: '',
        // dir: will get this from the default locale
        // buttonIcons: null,
        // allows setting a min-height to the event segment to prevent short events overlapping each other
        timeGridEventMinHeight: 0,
        themeSystem: 'standard',
        // eventResizableFromStart: false,
        dragRevertDuration: 500,
        dragScroll: true,
        allDayMaintainDuration: false,
        // selectable: false,
        unselectAuto: true,
        // selectMinDistance: 0,
        dropAccept: '*',
        eventOrder: 'start,-duration,allDay,title',
        // ^ if start tie, longer events go before shorter. final tie-breaker is title text
        // rerenderDelay: null,
        eventLimit: false,
        eventLimitClick: 'popover',
        dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },
        handleWindowResize: true,
        windowResizeDelay: 100,
        longPressDelay: 1000,
        eventDragMinDistance: 5 // only applies to mouse
    };
    var rtlDefaults = {
        header: {
            left: 'next,prev today',
            center: '',
            right: 'title'
        },
        buttonIcons: {
            // TODO: make RTL support the responibility of the theme
            prev: 'fc-icon-chevron-right',
            next: 'fc-icon-chevron-left',
            prevYear: 'fc-icon-chevrons-right',
            nextYear: 'fc-icon-chevrons-left'
        }
    };
    var complexOptions = [
        'header',
        'footer',
        'buttonText',
        'buttonIcons'
    ];
    // Merges an array of option objects into a single object
    function mergeOptions(optionObjs) {
        return mergeProps(optionObjs, complexOptions);
    }
    // TODO: move this stuff to a "plugin"-related file...
    var INTERNAL_PLUGINS = [
        ArrayEventSourcePlugin,
        FuncEventSourcePlugin,
        JsonFeedEventSourcePlugin,
        SimpleRecurrencePlugin,
        DefaultOptionChangeHandlers
    ];
    function refinePluginDefs(pluginInputs) {
        var plugins = [];
        for (var _i = 0, pluginInputs_1 = pluginInputs; _i < pluginInputs_1.length; _i++) {
            var pluginInput = pluginInputs_1[_i];
            if (typeof pluginInput === 'string') {
                var globalName = 'FullCalendar' + capitaliseFirstLetter(pluginInput);
                if (!window[globalName]) {
                    console.warn('Plugin file not loaded for ' + pluginInput);
                }
                else {
                    plugins.push(window[globalName].default); // is an ES6 module
                }
            }
            else {
                plugins.push(pluginInput);
            }
        }
        return INTERNAL_PLUGINS.concat(plugins);
    }

    var RAW_EN_LOCALE = {
        code: 'en',
        week: {
            dow: 0,
            doy: 4 // 4 days need to be within the year to be considered the first week
        },
        dir: 'ltr',
        buttonText: {
            prev: 'prev',
            next: 'next',
            prevYear: 'prev year',
            nextYear: 'next year',
            year: 'year',
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day',
            list: 'list'
        },
        weekLabel: 'W',
        allDayText: 'all-day',
        eventLimitText: 'more',
        noEventsMessage: 'No events to display'
    };
    function parseRawLocales(explicitRawLocales) {
        var defaultCode = explicitRawLocales.length > 0 ? explicitRawLocales[0].code : 'en';
        var globalArray = window['FullCalendarLocalesAll'] || []; // from locales-all.js
        var globalObject = window['FullCalendarLocales'] || {}; // from locales/*.js. keys are meaningless
        var allRawLocales = globalArray.concat(// globalArray is low prio
        hashValuesToArray(globalObject), // medium prio
        explicitRawLocales // highest prio
        );
        var rawLocaleMap = {
            en: RAW_EN_LOCALE // necessary?
        };
        for (var _i = 0, allRawLocales_1 = allRawLocales; _i < allRawLocales_1.length; _i++) {
            var rawLocale = allRawLocales_1[_i];
            rawLocaleMap[rawLocale.code] = rawLocale;
        }
        return {
            map: rawLocaleMap,
            defaultCode: defaultCode
        };
    }
    function buildLocale(inputSingular, available) {
        if (typeof inputSingular === 'object' && !Array.isArray(inputSingular)) {
            return parseLocale(inputSingular.code, [inputSingular.code], inputSingular);
        }
        else {
            return queryLocale(inputSingular, available);
        }
    }
    function queryLocale(codeArg, available) {
        var codes = [].concat(codeArg || []); // will convert to array
        var raw = queryRawLocale(codes, available) || RAW_EN_LOCALE;
        return parseLocale(codeArg, codes, raw);
    }
    function queryRawLocale(codes, available) {
        for (var i = 0; i < codes.length; i++) {
            var parts = codes[i].toLocaleLowerCase().split('-');
            for (var j = parts.length; j > 0; j--) {
                var simpleId = parts.slice(0, j).join('-');
                if (available[simpleId]) {
                    return available[simpleId];
                }
            }
        }
        return null;
    }
    function parseLocale(codeArg, codes, raw) {
        var merged = mergeProps([RAW_EN_LOCALE, raw], ['buttonText']);
        delete merged.code; // don't want this part of the options
        var week = merged.week;
        delete merged.week;
        return {
            codeArg: codeArg,
            codes: codes,
            week: week,
            simpleNumberFormat: new Intl.NumberFormat(codeArg),
            options: merged
        };
    }

    var OptionsManager = /** @class */ (function () {
        function OptionsManager(overrides) {
            this.overrides = __assign({}, overrides); // make a copy
            this.dynamicOverrides = {};
            this.compute();
        }
        OptionsManager.prototype.mutate = function (updates, removals, isDynamic) {
            if (!Object.keys(updates).length && !removals.length) {
                return;
            }
            var overrideHash = isDynamic ? this.dynamicOverrides : this.overrides;
            __assign(overrideHash, updates);
            for (var _i = 0, removals_1 = removals; _i < removals_1.length; _i++) {
                var propName = removals_1[_i];
                delete overrideHash[propName];
            }
            this.compute();
        };
        // Computes the flattened options hash for the calendar and assigns to `this.options`.
        // Assumes this.overrides and this.dynamicOverrides have already been initialized.
        OptionsManager.prototype.compute = function () {
            // TODO: not a very efficient system
            var locales = firstDefined(// explicit locale option given?
            this.dynamicOverrides.locales, this.overrides.locales, globalDefaults.locales);
            var locale = firstDefined(// explicit locales option given?
            this.dynamicOverrides.locale, this.overrides.locale, globalDefaults.locale);
            var available = parseRawLocales(locales);
            var localeDefaults = buildLocale(locale || available.defaultCode, available.map).options;
            var dir = firstDefined(// based on options computed so far, is direction RTL?
            this.dynamicOverrides.dir, this.overrides.dir, localeDefaults.dir);
            var dirDefaults = dir === 'rtl' ? rtlDefaults : {};
            this.dirDefaults = dirDefaults;
            this.localeDefaults = localeDefaults;
            this.computed = mergeOptions([
                globalDefaults,
                dirDefaults,
                localeDefaults,
                this.overrides,
                this.dynamicOverrides
            ]);
        };
        return OptionsManager;
    }());

    var calendarSystemClassMap = {};
    function registerCalendarSystem(name, theClass) {
        calendarSystemClassMap[name] = theClass;
    }
    function createCalendarSystem(name) {
        return new calendarSystemClassMap[name]();
    }
    var GregorianCalendarSystem = /** @class */ (function () {
        function GregorianCalendarSystem() {
        }
        GregorianCalendarSystem.prototype.getMarkerYear = function (d) {
            return d.getUTCFullYear();
        };
        GregorianCalendarSystem.prototype.getMarkerMonth = function (d) {
            return d.getUTCMonth();
        };
        GregorianCalendarSystem.prototype.getMarkerDay = function (d) {
            return d.getUTCDate();
        };
        GregorianCalendarSystem.prototype.arrayToMarker = function (arr) {
            return arrayToUtcDate(arr);
        };
        GregorianCalendarSystem.prototype.markerToArray = function (marker) {
            return dateToUtcArray(marker);
        };
        return GregorianCalendarSystem;
    }());
    registerCalendarSystem('gregory', GregorianCalendarSystem);

    var ISO_RE = /^\s*(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/;
    function parse(str) {
        var m = ISO_RE.exec(str);
        if (m) {
            var marker = new Date(Date.UTC(Number(m[1]), m[3] ? Number(m[3]) - 1 : 0, Number(m[5] || 1), Number(m[7] || 0), Number(m[8] || 0), Number(m[10] || 0), m[12] ? Number('0.' + m[12]) * 1000 : 0));
            if (isValidDate(marker)) {
                var timeZoneOffset = null;
                if (m[13]) {
                    timeZoneOffset = (m[15] === '-' ? -1 : 1) * (Number(m[16] || 0) * 60 +
                        Number(m[18] || 0));
                }
                return {
                    marker: marker,
                    isTimeUnspecified: !m[6],
                    timeZoneOffset: timeZoneOffset
                };
            }
        }
        return null;
    }

    var DateEnv = /** @class */ (function () {
        function DateEnv(settings) {
            var timeZone = this.timeZone = settings.timeZone;
            var isNamedTimeZone = timeZone !== 'local' && timeZone !== 'UTC';
            if (settings.namedTimeZoneImpl && isNamedTimeZone) {
                this.namedTimeZoneImpl = new settings.namedTimeZoneImpl(timeZone);
            }
            this.canComputeOffset = Boolean(!isNamedTimeZone || this.namedTimeZoneImpl);
            this.calendarSystem = createCalendarSystem(settings.calendarSystem);
            this.locale = settings.locale;
            this.weekDow = settings.locale.week.dow;
            this.weekDoy = settings.locale.week.doy;
            if (settings.weekNumberCalculation === 'ISO') {
                this.weekDow = 1;
                this.weekDoy = 4;
            }
            if (typeof settings.firstDay === 'number') {
                this.weekDow = settings.firstDay;
            }
            if (typeof settings.weekNumberCalculation === 'function') {
                this.weekNumberFunc = settings.weekNumberCalculation;
            }
            this.weekLabel = settings.weekLabel != null ? settings.weekLabel : settings.locale.options.weekLabel;
            this.cmdFormatter = settings.cmdFormatter;
        }
        // Creating / Parsing
        DateEnv.prototype.createMarker = function (input) {
            var meta = this.createMarkerMeta(input);
            if (meta === null) {
                return null;
            }
            return meta.marker;
        };
        DateEnv.prototype.createNowMarker = function () {
            if (this.canComputeOffset) {
                return this.timestampToMarker(new Date().valueOf());
            }
            else {
                // if we can't compute the current date val for a timezone,
                // better to give the current local date vals than UTC
                return arrayToUtcDate(dateToLocalArray(new Date()));
            }
        };
        DateEnv.prototype.createMarkerMeta = function (input) {
            if (typeof input === 'string') {
                return this.parse(input);
            }
            var marker = null;
            if (typeof input === 'number') {
                marker = this.timestampToMarker(input);
            }
            else if (input instanceof Date) {
                input = input.valueOf();
                if (!isNaN(input)) {
                    marker = this.timestampToMarker(input);
                }
            }
            else if (Array.isArray(input)) {
                marker = arrayToUtcDate(input);
            }
            if (marker === null || !isValidDate(marker)) {
                return null;
            }
            return { marker: marker, isTimeUnspecified: false, forcedTzo: null };
        };
        DateEnv.prototype.parse = function (s) {
            var parts = parse(s);
            if (parts === null) {
                return null;
            }
            var marker = parts.marker;
            var forcedTzo = null;
            if (parts.timeZoneOffset !== null) {
                if (this.canComputeOffset) {
                    marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1000);
                }
                else {
                    forcedTzo = parts.timeZoneOffset;
                }
            }
            return { marker: marker, isTimeUnspecified: parts.isTimeUnspecified, forcedTzo: forcedTzo };
        };
        // Accessors
        DateEnv.prototype.getYear = function (marker) {
            return this.calendarSystem.getMarkerYear(marker);
        };
        DateEnv.prototype.getMonth = function (marker) {
            return this.calendarSystem.getMarkerMonth(marker);
        };
        // Adding / Subtracting
        DateEnv.prototype.add = function (marker, dur) {
            var a = this.calendarSystem.markerToArray(marker);
            a[0] += dur.years;
            a[1] += dur.months;
            a[2] += dur.days;
            a[6] += dur.milliseconds;
            return this.calendarSystem.arrayToMarker(a);
        };
        DateEnv.prototype.subtract = function (marker, dur) {
            var a = this.calendarSystem.markerToArray(marker);
            a[0] -= dur.years;
            a[1] -= dur.months;
            a[2] -= dur.days;
            a[6] -= dur.milliseconds;
            return this.calendarSystem.arrayToMarker(a);
        };
        DateEnv.prototype.addYears = function (marker, n) {
            var a = this.calendarSystem.markerToArray(marker);
            a[0] += n;
            return this.calendarSystem.arrayToMarker(a);
        };
        DateEnv.prototype.addMonths = function (marker, n) {
            var a = this.calendarSystem.markerToArray(marker);
            a[1] += n;
            return this.calendarSystem.arrayToMarker(a);
        };
        // Diffing Whole Units
        DateEnv.prototype.diffWholeYears = function (m0, m1) {
            var calendarSystem = this.calendarSystem;
            if (timeAsMs(m0) === timeAsMs(m1) &&
                calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1) &&
                calendarSystem.getMarkerMonth(m0) === calendarSystem.getMarkerMonth(m1)) {
                return calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0);
            }
            return null;
        };
        DateEnv.prototype.diffWholeMonths = function (m0, m1) {
            var calendarSystem = this.calendarSystem;
            if (timeAsMs(m0) === timeAsMs(m1) &&
                calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)) {
                return (calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0)) +
                    (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12;
            }
            return null;
        };
        // Range / Duration
        DateEnv.prototype.greatestWholeUnit = function (m0, m1) {
            var n = this.diffWholeYears(m0, m1);
            if (n !== null) {
                return { unit: 'year', value: n };
            }
            n = this.diffWholeMonths(m0, m1);
            if (n !== null) {
                return { unit: 'month', value: n };
            }
            n = diffWholeWeeks(m0, m1);
            if (n !== null) {
                return { unit: 'week', value: n };
            }
            n = diffWholeDays(m0, m1);
            if (n !== null) {
                return { unit: 'day', value: n };
            }
            n = diffHours(m0, m1);
            if (isInt(n)) {
                return { unit: 'hour', value: n };
            }
            n = diffMinutes(m0, m1);
            if (isInt(n)) {
                return { unit: 'minute', value: n };
            }
            n = diffSeconds(m0, m1);
            if (isInt(n)) {
                return { unit: 'second', value: n };
            }
            return { unit: 'millisecond', value: m1.valueOf() - m0.valueOf() };
        };
        DateEnv.prototype.countDurationsBetween = function (m0, m1, d) {
            // TODO: can use greatestWholeUnit
            var diff;
            if (d.years) {
                diff = this.diffWholeYears(m0, m1);
                if (diff !== null) {
                    return diff / asRoughYears(d);
                }
            }
            if (d.months) {
                diff = this.diffWholeMonths(m0, m1);
                if (diff !== null) {
                    return diff / asRoughMonths(d);
                }
            }
            if (d.days) {
                diff = diffWholeDays(m0, m1);
                if (diff !== null) {
                    return diff / asRoughDays(d);
                }
            }
            return (m1.valueOf() - m0.valueOf()) / asRoughMs(d);
        };
        // Start-Of
        DateEnv.prototype.startOf = function (m, unit) {
            if (unit === 'year') {
                return this.startOfYear(m);
            }
            else if (unit === 'month') {
                return this.startOfMonth(m);
            }
            else if (unit === 'week') {
                return this.startOfWeek(m);
            }
            else if (unit === 'day') {
                return startOfDay(m);
            }
            else if (unit === 'hour') {
                return startOfHour(m);
            }
            else if (unit === 'minute') {
                return startOfMinute(m);
            }
            else if (unit === 'second') {
                return startOfSecond(m);
            }
        };
        DateEnv.prototype.startOfYear = function (m) {
            return this.calendarSystem.arrayToMarker([
                this.calendarSystem.getMarkerYear(m)
            ]);
        };
        DateEnv.prototype.startOfMonth = function (m) {
            return this.calendarSystem.arrayToMarker([
                this.calendarSystem.getMarkerYear(m),
                this.calendarSystem.getMarkerMonth(m)
            ]);
        };
        DateEnv.prototype.startOfWeek = function (m) {
            return this.calendarSystem.arrayToMarker([
                this.calendarSystem.getMarkerYear(m),
                this.calendarSystem.getMarkerMonth(m),
                m.getUTCDate() - ((m.getUTCDay() - this.weekDow + 7) % 7)
            ]);
        };
        // Week Number
        DateEnv.prototype.computeWeekNumber = function (marker) {
            if (this.weekNumberFunc) {
                return this.weekNumberFunc(this.toDate(marker));
            }
            else {
                return weekOfYear(marker, this.weekDow, this.weekDoy);
            }
        };
        // TODO: choke on timeZoneName: long
        DateEnv.prototype.format = function (marker, formatter, dateOptions) {
            if (dateOptions === void 0) { dateOptions = {}; }
            return formatter.format({
                marker: marker,
                timeZoneOffset: dateOptions.forcedTzo != null ?
                    dateOptions.forcedTzo :
                    this.offsetForMarker(marker)
            }, this);
        };
        DateEnv.prototype.formatRange = function (start, end, formatter, dateOptions) {
            if (dateOptions === void 0) { dateOptions = {}; }
            if (dateOptions.isEndExclusive) {
                end = addMs(end, -1);
            }
            return formatter.formatRange({
                marker: start,
                timeZoneOffset: dateOptions.forcedStartTzo != null ?
                    dateOptions.forcedStartTzo :
                    this.offsetForMarker(start)
            }, {
                marker: end,
                timeZoneOffset: dateOptions.forcedEndTzo != null ?
                    dateOptions.forcedEndTzo :
                    this.offsetForMarker(end)
            }, this);
        };
        DateEnv.prototype.formatIso = function (marker, extraOptions) {
            if (extraOptions === void 0) { extraOptions = {}; }
            var timeZoneOffset = null;
            if (!extraOptions.omitTimeZoneOffset) {
                if (extraOptions.forcedTzo != null) {
                    timeZoneOffset = extraOptions.forcedTzo;
                }
                else {
                    timeZoneOffset = this.offsetForMarker(marker);
                }
            }
            return buildIsoString(marker, timeZoneOffset, extraOptions.omitTime);
        };
        // TimeZone
        DateEnv.prototype.timestampToMarker = function (ms) {
            if (this.timeZone === 'local') {
                return arrayToUtcDate(dateToLocalArray(new Date(ms)));
            }
            else if (this.timeZone === 'UTC' || !this.namedTimeZoneImpl) {
                return new Date(ms);
            }
            else {
                return arrayToUtcDate(this.namedTimeZoneImpl.timestampToArray(ms));
            }
        };
        DateEnv.prototype.offsetForMarker = function (m) {
            if (this.timeZone === 'local') {
                return -arrayToLocalDate(dateToUtcArray(m)).getTimezoneOffset(); // convert "inverse" offset to "normal" offset
            }
            else if (this.timeZone === 'UTC') {
                return 0;
            }
            else if (this.namedTimeZoneImpl) {
                return this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m));
            }
            return null;
        };
        // Conversion
        DateEnv.prototype.toDate = function (m, forcedTzo) {
            if (this.timeZone === 'local') {
                return arrayToLocalDate(dateToUtcArray(m));
            }
            else if (this.timeZone === 'UTC') {
                return new Date(m.valueOf()); // make sure it's a copy
            }
            else if (!this.namedTimeZoneImpl) {
                return new Date(m.valueOf() - (forcedTzo || 0));
            }
            else {
                return new Date(m.valueOf() -
                    this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m)) * 1000 * 60 // convert minutes -> ms
                );
            }
        };
        return DateEnv;
    }());

    var SIMPLE_SOURCE_PROPS = {
        id: String,
        allDayDefault: Boolean,
        eventDataTransform: Function,
        success: Function,
        failure: Function
    };
    var uid$2 = 0;
    function doesSourceNeedRange(eventSource, calendar) {
        var defs = calendar.pluginSystem.hooks.eventSourceDefs;
        return !defs[eventSource.sourceDefId].ignoreRange;
    }
    function parseEventSource(raw, calendar) {
        var defs = calendar.pluginSystem.hooks.eventSourceDefs;
        for (var i = defs.length - 1; i >= 0; i--) { // later-added plugins take precedence
            var def = defs[i];
            var meta = def.parseMeta(raw);
            if (meta) {
                var res = parseEventSourceProps(typeof raw === 'object' ? raw : {}, meta, i, calendar);
                res._raw = raw;
                return res;
            }
        }
        return null;
    }
    function parseEventSourceProps(raw, meta, sourceDefId, calendar) {
        var leftovers0 = {};
        var props = refineProps(raw, SIMPLE_SOURCE_PROPS, {}, leftovers0);
        var leftovers1 = {};
        var ui = processUnscopedUiProps(leftovers0, calendar, leftovers1);
        props.isFetching = false;
        props.latestFetchId = '';
        props.fetchRange = null;
        props.publicId = String(raw.id || '');
        props.sourceId = String(uid$2++);
        props.sourceDefId = sourceDefId;
        props.meta = meta;
        props.ui = ui;
        props.extendedProps = leftovers1;
        return props;
    }

    function reduceEventSources (eventSources, action, dateProfile, calendar) {
        switch (action.type) {
            case 'ADD_EVENT_SOURCES': // already parsed
                return addSources(eventSources, action.sources, dateProfile ? dateProfile.activeRange : null, calendar);
            case 'REMOVE_EVENT_SOURCE':
                return removeSource(eventSources, action.sourceId);
            case 'PREV': // TODO: how do we track all actions that affect dateProfile :(
            case 'NEXT':
            case 'SET_DATE':
            case 'SET_VIEW_TYPE':
                if (dateProfile) {
                    return fetchDirtySources(eventSources, dateProfile.activeRange, calendar);
                }
                else {
                    return eventSources;
                }
            case 'FETCH_EVENT_SOURCES':
            case 'CHANGE_TIMEZONE':
                return fetchSourcesByIds(eventSources, action.sourceIds ?
                    arrayToHash(action.sourceIds) :
                    excludeStaticSources(eventSources, calendar), dateProfile ? dateProfile.activeRange : null, calendar);
            case 'RECEIVE_EVENTS':
            case 'RECEIVE_EVENT_ERROR':
                return receiveResponse(eventSources, action.sourceId, action.fetchId, action.fetchRange);
            case 'REMOVE_ALL_EVENT_SOURCES':
                return {};
            default:
                return eventSources;
        }
    }
    var uid$3 = 0;
    function addSources(eventSourceHash, sources, fetchRange, calendar) {
        var hash = {};
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            hash[source.sourceId] = source;
        }
        if (fetchRange) {
            hash = fetchDirtySources(hash, fetchRange, calendar);
        }
        return __assign({}, eventSourceHash, hash);
    }
    function removeSource(eventSourceHash, sourceId) {
        return filterHash(eventSourceHash, function (eventSource) {
            return eventSource.sourceId !== sourceId;
        });
    }
    function fetchDirtySources(sourceHash, fetchRange, calendar) {
        return fetchSourcesByIds(sourceHash, filterHash(sourceHash, function (eventSource) {
            return isSourceDirty(eventSource, fetchRange, calendar);
        }), fetchRange, calendar);
    }
    function isSourceDirty(eventSource, fetchRange, calendar) {
        if (!doesSourceNeedRange(eventSource, calendar)) {
            return !eventSource.latestFetchId;
        }
        else {
            return !calendar.opt('lazyFetching') ||
                !eventSource.fetchRange ||
                eventSource.isFetching || // always cancel outdated in-progress fetches
                fetchRange.start < eventSource.fetchRange.start ||
                fetchRange.end > eventSource.fetchRange.end;
        }
    }
    function fetchSourcesByIds(prevSources, sourceIdHash, fetchRange, calendar) {
        var nextSources = {};
        for (var sourceId in prevSources) {
            var source = prevSources[sourceId];
            if (sourceIdHash[sourceId]) {
                nextSources[sourceId] = fetchSource(source, fetchRange, calendar);
            }
            else {
                nextSources[sourceId] = source;
            }
        }
        return nextSources;
    }
    function fetchSource(eventSource, fetchRange, calendar) {
        var sourceDef = calendar.pluginSystem.hooks.eventSourceDefs[eventSource.sourceDefId];
        var fetchId = String(uid$3++);
        sourceDef.fetch({
            eventSource: eventSource,
            calendar: calendar,
            range: fetchRange
        }, function (res) {
            var rawEvents = res.rawEvents;
            var calSuccess = calendar.opt('eventSourceSuccess');
            var calSuccessRes;
            var sourceSuccessRes;
            if (eventSource.success) {
                sourceSuccessRes = eventSource.success(rawEvents, res.xhr);
            }
            if (calSuccess) {
                calSuccessRes = calSuccess(rawEvents, res.xhr);
            }
            rawEvents = sourceSuccessRes || calSuccessRes || rawEvents;
            calendar.dispatch({
                type: 'RECEIVE_EVENTS',
                sourceId: eventSource.sourceId,
                fetchId: fetchId,
                fetchRange: fetchRange,
                rawEvents: rawEvents
            });
        }, function (error) {
            var callFailure = calendar.opt('eventSourceFailure');
            console.warn(error.message, error);
            if (eventSource.failure) {
                eventSource.failure(error);
            }
            if (callFailure) {
                callFailure(error);
            }
            calendar.dispatch({
                type: 'RECEIVE_EVENT_ERROR',
                sourceId: eventSource.sourceId,
                fetchId: fetchId,
                fetchRange: fetchRange,
                error: error
            });
        });
        return __assign({}, eventSource, { isFetching: true, latestFetchId: fetchId });
    }
    function receiveResponse(sourceHash, sourceId, fetchId, fetchRange) {
        var _a;
        var eventSource = sourceHash[sourceId];
        if (eventSource && // not already removed
            fetchId === eventSource.latestFetchId) {
            return __assign({}, sourceHash, (_a = {}, _a[sourceId] = __assign({}, eventSource, { isFetching: false, fetchRange: fetchRange // also serves as a marker that at least one fetch has completed
             }), _a));
        }
        return sourceHash;
    }
    function excludeStaticSources(eventSources, calendar) {
        return filterHash(eventSources, function (eventSource) {
            return doesSourceNeedRange(eventSource, calendar);
        });
    }

    var DateProfileGenerator = /** @class */ (function () {
        function DateProfileGenerator(viewSpec, calendar) {
            this.viewSpec = viewSpec;
            this.options = viewSpec.options;
            this.dateEnv = calendar.dateEnv;
            this.calendar = calendar;
            this.initHiddenDays();
        }
        /* Date Range Computation
        ------------------------------------------------------------------------------------------------------------------*/
        // Builds a structure with info about what the dates/ranges will be for the "prev" view.
        DateProfileGenerator.prototype.buildPrev = function (currentDateProfile, currentDate) {
            var dateEnv = this.dateEnv;
            var prevDate = dateEnv.subtract(dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
            currentDateProfile.dateIncrement);
            return this.build(prevDate, -1);
        };
        // Builds a structure with info about what the dates/ranges will be for the "next" view.
        DateProfileGenerator.prototype.buildNext = function (currentDateProfile, currentDate) {
            var dateEnv = this.dateEnv;
            var nextDate = dateEnv.add(dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), // important for start-of-month
            currentDateProfile.dateIncrement);
            return this.build(nextDate, 1);
        };
        // Builds a structure holding dates/ranges for rendering around the given date.
        // Optional direction param indicates whether the date is being incremented/decremented
        // from its previous value. decremented = -1, incremented = 1 (default).
        DateProfileGenerator.prototype.build = function (currentDate, direction, forceToValid) {
            if (forceToValid === void 0) { forceToValid = false; }
            var validRange;
            var minTime = null;
            var maxTime = null;
            var currentInfo;
            var isRangeAllDay;
            var renderRange;
            var activeRange;
            var isValid;
            validRange = this.buildValidRange();
            validRange = this.trimHiddenDays(validRange);
            if (forceToValid) {
                currentDate = constrainMarkerToRange(currentDate, validRange);
            }
            currentInfo = this.buildCurrentRangeInfo(currentDate, direction);
            isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit);
            renderRange = this.buildRenderRange(this.trimHiddenDays(currentInfo.range), currentInfo.unit, isRangeAllDay);
            renderRange = this.trimHiddenDays(renderRange);
            activeRange = renderRange;
            if (!this.options.showNonCurrentDates) {
                activeRange = intersectRanges(activeRange, currentInfo.range);
            }
            minTime = createDuration(this.options.minTime);
            maxTime = createDuration(this.options.maxTime);
            activeRange = this.adjustActiveRange(activeRange, minTime, maxTime);
            activeRange = intersectRanges(activeRange, validRange); // might return null
            // it's invalid if the originally requested date is not contained,
            // or if the range is completely outside of the valid range.
            isValid = rangesIntersect(currentInfo.range, validRange);
            return {
                // constraint for where prev/next operations can go and where events can be dragged/resized to.
                // an object with optional start and end properties.
                validRange: validRange,
                // range the view is formally responsible for.
                // for example, a month view might have 1st-31st, excluding padded dates
                currentRange: currentInfo.range,
                // name of largest unit being displayed, like "month" or "week"
                currentRangeUnit: currentInfo.unit,
                isRangeAllDay: isRangeAllDay,
                // dates that display events and accept drag-n-drop
                // will be `null` if no dates accept events
                activeRange: activeRange,
                // date range with a rendered skeleton
                // includes not-active days that need some sort of DOM
                renderRange: renderRange,
                // Duration object that denotes the first visible time of any given day
                minTime: minTime,
                // Duration object that denotes the exclusive visible end time of any given day
                maxTime: maxTime,
                isValid: isValid,
                // how far the current date will move for a prev/next operation
                dateIncrement: this.buildDateIncrement(currentInfo.duration)
                // pass a fallback (might be null) ^
            };
        };
        // Builds an object with optional start/end properties.
        // Indicates the minimum/maximum dates to display.
        // not responsible for trimming hidden days.
        DateProfileGenerator.prototype.buildValidRange = function () {
            return this.getRangeOption('validRange', this.calendar.getNow()) ||
                { start: null, end: null }; // completely open-ended
        };
        // Builds a structure with info about the "current" range, the range that is
        // highlighted as being the current month for example.
        // See build() for a description of `direction`.
        // Guaranteed to have `range` and `unit` properties. `duration` is optional.
        DateProfileGenerator.prototype.buildCurrentRangeInfo = function (date, direction) {
            var _a = this, viewSpec = _a.viewSpec, dateEnv = _a.dateEnv;
            var duration = null;
            var unit = null;
            var range = null;
            var dayCount;
            if (viewSpec.duration) {
                duration = viewSpec.duration;
                unit = viewSpec.durationUnit;
                range = this.buildRangeFromDuration(date, direction, duration, unit);
            }
            else if ((dayCount = this.options.dayCount)) {
                unit = 'day';
                range = this.buildRangeFromDayCount(date, direction, dayCount);
            }
            else if ((range = this.buildCustomVisibleRange(date))) {
                unit = dateEnv.greatestWholeUnit(range.start, range.end).unit;
            }
            else {
                duration = this.getFallbackDuration();
                unit = greatestDurationDenominator(duration).unit;
                range = this.buildRangeFromDuration(date, direction, duration, unit);
            }
            return { duration: duration, unit: unit, range: range };
        };
        DateProfileGenerator.prototype.getFallbackDuration = function () {
            return createDuration({ day: 1 });
        };
        // Returns a new activeRange to have time values (un-ambiguate)
        // minTime or maxTime causes the range to expand.
        DateProfileGenerator.prototype.adjustActiveRange = function (range, minTime, maxTime) {
            var dateEnv = this.dateEnv;
            var start = range.start;
            var end = range.end;
            if (this.viewSpec.class.prototype.usesMinMaxTime) {
                // expand active range if minTime is negative (why not when positive?)
                if (asRoughDays(minTime) < 0) {
                    start = startOfDay(start); // necessary?
                    start = dateEnv.add(start, minTime);
                }
                // expand active range if maxTime is beyond one day (why not when positive?)
                if (asRoughDays(maxTime) > 1) {
                    end = startOfDay(end); // necessary?
                    end = addDays(end, -1);
                    end = dateEnv.add(end, maxTime);
                }
            }
            return { start: start, end: end };
        };
        // Builds the "current" range when it is specified as an explicit duration.
        // `unit` is the already-computed greatestDurationDenominator unit of duration.
        DateProfileGenerator.prototype.buildRangeFromDuration = function (date, direction, duration, unit) {
            var dateEnv = this.dateEnv;
            var alignment = this.options.dateAlignment;
            var dateIncrementInput;
            var dateIncrementDuration;
            var start;
            var end;
            var res;
            // compute what the alignment should be
            if (!alignment) {
                dateIncrementInput = this.options.dateIncrement;
                if (dateIncrementInput) {
                    dateIncrementDuration = createDuration(dateIncrementInput);
                    // use the smaller of the two units
                    if (asRoughMs(dateIncrementDuration) < asRoughMs(duration)) {
                        alignment = greatestDurationDenominator(dateIncrementDuration, !getWeeksFromInput(dateIncrementInput)).unit;
                    }
                    else {
                        alignment = unit;
                    }
                }
                else {
                    alignment = unit;
                }
            }
            // if the view displays a single day or smaller
            if (asRoughDays(duration) <= 1) {
                if (this.isHiddenDay(start)) {
                    start = this.skipHiddenDays(start, direction);
                    start = startOfDay(start);
                }
            }
            function computeRes() {
                start = dateEnv.startOf(date, alignment);
                end = dateEnv.add(start, duration);
                res = { start: start, end: end };
            }
            computeRes();
            // if range is completely enveloped by hidden days, go past the hidden days
            if (!this.trimHiddenDays(res)) {
                date = this.skipHiddenDays(date, direction);
                computeRes();
            }
            return res;
        };
        // Builds the "current" range when a dayCount is specified.
        DateProfileGenerator.prototype.buildRangeFromDayCount = function (date, direction, dayCount) {
            var dateEnv = this.dateEnv;
            var customAlignment = this.options.dateAlignment;
            var runningCount = 0;
            var start = date;
            var end;
            if (customAlignment) {
                start = dateEnv.startOf(start, customAlignment);
            }
            start = startOfDay(start);
            start = this.skipHiddenDays(start, direction);
            end = start;
            do {
                end = addDays(end, 1);
                if (!this.isHiddenDay(end)) {
                    runningCount++;
                }
            } while (runningCount < dayCount);
            return { start: start, end: end };
        };
        // Builds a normalized range object for the "visible" range,
        // which is a way to define the currentRange and activeRange at the same time.
        DateProfileGenerator.prototype.buildCustomVisibleRange = function (date) {
            var dateEnv = this.dateEnv;
            var visibleRange = this.getRangeOption('visibleRange', dateEnv.toDate(date));
            if (visibleRange && (visibleRange.start == null || visibleRange.end == null)) {
                return null;
            }
            return visibleRange;
        };
        // Computes the range that will represent the element/cells for *rendering*,
        // but which may have voided days/times.
        // not responsible for trimming hidden days.
        DateProfileGenerator.prototype.buildRenderRange = function (currentRange, currentRangeUnit, isRangeAllDay) {
            return currentRange;
        };
        // Compute the duration value that should be added/substracted to the current date
        // when a prev/next operation happens.
        DateProfileGenerator.prototype.buildDateIncrement = function (fallback) {
            var dateIncrementInput = this.options.dateIncrement;
            var customAlignment;
            if (dateIncrementInput) {
                return createDuration(dateIncrementInput);
            }
            else if ((customAlignment = this.options.dateAlignment)) {
                return createDuration(1, customAlignment);
            }
            else if (fallback) {
                return fallback;
            }
            else {
                return createDuration({ days: 1 });
            }
        };
        // Arguments after name will be forwarded to a hypothetical function value
        // WARNING: passed-in arguments will be given to generator functions as-is and can cause side-effects.
        // Always clone your objects if you fear mutation.
        DateProfileGenerator.prototype.getRangeOption = function (name) {
            var otherArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                otherArgs[_i - 1] = arguments[_i];
            }
            var val = this.options[name];
            if (typeof val === 'function') {
                val = val.apply(null, otherArgs);
            }
            if (val) {
                val = parseRange(val, this.dateEnv);
            }
            if (val) {
                val = computeVisibleDayRange(val);
            }
            return val;
        };
        /* Hidden Days
        ------------------------------------------------------------------------------------------------------------------*/
        // Initializes internal variables related to calculating hidden days-of-week
        DateProfileGenerator.prototype.initHiddenDays = function () {
            var hiddenDays = this.options.hiddenDays || []; // array of day-of-week indices that are hidden
            var isHiddenDayHash = []; // is the day-of-week hidden? (hash with day-of-week-index -> bool)
            var dayCnt = 0;
            var i;
            if (this.options.weekends === false) {
                hiddenDays.push(0, 6); // 0=sunday, 6=saturday
            }
            for (i = 0; i < 7; i++) {
                if (!(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)) {
                    dayCnt++;
                }
            }
            if (!dayCnt) {
                throw new Error('invalid hiddenDays'); // all days were hidden? bad.
            }
            this.isHiddenDayHash = isHiddenDayHash;
        };
        // Remove days from the beginning and end of the range that are computed as hidden.
        // If the whole range is trimmed off, returns null
        DateProfileGenerator.prototype.trimHiddenDays = function (range) {
            var start = range.start;
            var end = range.end;
            if (start) {
                start = this.skipHiddenDays(start);
            }
            if (end) {
                end = this.skipHiddenDays(end, -1, true);
            }
            if (start == null || end == null || start < end) {
                return { start: start, end: end };
            }
            return null;
        };
        // Is the current day hidden?
        // `day` is a day-of-week index (0-6), or a Date (used for UTC)
        DateProfileGenerator.prototype.isHiddenDay = function (day) {
            if (day instanceof Date) {
                day = day.getUTCDay();
            }
            return this.isHiddenDayHash[day];
        };
        // Incrementing the current day until it is no longer a hidden day, returning a copy.
        // DOES NOT CONSIDER validRange!
        // If the initial value of `date` is not a hidden day, don't do anything.
        // Pass `isExclusive` as `true` if you are dealing with an end date.
        // `inc` defaults to `1` (increment one day forward each time)
        DateProfileGenerator.prototype.skipHiddenDays = function (date, inc, isExclusive) {
            if (inc === void 0) { inc = 1; }
            if (isExclusive === void 0) { isExclusive = false; }
            while (this.isHiddenDayHash[(date.getUTCDay() + (isExclusive ? inc : 0) + 7) % 7]) {
                date = addDays(date, inc);
            }
            return date;
        };
        return DateProfileGenerator;
    }());
    // TODO: find a way to avoid comparing DateProfiles. it's tedious
    function isDateProfilesEqual(p0, p1) {
        return rangesEqual(p0.validRange, p1.validRange) &&
            rangesEqual(p0.activeRange, p1.activeRange) &&
            rangesEqual(p0.renderRange, p1.renderRange) &&
            durationsEqual(p0.minTime, p1.minTime) &&
            durationsEqual(p0.maxTime, p1.maxTime);
        /*
        TODO: compare more?
          currentRange: DateRange
          currentRangeUnit: string
          isRangeAllDay: boolean
          isValid: boolean
          dateIncrement: Duration
        */
    }

    function reduce (state, action, calendar) {
        var viewType = reduceViewType(state.viewType, action);
        var dateProfile = reduceDateProfile(state.dateProfile, action, state.currentDate, viewType, calendar);
        var eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendar);
        var nextState = __assign({}, state, { viewType: viewType,
            dateProfile: dateProfile, currentDate: reduceCurrentDate(state.currentDate, action, dateProfile), eventSources: eventSources, eventStore: reduceEventStore(state.eventStore, action, eventSources, dateProfile, calendar), dateSelection: reduceDateSelection(state.dateSelection, action, calendar), eventSelection: reduceSelectedEvent(state.eventSelection, action), eventDrag: reduceEventDrag(state.eventDrag, action, eventSources, calendar), eventResize: reduceEventResize(state.eventResize, action, eventSources, calendar), eventSourceLoadingLevel: computeLoadingLevel(eventSources), loadingLevel: computeLoadingLevel(eventSources) });
        for (var _i = 0, _a = calendar.pluginSystem.hooks.reducers; _i < _a.length; _i++) {
            var reducerFunc = _a[_i];
            nextState = reducerFunc(nextState, action, calendar);
        }
        // console.log(action.type, nextState)
        return nextState;
    }
    function reduceViewType(currentViewType, action) {
        switch (action.type) {
            case 'SET_VIEW_TYPE':
                return action.viewType;
            default:
                return currentViewType;
        }
    }
    function reduceDateProfile(currentDateProfile, action, currentDate, viewType, calendar) {
        var newDateProfile;
        switch (action.type) {
            case 'PREV':
                newDateProfile = calendar.dateProfileGenerators[viewType].buildPrev(currentDateProfile, currentDate);
                break;
            case 'NEXT':
                newDateProfile = calendar.dateProfileGenerators[viewType].buildNext(currentDateProfile, currentDate);
                break;
            case 'SET_DATE':
                if (!currentDateProfile.activeRange ||
                    !rangeContainsMarker(currentDateProfile.currentRange, action.dateMarker)) {
                    newDateProfile = calendar.dateProfileGenerators[viewType].build(action.dateMarker, undefined, true // forceToValid
                    );
                }
                break;
            case 'SET_VIEW_TYPE':
                var generator = calendar.dateProfileGenerators[viewType];
                if (!generator) {
                    throw new Error(viewType ?
                        'The FullCalendar view "' + viewType + '" does not exist. Make sure your plugins are loaded correctly.' :
                        'No available FullCalendar view plugins.');
                }
                newDateProfile = generator.build(action.dateMarker || currentDate, undefined, true // forceToValid
                );
                break;
        }
        if (newDateProfile &&
            newDateProfile.isValid &&
            !(currentDateProfile && isDateProfilesEqual(currentDateProfile, newDateProfile))) {
            return newDateProfile;
        }
        else {
            return currentDateProfile;
        }
    }
    function reduceCurrentDate(currentDate, action, dateProfile) {
        switch (action.type) {
            case 'PREV':
            case 'NEXT':
                if (!rangeContainsMarker(dateProfile.currentRange, currentDate)) {
                    return dateProfile.currentRange.start;
                }
                else {
                    return currentDate;
                }
            case 'SET_DATE':
            case 'SET_VIEW_TYPE':
                var newDate = action.dateMarker || currentDate;
                if (dateProfile.activeRange && !rangeContainsMarker(dateProfile.activeRange, newDate)) {
                    return dateProfile.currentRange.start;
                }
                else {
                    return newDate;
                }
            default:
                return currentDate;
        }
    }
    function reduceDateSelection(currentSelection, action, calendar) {
        switch (action.type) {
            case 'SELECT_DATES':
                return action.selection;
            case 'UNSELECT_DATES':
                return null;
            default:
                return currentSelection;
        }
    }
    function reduceSelectedEvent(currentInstanceId, action) {
        switch (action.type) {
            case 'SELECT_EVENT':
                return action.eventInstanceId;
            case 'UNSELECT_EVENT':
                return '';
            default:
                return currentInstanceId;
        }
    }
    function reduceEventDrag(currentDrag, action, sources, calendar) {
        switch (action.type) {
            case 'SET_EVENT_DRAG':
                var newDrag = action.state;
                return {
                    affectedEvents: newDrag.affectedEvents,
                    mutatedEvents: newDrag.mutatedEvents,
                    isEvent: newDrag.isEvent,
                    origSeg: newDrag.origSeg
                };
            case 'UNSET_EVENT_DRAG':
                return null;
            default:
                return currentDrag;
        }
    }
    function reduceEventResize(currentResize, action, sources, calendar) {
        switch (action.type) {
            case 'SET_EVENT_RESIZE':
                var newResize = action.state;
                return {
                    affectedEvents: newResize.affectedEvents,
                    mutatedEvents: newResize.mutatedEvents,
                    isEvent: newResize.isEvent,
                    origSeg: newResize.origSeg
                };
            case 'UNSET_EVENT_RESIZE':
                return null;
            default:
                return currentResize;
        }
    }
    function computeLoadingLevel(eventSources) {
        var cnt = 0;
        for (var sourceId in eventSources) {
            if (eventSources[sourceId].isFetching) {
                cnt++;
            }
        }
        return cnt;
    }

    var STANDARD_PROPS = {
        start: null,
        end: null,
        allDay: Boolean
    };
    function parseDateSpan(raw, dateEnv, defaultDuration) {
        var span = parseOpenDateSpan(raw, dateEnv);
        var range = span.range;
        if (!range.start) {
            return null;
        }
        if (!range.end) {
            if (defaultDuration == null) {
                return null;
            }
            else {
                range.end = dateEnv.add(range.start, defaultDuration);
            }
        }
        return span;
    }
    /*
    TODO: somehow combine with parseRange?
    Will return null if the start/end props were present but parsed invalidly.
    */
    function parseOpenDateSpan(raw, dateEnv) {
        var leftovers = {};
        var standardProps = refineProps(raw, STANDARD_PROPS, {}, leftovers);
        var startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null;
        var endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null;
        var allDay = standardProps.allDay;
        if (allDay == null) {
            allDay = (startMeta && startMeta.isTimeUnspecified) &&
                (!endMeta || endMeta.isTimeUnspecified);
        }
        // use this leftover object as the selection object
        leftovers.range = {
            start: startMeta ? startMeta.marker : null,
            end: endMeta ? endMeta.marker : null
        };
        leftovers.allDay = allDay;
        return leftovers;
    }
    function isDateSpansEqual(span0, span1) {
        return rangesEqual(span0.range, span1.range) &&
            span0.allDay === span1.allDay &&
            isSpanPropsEqual(span0, span1);
    }
    // the NON-DATE-RELATED props
    function isSpanPropsEqual(span0, span1) {
        for (var propName in span1) {
            if (propName !== 'range' && propName !== 'allDay') {
                if (span0[propName] !== span1[propName]) {
                    return false;
                }
            }
        }
        // are there any props that span0 has that span1 DOESN'T have?
        // both have range/allDay, so no need to special-case.
        for (var propName in span0) {
            if (!(propName in span1)) {
                return false;
            }
        }
        return true;
    }
    function buildDateSpanApi(span, dateEnv) {
        return {
            start: dateEnv.toDate(span.range.start),
            end: dateEnv.toDate(span.range.end),
            startStr: dateEnv.formatIso(span.range.start, { omitTime: span.allDay }),
            endStr: dateEnv.formatIso(span.range.end, { omitTime: span.allDay }),
            allDay: span.allDay
        };
    }
    function buildDatePointApi(span, dateEnv) {
        return {
            date: dateEnv.toDate(span.range.start),
            dateStr: dateEnv.formatIso(span.range.start, { omitTime: span.allDay }),
            allDay: span.allDay
        };
    }
    function fabricateEventRange(dateSpan, eventUiBases, calendar) {
        var def = parseEventDef({ editable: false }, '', // sourceId
        dateSpan.allDay, true, // hasEnd
        calendar);
        return {
            def: def,
            ui: compileEventUi(def, eventUiBases),
            instance: createEventInstance(def.defId, dateSpan.range),
            range: dateSpan.range,
            isStart: true,
            isEnd: true
        };
    }

    function compileViewDefs(defaultConfigs, overrideConfigs) {
        var hash = {};
        var viewType;
        for (viewType in defaultConfigs) {
            ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
        }
        for (viewType in overrideConfigs) {
            ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
        }
        return hash;
    }
    function ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
        if (hash[viewType]) {
            return hash[viewType];
        }
        var viewDef = buildViewDef(viewType, hash, defaultConfigs, overrideConfigs);
        if (viewDef) {
            hash[viewType] = viewDef;
        }
        return viewDef;
    }
    function buildViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
        var defaultConfig = defaultConfigs[viewType];
        var overrideConfig = overrideConfigs[viewType];
        var queryProp = function (name) {
            return (defaultConfig && defaultConfig[name] !== null) ? defaultConfig[name] :
                ((overrideConfig && overrideConfig[name] !== null) ? overrideConfig[name] : null);
        };
        var theClass = queryProp('class');
        var superType = queryProp('superType');
        if (!superType && theClass) {
            superType =
                findViewNameBySubclass(theClass, overrideConfigs) ||
                    findViewNameBySubclass(theClass, defaultConfigs);
        }
        var superDef = null;
        if (superType) {
            if (superType === viewType) {
                throw new Error('Can\'t have a custom view type that references itself');
            }
            superDef = ensureViewDef(superType, hash, defaultConfigs, overrideConfigs);
        }
        if (!theClass && superDef) {
            theClass = superDef.class;
        }
        if (!theClass) {
            return null; // don't throw a warning, might be settings for a single-unit view
        }
        return {
            type: viewType,
            class: theClass,
            defaults: __assign({}, (superDef ? superDef.defaults : {}), (defaultConfig ? defaultConfig.options : {})),
            overrides: __assign({}, (superDef ? superDef.overrides : {}), (overrideConfig ? overrideConfig.options : {}))
        };
    }
    function findViewNameBySubclass(viewSubclass, configs) {
        var superProto = Object.getPrototypeOf(viewSubclass.prototype);
        for (var viewType in configs) {
            var parsed = configs[viewType];
            // need DIRECT subclass, so instanceof won't do it
            if (parsed.class && parsed.class.prototype === superProto) {
                return viewType;
            }
        }
        return '';
    }

    function parseViewConfigs(inputs) {
        return mapHash(inputs, parseViewConfig);
    }
    var VIEW_DEF_PROPS = {
        type: String,
        class: null
    };
    function parseViewConfig(input) {
        if (typeof input === 'function') {
            input = { class: input };
        }
        var options = {};
        var props = refineProps(input, VIEW_DEF_PROPS, {}, options);
        return {
            superType: props.type,
            class: props.class,
            options: options
        };
    }

    function buildViewSpecs(defaultInputs, optionsManager) {
        var defaultConfigs = parseViewConfigs(defaultInputs);
        var overrideConfigs = parseViewConfigs(optionsManager.overrides.views);
        var viewDefs = compileViewDefs(defaultConfigs, overrideConfigs);
        return mapHash(viewDefs, function (viewDef) {
            return buildViewSpec(viewDef, overrideConfigs, optionsManager);
        });
    }
    function buildViewSpec(viewDef, overrideConfigs, optionsManager) {
        var durationInput = viewDef.overrides.duration ||
            viewDef.defaults.duration ||
            optionsManager.dynamicOverrides.duration ||
            optionsManager.overrides.duration;
        var duration = null;
        var durationUnit = '';
        var singleUnit = '';
        var singleUnitOverrides = {};
        if (durationInput) {
            duration = createDuration(durationInput);
            if (duration) { // valid?
                var denom = greatestDurationDenominator(duration, !getWeeksFromInput(durationInput));
                durationUnit = denom.unit;
                if (denom.value === 1) {
                    singleUnit = durationUnit;
                    singleUnitOverrides = overrideConfigs[durationUnit] ? overrideConfigs[durationUnit].options : {};
                }
            }
        }
        var queryButtonText = function (options) {
            var buttonTextMap = options.buttonText || {};
            var buttonTextKey = viewDef.defaults.buttonTextKey;
            if (buttonTextKey != null && buttonTextMap[buttonTextKey] != null) {
                return buttonTextMap[buttonTextKey];
            }
            if (buttonTextMap[viewDef.type] != null) {
                return buttonTextMap[viewDef.type];
            }
            if (buttonTextMap[singleUnit] != null) {
                return buttonTextMap[singleUnit];
            }
        };
        return {
            type: viewDef.type,
            class: viewDef.class,
            duration: duration,
            durationUnit: durationUnit,
            singleUnit: singleUnit,
            options: __assign({}, globalDefaults, viewDef.defaults, optionsManager.dirDefaults, optionsManager.localeDefaults, optionsManager.overrides, singleUnitOverrides, viewDef.overrides, optionsManager.dynamicOverrides),
            buttonTextOverride: queryButtonText(optionsManager.dynamicOverrides) ||
                queryButtonText(optionsManager.overrides) || // constructor-specified buttonText lookup hash takes precedence
                viewDef.overrides.buttonText,
            buttonTextDefault: queryButtonText(optionsManager.localeDefaults) ||
                queryButtonText(optionsManager.dirDefaults) ||
                viewDef.defaults.buttonText ||
                queryButtonText(globalDefaults) ||
                viewDef.type // fall back to given view name
        };
    }

    var Toolbar = /** @class */ (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar(extraClassName) {
            var _this = _super.call(this) || this;
            _this._renderLayout = memoizeRendering(_this.renderLayout, _this.unrenderLayout);
            _this._updateTitle = memoizeRendering(_this.updateTitle, null, [_this._renderLayout]);
            _this._updateActiveButton = memoizeRendering(_this.updateActiveButton, null, [_this._renderLayout]);
            _this._updateToday = memoizeRendering(_this.updateToday, null, [_this._renderLayout]);
            _this._updatePrev = memoizeRendering(_this.updatePrev, null, [_this._renderLayout]);
            _this._updateNext = memoizeRendering(_this.updateNext, null, [_this._renderLayout]);
            _this.el = createElement('div', { className: 'fc-toolbar ' + extraClassName });
            return _this;
        }
        Toolbar.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this._renderLayout.unrender(); // should unrender everything else
            removeElement(this.el);
        };
        Toolbar.prototype.render = function (props) {
            this._renderLayout(props.layout);
            this._updateTitle(props.title);
            this._updateActiveButton(props.activeButton);
            this._updateToday(props.isTodayEnabled);
            this._updatePrev(props.isPrevEnabled);
            this._updateNext(props.isNextEnabled);
        };
        Toolbar.prototype.renderLayout = function (layout) {
            var el = this.el;
            this.viewsWithButtons = [];
            appendToElement(el, this.renderSection('left', layout.left));
            appendToElement(el, this.renderSection('center', layout.center));
            appendToElement(el, this.renderSection('right', layout.right));
        };
        Toolbar.prototype.unrenderLayout = function () {
            this.el.innerHTML = '';
        };
        Toolbar.prototype.renderSection = function (position, buttonStr) {
            var _this = this;
            var _a = this.context, theme = _a.theme, calendar = _a.calendar;
            var optionsManager = calendar.optionsManager;
            var viewSpecs = calendar.viewSpecs;
            var sectionEl = createElement('div', { className: 'fc-' + position });
            var calendarCustomButtons = optionsManager.computed.customButtons || {};
            var calendarButtonTextOverrides = optionsManager.overrides.buttonText || {};
            var calendarButtonText = optionsManager.computed.buttonText || {};
            if (buttonStr) {
                buttonStr.split(' ').forEach(function (buttonGroupStr, i) {
                    var groupChildren = [];
                    var isOnlyButtons = true;
                    var groupEl;
                    buttonGroupStr.split(',').forEach(function (buttonName, j) {
                        var customButtonProps;
                        var viewSpec;
                        var buttonClick;
                        var buttonIcon; // only one of these will be set
                        var buttonText; // "
                        var buttonInnerHtml;
                        var buttonClasses;
                        var buttonEl;
                        var buttonAriaAttr;
                        if (buttonName === 'title') {
                            groupChildren.push(htmlToElement('<h2>&nbsp;</h2>')); // we always want it to take up height
                            isOnlyButtons = false;
                        }
                        else {
                            if ((customButtonProps = calendarCustomButtons[buttonName])) {
                                buttonClick = function (ev) {
                                    if (customButtonProps.click) {
                                        customButtonProps.click.call(buttonEl, ev);
                                    }
                                };
                                (buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) ||
                                    (buttonIcon = theme.getIconClass(buttonName)) ||
                                    (buttonText = customButtonProps.text);
                            }
                            else if ((viewSpec = viewSpecs[buttonName])) {
                                _this.viewsWithButtons.push(buttonName);
                                buttonClick = function () {
                                    calendar.changeView(buttonName);
                                };
                                (buttonText = viewSpec.buttonTextOverride) ||
                                    (buttonIcon = theme.getIconClass(buttonName)) ||
                                    (buttonText = viewSpec.buttonTextDefault);
                            }
                            else if (calendar[buttonName]) { // a calendar method
                                buttonClick = function () {
                                    calendar[buttonName]();
                                };
                                (buttonText = calendarButtonTextOverrides[buttonName]) ||
                                    (buttonIcon = theme.getIconClass(buttonName)) ||
                                    (buttonText = calendarButtonText[buttonName]);
                                //            ^ everything else is considered default
                            }
                            if (buttonClick) {
                                buttonClasses = [
                                    'fc-' + buttonName + '-button',
                                    theme.getClass('button')
                                ];
                                if (buttonText) {
                                    buttonInnerHtml = htmlEscape(buttonText);
                                    buttonAriaAttr = '';
                                }
                                else if (buttonIcon) {
                                    buttonInnerHtml = "<span class='" + buttonIcon + "'></span>";
                                    buttonAriaAttr = ' aria-label="' + buttonName + '"';
                                }
                                buttonEl = htmlToElement(// type="button" so that it doesn't submit a form
                                '<button type="button" class="' + buttonClasses.join(' ') + '"' +
                                    buttonAriaAttr +
                                    '>' + buttonInnerHtml + '</button>');
                                buttonEl.addEventListener('click', buttonClick);
                                groupChildren.push(buttonEl);
                            }
                        }
                    });
                    if (groupChildren.length > 1) {
                        groupEl = document.createElement('div');
                        var buttonGroupClassName = theme.getClass('buttonGroup');
                        if (isOnlyButtons && buttonGroupClassName) {
                            groupEl.classList.add(buttonGroupClassName);
                        }
                        appendToElement(groupEl, groupChildren);
                        sectionEl.appendChild(groupEl);
                    }
                    else {
                        appendToElement(sectionEl, groupChildren); // 1 or 0 children
                    }
                });
            }
            return sectionEl;
        };
        Toolbar.prototype.updateToday = function (isTodayEnabled) {
            this.toggleButtonEnabled('today', isTodayEnabled);
        };
        Toolbar.prototype.updatePrev = function (isPrevEnabled) {
            this.toggleButtonEnabled('prev', isPrevEnabled);
        };
        Toolbar.prototype.updateNext = function (isNextEnabled) {
            this.toggleButtonEnabled('next', isNextEnabled);
        };
        Toolbar.prototype.updateTitle = function (text) {
            findElements(this.el, 'h2').forEach(function (titleEl) {
                titleEl.innerText = text;
            });
        };
        Toolbar.prototype.updateActiveButton = function (buttonName) {
            var theme = this.context.theme;
            var className = theme.getClass('buttonActive');
            findElements(this.el, 'button').forEach(function (buttonEl) {
                if (buttonName && buttonEl.classList.contains('fc-' + buttonName + '-button')) {
                    buttonEl.classList.add(className);
                }
                else {
                    buttonEl.classList.remove(className);
                }
            });
        };
        Toolbar.prototype.toggleButtonEnabled = function (buttonName, bool) {
            findElements(this.el, '.fc-' + buttonName + '-button').forEach(function (buttonEl) {
                buttonEl.disabled = !bool;
            });
        };
        return Toolbar;
    }(Component));

    var CalendarComponent = /** @class */ (function (_super) {
        __extends(CalendarComponent, _super);
        function CalendarComponent(el) {
            var _this = _super.call(this) || this;
            _this.elClassNames = [];
            _this.renderSkeleton = memoizeRendering(_this._renderSkeleton, _this._unrenderSkeleton);
            _this.renderToolbars = memoizeRendering(_this._renderToolbars, _this._unrenderToolbars, [_this.renderSkeleton]);
            _this.buildComponentContext = memoize(buildComponentContext);
            _this.buildViewPropTransformers = memoize(buildViewPropTransformers);
            _this.el = el;
            _this.computeTitle = memoize(computeTitle);
            _this.parseBusinessHours = memoize(function (input) {
                return parseBusinessHours(input, _this.context.calendar);
            });
            return _this;
        }
        CalendarComponent.prototype.render = function (props, context) {
            this.freezeHeight();
            var title = this.computeTitle(props.dateProfile, props.viewSpec.options);
            this.renderSkeleton(context);
            this.renderToolbars(props.viewSpec, props.dateProfile, props.currentDate, title);
            this.renderView(props, title);
            this.updateSize();
            this.thawHeight();
        };
        CalendarComponent.prototype.destroy = function () {
            if (this.header) {
                this.header.destroy();
            }
            if (this.footer) {
                this.footer.destroy();
            }
            this.renderSkeleton.unrender(); // will call destroyView
            _super.prototype.destroy.call(this);
        };
        CalendarComponent.prototype._renderSkeleton = function (context) {
            this.updateElClassNames(context);
            prependToElement(this.el, this.contentEl = createElement('div', { className: 'fc-view-container' }));
            var calendar = context.calendar;
            for (var _i = 0, _a = calendar.pluginSystem.hooks.viewContainerModifiers; _i < _a.length; _i++) {
                var modifyViewContainer = _a[_i];
                modifyViewContainer(this.contentEl, calendar);
            }
        };
        CalendarComponent.prototype._unrenderSkeleton = function () {
            // weird to have this here
            if (this.view) {
                this.savedScroll = this.view.queryScroll();
                this.view.destroy();
                this.view = null;
            }
            removeElement(this.contentEl);
            this.removeElClassNames();
        };
        CalendarComponent.prototype.removeElClassNames = function () {
            var classList = this.el.classList;
            for (var _i = 0, _a = this.elClassNames; _i < _a.length; _i++) {
                var className = _a[_i];
                classList.remove(className);
            }
            this.elClassNames = [];
        };
        CalendarComponent.prototype.updateElClassNames = function (context) {
            this.removeElClassNames();
            var theme = context.theme, options = context.options;
            this.elClassNames = [
                'fc',
                'fc-' + options.dir,
                theme.getClass('widget')
            ];
            var classList = this.el.classList;
            for (var _i = 0, _a = this.elClassNames; _i < _a.length; _i++) {
                var className = _a[_i];
                classList.add(className);
            }
        };
        CalendarComponent.prototype._renderToolbars = function (viewSpec, dateProfile, currentDate, title) {
            var _a = this, context = _a.context, header = _a.header, footer = _a.footer;
            var options = context.options, calendar = context.calendar;
            var headerLayout = options.header;
            var footerLayout = options.footer;
            var dateProfileGenerator = this.props.dateProfileGenerator;
            var now = calendar.getNow();
            var todayInfo = dateProfileGenerator.build(now);
            var prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate);
            var nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate);
            var toolbarProps = {
                title: title,
                activeButton: viewSpec.type,
                isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
                isPrevEnabled: prevInfo.isValid,
                isNextEnabled: nextInfo.isValid
            };
            if (headerLayout) {
                if (!header) {
                    header = this.header = new Toolbar('fc-header-toolbar');
                    prependToElement(this.el, header.el);
                }
                header.receiveProps(__assign({ layout: headerLayout }, toolbarProps), context);
            }
            else if (header) {
                header.destroy();
                header = this.header = null;
            }
            if (footerLayout) {
                if (!footer) {
                    footer = this.footer = new Toolbar('fc-footer-toolbar');
                    appendToElement(this.el, footer.el);
                }
                footer.receiveProps(__assign({ layout: footerLayout }, toolbarProps), context);
            }
            else if (footer) {
                footer.destroy();
                footer = this.footer = null;
            }
        };
        CalendarComponent.prototype._unrenderToolbars = function () {
            if (this.header) {
                this.header.destroy();
                this.header = null;
            }
            if (this.footer) {
                this.footer.destroy();
                this.footer = null;
            }
        };
        CalendarComponent.prototype.renderView = function (props, title) {
            var view = this.view;
            var _a = this.context, calendar = _a.calendar, options = _a.options;
            var viewSpec = props.viewSpec, dateProfileGenerator = props.dateProfileGenerator;
            if (!view || view.viewSpec !== viewSpec) {
                if (view) {
                    view.destroy();
                }
                view = this.view = new viewSpec['class'](viewSpec, this.contentEl);
                if (this.savedScroll) {
                    view.addScroll(this.savedScroll, true);
                    this.savedScroll = null;
                }
            }
            view.title = title; // for the API
            var viewProps = {
                dateProfileGenerator: dateProfileGenerator,
                dateProfile: props.dateProfile,
                businessHours: this.parseBusinessHours(viewSpec.options.businessHours),
                eventStore: props.eventStore,
                eventUiBases: props.eventUiBases,
                dateSelection: props.dateSelection,
                eventSelection: props.eventSelection,
                eventDrag: props.eventDrag,
                eventResize: props.eventResize
            };
            var transformers = this.buildViewPropTransformers(calendar.pluginSystem.hooks.viewPropsTransformers);
            for (var _i = 0, transformers_1 = transformers; _i < transformers_1.length; _i++) {
                var transformer = transformers_1[_i];
                __assign(viewProps, transformer.transform(viewProps, viewSpec, props, options));
            }
            view.receiveProps(viewProps, this.buildComponentContext(this.context, viewSpec, view));
        };
        // Sizing
        // -----------------------------------------------------------------------------------------------------------------
        CalendarComponent.prototype.updateSize = function (isResize) {
            if (isResize === void 0) { isResize = false; }
            var view = this.view;
            if (!view) {
                return; // why?
            }
            if (isResize || this.isHeightAuto == null) {
                this.computeHeightVars();
            }
            view.updateSize(isResize, this.viewHeight, this.isHeightAuto);
            view.updateNowIndicator(); // we need to guarantee this will run after updateSize
            view.popScroll(isResize);
        };
        CalendarComponent.prototype.computeHeightVars = function () {
            var calendar = this.context.calendar; // yuck. need to handle dynamic options
            var heightInput = calendar.opt('height');
            var contentHeightInput = calendar.opt('contentHeight');
            this.isHeightAuto = heightInput === 'auto' || contentHeightInput === 'auto';
            if (typeof contentHeightInput === 'number') { // exists and not 'auto'
                this.viewHeight = contentHeightInput;
            }
            else if (typeof contentHeightInput === 'function') { // exists and is a function
                this.viewHeight = contentHeightInput();
            }
            else if (typeof heightInput === 'number') { // exists and not 'auto'
                this.viewHeight = heightInput - this.queryToolbarsHeight();
            }
            else if (typeof heightInput === 'function') { // exists and is a function
                this.viewHeight = heightInput() - this.queryToolbarsHeight();
            }
            else if (heightInput === 'parent') { // set to height of parent element
                var parentEl = this.el.parentNode;
                this.viewHeight = parentEl.getBoundingClientRect().height - this.queryToolbarsHeight();
            }
            else {
                this.viewHeight = Math.round(this.contentEl.getBoundingClientRect().width /
                    Math.max(calendar.opt('aspectRatio'), .5));
            }
        };
        CalendarComponent.prototype.queryToolbarsHeight = function () {
            var height = 0;
            if (this.header) {
                height += computeHeightAndMargins(this.header.el);
            }
            if (this.footer) {
                height += computeHeightAndMargins(this.footer.el);
            }
            return height;
        };
        // Height "Freezing"
        // -----------------------------------------------------------------------------------------------------------------
        CalendarComponent.prototype.freezeHeight = function () {
            applyStyle(this.el, {
                height: this.el.getBoundingClientRect().height,
                overflow: 'hidden'
            });
        };
        CalendarComponent.prototype.thawHeight = function () {
            applyStyle(this.el, {
                height: '',
                overflow: ''
            });
        };
        return CalendarComponent;
    }(Component));
    // Title and Date Formatting
    // -----------------------------------------------------------------------------------------------------------------
    // Computes what the title at the top of the calendar should be for this view
    function computeTitle(dateProfile, viewOptions) {
        var range;
        // for views that span a large unit of time, show the proper interval, ignoring stray days before and after
        if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) {
            range = dateProfile.currentRange;
        }
        else { // for day units or smaller, use the actual day range
            range = dateProfile.activeRange;
        }
        return this.context.dateEnv.formatRange(range.start, range.end, createFormatter(viewOptions.titleFormat || computeTitleFormat(dateProfile), viewOptions.titleRangeSeparator), { isEndExclusive: dateProfile.isRangeAllDay });
    }
    // Generates the format string that should be used to generate the title for the current date range.
    // Attempts to compute the most appropriate format if not explicitly specified with `titleFormat`.
    function computeTitleFormat(dateProfile) {
        var currentRangeUnit = dateProfile.currentRangeUnit;
        if (currentRangeUnit === 'year') {
            return { year: 'numeric' };
        }
        else if (currentRangeUnit === 'month') {
            return { year: 'numeric', month: 'long' }; // like "September 2014"
        }
        else {
            var days = diffWholeDays(dateProfile.currentRange.start, dateProfile.currentRange.end);
            if (days !== null && days > 1) {
                // multi-day range. shorter, like "Sep 9 - 10 2014"
                return { year: 'numeric', month: 'short', day: 'numeric' };
            }
            else {
                // one day. longer, like "September 9 2014"
                return { year: 'numeric', month: 'long', day: 'numeric' };
            }
        }
    }
    // build a context scoped to the view
    function buildComponentContext(context, viewSpec, view) {
        return context.extend(viewSpec.options, view);
    }
    // Plugin
    // -----------------------------------------------------------------------------------------------------------------
    function buildViewPropTransformers(theClasses) {
        return theClasses.map(function (theClass) {
            return new theClass();
        });
    }

    var Interaction = /** @class */ (function () {
        function Interaction(settings) {
            this.component = settings.component;
        }
        Interaction.prototype.destroy = function () {
        };
        return Interaction;
    }());
    function parseInteractionSettings(component, input) {
        return {
            component: component,
            el: input.el,
            useEventCenter: input.useEventCenter != null ? input.useEventCenter : true
        };
    }
    function interactionSettingsToStore(settings) {
        var _a;
        return _a = {},
            _a[settings.component.uid] = settings,
            _a;
    }
    // global state
    var interactionSettingsStore = {};

    /*
    Detects when the user clicks on an event within a DateComponent
    */
    var EventClicking = /** @class */ (function (_super) {
        __extends(EventClicking, _super);
        function EventClicking(settings) {
            var _this = _super.call(this, settings) || this;
            _this.handleSegClick = function (ev, segEl) {
                var component = _this.component;
                var _a = component.context, calendar = _a.calendar, view = _a.view;
                var seg = getElSeg(segEl);
                if (seg && // might be the <div> surrounding the more link
                    component.isValidSegDownEl(ev.target)) {
                    // our way to simulate a link click for elements that can't be <a> tags
                    // grab before trigger fired in case trigger trashes DOM thru rerendering
                    var hasUrlContainer = elementClosest(ev.target, '.fc-has-url');
                    var url = hasUrlContainer ? hasUrlContainer.querySelector('a[href]').href : '';
                    calendar.publiclyTrigger('eventClick', [
                        {
                            el: segEl,
                            event: new EventApi(component.context.calendar, seg.eventRange.def, seg.eventRange.instance),
                            jsEvent: ev,
                            view: view
                        }
                    ]);
                    if (url && !ev.defaultPrevented) {
                        window.location.href = url;
                    }
                }
            };
            var component = settings.component;
            _this.destroy = listenBySelector(component.el, 'click', component.fgSegSelector + ',' + component.bgSegSelector, _this.handleSegClick);
            return _this;
        }
        return EventClicking;
    }(Interaction));

    /*
    Triggers events and adds/removes core classNames when the user's pointer
    enters/leaves event-elements of a component.
    */
    var EventHovering = /** @class */ (function (_super) {
        __extends(EventHovering, _super);
        function EventHovering(settings) {
            var _this = _super.call(this, settings) || this;
            // for simulating an eventMouseLeave when the event el is destroyed while mouse is over it
            _this.handleEventElRemove = function (el) {
                if (el === _this.currentSegEl) {
                    _this.handleSegLeave(null, _this.currentSegEl);
                }
            };
            _this.handleSegEnter = function (ev, segEl) {
                if (getElSeg(segEl)) { // TODO: better way to make sure not hovering over more+ link or its wrapper
                    segEl.classList.add('fc-allow-mouse-resize');
                    _this.currentSegEl = segEl;
                    _this.triggerEvent('eventMouseEnter', ev, segEl);
                }
            };
            _this.handleSegLeave = function (ev, segEl) {
                if (_this.currentSegEl) {
                    segEl.classList.remove('fc-allow-mouse-resize');
                    _this.currentSegEl = null;
                    _this.triggerEvent('eventMouseLeave', ev, segEl);
                }
            };
            var component = settings.component;
            _this.removeHoverListeners = listenToHoverBySelector(component.el, component.fgSegSelector + ',' + component.bgSegSelector, _this.handleSegEnter, _this.handleSegLeave);
            // how to make sure component already has context?
            component.context.calendar.on('eventElRemove', _this.handleEventElRemove);
            return _this;
        }
        EventHovering.prototype.destroy = function () {
            this.removeHoverListeners();
            this.component.context.calendar.off('eventElRemove', this.handleEventElRemove);
        };
        EventHovering.prototype.triggerEvent = function (publicEvName, ev, segEl) {
            var component = this.component;
            var _a = component.context, calendar = _a.calendar, view = _a.view;
            var seg = getElSeg(segEl);
            if (!ev || component.isValidSegDownEl(ev.target)) {
                calendar.publiclyTrigger(publicEvName, [
                    {
                        el: segEl,
                        event: new EventApi(calendar, seg.eventRange.def, seg.eventRange.instance),
                        jsEvent: ev,
                        view: view
                    }
                ]);
            }
        };
        return EventHovering;
    }(Interaction));

    var StandardTheme = /** @class */ (function (_super) {
        __extends(StandardTheme, _super);
        function StandardTheme() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return StandardTheme;
    }(Theme));
    StandardTheme.prototype.classes = {
        widget: 'fc-unthemed',
        widgetHeader: 'fc-widget-header',
        widgetContent: 'fc-widget-content',
        buttonGroup: 'fc-button-group',
        button: 'fc-button fc-button-primary',
        buttonActive: 'fc-button-active',
        popoverHeader: 'fc-widget-header',
        popoverContent: 'fc-widget-content',
        // day grid
        headerRow: 'fc-widget-header',
        dayRow: 'fc-widget-content',
        // list view
        listView: 'fc-widget-content'
    };
    StandardTheme.prototype.baseIconClass = 'fc-icon';
    StandardTheme.prototype.iconClasses = {
        close: 'fc-icon-x',
        prev: 'fc-icon-chevron-left',
        next: 'fc-icon-chevron-right',
        prevYear: 'fc-icon-chevrons-left',
        nextYear: 'fc-icon-chevrons-right'
    };
    StandardTheme.prototype.iconOverrideOption = 'buttonIcons';
    StandardTheme.prototype.iconOverrideCustomButtonOption = 'icon';
    StandardTheme.prototype.iconOverridePrefix = 'fc-icon-';

    var Calendar = /** @class */ (function () {
        function Calendar(el, overrides) {
            var _this = this;
            this.buildComponentContext = memoize(buildComponentContext$1);
            this.parseRawLocales = memoize(parseRawLocales);
            this.buildLocale = memoize(buildLocale);
            this.buildDateEnv = memoize(buildDateEnv);
            this.buildTheme = memoize(buildTheme);
            this.buildEventUiSingleBase = memoize(this._buildEventUiSingleBase);
            this.buildSelectionConfig = memoize(this._buildSelectionConfig);
            this.buildEventUiBySource = memoizeOutput(buildEventUiBySource, isPropsEqual);
            this.buildEventUiBases = memoize(buildEventUiBases);
            this.interactionsStore = {};
            this.actionQueue = [];
            this.isReducing = false;
            // isDisplaying: boolean = false // installed in DOM? accepting renders?
            this.needsRerender = false; // needs a render?
            this.isRendering = false; // currently in the executeRender function?
            this.renderingPauseDepth = 0;
            this.buildDelayedRerender = memoize(buildDelayedRerender);
            this.afterSizingTriggers = {};
            this.isViewUpdated = false;
            this.isDatesUpdated = false;
            this.isEventsUpdated = false;
            this.el = el;
            this.optionsManager = new OptionsManager(overrides || {});
            this.pluginSystem = new PluginSystem();
            // only do once. don't do in handleOptions. because can't remove plugins
            this.addPluginInputs(this.optionsManager.computed.plugins || []);
            this.handleOptions(this.optionsManager.computed);
            this.publiclyTrigger('_init'); // for tests
            this.hydrate();
            this.calendarInteractions = this.pluginSystem.hooks.calendarInteractions
                .map(function (calendarInteractionClass) {
                return new calendarInteractionClass(_this);
            });
        }
        Calendar.prototype.addPluginInputs = function (pluginInputs) {
            var pluginDefs = refinePluginDefs(pluginInputs);
            for (var _i = 0, pluginDefs_1 = pluginDefs; _i < pluginDefs_1.length; _i++) {
                var pluginDef = pluginDefs_1[_i];
                this.pluginSystem.add(pluginDef);
            }
        };
        Object.defineProperty(Calendar.prototype, "view", {
            // public API
            get: function () {
                return this.component ? this.component.view : null;
            },
            enumerable: true,
            configurable: true
        });
        // Public API for rendering
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.render = function () {
            if (!this.component) {
                this.component = new CalendarComponent(this.el);
                this.renderableEventStore = createEmptyEventStore();
                this.bindHandlers();
                this.executeRender();
            }
            else {
                this.requestRerender();
            }
        };
        Calendar.prototype.destroy = function () {
            if (this.component) {
                this.unbindHandlers();
                this.component.destroy(); // don't null-out. in case API needs access
                this.component = null; // umm ???
                for (var _i = 0, _a = this.calendarInteractions; _i < _a.length; _i++) {
                    var interaction = _a[_i];
                    interaction.destroy();
                }
                this.publiclyTrigger('_destroyed');
            }
        };
        // Handlers
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.bindHandlers = function () {
            var _this = this;
            // event delegation for nav links
            this.removeNavLinkListener = listenBySelector(this.el, 'click', 'a[data-goto]', function (ev, anchorEl) {
                var gotoOptions = anchorEl.getAttribute('data-goto');
                gotoOptions = gotoOptions ? JSON.parse(gotoOptions) : {};
                var dateEnv = _this.dateEnv;
                var dateMarker = dateEnv.createMarker(gotoOptions.date);
                var viewType = gotoOptions.type;
                // property like "navLinkDayClick". might be a string or a function
                var customAction = _this.viewOpt('navLink' + capitaliseFirstLetter(viewType) + 'Click');
                if (typeof customAction === 'function') {
                    customAction(dateEnv.toDate(dateMarker), ev);
                }
                else {
                    if (typeof customAction === 'string') {
                        viewType = customAction;
                    }
                    _this.zoomTo(dateMarker, viewType);
                }
            });
            if (this.opt('handleWindowResize')) {
                window.addEventListener('resize', this.windowResizeProxy = debounce(// prevents rapid calls
                this.windowResize.bind(this), this.opt('windowResizeDelay')));
            }
        };
        Calendar.prototype.unbindHandlers = function () {
            this.removeNavLinkListener();
            if (this.windowResizeProxy) {
                window.removeEventListener('resize', this.windowResizeProxy);
                this.windowResizeProxy = null;
            }
        };
        // Dispatcher
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.hydrate = function () {
            var _this = this;
            this.state = this.buildInitialState();
            var rawSources = this.opt('eventSources') || [];
            var singleRawSource = this.opt('events');
            var sources = []; // parsed
            if (singleRawSource) {
                rawSources.unshift(singleRawSource);
            }
            for (var _i = 0, rawSources_1 = rawSources; _i < rawSources_1.length; _i++) {
                var rawSource = rawSources_1[_i];
                var source = parseEventSource(rawSource, this);
                if (source) {
                    sources.push(source);
                }
            }
            this.batchRendering(function () {
                _this.dispatch({ type: 'INIT' }); // pass in sources here?
                _this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: sources });
                _this.dispatch({
                    type: 'SET_VIEW_TYPE',
                    viewType: _this.opt('defaultView') || _this.pluginSystem.hooks.defaultView
                });
            });
        };
        Calendar.prototype.buildInitialState = function () {
            return {
                viewType: null,
                loadingLevel: 0,
                eventSourceLoadingLevel: 0,
                currentDate: this.getInitialDate(),
                dateProfile: null,
                eventSources: {},
                eventStore: createEmptyEventStore(),
                dateSelection: null,
                eventSelection: '',
                eventDrag: null,
                eventResize: null
            };
        };
        Calendar.prototype.dispatch = function (action) {
            this.actionQueue.push(action);
            if (!this.isReducing) {
                this.isReducing = true;
                var oldState = this.state;
                while (this.actionQueue.length) {
                    this.state = this.reduce(this.state, this.actionQueue.shift(), this);
                }
                var newState = this.state;
                this.isReducing = false;
                if (!oldState.loadingLevel && newState.loadingLevel) {
                    this.publiclyTrigger('loading', [true]);
                }
                else if (oldState.loadingLevel && !newState.loadingLevel) {
                    this.publiclyTrigger('loading', [false]);
                }
                var view = this.component && this.component.view;
                if (oldState.eventStore !== newState.eventStore) {
                    if (oldState.eventStore) {
                        this.isEventsUpdated = true;
                    }
                }
                if (oldState.dateProfile !== newState.dateProfile) {
                    if (oldState.dateProfile && view) { // why would view be null!?
                        this.publiclyTrigger('datesDestroy', [
                            {
                                view: view,
                                el: view.el
                            }
                        ]);
                    }
                    this.isDatesUpdated = true;
                }
                if (oldState.viewType !== newState.viewType) {
                    if (oldState.viewType && view) { // why would view be null!?
                        this.publiclyTrigger('viewSkeletonDestroy', [
                            {
                                view: view,
                                el: view.el
                            }
                        ]);
                    }
                    this.isViewUpdated = true;
                }
                this.requestRerender();
            }
        };
        Calendar.prototype.reduce = function (state, action, calendar) {
            return reduce(state, action, calendar);
        };
        // Render Queue
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.requestRerender = function () {
            this.needsRerender = true;
            this.delayedRerender(); // will call a debounced-version of tryRerender
        };
        Calendar.prototype.tryRerender = function () {
            if (this.component && // must be accepting renders
                this.needsRerender && // indicates that a rerender was requested
                !this.renderingPauseDepth && // not paused
                !this.isRendering // not currently in the render loop
            ) {
                this.executeRender();
            }
        };
        Calendar.prototype.batchRendering = function (func) {
            this.renderingPauseDepth++;
            func();
            this.renderingPauseDepth--;
            if (this.needsRerender) {
                this.requestRerender();
            }
        };
        // Rendering
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.executeRender = function () {
            // clear these BEFORE the render so that new values will accumulate during render
            this.needsRerender = false;
            this.isRendering = true;
            this.renderComponent();
            this.isRendering = false;
            // received a rerender request while rendering
            if (this.needsRerender) {
                this.delayedRerender();
            }
        };
        /*
        don't call this directly. use executeRender instead
        */
        Calendar.prototype.renderComponent = function () {
            var _a = this, state = _a.state, component = _a.component;
            var viewType = state.viewType;
            var viewSpec = this.viewSpecs[viewType];
            if (!viewSpec) {
                throw new Error("View type \"" + viewType + "\" is not valid");
            }
            // if event sources are still loading and progressive rendering hasn't been enabled,
            // keep rendering the last fully loaded set of events
            var renderableEventStore = this.renderableEventStore =
                (state.eventSourceLoadingLevel && !this.opt('progressiveEventRendering')) ?
                    this.renderableEventStore :
                    state.eventStore;
            var eventUiSingleBase = this.buildEventUiSingleBase(viewSpec.options);
            var eventUiBySource = this.buildEventUiBySource(state.eventSources);
            var eventUiBases = this.eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource);
            component.receiveProps(__assign({}, state, { viewSpec: viewSpec, dateProfileGenerator: this.dateProfileGenerators[viewType], dateProfile: state.dateProfile, eventStore: renderableEventStore, eventUiBases: eventUiBases, dateSelection: state.dateSelection, eventSelection: state.eventSelection, eventDrag: state.eventDrag, eventResize: state.eventResize }), this.buildComponentContext(this.theme, this.dateEnv, this.optionsManager.computed));
            if (this.isViewUpdated) {
                this.isViewUpdated = false;
                this.publiclyTrigger('viewSkeletonRender', [
                    {
                        view: component.view,
                        el: component.view.el
                    }
                ]);
            }
            if (this.isDatesUpdated) {
                this.isDatesUpdated = false;
                this.publiclyTrigger('datesRender', [
                    {
                        view: component.view,
                        el: component.view.el
                    }
                ]);
            }
            if (this.isEventsUpdated) {
                this.isEventsUpdated = false;
            }
            this.releaseAfterSizingTriggers();
        };
        // Options
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.setOption = function (name, val) {
            var _a;
            this.mutateOptions((_a = {}, _a[name] = val, _a), [], true);
        };
        Calendar.prototype.getOption = function (name) {
            return this.optionsManager.computed[name];
        };
        Calendar.prototype.opt = function (name) {
            return this.optionsManager.computed[name];
        };
        Calendar.prototype.viewOpt = function (name) {
            return this.viewOpts()[name];
        };
        Calendar.prototype.viewOpts = function () {
            return this.viewSpecs[this.state.viewType].options;
        };
        /*
        handles option changes (like a diff)
        */
        Calendar.prototype.mutateOptions = function (updates, removals, isDynamic, deepEqual) {
            var _this = this;
            var changeHandlers = this.pluginSystem.hooks.optionChangeHandlers;
            var normalUpdates = {};
            var specialUpdates = {};
            var oldDateEnv = this.dateEnv; // do this before handleOptions
            var isTimeZoneDirty = false;
            var isSizeDirty = false;
            var anyDifficultOptions = Boolean(removals.length);
            for (var name_1 in updates) {
                if (changeHandlers[name_1]) {
                    specialUpdates[name_1] = updates[name_1];
                }
                else {
                    normalUpdates[name_1] = updates[name_1];
                }
            }
            for (var name_2 in normalUpdates) {
                if (/^(height|contentHeight|aspectRatio)$/.test(name_2)) {
                    isSizeDirty = true;
                }
                else if (/^(defaultDate|defaultView)$/.test(name_2)) ;
                else {
                    anyDifficultOptions = true;
                    if (name_2 === 'timeZone') {
                        isTimeZoneDirty = true;
                    }
                }
            }
            this.optionsManager.mutate(normalUpdates, removals, isDynamic);
            if (anyDifficultOptions) {
                this.handleOptions(this.optionsManager.computed);
            }
            this.batchRendering(function () {
                if (anyDifficultOptions) {
                    if (isTimeZoneDirty) {
                        _this.dispatch({
                            type: 'CHANGE_TIMEZONE',
                            oldDateEnv: oldDateEnv
                        });
                    }
                    /* HACK
                    has the same effect as calling this.requestRerender()
                    but recomputes the state's dateProfile
                    */
                    _this.dispatch({
                        type: 'SET_VIEW_TYPE',
                        viewType: _this.state.viewType
                    });
                }
                else if (isSizeDirty) {
                    _this.updateSize();
                }
                // special updates
                if (deepEqual) {
                    for (var name_3 in specialUpdates) {
                        changeHandlers[name_3](specialUpdates[name_3], _this, deepEqual);
                    }
                }
            });
        };
        /*
        rebuilds things based off of a complete set of refined options
        */
        Calendar.prototype.handleOptions = function (options) {
            var _this = this;
            var pluginHooks = this.pluginSystem.hooks;
            this.defaultAllDayEventDuration = createDuration(options.defaultAllDayEventDuration);
            this.defaultTimedEventDuration = createDuration(options.defaultTimedEventDuration);
            this.delayedRerender = this.buildDelayedRerender(options.rerenderDelay);
            this.theme = this.buildTheme(options);
            var available = this.parseRawLocales(options.locales);
            this.availableRawLocales = available.map;
            var locale = this.buildLocale(options.locale || available.defaultCode, available.map);
            this.dateEnv = this.buildDateEnv(locale, options.timeZone, pluginHooks.namedTimeZonedImpl, options.firstDay, options.weekNumberCalculation, options.weekLabel, pluginHooks.cmdFormatter);
            this.selectionConfig = this.buildSelectionConfig(options); // needs dateEnv. do after :(
            // ineffecient to do every time?
            this.viewSpecs = buildViewSpecs(pluginHooks.views, this.optionsManager);
            // ineffecient to do every time?
            this.dateProfileGenerators = mapHash(this.viewSpecs, function (viewSpec) {
                return new viewSpec.class.prototype.dateProfileGeneratorClass(viewSpec, _this);
            });
        };
        Calendar.prototype.getAvailableLocaleCodes = function () {
            return Object.keys(this.availableRawLocales);
        };
        Calendar.prototype._buildSelectionConfig = function (rawOpts) {
            return processScopedUiProps('select', rawOpts, this);
        };
        Calendar.prototype._buildEventUiSingleBase = function (rawOpts) {
            if (rawOpts.editable) { // so 'editable' affected events
                rawOpts = __assign({}, rawOpts, { eventEditable: true });
            }
            return processScopedUiProps('event', rawOpts, this);
        };
        // Trigger
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.hasPublicHandlers = function (name) {
            return this.hasHandlers(name) ||
                this.opt(name); // handler specified in options
        };
        Calendar.prototype.publiclyTrigger = function (name, args) {
            var optHandler = this.opt(name);
            this.triggerWith(name, this, args);
            if (optHandler) {
                return optHandler.apply(this, args);
            }
        };
        Calendar.prototype.publiclyTriggerAfterSizing = function (name, args) {
            var afterSizingTriggers = this.afterSizingTriggers;
            (afterSizingTriggers[name] || (afterSizingTriggers[name] = [])).push(args);
        };
        Calendar.prototype.releaseAfterSizingTriggers = function () {
            var afterSizingTriggers = this.afterSizingTriggers;
            for (var name_4 in afterSizingTriggers) {
                for (var _i = 0, _a = afterSizingTriggers[name_4]; _i < _a.length; _i++) {
                    var args = _a[_i];
                    this.publiclyTrigger(name_4, args);
                }
            }
            this.afterSizingTriggers = {};
        };
        // View
        // -----------------------------------------------------------------------------------------------------------------
        // Returns a boolean about whether the view is okay to instantiate at some point
        Calendar.prototype.isValidViewType = function (viewType) {
            return Boolean(this.viewSpecs[viewType]);
        };
        Calendar.prototype.changeView = function (viewType, dateOrRange) {
            var dateMarker = null;
            if (dateOrRange) {
                if (dateOrRange.start && dateOrRange.end) { // a range
                    this.optionsManager.mutate({ visibleRange: dateOrRange }, []); // will not rerender
                    this.handleOptions(this.optionsManager.computed); // ...but yuck
                }
                else { // a date
                    dateMarker = this.dateEnv.createMarker(dateOrRange); // just like gotoDate
                }
            }
            this.unselect();
            this.dispatch({
                type: 'SET_VIEW_TYPE',
                viewType: viewType,
                dateMarker: dateMarker
            });
        };
        // Forces navigation to a view for the given date.
        // `viewType` can be a specific view name or a generic one like "week" or "day".
        // needs to change
        Calendar.prototype.zoomTo = function (dateMarker, viewType) {
            var spec;
            viewType = viewType || 'day'; // day is default zoom
            spec = this.viewSpecs[viewType] ||
                this.getUnitViewSpec(viewType);
            this.unselect();
            if (spec) {
                this.dispatch({
                    type: 'SET_VIEW_TYPE',
                    viewType: spec.type,
                    dateMarker: dateMarker
                });
            }
            else {
                this.dispatch({
                    type: 'SET_DATE',
                    dateMarker: dateMarker
                });
            }
        };
        // Given a duration singular unit, like "week" or "day", finds a matching view spec.
        // Preference is given to views that have corresponding buttons.
        Calendar.prototype.getUnitViewSpec = function (unit) {
            var component = this.component;
            var viewTypes = [];
            var i;
            var spec;
            // put views that have buttons first. there will be duplicates, but oh
            if (component.header) {
                viewTypes.push.apply(viewTypes, component.header.viewsWithButtons);
            }
            if (component.footer) {
                viewTypes.push.apply(viewTypes, component.footer.viewsWithButtons);
            }
            for (var viewType in this.viewSpecs) {
                viewTypes.push(viewType);
            }
            for (i = 0; i < viewTypes.length; i++) {
                spec = this.viewSpecs[viewTypes[i]];
                if (spec) {
                    if (spec.singleUnit === unit) {
                        return spec;
                    }
                }
            }
        };
        // Current Date
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.getInitialDate = function () {
            var defaultDateInput = this.opt('defaultDate');
            // compute the initial ambig-timezone date
            if (defaultDateInput != null) {
                return this.dateEnv.createMarker(defaultDateInput);
            }
            else {
                return this.getNow(); // getNow already returns unzoned
            }
        };
        Calendar.prototype.prev = function () {
            this.unselect();
            this.dispatch({ type: 'PREV' });
        };
        Calendar.prototype.next = function () {
            this.unselect();
            this.dispatch({ type: 'NEXT' });
        };
        Calendar.prototype.prevYear = function () {
            this.unselect();
            this.dispatch({
                type: 'SET_DATE',
                dateMarker: this.dateEnv.addYears(this.state.currentDate, -1)
            });
        };
        Calendar.prototype.nextYear = function () {
            this.unselect();
            this.dispatch({
                type: 'SET_DATE',
                dateMarker: this.dateEnv.addYears(this.state.currentDate, 1)
            });
        };
        Calendar.prototype.today = function () {
            this.unselect();
            this.dispatch({
                type: 'SET_DATE',
                dateMarker: this.getNow()
            });
        };
        Calendar.prototype.gotoDate = function (zonedDateInput) {
            this.unselect();
            this.dispatch({
                type: 'SET_DATE',
                dateMarker: this.dateEnv.createMarker(zonedDateInput)
            });
        };
        Calendar.prototype.incrementDate = function (deltaInput) {
            var delta = createDuration(deltaInput);
            if (delta) { // else, warn about invalid input?
                this.unselect();
                this.dispatch({
                    type: 'SET_DATE',
                    dateMarker: this.dateEnv.add(this.state.currentDate, delta)
                });
            }
        };
        // for external API
        Calendar.prototype.getDate = function () {
            return this.dateEnv.toDate(this.state.currentDate);
        };
        // Date Formatting Utils
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.formatDate = function (d, formatter) {
            var dateEnv = this.dateEnv;
            return dateEnv.format(dateEnv.createMarker(d), createFormatter(formatter));
        };
        // `settings` is for formatter AND isEndExclusive
        Calendar.prototype.formatRange = function (d0, d1, settings) {
            var dateEnv = this.dateEnv;
            return dateEnv.formatRange(dateEnv.createMarker(d0), dateEnv.createMarker(d1), createFormatter(settings, this.opt('defaultRangeSeparator')), settings);
        };
        Calendar.prototype.formatIso = function (d, omitTime) {
            var dateEnv = this.dateEnv;
            return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime: omitTime });
        };
        // Sizing
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.windowResize = function (ev) {
            if (!this.isHandlingWindowResize &&
                this.component && // why?
                ev.target === window // not a jqui resize event
            ) {
                this.isHandlingWindowResize = true;
                this.updateSize();
                this.publiclyTrigger('windowResize', [this.view]);
                this.isHandlingWindowResize = false;
            }
        };
        Calendar.prototype.updateSize = function () {
            if (this.component) { // when?
                this.component.updateSize(true);
            }
        };
        // Component Registration
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.registerInteractiveComponent = function (component, settingsInput) {
            var settings = parseInteractionSettings(component, settingsInput);
            var DEFAULT_INTERACTIONS = [
                EventClicking,
                EventHovering
            ];
            var interactionClasses = DEFAULT_INTERACTIONS.concat(this.pluginSystem.hooks.componentInteractions);
            var interactions = interactionClasses.map(function (interactionClass) {
                return new interactionClass(settings);
            });
            this.interactionsStore[component.uid] = interactions;
            interactionSettingsStore[component.uid] = settings;
        };
        Calendar.prototype.unregisterInteractiveComponent = function (component) {
            for (var _i = 0, _a = this.interactionsStore[component.uid]; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener.destroy();
            }
            delete this.interactionsStore[component.uid];
            delete interactionSettingsStore[component.uid];
        };
        // Date Selection / Event Selection / DayClick
        // -----------------------------------------------------------------------------------------------------------------
        // this public method receives start/end dates in any format, with any timezone
        // NOTE: args were changed from v3
        Calendar.prototype.select = function (dateOrObj, endDate) {
            var selectionInput;
            if (endDate == null) {
                if (dateOrObj.start != null) {
                    selectionInput = dateOrObj;
                }
                else {
                    selectionInput = {
                        start: dateOrObj,
                        end: null
                    };
                }
            }
            else {
                selectionInput = {
                    start: dateOrObj,
                    end: endDate
                };
            }
            var selection = parseDateSpan(selectionInput, this.dateEnv, createDuration({ days: 1 }) // TODO: cache this?
            );
            if (selection) { // throw parse error otherwise?
                this.dispatch({ type: 'SELECT_DATES', selection: selection });
                this.triggerDateSelect(selection);
            }
        };
        // public method
        Calendar.prototype.unselect = function (pev) {
            if (this.state.dateSelection) {
                this.dispatch({ type: 'UNSELECT_DATES' });
                this.triggerDateUnselect(pev);
            }
        };
        Calendar.prototype.triggerDateSelect = function (selection, pev) {
            var arg = __assign({}, this.buildDateSpanApi(selection), { jsEvent: pev ? pev.origEvent : null, view: this.view });
            this.publiclyTrigger('select', [arg]);
        };
        Calendar.prototype.triggerDateUnselect = function (pev) {
            this.publiclyTrigger('unselect', [
                {
                    jsEvent: pev ? pev.origEvent : null,
                    view: this.view
                }
            ]);
        };
        // TODO: receive pev?
        Calendar.prototype.triggerDateClick = function (dateSpan, dayEl, view, ev) {
            var arg = __assign({}, this.buildDatePointApi(dateSpan), { dayEl: dayEl, jsEvent: ev, // Is this always a mouse event? See #4655
                view: view });
            this.publiclyTrigger('dateClick', [arg]);
        };
        Calendar.prototype.buildDatePointApi = function (dateSpan) {
            var props = {};
            for (var _i = 0, _a = this.pluginSystem.hooks.datePointTransforms; _i < _a.length; _i++) {
                var transform = _a[_i];
                __assign(props, transform(dateSpan, this));
            }
            __assign(props, buildDatePointApi(dateSpan, this.dateEnv));
            return props;
        };
        Calendar.prototype.buildDateSpanApi = function (dateSpan) {
            var props = {};
            for (var _i = 0, _a = this.pluginSystem.hooks.dateSpanTransforms; _i < _a.length; _i++) {
                var transform = _a[_i];
                __assign(props, transform(dateSpan, this));
            }
            __assign(props, buildDateSpanApi(dateSpan, this.dateEnv));
            return props;
        };
        // Date Utils
        // -----------------------------------------------------------------------------------------------------------------
        // Returns a DateMarker for the current date, as defined by the client's computer or from the `now` option
        Calendar.prototype.getNow = function () {
            var now = this.opt('now');
            if (typeof now === 'function') {
                now = now();
            }
            if (now == null) {
                return this.dateEnv.createNowMarker();
            }
            return this.dateEnv.createMarker(now);
        };
        // Event-Date Utilities
        // -----------------------------------------------------------------------------------------------------------------
        // Given an event's allDay status and start date, return what its fallback end date should be.
        // TODO: rename to computeDefaultEventEnd
        Calendar.prototype.getDefaultEventEnd = function (allDay, marker) {
            var end = marker;
            if (allDay) {
                end = startOfDay(end);
                end = this.dateEnv.add(end, this.defaultAllDayEventDuration);
            }
            else {
                end = this.dateEnv.add(end, this.defaultTimedEventDuration);
            }
            return end;
        };
        // Public Events API
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.addEvent = function (eventInput, sourceInput) {
            if (eventInput instanceof EventApi) {
                var def = eventInput._def;
                var instance = eventInput._instance;
                // not already present? don't want to add an old snapshot
                if (!this.state.eventStore.defs[def.defId]) {
                    this.dispatch({
                        type: 'ADD_EVENTS',
                        eventStore: eventTupleToStore({ def: def, instance: instance }) // TODO: better util for two args?
                    });
                }
                return eventInput;
            }
            var sourceId;
            if (sourceInput instanceof EventSourceApi) {
                sourceId = sourceInput.internalEventSource.sourceId;
            }
            else if (sourceInput != null) {
                var sourceApi = this.getEventSourceById(sourceInput); // TODO: use an internal function
                if (!sourceApi) {
                    console.warn('Could not find an event source with ID "' + sourceInput + '"'); // TODO: test
                    return null;
                }
                else {
                    sourceId = sourceApi.internalEventSource.sourceId;
                }
            }
            var tuple = parseEvent(eventInput, sourceId, this);
            if (tuple) {
                this.dispatch({
                    type: 'ADD_EVENTS',
                    eventStore: eventTupleToStore(tuple)
                });
                return new EventApi(this, tuple.def, tuple.def.recurringDef ? null : tuple.instance);
            }
            return null;
        };
        // TODO: optimize
        Calendar.prototype.getEventById = function (id) {
            var _a = this.state.eventStore, defs = _a.defs, instances = _a.instances;
            id = String(id);
            for (var defId in defs) {
                var def = defs[defId];
                if (def.publicId === id) {
                    if (def.recurringDef) {
                        return new EventApi(this, def, null);
                    }
                    else {
                        for (var instanceId in instances) {
                            var instance = instances[instanceId];
                            if (instance.defId === def.defId) {
                                return new EventApi(this, def, instance);
                            }
                        }
                    }
                }
            }
            return null;
        };
        Calendar.prototype.getEvents = function () {
            var _a = this.state.eventStore, defs = _a.defs, instances = _a.instances;
            var eventApis = [];
            for (var id in instances) {
                var instance = instances[id];
                var def = defs[instance.defId];
                eventApis.push(new EventApi(this, def, instance));
            }
            return eventApis;
        };
        Calendar.prototype.removeAllEvents = function () {
            this.dispatch({ type: 'REMOVE_ALL_EVENTS' });
        };
        Calendar.prototype.rerenderEvents = function () {
            this.dispatch({ type: 'RESET_EVENTS' });
        };
        // Public Event Sources API
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.getEventSources = function () {
            var sourceHash = this.state.eventSources;
            var sourceApis = [];
            for (var internalId in sourceHash) {
                sourceApis.push(new EventSourceApi(this, sourceHash[internalId]));
            }
            return sourceApis;
        };
        Calendar.prototype.getEventSourceById = function (id) {
            var sourceHash = this.state.eventSources;
            id = String(id);
            for (var sourceId in sourceHash) {
                if (sourceHash[sourceId].publicId === id) {
                    return new EventSourceApi(this, sourceHash[sourceId]);
                }
            }
            return null;
        };
        Calendar.prototype.addEventSource = function (sourceInput) {
            if (sourceInput instanceof EventSourceApi) {
                // not already present? don't want to add an old snapshot
                if (!this.state.eventSources[sourceInput.internalEventSource.sourceId]) {
                    this.dispatch({
                        type: 'ADD_EVENT_SOURCES',
                        sources: [sourceInput.internalEventSource]
                    });
                }
                return sourceInput;
            }
            var eventSource = parseEventSource(sourceInput, this);
            if (eventSource) { // TODO: error otherwise?
                this.dispatch({ type: 'ADD_EVENT_SOURCES', sources: [eventSource] });
                return new EventSourceApi(this, eventSource);
            }
            return null;
        };
        Calendar.prototype.removeAllEventSources = function () {
            this.dispatch({ type: 'REMOVE_ALL_EVENT_SOURCES' });
        };
        Calendar.prototype.refetchEvents = function () {
            this.dispatch({ type: 'FETCH_EVENT_SOURCES' });
        };
        // Scroll
        // -----------------------------------------------------------------------------------------------------------------
        Calendar.prototype.scrollToTime = function (timeInput) {
            var duration = createDuration(timeInput);
            if (duration) {
                this.component.view.scrollToDuration(duration);
            }
        };
        return Calendar;
    }());
    EmitterMixin.mixInto(Calendar);
    // for memoizers
    // -----------------------------------------------------------------------------------------------------------------
    function buildComponentContext$1(theme, dateEnv, options) {
        return new ComponentContext(this, theme, dateEnv, options, null);
    }
    function buildDateEnv(locale, timeZone, namedTimeZoneImpl, firstDay, weekNumberCalculation, weekLabel, cmdFormatter) {
        return new DateEnv({
            calendarSystem: 'gregory',
            timeZone: timeZone,
            namedTimeZoneImpl: namedTimeZoneImpl,
            locale: locale,
            weekNumberCalculation: weekNumberCalculation,
            firstDay: firstDay,
            weekLabel: weekLabel,
            cmdFormatter: cmdFormatter
        });
    }
    function buildTheme(calendarOptions) {
        var themeClass = this.pluginSystem.hooks.themeClasses[calendarOptions.themeSystem] || StandardTheme;
        return new themeClass(calendarOptions);
    }
    function buildDelayedRerender(wait) {
        var func = this.tryRerender.bind(this);
        if (wait != null) {
            func = debounce(func, wait);
        }
        return func;
    }
    function buildEventUiBySource(eventSources) {
        return mapHash(eventSources, function (eventSource) {
            return eventSource.ui;
        });
    }
    function buildEventUiBases(eventDefs, eventUiSingleBase, eventUiBySource) {
        var eventUiBases = { '': eventUiSingleBase };
        for (var defId in eventDefs) {
            var def = eventDefs[defId];
            if (def.sourceId && eventUiBySource[def.sourceId]) {
                eventUiBases[defId] = eventUiBySource[def.sourceId];
            }
        }
        return eventUiBases;
    }

    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View(viewSpec, parentEl) {
            var _this = _super.call(this, createElement('div', { className: 'fc-view fc-' + viewSpec.type + '-view' })) || this;
            _this.renderDatesMem = memoizeRendering(_this.renderDatesWrap, _this.unrenderDatesWrap);
            _this.renderBusinessHoursMem = memoizeRendering(_this.renderBusinessHours, _this.unrenderBusinessHours, [_this.renderDatesMem]);
            _this.renderDateSelectionMem = memoizeRendering(_this.renderDateSelectionWrap, _this.unrenderDateSelectionWrap, [_this.renderDatesMem]);
            _this.renderEventsMem = memoizeRendering(_this.renderEvents, _this.unrenderEvents, [_this.renderDatesMem]);
            _this.renderEventSelectionMem = memoizeRendering(_this.renderEventSelectionWrap, _this.unrenderEventSelectionWrap, [_this.renderEventsMem]);
            _this.renderEventDragMem = memoizeRendering(_this.renderEventDragWrap, _this.unrenderEventDragWrap, [_this.renderDatesMem]);
            _this.renderEventResizeMem = memoizeRendering(_this.renderEventResizeWrap, _this.unrenderEventResizeWrap, [_this.renderDatesMem]);
            _this.viewSpec = viewSpec;
            _this.type = viewSpec.type;
            parentEl.appendChild(_this.el);
            _this.initialize();
            return _this;
        }
        View.prototype.initialize = function () {
        };
        Object.defineProperty(View.prototype, "activeStart", {
            // Date Setting/Unsetting
            // -----------------------------------------------------------------------------------------------------------------
            get: function () {
                return this.context.dateEnv.toDate(this.props.dateProfile.activeRange.start);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "activeEnd", {
            get: function () {
                return this.context.dateEnv.toDate(this.props.dateProfile.activeRange.end);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "currentStart", {
            get: function () {
                return this.context.dateEnv.toDate(this.props.dateProfile.currentRange.start);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "currentEnd", {
            get: function () {
                return this.context.dateEnv.toDate(this.props.dateProfile.currentRange.end);
            },
            enumerable: true,
            configurable: true
        });
        // General Rendering
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.render = function (props, context) {
            this.renderDatesMem(props.dateProfile);
            this.renderBusinessHoursMem(props.businessHours);
            this.renderDateSelectionMem(props.dateSelection);
            this.renderEventsMem(props.eventStore);
            this.renderEventSelectionMem(props.eventSelection);
            this.renderEventDragMem(props.eventDrag);
            this.renderEventResizeMem(props.eventResize);
        };
        View.prototype.beforeUpdate = function () {
            this.addScroll(this.queryScroll());
        };
        View.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderDatesMem.unrender(); // should unrender everything else
        };
        // Sizing
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.updateSize = function (isResize, viewHeight, isAuto) {
            var calendar = this.context.calendar;
            if (isResize) {
                this.addScroll(this.queryScroll()); // NOTE: same code as in beforeUpdate
            }
            if (isResize || // HACKS...
                calendar.isViewUpdated ||
                calendar.isDatesUpdated ||
                calendar.isEventsUpdated) {
                // sort of the catch-all sizing
                // anything that might cause dimension changes
                this.updateBaseSize(isResize, viewHeight, isAuto);
            }
            // NOTE: popScroll is called by CalendarComponent
        };
        View.prototype.updateBaseSize = function (isResize, viewHeight, isAuto) {
        };
        // Date Rendering
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderDatesWrap = function (dateProfile) {
            this.renderDates(dateProfile);
            this.addScroll({
                duration: createDuration(this.context.options.scrollTime)
            });
        };
        View.prototype.unrenderDatesWrap = function () {
            this.stopNowIndicator();
            this.unrenderDates();
        };
        View.prototype.renderDates = function (dateProfile) { };
        View.prototype.unrenderDates = function () { };
        // Business Hours
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderBusinessHours = function (businessHours) { };
        View.prototype.unrenderBusinessHours = function () { };
        // Date Selection
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderDateSelectionWrap = function (selection) {
            if (selection) {
                this.renderDateSelection(selection);
            }
        };
        View.prototype.unrenderDateSelectionWrap = function (selection) {
            if (selection) {
                this.unrenderDateSelection(selection);
            }
        };
        View.prototype.renderDateSelection = function (selection) { };
        View.prototype.unrenderDateSelection = function (selection) { };
        // Event Rendering
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderEvents = function (eventStore) { };
        View.prototype.unrenderEvents = function () { };
        // util for subclasses
        View.prototype.sliceEvents = function (eventStore, allDay) {
            var props = this.props;
            return sliceEventStore(eventStore, props.eventUiBases, props.dateProfile.activeRange, allDay ? this.context.nextDayThreshold : null).fg;
        };
        // Event Selection
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderEventSelectionWrap = function (instanceId) {
            if (instanceId) {
                this.renderEventSelection(instanceId);
            }
        };
        View.prototype.unrenderEventSelectionWrap = function (instanceId) {
            if (instanceId) {
                this.unrenderEventSelection(instanceId);
            }
        };
        View.prototype.renderEventSelection = function (instanceId) { };
        View.prototype.unrenderEventSelection = function (instanceId) { };
        // Event Drag
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderEventDragWrap = function (state) {
            if (state) {
                this.renderEventDrag(state);
            }
        };
        View.prototype.unrenderEventDragWrap = function (state) {
            if (state) {
                this.unrenderEventDrag(state);
            }
        };
        View.prototype.renderEventDrag = function (state) { };
        View.prototype.unrenderEventDrag = function (state) { };
        // Event Resize
        // -----------------------------------------------------------------------------------------------------------------
        View.prototype.renderEventResizeWrap = function (state) {
            if (state) {
                this.renderEventResize(state);
            }
        };
        View.prototype.unrenderEventResizeWrap = function (state) {
            if (state) {
                this.unrenderEventResize(state);
            }
        };
        View.prototype.renderEventResize = function (state) { };
        View.prototype.unrenderEventResize = function (state) { };
        /* Now Indicator
        ------------------------------------------------------------------------------------------------------------------*/
        // Immediately render the current time indicator and begins re-rendering it at an interval,
        // which is defined by this.getNowIndicatorUnit().
        // TODO: somehow do this for the current whole day's background too
        // USAGE: must be called manually from subclasses' render methods! don't need to call stopNowIndicator tho
        View.prototype.startNowIndicator = function (dateProfile, dateProfileGenerator) {
            var _this = this;
            var _a = this.context, calendar = _a.calendar, dateEnv = _a.dateEnv, options = _a.options;
            var unit;
            var update;
            var delay; // ms wait value
            if (options.nowIndicator && !this.initialNowDate) {
                unit = this.getNowIndicatorUnit(dateProfile, dateProfileGenerator);
                if (unit) {
                    update = this.updateNowIndicator.bind(this);
                    this.initialNowDate = calendar.getNow();
                    this.initialNowQueriedMs = new Date().valueOf();
                    // wait until the beginning of the next interval
                    delay = dateEnv.add(dateEnv.startOf(this.initialNowDate, unit), createDuration(1, unit)).valueOf() - this.initialNowDate.valueOf();
                    // TODO: maybe always use setTimeout, waiting until start of next unit
                    this.nowIndicatorTimeoutID = setTimeout(function () {
                        _this.nowIndicatorTimeoutID = null;
                        update();
                        if (unit === 'second') {
                            delay = 1000; // every second
                        }
                        else {
                            delay = 1000 * 60; // otherwise, every minute
                        }
                        _this.nowIndicatorIntervalID = setInterval(update, delay); // update every interval
                    }, delay);
                }
                // rendering will be initiated in updateSize
            }
        };
        // rerenders the now indicator, computing the new current time from the amount of time that has passed
        // since the initial getNow call.
        View.prototype.updateNowIndicator = function () {
            if (this.props.dateProfile && // a way to determine if dates were rendered yet
                this.initialNowDate // activated before?
            ) {
                this.unrenderNowIndicator(); // won't unrender if unnecessary
                this.renderNowIndicator(addMs(this.initialNowDate, new Date().valueOf() - this.initialNowQueriedMs));
                this.isNowIndicatorRendered = true;
            }
        };
        // Immediately unrenders the view's current time indicator and stops any re-rendering timers.
        // Won't cause side effects if indicator isn't rendered.
        View.prototype.stopNowIndicator = function () {
            if (this.nowIndicatorTimeoutID) {
                clearTimeout(this.nowIndicatorTimeoutID);
                this.nowIndicatorTimeoutID = null;
            }
            if (this.nowIndicatorIntervalID) {
                clearInterval(this.nowIndicatorIntervalID);
                this.nowIndicatorIntervalID = null;
            }
            if (this.isNowIndicatorRendered) {
                this.unrenderNowIndicator();
                this.isNowIndicatorRendered = false;
            }
        };
        View.prototype.getNowIndicatorUnit = function (dateProfile, dateProfileGenerator) {
            // subclasses should implement
        };
        // Renders a current time indicator at the given datetime
        View.prototype.renderNowIndicator = function (date) {
            // SUBCLASSES MUST PASS TO CHILDREN!
        };
        // Undoes the rendering actions from renderNowIndicator
        View.prototype.unrenderNowIndicator = function () {
            // SUBCLASSES MUST PASS TO CHILDREN!
        };
        /* Scroller
        ------------------------------------------------------------------------------------------------------------------*/
        View.prototype.addScroll = function (scroll, isForced) {
            if (isForced) {
                scroll.isForced = isForced;
            }
            __assign(this.queuedScroll || (this.queuedScroll = {}), scroll);
        };
        View.prototype.popScroll = function (isResize) {
            this.applyQueuedScroll(isResize);
            this.queuedScroll = null;
        };
        View.prototype.applyQueuedScroll = function (isResize) {
            if (this.queuedScroll) {
                this.applyScroll(this.queuedScroll, isResize);
            }
        };
        View.prototype.queryScroll = function () {
            var scroll = {};
            if (this.props.dateProfile) { // dates rendered yet?
                __assign(scroll, this.queryDateScroll());
            }
            return scroll;
        };
        View.prototype.applyScroll = function (scroll, isResize) {
            var duration = scroll.duration, isForced = scroll.isForced;
            if (duration != null && !isForced) {
                delete scroll.duration;
                if (this.props.dateProfile) { // dates rendered yet?
                    __assign(scroll, this.computeDateScroll(duration));
                }
            }
            if (this.props.dateProfile) { // dates rendered yet?
                this.applyDateScroll(scroll);
            }
        };
        View.prototype.computeDateScroll = function (duration) {
            return {}; // subclasses must implement
        };
        View.prototype.queryDateScroll = function () {
            return {}; // subclasses must implement
        };
        View.prototype.applyDateScroll = function (scroll) {
            // subclasses must implement
        };
        // for API
        View.prototype.scrollToDuration = function (duration) {
            this.applyScroll({ duration: duration }, false);
        };
        return View;
    }(DateComponent));
    EmitterMixin.mixInto(View);
    View.prototype.usesMinMaxTime = false;
    View.prototype.dateProfileGeneratorClass = DateProfileGenerator;

    var FgEventRenderer = /** @class */ (function () {
        function FgEventRenderer() {
            this.segs = [];
            this.isSizeDirty = false;
        }
        FgEventRenderer.prototype.renderSegs = function (context, segs, mirrorInfo) {
            this.context = context;
            this.rangeUpdated(); // called too frequently :(
            // render an `.el` on each seg
            // returns a subset of the segs. segs that were actually rendered
            segs = this.renderSegEls(segs, mirrorInfo);
            this.segs = segs;
            this.attachSegs(segs, mirrorInfo);
            this.isSizeDirty = true;
            triggerRenderedSegs(this.context, this.segs, Boolean(mirrorInfo));
        };
        FgEventRenderer.prototype.unrender = function (context, _segs, mirrorInfo) {
            triggerWillRemoveSegs(this.context, this.segs, Boolean(mirrorInfo));
            this.detachSegs(this.segs);
            this.segs = [];
        };
        // Updates values that rely on options and also relate to range
        FgEventRenderer.prototype.rangeUpdated = function () {
            var options = this.context.options;
            var displayEventTime;
            var displayEventEnd;
            this.eventTimeFormat = createFormatter(options.eventTimeFormat || this.computeEventTimeFormat(), options.defaultRangeSeparator);
            displayEventTime = options.displayEventTime;
            if (displayEventTime == null) {
                displayEventTime = this.computeDisplayEventTime(); // might be based off of range
            }
            displayEventEnd = options.displayEventEnd;
            if (displayEventEnd == null) {
                displayEventEnd = this.computeDisplayEventEnd(); // might be based off of range
            }
            this.displayEventTime = displayEventTime;
            this.displayEventEnd = displayEventEnd;
        };
        // Renders and assigns an `el` property for each foreground event segment.
        // Only returns segments that successfully rendered.
        FgEventRenderer.prototype.renderSegEls = function (segs, mirrorInfo) {
            var html = '';
            var i;
            if (segs.length) { // don't build an empty html string
                // build a large concatenation of event segment HTML
                for (i = 0; i < segs.length; i++) {
                    html += this.renderSegHtml(segs[i], mirrorInfo);
                }
                // Grab individual elements from the combined HTML string. Use each as the default rendering.
                // Then, compute the 'el' for each segment. An el might be null if the eventRender callback returned false.
                htmlToElements(html).forEach(function (el, i) {
                    var seg = segs[i];
                    if (el) {
                        seg.el = el;
                    }
                });
                segs = filterSegsViaEls(this.context, segs, Boolean(mirrorInfo));
            }
            return segs;
        };
        // Generic utility for generating the HTML classNames for an event segment's element
        FgEventRenderer.prototype.getSegClasses = function (seg, isDraggable, isResizable, mirrorInfo) {
            var classes = [
                'fc-event',
                seg.isStart ? 'fc-start' : 'fc-not-start',
                seg.isEnd ? 'fc-end' : 'fc-not-end'
            ].concat(seg.eventRange.ui.classNames);
            if (isDraggable) {
                classes.push('fc-draggable');
            }
            if (isResizable) {
                classes.push('fc-resizable');
            }
            if (mirrorInfo) {
                classes.push('fc-mirror');
                if (mirrorInfo.isDragging) {
                    classes.push('fc-dragging');
                }
                if (mirrorInfo.isResizing) {
                    classes.push('fc-resizing');
                }
            }
            return classes;
        };
        // Compute the text that should be displayed on an event's element.
        // `range` can be the Event object itself, or something range-like, with at least a `start`.
        // If event times are disabled, or the event has no time, will return a blank string.
        // If not specified, formatter will default to the eventTimeFormat setting,
        // and displayEnd will default to the displayEventEnd setting.
        FgEventRenderer.prototype.getTimeText = function (eventRange, formatter, displayEnd) {
            var def = eventRange.def, instance = eventRange.instance;
            return this._getTimeText(instance.range.start, def.hasEnd ? instance.range.end : null, def.allDay, formatter, displayEnd, instance.forcedStartTzo, instance.forcedEndTzo);
        };
        FgEventRenderer.prototype._getTimeText = function (start, end, allDay, formatter, displayEnd, forcedStartTzo, forcedEndTzo) {
            var dateEnv = this.context.dateEnv;
            if (formatter == null) {
                formatter = this.eventTimeFormat;
            }
            if (displayEnd == null) {
                displayEnd = this.displayEventEnd;
            }
            if (this.displayEventTime && !allDay) {
                if (displayEnd && end) {
                    return dateEnv.formatRange(start, end, formatter, {
                        forcedStartTzo: forcedStartTzo,
                        forcedEndTzo: forcedEndTzo
                    });
                }
                else {
                    return dateEnv.format(start, formatter, {
                        forcedTzo: forcedStartTzo
                    });
                }
            }
            return '';
        };
        FgEventRenderer.prototype.computeEventTimeFormat = function () {
            return {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true
            };
        };
        FgEventRenderer.prototype.computeDisplayEventTime = function () {
            return true;
        };
        FgEventRenderer.prototype.computeDisplayEventEnd = function () {
            return true;
        };
        // Utility for generating event skin-related CSS properties
        FgEventRenderer.prototype.getSkinCss = function (ui) {
            return {
                'background-color': ui.backgroundColor,
                'border-color': ui.borderColor,
                color: ui.textColor
            };
        };
        FgEventRenderer.prototype.sortEventSegs = function (segs) {
            var specs = this.context.eventOrderSpecs;
            var objs = segs.map(buildSegCompareObj);
            objs.sort(function (obj0, obj1) {
                return compareByFieldSpecs(obj0, obj1, specs);
            });
            return objs.map(function (c) {
                return c._seg;
            });
        };
        FgEventRenderer.prototype.computeSizes = function (force) {
            if (force || this.isSizeDirty) {
                this.computeSegSizes(this.segs);
            }
        };
        FgEventRenderer.prototype.assignSizes = function (force) {
            if (force || this.isSizeDirty) {
                this.assignSegSizes(this.segs);
                this.isSizeDirty = false;
            }
        };
        FgEventRenderer.prototype.computeSegSizes = function (segs) {
        };
        FgEventRenderer.prototype.assignSegSizes = function (segs) {
        };
        // Manipulation on rendered segs
        FgEventRenderer.prototype.hideByHash = function (hash) {
            if (hash) {
                for (var _i = 0, _a = this.segs; _i < _a.length; _i++) {
                    var seg = _a[_i];
                    if (hash[seg.eventRange.instance.instanceId]) {
                        seg.el.style.visibility = 'hidden';
                    }
                }
            }
        };
        FgEventRenderer.prototype.showByHash = function (hash) {
            if (hash) {
                for (var _i = 0, _a = this.segs; _i < _a.length; _i++) {
                    var seg = _a[_i];
                    if (hash[seg.eventRange.instance.instanceId]) {
                        seg.el.style.visibility = '';
                    }
                }
            }
        };
        FgEventRenderer.prototype.selectByInstanceId = function (instanceId) {
            if (instanceId) {
                for (var _i = 0, _a = this.segs; _i < _a.length; _i++) {
                    var seg = _a[_i];
                    var eventInstance = seg.eventRange.instance;
                    if (eventInstance && eventInstance.instanceId === instanceId &&
                        seg.el // necessary?
                    ) {
                        seg.el.classList.add('fc-selected');
                    }
                }
            }
        };
        FgEventRenderer.prototype.unselectByInstanceId = function (instanceId) {
            if (instanceId) {
                for (var _i = 0, _a = this.segs; _i < _a.length; _i++) {
                    var seg = _a[_i];
                    if (seg.el) { // necessary?
                        seg.el.classList.remove('fc-selected');
                    }
                }
            }
        };
        return FgEventRenderer;
    }());
    // returns a object with all primitive props that can be compared
    function buildSegCompareObj(seg) {
        var eventDef = seg.eventRange.def;
        var range = seg.eventRange.instance.range;
        var start = range.start ? range.start.valueOf() : 0; // TODO: better support for open-range events
        var end = range.end ? range.end.valueOf() : 0; // "
        return __assign({}, eventDef.extendedProps, eventDef, { id: eventDef.publicId, start: start,
            end: end, duration: end - start, allDay: Number(eventDef.allDay), _seg: seg // for later retrieval
         });
    }

    /*
    TODO: when refactoring this class, make a new FillRenderer instance for each `type`
    */
    var FillRenderer = /** @class */ (function () {
        function FillRenderer() {
            this.fillSegTag = 'div';
            this.dirtySizeFlags = {};
            this.containerElsByType = {};
            this.segsByType = {};
        }
        FillRenderer.prototype.getSegsByType = function (type) {
            return this.segsByType[type] || [];
        };
        FillRenderer.prototype.renderSegs = function (type, context, segs) {
            var _a;
            this.context = context;
            var renderedSegs = this.renderSegEls(type, segs); // assignes `.el` to each seg. returns successfully rendered segs
            var containerEls = this.attachSegs(type, renderedSegs);
            if (containerEls) {
                (_a = (this.containerElsByType[type] || (this.containerElsByType[type] = []))).push.apply(_a, containerEls);
            }
            this.segsByType[type] = renderedSegs;
            if (type === 'bgEvent') {
                triggerRenderedSegs(context, renderedSegs, false); // isMirror=false
            }
            this.dirtySizeFlags[type] = true;
        };
        // Unrenders a specific type of fill that is currently rendered on the grid
        FillRenderer.prototype.unrender = function (type, context) {
            var segs = this.segsByType[type];
            if (segs) {
                if (type === 'bgEvent') {
                    triggerWillRemoveSegs(context, segs, false); // isMirror=false
                }
                this.detachSegs(type, segs);
            }
        };
        // Renders and assigns an `el` property for each fill segment. Generic enough to work with different types.
        // Only returns segments that successfully rendered.
        FillRenderer.prototype.renderSegEls = function (type, segs) {
            var _this = this;
            var html = '';
            var i;
            if (segs.length) {
                // build a large concatenation of segment HTML
                for (i = 0; i < segs.length; i++) {
                    html += this.renderSegHtml(type, segs[i]);
                }
                // Grab individual elements from the combined HTML string. Use each as the default rendering.
                // Then, compute the 'el' for each segment.
                htmlToElements(html).forEach(function (el, i) {
                    var seg = segs[i];
                    if (el) {
                        seg.el = el;
                    }
                });
                if (type === 'bgEvent') {
                    segs = filterSegsViaEls(this.context, segs, false // isMirror. background events can never be mirror elements
                    );
                }
                // correct element type? (would be bad if a non-TD were inserted into a table for example)
                segs = segs.filter(function (seg) {
                    return elementMatches(seg.el, _this.fillSegTag);
                });
            }
            return segs;
        };
        // Builds the HTML needed for one fill segment. Generic enough to work with different types.
        FillRenderer.prototype.renderSegHtml = function (type, seg) {
            var css = null;
            var classNames = [];
            if (type !== 'highlight' && type !== 'businessHours') {
                css = {
                    'background-color': seg.eventRange.ui.backgroundColor
                };
            }
            if (type !== 'highlight') {
                classNames = classNames.concat(seg.eventRange.ui.classNames);
            }
            if (type === 'businessHours') {
                classNames.push('fc-bgevent');
            }
            else {
                classNames.push('fc-' + type.toLowerCase());
            }
            return '<' + this.fillSegTag +
                (classNames.length ? ' class="' + classNames.join(' ') + '"' : '') +
                (css ? ' style="' + cssToStr(css) + '"' : '') +
                '></' + this.fillSegTag + '>';
        };
        FillRenderer.prototype.detachSegs = function (type, segs) {
            var containerEls = this.containerElsByType[type];
            if (containerEls) {
                containerEls.forEach(removeElement);
                delete this.containerElsByType[type];
            }
        };
        FillRenderer.prototype.computeSizes = function (force) {
            for (var type in this.segsByType) {
                if (force || this.dirtySizeFlags[type]) {
                    this.computeSegSizes(this.segsByType[type]);
                }
            }
        };
        FillRenderer.prototype.assignSizes = function (force) {
            for (var type in this.segsByType) {
                if (force || this.dirtySizeFlags[type]) {
                    this.assignSegSizes(this.segsByType[type]);
                }
            }
            this.dirtySizeFlags = {};
        };
        FillRenderer.prototype.computeSegSizes = function (segs) {
        };
        FillRenderer.prototype.assignSegSizes = function (segs) {
        };
        return FillRenderer;
    }());

    var NamedTimeZoneImpl = /** @class */ (function () {
        function NamedTimeZoneImpl(timeZoneName) {
            this.timeZoneName = timeZoneName;
        }
        return NamedTimeZoneImpl;
    }());

    /*
    An abstraction for a dragging interaction originating on an event.
    Does higher-level things than PointerDragger, such as possibly:
    - a "mirror" that moves with the pointer
    - a minimum number of pixels or other criteria for a true drag to begin

    subclasses must emit:
    - pointerdown
    - dragstart
    - dragmove
    - pointerup
    - dragend
    */
    var ElementDragging = /** @class */ (function () {
        function ElementDragging(el) {
            this.emitter = new EmitterMixin();
        }
        ElementDragging.prototype.destroy = function () {
        };
        ElementDragging.prototype.setMirrorIsVisible = function (bool) {
            // optional if subclass doesn't want to support a mirror
        };
        ElementDragging.prototype.setMirrorNeedsRevert = function (bool) {
            // optional if subclass doesn't want to support a mirror
        };
        ElementDragging.prototype.setAutoScrollEnabled = function (bool) {
            // optional
        };
        return ElementDragging;
    }());

    function formatDate(dateInput, settings) {
        if (settings === void 0) { settings = {}; }
        var dateEnv = buildDateEnv$1(settings);
        var formatter = createFormatter(settings);
        var dateMeta = dateEnv.createMarkerMeta(dateInput);
        if (!dateMeta) { // TODO: warning?
            return '';
        }
        return dateEnv.format(dateMeta.marker, formatter, {
            forcedTzo: dateMeta.forcedTzo
        });
    }
    function formatRange(startInput, endInput, settings // mixture of env and formatter settings
    ) {
        var dateEnv = buildDateEnv$1(typeof settings === 'object' && settings ? settings : {}); // pass in if non-null object
        var formatter = createFormatter(settings, globalDefaults.defaultRangeSeparator);
        var startMeta = dateEnv.createMarkerMeta(startInput);
        var endMeta = dateEnv.createMarkerMeta(endInput);
        if (!startMeta || !endMeta) { // TODO: warning?
            return '';
        }
        return dateEnv.formatRange(startMeta.marker, endMeta.marker, formatter, {
            forcedStartTzo: startMeta.forcedTzo,
            forcedEndTzo: endMeta.forcedTzo,
            isEndExclusive: settings.isEndExclusive
        });
    }
    // TODO: more DRY and optimized
    function buildDateEnv$1(settings) {
        var locale = buildLocale(settings.locale || 'en', parseRawLocales([]).map); // TODO: don't hardcode 'en' everywhere
        // ensure required settings
        settings = __assign({ timeZone: globalDefaults.timeZone, calendarSystem: 'gregory' }, settings, { locale: locale });
        return new DateEnv(settings);
    }

    var DRAG_META_PROPS = {
        startTime: createDuration,
        duration: createDuration,
        create: Boolean,
        sourceId: String
    };
    var DRAG_META_DEFAULTS = {
        create: true
    };
    function parseDragMeta(raw) {
        var leftoverProps = {};
        var refined = refineProps(raw, DRAG_META_PROPS, DRAG_META_DEFAULTS, leftoverProps);
        refined.leftoverProps = leftoverProps;
        return refined;
    }

    // Computes a default column header formatting string if `colFormat` is not explicitly defined
    function computeFallbackHeaderFormat(datesRepDistinctDays, dayCnt) {
        // if more than one week row, or if there are a lot of columns with not much space,
        // put just the day numbers will be in each cell
        if (!datesRepDistinctDays || dayCnt > 10) {
            return { weekday: 'short' }; // "Sat"
        }
        else if (dayCnt > 1) {
            return { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }; // "Sat 11/12"
        }
        else {
            return { weekday: 'long' }; // "Saturday"
        }
    }
    function renderDateCell(dateMarker, dateProfile, datesRepDistinctDays, colCnt, colHeadFormat, context, colspan, otherAttrs) {
        var dateEnv = context.dateEnv, theme = context.theme, options = context.options;
        var isDateValid = rangeContainsMarker(dateProfile.activeRange, dateMarker); // TODO: called too frequently. cache somehow.
        var classNames = [
            'fc-day-header',
            theme.getClass('widgetHeader')
        ];
        var innerHtml;
        if (typeof options.columnHeaderHtml === 'function') {
            innerHtml = options.columnHeaderHtml(dateEnv.toDate(dateMarker));
        }
        else if (typeof options.columnHeaderText === 'function') {
            innerHtml = htmlEscape(options.columnHeaderText(dateEnv.toDate(dateMarker)));
        }
        else {
            innerHtml = htmlEscape(dateEnv.format(dateMarker, colHeadFormat));
        }
        // if only one row of days, the classNames on the header can represent the specific days beneath
        if (datesRepDistinctDays) {
            classNames = classNames.concat(
            // includes the day-of-week class
            // noThemeHighlight=true (don't highlight the header)
            getDayClasses(dateMarker, dateProfile, context, true));
        }
        else {
            classNames.push('fc-' + DAY_IDS[dateMarker.getUTCDay()]); // only add the day-of-week class
        }
        return '' +
            '<th class="' + classNames.join(' ') + '"' +
            ((isDateValid && datesRepDistinctDays) ?
                ' data-date="' + dateEnv.formatIso(dateMarker, { omitTime: true }) + '"' :
                '') +
            (colspan > 1 ?
                ' colspan="' + colspan + '"' :
                '') +
            (otherAttrs ?
                ' ' + otherAttrs :
                '') +
            '>' +
            (isDateValid ?
                // don't make a link if the heading could represent multiple days, or if there's only one day (forceOff)
                buildGotoAnchorHtml(options, dateEnv, { date: dateMarker, forceOff: !datesRepDistinctDays || colCnt === 1 }, innerHtml) :
                // if not valid, display text, but no link
                innerHtml) +
            '</th>';
    }

    var DayHeader = /** @class */ (function (_super) {
        __extends(DayHeader, _super);
        function DayHeader(parentEl) {
            var _this = _super.call(this) || this;
            _this.renderSkeleton = memoizeRendering(_this._renderSkeleton, _this._unrenderSkeleton);
            _this.parentEl = parentEl;
            return _this;
        }
        DayHeader.prototype.render = function (props, context) {
            var dates = props.dates, datesRepDistinctDays = props.datesRepDistinctDays;
            var parts = [];
            this.renderSkeleton(context);
            if (props.renderIntroHtml) {
                parts.push(props.renderIntroHtml());
            }
            var colHeadFormat = createFormatter(context.options.columnHeaderFormat ||
                computeFallbackHeaderFormat(datesRepDistinctDays, dates.length));
            for (var _i = 0, dates_1 = dates; _i < dates_1.length; _i++) {
                var date = dates_1[_i];
                parts.push(renderDateCell(date, props.dateProfile, datesRepDistinctDays, dates.length, colHeadFormat, context));
            }
            if (context.isRtl) {
                parts.reverse();
            }
            this.thead.innerHTML = '<tr>' + parts.join('') + '</tr>';
        };
        DayHeader.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderSkeleton.unrender();
        };
        DayHeader.prototype._renderSkeleton = function (context) {
            var theme = context.theme;
            var parentEl = this.parentEl;
            parentEl.innerHTML = ''; // because might be nbsp
            parentEl.appendChild(this.el = htmlToElement('<div class="fc-row ' + theme.getClass('headerRow') + '">' +
                '<table class="' + theme.getClass('tableGrid') + '">' +
                '<thead></thead>' +
                '</table>' +
                '</div>'));
            this.thead = this.el.querySelector('thead');
        };
        DayHeader.prototype._unrenderSkeleton = function () {
            removeElement(this.el);
        };
        return DayHeader;
    }(Component));

    var DaySeries = /** @class */ (function () {
        function DaySeries(range, dateProfileGenerator) {
            var date = range.start;
            var end = range.end;
            var indices = [];
            var dates = [];
            var dayIndex = -1;
            while (date < end) { // loop each day from start to end
                if (dateProfileGenerator.isHiddenDay(date)) {
                    indices.push(dayIndex + 0.5); // mark that it's between indices
                }
                else {
                    dayIndex++;
                    indices.push(dayIndex);
                    dates.push(date);
                }
                date = addDays(date, 1);
            }
            this.dates = dates;
            this.indices = indices;
            this.cnt = dates.length;
        }
        DaySeries.prototype.sliceRange = function (range) {
            var firstIndex = this.getDateDayIndex(range.start); // inclusive first index
            var lastIndex = this.getDateDayIndex(addDays(range.end, -1)); // inclusive last index
            var clippedFirstIndex = Math.max(0, firstIndex);
            var clippedLastIndex = Math.min(this.cnt - 1, lastIndex);
            // deal with in-between indices
            clippedFirstIndex = Math.ceil(clippedFirstIndex); // in-between starts round to next cell
            clippedLastIndex = Math.floor(clippedLastIndex); // in-between ends round to prev cell
            if (clippedFirstIndex <= clippedLastIndex) {
                return {
                    firstIndex: clippedFirstIndex,
                    lastIndex: clippedLastIndex,
                    isStart: firstIndex === clippedFirstIndex,
                    isEnd: lastIndex === clippedLastIndex
                };
            }
            else {
                return null;
            }
        };
        // Given a date, returns its chronolocial cell-index from the first cell of the grid.
        // If the date lies between cells (because of hiddenDays), returns a floating-point value between offsets.
        // If before the first offset, returns a negative number.
        // If after the last offset, returns an offset past the last cell offset.
        // Only works for *start* dates of cells. Will not work for exclusive end dates for cells.
        DaySeries.prototype.getDateDayIndex = function (date) {
            var indices = this.indices;
            var dayOffset = Math.floor(diffDays(this.dates[0], date));
            if (dayOffset < 0) {
                return indices[0] - 1;
            }
            else if (dayOffset >= indices.length) {
                return indices[indices.length - 1] + 1;
            }
            else {
                return indices[dayOffset];
            }
        };
        return DaySeries;
    }());

    var DayTable = /** @class */ (function () {
        function DayTable(daySeries, breakOnWeeks) {
            var dates = daySeries.dates;
            var daysPerRow;
            var firstDay;
            var rowCnt;
            if (breakOnWeeks) {
                // count columns until the day-of-week repeats
                firstDay = dates[0].getUTCDay();
                for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow++) {
                    if (dates[daysPerRow].getUTCDay() === firstDay) {
                        break;
                    }
                }
                rowCnt = Math.ceil(dates.length / daysPerRow);
            }
            else {
                rowCnt = 1;
                daysPerRow = dates.length;
            }
            this.rowCnt = rowCnt;
            this.colCnt = daysPerRow;
            this.daySeries = daySeries;
            this.cells = this.buildCells();
            this.headerDates = this.buildHeaderDates();
        }
        DayTable.prototype.buildCells = function () {
            var rows = [];
            for (var row = 0; row < this.rowCnt; row++) {
                var cells = [];
                for (var col = 0; col < this.colCnt; col++) {
                    cells.push(this.buildCell(row, col));
                }
                rows.push(cells);
            }
            return rows;
        };
        DayTable.prototype.buildCell = function (row, col) {
            return {
                date: this.daySeries.dates[row * this.colCnt + col]
            };
        };
        DayTable.prototype.buildHeaderDates = function () {
            var dates = [];
            for (var col = 0; col < this.colCnt; col++) {
                dates.push(this.cells[0][col].date);
            }
            return dates;
        };
        DayTable.prototype.sliceRange = function (range) {
            var colCnt = this.colCnt;
            var seriesSeg = this.daySeries.sliceRange(range);
            var segs = [];
            if (seriesSeg) {
                var firstIndex = seriesSeg.firstIndex, lastIndex = seriesSeg.lastIndex;
                var index = firstIndex;
                while (index <= lastIndex) {
                    var row = Math.floor(index / colCnt);
                    var nextIndex = Math.min((row + 1) * colCnt, lastIndex + 1);
                    segs.push({
                        row: row,
                        firstCol: index % colCnt,
                        lastCol: (nextIndex - 1) % colCnt,
                        isStart: seriesSeg.isStart && index === firstIndex,
                        isEnd: seriesSeg.isEnd && (nextIndex - 1) === lastIndex
                    });
                    index = nextIndex;
                }
            }
            return segs;
        };
        return DayTable;
    }());

    var Slicer = /** @class */ (function () {
        function Slicer() {
            this.sliceBusinessHours = memoize(this._sliceBusinessHours);
            this.sliceDateSelection = memoize(this._sliceDateSpan);
            this.sliceEventStore = memoize(this._sliceEventStore);
            this.sliceEventDrag = memoize(this._sliceInteraction);
            this.sliceEventResize = memoize(this._sliceInteraction);
        }
        Slicer.prototype.sliceProps = function (props, dateProfile, nextDayThreshold, calendar, component) {
            var extraArgs = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                extraArgs[_i - 5] = arguments[_i];
            }
            var eventUiBases = props.eventUiBases;
            var eventSegs = this.sliceEventStore.apply(this, [props.eventStore, eventUiBases, dateProfile, nextDayThreshold, component].concat(extraArgs));
            return {
                dateSelectionSegs: this.sliceDateSelection.apply(this, [props.dateSelection, eventUiBases, component].concat(extraArgs)),
                businessHourSegs: this.sliceBusinessHours.apply(this, [props.businessHours, dateProfile, nextDayThreshold, calendar, component].concat(extraArgs)),
                fgEventSegs: eventSegs.fg,
                bgEventSegs: eventSegs.bg,
                eventDrag: this.sliceEventDrag.apply(this, [props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, component].concat(extraArgs)),
                eventResize: this.sliceEventResize.apply(this, [props.eventResize, eventUiBases, dateProfile, nextDayThreshold, component].concat(extraArgs)),
                eventSelection: props.eventSelection
            }; // TODO: give interactionSegs?
        };
        Slicer.prototype.sliceNowDate = function (// does not memoize
        date, component) {
            var extraArgs = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                extraArgs[_i - 2] = arguments[_i];
            }
            return this._sliceDateSpan.apply(this, [{ range: { start: date, end: addMs(date, 1) }, allDay: false },
                {},
                component].concat(extraArgs));
        };
        Slicer.prototype._sliceBusinessHours = function (businessHours, dateProfile, nextDayThreshold, calendar, component) {
            var extraArgs = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                extraArgs[_i - 5] = arguments[_i];
            }
            if (!businessHours) {
                return [];
            }
            return this._sliceEventStore.apply(this, [expandRecurring(businessHours, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), calendar),
                {},
                dateProfile,
                nextDayThreshold,
                component].concat(extraArgs)).bg;
        };
        Slicer.prototype._sliceEventStore = function (eventStore, eventUiBases, dateProfile, nextDayThreshold, component) {
            var extraArgs = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                extraArgs[_i - 5] = arguments[_i];
            }
            if (eventStore) {
                var rangeRes = sliceEventStore(eventStore, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
                return {
                    bg: this.sliceEventRanges(rangeRes.bg, component, extraArgs),
                    fg: this.sliceEventRanges(rangeRes.fg, component, extraArgs)
                };
            }
            else {
                return { bg: [], fg: [] };
            }
        };
        Slicer.prototype._sliceInteraction = function (interaction, eventUiBases, dateProfile, nextDayThreshold, component) {
            var extraArgs = [];
            for (var _i = 5; _i < arguments.length; _i++) {
                extraArgs[_i - 5] = arguments[_i];
            }
            if (!interaction) {
                return null;
            }
            var rangeRes = sliceEventStore(interaction.mutatedEvents, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
            return {
                segs: this.sliceEventRanges(rangeRes.fg, component, extraArgs),
                affectedInstances: interaction.affectedEvents.instances,
                isEvent: interaction.isEvent,
                sourceSeg: interaction.origSeg
            };
        };
        Slicer.prototype._sliceDateSpan = function (dateSpan, eventUiBases, component) {
            var extraArgs = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                extraArgs[_i - 3] = arguments[_i];
            }
            if (!dateSpan) {
                return [];
            }
            var eventRange = fabricateEventRange(dateSpan, eventUiBases, component.context.calendar);
            var segs = this.sliceRange.apply(this, [dateSpan.range].concat(extraArgs));
            for (var _a = 0, segs_1 = segs; _a < segs_1.length; _a++) {
                var seg = segs_1[_a];
                seg.component = component;
                seg.eventRange = eventRange;
            }
            return segs;
        };
        /*
        "complete" seg means it has component and eventRange
        */
        Slicer.prototype.sliceEventRanges = function (eventRanges, component, // TODO: kill
        extraArgs) {
            var segs = [];
            for (var _i = 0, eventRanges_1 = eventRanges; _i < eventRanges_1.length; _i++) {
                var eventRange = eventRanges_1[_i];
                segs.push.apply(segs, this.sliceEventRange(eventRange, component, extraArgs));
            }
            return segs;
        };
        /*
        "complete" seg means it has component and eventRange
        */
        Slicer.prototype.sliceEventRange = function (eventRange, component, // TODO: kill
        extraArgs) {
            var segs = this.sliceRange.apply(this, [eventRange.range].concat(extraArgs));
            for (var _i = 0, segs_2 = segs; _i < segs_2.length; _i++) {
                var seg = segs_2[_i];
                seg.component = component;
                seg.eventRange = eventRange;
                seg.isStart = eventRange.isStart && seg.isStart;
                seg.isEnd = eventRange.isEnd && seg.isEnd;
            }
            return segs;
        };
        return Slicer;
    }());
    /*
    for incorporating minTime/maxTime if appropriate
    TODO: should be part of DateProfile!
    TimelineDateProfile already does this btw
    */
    function computeActiveRange(dateProfile, isComponentAllDay) {
        var range = dateProfile.activeRange;
        if (isComponentAllDay) {
            return range;
        }
        return {
            start: addMs(range.start, dateProfile.minTime.milliseconds),
            end: addMs(range.end, dateProfile.maxTime.milliseconds - 864e5) // 864e5 = ms in a day
        };
    }

    // exports
    // --------------------------------------------------------------------------------------------------
    var version = '4.4.2';

    exports.Calendar = Calendar;
    exports.Component = Component;
    exports.ComponentContext = ComponentContext;
    exports.DateComponent = DateComponent;
    exports.DateEnv = DateEnv;
    exports.DateProfileGenerator = DateProfileGenerator;
    exports.DayHeader = DayHeader;
    exports.DaySeries = DaySeries;
    exports.DayTable = DayTable;
    exports.ElementDragging = ElementDragging;
    exports.ElementScrollController = ElementScrollController;
    exports.EmitterMixin = EmitterMixin;
    exports.EventApi = EventApi;
    exports.FgEventRenderer = FgEventRenderer;
    exports.FillRenderer = FillRenderer;
    exports.Interaction = Interaction;
    exports.Mixin = Mixin;
    exports.NamedTimeZoneImpl = NamedTimeZoneImpl;
    exports.PositionCache = PositionCache;
    exports.ScrollComponent = ScrollComponent;
    exports.ScrollController = ScrollController;
    exports.Slicer = Slicer;
    exports.Splitter = Splitter;
    exports.Theme = Theme;
    exports.View = View;
    exports.WindowScrollController = WindowScrollController;
    exports.addDays = addDays;
    exports.addDurations = addDurations;
    exports.addMs = addMs;
    exports.addWeeks = addWeeks;
    exports.allowContextMenu = allowContextMenu;
    exports.allowSelection = allowSelection;
    exports.appendToElement = appendToElement;
    exports.applyAll = applyAll;
    exports.applyMutationToEventStore = applyMutationToEventStore;
    exports.applyStyle = applyStyle;
    exports.applyStyleProp = applyStyleProp;
    exports.asRoughMinutes = asRoughMinutes;
    exports.asRoughMs = asRoughMs;
    exports.asRoughSeconds = asRoughSeconds;
    exports.buildGotoAnchorHtml = buildGotoAnchorHtml;
    exports.buildSegCompareObj = buildSegCompareObj;
    exports.capitaliseFirstLetter = capitaliseFirstLetter;
    exports.combineEventUis = combineEventUis;
    exports.compareByFieldSpec = compareByFieldSpec;
    exports.compareByFieldSpecs = compareByFieldSpecs;
    exports.compareNumbers = compareNumbers;
    exports.compensateScroll = compensateScroll;
    exports.computeClippingRect = computeClippingRect;
    exports.computeEdges = computeEdges;
    exports.computeEventDraggable = computeEventDraggable;
    exports.computeEventEndResizable = computeEventEndResizable;
    exports.computeEventStartResizable = computeEventStartResizable;
    exports.computeFallbackHeaderFormat = computeFallbackHeaderFormat;
    exports.computeHeightAndMargins = computeHeightAndMargins;
    exports.computeInnerRect = computeInnerRect;
    exports.computeRect = computeRect;
    exports.computeVisibleDayRange = computeVisibleDayRange;
    exports.config = config;
    exports.constrainPoint = constrainPoint;
    exports.createDuration = createDuration;
    exports.createElement = createElement;
    exports.createEmptyEventStore = createEmptyEventStore;
    exports.createEventInstance = createEventInstance;
    exports.createFormatter = createFormatter;
    exports.createPlugin = createPlugin;
    exports.cssToStr = cssToStr;
    exports.debounce = debounce;
    exports.diffDates = diffDates;
    exports.diffDayAndTime = diffDayAndTime;
    exports.diffDays = diffDays;
    exports.diffPoints = diffPoints;
    exports.diffWeeks = diffWeeks;
    exports.diffWholeDays = diffWholeDays;
    exports.diffWholeWeeks = diffWholeWeeks;
    exports.disableCursor = disableCursor;
    exports.distributeHeight = distributeHeight;
    exports.elementClosest = elementClosest;
    exports.elementMatches = elementMatches;
    exports.enableCursor = enableCursor;
    exports.eventTupleToStore = eventTupleToStore;
    exports.filterEventStoreDefs = filterEventStoreDefs;
    exports.filterHash = filterHash;
    exports.findChildren = findChildren;
    exports.findElements = findElements;
    exports.flexibleCompare = flexibleCompare;
    exports.forceClassName = forceClassName;
    exports.formatDate = formatDate;
    exports.formatIsoTimeString = formatIsoTimeString;
    exports.formatRange = formatRange;
    exports.getAllDayHtml = getAllDayHtml;
    exports.getClippingParents = getClippingParents;
    exports.getDayClasses = getDayClasses;
    exports.getElSeg = getElSeg;
    exports.getRectCenter = getRectCenter;
    exports.getRelevantEvents = getRelevantEvents;
    exports.globalDefaults = globalDefaults;
    exports.greatestDurationDenominator = greatestDurationDenominator;
    exports.hasBgRendering = hasBgRendering;
    exports.htmlEscape = htmlEscape;
    exports.htmlToElement = htmlToElement;
    exports.insertAfterElement = insertAfterElement;
    exports.interactionSettingsStore = interactionSettingsStore;
    exports.interactionSettingsToStore = interactionSettingsToStore;
    exports.intersectRanges = intersectRanges;
    exports.intersectRects = intersectRects;
    exports.isArraysEqual = isArraysEqual;
    exports.isDateSpansEqual = isDateSpansEqual;
    exports.isInt = isInt;
    exports.isInteractionValid = isInteractionValid;
    exports.isMultiDayRange = isMultiDayRange;
    exports.isPropsEqual = isPropsEqual;
    exports.isPropsValid = isPropsValid;
    exports.isSingleDay = isSingleDay;
    exports.isValidDate = isValidDate;
    exports.listenBySelector = listenBySelector;
    exports.mapHash = mapHash;
    exports.matchCellWidths = matchCellWidths;
    exports.memoize = memoize;
    exports.memoizeOutput = memoizeOutput;
    exports.memoizeRendering = memoizeRendering;
    exports.mergeEventStores = mergeEventStores;
    exports.multiplyDuration = multiplyDuration;
    exports.padStart = padStart;
    exports.parseBusinessHours = parseBusinessHours;
    exports.parseDragMeta = parseDragMeta;
    exports.parseEventDef = parseEventDef;
    exports.parseFieldSpecs = parseFieldSpecs;
    exports.parseMarker = parse;
    exports.pointInsideRect = pointInsideRect;
    exports.prependToElement = prependToElement;
    exports.preventContextMenu = preventContextMenu;
    exports.preventDefault = preventDefault;
    exports.preventSelection = preventSelection;
    exports.processScopedUiProps = processScopedUiProps;
    exports.rangeContainsMarker = rangeContainsMarker;
    exports.rangeContainsRange = rangeContainsRange;
    exports.rangesEqual = rangesEqual;
    exports.rangesIntersect = rangesIntersect;
    exports.refineProps = refineProps;
    exports.removeElement = removeElement;
    exports.removeExact = removeExact;
    exports.renderDateCell = renderDateCell;
    exports.requestJson = requestJson;
    exports.sliceEventStore = sliceEventStore;
    exports.startOfDay = startOfDay;
    exports.subtractInnerElHeight = subtractInnerElHeight;
    exports.translateRect = translateRect;
    exports.uncompensateScroll = uncompensateScroll;
    exports.undistributeHeight = undistributeHeight;
    exports.unpromisify = unpromisify;
    exports.version = version;
    exports.whenTransitionDone = whenTransitionDone;
    exports.wholeDivideDurations = wholeDivideDurations;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

/*!
FullCalendar Day Grid Plugin v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fullcalendar/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fullcalendar/core'], factory) :
    (global = global || self, factory(global.FullCalendarDayGrid = {}, global.FullCalendar));
}(this, function (exports, core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var DayGridDateProfileGenerator = /** @class */ (function (_super) {
        __extends(DayGridDateProfileGenerator, _super);
        function DayGridDateProfileGenerator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // Computes the date range that will be rendered.
        DayGridDateProfileGenerator.prototype.buildRenderRange = function (currentRange, currentRangeUnit, isRangeAllDay) {
            var dateEnv = this.dateEnv;
            var renderRange = _super.prototype.buildRenderRange.call(this, currentRange, currentRangeUnit, isRangeAllDay);
            var start = renderRange.start;
            var end = renderRange.end;
            var endOfWeek;
            // year and month views should be aligned with weeks. this is already done for week
            if (/^(year|month)$/.test(currentRangeUnit)) {
                start = dateEnv.startOfWeek(start);
                // make end-of-week if not already
                endOfWeek = dateEnv.startOfWeek(end);
                if (endOfWeek.valueOf() !== end.valueOf()) {
                    end = core.addWeeks(endOfWeek, 1);
                }
            }
            // ensure 6 weeks
            if (this.options.monthMode &&
                this.options.fixedWeekCount) {
                var rowCnt = Math.ceil(// could be partial weeks due to hiddenDays
                core.diffWeeks(start, end));
                end = core.addWeeks(end, 6 - rowCnt);
            }
            return { start: start, end: end };
        };
        return DayGridDateProfileGenerator;
    }(core.DateProfileGenerator));

    /* A rectangular panel that is absolutely positioned over other content
    ------------------------------------------------------------------------------------------------------------------------
    Options:
      - className (string)
      - content (HTML string, element, or element array)
      - parentEl
      - top
      - left
      - right (the x coord of where the right edge should be. not a "CSS" right)
      - autoHide (boolean)
      - show (callback)
      - hide (callback)
    */
    var Popover = /** @class */ (function () {
        function Popover(options) {
            var _this = this;
            this.isHidden = true;
            this.margin = 10; // the space required between the popover and the edges of the scroll container
            // Triggered when the user clicks *anywhere* in the document, for the autoHide feature
            this.documentMousedown = function (ev) {
                // only hide the popover if the click happened outside the popover
                if (_this.el && !_this.el.contains(ev.target)) {
                    _this.hide();
                }
            };
            this.options = options;
        }
        // Shows the popover on the specified position. Renders it if not already
        Popover.prototype.show = function () {
            if (this.isHidden) {
                if (!this.el) {
                    this.render();
                }
                this.el.style.display = '';
                this.position();
                this.isHidden = false;
                this.trigger('show');
            }
        };
        // Hides the popover, through CSS, but does not remove it from the DOM
        Popover.prototype.hide = function () {
            if (!this.isHidden) {
                this.el.style.display = 'none';
                this.isHidden = true;
                this.trigger('hide');
            }
        };
        // Creates `this.el` and renders content inside of it
        Popover.prototype.render = function () {
            var _this = this;
            var options = this.options;
            var el = this.el = core.createElement('div', {
                className: 'fc-popover ' + (options.className || ''),
                style: {
                    top: '0',
                    left: '0'
                }
            });
            if (typeof options.content === 'function') {
                options.content(el);
            }
            options.parentEl.appendChild(el);
            // when a click happens on anything inside with a 'fc-close' className, hide the popover
            core.listenBySelector(el, 'click', '.fc-close', function (ev) {
                _this.hide();
            });
            if (options.autoHide) {
                document.addEventListener('mousedown', this.documentMousedown);
            }
        };
        // Hides and unregisters any handlers
        Popover.prototype.destroy = function () {
            this.hide();
            if (this.el) {
                core.removeElement(this.el);
                this.el = null;
            }
            document.removeEventListener('mousedown', this.documentMousedown);
        };
        // Positions the popover optimally, using the top/left/right options
        Popover.prototype.position = function () {
            var options = this.options;
            var el = this.el;
            var elDims = el.getBoundingClientRect(); // only used for width,height
            var origin = core.computeRect(el.offsetParent);
            var clippingRect = core.computeClippingRect(options.parentEl);
            var top; // the "position" (not "offset") values for the popover
            var left; //
            // compute top and left
            top = options.top || 0;
            if (options.left !== undefined) {
                left = options.left;
            }
            else if (options.right !== undefined) {
                left = options.right - elDims.width; // derive the left value from the right value
            }
            else {
                left = 0;
            }
            // constrain to the view port. if constrained by two edges, give precedence to top/left
            top = Math.min(top, clippingRect.bottom - elDims.height - this.margin);
            top = Math.max(top, clippingRect.top + this.margin);
            left = Math.min(left, clippingRect.right - elDims.width - this.margin);
            left = Math.max(left, clippingRect.left + this.margin);
            core.applyStyle(el, {
                top: top - origin.top,
                left: left - origin.left
            });
        };
        // Triggers a callback. Calls a function in the option hash of the same name.
        // Arguments beyond the first `name` are forwarded on.
        // TODO: better code reuse for this. Repeat code
        // can kill this???
        Popover.prototype.trigger = function (name) {
            if (this.options[name]) {
                this.options[name].apply(this, Array.prototype.slice.call(arguments, 1));
            }
        };
        return Popover;
    }());

    /* Event-rendering methods for the DayGrid class
    ----------------------------------------------------------------------------------------------------------------------*/
    // "Simple" is bad a name. has nothing to do with SimpleDayGrid
    var SimpleDayGridEventRenderer = /** @class */ (function (_super) {
        __extends(SimpleDayGridEventRenderer, _super);
        function SimpleDayGridEventRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // Builds the HTML to be used for the default element for an individual segment
        SimpleDayGridEventRenderer.prototype.renderSegHtml = function (seg, mirrorInfo) {
            var context = this.context;
            var eventRange = seg.eventRange;
            var eventDef = eventRange.def;
            var eventUi = eventRange.ui;
            var allDay = eventDef.allDay;
            var isDraggable = core.computeEventDraggable(context, eventDef, eventUi);
            var isResizableFromStart = allDay && seg.isStart && core.computeEventStartResizable(context, eventDef, eventUi);
            var isResizableFromEnd = allDay && seg.isEnd && core.computeEventEndResizable(context, eventDef, eventUi);
            var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd, mirrorInfo);
            var skinCss = core.cssToStr(this.getSkinCss(eventUi));
            var timeHtml = '';
            var timeText;
            var titleHtml;
            classes.unshift('fc-day-grid-event', 'fc-h-event');
            // Only display a timed events time if it is the starting segment
            if (seg.isStart) {
                timeText = this.getTimeText(eventRange);
                if (timeText) {
                    timeHtml = '<span class="fc-time">' + core.htmlEscape(timeText) + '</span>';
                }
            }
            titleHtml =
                '<span class="fc-title">' +
                    (core.htmlEscape(eventDef.title || '') || '&nbsp;') + // we always want one line of height
                    '</span>';
            return '<a class="' + classes.join(' ') + '"' +
                (eventDef.url ?
                    ' href="' + core.htmlEscape(eventDef.url) + '"' :
                    '') +
                (skinCss ?
                    ' style="' + skinCss + '"' :
                    '') +
                '>' +
                '<div class="fc-content">' +
                (context.options.dir === 'rtl' ?
                    titleHtml + ' ' + timeHtml : // put a natural space in between
                    timeHtml + ' ' + titleHtml //
                ) +
                '</div>' +
                (isResizableFromStart ?
                    '<div class="fc-resizer fc-start-resizer"></div>' :
                    '') +
                (isResizableFromEnd ?
                    '<div class="fc-resizer fc-end-resizer"></div>' :
                    '') +
                '</a>';
        };
        // Computes a default event time formatting string if `eventTimeFormat` is not explicitly defined
        SimpleDayGridEventRenderer.prototype.computeEventTimeFormat = function () {
            return {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: 'narrow'
            };
        };
        SimpleDayGridEventRenderer.prototype.computeDisplayEventEnd = function () {
            return false; // TODO: somehow consider the originating DayGrid's column count
        };
        return SimpleDayGridEventRenderer;
    }(core.FgEventRenderer));

    /* Event-rendering methods for the DayGrid class
    ----------------------------------------------------------------------------------------------------------------------*/
    var DayGridEventRenderer = /** @class */ (function (_super) {
        __extends(DayGridEventRenderer, _super);
        function DayGridEventRenderer(dayGrid) {
            var _this = _super.call(this) || this;
            _this.dayGrid = dayGrid;
            return _this;
        }
        // Renders the given foreground event segments onto the grid
        DayGridEventRenderer.prototype.attachSegs = function (segs, mirrorInfo) {
            var rowStructs = this.rowStructs = this.renderSegRows(segs);
            // append to each row's content skeleton
            this.dayGrid.rowEls.forEach(function (rowNode, i) {
                rowNode.querySelector('.fc-content-skeleton > table').appendChild(rowStructs[i].tbodyEl);
            });
            // removes the "more.." events popover
            if (!mirrorInfo) {
                this.dayGrid.removeSegPopover();
            }
        };
        // Unrenders all currently rendered foreground event segments
        DayGridEventRenderer.prototype.detachSegs = function () {
            var rowStructs = this.rowStructs || [];
            var rowStruct;
            while ((rowStruct = rowStructs.pop())) {
                core.removeElement(rowStruct.tbodyEl);
            }
            this.rowStructs = null;
        };
        // Uses the given events array to generate <tbody> elements that should be appended to each row's content skeleton.
        // Returns an array of rowStruct objects (see the bottom of `renderSegRow`).
        // PRECONDITION: each segment shoud already have a rendered and assigned `.el`
        DayGridEventRenderer.prototype.renderSegRows = function (segs) {
            var rowStructs = [];
            var segRows;
            var row;
            segRows = this.groupSegRows(segs); // group into nested arrays
            // iterate each row of segment groupings
            for (row = 0; row < segRows.length; row++) {
                rowStructs.push(this.renderSegRow(row, segRows[row]));
            }
            return rowStructs;
        };
        // Given a row # and an array of segments all in the same row, render a <tbody> element, a skeleton that contains
        // the segments. Returns object with a bunch of internal data about how the render was calculated.
        // NOTE: modifies rowSegs
        DayGridEventRenderer.prototype.renderSegRow = function (row, rowSegs) {
            var isRtl = this.context.isRtl;
            var dayGrid = this.dayGrid;
            var colCnt = dayGrid.colCnt;
            var segLevels = this.buildSegLevels(rowSegs); // group into sub-arrays of levels
            var levelCnt = Math.max(1, segLevels.length); // ensure at least one level
            var tbody = document.createElement('tbody');
            var segMatrix = []; // lookup for which segments are rendered into which level+col cells
            var cellMatrix = []; // lookup for all <td> elements of the level+col matrix
            var loneCellMatrix = []; // lookup for <td> elements that only take up a single column
            var i;
            var levelSegs;
            var col;
            var tr;
            var j;
            var seg;
            var td;
            // populates empty cells from the current column (`col`) to `endCol`
            function emptyCellsUntil(endCol) {
                while (col < endCol) {
                    // try to grab a cell from the level above and extend its rowspan. otherwise, create a fresh cell
                    td = (loneCellMatrix[i - 1] || [])[col];
                    if (td) {
                        td.rowSpan = (td.rowSpan || 1) + 1;
                    }
                    else {
                        td = document.createElement('td');
                        tr.appendChild(td);
                    }
                    cellMatrix[i][col] = td;
                    loneCellMatrix[i][col] = td;
                    col++;
                }
            }
            for (i = 0; i < levelCnt; i++) { // iterate through all levels
                levelSegs = segLevels[i];
                col = 0;
                tr = document.createElement('tr');
                segMatrix.push([]);
                cellMatrix.push([]);
                loneCellMatrix.push([]);
                // levelCnt might be 1 even though there are no actual levels. protect against this.
                // this single empty row is useful for styling.
                if (levelSegs) {
                    for (j = 0; j < levelSegs.length; j++) { // iterate through segments in level
                        seg = levelSegs[j];
                        var leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol;
                        var rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol;
                        emptyCellsUntil(leftCol);
                        // create a container that occupies or more columns. append the event element.
                        td = core.createElement('td', { className: 'fc-event-container' }, seg.el);
                        if (leftCol !== rightCol) {
                            td.colSpan = rightCol - leftCol + 1;
                        }
                        else { // a single-column segment
                            loneCellMatrix[i][col] = td;
                        }
                        while (col <= rightCol) {
                            cellMatrix[i][col] = td;
                            segMatrix[i][col] = seg;
                            col++;
                        }
                        tr.appendChild(td);
                    }
                }
                emptyCellsUntil(colCnt); // finish off the row
                var introHtml = dayGrid.renderProps.renderIntroHtml();
                if (introHtml) {
                    if (isRtl) {
                        core.appendToElement(tr, introHtml);
                    }
                    else {
                        core.prependToElement(tr, introHtml);
                    }
                }
                tbody.appendChild(tr);
            }
            return {
                row: row,
                tbodyEl: tbody,
                cellMatrix: cellMatrix,
                segMatrix: segMatrix,
                segLevels: segLevels,
                segs: rowSegs
            };
        };
        // Stacks a flat array of segments, which are all assumed to be in the same row, into subarrays of vertical levels.
        // NOTE: modifies segs
        DayGridEventRenderer.prototype.buildSegLevels = function (segs) {
            var isRtl = this.context.isRtl;
            var colCnt = this.dayGrid.colCnt;
            var levels = [];
            var i;
            var seg;
            var j;
            // Give preference to elements with certain criteria, so they have
            // a chance to be closer to the top.
            segs = this.sortEventSegs(segs);
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                // loop through levels, starting with the topmost, until the segment doesn't collide with other segments
                for (j = 0; j < levels.length; j++) {
                    if (!isDaySegCollision(seg, levels[j])) {
                        break;
                    }
                }
                // `j` now holds the desired subrow index
                seg.level = j;
                seg.leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol; // for sorting only
                seg.rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol // for sorting only
                ;
                (levels[j] || (levels[j] = [])).push(seg);
            }
            // order segments left-to-right. very important if calendar is RTL
            for (j = 0; j < levels.length; j++) {
                levels[j].sort(compareDaySegCols);
            }
            return levels;
        };
        // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's row
        DayGridEventRenderer.prototype.groupSegRows = function (segs) {
            var segRows = [];
            var i;
            for (i = 0; i < this.dayGrid.rowCnt; i++) {
                segRows.push([]);
            }
            for (i = 0; i < segs.length; i++) {
                segRows[segs[i].row].push(segs[i]);
            }
            return segRows;
        };
        // Computes a default `displayEventEnd` value if one is not expliclty defined
        DayGridEventRenderer.prototype.computeDisplayEventEnd = function () {
            return this.dayGrid.colCnt === 1; // we'll likely have space if there's only one day
        };
        return DayGridEventRenderer;
    }(SimpleDayGridEventRenderer));
    // Computes whether two segments' columns collide. They are assumed to be in the same row.
    function isDaySegCollision(seg, otherSegs) {
        var i;
        var otherSeg;
        for (i = 0; i < otherSegs.length; i++) {
            otherSeg = otherSegs[i];
            if (otherSeg.firstCol <= seg.lastCol &&
                otherSeg.lastCol >= seg.firstCol) {
                return true;
            }
        }
        return false;
    }
    // A cmp function for determining the leftmost event
    function compareDaySegCols(a, b) {
        return a.leftCol - b.leftCol;
    }

    var DayGridMirrorRenderer = /** @class */ (function (_super) {
        __extends(DayGridMirrorRenderer, _super);
        function DayGridMirrorRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DayGridMirrorRenderer.prototype.attachSegs = function (segs, mirrorInfo) {
            var sourceSeg = mirrorInfo.sourceSeg;
            var rowStructs = this.rowStructs = this.renderSegRows(segs);
            // inject each new event skeleton into each associated row
            this.dayGrid.rowEls.forEach(function (rowNode, row) {
                var skeletonEl = core.htmlToElement('<div class="fc-mirror-skeleton"><table></table></div>'); // will be absolutely positioned
                var skeletonTopEl;
                var skeletonTop;
                // If there is an original segment, match the top position. Otherwise, put it at the row's top level
                if (sourceSeg && sourceSeg.row === row) {
                    skeletonTopEl = sourceSeg.el;
                }
                else {
                    skeletonTopEl = rowNode.querySelector('.fc-content-skeleton tbody');
                    if (!skeletonTopEl) { // when no events
                        skeletonTopEl = rowNode.querySelector('.fc-content-skeleton table');
                    }
                }
                skeletonTop = skeletonTopEl.getBoundingClientRect().top -
                    rowNode.getBoundingClientRect().top; // the offsetParent origin
                skeletonEl.style.top = skeletonTop + 'px';
                skeletonEl.querySelector('table').appendChild(rowStructs[row].tbodyEl);
                rowNode.appendChild(skeletonEl);
            });
        };
        return DayGridMirrorRenderer;
    }(DayGridEventRenderer));

    var EMPTY_CELL_HTML = '<td style="pointer-events:none"></td>';
    var DayGridFillRenderer = /** @class */ (function (_super) {
        __extends(DayGridFillRenderer, _super);
        function DayGridFillRenderer(dayGrid) {
            var _this = _super.call(this) || this;
            _this.fillSegTag = 'td'; // override the default tag name
            _this.dayGrid = dayGrid;
            return _this;
        }
        DayGridFillRenderer.prototype.renderSegs = function (type, context, segs) {
            // don't render timed background events
            if (type === 'bgEvent') {
                segs = segs.filter(function (seg) {
                    return seg.eventRange.def.allDay;
                });
            }
            _super.prototype.renderSegs.call(this, type, context, segs);
        };
        DayGridFillRenderer.prototype.attachSegs = function (type, segs) {
            var els = [];
            var i;
            var seg;
            var skeletonEl;
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                skeletonEl = this.renderFillRow(type, seg);
                this.dayGrid.rowEls[seg.row].appendChild(skeletonEl);
                els.push(skeletonEl);
            }
            return els;
        };
        // Generates the HTML needed for one row of a fill. Requires the seg's el to be rendered.
        DayGridFillRenderer.prototype.renderFillRow = function (type, seg) {
            var dayGrid = this.dayGrid;
            var isRtl = this.context.isRtl;
            var colCnt = dayGrid.colCnt;
            var leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol;
            var rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol;
            var startCol = leftCol;
            var endCol = rightCol + 1;
            var className;
            var skeletonEl;
            var trEl;
            if (type === 'businessHours') {
                className = 'bgevent';
            }
            else {
                className = type.toLowerCase();
            }
            skeletonEl = core.htmlToElement('<div class="fc-' + className + '-skeleton">' +
                '<table><tr></tr></table>' +
                '</div>');
            trEl = skeletonEl.getElementsByTagName('tr')[0];
            if (startCol > 0) {
                core.appendToElement(trEl, 
                // will create (startCol + 1) td's
                new Array(startCol + 1).join(EMPTY_CELL_HTML));
            }
            seg.el.colSpan = endCol - startCol;
            trEl.appendChild(seg.el);
            if (endCol < colCnt) {
                core.appendToElement(trEl, 
                // will create (colCnt - endCol) td's
                new Array(colCnt - endCol + 1).join(EMPTY_CELL_HTML));
            }
            var introHtml = dayGrid.renderProps.renderIntroHtml();
            if (introHtml) {
                if (isRtl) {
                    core.appendToElement(trEl, introHtml);
                }
                else {
                    core.prependToElement(trEl, introHtml);
                }
            }
            return skeletonEl;
        };
        return DayGridFillRenderer;
    }(core.FillRenderer));

    var DayTile = /** @class */ (function (_super) {
        __extends(DayTile, _super);
        function DayTile(el) {
            var _this = _super.call(this, el) || this;
            var eventRenderer = _this.eventRenderer = new DayTileEventRenderer(_this);
            var renderFrame = _this.renderFrame = core.memoizeRendering(_this._renderFrame);
            _this.renderFgEvents = core.memoizeRendering(eventRenderer.renderSegs.bind(eventRenderer), eventRenderer.unrender.bind(eventRenderer), [renderFrame]);
            _this.renderEventSelection = core.memoizeRendering(eventRenderer.selectByInstanceId.bind(eventRenderer), eventRenderer.unselectByInstanceId.bind(eventRenderer), [_this.renderFgEvents]);
            _this.renderEventDrag = core.memoizeRendering(eventRenderer.hideByHash.bind(eventRenderer), eventRenderer.showByHash.bind(eventRenderer), [renderFrame]);
            _this.renderEventResize = core.memoizeRendering(eventRenderer.hideByHash.bind(eventRenderer), eventRenderer.showByHash.bind(eventRenderer), [renderFrame]);
            return _this;
        }
        DayTile.prototype.firstContext = function (context) {
            context.calendar.registerInteractiveComponent(this, {
                el: this.el,
                useEventCenter: false
            });
        };
        DayTile.prototype.render = function (props, context) {
            this.renderFrame(props.date);
            this.renderFgEvents(context, props.fgSegs);
            this.renderEventSelection(props.eventSelection);
            this.renderEventDrag(props.eventDragInstances);
            this.renderEventResize(props.eventResizeInstances);
        };
        DayTile.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderFrame.unrender(); // should unrender everything else
            this.context.calendar.unregisterInteractiveComponent(this);
        };
        DayTile.prototype._renderFrame = function (date) {
            var _a = this.context, theme = _a.theme, dateEnv = _a.dateEnv, options = _a.options;
            var title = dateEnv.format(date, core.createFormatter(options.dayPopoverFormat) // TODO: cache
            );
            this.el.innerHTML =
                '<div class="fc-header ' + theme.getClass('popoverHeader') + '">' +
                    '<span class="fc-title">' +
                    core.htmlEscape(title) +
                    '</span>' +
                    '<span class="fc-close ' + theme.getIconClass('close') + '"></span>' +
                    '</div>' +
                    '<div class="fc-body ' + theme.getClass('popoverContent') + '">' +
                    '<div class="fc-event-container"></div>' +
                    '</div>';
            this.segContainerEl = this.el.querySelector('.fc-event-container');
        };
        DayTile.prototype.queryHit = function (positionLeft, positionTop, elWidth, elHeight) {
            var date = this.props.date; // HACK
            if (positionLeft < elWidth && positionTop < elHeight) {
                return {
                    component: this,
                    dateSpan: {
                        allDay: true,
                        range: { start: date, end: core.addDays(date, 1) }
                    },
                    dayEl: this.el,
                    rect: {
                        left: 0,
                        top: 0,
                        right: elWidth,
                        bottom: elHeight
                    },
                    layer: 1
                };
            }
        };
        return DayTile;
    }(core.DateComponent));
    var DayTileEventRenderer = /** @class */ (function (_super) {
        __extends(DayTileEventRenderer, _super);
        function DayTileEventRenderer(dayTile) {
            var _this = _super.call(this) || this;
            _this.dayTile = dayTile;
            return _this;
        }
        DayTileEventRenderer.prototype.attachSegs = function (segs) {
            for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
                var seg = segs_1[_i];
                this.dayTile.segContainerEl.appendChild(seg.el);
            }
        };
        DayTileEventRenderer.prototype.detachSegs = function (segs) {
            for (var _i = 0, segs_2 = segs; _i < segs_2.length; _i++) {
                var seg = segs_2[_i];
                core.removeElement(seg.el);
            }
        };
        return DayTileEventRenderer;
    }(SimpleDayGridEventRenderer));

    var DayBgRow = /** @class */ (function () {
        function DayBgRow(context) {
            this.context = context;
        }
        DayBgRow.prototype.renderHtml = function (props) {
            var parts = [];
            if (props.renderIntroHtml) {
                parts.push(props.renderIntroHtml());
            }
            for (var _i = 0, _a = props.cells; _i < _a.length; _i++) {
                var cell = _a[_i];
                parts.push(renderCellHtml(cell.date, props.dateProfile, this.context, cell.htmlAttrs));
            }
            if (!props.cells.length) {
                parts.push('<td class="fc-day ' + this.context.theme.getClass('widgetContent') + '"></td>');
            }
            if (this.context.options.dir === 'rtl') {
                parts.reverse();
            }
            return '<tr>' + parts.join('') + '</tr>';
        };
        return DayBgRow;
    }());
    function renderCellHtml(date, dateProfile, context, otherAttrs) {
        var dateEnv = context.dateEnv, theme = context.theme;
        var isDateValid = core.rangeContainsMarker(dateProfile.activeRange, date); // TODO: called too frequently. cache somehow.
        var classes = core.getDayClasses(date, dateProfile, context);
        classes.unshift('fc-day', theme.getClass('widgetContent'));
        return '<td class="' + classes.join(' ') + '"' +
            (isDateValid ?
                ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
                '') +
            (otherAttrs ?
                ' ' + otherAttrs :
                '') +
            '></td>';
    }

    var DAY_NUM_FORMAT = core.createFormatter({ day: 'numeric' });
    var WEEK_NUM_FORMAT = core.createFormatter({ week: 'numeric' });
    var DayGrid = /** @class */ (function (_super) {
        __extends(DayGrid, _super);
        function DayGrid(el, renderProps) {
            var _this = _super.call(this, el) || this;
            _this.bottomCoordPadding = 0; // hack for extending the hit area for the last row of the coordinate grid
            _this.isCellSizesDirty = false;
            _this.renderProps = renderProps;
            var eventRenderer = _this.eventRenderer = new DayGridEventRenderer(_this);
            var fillRenderer = _this.fillRenderer = new DayGridFillRenderer(_this);
            _this.mirrorRenderer = new DayGridMirrorRenderer(_this);
            var renderCells = _this.renderCells = core.memoizeRendering(_this._renderCells, _this._unrenderCells);
            _this.renderBusinessHours = core.memoizeRendering(fillRenderer.renderSegs.bind(fillRenderer, 'businessHours'), fillRenderer.unrender.bind(fillRenderer, 'businessHours'), [renderCells]);
            _this.renderDateSelection = core.memoizeRendering(fillRenderer.renderSegs.bind(fillRenderer, 'highlight'), fillRenderer.unrender.bind(fillRenderer, 'highlight'), [renderCells]);
            _this.renderBgEvents = core.memoizeRendering(fillRenderer.renderSegs.bind(fillRenderer, 'bgEvent'), fillRenderer.unrender.bind(fillRenderer, 'bgEvent'), [renderCells]);
            _this.renderFgEvents = core.memoizeRendering(eventRenderer.renderSegs.bind(eventRenderer), eventRenderer.unrender.bind(eventRenderer), [renderCells]);
            _this.renderEventSelection = core.memoizeRendering(eventRenderer.selectByInstanceId.bind(eventRenderer), eventRenderer.unselectByInstanceId.bind(eventRenderer), [_this.renderFgEvents]);
            _this.renderEventDrag = core.memoizeRendering(_this._renderEventDrag, _this._unrenderEventDrag, [renderCells]);
            _this.renderEventResize = core.memoizeRendering(_this._renderEventResize, _this._unrenderEventResize, [renderCells]);
            return _this;
        }
        DayGrid.prototype.render = function (props, context) {
            var cells = props.cells;
            this.rowCnt = cells.length;
            this.colCnt = cells[0].length;
            this.renderCells(cells, props.isRigid);
            this.renderBusinessHours(context, props.businessHourSegs);
            this.renderDateSelection(context, props.dateSelectionSegs);
            this.renderBgEvents(context, props.bgEventSegs);
            this.renderFgEvents(context, props.fgEventSegs);
            this.renderEventSelection(props.eventSelection);
            this.renderEventDrag(props.eventDrag);
            this.renderEventResize(props.eventResize);
            if (this.segPopoverTile) {
                this.updateSegPopoverTile();
            }
        };
        DayGrid.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderCells.unrender(); // will unrender everything else
        };
        DayGrid.prototype.getCellRange = function (row, col) {
            var start = this.props.cells[row][col].date;
            var end = core.addDays(start, 1);
            return { start: start, end: end };
        };
        DayGrid.prototype.updateSegPopoverTile = function (date, segs) {
            var ownProps = this.props;
            this.segPopoverTile.receiveProps({
                date: date || this.segPopoverTile.props.date,
                fgSegs: segs || this.segPopoverTile.props.fgSegs,
                eventSelection: ownProps.eventSelection,
                eventDragInstances: ownProps.eventDrag ? ownProps.eventDrag.affectedInstances : null,
                eventResizeInstances: ownProps.eventResize ? ownProps.eventResize.affectedInstances : null
            }, this.context);
        };
        /* Date Rendering
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype._renderCells = function (cells, isRigid) {
            var _a = this.context, calendar = _a.calendar, view = _a.view, isRtl = _a.isRtl, dateEnv = _a.dateEnv;
            var _b = this, rowCnt = _b.rowCnt, colCnt = _b.colCnt;
            var html = '';
            var row;
            var col;
            for (row = 0; row < rowCnt; row++) {
                html += this.renderDayRowHtml(row, isRigid);
            }
            this.el.innerHTML = html;
            this.rowEls = core.findElements(this.el, '.fc-row');
            this.cellEls = core.findElements(this.el, '.fc-day, .fc-disabled-day');
            if (isRtl) {
                this.cellEls.reverse();
            }
            this.rowPositions = new core.PositionCache(this.el, this.rowEls, false, true // vertical
            );
            this.colPositions = new core.PositionCache(this.el, this.cellEls.slice(0, colCnt), // only the first row
            true, false // horizontal
            );
            // trigger dayRender with each cell's element
            for (row = 0; row < rowCnt; row++) {
                for (col = 0; col < colCnt; col++) {
                    calendar.publiclyTrigger('dayRender', [
                        {
                            date: dateEnv.toDate(cells[row][col].date),
                            el: this.getCellEl(row, col),
                            view: view
                        }
                    ]);
                }
            }
            this.isCellSizesDirty = true;
        };
        DayGrid.prototype._unrenderCells = function () {
            this.removeSegPopover();
        };
        // Generates the HTML for a single row, which is a div that wraps a table.
        // `row` is the row number.
        DayGrid.prototype.renderDayRowHtml = function (row, isRigid) {
            var theme = this.context.theme;
            var classes = ['fc-row', 'fc-week', theme.getClass('dayRow')];
            if (isRigid) {
                classes.push('fc-rigid');
            }
            var bgRow = new DayBgRow(this.context);
            return '' +
                '<div class="' + classes.join(' ') + '">' +
                '<div class="fc-bg">' +
                '<table class="' + theme.getClass('tableGrid') + '">' +
                bgRow.renderHtml({
                    cells: this.props.cells[row],
                    dateProfile: this.props.dateProfile,
                    renderIntroHtml: this.renderProps.renderBgIntroHtml
                }) +
                '</table>' +
                '</div>' +
                '<div class="fc-content-skeleton">' +
                '<table>' +
                (this.getIsNumbersVisible() ?
                    '<thead>' +
                        this.renderNumberTrHtml(row) +
                        '</thead>' :
                    '') +
                '</table>' +
                '</div>' +
                '</div>';
        };
        DayGrid.prototype.getIsNumbersVisible = function () {
            return this.getIsDayNumbersVisible() ||
                this.renderProps.cellWeekNumbersVisible ||
                this.renderProps.colWeekNumbersVisible;
        };
        DayGrid.prototype.getIsDayNumbersVisible = function () {
            return this.rowCnt > 1;
        };
        /* Grid Number Rendering
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype.renderNumberTrHtml = function (row) {
            var isRtl = this.context.isRtl;
            var intro = this.renderProps.renderNumberIntroHtml(row, this);
            return '' +
                '<tr>' +
                (isRtl ? '' : intro) +
                this.renderNumberCellsHtml(row) +
                (isRtl ? intro : '') +
                '</tr>';
        };
        DayGrid.prototype.renderNumberCellsHtml = function (row) {
            var htmls = [];
            var col;
            var date;
            for (col = 0; col < this.colCnt; col++) {
                date = this.props.cells[row][col].date;
                htmls.push(this.renderNumberCellHtml(date));
            }
            if (this.context.isRtl) {
                htmls.reverse();
            }
            return htmls.join('');
        };
        // Generates the HTML for the <td>s of the "number" row in the DayGrid's content skeleton.
        // The number row will only exist if either day numbers or week numbers are turned on.
        DayGrid.prototype.renderNumberCellHtml = function (date) {
            var _a = this.context, dateEnv = _a.dateEnv, options = _a.options;
            var html = '';
            var isDateValid = core.rangeContainsMarker(this.props.dateProfile.activeRange, date); // TODO: called too frequently. cache somehow.
            var isDayNumberVisible = this.getIsDayNumbersVisible() && isDateValid;
            var classes;
            var weekCalcFirstDow;
            if (!isDayNumberVisible && !this.renderProps.cellWeekNumbersVisible) {
                // no numbers in day cell (week number must be along the side)
                return '<td></td>'; //  will create an empty space above events :(
            }
            classes = core.getDayClasses(date, this.props.dateProfile, this.context);
            classes.unshift('fc-day-top');
            if (this.renderProps.cellWeekNumbersVisible) {
                weekCalcFirstDow = dateEnv.weekDow;
            }
            html += '<td class="' + classes.join(' ') + '"' +
                (isDateValid ?
                    ' data-date="' + dateEnv.formatIso(date, { omitTime: true }) + '"' :
                    '') +
                '>';
            if (this.renderProps.cellWeekNumbersVisible && (date.getUTCDay() === weekCalcFirstDow)) {
                html += core.buildGotoAnchorHtml(options, dateEnv, { date: date, type: 'week' }, { 'class': 'fc-week-number' }, dateEnv.format(date, WEEK_NUM_FORMAT) // inner HTML
                );
            }
            if (isDayNumberVisible) {
                html += core.buildGotoAnchorHtml(options, dateEnv, date, { 'class': 'fc-day-number' }, dateEnv.format(date, DAY_NUM_FORMAT) // inner HTML
                );
            }
            html += '</td>';
            return html;
        };
        /* Sizing
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype.updateSize = function (isResize) {
            var calendar = this.context.calendar;
            var _a = this, fillRenderer = _a.fillRenderer, eventRenderer = _a.eventRenderer, mirrorRenderer = _a.mirrorRenderer;
            if (isResize ||
                this.isCellSizesDirty ||
                calendar.isEventsUpdated // hack
            ) {
                this.buildPositionCaches();
                this.isCellSizesDirty = false;
            }
            fillRenderer.computeSizes(isResize);
            eventRenderer.computeSizes(isResize);
            mirrorRenderer.computeSizes(isResize);
            fillRenderer.assignSizes(isResize);
            eventRenderer.assignSizes(isResize);
            mirrorRenderer.assignSizes(isResize);
        };
        DayGrid.prototype.buildPositionCaches = function () {
            this.buildColPositions();
            this.buildRowPositions();
        };
        DayGrid.prototype.buildColPositions = function () {
            this.colPositions.build();
        };
        DayGrid.prototype.buildRowPositions = function () {
            this.rowPositions.build();
            this.rowPositions.bottoms[this.rowCnt - 1] += this.bottomCoordPadding; // hack
        };
        /* Hit System
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype.positionToHit = function (leftPosition, topPosition) {
            var _a = this, colPositions = _a.colPositions, rowPositions = _a.rowPositions;
            var col = colPositions.leftToIndex(leftPosition);
            var row = rowPositions.topToIndex(topPosition);
            if (row != null && col != null) {
                return {
                    row: row,
                    col: col,
                    dateSpan: {
                        range: this.getCellRange(row, col),
                        allDay: true
                    },
                    dayEl: this.getCellEl(row, col),
                    relativeRect: {
                        left: colPositions.lefts[col],
                        right: colPositions.rights[col],
                        top: rowPositions.tops[row],
                        bottom: rowPositions.bottoms[row]
                    }
                };
            }
        };
        /* Cell System
        ------------------------------------------------------------------------------------------------------------------*/
        // FYI: the first column is the leftmost column, regardless of date
        DayGrid.prototype.getCellEl = function (row, col) {
            return this.cellEls[row * this.colCnt + col];
        };
        /* Event Drag Visualization
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype._renderEventDrag = function (state) {
            if (state) {
                this.eventRenderer.hideByHash(state.affectedInstances);
                this.fillRenderer.renderSegs('highlight', this.context, state.segs);
            }
        };
        DayGrid.prototype._unrenderEventDrag = function (state) {
            if (state) {
                this.eventRenderer.showByHash(state.affectedInstances);
                this.fillRenderer.unrender('highlight', this.context);
            }
        };
        /* Event Resize Visualization
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype._renderEventResize = function (state) {
            if (state) {
                this.eventRenderer.hideByHash(state.affectedInstances);
                this.fillRenderer.renderSegs('highlight', this.context, state.segs);
                this.mirrorRenderer.renderSegs(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg });
            }
        };
        DayGrid.prototype._unrenderEventResize = function (state) {
            if (state) {
                this.eventRenderer.showByHash(state.affectedInstances);
                this.fillRenderer.unrender('highlight', this.context);
                this.mirrorRenderer.unrender(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg });
            }
        };
        /* More+ Link Popover
        ------------------------------------------------------------------------------------------------------------------*/
        DayGrid.prototype.removeSegPopover = function () {
            if (this.segPopover) {
                this.segPopover.hide(); // in handler, will call segPopover's removeElement
            }
        };
        // Limits the number of "levels" (vertically stacking layers of events) for each row of the grid.
        // `levelLimit` can be false (don't limit), a number, or true (should be computed).
        DayGrid.prototype.limitRows = function (levelLimit) {
            var rowStructs = this.eventRenderer.rowStructs || [];
            var row; // row #
            var rowLevelLimit;
            for (row = 0; row < rowStructs.length; row++) {
                this.unlimitRow(row);
                if (!levelLimit) {
                    rowLevelLimit = false;
                }
                else if (typeof levelLimit === 'number') {
                    rowLevelLimit = levelLimit;
                }
                else {
                    rowLevelLimit = this.computeRowLevelLimit(row);
                }
                if (rowLevelLimit !== false) {
                    this.limitRow(row, rowLevelLimit);
                }
            }
        };
        // Computes the number of levels a row will accomodate without going outside its bounds.
        // Assumes the row is "rigid" (maintains a constant height regardless of what is inside).
        // `row` is the row number.
        DayGrid.prototype.computeRowLevelLimit = function (row) {
            var rowEl = this.rowEls[row]; // the containing "fake" row div
            var rowBottom = rowEl.getBoundingClientRect().bottom; // relative to viewport!
            var trEls = core.findChildren(this.eventRenderer.rowStructs[row].tbodyEl);
            var i;
            var trEl;
            // Reveal one level <tr> at a time and stop when we find one out of bounds
            for (i = 0; i < trEls.length; i++) {
                trEl = trEls[i];
                trEl.classList.remove('fc-limited'); // reset to original state (reveal)
                if (trEl.getBoundingClientRect().bottom > rowBottom) {
                    return i;
                }
            }
            return false; // should not limit at all
        };
        // Limits the given grid row to the maximum number of levels and injects "more" links if necessary.
        // `row` is the row number.
        // `levelLimit` is a number for the maximum (inclusive) number of levels allowed.
        DayGrid.prototype.limitRow = function (row, levelLimit) {
            var _this = this;
            var colCnt = this.colCnt;
            var isRtl = this.context.isRtl;
            var rowStruct = this.eventRenderer.rowStructs[row];
            var moreNodes = []; // array of "more" <a> links and <td> DOM nodes
            var col = 0; // col #, left-to-right (not chronologically)
            var levelSegs; // array of segment objects in the last allowable level, ordered left-to-right
            var cellMatrix; // a matrix (by level, then column) of all <td> elements in the row
            var limitedNodes; // array of temporarily hidden level <tr> and segment <td> DOM nodes
            var i;
            var seg;
            var segsBelow; // array of segment objects below `seg` in the current `col`
            var totalSegsBelow; // total number of segments below `seg` in any of the columns `seg` occupies
            var colSegsBelow; // array of segment arrays, below seg, one for each column (offset from segs's first column)
            var td;
            var rowSpan;
            var segMoreNodes; // array of "more" <td> cells that will stand-in for the current seg's cell
            var j;
            var moreTd;
            var moreWrap;
            var moreLink;
            // Iterates through empty level cells and places "more" links inside if need be
            var emptyCellsUntil = function (endCol) {
                while (col < endCol) {
                    segsBelow = _this.getCellSegs(row, col, levelLimit);
                    if (segsBelow.length) {
                        td = cellMatrix[levelLimit - 1][col];
                        moreLink = _this.renderMoreLink(row, col, segsBelow);
                        moreWrap = core.createElement('div', null, moreLink);
                        td.appendChild(moreWrap);
                        moreNodes.push(moreWrap);
                    }
                    col++;
                }
            };
            if (levelLimit && levelLimit < rowStruct.segLevels.length) { // is it actually over the limit?
                levelSegs = rowStruct.segLevels[levelLimit - 1];
                cellMatrix = rowStruct.cellMatrix;
                limitedNodes = core.findChildren(rowStruct.tbodyEl).slice(levelLimit); // get level <tr> elements past the limit
                limitedNodes.forEach(function (node) {
                    node.classList.add('fc-limited'); // hide elements and get a simple DOM-nodes array
                });
                // iterate though segments in the last allowable level
                for (i = 0; i < levelSegs.length; i++) {
                    seg = levelSegs[i];
                    var leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol;
                    var rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol;
                    emptyCellsUntil(leftCol); // process empty cells before the segment
                    // determine *all* segments below `seg` that occupy the same columns
                    colSegsBelow = [];
                    totalSegsBelow = 0;
                    while (col <= rightCol) {
                        segsBelow = this.getCellSegs(row, col, levelLimit);
                        colSegsBelow.push(segsBelow);
                        totalSegsBelow += segsBelow.length;
                        col++;
                    }
                    if (totalSegsBelow) { // do we need to replace this segment with one or many "more" links?
                        td = cellMatrix[levelLimit - 1][leftCol]; // the segment's parent cell
                        rowSpan = td.rowSpan || 1;
                        segMoreNodes = [];
                        // make a replacement <td> for each column the segment occupies. will be one for each colspan
                        for (j = 0; j < colSegsBelow.length; j++) {
                            moreTd = core.createElement('td', { className: 'fc-more-cell', rowSpan: rowSpan });
                            segsBelow = colSegsBelow[j];
                            moreLink = this.renderMoreLink(row, leftCol + j, [seg].concat(segsBelow) // count seg as hidden too
                            );
                            moreWrap = core.createElement('div', null, moreLink);
                            moreTd.appendChild(moreWrap);
                            segMoreNodes.push(moreTd);
                            moreNodes.push(moreTd);
                        }
                        td.classList.add('fc-limited');
                        core.insertAfterElement(td, segMoreNodes);
                        limitedNodes.push(td);
                    }
                }
                emptyCellsUntil(this.colCnt); // finish off the level
                rowStruct.moreEls = moreNodes; // for easy undoing later
                rowStruct.limitedEls = limitedNodes; // for easy undoing later
            }
        };
        // Reveals all levels and removes all "more"-related elements for a grid's row.
        // `row` is a row number.
        DayGrid.prototype.unlimitRow = function (row) {
            var rowStruct = this.eventRenderer.rowStructs[row];
            if (rowStruct.moreEls) {
                rowStruct.moreEls.forEach(core.removeElement);
                rowStruct.moreEls = null;
            }
            if (rowStruct.limitedEls) {
                rowStruct.limitedEls.forEach(function (limitedEl) {
                    limitedEl.classList.remove('fc-limited');
                });
                rowStruct.limitedEls = null;
            }
        };
        // Renders an <a> element that represents hidden event element for a cell.
        // Responsible for attaching click handler as well.
        DayGrid.prototype.renderMoreLink = function (row, col, hiddenSegs) {
            var _this = this;
            var _a = this.context, calendar = _a.calendar, view = _a.view, dateEnv = _a.dateEnv, options = _a.options, isRtl = _a.isRtl;
            var a = core.createElement('a', { className: 'fc-more' });
            a.innerText = this.getMoreLinkText(hiddenSegs.length);
            a.addEventListener('click', function (ev) {
                var clickOption = options.eventLimitClick;
                var _col = isRtl ? _this.colCnt - col - 1 : col; // HACK: props.cells has different dir system?
                var date = _this.props.cells[row][_col].date;
                var moreEl = ev.currentTarget;
                var dayEl = _this.getCellEl(row, col);
                var allSegs = _this.getCellSegs(row, col);
                // rescope the segments to be within the cell's date
                var reslicedAllSegs = _this.resliceDaySegs(allSegs, date);
                var reslicedHiddenSegs = _this.resliceDaySegs(hiddenSegs, date);
                if (typeof clickOption === 'function') {
                    // the returned value can be an atomic option
                    clickOption = calendar.publiclyTrigger('eventLimitClick', [
                        {
                            date: dateEnv.toDate(date),
                            allDay: true,
                            dayEl: dayEl,
                            moreEl: moreEl,
                            segs: reslicedAllSegs,
                            hiddenSegs: reslicedHiddenSegs,
                            jsEvent: ev,
                            view: view
                        }
                    ]);
                }
                if (clickOption === 'popover') {
                    _this.showSegPopover(row, col, moreEl, reslicedAllSegs);
                }
                else if (typeof clickOption === 'string') { // a view name
                    calendar.zoomTo(date, clickOption);
                }
            });
            return a;
        };
        // Reveals the popover that displays all events within a cell
        DayGrid.prototype.showSegPopover = function (row, col, moreLink, segs) {
            var _this = this;
            var _a = this.context, calendar = _a.calendar, view = _a.view, theme = _a.theme, isRtl = _a.isRtl;
            var _col = isRtl ? this.colCnt - col - 1 : col; // HACK: props.cells has different dir system?
            var moreWrap = moreLink.parentNode; // the <div> wrapper around the <a>
            var topEl; // the element we want to match the top coordinate of
            var options;
            if (this.rowCnt === 1) {
                topEl = view.el; // will cause the popover to cover any sort of header
            }
            else {
                topEl = this.rowEls[row]; // will align with top of row
            }
            options = {
                className: 'fc-more-popover ' + theme.getClass('popover'),
                parentEl: view.el,
                top: core.computeRect(topEl).top,
                autoHide: true,
                content: function (el) {
                    _this.segPopoverTile = new DayTile(el);
                    _this.updateSegPopoverTile(_this.props.cells[row][_col].date, segs);
                },
                hide: function () {
                    _this.segPopoverTile.destroy();
                    _this.segPopoverTile = null;
                    _this.segPopover.destroy();
                    _this.segPopover = null;
                }
            };
            // Determine horizontal coordinate.
            // We use the moreWrap instead of the <td> to avoid border confusion.
            if (isRtl) {
                options.right = core.computeRect(moreWrap).right + 1; // +1 to be over cell border
            }
            else {
                options.left = core.computeRect(moreWrap).left - 1; // -1 to be over cell border
            }
            this.segPopover = new Popover(options);
            this.segPopover.show();
            calendar.releaseAfterSizingTriggers(); // hack for eventPositioned
        };
        // Given the events within an array of segment objects, reslice them to be in a single day
        DayGrid.prototype.resliceDaySegs = function (segs, dayDate) {
            var dayStart = dayDate;
            var dayEnd = core.addDays(dayStart, 1);
            var dayRange = { start: dayStart, end: dayEnd };
            var newSegs = [];
            for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
                var seg = segs_1[_i];
                var eventRange = seg.eventRange;
                var origRange = eventRange.range;
                var slicedRange = core.intersectRanges(origRange, dayRange);
                if (slicedRange) {
                    newSegs.push(__assign({}, seg, { eventRange: {
                            def: eventRange.def,
                            ui: __assign({}, eventRange.ui, { durationEditable: false }),
                            instance: eventRange.instance,
                            range: slicedRange
                        }, isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(), isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf() }));
                }
            }
            return newSegs;
        };
        // Generates the text that should be inside a "more" link, given the number of events it represents
        DayGrid.prototype.getMoreLinkText = function (num) {
            var opt = this.context.options.eventLimitText;
            if (typeof opt === 'function') {
                return opt(num);
            }
            else {
                return '+' + num + ' ' + opt;
            }
        };
        // Returns segments within a given cell.
        // If `startLevel` is specified, returns only events including and below that level. Otherwise returns all segs.
        DayGrid.prototype.getCellSegs = function (row, col, startLevel) {
            var segMatrix = this.eventRenderer.rowStructs[row].segMatrix;
            var level = startLevel || 0;
            var segs = [];
            var seg;
            while (level < segMatrix.length) {
                seg = segMatrix[level][col];
                if (seg) {
                    segs.push(seg);
                }
                level++;
            }
            return segs;
        };
        return DayGrid;
    }(core.DateComponent));

    var WEEK_NUM_FORMAT$1 = core.createFormatter({ week: 'numeric' });
    /* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
    ----------------------------------------------------------------------------------------------------------------------*/
    // It is a manager for a DayGrid subcomponent, which does most of the heavy lifting.
    // It is responsible for managing width/height.
    var AbstractDayGridView = /** @class */ (function (_super) {
        __extends(AbstractDayGridView, _super);
        function AbstractDayGridView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.processOptions = core.memoize(_this._processOptions);
            _this.renderSkeleton = core.memoizeRendering(_this._renderSkeleton, _this._unrenderSkeleton);
            /* Header Rendering
            ------------------------------------------------------------------------------------------------------------------*/
            // Generates the HTML that will go before the day-of week header cells
            _this.renderHeadIntroHtml = function () {
                var _a = _this.context, theme = _a.theme, options = _a.options;
                if (_this.colWeekNumbersVisible) {
                    return '' +
                        '<th class="fc-week-number ' + theme.getClass('widgetHeader') + '" ' + _this.weekNumberStyleAttr() + '>' +
                        '<span>' + // needed for matchCellWidths
                        core.htmlEscape(options.weekLabel) +
                        '</span>' +
                        '</th>';
                }
                return '';
            };
            /* Day Grid Rendering
            ------------------------------------------------------------------------------------------------------------------*/
            // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
            _this.renderDayGridNumberIntroHtml = function (row, dayGrid) {
                var _a = _this.context, options = _a.options, dateEnv = _a.dateEnv;
                var weekStart = dayGrid.props.cells[row][0].date;
                if (_this.colWeekNumbersVisible) {
                    return '' +
                        '<td class="fc-week-number" ' + _this.weekNumberStyleAttr() + '>' +
                        core.buildGotoAnchorHtml(// aside from link, important for matchCellWidths
                        options, dateEnv, { date: weekStart, type: 'week', forceOff: dayGrid.colCnt === 1 }, dateEnv.format(weekStart, WEEK_NUM_FORMAT$1) // inner HTML
                        ) +
                        '</td>';
                }
                return '';
            };
            // Generates the HTML that goes before the day bg cells for each day-row
            _this.renderDayGridBgIntroHtml = function () {
                var theme = _this.context.theme;
                if (_this.colWeekNumbersVisible) {
                    return '<td class="fc-week-number ' + theme.getClass('widgetContent') + '" ' + _this.weekNumberStyleAttr() + '></td>';
                }
                return '';
            };
            // Generates the HTML that goes before every other type of row generated by DayGrid.
            // Affects mirror-skeleton and highlight-skeleton rows.
            _this.renderDayGridIntroHtml = function () {
                if (_this.colWeekNumbersVisible) {
                    return '<td class="fc-week-number" ' + _this.weekNumberStyleAttr() + '></td>';
                }
                return '';
            };
            return _this;
        }
        AbstractDayGridView.prototype._processOptions = function (options) {
            if (options.weekNumbers) {
                if (options.weekNumbersWithinDays) {
                    this.cellWeekNumbersVisible = true;
                    this.colWeekNumbersVisible = false;
                }
                else {
                    this.cellWeekNumbersVisible = false;
                    this.colWeekNumbersVisible = true;
                }
            }
            else {
                this.colWeekNumbersVisible = false;
                this.cellWeekNumbersVisible = false;
            }
        };
        AbstractDayGridView.prototype.render = function (props, context) {
            _super.prototype.render.call(this, props, context);
            this.processOptions(context.options);
            this.renderSkeleton(context);
        };
        AbstractDayGridView.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderSkeleton.unrender();
        };
        AbstractDayGridView.prototype._renderSkeleton = function (context) {
            this.el.classList.add('fc-dayGrid-view');
            this.el.innerHTML = this.renderSkeletonHtml();
            this.scroller = new core.ScrollComponent('hidden', // overflow x
            'auto' // overflow y
            );
            var dayGridContainerEl = this.scroller.el;
            this.el.querySelector('.fc-body > tr > td').appendChild(dayGridContainerEl);
            dayGridContainerEl.classList.add('fc-day-grid-container');
            var dayGridEl = core.createElement('div', { className: 'fc-day-grid' });
            dayGridContainerEl.appendChild(dayGridEl);
            this.dayGrid = new DayGrid(dayGridEl, {
                renderNumberIntroHtml: this.renderDayGridNumberIntroHtml,
                renderBgIntroHtml: this.renderDayGridBgIntroHtml,
                renderIntroHtml: this.renderDayGridIntroHtml,
                colWeekNumbersVisible: this.colWeekNumbersVisible,
                cellWeekNumbersVisible: this.cellWeekNumbersVisible
            });
        };
        AbstractDayGridView.prototype._unrenderSkeleton = function () {
            this.el.classList.remove('fc-dayGrid-view');
            this.dayGrid.destroy();
            this.scroller.destroy();
        };
        // Builds the HTML skeleton for the view.
        // The day-grid component will render inside of a container defined by this HTML.
        AbstractDayGridView.prototype.renderSkeletonHtml = function () {
            var _a = this.context, theme = _a.theme, options = _a.options;
            return '' +
                '<table class="' + theme.getClass('tableGrid') + '">' +
                (options.columnHeader ?
                    '<thead class="fc-head">' +
                        '<tr>' +
                        '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
                        '</tr>' +
                        '</thead>' :
                    '') +
                '<tbody class="fc-body">' +
                '<tr>' +
                '<td class="' + theme.getClass('widgetContent') + '"></td>' +
                '</tr>' +
                '</tbody>' +
                '</table>';
        };
        // Generates an HTML attribute string for setting the width of the week number column, if it is known
        AbstractDayGridView.prototype.weekNumberStyleAttr = function () {
            if (this.weekNumberWidth != null) {
                return 'style="width:' + this.weekNumberWidth + 'px"';
            }
            return '';
        };
        // Determines whether each row should have a constant height
        AbstractDayGridView.prototype.hasRigidRows = function () {
            var eventLimit = this.context.options.eventLimit;
            return eventLimit && typeof eventLimit !== 'number';
        };
        /* Dimensions
        ------------------------------------------------------------------------------------------------------------------*/
        AbstractDayGridView.prototype.updateSize = function (isResize, viewHeight, isAuto) {
            _super.prototype.updateSize.call(this, isResize, viewHeight, isAuto); // will call updateBaseSize. important that executes first
            this.dayGrid.updateSize(isResize);
        };
        // Refreshes the horizontal dimensions of the view
        AbstractDayGridView.prototype.updateBaseSize = function (isResize, viewHeight, isAuto) {
            var dayGrid = this.dayGrid;
            var eventLimit = this.context.options.eventLimit;
            var headRowEl = this.header ? this.header.el : null; // HACK
            var scrollerHeight;
            var scrollbarWidths;
            // hack to give the view some height prior to dayGrid's columns being rendered
            // TODO: separate setting height from scroller VS dayGrid.
            if (!dayGrid.rowEls) {
                if (!isAuto) {
                    scrollerHeight = this.computeScrollerHeight(viewHeight);
                    this.scroller.setHeight(scrollerHeight);
                }
                return;
            }
            if (this.colWeekNumbersVisible) {
                // Make sure all week number cells running down the side have the same width.
                this.weekNumberWidth = core.matchCellWidths(core.findElements(this.el, '.fc-week-number'));
            }
            // reset all heights to be natural
            this.scroller.clear();
            if (headRowEl) {
                core.uncompensateScroll(headRowEl);
            }
            dayGrid.removeSegPopover(); // kill the "more" popover if displayed
            // is the event limit a constant level number?
            if (eventLimit && typeof eventLimit === 'number') {
                dayGrid.limitRows(eventLimit); // limit the levels first so the height can redistribute after
            }
            // distribute the height to the rows
            // (viewHeight is a "recommended" value if isAuto)
            scrollerHeight = this.computeScrollerHeight(viewHeight);
            this.setGridHeight(scrollerHeight, isAuto);
            // is the event limit dynamically calculated?
            if (eventLimit && typeof eventLimit !== 'number') {
                dayGrid.limitRows(eventLimit); // limit the levels after the grid's row heights have been set
            }
            if (!isAuto) { // should we force dimensions of the scroll container?
                this.scroller.setHeight(scrollerHeight);
                scrollbarWidths = this.scroller.getScrollbarWidths();
                if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
                    if (headRowEl) {
                        core.compensateScroll(headRowEl, scrollbarWidths);
                    }
                    // doing the scrollbar compensation might have created text overflow which created more height. redo
                    scrollerHeight = this.computeScrollerHeight(viewHeight);
                    this.scroller.setHeight(scrollerHeight);
                }
                // guarantees the same scrollbar widths
                this.scroller.lockOverflow(scrollbarWidths);
            }
        };
        // given a desired total height of the view, returns what the height of the scroller should be
        AbstractDayGridView.prototype.computeScrollerHeight = function (viewHeight) {
            return viewHeight -
                core.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
        };
        // Sets the height of just the DayGrid component in this view
        AbstractDayGridView.prototype.setGridHeight = function (height, isAuto) {
            if (this.context.options.monthMode) {
                // if auto, make the height of each row the height that it would be if there were 6 weeks
                if (isAuto) {
                    height *= this.dayGrid.rowCnt / 6;
                }
                core.distributeHeight(this.dayGrid.rowEls, height, !isAuto); // if auto, don't compensate for height-hogging rows
            }
            else {
                if (isAuto) {
                    core.undistributeHeight(this.dayGrid.rowEls); // let the rows be their natural height with no expanding
                }
                else {
                    core.distributeHeight(this.dayGrid.rowEls, height, true); // true = compensate for height-hogging rows
                }
            }
        };
        /* Scroll
        ------------------------------------------------------------------------------------------------------------------*/
        AbstractDayGridView.prototype.computeDateScroll = function (duration) {
            return { top: 0 };
        };
        AbstractDayGridView.prototype.queryDateScroll = function () {
            return { top: this.scroller.getScrollTop() };
        };
        AbstractDayGridView.prototype.applyDateScroll = function (scroll) {
            if (scroll.top !== undefined) {
                this.scroller.setScrollTop(scroll.top);
            }
        };
        return AbstractDayGridView;
    }(core.View));
    AbstractDayGridView.prototype.dateProfileGeneratorClass = DayGridDateProfileGenerator;

    var SimpleDayGrid = /** @class */ (function (_super) {
        __extends(SimpleDayGrid, _super);
        function SimpleDayGrid(dayGrid) {
            var _this = _super.call(this, dayGrid.el) || this;
            _this.slicer = new DayGridSlicer();
            _this.dayGrid = dayGrid;
            return _this;
        }
        SimpleDayGrid.prototype.firstContext = function (context) {
            context.calendar.registerInteractiveComponent(this, { el: this.dayGrid.el });
        };
        SimpleDayGrid.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.context.calendar.unregisterInteractiveComponent(this);
        };
        SimpleDayGrid.prototype.render = function (props, context) {
            var dayGrid = this.dayGrid;
            var dateProfile = props.dateProfile, dayTable = props.dayTable;
            dayGrid.receiveContext(context); // hack because context is used in sliceProps
            dayGrid.receiveProps(__assign({}, this.slicer.sliceProps(props, dateProfile, props.nextDayThreshold, context.calendar, dayGrid, dayTable), { dateProfile: dateProfile, cells: dayTable.cells, isRigid: props.isRigid }), context);
        };
        SimpleDayGrid.prototype.buildPositionCaches = function () {
            this.dayGrid.buildPositionCaches();
        };
        SimpleDayGrid.prototype.queryHit = function (positionLeft, positionTop) {
            var rawHit = this.dayGrid.positionToHit(positionLeft, positionTop);
            if (rawHit) {
                return {
                    component: this.dayGrid,
                    dateSpan: rawHit.dateSpan,
                    dayEl: rawHit.dayEl,
                    rect: {
                        left: rawHit.relativeRect.left,
                        right: rawHit.relativeRect.right,
                        top: rawHit.relativeRect.top,
                        bottom: rawHit.relativeRect.bottom
                    },
                    layer: 0
                };
            }
        };
        return SimpleDayGrid;
    }(core.DateComponent));
    var DayGridSlicer = /** @class */ (function (_super) {
        __extends(DayGridSlicer, _super);
        function DayGridSlicer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DayGridSlicer.prototype.sliceRange = function (dateRange, dayTable) {
            return dayTable.sliceRange(dateRange);
        };
        return DayGridSlicer;
    }(core.Slicer));

    var DayGridView = /** @class */ (function (_super) {
        __extends(DayGridView, _super);
        function DayGridView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.buildDayTable = core.memoize(buildDayTable);
            return _this;
        }
        DayGridView.prototype.render = function (props, context) {
            _super.prototype.render.call(this, props, context); // will call _renderSkeleton/_unrenderSkeleton
            var dateProfile = this.props.dateProfile;
            var dayTable = this.dayTable =
                this.buildDayTable(dateProfile, props.dateProfileGenerator);
            if (this.header) {
                this.header.receiveProps({
                    dateProfile: dateProfile,
                    dates: dayTable.headerDates,
                    datesRepDistinctDays: dayTable.rowCnt === 1,
                    renderIntroHtml: this.renderHeadIntroHtml
                }, context);
            }
            this.simpleDayGrid.receiveProps({
                dateProfile: dateProfile,
                dayTable: dayTable,
                businessHours: props.businessHours,
                dateSelection: props.dateSelection,
                eventStore: props.eventStore,
                eventUiBases: props.eventUiBases,
                eventSelection: props.eventSelection,
                eventDrag: props.eventDrag,
                eventResize: props.eventResize,
                isRigid: this.hasRigidRows(),
                nextDayThreshold: this.context.nextDayThreshold
            }, context);
        };
        DayGridView.prototype._renderSkeleton = function (context) {
            _super.prototype._renderSkeleton.call(this, context);
            if (context.options.columnHeader) {
                this.header = new core.DayHeader(this.el.querySelector('.fc-head-container'));
            }
            this.simpleDayGrid = new SimpleDayGrid(this.dayGrid);
        };
        DayGridView.prototype._unrenderSkeleton = function () {
            _super.prototype._unrenderSkeleton.call(this);
            if (this.header) {
                this.header.destroy();
            }
            this.simpleDayGrid.destroy();
        };
        return DayGridView;
    }(AbstractDayGridView));
    function buildDayTable(dateProfile, dateProfileGenerator) {
        var daySeries = new core.DaySeries(dateProfile.renderRange, dateProfileGenerator);
        return new core.DayTable(daySeries, /year|month|week/.test(dateProfile.currentRangeUnit));
    }

    var main = core.createPlugin({
        defaultView: 'dayGridMonth',
        views: {
            dayGrid: DayGridView,
            dayGridDay: {
                type: 'dayGrid',
                duration: { days: 1 }
            },
            dayGridWeek: {
                type: 'dayGrid',
                duration: { weeks: 1 }
            },
            dayGridMonth: {
                type: 'dayGrid',
                duration: { months: 1 },
                monthMode: true,
                fixedWeekCount: true
            }
        }
    });

    exports.AbstractDayGridView = AbstractDayGridView;
    exports.DayBgRow = DayBgRow;
    exports.DayGrid = DayGrid;
    exports.DayGridSlicer = DayGridSlicer;
    exports.DayGridView = DayGridView;
    exports.SimpleDayGrid = SimpleDayGrid;
    exports.buildBasicDayTable = buildDayTable;
    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

/*!
FullCalendar Google Calendar Plugin v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fullcalendar/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fullcalendar/core'], factory) :
    (global = global || self, factory(global.FullCalendarGoogleCalendar = {}, global.FullCalendar));
}(this, function (exports, core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    // TODO: expose somehow
    var API_BASE = 'https://www.googleapis.com/calendar/v3/calendars';
    var STANDARD_PROPS = {
        url: String,
        googleCalendarApiKey: String,
        googleCalendarId: String,
        googleCalendarApiBase: String,
        data: null
    };
    var eventSourceDef = {
        parseMeta: function (raw) {
            if (typeof raw === 'string') {
                raw = { url: raw };
            }
            if (typeof raw === 'object') {
                var standardProps = core.refineProps(raw, STANDARD_PROPS);
                if (!standardProps.googleCalendarId && standardProps.url) {
                    standardProps.googleCalendarId = parseGoogleCalendarId(standardProps.url);
                }
                delete standardProps.url;
                if (standardProps.googleCalendarId) {
                    return standardProps;
                }
            }
            return null;
        },
        fetch: function (arg, onSuccess, onFailure) {
            var calendar = arg.calendar;
            var meta = arg.eventSource.meta;
            var apiKey = meta.googleCalendarApiKey || calendar.opt('googleCalendarApiKey');
            if (!apiKey) {
                onFailure({
                    message: 'Specify a googleCalendarApiKey. See http://fullcalendar.io/docs/google_calendar/'
                });
            }
            else {
                var url = buildUrl(meta);
                var requestParams_1 = buildRequestParams(arg.range, apiKey, meta.data, calendar.dateEnv);
                core.requestJson('GET', url, requestParams_1, function (body, xhr) {
                    if (body.error) {
                        onFailure({
                            message: 'Google Calendar API: ' + body.error.message,
                            errors: body.error.errors,
                            xhr: xhr
                        });
                    }
                    else {
                        onSuccess({
                            rawEvents: gcalItemsToRawEventDefs(body.items, requestParams_1.timeZone),
                            xhr: xhr
                        });
                    }
                }, function (message, xhr) {
                    onFailure({ message: message, xhr: xhr });
                });
            }
        }
    };
    function parseGoogleCalendarId(url) {
        var match;
        // detect if the ID was specified as a single string.
        // will match calendars like "asdf1234@calendar.google.com" in addition to person email calendars.
        if (/^[^\/]+@([^\/\.]+\.)*(google|googlemail|gmail)\.com$/.test(url)) {
            return url;
        }
        else if ((match = /^https:\/\/www.googleapis.com\/calendar\/v3\/calendars\/([^\/]*)/.exec(url)) ||
            (match = /^https?:\/\/www.google.com\/calendar\/feeds\/([^\/]*)/.exec(url))) {
            return decodeURIComponent(match[1]);
        }
    }
    function buildUrl(meta) {
        var apiBase = meta.googleCalendarApiBase;
        if (!apiBase) {
            apiBase = API_BASE;
        }
        return apiBase + '/' + encodeURIComponent(meta.googleCalendarId) + '/events';
    }
    function buildRequestParams(range, apiKey, extraParams, dateEnv) {
        var params;
        var startStr;
        var endStr;
        if (dateEnv.canComputeOffset) {
            // strings will naturally have offsets, which GCal needs
            startStr = dateEnv.formatIso(range.start);
            endStr = dateEnv.formatIso(range.end);
        }
        else {
            // when timezone isn't known, we don't know what the UTC offset should be, so ask for +/- 1 day
            // from the UTC day-start to guarantee we're getting all the events
            // (start/end will be UTC-coerced dates, so toISOString is okay)
            startStr = core.addDays(range.start, -1).toISOString();
            endStr = core.addDays(range.end, 1).toISOString();
        }
        params = __assign({}, (extraParams || {}), { key: apiKey, timeMin: startStr, timeMax: endStr, singleEvents: true, maxResults: 9999 });
        if (dateEnv.timeZone !== 'local') {
            params.timeZone = dateEnv.timeZone;
        }
        return params;
    }
    function gcalItemsToRawEventDefs(items, gcalTimezone) {
        return items.map(function (item) {
            return gcalItemToRawEventDef(item, gcalTimezone);
        });
    }
    function gcalItemToRawEventDef(item, gcalTimezone) {
        var url = item.htmlLink || null;
        // make the URLs for each event show times in the correct timezone
        if (url && gcalTimezone) {
            url = injectQsComponent(url, 'ctz=' + gcalTimezone);
        }
        return {
            id: item.id,
            title: item.summary,
            start: item.start.dateTime || item.start.date,
            end: item.end.dateTime || item.end.date,
            url: url,
            location: item.location,
            description: item.description
        };
    }
    // Injects a string like "arg=value" into the querystring of a URL
    // TODO: move to a general util file?
    function injectQsComponent(url, component) {
        // inject it after the querystring but before the fragment
        return url.replace(/(\?.*?)?(#|$)/, function (whole, qs, hash) {
            return (qs ? qs + '&' : '?') + component + hash;
        });
    }
    var main = core.createPlugin({
        eventSourceDefs: [eventSourceDef]
    });

    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

/*!
FullCalendar Interaction Plugin v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fullcalendar/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fullcalendar/core'], factory) :
    (global = global || self, factory(global.FullCalendarInteraction = {}, global.FullCalendar));
}(this, function (exports, core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    core.config.touchMouseIgnoreWait = 500;
    var ignoreMouseDepth = 0;
    var listenerCnt = 0;
    var isWindowTouchMoveCancelled = false;
    /*
    Uses a "pointer" abstraction, which monitors UI events for both mouse and touch.
    Tracks when the pointer "drags" on a certain element, meaning down+move+up.

    Also, tracks if there was touch-scrolling.
    Also, can prevent touch-scrolling from happening.
    Also, can fire pointermove events when scrolling happens underneath, even when no real pointer movement.

    emits:
    - pointerdown
    - pointermove
    - pointerup
    */
    var PointerDragging = /** @class */ (function () {
        function PointerDragging(containerEl) {
            var _this = this;
            this.subjectEl = null;
            this.downEl = null;
            // options that can be directly assigned by caller
            this.selector = ''; // will cause subjectEl in all emitted events to be this element
            this.handleSelector = '';
            this.shouldIgnoreMove = false;
            this.shouldWatchScroll = true; // for simulating pointermove on scroll
            // internal states
            this.isDragging = false;
            this.isTouchDragging = false;
            this.wasTouchScroll = false;
            // Mouse
            // ----------------------------------------------------------------------------------------------------
            this.handleMouseDown = function (ev) {
                if (!_this.shouldIgnoreMouse() &&
                    isPrimaryMouseButton(ev) &&
                    _this.tryStart(ev)) {
                    var pev = _this.createEventFromMouse(ev, true);
                    _this.emitter.trigger('pointerdown', pev);
                    _this.initScrollWatch(pev);
                    if (!_this.shouldIgnoreMove) {
                        document.addEventListener('mousemove', _this.handleMouseMove);
                    }
                    document.addEventListener('mouseup', _this.handleMouseUp);
                }
            };
            this.handleMouseMove = function (ev) {
                var pev = _this.createEventFromMouse(ev);
                _this.recordCoords(pev);
                _this.emitter.trigger('pointermove', pev);
            };
            this.handleMouseUp = function (ev) {
                document.removeEventListener('mousemove', _this.handleMouseMove);
                document.removeEventListener('mouseup', _this.handleMouseUp);
                _this.emitter.trigger('pointerup', _this.createEventFromMouse(ev));
                _this.cleanup(); // call last so that pointerup has access to props
            };
            // Touch
            // ----------------------------------------------------------------------------------------------------
            this.handleTouchStart = function (ev) {
                if (_this.tryStart(ev)) {
                    _this.isTouchDragging = true;
                    var pev = _this.createEventFromTouch(ev, true);
                    _this.emitter.trigger('pointerdown', pev);
                    _this.initScrollWatch(pev);
                    // unlike mouse, need to attach to target, not document
                    // https://stackoverflow.com/a/45760014
                    var target = ev.target;
                    if (!_this.shouldIgnoreMove) {
                        target.addEventListener('touchmove', _this.handleTouchMove);
                    }
                    target.addEventListener('touchend', _this.handleTouchEnd);
                    target.addEventListener('touchcancel', _this.handleTouchEnd); // treat it as a touch end
                    // attach a handler to get called when ANY scroll action happens on the page.
                    // this was impossible to do with normal on/off because 'scroll' doesn't bubble.
                    // http://stackoverflow.com/a/32954565/96342
                    window.addEventListener('scroll', _this.handleTouchScroll, true // useCapture
                    );
                }
            };
            this.handleTouchMove = function (ev) {
                var pev = _this.createEventFromTouch(ev);
                _this.recordCoords(pev);
                _this.emitter.trigger('pointermove', pev);
            };
            this.handleTouchEnd = function (ev) {
                if (_this.isDragging) { // done to guard against touchend followed by touchcancel
                    var target = ev.target;
                    target.removeEventListener('touchmove', _this.handleTouchMove);
                    target.removeEventListener('touchend', _this.handleTouchEnd);
                    target.removeEventListener('touchcancel', _this.handleTouchEnd);
                    window.removeEventListener('scroll', _this.handleTouchScroll, true); // useCaptured=true
                    _this.emitter.trigger('pointerup', _this.createEventFromTouch(ev));
                    _this.cleanup(); // call last so that pointerup has access to props
                    _this.isTouchDragging = false;
                    startIgnoringMouse();
                }
            };
            this.handleTouchScroll = function () {
                _this.wasTouchScroll = true;
            };
            this.handleScroll = function (ev) {
                if (!_this.shouldIgnoreMove) {
                    var pageX = (window.pageXOffset - _this.prevScrollX) + _this.prevPageX;
                    var pageY = (window.pageYOffset - _this.prevScrollY) + _this.prevPageY;
                    _this.emitter.trigger('pointermove', {
                        origEvent: ev,
                        isTouch: _this.isTouchDragging,
                        subjectEl: _this.subjectEl,
                        pageX: pageX,
                        pageY: pageY,
                        deltaX: pageX - _this.origPageX,
                        deltaY: pageY - _this.origPageY
                    });
                }
            };
            this.containerEl = containerEl;
            this.emitter = new core.EmitterMixin();
            containerEl.addEventListener('mousedown', this.handleMouseDown);
            containerEl.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            listenerCreated();
        }
        PointerDragging.prototype.destroy = function () {
            this.containerEl.removeEventListener('mousedown', this.handleMouseDown);
            this.containerEl.removeEventListener('touchstart', this.handleTouchStart, { passive: true });
            listenerDestroyed();
        };
        PointerDragging.prototype.tryStart = function (ev) {
            var subjectEl = this.querySubjectEl(ev);
            var downEl = ev.target;
            if (subjectEl &&
                (!this.handleSelector || core.elementClosest(downEl, this.handleSelector))) {
                this.subjectEl = subjectEl;
                this.downEl = downEl;
                this.isDragging = true; // do this first so cancelTouchScroll will work
                this.wasTouchScroll = false;
                return true;
            }
            return false;
        };
        PointerDragging.prototype.cleanup = function () {
            isWindowTouchMoveCancelled = false;
            this.isDragging = false;
            this.subjectEl = null;
            this.downEl = null;
            // keep wasTouchScroll around for later access
            this.destroyScrollWatch();
        };
        PointerDragging.prototype.querySubjectEl = function (ev) {
            if (this.selector) {
                return core.elementClosest(ev.target, this.selector);
            }
            else {
                return this.containerEl;
            }
        };
        PointerDragging.prototype.shouldIgnoreMouse = function () {
            return ignoreMouseDepth || this.isTouchDragging;
        };
        // can be called by user of this class, to cancel touch-based scrolling for the current drag
        PointerDragging.prototype.cancelTouchScroll = function () {
            if (this.isDragging) {
                isWindowTouchMoveCancelled = true;
            }
        };
        // Scrolling that simulates pointermoves
        // ----------------------------------------------------------------------------------------------------
        PointerDragging.prototype.initScrollWatch = function (ev) {
            if (this.shouldWatchScroll) {
                this.recordCoords(ev);
                window.addEventListener('scroll', this.handleScroll, true); // useCapture=true
            }
        };
        PointerDragging.prototype.recordCoords = function (ev) {
            if (this.shouldWatchScroll) {
                this.prevPageX = ev.pageX;
                this.prevPageY = ev.pageY;
                this.prevScrollX = window.pageXOffset;
                this.prevScrollY = window.pageYOffset;
            }
        };
        PointerDragging.prototype.destroyScrollWatch = function () {
            if (this.shouldWatchScroll) {
                window.removeEventListener('scroll', this.handleScroll, true); // useCaptured=true
            }
        };
        // Event Normalization
        // ----------------------------------------------------------------------------------------------------
        PointerDragging.prototype.createEventFromMouse = function (ev, isFirst) {
            var deltaX = 0;
            var deltaY = 0;
            // TODO: repeat code
            if (isFirst) {
                this.origPageX = ev.pageX;
                this.origPageY = ev.pageY;
            }
            else {
                deltaX = ev.pageX - this.origPageX;
                deltaY = ev.pageY - this.origPageY;
            }
            return {
                origEvent: ev,
                isTouch: false,
                subjectEl: this.subjectEl,
                pageX: ev.pageX,
                pageY: ev.pageY,
                deltaX: deltaX,
                deltaY: deltaY
            };
        };
        PointerDragging.prototype.createEventFromTouch = function (ev, isFirst) {
            var touches = ev.touches;
            var pageX;
            var pageY;
            var deltaX = 0;
            var deltaY = 0;
            // if touch coords available, prefer,
            // because FF would give bad ev.pageX ev.pageY
            if (touches && touches.length) {
                pageX = touches[0].pageX;
                pageY = touches[0].pageY;
            }
            else {
                pageX = ev.pageX;
                pageY = ev.pageY;
            }
            // TODO: repeat code
            if (isFirst) {
                this.origPageX = pageX;
                this.origPageY = pageY;
            }
            else {
                deltaX = pageX - this.origPageX;
                deltaY = pageY - this.origPageY;
            }
            return {
                origEvent: ev,
                isTouch: true,
                subjectEl: this.subjectEl,
                pageX: pageX,
                pageY: pageY,
                deltaX: deltaX,
                deltaY: deltaY
            };
        };
        return PointerDragging;
    }());
    // Returns a boolean whether this was a left mouse click and no ctrl key (which means right click on Mac)
    function isPrimaryMouseButton(ev) {
        return ev.button === 0 && !ev.ctrlKey;
    }
    // Ignoring fake mouse events generated by touch
    // ----------------------------------------------------------------------------------------------------
    function startIgnoringMouse() {
        ignoreMouseDepth++;
        setTimeout(function () {
            ignoreMouseDepth--;
        }, core.config.touchMouseIgnoreWait);
    }
    // We want to attach touchmove as early as possible for Safari
    // ----------------------------------------------------------------------------------------------------
    function listenerCreated() {
        if (!(listenerCnt++)) {
            window.addEventListener('touchmove', onWindowTouchMove, { passive: false });
        }
    }
    function listenerDestroyed() {
        if (!(--listenerCnt)) {
            window.removeEventListener('touchmove', onWindowTouchMove, { passive: false });
        }
    }
    function onWindowTouchMove(ev) {
        if (isWindowTouchMoveCancelled) {
            ev.preventDefault();
        }
    }

    /*
    An effect in which an element follows the movement of a pointer across the screen.
    The moving element is a clone of some other element.
    Must call start + handleMove + stop.
    */
    var ElementMirror = /** @class */ (function () {
        function ElementMirror() {
            this.isVisible = false; // must be explicitly enabled
            this.sourceEl = null;
            this.mirrorEl = null;
            this.sourceElRect = null; // screen coords relative to viewport
            // options that can be set directly by caller
            this.parentNode = document.body;
            this.zIndex = 9999;
            this.revertDuration = 0;
        }
        ElementMirror.prototype.start = function (sourceEl, pageX, pageY) {
            this.sourceEl = sourceEl;
            this.sourceElRect = this.sourceEl.getBoundingClientRect();
            this.origScreenX = pageX - window.pageXOffset;
            this.origScreenY = pageY - window.pageYOffset;
            this.deltaX = 0;
            this.deltaY = 0;
            this.updateElPosition();
        };
        ElementMirror.prototype.handleMove = function (pageX, pageY) {
            this.deltaX = (pageX - window.pageXOffset) - this.origScreenX;
            this.deltaY = (pageY - window.pageYOffset) - this.origScreenY;
            this.updateElPosition();
        };
        // can be called before start
        ElementMirror.prototype.setIsVisible = function (bool) {
            if (bool) {
                if (!this.isVisible) {
                    if (this.mirrorEl) {
                        this.mirrorEl.style.display = '';
                    }
                    this.isVisible = bool; // needs to happen before updateElPosition
                    this.updateElPosition(); // because was not updating the position while invisible
                }
            }
            else {
                if (this.isVisible) {
                    if (this.mirrorEl) {
                        this.mirrorEl.style.display = 'none';
                    }
                    this.isVisible = bool;
                }
            }
        };
        // always async
        ElementMirror.prototype.stop = function (needsRevertAnimation, callback) {
            var _this = this;
            var done = function () {
                _this.cleanup();
                callback();
            };
            if (needsRevertAnimation &&
                this.mirrorEl &&
                this.isVisible &&
                this.revertDuration && // if 0, transition won't work
                (this.deltaX || this.deltaY) // if same coords, transition won't work
            ) {
                this.doRevertAnimation(done, this.revertDuration);
            }
            else {
                setTimeout(done, 0);
            }
        };
        ElementMirror.prototype.doRevertAnimation = function (callback, revertDuration) {
            var mirrorEl = this.mirrorEl;
            var finalSourceElRect = this.sourceEl.getBoundingClientRect(); // because autoscrolling might have happened
            mirrorEl.style.transition =
                'top ' + revertDuration + 'ms,' +
                    'left ' + revertDuration + 'ms';
            core.applyStyle(mirrorEl, {
                left: finalSourceElRect.left,
                top: finalSourceElRect.top
            });
            core.whenTransitionDone(mirrorEl, function () {
                mirrorEl.style.transition = '';
                callback();
            });
        };
        ElementMirror.prototype.cleanup = function () {
            if (this.mirrorEl) {
                core.removeElement(this.mirrorEl);
                this.mirrorEl = null;
            }
            this.sourceEl = null;
        };
        ElementMirror.prototype.updateElPosition = function () {
            if (this.sourceEl && this.isVisible) {
                core.applyStyle(this.getMirrorEl(), {
                    left: this.sourceElRect.left + this.deltaX,
                    top: this.sourceElRect.top + this.deltaY
                });
            }
        };
        ElementMirror.prototype.getMirrorEl = function () {
            var sourceElRect = this.sourceElRect;
            var mirrorEl = this.mirrorEl;
            if (!mirrorEl) {
                mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true); // cloneChildren=true
                // we don't want long taps or any mouse interaction causing selection/menus.
                // would use preventSelection(), but that prevents selectstart, causing problems.
                mirrorEl.classList.add('fc-unselectable');
                mirrorEl.classList.add('fc-dragging');
                core.applyStyle(mirrorEl, {
                    position: 'fixed',
                    zIndex: this.zIndex,
                    visibility: '',
                    boxSizing: 'border-box',
                    width: sourceElRect.right - sourceElRect.left,
                    height: sourceElRect.bottom - sourceElRect.top,
                    right: 'auto',
                    bottom: 'auto',
                    margin: 0
                });
                this.parentNode.appendChild(mirrorEl);
            }
            return mirrorEl;
        };
        return ElementMirror;
    }());

    /*
    Is a cache for a given element's scroll information (all the info that ScrollController stores)
    in addition the "client rectangle" of the element.. the area within the scrollbars.

    The cache can be in one of two modes:
    - doesListening:false - ignores when the container is scrolled by someone else
    - doesListening:true - watch for scrolling and update the cache
    */
    var ScrollGeomCache = /** @class */ (function (_super) {
        __extends(ScrollGeomCache, _super);
        function ScrollGeomCache(scrollController, doesListening) {
            var _this = _super.call(this) || this;
            _this.handleScroll = function () {
                _this.scrollTop = _this.scrollController.getScrollTop();
                _this.scrollLeft = _this.scrollController.getScrollLeft();
                _this.handleScrollChange();
            };
            _this.scrollController = scrollController;
            _this.doesListening = doesListening;
            _this.scrollTop = _this.origScrollTop = scrollController.getScrollTop();
            _this.scrollLeft = _this.origScrollLeft = scrollController.getScrollLeft();
            _this.scrollWidth = scrollController.getScrollWidth();
            _this.scrollHeight = scrollController.getScrollHeight();
            _this.clientWidth = scrollController.getClientWidth();
            _this.clientHeight = scrollController.getClientHeight();
            _this.clientRect = _this.computeClientRect(); // do last in case it needs cached values
            if (_this.doesListening) {
                _this.getEventTarget().addEventListener('scroll', _this.handleScroll);
            }
            return _this;
        }
        ScrollGeomCache.prototype.destroy = function () {
            if (this.doesListening) {
                this.getEventTarget().removeEventListener('scroll', this.handleScroll);
            }
        };
        ScrollGeomCache.prototype.getScrollTop = function () {
            return this.scrollTop;
        };
        ScrollGeomCache.prototype.getScrollLeft = function () {
            return this.scrollLeft;
        };
        ScrollGeomCache.prototype.setScrollTop = function (top) {
            this.scrollController.setScrollTop(top);
            if (!this.doesListening) {
                // we are not relying on the element to normalize out-of-bounds scroll values
                // so we need to sanitize ourselves
                this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0);
                this.handleScrollChange();
            }
        };
        ScrollGeomCache.prototype.setScrollLeft = function (top) {
            this.scrollController.setScrollLeft(top);
            if (!this.doesListening) {
                // we are not relying on the element to normalize out-of-bounds scroll values
                // so we need to sanitize ourselves
                this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0);
                this.handleScrollChange();
            }
        };
        ScrollGeomCache.prototype.getClientWidth = function () {
            return this.clientWidth;
        };
        ScrollGeomCache.prototype.getClientHeight = function () {
            return this.clientHeight;
        };
        ScrollGeomCache.prototype.getScrollWidth = function () {
            return this.scrollWidth;
        };
        ScrollGeomCache.prototype.getScrollHeight = function () {
            return this.scrollHeight;
        };
        ScrollGeomCache.prototype.handleScrollChange = function () {
        };
        return ScrollGeomCache;
    }(core.ScrollController));
    var ElementScrollGeomCache = /** @class */ (function (_super) {
        __extends(ElementScrollGeomCache, _super);
        function ElementScrollGeomCache(el, doesListening) {
            return _super.call(this, new core.ElementScrollController(el), doesListening) || this;
        }
        ElementScrollGeomCache.prototype.getEventTarget = function () {
            return this.scrollController.el;
        };
        ElementScrollGeomCache.prototype.computeClientRect = function () {
            return core.computeInnerRect(this.scrollController.el);
        };
        return ElementScrollGeomCache;
    }(ScrollGeomCache));
    var WindowScrollGeomCache = /** @class */ (function (_super) {
        __extends(WindowScrollGeomCache, _super);
        function WindowScrollGeomCache(doesListening) {
            return _super.call(this, new core.WindowScrollController(), doesListening) || this;
        }
        WindowScrollGeomCache.prototype.getEventTarget = function () {
            return window;
        };
        WindowScrollGeomCache.prototype.computeClientRect = function () {
            return {
                left: this.scrollLeft,
                right: this.scrollLeft + this.clientWidth,
                top: this.scrollTop,
                bottom: this.scrollTop + this.clientHeight
            };
        };
        // the window is the only scroll object that changes it's rectangle relative
        // to the document's topleft as it scrolls
        WindowScrollGeomCache.prototype.handleScrollChange = function () {
            this.clientRect = this.computeClientRect();
        };
        return WindowScrollGeomCache;
    }(ScrollGeomCache));

    // If available we are using native "performance" API instead of "Date"
    // Read more about it on MDN:
    // https://developer.mozilla.org/en-US/docs/Web/API/Performance
    var getTime = typeof performance === 'function' ? performance.now : Date.now;
    /*
    For a pointer interaction, automatically scrolls certain scroll containers when the pointer
    approaches the edge.

    The caller must call start + handleMove + stop.
    */
    var AutoScroller = /** @class */ (function () {
        function AutoScroller() {
            var _this = this;
            // options that can be set by caller
            this.isEnabled = true;
            this.scrollQuery = [window, '.fc-scroller'];
            this.edgeThreshold = 50; // pixels
            this.maxVelocity = 300; // pixels per second
            // internal state
            this.pointerScreenX = null;
            this.pointerScreenY = null;
            this.isAnimating = false;
            this.scrollCaches = null;
            // protect against the initial pointerdown being too close to an edge and starting the scroll
            this.everMovedUp = false;
            this.everMovedDown = false;
            this.everMovedLeft = false;
            this.everMovedRight = false;
            this.animate = function () {
                if (_this.isAnimating) { // wasn't cancelled between animation calls
                    var edge = _this.computeBestEdge(_this.pointerScreenX + window.pageXOffset, _this.pointerScreenY + window.pageYOffset);
                    if (edge) {
                        var now = getTime();
                        _this.handleSide(edge, (now - _this.msSinceRequest) / 1000);
                        _this.requestAnimation(now);
                    }
                    else {
                        _this.isAnimating = false; // will stop animation
                    }
                }
            };
        }
        AutoScroller.prototype.start = function (pageX, pageY) {
            if (this.isEnabled) {
                this.scrollCaches = this.buildCaches();
                this.pointerScreenX = null;
                this.pointerScreenY = null;
                this.everMovedUp = false;
                this.everMovedDown = false;
                this.everMovedLeft = false;
                this.everMovedRight = false;
                this.handleMove(pageX, pageY);
            }
        };
        AutoScroller.prototype.handleMove = function (pageX, pageY) {
            if (this.isEnabled) {
                var pointerScreenX = pageX - window.pageXOffset;
                var pointerScreenY = pageY - window.pageYOffset;
                var yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY;
                var xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX;
                if (yDelta < 0) {
                    this.everMovedUp = true;
                }
                else if (yDelta > 0) {
                    this.everMovedDown = true;
                }
                if (xDelta < 0) {
                    this.everMovedLeft = true;
                }
                else if (xDelta > 0) {
                    this.everMovedRight = true;
                }
                this.pointerScreenX = pointerScreenX;
                this.pointerScreenY = pointerScreenY;
                if (!this.isAnimating) {
                    this.isAnimating = true;
                    this.requestAnimation(getTime());
                }
            }
        };
        AutoScroller.prototype.stop = function () {
            if (this.isEnabled) {
                this.isAnimating = false; // will stop animation
                for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                    var scrollCache = _a[_i];
                    scrollCache.destroy();
                }
                this.scrollCaches = null;
            }
        };
        AutoScroller.prototype.requestAnimation = function (now) {
            this.msSinceRequest = now;
            requestAnimationFrame(this.animate);
        };
        AutoScroller.prototype.handleSide = function (edge, seconds) {
            var scrollCache = edge.scrollCache;
            var edgeThreshold = this.edgeThreshold;
            var invDistance = edgeThreshold - edge.distance;
            var velocity = // the closer to the edge, the faster we scroll
             (invDistance * invDistance) / (edgeThreshold * edgeThreshold) * // quadratic
                this.maxVelocity * seconds;
            var sign = 1;
            switch (edge.name) {
                case 'left':
                    sign = -1;
                // falls through
                case 'right':
                    scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign);
                    break;
                case 'top':
                    sign = -1;
                // falls through
                case 'bottom':
                    scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign);
                    break;
            }
        };
        // left/top are relative to document topleft
        AutoScroller.prototype.computeBestEdge = function (left, top) {
            var edgeThreshold = this.edgeThreshold;
            var bestSide = null;
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                var rect = scrollCache.clientRect;
                var leftDist = left - rect.left;
                var rightDist = rect.right - left;
                var topDist = top - rect.top;
                var bottomDist = rect.bottom - top;
                // completely within the rect?
                if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {
                    if (topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() &&
                        (!bestSide || bestSide.distance > topDist)) {
                        bestSide = { scrollCache: scrollCache, name: 'top', distance: topDist };
                    }
                    if (bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() &&
                        (!bestSide || bestSide.distance > bottomDist)) {
                        bestSide = { scrollCache: scrollCache, name: 'bottom', distance: bottomDist };
                    }
                    if (leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() &&
                        (!bestSide || bestSide.distance > leftDist)) {
                        bestSide = { scrollCache: scrollCache, name: 'left', distance: leftDist };
                    }
                    if (rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() &&
                        (!bestSide || bestSide.distance > rightDist)) {
                        bestSide = { scrollCache: scrollCache, name: 'right', distance: rightDist };
                    }
                }
            }
            return bestSide;
        };
        AutoScroller.prototype.buildCaches = function () {
            return this.queryScrollEls().map(function (el) {
                if (el === window) {
                    return new WindowScrollGeomCache(false); // false = don't listen to user-generated scrolls
                }
                else {
                    return new ElementScrollGeomCache(el, false); // false = don't listen to user-generated scrolls
                }
            });
        };
        AutoScroller.prototype.queryScrollEls = function () {
            var els = [];
            for (var _i = 0, _a = this.scrollQuery; _i < _a.length; _i++) {
                var query = _a[_i];
                if (typeof query === 'object') {
                    els.push(query);
                }
                else {
                    els.push.apply(els, Array.prototype.slice.call(document.querySelectorAll(query)));
                }
            }
            return els;
        };
        return AutoScroller;
    }());

    /*
    Monitors dragging on an element. Has a number of high-level features:
    - minimum distance required before dragging
    - minimum wait time ("delay") before dragging
    - a mirror element that follows the pointer
    */
    var FeaturefulElementDragging = /** @class */ (function (_super) {
        __extends(FeaturefulElementDragging, _super);
        function FeaturefulElementDragging(containerEl) {
            var _this = _super.call(this, containerEl) || this;
            // options that can be directly set by caller
            // the caller can also set the PointerDragging's options as well
            _this.delay = null;
            _this.minDistance = 0;
            _this.touchScrollAllowed = true; // prevents drag from starting and blocks scrolling during drag
            _this.mirrorNeedsRevert = false;
            _this.isInteracting = false; // is the user validly moving the pointer? lasts until pointerup
            _this.isDragging = false; // is it INTENTFULLY dragging? lasts until after revert animation
            _this.isDelayEnded = false;
            _this.isDistanceSurpassed = false;
            _this.delayTimeoutId = null;
            _this.onPointerDown = function (ev) {
                if (!_this.isDragging) { // so new drag doesn't happen while revert animation is going
                    _this.isInteracting = true;
                    _this.isDelayEnded = false;
                    _this.isDistanceSurpassed = false;
                    core.preventSelection(document.body);
                    core.preventContextMenu(document.body);
                    // prevent links from being visited if there's an eventual drag.
                    // also prevents selection in older browsers (maybe?).
                    // not necessary for touch, besides, browser would complain about passiveness.
                    if (!ev.isTouch) {
                        ev.origEvent.preventDefault();
                    }
                    _this.emitter.trigger('pointerdown', ev);
                    if (!_this.pointer.shouldIgnoreMove) {
                        // actions related to initiating dragstart+dragmove+dragend...
                        _this.mirror.setIsVisible(false); // reset. caller must set-visible
                        _this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY); // must happen on first pointer down
                        _this.startDelay(ev);
                        if (!_this.minDistance) {
                            _this.handleDistanceSurpassed(ev);
                        }
                    }
                }
            };
            _this.onPointerMove = function (ev) {
                if (_this.isInteracting) { // if false, still waiting for previous drag's revert
                    _this.emitter.trigger('pointermove', ev);
                    if (!_this.isDistanceSurpassed) {
                        var minDistance = _this.minDistance;
                        var distanceSq = void 0; // current distance from the origin, squared
                        var deltaX = ev.deltaX, deltaY = ev.deltaY;
                        distanceSq = deltaX * deltaX + deltaY * deltaY;
                        if (distanceSq >= minDistance * minDistance) { // use pythagorean theorem
                            _this.handleDistanceSurpassed(ev);
                        }
                    }
                    if (_this.isDragging) {
                        // a real pointer move? (not one simulated by scrolling)
                        if (ev.origEvent.type !== 'scroll') {
                            _this.mirror.handleMove(ev.pageX, ev.pageY);
                            _this.autoScroller.handleMove(ev.pageX, ev.pageY);
                        }
                        _this.emitter.trigger('dragmove', ev);
                    }
                }
            };
            _this.onPointerUp = function (ev) {
                if (_this.isInteracting) { // if false, still waiting for previous drag's revert
                    _this.isInteracting = false;
                    core.allowSelection(document.body);
                    core.allowContextMenu(document.body);
                    _this.emitter.trigger('pointerup', ev); // can potentially set mirrorNeedsRevert
                    if (_this.isDragging) {
                        _this.autoScroller.stop();
                        _this.tryStopDrag(ev); // which will stop the mirror
                    }
                    if (_this.delayTimeoutId) {
                        clearTimeout(_this.delayTimeoutId);
                        _this.delayTimeoutId = null;
                    }
                }
            };
            var pointer = _this.pointer = new PointerDragging(containerEl);
            pointer.emitter.on('pointerdown', _this.onPointerDown);
            pointer.emitter.on('pointermove', _this.onPointerMove);
            pointer.emitter.on('pointerup', _this.onPointerUp);
            _this.mirror = new ElementMirror();
            _this.autoScroller = new AutoScroller();
            return _this;
        }
        FeaturefulElementDragging.prototype.destroy = function () {
            this.pointer.destroy();
        };
        FeaturefulElementDragging.prototype.startDelay = function (ev) {
            var _this = this;
            if (typeof this.delay === 'number') {
                this.delayTimeoutId = setTimeout(function () {
                    _this.delayTimeoutId = null;
                    _this.handleDelayEnd(ev);
                }, this.delay); // not assignable to number!
            }
            else {
                this.handleDelayEnd(ev);
            }
        };
        FeaturefulElementDragging.prototype.handleDelayEnd = function (ev) {
            this.isDelayEnded = true;
            this.tryStartDrag(ev);
        };
        FeaturefulElementDragging.prototype.handleDistanceSurpassed = function (ev) {
            this.isDistanceSurpassed = true;
            this.tryStartDrag(ev);
        };
        FeaturefulElementDragging.prototype.tryStartDrag = function (ev) {
            if (this.isDelayEnded && this.isDistanceSurpassed) {
                if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
                    this.isDragging = true;
                    this.mirrorNeedsRevert = false;
                    this.autoScroller.start(ev.pageX, ev.pageY);
                    this.emitter.trigger('dragstart', ev);
                    if (this.touchScrollAllowed === false) {
                        this.pointer.cancelTouchScroll();
                    }
                }
            }
        };
        FeaturefulElementDragging.prototype.tryStopDrag = function (ev) {
            // .stop() is ALWAYS asynchronous, which we NEED because we want all pointerup events
            // that come from the document to fire beforehand. much more convenient this way.
            this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, ev) // bound with args
            );
        };
        FeaturefulElementDragging.prototype.stopDrag = function (ev) {
            this.isDragging = false;
            this.emitter.trigger('dragend', ev);
        };
        // fill in the implementations...
        FeaturefulElementDragging.prototype.setIgnoreMove = function (bool) {
            this.pointer.shouldIgnoreMove = bool;
        };
        FeaturefulElementDragging.prototype.setMirrorIsVisible = function (bool) {
            this.mirror.setIsVisible(bool);
        };
        FeaturefulElementDragging.prototype.setMirrorNeedsRevert = function (bool) {
            this.mirrorNeedsRevert = bool;
        };
        FeaturefulElementDragging.prototype.setAutoScrollEnabled = function (bool) {
            this.autoScroller.isEnabled = bool;
        };
        return FeaturefulElementDragging;
    }(core.ElementDragging));

    /*
    When this class is instantiated, it records the offset of an element (relative to the document topleft),
    and continues to monitor scrolling, updating the cached coordinates if it needs to.
    Does not access the DOM after instantiation, so highly performant.

    Also keeps track of all scrolling/overflow:hidden containers that are parents of the given element
    and an determine if a given point is inside the combined clipping rectangle.
    */
    var OffsetTracker = /** @class */ (function () {
        function OffsetTracker(el) {
            this.origRect = core.computeRect(el);
            // will work fine for divs that have overflow:hidden
            this.scrollCaches = core.getClippingParents(el).map(function (el) {
                return new ElementScrollGeomCache(el, true); // listen=true
            });
        }
        OffsetTracker.prototype.destroy = function () {
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                scrollCache.destroy();
            }
        };
        OffsetTracker.prototype.computeLeft = function () {
            var left = this.origRect.left;
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                left += scrollCache.origScrollLeft - scrollCache.getScrollLeft();
            }
            return left;
        };
        OffsetTracker.prototype.computeTop = function () {
            var top = this.origRect.top;
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                top += scrollCache.origScrollTop - scrollCache.getScrollTop();
            }
            return top;
        };
        OffsetTracker.prototype.isWithinClipping = function (pageX, pageY) {
            var point = { left: pageX, top: pageY };
            for (var _i = 0, _a = this.scrollCaches; _i < _a.length; _i++) {
                var scrollCache = _a[_i];
                if (!isIgnoredClipping(scrollCache.getEventTarget()) &&
                    !core.pointInsideRect(point, scrollCache.clientRect)) {
                    return false;
                }
            }
            return true;
        };
        return OffsetTracker;
    }());
    // certain clipping containers should never constrain interactions, like <html> and <body>
    // https://github.com/fullcalendar/fullcalendar/issues/3615
    function isIgnoredClipping(node) {
        var tagName = node.tagName;
        return tagName === 'HTML' || tagName === 'BODY';
    }

    /*
    Tracks movement over multiple droppable areas (aka "hits")
    that exist in one or more DateComponents.
    Relies on an existing draggable.

    emits:
    - pointerdown
    - dragstart
    - hitchange - fires initially, even if not over a hit
    - pointerup
    - (hitchange - again, to null, if ended over a hit)
    - dragend
    */
    var HitDragging = /** @class */ (function () {
        function HitDragging(dragging, droppableStore) {
            var _this = this;
            // options that can be set by caller
            this.useSubjectCenter = false;
            this.requireInitial = true; // if doesn't start out on a hit, won't emit any events
            this.initialHit = null;
            this.movingHit = null;
            this.finalHit = null; // won't ever be populated if shouldIgnoreMove
            this.handlePointerDown = function (ev) {
                var dragging = _this.dragging;
                _this.initialHit = null;
                _this.movingHit = null;
                _this.finalHit = null;
                _this.prepareHits();
                _this.processFirstCoord(ev);
                if (_this.initialHit || !_this.requireInitial) {
                    dragging.setIgnoreMove(false);
                    _this.emitter.trigger('pointerdown', ev); // TODO: fire this before computing processFirstCoord, so listeners can cancel. this gets fired by almost every handler :(
                }
                else {
                    dragging.setIgnoreMove(true);
                }
            };
            this.handleDragStart = function (ev) {
                _this.emitter.trigger('dragstart', ev);
                _this.handleMove(ev, true); // force = fire even if initially null
            };
            this.handleDragMove = function (ev) {
                _this.emitter.trigger('dragmove', ev);
                _this.handleMove(ev);
            };
            this.handlePointerUp = function (ev) {
                _this.releaseHits();
                _this.emitter.trigger('pointerup', ev);
            };
            this.handleDragEnd = function (ev) {
                if (_this.movingHit) {
                    _this.emitter.trigger('hitupdate', null, true, ev);
                }
                _this.finalHit = _this.movingHit;
                _this.movingHit = null;
                _this.emitter.trigger('dragend', ev);
            };
            this.droppableStore = droppableStore;
            dragging.emitter.on('pointerdown', this.handlePointerDown);
            dragging.emitter.on('dragstart', this.handleDragStart);
            dragging.emitter.on('dragmove', this.handleDragMove);
            dragging.emitter.on('pointerup', this.handlePointerUp);
            dragging.emitter.on('dragend', this.handleDragEnd);
            this.dragging = dragging;
            this.emitter = new core.EmitterMixin();
        }
        // sets initialHit
        // sets coordAdjust
        HitDragging.prototype.processFirstCoord = function (ev) {
            var origPoint = { left: ev.pageX, top: ev.pageY };
            var adjustedPoint = origPoint;
            var subjectEl = ev.subjectEl;
            var subjectRect;
            if (subjectEl !== document) {
                subjectRect = core.computeRect(subjectEl);
                adjustedPoint = core.constrainPoint(adjustedPoint, subjectRect);
            }
            var initialHit = this.initialHit = this.queryHitForOffset(adjustedPoint.left, adjustedPoint.top);
            if (initialHit) {
                if (this.useSubjectCenter && subjectRect) {
                    var slicedSubjectRect = core.intersectRects(subjectRect, initialHit.rect);
                    if (slicedSubjectRect) {
                        adjustedPoint = core.getRectCenter(slicedSubjectRect);
                    }
                }
                this.coordAdjust = core.diffPoints(adjustedPoint, origPoint);
            }
            else {
                this.coordAdjust = { left: 0, top: 0 };
            }
        };
        HitDragging.prototype.handleMove = function (ev, forceHandle) {
            var hit = this.queryHitForOffset(ev.pageX + this.coordAdjust.left, ev.pageY + this.coordAdjust.top);
            if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
                this.movingHit = hit;
                this.emitter.trigger('hitupdate', hit, false, ev);
            }
        };
        HitDragging.prototype.prepareHits = function () {
            this.offsetTrackers = core.mapHash(this.droppableStore, function (interactionSettings) {
                interactionSettings.component.buildPositionCaches();
                return new OffsetTracker(interactionSettings.el);
            });
        };
        HitDragging.prototype.releaseHits = function () {
            var offsetTrackers = this.offsetTrackers;
            for (var id in offsetTrackers) {
                offsetTrackers[id].destroy();
            }
            this.offsetTrackers = {};
        };
        HitDragging.prototype.queryHitForOffset = function (offsetLeft, offsetTop) {
            var _a = this, droppableStore = _a.droppableStore, offsetTrackers = _a.offsetTrackers;
            var bestHit = null;
            for (var id in droppableStore) {
                var component = droppableStore[id].component;
                var offsetTracker = offsetTrackers[id];
                if (offsetTracker.isWithinClipping(offsetLeft, offsetTop)) {
                    var originLeft = offsetTracker.computeLeft();
                    var originTop = offsetTracker.computeTop();
                    var positionLeft = offsetLeft - originLeft;
                    var positionTop = offsetTop - originTop;
                    var origRect = offsetTracker.origRect;
                    var width = origRect.right - origRect.left;
                    var height = origRect.bottom - origRect.top;
                    if (
                    // must be within the element's bounds
                    positionLeft >= 0 && positionLeft < width &&
                        positionTop >= 0 && positionTop < height) {
                        var hit = component.queryHit(positionLeft, positionTop, width, height);
                        if (hit &&
                            (
                            // make sure the hit is within activeRange, meaning it's not a deal cell
                            !component.props.dateProfile || // hack for DayTile
                                core.rangeContainsRange(component.props.dateProfile.activeRange, hit.dateSpan.range)) &&
                            (!bestHit || hit.layer > bestHit.layer)) {
                            // TODO: better way to re-orient rectangle
                            hit.rect.left += originLeft;
                            hit.rect.right += originLeft;
                            hit.rect.top += originTop;
                            hit.rect.bottom += originTop;
                            bestHit = hit;
                        }
                    }
                }
            }
            return bestHit;
        };
        return HitDragging;
    }());
    function isHitsEqual(hit0, hit1) {
        if (!hit0 && !hit1) {
            return true;
        }
        if (Boolean(hit0) !== Boolean(hit1)) {
            return false;
        }
        return core.isDateSpansEqual(hit0.dateSpan, hit1.dateSpan);
    }

    /*
    Monitors when the user clicks on a specific date/time of a component.
    A pointerdown+pointerup on the same "hit" constitutes a click.
    */
    var DateClicking = /** @class */ (function (_super) {
        __extends(DateClicking, _super);
        function DateClicking(settings) {
            var _this = _super.call(this, settings) || this;
            _this.handlePointerDown = function (ev) {
                var dragging = _this.dragging;
                // do this in pointerdown (not dragend) because DOM might be mutated by the time dragend is fired
                dragging.setIgnoreMove(!_this.component.isValidDateDownEl(dragging.pointer.downEl));
            };
            // won't even fire if moving was ignored
            _this.handleDragEnd = function (ev) {
                var component = _this.component;
                var _a = component.context, calendar = _a.calendar, view = _a.view;
                var pointer = _this.dragging.pointer;
                if (!pointer.wasTouchScroll) {
                    var _b = _this.hitDragging, initialHit = _b.initialHit, finalHit = _b.finalHit;
                    if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
                        calendar.triggerDateClick(initialHit.dateSpan, initialHit.dayEl, view, ev.origEvent);
                    }
                }
            };
            var component = settings.component;
            // we DO want to watch pointer moves because otherwise finalHit won't get populated
            _this.dragging = new FeaturefulElementDragging(component.el);
            _this.dragging.autoScroller.isEnabled = false;
            var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, core.interactionSettingsToStore(settings));
            hitDragging.emitter.on('pointerdown', _this.handlePointerDown);
            hitDragging.emitter.on('dragend', _this.handleDragEnd);
            return _this;
        }
        DateClicking.prototype.destroy = function () {
            this.dragging.destroy();
        };
        return DateClicking;
    }(core.Interaction));

    /*
    Tracks when the user selects a portion of time of a component,
    constituted by a drag over date cells, with a possible delay at the beginning of the drag.
    */
    var DateSelecting = /** @class */ (function (_super) {
        __extends(DateSelecting, _super);
        function DateSelecting(settings) {
            var _this = _super.call(this, settings) || this;
            _this.dragSelection = null;
            _this.handlePointerDown = function (ev) {
                var _a = _this, component = _a.component, dragging = _a.dragging;
                var options = component.context.options;
                var canSelect = options.selectable &&
                    component.isValidDateDownEl(ev.origEvent.target);
                // don't bother to watch expensive moves if component won't do selection
                dragging.setIgnoreMove(!canSelect);
                // if touch, require user to hold down
                dragging.delay = ev.isTouch ? getComponentTouchDelay(component) : null;
            };
            _this.handleDragStart = function (ev) {
                _this.component.context.calendar.unselect(ev); // unselect previous selections
            };
            _this.handleHitUpdate = function (hit, isFinal) {
                var calendar = _this.component.context.calendar;
                var dragSelection = null;
                var isInvalid = false;
                if (hit) {
                    dragSelection = joinHitsIntoSelection(_this.hitDragging.initialHit, hit, calendar.pluginSystem.hooks.dateSelectionTransformers);
                    if (!dragSelection || !_this.component.isDateSelectionValid(dragSelection)) {
                        isInvalid = true;
                        dragSelection = null;
                    }
                }
                if (dragSelection) {
                    calendar.dispatch({ type: 'SELECT_DATES', selection: dragSelection });
                }
                else if (!isFinal) { // only unselect if moved away while dragging
                    calendar.dispatch({ type: 'UNSELECT_DATES' });
                }
                if (!isInvalid) {
                    core.enableCursor();
                }
                else {
                    core.disableCursor();
                }
                if (!isFinal) {
                    _this.dragSelection = dragSelection; // only clear if moved away from all hits while dragging
                }
            };
            _this.handlePointerUp = function (pev) {
                if (_this.dragSelection) {
                    // selection is already rendered, so just need to report selection
                    _this.component.context.calendar.triggerDateSelect(_this.dragSelection, pev);
                    _this.dragSelection = null;
                }
            };
            var component = settings.component;
            var options = component.context.options;
            var dragging = _this.dragging = new FeaturefulElementDragging(component.el);
            dragging.touchScrollAllowed = false;
            dragging.minDistance = options.selectMinDistance || 0;
            dragging.autoScroller.isEnabled = options.dragScroll;
            var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, core.interactionSettingsToStore(settings));
            hitDragging.emitter.on('pointerdown', _this.handlePointerDown);
            hitDragging.emitter.on('dragstart', _this.handleDragStart);
            hitDragging.emitter.on('hitupdate', _this.handleHitUpdate);
            hitDragging.emitter.on('pointerup', _this.handlePointerUp);
            return _this;
        }
        DateSelecting.prototype.destroy = function () {
            this.dragging.destroy();
        };
        return DateSelecting;
    }(core.Interaction));
    function getComponentTouchDelay(component) {
        var options = component.context.options;
        var delay = options.selectLongPressDelay;
        if (delay == null) {
            delay = options.longPressDelay;
        }
        return delay;
    }
    function joinHitsIntoSelection(hit0, hit1, dateSelectionTransformers) {
        var dateSpan0 = hit0.dateSpan;
        var dateSpan1 = hit1.dateSpan;
        var ms = [
            dateSpan0.range.start,
            dateSpan0.range.end,
            dateSpan1.range.start,
            dateSpan1.range.end
        ];
        ms.sort(core.compareNumbers);
        var props = {};
        for (var _i = 0, dateSelectionTransformers_1 = dateSelectionTransformers; _i < dateSelectionTransformers_1.length; _i++) {
            var transformer = dateSelectionTransformers_1[_i];
            var res = transformer(hit0, hit1);
            if (res === false) {
                return null;
            }
            else if (res) {
                __assign(props, res);
            }
        }
        props.range = { start: ms[0], end: ms[3] };
        props.allDay = dateSpan0.allDay;
        return props;
    }

    var EventDragging = /** @class */ (function (_super) {
        __extends(EventDragging, _super);
        function EventDragging(settings) {
            var _this = _super.call(this, settings) || this;
            // internal state
            _this.subjectSeg = null; // the seg being selected/dragged
            _this.isDragging = false;
            _this.eventRange = null;
            _this.relevantEvents = null; // the events being dragged
            _this.receivingCalendar = null;
            _this.validMutation = null;
            _this.mutatedRelevantEvents = null;
            _this.handlePointerDown = function (ev) {
                var origTarget = ev.origEvent.target;
                var _a = _this, component = _a.component, dragging = _a.dragging;
                var mirror = dragging.mirror;
                var options = component.context.options;
                var initialCalendar = component.context.calendar;
                var subjectSeg = _this.subjectSeg = core.getElSeg(ev.subjectEl);
                var eventRange = _this.eventRange = subjectSeg.eventRange;
                var eventInstanceId = eventRange.instance.instanceId;
                _this.relevantEvents = core.getRelevantEvents(initialCalendar.state.eventStore, eventInstanceId);
                dragging.minDistance = ev.isTouch ? 0 : options.eventDragMinDistance;
                dragging.delay =
                    // only do a touch delay if touch and this event hasn't been selected yet
                    (ev.isTouch && eventInstanceId !== component.props.eventSelection) ?
                        getComponentTouchDelay$1(component) :
                        null;
                mirror.parentNode = initialCalendar.el;
                mirror.revertDuration = options.dragRevertDuration;
                var isValid = component.isValidSegDownEl(origTarget) &&
                    !core.elementClosest(origTarget, '.fc-resizer'); // NOT on a resizer
                dragging.setIgnoreMove(!isValid);
                // disable dragging for elements that are resizable (ie, selectable)
                // but are not draggable
                _this.isDragging = isValid &&
                    ev.subjectEl.classList.contains('fc-draggable');
            };
            _this.handleDragStart = function (ev) {
                var context = _this.component.context;
                var initialCalendar = context.calendar;
                var eventRange = _this.eventRange;
                var eventInstanceId = eventRange.instance.instanceId;
                if (ev.isTouch) {
                    // need to select a different event?
                    if (eventInstanceId !== _this.component.props.eventSelection) {
                        initialCalendar.dispatch({ type: 'SELECT_EVENT', eventInstanceId: eventInstanceId });
                    }
                }
                else {
                    // if now using mouse, but was previous touch interaction, clear selected event
                    initialCalendar.dispatch({ type: 'UNSELECT_EVENT' });
                }
                if (_this.isDragging) {
                    initialCalendar.unselect(ev); // unselect *date* selection
                    initialCalendar.publiclyTrigger('eventDragStart', [
                        {
                            el: _this.subjectSeg.el,
                            event: new core.EventApi(initialCalendar, eventRange.def, eventRange.instance),
                            jsEvent: ev.origEvent,
                            view: context.view
                        }
                    ]);
                }
            };
            _this.handleHitUpdate = function (hit, isFinal) {
                if (!_this.isDragging) {
                    return;
                }
                var relevantEvents = _this.relevantEvents;
                var initialHit = _this.hitDragging.initialHit;
                var initialCalendar = _this.component.context.calendar;
                // states based on new hit
                var receivingCalendar = null;
                var mutation = null;
                var mutatedRelevantEvents = null;
                var isInvalid = false;
                var interaction = {
                    affectedEvents: relevantEvents,
                    mutatedEvents: core.createEmptyEventStore(),
                    isEvent: true,
                    origSeg: _this.subjectSeg
                };
                if (hit) {
                    var receivingComponent = hit.component;
                    receivingCalendar = receivingComponent.context.calendar;
                    var receivingOptions = receivingComponent.context.options;
                    if (initialCalendar === receivingCalendar ||
                        receivingOptions.editable && receivingOptions.droppable) {
                        mutation = computeEventMutation(initialHit, hit, receivingCalendar.pluginSystem.hooks.eventDragMutationMassagers);
                        if (mutation) {
                            mutatedRelevantEvents = core.applyMutationToEventStore(relevantEvents, receivingCalendar.eventUiBases, mutation, receivingCalendar);
                            interaction.mutatedEvents = mutatedRelevantEvents;
                            if (!receivingComponent.isInteractionValid(interaction)) {
                                isInvalid = true;
                                mutation = null;
                                mutatedRelevantEvents = null;
                                interaction.mutatedEvents = core.createEmptyEventStore();
                            }
                        }
                    }
                    else {
                        receivingCalendar = null;
                    }
                }
                _this.displayDrag(receivingCalendar, interaction);
                if (!isInvalid) {
                    core.enableCursor();
                }
                else {
                    core.disableCursor();
                }
                if (!isFinal) {
                    if (initialCalendar === receivingCalendar && // TODO: write test for this
                        isHitsEqual(initialHit, hit)) {
                        mutation = null;
                    }
                    _this.dragging.setMirrorNeedsRevert(!mutation);
                    // render the mirror if no already-rendered mirror
                    // TODO: wish we could somehow wait for dispatch to guarantee render
                    _this.dragging.setMirrorIsVisible(!hit || !document.querySelector('.fc-mirror'));
                    // assign states based on new hit
                    _this.receivingCalendar = receivingCalendar;
                    _this.validMutation = mutation;
                    _this.mutatedRelevantEvents = mutatedRelevantEvents;
                }
            };
            _this.handlePointerUp = function () {
                if (!_this.isDragging) {
                    _this.cleanup(); // because handleDragEnd won't fire
                }
            };
            _this.handleDragEnd = function (ev) {
                if (_this.isDragging) {
                    var context = _this.component.context;
                    var initialCalendar_1 = context.calendar;
                    var initialView = context.view;
                    var _a = _this, receivingCalendar = _a.receivingCalendar, validMutation = _a.validMutation;
                    var eventDef = _this.eventRange.def;
                    var eventInstance = _this.eventRange.instance;
                    var eventApi = new core.EventApi(initialCalendar_1, eventDef, eventInstance);
                    var relevantEvents_1 = _this.relevantEvents;
                    var mutatedRelevantEvents = _this.mutatedRelevantEvents;
                    var finalHit = _this.hitDragging.finalHit;
                    _this.clearDrag(); // must happen after revert animation
                    initialCalendar_1.publiclyTrigger('eventDragStop', [
                        {
                            el: _this.subjectSeg.el,
                            event: eventApi,
                            jsEvent: ev.origEvent,
                            view: initialView
                        }
                    ]);
                    if (validMutation) {
                        // dropped within same calendar
                        if (receivingCalendar === initialCalendar_1) {
                            initialCalendar_1.dispatch({
                                type: 'MERGE_EVENTS',
                                eventStore: mutatedRelevantEvents
                            });
                            var transformed = {};
                            for (var _i = 0, _b = initialCalendar_1.pluginSystem.hooks.eventDropTransformers; _i < _b.length; _i++) {
                                var transformer = _b[_i];
                                __assign(transformed, transformer(validMutation, initialCalendar_1));
                            }
                            var eventDropArg = __assign({}, transformed, { el: ev.subjectEl, delta: validMutation.datesDelta, oldEvent: eventApi, event: new core.EventApi(// the data AFTER the mutation
                                initialCalendar_1, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null), revert: function () {
                                    initialCalendar_1.dispatch({
                                        type: 'MERGE_EVENTS',
                                        eventStore: relevantEvents_1
                                    });
                                }, jsEvent: ev.origEvent, view: initialView });
                            initialCalendar_1.publiclyTrigger('eventDrop', [eventDropArg]);
                            // dropped in different calendar
                        }
                        else if (receivingCalendar) {
                            initialCalendar_1.publiclyTrigger('eventLeave', [
                                {
                                    draggedEl: ev.subjectEl,
                                    event: eventApi,
                                    view: initialView
                                }
                            ]);
                            initialCalendar_1.dispatch({
                                type: 'REMOVE_EVENT_INSTANCES',
                                instances: _this.mutatedRelevantEvents.instances
                            });
                            receivingCalendar.dispatch({
                                type: 'MERGE_EVENTS',
                                eventStore: _this.mutatedRelevantEvents
                            });
                            if (ev.isTouch) {
                                receivingCalendar.dispatch({
                                    type: 'SELECT_EVENT',
                                    eventInstanceId: eventInstance.instanceId
                                });
                            }
                            var dropArg = __assign({}, receivingCalendar.buildDatePointApi(finalHit.dateSpan), { draggedEl: ev.subjectEl, jsEvent: ev.origEvent, view: finalHit.component // should this be finalHit.component.view? See #4644
                             });
                            receivingCalendar.publiclyTrigger('drop', [dropArg]);
                            receivingCalendar.publiclyTrigger('eventReceive', [
                                {
                                    draggedEl: ev.subjectEl,
                                    event: new core.EventApi(// the data AFTER the mutation
                                    receivingCalendar, mutatedRelevantEvents.defs[eventDef.defId], mutatedRelevantEvents.instances[eventInstance.instanceId]),
                                    view: finalHit.component // should this be finalHit.component.view? See #4644
                                }
                            ]);
                        }
                    }
                    else {
                        initialCalendar_1.publiclyTrigger('_noEventDrop');
                    }
                }
                _this.cleanup();
            };
            var component = _this.component;
            var options = component.context.options;
            var dragging = _this.dragging = new FeaturefulElementDragging(component.el);
            dragging.pointer.selector = EventDragging.SELECTOR;
            dragging.touchScrollAllowed = false;
            dragging.autoScroller.isEnabled = options.dragScroll;
            var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, core.interactionSettingsStore);
            hitDragging.useSubjectCenter = settings.useEventCenter;
            hitDragging.emitter.on('pointerdown', _this.handlePointerDown);
            hitDragging.emitter.on('dragstart', _this.handleDragStart);
            hitDragging.emitter.on('hitupdate', _this.handleHitUpdate);
            hitDragging.emitter.on('pointerup', _this.handlePointerUp);
            hitDragging.emitter.on('dragend', _this.handleDragEnd);
            return _this;
        }
        EventDragging.prototype.destroy = function () {
            this.dragging.destroy();
        };
        // render a drag state on the next receivingCalendar
        EventDragging.prototype.displayDrag = function (nextCalendar, state) {
            var initialCalendar = this.component.context.calendar;
            var prevCalendar = this.receivingCalendar;
            // does the previous calendar need to be cleared?
            if (prevCalendar && prevCalendar !== nextCalendar) {
                // does the initial calendar need to be cleared?
                // if so, don't clear all the way. we still need to to hide the affectedEvents
                if (prevCalendar === initialCalendar) {
                    prevCalendar.dispatch({
                        type: 'SET_EVENT_DRAG',
                        state: {
                            affectedEvents: state.affectedEvents,
                            mutatedEvents: core.createEmptyEventStore(),
                            isEvent: true,
                            origSeg: state.origSeg
                        }
                    });
                    // completely clear the old calendar if it wasn't the initial
                }
                else {
                    prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
                }
            }
            if (nextCalendar) {
                nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state: state });
            }
        };
        EventDragging.prototype.clearDrag = function () {
            var initialCalendar = this.component.context.calendar;
            var receivingCalendar = this.receivingCalendar;
            if (receivingCalendar) {
                receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
            }
            // the initial calendar might have an dummy drag state from displayDrag
            if (initialCalendar !== receivingCalendar) {
                initialCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
            }
        };
        EventDragging.prototype.cleanup = function () {
            this.subjectSeg = null;
            this.isDragging = false;
            this.eventRange = null;
            this.relevantEvents = null;
            this.receivingCalendar = null;
            this.validMutation = null;
            this.mutatedRelevantEvents = null;
        };
        EventDragging.SELECTOR = '.fc-draggable, .fc-resizable'; // TODO: test this in IE11
        return EventDragging;
    }(core.Interaction));
    function computeEventMutation(hit0, hit1, massagers) {
        var dateSpan0 = hit0.dateSpan;
        var dateSpan1 = hit1.dateSpan;
        var date0 = dateSpan0.range.start;
        var date1 = dateSpan1.range.start;
        var standardProps = {};
        if (dateSpan0.allDay !== dateSpan1.allDay) {
            standardProps.allDay = dateSpan1.allDay;
            standardProps.hasEnd = hit1.component.context.options.allDayMaintainDuration;
            if (dateSpan1.allDay) {
                // means date1 is already start-of-day,
                // but date0 needs to be converted
                date0 = core.startOfDay(date0);
            }
        }
        var delta = core.diffDates(date0, date1, hit0.component.context.dateEnv, hit0.component === hit1.component ?
            hit0.component.largeUnit :
            null);
        if (delta.milliseconds) { // has hours/minutes/seconds
            standardProps.allDay = false;
        }
        var mutation = {
            datesDelta: delta,
            standardProps: standardProps
        };
        for (var _i = 0, massagers_1 = massagers; _i < massagers_1.length; _i++) {
            var massager = massagers_1[_i];
            massager(mutation, hit0, hit1);
        }
        return mutation;
    }
    function getComponentTouchDelay$1(component) {
        var options = component.context.options;
        var delay = options.eventLongPressDelay;
        if (delay == null) {
            delay = options.longPressDelay;
        }
        return delay;
    }

    var EventDragging$1 = /** @class */ (function (_super) {
        __extends(EventDragging, _super);
        function EventDragging(settings) {
            var _this = _super.call(this, settings) || this;
            // internal state
            _this.draggingSeg = null; // TODO: rename to resizingSeg? subjectSeg?
            _this.eventRange = null;
            _this.relevantEvents = null;
            _this.validMutation = null;
            _this.mutatedRelevantEvents = null;
            _this.handlePointerDown = function (ev) {
                var component = _this.component;
                var seg = _this.querySeg(ev);
                var eventRange = _this.eventRange = seg.eventRange;
                _this.dragging.minDistance = component.context.options.eventDragMinDistance;
                // if touch, need to be working with a selected event
                _this.dragging.setIgnoreMove(!_this.component.isValidSegDownEl(ev.origEvent.target) ||
                    (ev.isTouch && _this.component.props.eventSelection !== eventRange.instance.instanceId));
            };
            _this.handleDragStart = function (ev) {
                var _a = _this.component.context, calendar = _a.calendar, view = _a.view;
                var eventRange = _this.eventRange;
                _this.relevantEvents = core.getRelevantEvents(calendar.state.eventStore, _this.eventRange.instance.instanceId);
                _this.draggingSeg = _this.querySeg(ev);
                calendar.unselect();
                calendar.publiclyTrigger('eventResizeStart', [
                    {
                        el: _this.draggingSeg.el,
                        event: new core.EventApi(calendar, eventRange.def, eventRange.instance),
                        jsEvent: ev.origEvent,
                        view: view
                    }
                ]);
            };
            _this.handleHitUpdate = function (hit, isFinal, ev) {
                var calendar = _this.component.context.calendar;
                var relevantEvents = _this.relevantEvents;
                var initialHit = _this.hitDragging.initialHit;
                var eventInstance = _this.eventRange.instance;
                var mutation = null;
                var mutatedRelevantEvents = null;
                var isInvalid = false;
                var interaction = {
                    affectedEvents: relevantEvents,
                    mutatedEvents: core.createEmptyEventStore(),
                    isEvent: true,
                    origSeg: _this.draggingSeg
                };
                if (hit) {
                    mutation = computeMutation(initialHit, hit, ev.subjectEl.classList.contains('fc-start-resizer'), eventInstance.range, calendar.pluginSystem.hooks.eventResizeJoinTransforms);
                }
                if (mutation) {
                    mutatedRelevantEvents = core.applyMutationToEventStore(relevantEvents, calendar.eventUiBases, mutation, calendar);
                    interaction.mutatedEvents = mutatedRelevantEvents;
                    if (!_this.component.isInteractionValid(interaction)) {
                        isInvalid = true;
                        mutation = null;
                        mutatedRelevantEvents = null;
                        interaction.mutatedEvents = null;
                    }
                }
                if (mutatedRelevantEvents) {
                    calendar.dispatch({
                        type: 'SET_EVENT_RESIZE',
                        state: interaction
                    });
                }
                else {
                    calendar.dispatch({ type: 'UNSET_EVENT_RESIZE' });
                }
                if (!isInvalid) {
                    core.enableCursor();
                }
                else {
                    core.disableCursor();
                }
                if (!isFinal) {
                    if (mutation && isHitsEqual(initialHit, hit)) {
                        mutation = null;
                    }
                    _this.validMutation = mutation;
                    _this.mutatedRelevantEvents = mutatedRelevantEvents;
                }
            };
            _this.handleDragEnd = function (ev) {
                var _a = _this.component.context, calendar = _a.calendar, view = _a.view;
                var eventDef = _this.eventRange.def;
                var eventInstance = _this.eventRange.instance;
                var eventApi = new core.EventApi(calendar, eventDef, eventInstance);
                var relevantEvents = _this.relevantEvents;
                var mutatedRelevantEvents = _this.mutatedRelevantEvents;
                calendar.publiclyTrigger('eventResizeStop', [
                    {
                        el: _this.draggingSeg.el,
                        event: eventApi,
                        jsEvent: ev.origEvent,
                        view: view
                    }
                ]);
                if (_this.validMutation) {
                    calendar.dispatch({
                        type: 'MERGE_EVENTS',
                        eventStore: mutatedRelevantEvents
                    });
                    calendar.publiclyTrigger('eventResize', [
                        {
                            el: _this.draggingSeg.el,
                            startDelta: _this.validMutation.startDelta || core.createDuration(0),
                            endDelta: _this.validMutation.endDelta || core.createDuration(0),
                            prevEvent: eventApi,
                            event: new core.EventApi(// the data AFTER the mutation
                            calendar, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null),
                            revert: function () {
                                calendar.dispatch({
                                    type: 'MERGE_EVENTS',
                                    eventStore: relevantEvents
                                });
                            },
                            jsEvent: ev.origEvent,
                            view: view
                        }
                    ]);
                }
                else {
                    calendar.publiclyTrigger('_noEventResize');
                }
                // reset all internal state
                _this.draggingSeg = null;
                _this.relevantEvents = null;
                _this.validMutation = null;
                // okay to keep eventInstance around. useful to set it in handlePointerDown
            };
            var component = settings.component;
            var dragging = _this.dragging = new FeaturefulElementDragging(component.el);
            dragging.pointer.selector = '.fc-resizer';
            dragging.touchScrollAllowed = false;
            dragging.autoScroller.isEnabled = component.context.options.dragScroll;
            var hitDragging = _this.hitDragging = new HitDragging(_this.dragging, core.interactionSettingsToStore(settings));
            hitDragging.emitter.on('pointerdown', _this.handlePointerDown);
            hitDragging.emitter.on('dragstart', _this.handleDragStart);
            hitDragging.emitter.on('hitupdate', _this.handleHitUpdate);
            hitDragging.emitter.on('dragend', _this.handleDragEnd);
            return _this;
        }
        EventDragging.prototype.destroy = function () {
            this.dragging.destroy();
        };
        EventDragging.prototype.querySeg = function (ev) {
            return core.getElSeg(core.elementClosest(ev.subjectEl, this.component.fgSegSelector));
        };
        return EventDragging;
    }(core.Interaction));
    function computeMutation(hit0, hit1, isFromStart, instanceRange, transforms) {
        var dateEnv = hit0.component.context.dateEnv;
        var date0 = hit0.dateSpan.range.start;
        var date1 = hit1.dateSpan.range.start;
        var delta = core.diffDates(date0, date1, dateEnv, hit0.component.largeUnit);
        var props = {};
        for (var _i = 0, transforms_1 = transforms; _i < transforms_1.length; _i++) {
            var transform = transforms_1[_i];
            var res = transform(hit0, hit1);
            if (res === false) {
                return null;
            }
            else if (res) {
                __assign(props, res);
            }
        }
        if (isFromStart) {
            if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) {
                props.startDelta = delta;
                return props;
            }
        }
        else {
            if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) {
                props.endDelta = delta;
                return props;
            }
        }
        return null;
    }

    var UnselectAuto = /** @class */ (function () {
        function UnselectAuto(calendar) {
            var _this = this;
            this.isRecentPointerDateSelect = false; // wish we could use a selector to detect date selection, but uses hit system
            this.onSelect = function (selectInfo) {
                if (selectInfo.jsEvent) {
                    _this.isRecentPointerDateSelect = true;
                }
            };
            this.onDocumentPointerUp = function (pev) {
                var _a = _this, calendar = _a.calendar, documentPointer = _a.documentPointer;
                var state = calendar.state;
                // touch-scrolling should never unfocus any type of selection
                if (!documentPointer.wasTouchScroll) {
                    if (state.dateSelection && // an existing date selection?
                        !_this.isRecentPointerDateSelect // a new pointer-initiated date selection since last onDocumentPointerUp?
                    ) {
                        var unselectAuto = calendar.viewOpt('unselectAuto');
                        var unselectCancel = calendar.viewOpt('unselectCancel');
                        if (unselectAuto && (!unselectAuto || !core.elementClosest(documentPointer.downEl, unselectCancel))) {
                            calendar.unselect(pev);
                        }
                    }
                    if (state.eventSelection && // an existing event selected?
                        !core.elementClosest(documentPointer.downEl, EventDragging.SELECTOR) // interaction DIDN'T start on an event
                    ) {
                        calendar.dispatch({ type: 'UNSELECT_EVENT' });
                    }
                }
                _this.isRecentPointerDateSelect = false;
            };
            this.calendar = calendar;
            var documentPointer = this.documentPointer = new PointerDragging(document);
            documentPointer.shouldIgnoreMove = true;
            documentPointer.shouldWatchScroll = false;
            documentPointer.emitter.on('pointerup', this.onDocumentPointerUp);
            /*
            TODO: better way to know about whether there was a selection with the pointer
            */
            calendar.on('select', this.onSelect);
        }
        UnselectAuto.prototype.destroy = function () {
            this.calendar.off('select', this.onSelect);
            this.documentPointer.destroy();
        };
        return UnselectAuto;
    }());

    /*
    Given an already instantiated draggable object for one-or-more elements,
    Interprets any dragging as an attempt to drag an events that lives outside
    of a calendar onto a calendar.
    */
    var ExternalElementDragging = /** @class */ (function () {
        function ExternalElementDragging(dragging, suppliedDragMeta) {
            var _this = this;
            this.receivingCalendar = null;
            this.droppableEvent = null; // will exist for all drags, even if create:false
            this.suppliedDragMeta = null;
            this.dragMeta = null;
            this.handleDragStart = function (ev) {
                _this.dragMeta = _this.buildDragMeta(ev.subjectEl);
            };
            this.handleHitUpdate = function (hit, isFinal, ev) {
                var dragging = _this.hitDragging.dragging;
                var receivingCalendar = null;
                var droppableEvent = null;
                var isInvalid = false;
                var interaction = {
                    affectedEvents: core.createEmptyEventStore(),
                    mutatedEvents: core.createEmptyEventStore(),
                    isEvent: _this.dragMeta.create,
                    origSeg: null
                };
                if (hit) {
                    receivingCalendar = hit.component.context.calendar;
                    if (_this.canDropElOnCalendar(ev.subjectEl, receivingCalendar)) {
                        droppableEvent = computeEventForDateSpan(hit.dateSpan, _this.dragMeta, receivingCalendar);
                        interaction.mutatedEvents = core.eventTupleToStore(droppableEvent);
                        isInvalid = !core.isInteractionValid(interaction, receivingCalendar);
                        if (isInvalid) {
                            interaction.mutatedEvents = core.createEmptyEventStore();
                            droppableEvent = null;
                        }
                    }
                }
                _this.displayDrag(receivingCalendar, interaction);
                // show mirror if no already-rendered mirror element OR if we are shutting down the mirror (?)
                // TODO: wish we could somehow wait for dispatch to guarantee render
                dragging.setMirrorIsVisible(isFinal || !droppableEvent || !document.querySelector('.fc-mirror'));
                if (!isInvalid) {
                    core.enableCursor();
                }
                else {
                    core.disableCursor();
                }
                if (!isFinal) {
                    dragging.setMirrorNeedsRevert(!droppableEvent);
                    _this.receivingCalendar = receivingCalendar;
                    _this.droppableEvent = droppableEvent;
                }
            };
            this.handleDragEnd = function (pev) {
                var _a = _this, receivingCalendar = _a.receivingCalendar, droppableEvent = _a.droppableEvent;
                _this.clearDrag();
                if (receivingCalendar && droppableEvent) {
                    var finalHit = _this.hitDragging.finalHit;
                    var finalView = finalHit.component.context.view;
                    var dragMeta = _this.dragMeta;
                    var arg = __assign({}, receivingCalendar.buildDatePointApi(finalHit.dateSpan), { draggedEl: pev.subjectEl, jsEvent: pev.origEvent, view: finalView });
                    receivingCalendar.publiclyTrigger('drop', [arg]);
                    if (dragMeta.create) {
                        receivingCalendar.dispatch({
                            type: 'MERGE_EVENTS',
                            eventStore: core.eventTupleToStore(droppableEvent)
                        });
                        if (pev.isTouch) {
                            receivingCalendar.dispatch({
                                type: 'SELECT_EVENT',
                                eventInstanceId: droppableEvent.instance.instanceId
                            });
                        }
                        // signal that an external event landed
                        receivingCalendar.publiclyTrigger('eventReceive', [
                            {
                                draggedEl: pev.subjectEl,
                                event: new core.EventApi(receivingCalendar, droppableEvent.def, droppableEvent.instance),
                                view: finalView
                            }
                        ]);
                    }
                }
                _this.receivingCalendar = null;
                _this.droppableEvent = null;
            };
            var hitDragging = this.hitDragging = new HitDragging(dragging, core.interactionSettingsStore);
            hitDragging.requireInitial = false; // will start outside of a component
            hitDragging.emitter.on('dragstart', this.handleDragStart);
            hitDragging.emitter.on('hitupdate', this.handleHitUpdate);
            hitDragging.emitter.on('dragend', this.handleDragEnd);
            this.suppliedDragMeta = suppliedDragMeta;
        }
        ExternalElementDragging.prototype.buildDragMeta = function (subjectEl) {
            if (typeof this.suppliedDragMeta === 'object') {
                return core.parseDragMeta(this.suppliedDragMeta);
            }
            else if (typeof this.suppliedDragMeta === 'function') {
                return core.parseDragMeta(this.suppliedDragMeta(subjectEl));
            }
            else {
                return getDragMetaFromEl(subjectEl);
            }
        };
        ExternalElementDragging.prototype.displayDrag = function (nextCalendar, state) {
            var prevCalendar = this.receivingCalendar;
            if (prevCalendar && prevCalendar !== nextCalendar) {
                prevCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
            }
            if (nextCalendar) {
                nextCalendar.dispatch({ type: 'SET_EVENT_DRAG', state: state });
            }
        };
        ExternalElementDragging.prototype.clearDrag = function () {
            if (this.receivingCalendar) {
                this.receivingCalendar.dispatch({ type: 'UNSET_EVENT_DRAG' });
            }
        };
        ExternalElementDragging.prototype.canDropElOnCalendar = function (el, receivingCalendar) {
            var dropAccept = receivingCalendar.opt('dropAccept');
            if (typeof dropAccept === 'function') {
                return dropAccept(el);
            }
            else if (typeof dropAccept === 'string' && dropAccept) {
                return Boolean(core.elementMatches(el, dropAccept));
            }
            return true;
        };
        return ExternalElementDragging;
    }());
    // Utils for computing event store from the DragMeta
    // ----------------------------------------------------------------------------------------------------
    function computeEventForDateSpan(dateSpan, dragMeta, calendar) {
        var defProps = __assign({}, dragMeta.leftoverProps);
        for (var _i = 0, _a = calendar.pluginSystem.hooks.externalDefTransforms; _i < _a.length; _i++) {
            var transform = _a[_i];
            __assign(defProps, transform(dateSpan, dragMeta));
        }
        var def = core.parseEventDef(defProps, dragMeta.sourceId, dateSpan.allDay, calendar.opt('forceEventDuration') || Boolean(dragMeta.duration), // hasEnd
        calendar);
        var start = dateSpan.range.start;
        // only rely on time info if drop zone is all-day,
        // otherwise, we already know the time
        if (dateSpan.allDay && dragMeta.startTime) {
            start = calendar.dateEnv.add(start, dragMeta.startTime);
        }
        var end = dragMeta.duration ?
            calendar.dateEnv.add(start, dragMeta.duration) :
            calendar.getDefaultEventEnd(dateSpan.allDay, start);
        var instance = core.createEventInstance(def.defId, { start: start, end: end });
        return { def: def, instance: instance };
    }
    // Utils for extracting data from element
    // ----------------------------------------------------------------------------------------------------
    function getDragMetaFromEl(el) {
        var str = getEmbeddedElData(el, 'event');
        var obj = str ?
            JSON.parse(str) :
            { create: false }; // if no embedded data, assume no event creation
        return core.parseDragMeta(obj);
    }
    core.config.dataAttrPrefix = '';
    function getEmbeddedElData(el, name) {
        var prefix = core.config.dataAttrPrefix;
        var prefixedName = (prefix ? prefix + '-' : '') + name;
        return el.getAttribute('data-' + prefixedName) || '';
    }

    /*
    Makes an element (that is *external* to any calendar) draggable.
    Can pass in data that determines how an event will be created when dropped onto a calendar.
    Leverages FullCalendar's internal drag-n-drop functionality WITHOUT a third-party drag system.
    */
    var ExternalDraggable = /** @class */ (function () {
        function ExternalDraggable(el, settings) {
            var _this = this;
            if (settings === void 0) { settings = {}; }
            this.handlePointerDown = function (ev) {
                var dragging = _this.dragging;
                var _a = _this.settings, minDistance = _a.minDistance, longPressDelay = _a.longPressDelay;
                dragging.minDistance =
                    minDistance != null ?
                        minDistance :
                        (ev.isTouch ? 0 : core.globalDefaults.eventDragMinDistance);
                dragging.delay =
                    ev.isTouch ? // TODO: eventually read eventLongPressDelay instead vvv
                        (longPressDelay != null ? longPressDelay : core.globalDefaults.longPressDelay) :
                        0;
            };
            this.handleDragStart = function (ev) {
                if (ev.isTouch &&
                    _this.dragging.delay &&
                    ev.subjectEl.classList.contains('fc-event')) {
                    _this.dragging.mirror.getMirrorEl().classList.add('fc-selected');
                }
            };
            this.settings = settings;
            var dragging = this.dragging = new FeaturefulElementDragging(el);
            dragging.touchScrollAllowed = false;
            if (settings.itemSelector != null) {
                dragging.pointer.selector = settings.itemSelector;
            }
            if (settings.appendTo != null) {
                dragging.mirror.parentNode = settings.appendTo; // TODO: write tests
            }
            dragging.emitter.on('pointerdown', this.handlePointerDown);
            dragging.emitter.on('dragstart', this.handleDragStart);
            new ExternalElementDragging(dragging, settings.eventData);
        }
        ExternalDraggable.prototype.destroy = function () {
            this.dragging.destroy();
        };
        return ExternalDraggable;
    }());

    /*
    Detects when a *THIRD-PARTY* drag-n-drop system interacts with elements.
    The third-party system is responsible for drawing the visuals effects of the drag.
    This class simply monitors for pointer movements and fires events.
    It also has the ability to hide the moving element (the "mirror") during the drag.
    */
    var InferredElementDragging = /** @class */ (function (_super) {
        __extends(InferredElementDragging, _super);
        function InferredElementDragging(containerEl) {
            var _this = _super.call(this, containerEl) || this;
            _this.shouldIgnoreMove = false;
            _this.mirrorSelector = '';
            _this.currentMirrorEl = null;
            _this.handlePointerDown = function (ev) {
                _this.emitter.trigger('pointerdown', ev);
                if (!_this.shouldIgnoreMove) {
                    // fire dragstart right away. does not support delay or min-distance
                    _this.emitter.trigger('dragstart', ev);
                }
            };
            _this.handlePointerMove = function (ev) {
                if (!_this.shouldIgnoreMove) {
                    _this.emitter.trigger('dragmove', ev);
                }
            };
            _this.handlePointerUp = function (ev) {
                _this.emitter.trigger('pointerup', ev);
                if (!_this.shouldIgnoreMove) {
                    // fire dragend right away. does not support a revert animation
                    _this.emitter.trigger('dragend', ev);
                }
            };
            var pointer = _this.pointer = new PointerDragging(containerEl);
            pointer.emitter.on('pointerdown', _this.handlePointerDown);
            pointer.emitter.on('pointermove', _this.handlePointerMove);
            pointer.emitter.on('pointerup', _this.handlePointerUp);
            return _this;
        }
        InferredElementDragging.prototype.destroy = function () {
            this.pointer.destroy();
        };
        InferredElementDragging.prototype.setIgnoreMove = function (bool) {
            this.shouldIgnoreMove = bool;
        };
        InferredElementDragging.prototype.setMirrorIsVisible = function (bool) {
            if (bool) {
                // restore a previously hidden element.
                // use the reference in case the selector class has already been removed.
                if (this.currentMirrorEl) {
                    this.currentMirrorEl.style.visibility = '';
                    this.currentMirrorEl = null;
                }
            }
            else {
                var mirrorEl = this.mirrorSelector ?
                    document.querySelector(this.mirrorSelector) :
                    null;
                if (mirrorEl) {
                    this.currentMirrorEl = mirrorEl;
                    mirrorEl.style.visibility = 'hidden';
                }
            }
        };
        return InferredElementDragging;
    }(core.ElementDragging));

    /*
    Bridges third-party drag-n-drop systems with FullCalendar.
    Must be instantiated and destroyed by caller.
    */
    var ThirdPartyDraggable = /** @class */ (function () {
        function ThirdPartyDraggable(containerOrSettings, settings) {
            var containerEl = document;
            if (
            // wish we could just test instanceof EventTarget, but doesn't work in IE11
            containerOrSettings === document ||
                containerOrSettings instanceof Element) {
                containerEl = containerOrSettings;
                settings = settings || {};
            }
            else {
                settings = (containerOrSettings || {});
            }
            var dragging = this.dragging = new InferredElementDragging(containerEl);
            if (typeof settings.itemSelector === 'string') {
                dragging.pointer.selector = settings.itemSelector;
            }
            else if (containerEl === document) {
                dragging.pointer.selector = '[data-event]';
            }
            if (typeof settings.mirrorSelector === 'string') {
                dragging.mirrorSelector = settings.mirrorSelector;
            }
            new ExternalElementDragging(dragging, settings.eventData);
        }
        ThirdPartyDraggable.prototype.destroy = function () {
            this.dragging.destroy();
        };
        return ThirdPartyDraggable;
    }());

    var main = core.createPlugin({
        componentInteractions: [DateClicking, DateSelecting, EventDragging, EventDragging$1],
        calendarInteractions: [UnselectAuto],
        elementDraggingImpl: FeaturefulElementDragging
    });

    exports.Draggable = ExternalDraggable;
    exports.FeaturefulElementDragging = FeaturefulElementDragging;
    exports.PointerDragging = PointerDragging;
    exports.ThirdPartyDraggable = ThirdPartyDraggable;
    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

/*!
FullCalendar List View Plugin v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fullcalendar/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fullcalendar/core'], factory) :
    (global = global || self, factory(global.FullCalendarList = {}, global.FullCalendar));
}(this, function (exports, core) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var ListEventRenderer = /** @class */ (function (_super) {
        __extends(ListEventRenderer, _super);
        function ListEventRenderer(listView) {
            var _this = _super.call(this) || this;
            _this.listView = listView;
            return _this;
        }
        ListEventRenderer.prototype.attachSegs = function (segs) {
            if (!segs.length) {
                this.listView.renderEmptyMessage();
            }
            else {
                this.listView.renderSegList(segs);
            }
        };
        ListEventRenderer.prototype.detachSegs = function () {
        };
        // generates the HTML for a single event row
        ListEventRenderer.prototype.renderSegHtml = function (seg) {
            var _a = this.context, theme = _a.theme, options = _a.options;
            var eventRange = seg.eventRange;
            var eventDef = eventRange.def;
            var eventInstance = eventRange.instance;
            var eventUi = eventRange.ui;
            var url = eventDef.url;
            var classes = ['fc-list-item'].concat(eventUi.classNames);
            var bgColor = eventUi.backgroundColor;
            var timeHtml;
            if (eventDef.allDay) {
                timeHtml = core.getAllDayHtml(options);
            }
            else if (core.isMultiDayRange(eventRange.range)) {
                if (seg.isStart) {
                    timeHtml = core.htmlEscape(this._getTimeText(eventInstance.range.start, seg.end, false // allDay
                    ));
                }
                else if (seg.isEnd) {
                    timeHtml = core.htmlEscape(this._getTimeText(seg.start, eventInstance.range.end, false // allDay
                    ));
                }
                else { // inner segment that lasts the whole day
                    timeHtml = core.getAllDayHtml(options);
                }
            }
            else {
                // Display the normal time text for the *event's* times
                timeHtml = core.htmlEscape(this.getTimeText(eventRange));
            }
            if (url) {
                classes.push('fc-has-url');
            }
            return '<tr class="' + classes.join(' ') + '">' +
                (this.displayEventTime ?
                    '<td class="fc-list-item-time ' + theme.getClass('widgetContent') + '">' +
                        (timeHtml || '') +
                        '</td>' :
                    '') +
                '<td class="fc-list-item-marker ' + theme.getClass('widgetContent') + '">' +
                '<span class="fc-event-dot"' +
                (bgColor ?
                    ' style="background-color:' + bgColor + '"' :
                    '') +
                '></span>' +
                '</td>' +
                '<td class="fc-list-item-title ' + theme.getClass('widgetContent') + '">' +
                '<a' + (url ? ' href="' + core.htmlEscape(url) + '"' : '') + '>' +
                core.htmlEscape(eventDef.title || '') +
                '</a>' +
                '</td>' +
                '</tr>';
        };
        // like "4:00am"
        ListEventRenderer.prototype.computeEventTimeFormat = function () {
            return {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
            };
        };
        return ListEventRenderer;
    }(core.FgEventRenderer));

    /*
    Responsible for the scroller, and forwarding event-related actions into the "grid".
    */
    var ListView = /** @class */ (function (_super) {
        __extends(ListView, _super);
        function ListView(viewSpec, parentEl) {
            var _this = _super.call(this, viewSpec, parentEl) || this;
            _this.computeDateVars = core.memoize(computeDateVars);
            _this.eventStoreToSegs = core.memoize(_this._eventStoreToSegs);
            _this.renderSkeleton = core.memoizeRendering(_this._renderSkeleton, _this._unrenderSkeleton);
            var eventRenderer = _this.eventRenderer = new ListEventRenderer(_this);
            _this.renderContent = core.memoizeRendering(eventRenderer.renderSegs.bind(eventRenderer), eventRenderer.unrender.bind(eventRenderer), [_this.renderSkeleton]);
            return _this;
        }
        ListView.prototype.firstContext = function (context) {
            context.calendar.registerInteractiveComponent(this, {
                el: this.el
                // TODO: make aware that it doesn't do Hits
            });
        };
        ListView.prototype.render = function (props, context) {
            _super.prototype.render.call(this, props, context);
            var _a = this.computeDateVars(props.dateProfile), dayDates = _a.dayDates, dayRanges = _a.dayRanges;
            this.dayDates = dayDates;
            this.renderSkeleton(context);
            this.renderContent(context, this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges));
        };
        ListView.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderSkeleton.unrender();
            this.renderContent.unrender();
            this.context.calendar.unregisterInteractiveComponent(this);
        };
        ListView.prototype._renderSkeleton = function (context) {
            var theme = context.theme;
            this.el.classList.add('fc-list-view');
            var listViewClassNames = (theme.getClass('listView') || '').split(' '); // wish we didn't have to do this
            for (var _i = 0, listViewClassNames_1 = listViewClassNames; _i < listViewClassNames_1.length; _i++) {
                var listViewClassName = listViewClassNames_1[_i];
                if (listViewClassName) { // in case input was empty string
                    this.el.classList.add(listViewClassName);
                }
            }
            this.scroller = new core.ScrollComponent('hidden', // overflow x
            'auto' // overflow y
            );
            this.el.appendChild(this.scroller.el);
            this.contentEl = this.scroller.el; // shortcut
        };
        ListView.prototype._unrenderSkeleton = function () {
            // TODO: remove classNames
            this.scroller.destroy(); // will remove the Grid too
        };
        ListView.prototype.updateSize = function (isResize, viewHeight, isAuto) {
            _super.prototype.updateSize.call(this, isResize, viewHeight, isAuto);
            this.eventRenderer.computeSizes(isResize);
            this.eventRenderer.assignSizes(isResize);
            this.scroller.clear(); // sets height to 'auto' and clears overflow
            if (!isAuto) {
                this.scroller.setHeight(this.computeScrollerHeight(viewHeight));
            }
        };
        ListView.prototype.computeScrollerHeight = function (viewHeight) {
            return viewHeight -
                core.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
        };
        ListView.prototype._eventStoreToSegs = function (eventStore, eventUiBases, dayRanges) {
            return this.eventRangesToSegs(core.sliceEventStore(eventStore, eventUiBases, this.props.dateProfile.activeRange, this.context.nextDayThreshold).fg, dayRanges);
        };
        ListView.prototype.eventRangesToSegs = function (eventRanges, dayRanges) {
            var segs = [];
            for (var _i = 0, eventRanges_1 = eventRanges; _i < eventRanges_1.length; _i++) {
                var eventRange = eventRanges_1[_i];
                segs.push.apply(segs, this.eventRangeToSegs(eventRange, dayRanges));
            }
            return segs;
        };
        ListView.prototype.eventRangeToSegs = function (eventRange, dayRanges) {
            var _a = this.context, dateEnv = _a.dateEnv, nextDayThreshold = _a.nextDayThreshold;
            var range = eventRange.range;
            var allDay = eventRange.def.allDay;
            var dayIndex;
            var segRange;
            var seg;
            var segs = [];
            for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex++) {
                segRange = core.intersectRanges(range, dayRanges[dayIndex]);
                if (segRange) {
                    seg = {
                        component: this,
                        eventRange: eventRange,
                        start: segRange.start,
                        end: segRange.end,
                        isStart: eventRange.isStart && segRange.start.valueOf() === range.start.valueOf(),
                        isEnd: eventRange.isEnd && segRange.end.valueOf() === range.end.valueOf(),
                        dayIndex: dayIndex
                    };
                    segs.push(seg);
                    // detect when range won't go fully into the next day,
                    // and mutate the latest seg to the be the end.
                    if (!seg.isEnd && !allDay &&
                        dayIndex + 1 < dayRanges.length &&
                        range.end <
                            dateEnv.add(dayRanges[dayIndex + 1].start, nextDayThreshold)) {
                        seg.end = range.end;
                        seg.isEnd = true;
                        break;
                    }
                }
            }
            return segs;
        };
        ListView.prototype.renderEmptyMessage = function () {
            this.contentEl.innerHTML =
                '<div class="fc-list-empty-wrap2">' + // TODO: try less wraps
                    '<div class="fc-list-empty-wrap1">' +
                    '<div class="fc-list-empty">' +
                    core.htmlEscape(this.context.options.noEventsMessage) +
                    '</div>' +
                    '</div>' +
                    '</div>';
        };
        // called by ListEventRenderer
        ListView.prototype.renderSegList = function (allSegs) {
            var theme = this.context.theme;
            var segsByDay = this.groupSegsByDay(allSegs); // sparse array
            var dayIndex;
            var daySegs;
            var i;
            var tableEl = core.htmlToElement('<table class="fc-list-table ' + theme.getClass('tableList') + '"><tbody></tbody></table>');
            var tbodyEl = tableEl.querySelector('tbody');
            for (dayIndex = 0; dayIndex < segsByDay.length; dayIndex++) {
                daySegs = segsByDay[dayIndex];
                if (daySegs) { // sparse array, so might be undefined
                    // append a day header
                    tbodyEl.appendChild(this.buildDayHeaderRow(this.dayDates[dayIndex]));
                    daySegs = this.eventRenderer.sortEventSegs(daySegs);
                    for (i = 0; i < daySegs.length; i++) {
                        tbodyEl.appendChild(daySegs[i].el); // append event row
                    }
                }
            }
            this.contentEl.innerHTML = '';
            this.contentEl.appendChild(tableEl);
        };
        // Returns a sparse array of arrays, segs grouped by their dayIndex
        ListView.prototype.groupSegsByDay = function (segs) {
            var segsByDay = []; // sparse array
            var i;
            var seg;
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = []))
                    .push(seg);
            }
            return segsByDay;
        };
        // generates the HTML for the day headers that live amongst the event rows
        ListView.prototype.buildDayHeaderRow = function (dayDate) {
            var _a = this.context, theme = _a.theme, dateEnv = _a.dateEnv, options = _a.options;
            var mainFormat = core.createFormatter(options.listDayFormat); // TODO: cache
            var altFormat = core.createFormatter(options.listDayAltFormat); // TODO: cache
            return core.createElement('tr', {
                className: 'fc-list-heading',
                'data-date': dateEnv.formatIso(dayDate, { omitTime: true })
            }, '<td class="' + (theme.getClass('tableListHeading') ||
                theme.getClass('widgetHeader')) + '" colspan="3">' +
                (mainFormat ?
                    core.buildGotoAnchorHtml(options, dateEnv, dayDate, { 'class': 'fc-list-heading-main' }, core.htmlEscape(dateEnv.format(dayDate, mainFormat)) // inner HTML
                    ) :
                    '') +
                (altFormat ?
                    core.buildGotoAnchorHtml(options, dateEnv, dayDate, { 'class': 'fc-list-heading-alt' }, core.htmlEscape(dateEnv.format(dayDate, altFormat)) // inner HTML
                    ) :
                    '') +
                '</td>');
        };
        return ListView;
    }(core.View));
    ListView.prototype.fgSegSelector = '.fc-list-item'; // which elements accept event actions
    function computeDateVars(dateProfile) {
        var dayStart = core.startOfDay(dateProfile.renderRange.start);
        var viewEnd = dateProfile.renderRange.end;
        var dayDates = [];
        var dayRanges = [];
        while (dayStart < viewEnd) {
            dayDates.push(dayStart);
            dayRanges.push({
                start: dayStart,
                end: core.addDays(dayStart, 1)
            });
            dayStart = core.addDays(dayStart, 1);
        }
        return { dayDates: dayDates, dayRanges: dayRanges };
    }

    var main = core.createPlugin({
        views: {
            list: {
                class: ListView,
                buttonTextKey: 'list',
                listDayFormat: { month: 'long', day: 'numeric', year: 'numeric' } // like "January 1, 2016"
            },
            listDay: {
                type: 'list',
                duration: { days: 1 },
                listDayFormat: { weekday: 'long' } // day-of-week is all we need. full date is probably in header
            },
            listWeek: {
                type: 'list',
                duration: { weeks: 1 },
                listDayFormat: { weekday: 'long' },
                listDayAltFormat: { month: 'long', day: 'numeric', year: 'numeric' }
            },
            listMonth: {
                type: 'list',
                duration: { month: 1 },
                listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
            },
            listYear: {
                type: 'list',
                duration: { year: 1 },
                listDayAltFormat: { weekday: 'long' } // day-of-week is nice-to-have
            }
        }
    });

    exports.ListView = ListView;
    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

/*!
FullCalendar Time Grid Plugin v4.4.2
Docs & License: https://fullcalendar.io/
(c) 2019 Adam Shaw
*/

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fullcalendar/core'), require('@fullcalendar/daygrid')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fullcalendar/core', '@fullcalendar/daygrid'], factory) :
    (global = global || self, factory(global.FullCalendarTimeGrid = {}, global.FullCalendar, global.FullCalendarDayGrid));
}(this, function (exports, core, daygrid) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    /*
    Only handles foreground segs.
    Does not own rendering. Use for low-level util methods by TimeGrid.
    */
    var TimeGridEventRenderer = /** @class */ (function (_super) {
        __extends(TimeGridEventRenderer, _super);
        function TimeGridEventRenderer(timeGrid) {
            var _this = _super.call(this) || this;
            _this.timeGrid = timeGrid;
            return _this;
        }
        TimeGridEventRenderer.prototype.renderSegs = function (context, segs, mirrorInfo) {
            _super.prototype.renderSegs.call(this, context, segs, mirrorInfo);
            // TODO: dont do every time. memoize
            this.fullTimeFormat = core.createFormatter({
                hour: 'numeric',
                minute: '2-digit',
                separator: this.context.options.defaultRangeSeparator
            });
        };
        // Given an array of foreground segments, render a DOM element for each, computes position,
        // and attaches to the column inner-container elements.
        TimeGridEventRenderer.prototype.attachSegs = function (segs, mirrorInfo) {
            var segsByCol = this.timeGrid.groupSegsByCol(segs);
            // order the segs within each column
            // TODO: have groupSegsByCol do this?
            for (var col = 0; col < segsByCol.length; col++) {
                segsByCol[col] = this.sortEventSegs(segsByCol[col]);
            }
            this.segsByCol = segsByCol;
            this.timeGrid.attachSegsByCol(segsByCol, this.timeGrid.fgContainerEls);
        };
        TimeGridEventRenderer.prototype.detachSegs = function (segs) {
            segs.forEach(function (seg) {
                core.removeElement(seg.el);
            });
            this.segsByCol = null;
        };
        TimeGridEventRenderer.prototype.computeSegSizes = function (allSegs) {
            var _a = this, timeGrid = _a.timeGrid, segsByCol = _a.segsByCol;
            var colCnt = timeGrid.colCnt;
            timeGrid.computeSegVerticals(allSegs); // horizontals relies on this
            if (segsByCol) {
                for (var col = 0; col < colCnt; col++) {
                    this.computeSegHorizontals(segsByCol[col]); // compute horizontal coordinates, z-index's, and reorder the array
                }
            }
        };
        TimeGridEventRenderer.prototype.assignSegSizes = function (allSegs) {
            var _a = this, timeGrid = _a.timeGrid, segsByCol = _a.segsByCol;
            var colCnt = timeGrid.colCnt;
            timeGrid.assignSegVerticals(allSegs); // horizontals relies on this
            if (segsByCol) {
                for (var col = 0; col < colCnt; col++) {
                    this.assignSegCss(segsByCol[col]);
                }
            }
        };
        // Computes a default event time formatting string if `eventTimeFormat` is not explicitly defined
        TimeGridEventRenderer.prototype.computeEventTimeFormat = function () {
            return {
                hour: 'numeric',
                minute: '2-digit',
                meridiem: false
            };
        };
        // Computes a default `displayEventEnd` value if one is not expliclty defined
        TimeGridEventRenderer.prototype.computeDisplayEventEnd = function () {
            return true;
        };
        // Renders the HTML for a single event segment's default rendering
        TimeGridEventRenderer.prototype.renderSegHtml = function (seg, mirrorInfo) {
            var eventRange = seg.eventRange;
            var eventDef = eventRange.def;
            var eventUi = eventRange.ui;
            var allDay = eventDef.allDay;
            var isDraggable = core.computeEventDraggable(this.context, eventDef, eventUi);
            var isResizableFromStart = seg.isStart && core.computeEventStartResizable(this.context, eventDef, eventUi);
            var isResizableFromEnd = seg.isEnd && core.computeEventEndResizable(this.context, eventDef, eventUi);
            var classes = this.getSegClasses(seg, isDraggable, isResizableFromStart || isResizableFromEnd, mirrorInfo);
            var skinCss = core.cssToStr(this.getSkinCss(eventUi));
            var timeText;
            var fullTimeText; // more verbose time text. for the print stylesheet
            var startTimeText; // just the start time text
            classes.unshift('fc-time-grid-event');
            // if the event appears to span more than one day...
            if (core.isMultiDayRange(eventRange.range)) {
                // Don't display time text on segments that run entirely through a day.
                // That would appear as midnight-midnight and would look dumb.
                // Otherwise, display the time text for the *segment's* times (like 6pm-midnight or midnight-10am)
                if (seg.isStart || seg.isEnd) {
                    var unzonedStart = seg.start;
                    var unzonedEnd = seg.end;
                    timeText = this._getTimeText(unzonedStart, unzonedEnd, allDay); // TODO: give the timezones
                    fullTimeText = this._getTimeText(unzonedStart, unzonedEnd, allDay, this.fullTimeFormat);
                    startTimeText = this._getTimeText(unzonedStart, unzonedEnd, allDay, null, false); // displayEnd=false
                }
            }
            else {
                // Display the normal time text for the *event's* times
                timeText = this.getTimeText(eventRange);
                fullTimeText = this.getTimeText(eventRange, this.fullTimeFormat);
                startTimeText = this.getTimeText(eventRange, null, false); // displayEnd=false
            }
            return '<a class="' + classes.join(' ') + '"' +
                (eventDef.url ?
                    ' href="' + core.htmlEscape(eventDef.url) + '"' :
                    '') +
                (skinCss ?
                    ' style="' + skinCss + '"' :
                    '') +
                '>' +
                '<div class="fc-content">' +
                (timeText ?
                    '<div class="fc-time"' +
                        ' data-start="' + core.htmlEscape(startTimeText) + '"' +
                        ' data-full="' + core.htmlEscape(fullTimeText) + '"' +
                        '>' +
                        '<span>' + core.htmlEscape(timeText) + '</span>' +
                        '</div>' :
                    '') +
                (eventDef.title ?
                    '<div class="fc-title">' +
                        core.htmlEscape(eventDef.title) +
                        '</div>' :
                    '') +
                '</div>' +
                /* TODO: write CSS for this
                (isResizableFromStart ?
                  '<div class="fc-resizer fc-start-resizer"></div>' :
                  ''
                  ) +
                */
                (isResizableFromEnd ?
                    '<div class="fc-resizer fc-end-resizer"></div>' :
                    '') +
                '</a>';
        };
        // Given an array of segments that are all in the same column, sets the backwardCoord and forwardCoord on each.
        // Assumed the segs are already ordered.
        // NOTE: Also reorders the given array by date!
        TimeGridEventRenderer.prototype.computeSegHorizontals = function (segs) {
            var levels;
            var level0;
            var i;
            levels = buildSlotSegLevels(segs);
            computeForwardSlotSegs(levels);
            if ((level0 = levels[0])) {
                for (i = 0; i < level0.length; i++) {
                    computeSlotSegPressures(level0[i]);
                }
                for (i = 0; i < level0.length; i++) {
                    this.computeSegForwardBack(level0[i], 0, 0);
                }
            }
        };
        // Calculate seg.forwardCoord and seg.backwardCoord for the segment, where both values range
        // from 0 to 1. If the calendar is left-to-right, the seg.backwardCoord maps to "left" and
        // seg.forwardCoord maps to "right" (via percentage). Vice-versa if the calendar is right-to-left.
        //
        // The segment might be part of a "series", which means consecutive segments with the same pressure
        // who's width is unknown until an edge has been hit. `seriesBackwardPressure` is the number of
        // segments behind this one in the current series, and `seriesBackwardCoord` is the starting
        // coordinate of the first segment in the series.
        TimeGridEventRenderer.prototype.computeSegForwardBack = function (seg, seriesBackwardPressure, seriesBackwardCoord) {
            var forwardSegs = seg.forwardSegs;
            var i;
            if (seg.forwardCoord === undefined) { // not already computed
                if (!forwardSegs.length) {
                    // if there are no forward segments, this segment should butt up against the edge
                    seg.forwardCoord = 1;
                }
                else {
                    // sort highest pressure first
                    this.sortForwardSegs(forwardSegs);
                    // this segment's forwardCoord will be calculated from the backwardCoord of the
                    // highest-pressure forward segment.
                    this.computeSegForwardBack(forwardSegs[0], seriesBackwardPressure + 1, seriesBackwardCoord);
                    seg.forwardCoord = forwardSegs[0].backwardCoord;
                }
                // calculate the backwardCoord from the forwardCoord. consider the series
                seg.backwardCoord = seg.forwardCoord -
                    (seg.forwardCoord - seriesBackwardCoord) / // available width for series
                        (seriesBackwardPressure + 1); // # of segments in the series
                // use this segment's coordinates to computed the coordinates of the less-pressurized
                // forward segments
                for (i = 0; i < forwardSegs.length; i++) {
                    this.computeSegForwardBack(forwardSegs[i], 0, seg.forwardCoord);
                }
            }
        };
        TimeGridEventRenderer.prototype.sortForwardSegs = function (forwardSegs) {
            var objs = forwardSegs.map(buildTimeGridSegCompareObj);
            var specs = [
                // put higher-pressure first
                { field: 'forwardPressure', order: -1 },
                // put segments that are closer to initial edge first (and favor ones with no coords yet)
                { field: 'backwardCoord', order: 1 }
            ].concat(this.context.eventOrderSpecs);
            objs.sort(function (obj0, obj1) {
                return core.compareByFieldSpecs(obj0, obj1, specs);
            });
            return objs.map(function (c) {
                return c._seg;
            });
        };
        // Given foreground event segments that have already had their position coordinates computed,
        // assigns position-related CSS values to their elements.
        TimeGridEventRenderer.prototype.assignSegCss = function (segs) {
            for (var _i = 0, segs_1 = segs; _i < segs_1.length; _i++) {
                var seg = segs_1[_i];
                core.applyStyle(seg.el, this.generateSegCss(seg));
                if (seg.level > 0) {
                    seg.el.classList.add('fc-time-grid-event-inset');
                }
                // if the event is short that the title will be cut off,
                // attach a className that condenses the title into the time area.
                if (seg.eventRange.def.title && seg.bottom - seg.top < 30) {
                    seg.el.classList.add('fc-short'); // TODO: "condensed" is a better name
                }
            }
        };
        // Generates an object with CSS properties/values that should be applied to an event segment element.
        // Contains important positioning-related properties that should be applied to any event element, customized or not.
        TimeGridEventRenderer.prototype.generateSegCss = function (seg) {
            var shouldOverlap = this.context.options.slotEventOverlap;
            var backwardCoord = seg.backwardCoord; // the left side if LTR. the right side if RTL. floating-point
            var forwardCoord = seg.forwardCoord; // the right side if LTR. the left side if RTL. floating-point
            var props = this.timeGrid.generateSegVerticalCss(seg); // get top/bottom first
            var isRtl = this.context.isRtl;
            var left; // amount of space from left edge, a fraction of the total width
            var right; // amount of space from right edge, a fraction of the total width
            if (shouldOverlap) {
                // double the width, but don't go beyond the maximum forward coordinate (1.0)
                forwardCoord = Math.min(1, backwardCoord + (forwardCoord - backwardCoord) * 2);
            }
            if (isRtl) {
                left = 1 - forwardCoord;
                right = backwardCoord;
            }
            else {
                left = backwardCoord;
                right = 1 - forwardCoord;
            }
            props.zIndex = seg.level + 1; // convert from 0-base to 1-based
            props.left = left * 100 + '%';
            props.right = right * 100 + '%';
            if (shouldOverlap && seg.forwardPressure) {
                // add padding to the edge so that forward stacked events don't cover the resizer's icon
                props[isRtl ? 'marginLeft' : 'marginRight'] = 10 * 2; // 10 is a guesstimate of the icon's width
            }
            return props;
        };
        return TimeGridEventRenderer;
    }(core.FgEventRenderer));
    // Builds an array of segments "levels". The first level will be the leftmost tier of segments if the calendar is
    // left-to-right, or the rightmost if the calendar is right-to-left. Assumes the segments are already ordered by date.
    function buildSlotSegLevels(segs) {
        var levels = [];
        var i;
        var seg;
        var j;
        for (i = 0; i < segs.length; i++) {
            seg = segs[i];
            // go through all the levels and stop on the first level where there are no collisions
            for (j = 0; j < levels.length; j++) {
                if (!computeSlotSegCollisions(seg, levels[j]).length) {
                    break;
                }
            }
            seg.level = j;
            (levels[j] || (levels[j] = [])).push(seg);
        }
        return levels;
    }
    // For every segment, figure out the other segments that are in subsequent
    // levels that also occupy the same vertical space. Accumulate in seg.forwardSegs
    function computeForwardSlotSegs(levels) {
        var i;
        var level;
        var j;
        var seg;
        var k;
        for (i = 0; i < levels.length; i++) {
            level = levels[i];
            for (j = 0; j < level.length; j++) {
                seg = level[j];
                seg.forwardSegs = [];
                for (k = i + 1; k < levels.length; k++) {
                    computeSlotSegCollisions(seg, levels[k], seg.forwardSegs);
                }
            }
        }
    }
    // Figure out which path forward (via seg.forwardSegs) results in the longest path until
    // the furthest edge is reached. The number of segments in this path will be seg.forwardPressure
    function computeSlotSegPressures(seg) {
        var forwardSegs = seg.forwardSegs;
        var forwardPressure = 0;
        var i;
        var forwardSeg;
        if (seg.forwardPressure === undefined) { // not already computed
            for (i = 0; i < forwardSegs.length; i++) {
                forwardSeg = forwardSegs[i];
                // figure out the child's maximum forward path
                computeSlotSegPressures(forwardSeg);
                // either use the existing maximum, or use the child's forward pressure
                // plus one (for the forwardSeg itself)
                forwardPressure = Math.max(forwardPressure, 1 + forwardSeg.forwardPressure);
            }
            seg.forwardPressure = forwardPressure;
        }
    }
    // Find all the segments in `otherSegs` that vertically collide with `seg`.
    // Append into an optionally-supplied `results` array and return.
    function computeSlotSegCollisions(seg, otherSegs, results) {
        if (results === void 0) { results = []; }
        for (var i = 0; i < otherSegs.length; i++) {
            if (isSlotSegCollision(seg, otherSegs[i])) {
                results.push(otherSegs[i]);
            }
        }
        return results;
    }
    // Do these segments occupy the same vertical space?
    function isSlotSegCollision(seg1, seg2) {
        return seg1.bottom > seg2.top && seg1.top < seg2.bottom;
    }
    function buildTimeGridSegCompareObj(seg) {
        var obj = core.buildSegCompareObj(seg);
        obj.forwardPressure = seg.forwardPressure;
        obj.backwardCoord = seg.backwardCoord;
        return obj;
    }

    var TimeGridMirrorRenderer = /** @class */ (function (_super) {
        __extends(TimeGridMirrorRenderer, _super);
        function TimeGridMirrorRenderer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimeGridMirrorRenderer.prototype.attachSegs = function (segs, mirrorInfo) {
            this.segsByCol = this.timeGrid.groupSegsByCol(segs);
            this.timeGrid.attachSegsByCol(this.segsByCol, this.timeGrid.mirrorContainerEls);
            this.sourceSeg = mirrorInfo.sourceSeg;
        };
        TimeGridMirrorRenderer.prototype.generateSegCss = function (seg) {
            var props = _super.prototype.generateSegCss.call(this, seg);
            var sourceSeg = this.sourceSeg;
            if (sourceSeg && sourceSeg.col === seg.col) {
                var sourceSegProps = _super.prototype.generateSegCss.call(this, sourceSeg);
                props.left = sourceSegProps.left;
                props.right = sourceSegProps.right;
                props.marginLeft = sourceSegProps.marginLeft;
                props.marginRight = sourceSegProps.marginRight;
            }
            return props;
        };
        return TimeGridMirrorRenderer;
    }(TimeGridEventRenderer));

    var TimeGridFillRenderer = /** @class */ (function (_super) {
        __extends(TimeGridFillRenderer, _super);
        function TimeGridFillRenderer(timeGrid) {
            var _this = _super.call(this) || this;
            _this.timeGrid = timeGrid;
            return _this;
        }
        TimeGridFillRenderer.prototype.attachSegs = function (type, segs) {
            var timeGrid = this.timeGrid;
            var containerEls;
            // TODO: more efficient lookup
            if (type === 'bgEvent') {
                containerEls = timeGrid.bgContainerEls;
            }
            else if (type === 'businessHours') {
                containerEls = timeGrid.businessContainerEls;
            }
            else if (type === 'highlight') {
                containerEls = timeGrid.highlightContainerEls;
            }
            timeGrid.attachSegsByCol(timeGrid.groupSegsByCol(segs), containerEls);
            return segs.map(function (seg) {
                return seg.el;
            });
        };
        TimeGridFillRenderer.prototype.computeSegSizes = function (segs) {
            this.timeGrid.computeSegVerticals(segs);
        };
        TimeGridFillRenderer.prototype.assignSegSizes = function (segs) {
            this.timeGrid.assignSegVerticals(segs);
        };
        return TimeGridFillRenderer;
    }(core.FillRenderer));

    /* A component that renders one or more columns of vertical time slots
    ----------------------------------------------------------------------------------------------------------------------*/
    // potential nice values for the slot-duration and interval-duration
    // from largest to smallest
    var AGENDA_STOCK_SUB_DURATIONS = [
        { hours: 1 },
        { minutes: 30 },
        { minutes: 15 },
        { seconds: 30 },
        { seconds: 15 }
    ];
    var TimeGrid = /** @class */ (function (_super) {
        __extends(TimeGrid, _super);
        function TimeGrid(el, renderProps) {
            var _this = _super.call(this, el) || this;
            _this.isSlatSizesDirty = false;
            _this.isColSizesDirty = false;
            _this.processOptions = core.memoize(_this._processOptions);
            _this.renderSkeleton = core.memoizeRendering(_this._renderSkeleton);
            _this.renderSlats = core.memoizeRendering(_this._renderSlats, null, [_this.renderSkeleton]);
            _this.renderColumns = core.memoizeRendering(_this._renderColumns, _this._unrenderColumns, [_this.renderSkeleton]);
            _this.renderProps = renderProps;
            var renderColumns = _this.renderColumns;
            var eventRenderer = _this.eventRenderer = new TimeGridEventRenderer(_this);
            var fillRenderer = _this.fillRenderer = new TimeGridFillRenderer(_this);
            _this.mirrorRenderer = new TimeGridMirrorRenderer(_this);
            _this.renderBusinessHours = core.memoizeRendering(fillRenderer.renderSegs.bind(fillRenderer, 'businessHours'), fillRenderer.unrender.bind(fillRenderer, 'businessHours'), [renderColumns]);
            _this.renderDateSelection = core.memoizeRendering(_this._renderDateSelection, _this._unrenderDateSelection, [renderColumns]);
            _this.renderFgEvents = core.memoizeRendering(eventRenderer.renderSegs.bind(eventRenderer), eventRenderer.unrender.bind(eventRenderer), [renderColumns]);
            _this.renderBgEvents = core.memoizeRendering(fillRenderer.renderSegs.bind(fillRenderer, 'bgEvent'), fillRenderer.unrender.bind(fillRenderer, 'bgEvent'), [renderColumns]);
            _this.renderEventSelection = core.memoizeRendering(eventRenderer.selectByInstanceId.bind(eventRenderer), eventRenderer.unselectByInstanceId.bind(eventRenderer), [_this.renderFgEvents]);
            _this.renderEventDrag = core.memoizeRendering(_this._renderEventDrag, _this._unrenderEventDrag, [renderColumns]);
            _this.renderEventResize = core.memoizeRendering(_this._renderEventResize, _this._unrenderEventResize, [renderColumns]);
            return _this;
        }
        /* Options
        ------------------------------------------------------------------------------------------------------------------*/
        // Parses various options into properties of this object
        // MUST have context already set
        TimeGrid.prototype._processOptions = function (options) {
            var slotDuration = options.slotDuration, snapDuration = options.snapDuration;
            var snapsPerSlot;
            var input;
            slotDuration = core.createDuration(slotDuration);
            snapDuration = snapDuration ? core.createDuration(snapDuration) : slotDuration;
            snapsPerSlot = core.wholeDivideDurations(slotDuration, snapDuration);
            if (snapsPerSlot === null) {
                snapDuration = slotDuration;
                snapsPerSlot = 1;
                // TODO: say warning?
            }
            this.slotDuration = slotDuration;
            this.snapDuration = snapDuration;
            this.snapsPerSlot = snapsPerSlot;
            // might be an array value (for TimelineView).
            // if so, getting the most granular entry (the last one probably).
            input = options.slotLabelFormat;
            if (Array.isArray(input)) {
                input = input[input.length - 1];
            }
            this.labelFormat = core.createFormatter(input || {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: true,
                meridiem: 'short'
            });
            input = options.slotLabelInterval;
            this.labelInterval = input ?
                core.createDuration(input) :
                this.computeLabelInterval(slotDuration);
        };
        // Computes an automatic value for slotLabelInterval
        TimeGrid.prototype.computeLabelInterval = function (slotDuration) {
            var i;
            var labelInterval;
            var slotsPerLabel;
            // find the smallest stock label interval that results in more than one slots-per-label
            for (i = AGENDA_STOCK_SUB_DURATIONS.length - 1; i >= 0; i--) {
                labelInterval = core.createDuration(AGENDA_STOCK_SUB_DURATIONS[i]);
                slotsPerLabel = core.wholeDivideDurations(labelInterval, slotDuration);
                if (slotsPerLabel !== null && slotsPerLabel > 1) {
                    return labelInterval;
                }
            }
            return slotDuration; // fall back
        };
        /* Rendering
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype.render = function (props, context) {
            this.processOptions(context.options);
            var cells = props.cells;
            this.colCnt = cells.length;
            this.renderSkeleton(context.theme);
            this.renderSlats(props.dateProfile);
            this.renderColumns(props.cells, props.dateProfile);
            this.renderBusinessHours(context, props.businessHourSegs);
            this.renderDateSelection(props.dateSelectionSegs);
            this.renderFgEvents(context, props.fgEventSegs);
            this.renderBgEvents(context, props.bgEventSegs);
            this.renderEventSelection(props.eventSelection);
            this.renderEventDrag(props.eventDrag);
            this.renderEventResize(props.eventResize);
        };
        TimeGrid.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            // should unrender everything else too
            this.renderSlats.unrender();
            this.renderColumns.unrender();
            this.renderSkeleton.unrender();
        };
        TimeGrid.prototype.updateSize = function (isResize) {
            var _a = this, fillRenderer = _a.fillRenderer, eventRenderer = _a.eventRenderer, mirrorRenderer = _a.mirrorRenderer;
            if (isResize || this.isSlatSizesDirty) {
                this.buildSlatPositions();
                this.isSlatSizesDirty = false;
            }
            if (isResize || this.isColSizesDirty) {
                this.buildColPositions();
                this.isColSizesDirty = false;
            }
            fillRenderer.computeSizes(isResize);
            eventRenderer.computeSizes(isResize);
            mirrorRenderer.computeSizes(isResize);
            fillRenderer.assignSizes(isResize);
            eventRenderer.assignSizes(isResize);
            mirrorRenderer.assignSizes(isResize);
        };
        TimeGrid.prototype._renderSkeleton = function (theme) {
            var el = this.el;
            el.innerHTML =
                '<div class="fc-bg"></div>' +
                    '<div class="fc-slats"></div>' +
                    '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" style="display:none" />';
            this.rootBgContainerEl = el.querySelector('.fc-bg');
            this.slatContainerEl = el.querySelector('.fc-slats');
            this.bottomRuleEl = el.querySelector('.fc-divider');
        };
        TimeGrid.prototype._renderSlats = function (dateProfile) {
            var theme = this.context.theme;
            this.slatContainerEl.innerHTML =
                '<table class="' + theme.getClass('tableGrid') + '">' +
                    this.renderSlatRowHtml(dateProfile) +
                    '</table>';
            this.slatEls = core.findElements(this.slatContainerEl, 'tr');
            this.slatPositions = new core.PositionCache(this.el, this.slatEls, false, true // vertical
            );
            this.isSlatSizesDirty = true;
        };
        // Generates the HTML for the horizontal "slats" that run width-wise. Has a time axis on a side. Depends on RTL.
        TimeGrid.prototype.renderSlatRowHtml = function (dateProfile) {
            var _a = this.context, dateEnv = _a.dateEnv, theme = _a.theme, isRtl = _a.isRtl;
            var html = '';
            var dayStart = core.startOfDay(dateProfile.renderRange.start);
            var slotTime = dateProfile.minTime;
            var slotIterator = core.createDuration(0);
            var slotDate; // will be on the view's first day, but we only care about its time
            var isLabeled;
            var axisHtml;
            // Calculate the time for each slot
            while (core.asRoughMs(slotTime) < core.asRoughMs(dateProfile.maxTime)) {
                slotDate = dateEnv.add(dayStart, slotTime);
                isLabeled = core.wholeDivideDurations(slotIterator, this.labelInterval) !== null;
                axisHtml =
                    '<td class="fc-axis fc-time ' + theme.getClass('widgetContent') + '">' +
                        (isLabeled ?
                            '<span>' + // for matchCellWidths
                                core.htmlEscape(dateEnv.format(slotDate, this.labelFormat)) +
                                '</span>' :
                            '') +
                        '</td>';
                html +=
                    '<tr data-time="' + core.formatIsoTimeString(slotDate) + '"' +
                        (isLabeled ? '' : ' class="fc-minor"') +
                        '>' +
                        (!isRtl ? axisHtml : '') +
                        '<td class="' + theme.getClass('widgetContent') + '"></td>' +
                        (isRtl ? axisHtml : '') +
                        '</tr>';
                slotTime = core.addDurations(slotTime, this.slotDuration);
                slotIterator = core.addDurations(slotIterator, this.slotDuration);
            }
            return html;
        };
        TimeGrid.prototype._renderColumns = function (cells, dateProfile) {
            var _a = this.context, calendar = _a.calendar, view = _a.view, isRtl = _a.isRtl, theme = _a.theme, dateEnv = _a.dateEnv;
            var bgRow = new daygrid.DayBgRow(this.context);
            this.rootBgContainerEl.innerHTML =
                '<table class="' + theme.getClass('tableGrid') + '">' +
                    bgRow.renderHtml({
                        cells: cells,
                        dateProfile: dateProfile,
                        renderIntroHtml: this.renderProps.renderBgIntroHtml
                    }) +
                    '</table>';
            this.colEls = core.findElements(this.el, '.fc-day, .fc-disabled-day');
            for (var col = 0; col < this.colCnt; col++) {
                calendar.publiclyTrigger('dayRender', [
                    {
                        date: dateEnv.toDate(cells[col].date),
                        el: this.colEls[col],
                        view: view
                    }
                ]);
            }
            if (isRtl) {
                this.colEls.reverse();
            }
            this.colPositions = new core.PositionCache(this.el, this.colEls, true, // horizontal
            false);
            this.renderContentSkeleton();
            this.isColSizesDirty = true;
        };
        TimeGrid.prototype._unrenderColumns = function () {
            this.unrenderContentSkeleton();
        };
        /* Content Skeleton
        ------------------------------------------------------------------------------------------------------------------*/
        // Renders the DOM that the view's content will live in
        TimeGrid.prototype.renderContentSkeleton = function () {
            var isRtl = this.context.isRtl;
            var parts = [];
            var skeletonEl;
            parts.push(this.renderProps.renderIntroHtml());
            for (var i = 0; i < this.colCnt; i++) {
                parts.push('<td>' +
                    '<div class="fc-content-col">' +
                    '<div class="fc-event-container fc-mirror-container"></div>' +
                    '<div class="fc-event-container"></div>' +
                    '<div class="fc-highlight-container"></div>' +
                    '<div class="fc-bgevent-container"></div>' +
                    '<div class="fc-business-container"></div>' +
                    '</div>' +
                    '</td>');
            }
            if (isRtl) {
                parts.reverse();
            }
            skeletonEl = this.contentSkeletonEl = core.htmlToElement('<div class="fc-content-skeleton">' +
                '<table>' +
                '<tr>' + parts.join('') + '</tr>' +
                '</table>' +
                '</div>');
            this.colContainerEls = core.findElements(skeletonEl, '.fc-content-col');
            this.mirrorContainerEls = core.findElements(skeletonEl, '.fc-mirror-container');
            this.fgContainerEls = core.findElements(skeletonEl, '.fc-event-container:not(.fc-mirror-container)');
            this.bgContainerEls = core.findElements(skeletonEl, '.fc-bgevent-container');
            this.highlightContainerEls = core.findElements(skeletonEl, '.fc-highlight-container');
            this.businessContainerEls = core.findElements(skeletonEl, '.fc-business-container');
            if (isRtl) {
                this.colContainerEls.reverse();
                this.mirrorContainerEls.reverse();
                this.fgContainerEls.reverse();
                this.bgContainerEls.reverse();
                this.highlightContainerEls.reverse();
                this.businessContainerEls.reverse();
            }
            this.el.appendChild(skeletonEl);
        };
        TimeGrid.prototype.unrenderContentSkeleton = function () {
            core.removeElement(this.contentSkeletonEl);
        };
        // Given a flat array of segments, return an array of sub-arrays, grouped by each segment's col
        TimeGrid.prototype.groupSegsByCol = function (segs) {
            var segsByCol = [];
            var i;
            for (i = 0; i < this.colCnt; i++) {
                segsByCol.push([]);
            }
            for (i = 0; i < segs.length; i++) {
                segsByCol[segs[i].col].push(segs[i]);
            }
            return segsByCol;
        };
        // Given segments grouped by column, insert the segments' elements into a parallel array of container
        // elements, each living within a column.
        TimeGrid.prototype.attachSegsByCol = function (segsByCol, containerEls) {
            var col;
            var segs;
            var i;
            for (col = 0; col < this.colCnt; col++) { // iterate each column grouping
                segs = segsByCol[col];
                for (i = 0; i < segs.length; i++) {
                    containerEls[col].appendChild(segs[i].el);
                }
            }
        };
        /* Now Indicator
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype.getNowIndicatorUnit = function () {
            return 'minute'; // will refresh on the minute
        };
        TimeGrid.prototype.renderNowIndicator = function (segs, date) {
            // HACK: if date columns not ready for some reason (scheduler)
            if (!this.colContainerEls) {
                return;
            }
            var top = this.computeDateTop(date);
            var nodes = [];
            var i;
            // render lines within the columns
            for (i = 0; i < segs.length; i++) {
                var lineEl = core.createElement('div', { className: 'fc-now-indicator fc-now-indicator-line' });
                lineEl.style.top = top + 'px';
                this.colContainerEls[segs[i].col].appendChild(lineEl);
                nodes.push(lineEl);
            }
            // render an arrow over the axis
            if (segs.length > 0) { // is the current time in view?
                var arrowEl = core.createElement('div', { className: 'fc-now-indicator fc-now-indicator-arrow' });
                arrowEl.style.top = top + 'px';
                this.contentSkeletonEl.appendChild(arrowEl);
                nodes.push(arrowEl);
            }
            this.nowIndicatorEls = nodes;
        };
        TimeGrid.prototype.unrenderNowIndicator = function () {
            if (this.nowIndicatorEls) {
                this.nowIndicatorEls.forEach(core.removeElement);
                this.nowIndicatorEls = null;
            }
        };
        /* Coordinates
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype.getTotalSlatHeight = function () {
            return this.slatContainerEl.getBoundingClientRect().height;
        };
        // Computes the top coordinate, relative to the bounds of the grid, of the given date.
        // A `startOfDayDate` must be given for avoiding ambiguity over how to treat midnight.
        TimeGrid.prototype.computeDateTop = function (when, startOfDayDate) {
            if (!startOfDayDate) {
                startOfDayDate = core.startOfDay(when);
            }
            return this.computeTimeTop(core.createDuration(when.valueOf() - startOfDayDate.valueOf()));
        };
        // Computes the top coordinate, relative to the bounds of the grid, of the given time (a Duration).
        TimeGrid.prototype.computeTimeTop = function (duration) {
            var len = this.slatEls.length;
            var dateProfile = this.props.dateProfile;
            var slatCoverage = (duration.milliseconds - core.asRoughMs(dateProfile.minTime)) / core.asRoughMs(this.slotDuration); // floating-point value of # of slots covered
            var slatIndex;
            var slatRemainder;
            // compute a floating-point number for how many slats should be progressed through.
            // from 0 to number of slats (inclusive)
            // constrained because minTime/maxTime might be customized.
            slatCoverage = Math.max(0, slatCoverage);
            slatCoverage = Math.min(len, slatCoverage);
            // an integer index of the furthest whole slat
            // from 0 to number slats (*exclusive*, so len-1)
            slatIndex = Math.floor(slatCoverage);
            slatIndex = Math.min(slatIndex, len - 1);
            // how much further through the slatIndex slat (from 0.0-1.0) must be covered in addition.
            // could be 1.0 if slatCoverage is covering *all* the slots
            slatRemainder = slatCoverage - slatIndex;
            return this.slatPositions.tops[slatIndex] +
                this.slatPositions.getHeight(slatIndex) * slatRemainder;
        };
        // For each segment in an array, computes and assigns its top and bottom properties
        TimeGrid.prototype.computeSegVerticals = function (segs) {
            var options = this.context.options;
            var eventMinHeight = options.timeGridEventMinHeight;
            var i;
            var seg;
            var dayDate;
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                dayDate = this.props.cells[seg.col].date;
                seg.top = this.computeDateTop(seg.start, dayDate);
                seg.bottom = Math.max(seg.top + eventMinHeight, this.computeDateTop(seg.end, dayDate));
            }
        };
        // Given segments that already have their top/bottom properties computed, applies those values to
        // the segments' elements.
        TimeGrid.prototype.assignSegVerticals = function (segs) {
            var i;
            var seg;
            for (i = 0; i < segs.length; i++) {
                seg = segs[i];
                core.applyStyle(seg.el, this.generateSegVerticalCss(seg));
            }
        };
        // Generates an object with CSS properties for the top/bottom coordinates of a segment element
        TimeGrid.prototype.generateSegVerticalCss = function (seg) {
            return {
                top: seg.top,
                bottom: -seg.bottom // flipped because needs to be space beyond bottom edge of event container
            };
        };
        /* Sizing
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype.buildPositionCaches = function () {
            this.buildColPositions();
            this.buildSlatPositions();
        };
        TimeGrid.prototype.buildColPositions = function () {
            this.colPositions.build();
        };
        TimeGrid.prototype.buildSlatPositions = function () {
            this.slatPositions.build();
        };
        /* Hit System
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype.positionToHit = function (positionLeft, positionTop) {
            var dateEnv = this.context.dateEnv;
            var _a = this, snapsPerSlot = _a.snapsPerSlot, slatPositions = _a.slatPositions, colPositions = _a.colPositions;
            var colIndex = colPositions.leftToIndex(positionLeft);
            var slatIndex = slatPositions.topToIndex(positionTop);
            if (colIndex != null && slatIndex != null) {
                var slatTop = slatPositions.tops[slatIndex];
                var slatHeight = slatPositions.getHeight(slatIndex);
                var partial = (positionTop - slatTop) / slatHeight; // floating point number between 0 and 1
                var localSnapIndex = Math.floor(partial * snapsPerSlot); // the snap # relative to start of slat
                var snapIndex = slatIndex * snapsPerSlot + localSnapIndex;
                var dayDate = this.props.cells[colIndex].date;
                var time = core.addDurations(this.props.dateProfile.minTime, core.multiplyDuration(this.snapDuration, snapIndex));
                var start = dateEnv.add(dayDate, time);
                var end = dateEnv.add(start, this.snapDuration);
                return {
                    col: colIndex,
                    dateSpan: {
                        range: { start: start, end: end },
                        allDay: false
                    },
                    dayEl: this.colEls[colIndex],
                    relativeRect: {
                        left: colPositions.lefts[colIndex],
                        right: colPositions.rights[colIndex],
                        top: slatTop,
                        bottom: slatTop + slatHeight
                    }
                };
            }
        };
        /* Event Drag Visualization
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype._renderEventDrag = function (state) {
            if (state) {
                this.eventRenderer.hideByHash(state.affectedInstances);
                if (state.isEvent) {
                    this.mirrorRenderer.renderSegs(this.context, state.segs, { isDragging: true, sourceSeg: state.sourceSeg });
                }
                else {
                    this.fillRenderer.renderSegs('highlight', this.context, state.segs);
                }
            }
        };
        TimeGrid.prototype._unrenderEventDrag = function (state) {
            if (state) {
                this.eventRenderer.showByHash(state.affectedInstances);
                if (state.isEvent) {
                    this.mirrorRenderer.unrender(this.context, state.segs, { isDragging: true, sourceSeg: state.sourceSeg });
                }
                else {
                    this.fillRenderer.unrender('highlight', this.context);
                }
            }
        };
        /* Event Resize Visualization
        ------------------------------------------------------------------------------------------------------------------*/
        TimeGrid.prototype._renderEventResize = function (state) {
            if (state) {
                this.eventRenderer.hideByHash(state.affectedInstances);
                this.mirrorRenderer.renderSegs(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg });
            }
        };
        TimeGrid.prototype._unrenderEventResize = function (state) {
            if (state) {
                this.eventRenderer.showByHash(state.affectedInstances);
                this.mirrorRenderer.unrender(this.context, state.segs, { isResizing: true, sourceSeg: state.sourceSeg });
            }
        };
        /* Selection
        ------------------------------------------------------------------------------------------------------------------*/
        // Renders a visual indication of a selection. Overrides the default, which was to simply render a highlight.
        TimeGrid.prototype._renderDateSelection = function (segs) {
            if (segs) {
                if (this.context.options.selectMirror) {
                    this.mirrorRenderer.renderSegs(this.context, segs, { isSelecting: true });
                }
                else {
                    this.fillRenderer.renderSegs('highlight', this.context, segs);
                }
            }
        };
        TimeGrid.prototype._unrenderDateSelection = function (segs) {
            if (segs) {
                if (this.context.options.selectMirror) {
                    this.mirrorRenderer.unrender(this.context, segs, { isSelecting: true });
                }
                else {
                    this.fillRenderer.unrender('highlight', this.context);
                }
            }
        };
        return TimeGrid;
    }(core.DateComponent));

    var AllDaySplitter = /** @class */ (function (_super) {
        __extends(AllDaySplitter, _super);
        function AllDaySplitter() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AllDaySplitter.prototype.getKeyInfo = function () {
            return {
                allDay: {},
                timed: {}
            };
        };
        AllDaySplitter.prototype.getKeysForDateSpan = function (dateSpan) {
            if (dateSpan.allDay) {
                return ['allDay'];
            }
            else {
                return ['timed'];
            }
        };
        AllDaySplitter.prototype.getKeysForEventDef = function (eventDef) {
            if (!eventDef.allDay) {
                return ['timed'];
            }
            else if (core.hasBgRendering(eventDef)) {
                return ['timed', 'allDay'];
            }
            else {
                return ['allDay'];
            }
        };
        return AllDaySplitter;
    }(core.Splitter));

    var TIMEGRID_ALL_DAY_EVENT_LIMIT = 5;
    var WEEK_HEADER_FORMAT = core.createFormatter({ week: 'short' });
    /* An abstract class for all timegrid-related views. Displays one more columns with time slots running vertically.
    ----------------------------------------------------------------------------------------------------------------------*/
    // Is a manager for the TimeGrid subcomponent and possibly the DayGrid subcomponent (if allDaySlot is on).
    // Responsible for managing width/height.
    var AbstractTimeGridView = /** @class */ (function (_super) {
        __extends(AbstractTimeGridView, _super);
        function AbstractTimeGridView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.splitter = new AllDaySplitter();
            _this.renderSkeleton = core.memoizeRendering(_this._renderSkeleton, _this._unrenderSkeleton);
            /* Header Render Methods
            ------------------------------------------------------------------------------------------------------------------*/
            // Generates the HTML that will go before the day-of week header cells
            _this.renderHeadIntroHtml = function () {
                var _a = _this.context, theme = _a.theme, dateEnv = _a.dateEnv, options = _a.options;
                var range = _this.props.dateProfile.renderRange;
                var dayCnt = core.diffDays(range.start, range.end);
                var weekText;
                if (options.weekNumbers) {
                    weekText = dateEnv.format(range.start, WEEK_HEADER_FORMAT);
                    return '' +
                        '<th class="fc-axis fc-week-number ' + theme.getClass('widgetHeader') + '" ' + _this.axisStyleAttr() + '>' +
                        core.buildGotoAnchorHtml(// aside from link, important for matchCellWidths
                        options, dateEnv, { date: range.start, type: 'week', forceOff: dayCnt > 1 }, core.htmlEscape(weekText) // inner HTML
                        ) +
                        '</th>';
                }
                else {
                    return '<th class="fc-axis ' + theme.getClass('widgetHeader') + '" ' + _this.axisStyleAttr() + '></th>';
                }
            };
            /* Time Grid Render Methods
            ------------------------------------------------------------------------------------------------------------------*/
            // Generates the HTML that goes before the bg of the TimeGrid slot area. Long vertical column.
            _this.renderTimeGridBgIntroHtml = function () {
                var theme = _this.context.theme;
                return '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + _this.axisStyleAttr() + '></td>';
            };
            // Generates the HTML that goes before all other types of cells.
            // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
            _this.renderTimeGridIntroHtml = function () {
                return '<td class="fc-axis" ' + _this.axisStyleAttr() + '></td>';
            };
            /* Day Grid Render Methods
            ------------------------------------------------------------------------------------------------------------------*/
            // Generates the HTML that goes before the all-day cells
            _this.renderDayGridBgIntroHtml = function () {
                var _a = _this.context, theme = _a.theme, options = _a.options;
                return '' +
                    '<td class="fc-axis ' + theme.getClass('widgetContent') + '" ' + _this.axisStyleAttr() + '>' +
                    '<span>' + // needed for matchCellWidths
                    core.getAllDayHtml(options) +
                    '</span>' +
                    '</td>';
            };
            // Generates the HTML that goes before all other types of cells.
            // Affects content-skeleton, mirror-skeleton, highlight-skeleton for both the time-grid and day-grid.
            _this.renderDayGridIntroHtml = function () {
                return '<td class="fc-axis" ' + _this.axisStyleAttr() + '></td>';
            };
            return _this;
        }
        AbstractTimeGridView.prototype.render = function (props, context) {
            _super.prototype.render.call(this, props, context);
            this.renderSkeleton(context);
        };
        AbstractTimeGridView.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.renderSkeleton.unrender();
        };
        AbstractTimeGridView.prototype._renderSkeleton = function (context) {
            this.el.classList.add('fc-timeGrid-view');
            this.el.innerHTML = this.renderSkeletonHtml();
            this.scroller = new core.ScrollComponent('hidden', // overflow x
            'auto' // overflow y
            );
            var timeGridWrapEl = this.scroller.el;
            this.el.querySelector('.fc-body > tr > td').appendChild(timeGridWrapEl);
            timeGridWrapEl.classList.add('fc-time-grid-container');
            var timeGridEl = core.createElement('div', { className: 'fc-time-grid' });
            timeGridWrapEl.appendChild(timeGridEl);
            this.timeGrid = new TimeGrid(timeGridEl, {
                renderBgIntroHtml: this.renderTimeGridBgIntroHtml,
                renderIntroHtml: this.renderTimeGridIntroHtml
            });
            if (context.options.allDaySlot) { // should we display the "all-day" area?
                this.dayGrid = new daygrid.DayGrid(// the all-day subcomponent of this view
                this.el.querySelector('.fc-day-grid'), {
                    renderNumberIntroHtml: this.renderDayGridIntroHtml,
                    renderBgIntroHtml: this.renderDayGridBgIntroHtml,
                    renderIntroHtml: this.renderDayGridIntroHtml,
                    colWeekNumbersVisible: false,
                    cellWeekNumbersVisible: false
                });
                // have the day-grid extend it's coordinate area over the <hr> dividing the two grids
                var dividerEl = this.el.querySelector('.fc-divider');
                this.dayGrid.bottomCoordPadding = dividerEl.getBoundingClientRect().height;
            }
        };
        AbstractTimeGridView.prototype._unrenderSkeleton = function () {
            this.el.classList.remove('fc-timeGrid-view');
            this.timeGrid.destroy();
            if (this.dayGrid) {
                this.dayGrid.destroy();
            }
            this.scroller.destroy();
        };
        /* Rendering
        ------------------------------------------------------------------------------------------------------------------*/
        // Builds the HTML skeleton for the view.
        // The day-grid and time-grid components will render inside containers defined by this HTML.
        AbstractTimeGridView.prototype.renderSkeletonHtml = function () {
            var _a = this.context, theme = _a.theme, options = _a.options;
            return '' +
                '<table class="' + theme.getClass('tableGrid') + '">' +
                (options.columnHeader ?
                    '<thead class="fc-head">' +
                        '<tr>' +
                        '<td class="fc-head-container ' + theme.getClass('widgetHeader') + '">&nbsp;</td>' +
                        '</tr>' +
                        '</thead>' :
                    '') +
                '<tbody class="fc-body">' +
                '<tr>' +
                '<td class="' + theme.getClass('widgetContent') + '">' +
                (options.allDaySlot ?
                    '<div class="fc-day-grid"></div>' +
                        '<hr class="fc-divider ' + theme.getClass('widgetHeader') + '" />' :
                    '') +
                '</td>' +
                '</tr>' +
                '</tbody>' +
                '</table>';
        };
        /* Now Indicator
        ------------------------------------------------------------------------------------------------------------------*/
        AbstractTimeGridView.prototype.getNowIndicatorUnit = function () {
            return this.timeGrid.getNowIndicatorUnit();
        };
        // subclasses should implement
        // renderNowIndicator(date: DateMarker) {
        // }
        AbstractTimeGridView.prototype.unrenderNowIndicator = function () {
            this.timeGrid.unrenderNowIndicator();
        };
        /* Dimensions
        ------------------------------------------------------------------------------------------------------------------*/
        AbstractTimeGridView.prototype.updateSize = function (isResize, viewHeight, isAuto) {
            _super.prototype.updateSize.call(this, isResize, viewHeight, isAuto); // will call updateBaseSize. important that executes first
            this.timeGrid.updateSize(isResize);
            if (this.dayGrid) {
                this.dayGrid.updateSize(isResize);
            }
        };
        // Adjusts the vertical dimensions of the view to the specified values
        AbstractTimeGridView.prototype.updateBaseSize = function (isResize, viewHeight, isAuto) {
            var _this = this;
            var eventLimit;
            var scrollerHeight;
            var scrollbarWidths;
            // make all axis cells line up
            this.axisWidth = core.matchCellWidths(core.findElements(this.el, '.fc-axis'));
            // hack to give the view some height prior to timeGrid's columns being rendered
            // TODO: separate setting height from scroller VS timeGrid.
            if (!this.timeGrid.colEls) {
                if (!isAuto) {
                    scrollerHeight = this.computeScrollerHeight(viewHeight);
                    this.scroller.setHeight(scrollerHeight);
                }
                return;
            }
            // set of fake row elements that must compensate when scroller has scrollbars
            var noScrollRowEls = core.findElements(this.el, '.fc-row').filter(function (node) {
                return !_this.scroller.el.contains(node);
            });
            // reset all dimensions back to the original state
            this.timeGrid.bottomRuleEl.style.display = 'none'; // will be shown later if this <hr> is necessary
            this.scroller.clear(); // sets height to 'auto' and clears overflow
            noScrollRowEls.forEach(core.uncompensateScroll);
            // limit number of events in the all-day area
            if (this.dayGrid) {
                this.dayGrid.removeSegPopover(); // kill the "more" popover if displayed
                eventLimit = this.context.options.eventLimit;
                if (eventLimit && typeof eventLimit !== 'number') {
                    eventLimit = TIMEGRID_ALL_DAY_EVENT_LIMIT; // make sure "auto" goes to a real number
                }
                if (eventLimit) {
                    this.dayGrid.limitRows(eventLimit);
                }
            }
            if (!isAuto) { // should we force dimensions of the scroll container?
                scrollerHeight = this.computeScrollerHeight(viewHeight);
                this.scroller.setHeight(scrollerHeight);
                scrollbarWidths = this.scroller.getScrollbarWidths();
                if (scrollbarWidths.left || scrollbarWidths.right) { // using scrollbars?
                    // make the all-day and header rows lines up
                    noScrollRowEls.forEach(function (rowEl) {
                        core.compensateScroll(rowEl, scrollbarWidths);
                    });
                    // the scrollbar compensation might have changed text flow, which might affect height, so recalculate
                    // and reapply the desired height to the scroller.
                    scrollerHeight = this.computeScrollerHeight(viewHeight);
                    this.scroller.setHeight(scrollerHeight);
                }
                // guarantees the same scrollbar widths
                this.scroller.lockOverflow(scrollbarWidths);
                // if there's any space below the slats, show the horizontal rule.
                // this won't cause any new overflow, because lockOverflow already called.
                if (this.timeGrid.getTotalSlatHeight() < scrollerHeight) {
                    this.timeGrid.bottomRuleEl.style.display = '';
                }
            }
        };
        // given a desired total height of the view, returns what the height of the scroller should be
        AbstractTimeGridView.prototype.computeScrollerHeight = function (viewHeight) {
            return viewHeight -
                core.subtractInnerElHeight(this.el, this.scroller.el); // everything that's NOT the scroller
        };
        /* Scroll
        ------------------------------------------------------------------------------------------------------------------*/
        // Computes the initial pre-configured scroll state prior to allowing the user to change it
        AbstractTimeGridView.prototype.computeDateScroll = function (duration) {
            var top = this.timeGrid.computeTimeTop(duration);
            // zoom can give weird floating-point values. rather scroll a little bit further
            top = Math.ceil(top);
            if (top) {
                top++; // to overcome top border that slots beyond the first have. looks better
            }
            return { top: top };
        };
        AbstractTimeGridView.prototype.queryDateScroll = function () {
            return { top: this.scroller.getScrollTop() };
        };
        AbstractTimeGridView.prototype.applyDateScroll = function (scroll) {
            if (scroll.top !== undefined) {
                this.scroller.setScrollTop(scroll.top);
            }
        };
        // Generates an HTML attribute string for setting the width of the axis, if it is known
        AbstractTimeGridView.prototype.axisStyleAttr = function () {
            if (this.axisWidth != null) {
                return 'style="width:' + this.axisWidth + 'px"';
            }
            return '';
        };
        return AbstractTimeGridView;
    }(core.View));
    AbstractTimeGridView.prototype.usesMinMaxTime = true; // indicates that minTime/maxTime affects rendering

    var SimpleTimeGrid = /** @class */ (function (_super) {
        __extends(SimpleTimeGrid, _super);
        function SimpleTimeGrid(timeGrid) {
            var _this = _super.call(this, timeGrid.el) || this;
            _this.buildDayRanges = core.memoize(buildDayRanges);
            _this.slicer = new TimeGridSlicer();
            _this.timeGrid = timeGrid;
            return _this;
        }
        SimpleTimeGrid.prototype.firstContext = function (context) {
            context.calendar.registerInteractiveComponent(this, {
                el: this.timeGrid.el
            });
        };
        SimpleTimeGrid.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.context.calendar.unregisterInteractiveComponent(this);
        };
        SimpleTimeGrid.prototype.render = function (props, context) {
            var dateEnv = this.context.dateEnv;
            var dateProfile = props.dateProfile, dayTable = props.dayTable;
            var dayRanges = this.dayRanges = this.buildDayRanges(dayTable, dateProfile, dateEnv);
            var timeGrid = this.timeGrid;
            timeGrid.receiveContext(context); // hack because context is used in sliceProps
            timeGrid.receiveProps(__assign({}, this.slicer.sliceProps(props, dateProfile, null, context.calendar, timeGrid, dayRanges), { dateProfile: dateProfile, cells: dayTable.cells[0] }), context);
        };
        SimpleTimeGrid.prototype.renderNowIndicator = function (date) {
            this.timeGrid.renderNowIndicator(this.slicer.sliceNowDate(date, this.timeGrid, this.dayRanges), date);
        };
        SimpleTimeGrid.prototype.buildPositionCaches = function () {
            this.timeGrid.buildPositionCaches();
        };
        SimpleTimeGrid.prototype.queryHit = function (positionLeft, positionTop) {
            var rawHit = this.timeGrid.positionToHit(positionLeft, positionTop);
            if (rawHit) {
                return {
                    component: this.timeGrid,
                    dateSpan: rawHit.dateSpan,
                    dayEl: rawHit.dayEl,
                    rect: {
                        left: rawHit.relativeRect.left,
                        right: rawHit.relativeRect.right,
                        top: rawHit.relativeRect.top,
                        bottom: rawHit.relativeRect.bottom
                    },
                    layer: 0
                };
            }
        };
        return SimpleTimeGrid;
    }(core.DateComponent));
    function buildDayRanges(dayTable, dateProfile, dateEnv) {
        var ranges = [];
        for (var _i = 0, _a = dayTable.headerDates; _i < _a.length; _i++) {
            var date = _a[_i];
            ranges.push({
                start: dateEnv.add(date, dateProfile.minTime),
                end: dateEnv.add(date, dateProfile.maxTime)
            });
        }
        return ranges;
    }
    var TimeGridSlicer = /** @class */ (function (_super) {
        __extends(TimeGridSlicer, _super);
        function TimeGridSlicer() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TimeGridSlicer.prototype.sliceRange = function (range, dayRanges) {
            var segs = [];
            for (var col = 0; col < dayRanges.length; col++) {
                var segRange = core.intersectRanges(range, dayRanges[col]);
                if (segRange) {
                    segs.push({
                        start: segRange.start,
                        end: segRange.end,
                        isStart: segRange.start.valueOf() === range.start.valueOf(),
                        isEnd: segRange.end.valueOf() === range.end.valueOf(),
                        col: col
                    });
                }
            }
            return segs;
        };
        return TimeGridSlicer;
    }(core.Slicer));

    var TimeGridView = /** @class */ (function (_super) {
        __extends(TimeGridView, _super);
        function TimeGridView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.buildDayTable = core.memoize(buildDayTable);
            return _this;
        }
        TimeGridView.prototype.render = function (props, context) {
            _super.prototype.render.call(this, props, context); // for flags for updateSize. also _renderSkeleton/_unrenderSkeleton
            var _a = this.props, dateProfile = _a.dateProfile, dateProfileGenerator = _a.dateProfileGenerator;
            var nextDayThreshold = context.nextDayThreshold;
            var dayTable = this.buildDayTable(dateProfile, dateProfileGenerator);
            var splitProps = this.splitter.splitProps(props);
            if (this.header) {
                this.header.receiveProps({
                    dateProfile: dateProfile,
                    dates: dayTable.headerDates,
                    datesRepDistinctDays: true,
                    renderIntroHtml: this.renderHeadIntroHtml
                }, context);
            }
            this.simpleTimeGrid.receiveProps(__assign({}, splitProps['timed'], { dateProfile: dateProfile,
                dayTable: dayTable }), context);
            if (this.simpleDayGrid) {
                this.simpleDayGrid.receiveProps(__assign({}, splitProps['allDay'], { dateProfile: dateProfile,
                    dayTable: dayTable,
                    nextDayThreshold: nextDayThreshold, isRigid: false }), context);
            }
            this.startNowIndicator(dateProfile, dateProfileGenerator);
        };
        TimeGridView.prototype._renderSkeleton = function (context) {
            _super.prototype._renderSkeleton.call(this, context);
            if (context.options.columnHeader) {
                this.header = new core.DayHeader(this.el.querySelector('.fc-head-container'));
            }
            this.simpleTimeGrid = new SimpleTimeGrid(this.timeGrid);
            if (this.dayGrid) {
                this.simpleDayGrid = new daygrid.SimpleDayGrid(this.dayGrid);
            }
        };
        TimeGridView.prototype._unrenderSkeleton = function () {
            _super.prototype._unrenderSkeleton.call(this);
            if (this.header) {
                this.header.destroy();
            }
            this.simpleTimeGrid.destroy();
            if (this.simpleDayGrid) {
                this.simpleDayGrid.destroy();
            }
        };
        TimeGridView.prototype.renderNowIndicator = function (date) {
            this.simpleTimeGrid.renderNowIndicator(date);
        };
        return TimeGridView;
    }(AbstractTimeGridView));
    function buildDayTable(dateProfile, dateProfileGenerator) {
        var daySeries = new core.DaySeries(dateProfile.renderRange, dateProfileGenerator);
        return new core.DayTable(daySeries, false);
    }

    var main = core.createPlugin({
        defaultView: 'timeGridWeek',
        views: {
            timeGrid: {
                class: TimeGridView,
                allDaySlot: true,
                slotDuration: '00:30:00',
                slotEventOverlap: true // a bad name. confused with overlap/constraint system
            },
            timeGridDay: {
                type: 'timeGrid',
                duration: { days: 1 }
            },
            timeGridWeek: {
                type: 'timeGrid',
                duration: { weeks: 1 }
            }
        }
    });

    exports.AbstractTimeGridView = AbstractTimeGridView;
    exports.TimeGrid = TimeGrid;
    exports.TimeGridSlicer = TimeGridSlicer;
    exports.TimeGridView = TimeGridView;
    exports.buildDayRanges = buildDayRanges;
    exports.buildDayTable = buildDayTable;
    exports.default = main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
