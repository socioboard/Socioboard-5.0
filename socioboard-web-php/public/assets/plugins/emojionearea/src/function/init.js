define([
    'jquery',
    'var/blankImg',
    'var/setInterval',
    'var/clearInterval',
    'function/trigger',
    'function/attach',
    'function/shortnameTo',
    'function/pasteHtmlAtCaret',
    'function/getOptions',
    'function/saveSelection',
    'function/restoreSelection',
    'function/htmlFromText',
    'function/textFromHtml'
],
function($, blankImg, setInterval, clearInterval, trigger, attach, shortnameTo, pasteHtmlAtCaret,
         getOptions, saveSelection, restoreSelection, htmlFromText, textFromHtml)
{
    return function(self, source, options) {

        options = getOptions(options);

        var sourceValFunc = source.is("INPUT") ? "val" : "text",
            app = options.template,
            stayFocused = false,
            container = !!options.container ? $(options.container) : false,
            editor, filters, tabs, button, scrollArea, filtersBtns, filtersArrowLeft, filtersArrowRight,
            filtersWidth, scrollLeft = 0, scrollAreaWidth = 0, filterWidth,
            resizeHandler = function() {
                var width = filters.width();
                if (width !== filtersWidth) {
                    filtersWidth = width;
                    trigger(self, 'resize', [editor]);
                }
            }, resizeHandlerID,
            hide = function(e) {
                return e.addClass("ea-hidden");
            },
            show = function(e) {
                return e.removeClass("ea-hidden");
            };

        self.sprite = options.useSprite;
        self.shortnames = options.shortnames;
        self.standalone = options.standalone;

        // in standalone mode we're using css for positioning so fix order
        if (self.standalone) {
            app = "<button/><filters/><tabs/>";
        }

        var els = ["filters", "tabs"];
        if (self.standalone) {
            els.push("button");
        } else {
            els.push("editor");
        }
        
        for (var el = els, i=0; i<3; i++) {
            app = app.replace(new RegExp('<' + el[i] + '/?>' ,'i'), '<div class="emojionearea-' + el[i] + '"></div>');
        }

        app = $('<div/>', {"class" : source.attr("class"), role: "application"}).addClass("emojionearea").html(app);
        
        if (self.standalone) {
            button = self.button = app.find(".emojionearea-button");
            app.addClass("has-button");
        } else {
            editor = self.editor = app.find(".emojionearea-editor")
                .attr({
                    contenteditable: true,
                    placeholder: options["placeholder"] || source.data("placeholder") || source.attr("placeholder") || "",
                    tabindex: 0
                });
                
            for (var attr = ["dir", "spellcheck", "autocomplete", "autocorrect", "autocapitalize"], j=0; j<5; j++) {
                editor.attr(attr[j], options[attr[j]]);
            }
        }
        
        filters = app.find(".emojionearea-filters");
        if (options.autoHideFilters || self.standalone) {
            hide(filters);
        }

        tabs = app.find(".emojionearea-tabs");
        hide(tabs);

        $.each(options.filters, function(filter, params) {
            $("<i/>", {"class": "emojionearea-filter", "data-filter": filter})
                .wrapInner(shortnameTo(params.icon, self.sprite ? '<i class="emojione-{uni}"/>' : '<img class="emojione" src="{img}"/>'))
                .appendTo(filters);
            hide($("<div/>", {"class": "emojionearea-tab emojionearea-tab-" + filter}))
                .data("items", shortnameTo(params.emoji, '<i class="emojibtn" role="button"><' +
                    (self.sprite ? 'i class="emojione-{uni}"' : 'img class="emojione" src="{img}"') +
                    ' data-name="{name}"/></i>'))
                .appendTo(tabs);
        });

        filters.wrapInner('<div class="emojionearea-filters-scroll"/>');
        filtersArrowLeft = $('<i class="emojionearea-filter-arrow-left"/>', {role: "button"}).appendTo(filters);
        filtersArrowRight = $('<i class="emojionearea-filter-arrow-right"/>', {role: "button"}).appendTo(filters);

        filtersBtns = filters.find(".emojionearea-filter");
        scrollArea = filters.children(".emojionearea-filters-scroll");

        if (!!container) {
            container.wrapInner(app);
        } else {
            app.insertAfter(source);
        }

        if (options.hideSource) {
            source.hide();
        }

        var initial = source[sourceValFunc]();
        var placeholder = false;
        // if there's no initial value try and fetch a placeholder
        if (!initial && self.standalone) {
            placeholder = true;
            initial = source.data("placeholder") || ":smile:";
        }
        self.setText(initial, placeholder);

        attach(self, [filters, tabs], {mousedown: "area.mousedown"}, editor);
        attach(self, editor, {paste :"editor.paste"}, editor);
        attach(self, editor, ["focus", "blur"], function() { return !!stayFocused ? false : editor; });
        attach(self, [editor, filters, tabs], ["mousedown", "mouseup", "click", "keyup", "keydown", "keypress"], editor);
        attach(self, filters.find(".emojionearea-filter"), {click: "filter.click"});
        attach(self, filtersArrowLeft,  {click: "arrowLeft.click",  mousedown: "arrowLeft.mousedown",  mouseup: "arrowLeft.mouseup"});
        attach(self, filtersArrowRight, {click: "arrowRight.click", mousedown: "arrowRight.mousedown", mouseup: "arrowRight.mouseup"});
        attach(self, button, { click: "button.click" });

        var mousedownInterval;
        function clearMousedownInterval() {
            if (mousedownInterval) {
                clearInterval(mousedownInterval);
            }
        }
        function scrollFilters() {
            if (!scrollAreaWidth) {
                $.each(filtersBtns, function (i, e) {
                    scrollAreaWidth += $(e).outerWidth(true);
                });
                filterWidth = filtersBtns.eq(0).outerWidth(true);
            }
            if (scrollAreaWidth > filtersWidth) {
                filtersArrowRight.addClass("active");
                filtersArrowLeft.addClass("active");

                if (scrollLeft + scrollAreaWidth <= filtersWidth) {
                    scrollLeft = filtersWidth - scrollAreaWidth;
                    filtersArrowRight.removeClass("active");
                    clearMousedownInterval();
                } else if (scrollLeft >= 0) {
                    scrollLeft = 0;
                    filtersArrowLeft.removeClass("active");
                    clearMousedownInterval();
                }
                scrollArea.css("left", scrollLeft);
            } else {
                clearMousedownInterval();
                if (scrollLeft !== 0) {
                    scrollLeft = 0;
                    scrollArea.css("left", scrollLeft);
                }
                filtersArrowRight.removeClass("active");
                filtersArrowLeft.removeClass("active");
            }
        }
        function filterScrollLeft(val) {
            val = val | filterWidth;
            scrollLeft += val;
            scrollFilters();
        }
        function filterScrollRight(val) {
            val = val | filterWidth;
            scrollLeft -= val;
            scrollFilters();
        }

        if (typeof options.events === 'object' && !$.isEmptyObject(options.events)) {
            $.each(options.events, function(event, handler) {
                self.on(event.replace(/_/g, '.'), handler);
            });
        }

        self.on("@filter.click", function(element) {
                if (element.is(".active")) {
                    element.removeClass("active");
                    hide(tabs);
                } else {
                    filtersBtns.filter(".active").removeClass("active");
                    element.addClass("active");
                    var i, timer, tab = show(hide(show(tabs).children())
                        .filter(".emojionearea-tab-" + element.data("filter"))),
                        items = tab.data("items"),
                        event = {click: "emojibtn.click"};
                    if (items) {
                        tab.data("items", false);
                        items = items.split(',');
                        if (self.sprite) {
                            tab.html(items.join(''));
                            attach(self, tab.find(".emojibtn"), event);
                        } else {
                            timer = setInterval(function () {
                                for (i = 0; i < 20 && items.length; i++) {
                                    tab.append(items.shift());
                                }
                                attach(self, tab.find(".emojibtn").not(".handled").addClass("handled"), event);
                                if (!items.length) clearInterval(timer);
                            }, 5);
                        }
                    }
                }
            })

            .on("@resize", function() {
                scrollFilters();
            })

            .on("@arrowLeft.click", filterScrollLeft)
            .on("@arrowRight.click", filterScrollRight)
            .on("@arrowLeft.mousedown", function() {
                mousedownInterval = setInterval(function() {filterScrollLeft(5);}, 50);
            })
            .on("@arrowRight.mousedown", function() {
                mousedownInterval = setInterval(function() {filterScrollRight(5);}, 50);
            })
            .on("@arrowLeft.mouseup @arrowRight.mouseup",clearMousedownInterval)

            .on("@editor.paste", function(element) {
                stayFocused = true;
                // inserts invisible character for fix caret
                pasteHtmlAtCaret('<span>&#8291;</span>');

                var sel = saveSelection(element[0]),
                    editorScrollTop = element.scrollTop(),
                    clipboard = $("<div/>", {contenteditable: true})
                        .css({position: "fixed", left: "-999px", width: "1px", height: "1px", top: "20px", overflow: "hidden"})
                        .appendTo($("BODY"))
                        .focus();

                window.setTimeout(function() {
                    var caretID = "caret-" + (new Date()).getTime();
                    element.focus();
                    restoreSelection(element[0], sel);
                    var text = textFromHtml(clipboard.html().replace(/\r\n|\n|\r/g, '<br>'), self),
                        html = htmlFromText(text, self);
                    pasteHtmlAtCaret(html);
                    clipboard.remove();
                    pasteHtmlAtCaret('<i id="' + caretID +'"></i>');
                    element.scrollTop(editorScrollTop);
                    var caret = $("#" + caretID),
                        top = caret.offset().top - element.offset().top,
                        height = element.height();
                    if (editorScrollTop + top >= height || editorScrollTop > top) {
                        element.scrollTop(editorScrollTop + top - 2 * height/3);
                    }
                    caret.remove();
                    stayFocused = false;
                    trigger(self, 'paste', [element, text, html]);
                }, 200);
            })

            .on("@emojibtn.click", function(element) {
                var img = shortnameTo(element.children().data("name"),
                        '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="'+blankImg+'">' : '" src="{img}">'));
                
                if (self.standalone) {
                    self.button.html(img);
                    self.button.removeClass("placeholder");
                    app.find(".emojionearea-filter.active").trigger("click");
                    hide(filters);
                } else {
                    saveSelection(editor[0]);
                    pasteHtmlAtCaret(img);
                }
            })

            .on("@area.mousedown", function(element, event) {
                if (!options.autoHideFilters && !app.is(".focused")) {
                    element.focus();
                }
                event.preventDefault();
                return false;
            })

            .on("@change", function(element) {
                var html = element.html().replace(/<\/?(?:div|span|p)[^>]*>/ig, '');
                // clear input, fix: chrome add <br> on contenteditable is empty
                if (!html.length || /^<br[^>]*>$/i.test(html)) {
                    self.setText('', false);
                }
                source[sourceValFunc](self.getText());
            })

            .on("@focus", function() {
                resizeHandler();
                resizeHandlerID = setInterval(resizeHandler, 500);
                app.addClass("focused");
                if (options.autoHideFilters) {
                    show(filters);
                }
            })

            .on("@blur", function(element) {
                scrollLeft = 0;
                scrollFilters();
                app.removeClass("focused");
                clearInterval(resizeHandlerID);
                if (options.autoHideFilters) {
                    hide(filters);
                }
                filtersBtns.filter(".active").removeClass("active");
                hide(tabs);
                var content = element.html();
                if (self.content !== content) {
                    self.content = content;
                    trigger(self, 'change', [editor]);
                    source.blur().trigger("change");
                } else {
                    source.blur();
                }
            })

            .on("@button.click", function(element) {
                if (app.find(".emojionearea-filters").hasClass("ea-hidden")) {
                    resizeHandler();
                    resizeHandlerID = setInterval(resizeHandler, 500);
                    scrollFilters();
                    show(filters);
                    app.find(".emojionearea-filter:first").trigger("click");
                } else {
                    app.find(".emojionearea-filter.active").trigger("click");
                    hide(filters);
                    scrollFilters();
                    clearInterval(resizeHandlerID);
                }
            });

        trigger(self, 'ready', [editor]);
    };
});