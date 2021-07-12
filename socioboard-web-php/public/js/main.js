"use strict";

// Component Definition
var SBApp = function() {
    /** @type {object} colors State colors **/
    var settings = {};

    var initTooltip = function(el) {
        var theme = el.data('theme') ? 'tooltip-' + el.data('theme') : '';
        var width = el.data('width') == 'auto' ? 'tooltop-auto-width' : '';
        var trigger = el.data('trigger') ? el.data('trigger') : 'hover';

        $(el).tooltip({
            trigger: trigger,
            template: '<div class="tooltip ' + theme + ' ' + width + '" role="tooltip">\
                <div class="arrow"></div>\
                <div class="tooltip-inner"></div>\
            </div>'
        });
    }

    var initTooltips = function() {
        // init bootstrap tooltips
        $('[data-toggle="tooltip"]').each(function() {
            initTooltip($(this));
        });
    }

    var initPopover = function(el) {
        var skin = el.data('skin') ? 'popover-' + el.data('skin') : '';
        var triggerValue = el.data('trigger') ? el.data('trigger') : 'hover';

        el.popover({
            trigger: triggerValue,
            template: '\
            <div class="popover ' + skin + '" role="tooltip">\
                <div class="arrow"></div>\
                <h3 class="popover-header"></h3>\
                <div class="popover-body"></div>\
            </div>'
        });
    }

    var initPopovers = function() {
        // init bootstrap popover
        $('[data-toggle="popover"]').each(function() {
            initPopover($(this));
        });
    }

    var initFileInput = function() {
        // init bootstrap popover
        $('.custom-file-input').on('change', function() {
            var fileName = $(this).val();
            $(this).next('.custom-file-label').addClass("selected").html(fileName);
        });
    }

    var initScroll = function() {
        $('[data-scroll="true"]').each(function() {
            var el = $(this);

            SBUtil.scrollInit(this, {
                mobileNativeScroll: true,
                handleWindowResize: true,
                rememberPosition: (el.data('remember-position') == 'true' ? true : false),
                height: function() {
                    if (SBUtil.isBreakpointDown('lg') && el.data('mobile-height')) {
                        return el.data('mobile-height');
                    } else {
                        return el.data('height');
                    }
                }
            });
        });
    }

    var initAlerts = function() {
        // init bootstrap popover
        $('body').on('click', '[data-close=alert]', function() {
            $(this).closest('.alert').hide();
        });
    }

    var initCard = function(el, options) {
        // init card tools
        var el = $(el);
        var card = new SBCard(el[0], options);
    }

    var initCards = function() {
        // init card tools
        $('[data-card="true"]').each(function() {
            var el = $(this);
            var options = {};

            if (el.data('data-card-initialized') !== true) {
                initCard(el, options);
                el.data('data-card-initialized', true);
            }
        });
    }

    var initStickyCard = function() {
        if (typeof Sticky === 'undefined') {
            return;
        }

        var sticky = new Sticky('[data-sticky="true"]');
    }

    var initAbsoluteDropdown = function(context) {
        var dropdownMenu;

        if (!context) {
            return;
        }

        $('body').on('show.bs.dropdown', context, function(e) {
        	dropdownMenu = $(e.target).find('.dropdown-menu');
        	$('body').append(dropdownMenu.detach());
        	dropdownMenu.css('display', 'block');
        	dropdownMenu.position({
        		'my': 'right top',
        		'at': 'right bottom',
        		'of': $(e.relatedTarget),
        	});
        }).on('hide.bs.dropdown', context, function(e) {
        	$(e.target).append(dropdownMenu.detach());
        	dropdownMenu.hide();
        });
    }

    var initAbsoluteDropdowns = function() {
        $('body').on('show.bs.dropdown', function(e) {
            // e.target is always parent (contains toggler and menu)
            var $toggler = $(e.target).find("[data-attach='body']");
            if ($toggler.length === 0) {
                return;
            }
            var $dropdownMenu = $(e.target).find('.dropdown-menu');
            // save detached menu
            var $detachedDropdownMenu = $dropdownMenu.detach();
            // save reference to detached menu inside data of toggler
            $toggler.data('dropdown-menu', $detachedDropdownMenu);

            $('body').append($detachedDropdownMenu);
            $detachedDropdownMenu.css('display', 'block');
            $detachedDropdownMenu.position({
                my: 'right top',
                at: 'right bottom',
                of: $(e.relatedTarget),
            });
        });

        $('body').on('hide.bs.dropdown', function(e) {
            var $toggler = $(e.target).find("[data-attach='body']");
            if ($toggler.length === 0) {
                return;
            }
            // access to reference of detached menu from data of toggler
            var $detachedDropdownMenu = $toggler.data('dropdown-menu');
            // re-append detached menu inside parent
            $(e.target).append($detachedDropdownMenu.detach());
            // hide dropdown
            $detachedDropdownMenu.hide();
        });
    };

    return {
        init: function(settingsArray) {
            if (settingsArray) {
                settings = settingsArray;
            }

            SBApp.initComponents();
        },

        initComponents: function() {
            initScroll();
            initTooltips();
            initPopovers();
            initAlerts();
            initFileInput();
            initCards();
            initStickyCard();
            initAbsoluteDropdowns();
        },

        initTooltips: function() {
            initTooltips();
        },

        initTooltip: function(el) {
            initTooltip(el);
        },

        initPopovers: function() {
            initPopovers();
        },

        initPopover: function(el) {
            initPopover(el);
        },

        initCard: function(el, options) {
            initCard(el, options);
        },

        initCards: function() {
            initCards();
        },

        initSticky: function() {
            initSticky();
        },

        initAbsoluteDropdown: function(context) {
            initAbsoluteDropdown(context);
        },

        block: function(target, options) {
            var el = $(target);

            options = $.extend(true, {
                opacity: 0.05,
                overlayColor: '#000000',
                type: '',
                size: '',
                state: 'primary',
                centerX: true,
                centerY: true,
                message: '',
                shadow: true,
                width: 'auto'
            }, options);

            var html;
            var version = options.type ? 'spinner-' + options.type : '';
            var state = options.state ? 'spinner-' + options.state : '';
            var size = options.size ? 'spinner-' + options.size : '';
            var spinner = '<span class="spinner ' + version + ' ' + state + ' ' + size + '"></span';

            if (options.message && options.message.length > 0) {
                var classes = 'blockui ' + (options.shadow === false ? 'blockui' : '');

                html = '<div class="' + classes + '"><span>' + options.message + '</span>' + spinner + '</div>';

                var el = document.createElement('div');

                $('body').prepend(el);
                SBUtil.addClass(el, classes);
                el.innerHTML = html;
                options.width = SBUtil.actualWidth(el) + 10;
                SBUtil.remove(el);

                if (target == 'body') {
                    html = '<div class="' + classes + '" style="margin-left:-' + (options.width / 2) + 'px;"><span>' + options.message + '</span><span>' + spinner + '</span></div>';
                }
            } else {
                html = spinner;
            }

            var params = {
                message: html,
                centerY: options.centerY,
                centerX: options.centerX,
                css: {
                    top: '30%',
                    left: '50%',
                    border: '0',
                    padding: '0',
                    backgroundColor: 'none',
                    width: options.width
                },
                overlayCSS: {
                    backgroundColor: options.overlayColor,
                    opacity: options.opacity,
                    cursor: 'wait',
                    zIndex: (target == 'body' ? 1100 : 10)
                },
                onUnblock: function() {
                    if (el && el[0]) {
                        SBUtil.css(el[0], 'position', '');
                        SBUtil.css(el[0], 'zoom', '');
                    }
                }
            };

            if (target == 'body') {
                params.css.top = '50%';
                $.blockUI(params);
            } else {
                var el = $(target);
                el.block(params);
            }
        },

        unblock: function(target) {
            if (target && target != 'body') {
                $(target).unblock();
            } else {
                $.unblockUI();
            }
        },

        blockPage: function(options) {
            return SBApp.block('body', options);
        },

        unblockPage: function() {
            return SBApp.unblock('body');
        },

        getSettings: function() {
            return settings;
        }
    };
}();

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBApp;
}

// Initialize SBApp class on document ready
$(document).ready(function() {
    SBApp.init(SBAppSettings);
});

"use strict";

// Component Definition
var SBCard = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        toggleSpeed: 400,
        sticky: {
            releseOnReverse: false,
            offset: 300,
            zIndex: 101
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (SBUtil.data(element).has('card')) {
                the = SBUtil.data(element).get('card');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                SBUtil.data(element).set('card', the);
            }

            return the;
        },

        /**
         * Init card
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);
            the.header = SBUtil.child(element, '.card-header');
            the.footer = SBUtil.child(element, '.card-footer');

            if (SBUtil.child(element, '.card-body')) {
                the.body = SBUtil.child(element, '.card-body');
            } else if (SBUtil.child(element, '.form')) {
                the.body = SBUtil.child(element, '.form');
            }
        },

        /**
         * Build Form Wizard
         */
        build: function() {
            // Remove
            var remove = SBUtil.find(the.header, '[data-card-tool=remove]');
            if (remove) {
                SBUtil.addEvent(remove, 'click', function(e) {
                    e.preventDefault();
                    Plugin.remove();
                });
            }

            // Reload
            var reload = SBUtil.find(the.header, '[data-card-tool=reload]');
            if (reload) {
                SBUtil.addEvent(reload, 'click', function(e) {
                    e.preventDefault();
                    Plugin.reload();
                });
            }

            // Toggle
            var toggle = SBUtil.find(the.header, '[data-card-tool=toggle]');
            if (toggle) {
                SBUtil.addEvent(toggle, 'click', function(e) {
                    e.preventDefault();
                    Plugin.toggle();
                });
            }
        },

        /**
         * Enable stickt mode
         */
        initSticky: function() {
            var lastScrollTop = 0;
            var offset = the.options.sticky.offset;

            if (!the.header) {
                return;
            }

	        window.addEventListener('scroll', Plugin.onScrollSticky);
        },

	    /**
	     * Window scroll handle event for sticky card
	     */
	    onScrollSticky: function(e) {
		    var offset = the.options.sticky.offset;

		    if(isNaN(offset)) return;

		    var st = SBUtil.getScrollTop();

		    if (st >= offset && SBUtil.hasClass(body, 'card-sticky-on') === false) {
			    Plugin.eventTrigger('stickyOn');

			    SBUtil.addClass(body, 'card-sticky-on');

			    Plugin.updateSticky();

		    } else if ((st*1.5) <= offset && SBUtil.hasClass(body, 'card-sticky-on')) {
			    // Back scroll mode
			    Plugin.eventTrigger('stickyOff');

			    SBUtil.removeClass(body, 'card-sticky-on');

			    Plugin.resetSticky();
		    }
	    },

        updateSticky: function() {
            if (!the.header) {
                return;
            }

            var top;

            if (SBUtil.hasClass(body, 'card-sticky-on')) {
                if (the.options.sticky.position.top instanceof Function) {
                    top = parseInt(the.options.sticky.position.top.call(this, the));
                } else {
                    top = parseInt(the.options.sticky.position.top);
                }

                var left;
                if (the.options.sticky.position.left instanceof Function) {
                    left = parseInt(the.options.sticky.position.left.call(this, the));
                } else {
                    left = parseInt(the.options.sticky.position.left);
                }

                var right;
                if (the.options.sticky.position.right instanceof Function) {
                    right = parseInt(the.options.sticky.position.right.call(this, the));
                } else {
                    right = parseInt(the.options.sticky.position.right);
                }

                SBUtil.css(the.header, 'z-index', the.options.sticky.zIndex);
                SBUtil.css(the.header, 'top', top + 'px');
                SBUtil.css(the.header, 'left', left + 'px');
                SBUtil.css(the.header, 'right', right + 'px');
            }
        },

        resetSticky: function() {
            if (!the.header) {
                return;
            }

            if (SBUtil.hasClass(body, 'card-sticky-on') === false) {
                SBUtil.css(the.header, 'z-index', '');
                SBUtil.css(the.header, 'top', '');
                SBUtil.css(the.header, 'left', '');
                SBUtil.css(the.header, 'right', '');
            }
        },

        /**
         * Remove card
         */
        remove: function() {
            if (Plugin.eventTrigger('beforeRemove') === false) {
                return;
            }

            SBUtil.remove(element);

            Plugin.eventTrigger('afterRemove');
        },

        /**
         * Set content
         */
        setContent: function(html) {
            if (html) {
                the.body.innerHTML = html;
            }
        },

        /**
         * Get body
         */
        getBody: function() {
            return the.body;
        },

        /**
         * Get self
         */
        getSelf: function() {
            return element;
        },

        /**
         * Reload
         */
        reload: function() {
            Plugin.eventTrigger('reload');
        },

        /**
         * Toggle
         */
        toggle: function() {
            if (SBUtil.hasClass(element, 'card-collapse') || SBUtil.hasClass(element, 'card-collapsed')) {
                Plugin.expand();
            } else {
                Plugin.collapse();
            }
        },

        /**
         * Collapse
         */
        collapse: function() {
            if (Plugin.eventTrigger('beforeCollapse') === false) {
                return;
            }

            SBUtil.slideUp(the.body, the.options.toggleSpeed, function() {
                Plugin.eventTrigger('afterCollapse');
            });

            SBUtil.addClass(element, 'card-collapse');
        },

        /**
         * Expand
         */
        expand: function() {
            if (Plugin.eventTrigger('beforeExpand') === false) {
                return;
            }

            SBUtil.slideDown(the.body, the.options.toggleSpeed, function() {
                Plugin.eventTrigger('afterExpand');
            });

            SBUtil.removeClass(element, 'card-collapse');
            SBUtil.removeClass(element, 'card-collapsed');
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            //SBUtil.triggerCustomEvent(name);
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the);
                        }
                    } else {
                        return event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Remove card
     */
    the.remove = function() {
        return Plugin.remove(html);
    };

    /**
     * Init sticky card
     */
    the.initSticky = function() {
        return Plugin.initSticky();
    };

    /**
     * Rerender sticky layout
     */
    the.updateSticky = function() {
        return Plugin.updateSticky();
    };

    /**
     * Reset the sticky
     */
    the.resetSticky = function() {
        return Plugin.resetSticky();
    };

	/**
	 * Destroy sticky card
	 */
	the.destroySticky = function() {
		Plugin.resetSticky();
		window.removeEventListener('scroll', Plugin.onScrollSticky);
	};

    /**
     * Reload card
     */
    the.reload = function() {
        return Plugin.reload();
    };

    /**
     * Set card content
     */
    the.setContent = function(html) {
        return Plugin.setContent(html);
    };

    /**
     * Toggle card
     */
    the.toggle = function() {
        return Plugin.toggle();
    };

    /**
     * Collapse card
     */
    the.collapse = function() {
        return Plugin.collapse();
    };

    /**
     * Expand card
     */
    the.expand = function() {
        return Plugin.expand();
    };

    /**
     * Get cardbody
     * @returns {jQuery}
     */
    the.getBody = function() {
        return Plugin.getBody();
    };

    /**
     * Get cardbody
     * @returns {jQuery}
     */
    the.getSelf = function() {
        return Plugin.getSelf();
    };

    /**
     * Attach event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    // Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBCard;
}

"use strict";
// DOCS: https://javascript.info/cookie

// Component Definition
var SBCookie = function() {
  return {
    // returns the cookie with the given name,
    // or undefined if not found
    getCookie: function(name) {
      var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
    },
    // Please note that a cookie value is encoded,
    // so getCookie uses a built-in decodeURIComponent function to decode it.
    setCookie: function(name, value, options) {
      if (!options) {
        options = {};
      }

      options = Object.assign({}, {path: '/'}, options);

      if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
      }

      var updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

      for (var optionKey in options) {
        if (!options.hasOwnProperty(optionKey)) {
          continue;
        }
        updatedCookie += "; " + optionKey;
        var optionValue = options[optionKey];
        if (optionValue !== true) {
          updatedCookie += "=" + optionValue;
        }
      }

      document.cookie = updatedCookie;
    },
    // To delete a cookie, we can call it with a negative expiration date:
    deleteCookie: function(name) {
      setCookie(name, "", {
        'max-age': -1
      })
    }
  }
}();

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SBCookie;
}

"use strict";

// Component Definition
var SBDialog = function(options) {
    // Main object
    var the = this;

    // Get element object
    var element;
    var body = SBUtil.getBody();

    // Default options
    var defaultOptions = {
        'placement' : 'top center',
        'type'  : 'loader',
        'width' : 100,
        'state' : 'default',
        'message' : 'Loading...'
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            Plugin.init(options);

            return the;
        },

        /**
         * Handles subtoggle click toggle
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            the.state = false;
        },

        /**
         * Show dialog
         */
        show: function() {
            Plugin.eventTrigger('show');

            element = document.createElement("DIV");
            SBUtil.setHTML(element, the.options.message);

            SBUtil.addClass(element, 'dialog dialog-shown');
            SBUtil.addClass(element, 'dialog-' + the.options.state);
            SBUtil.addClass(element, 'dialog-' + the.options.type);

            if (the.options.placement == 'top center') {
                SBUtil.addClass(element, 'dialog-top-center');
            }

            body.appendChild(element);

            the.state = 'shown';

            Plugin.eventTrigger('shown');

            return the;
        },

        /**
         * Hide dialog
         */
        hide: function() {
            if (element) {
                Plugin.eventTrigger('hide');

                element.remove();
                the.state = 'hidden';

                Plugin.eventTrigger('hidden');
            }

            return the;
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];

                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the);
                        }
                    } else {
                        return event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Check shown state
     */
    the.shown = function() {
        return the.state == 'shown';
    };

    /**
     * Check hidden state
     */
    the.hidden = function() {
        return the.state == 'hidden';
    };

    /**
     * Show dialog
     */
    the.show = function() {
        return Plugin.show();
    };

    /**
     * Hide dialog
     */
    the.hide = function() {
        return Plugin.hide();
    };

    /**
     * Attach event
     * @returns {SBToggle}
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     * @returns {SBToggle}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    // Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBDialog;
}

"use strict";

// Component Definition
var SBHeader = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (element === undefined) {
        return;
    }

    // Default options
    var defaultOptions = {
        offset: {
            desktop: true,
            tabletAndMobile: true
        },
        releseOnReverse: {
            desktop: false,
            tabletAndMobile: false
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {SBHeader}
         */
        construct: function(options) {
            if (SBUtil.data(element).has('header')) {
                the = SBUtil.data(element).get('header');
            } else {
                // reset header
                Plugin.init(options);

                // build header
                Plugin.build();

                SBUtil.data(element).set('header', the);
            }

            return the;
        },

        /**
         * Handles subheader click toggle
         * @returns {SBHeader}
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);
        },

        /**
         * Reset header
         * @returns {SBHeader}
         */
        build: function() {
            var eventTriggerState = true;
            var lastScrollTop = 0;

            window.addEventListener('scroll', function() {
                var offset = 0, st, attrName;

                if (SBUtil.isBreakpointDown('lg') && the.options.offset.tabletAndMobile === false) {
                    return;
                }

                if (SBUtil.isBreakpointUp('lg') && the.options.offset.desktop === false) {
                    return;
                }

                if (SBUtil.isBreakpointUp('lg')) {
                    offset = the.options.offset.desktop;
                } else if (SBUtil.isBreakpointDown('lg')) {
                    offset = the.options.offset.tabletAndMobile;
                }

                st = SBUtil.getScrollTop();

                if (
                    (SBUtil.isBreakpointDown('lg') && the.options.releseOnReverse.tabletAndMobile) ||
                    (SBUtil.isBreakpointUp('lg') && the.options.releseOnReverse.desktop)
                ) {
                    if (st > offset && lastScrollTop < st) { // down scroll mode
                        if (body.hasAttribute('data-header-scroll') === false) {
                            body.setAttribute('data-header-scroll', 'on');
                        }

                        if (eventTriggerState) {
                            Plugin.eventTrigger('scrollOn', the);
                            eventTriggerState = false;
                        }
                    } else { // back scroll mode
                        if (body.hasAttribute('data-header-scroll') === true) {
                            body.removeAttribute('data-header-scroll');
                        }

                        if (eventTriggerState == false) {
                            Plugin.eventTrigger('scrollOff', the);
                            eventTriggerState = true;
                        }
                    }

                    lastScrollTop = st;
                } else {
                    if (st > offset) { // down scroll mode
                        if (body.hasAttribute('data-header-scroll') === false) {
                            body.setAttribute('data-header-scroll', 'on');
                        }

                        if (eventTriggerState) {
                            Plugin.eventTrigger('scrollOn', the);
                            eventTriggerState = false;
                        }
                    } else { // back scroll mode
                        if (body.hasAttribute('data-header-scroll') === true) {
                            body.removeAttribute('data-header-scroll');
                        }

                        if (eventTriggerState == false) {
                            Plugin.eventTrigger('scrollOff', the);
                            eventTriggerState = true;
                        }
                    }
                }
            });
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the, args);
                        }
                    } else {
                        return event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Register event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    // Run plugin
    Plugin.construct.apply(the, [options]);

    // Init done
    init = true;

    // Return plugin instance
    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBHeader;
}

"use strict";

// Component Definition
var SBImageInput = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        editMode: false
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (SBUtil.data(element).has('imageinput')) {
                the = SBUtil.data(element).get('imageinput');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                SBUtil.data(element).set('imageinput', the);
            }

            return the;
        },

        /**
         * Init avatar
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            the.input = SBUtil.find(element, 'input[type="file"]');
            the.wrapper = SBUtil.find(element, '.image-input-wrapper');
            the.cancel = SBUtil.find(element, '[data-action="cancel"]');
            the.remove = SBUtil.find(element, '[data-action="remove"]');
            the.src = SBUtil.css(the.wrapper, 'backgroundImage');
            the.hidden = SBUtil.find(element, 'input[type="hidden"]');

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);
        },

        /**
         * Build
         */
        build: function() {
            // Handle change
            SBUtil.addEvent(the.input, 'change', function(e) {
                e.preventDefault();

	            if (the.input && the.input.files && the.input.files[0]) {
	                var reader = new FileReader();
	                reader.onload = function(e) {
	                    SBUtil.css(the.wrapper, 'background-image', 'url('+e.target.result +')');
	                }
	                reader.readAsDataURL(the.input.files[0]);

	                SBUtil.addClass(the.element, 'image-input-changed');
                    SBUtil.removeClass(the.element, 'image-input-empty');

                    // Fire change event
                    Plugin.eventTrigger('change');
	            }
            });

            // Handle cancel
            SBUtil.addEvent(the.cancel, 'click', function(e) {
                e.preventDefault();

                // Fire cancel event
                Plugin.eventTrigger('cancel');

	            SBUtil.removeClass(the.element, 'image-input-changed');
                SBUtil.removeClass(the.element, 'image-input-empty');
	            SBUtil.css(the.wrapper, 'background-image', the.src);
	            the.input.value = "";

                if (the.hidden) {
                    the.hidden.value = "0";
                }
            });

            // Handle remove
            SBUtil.addEvent(the.remove, 'click', function(e) {
                e.preventDefault();

                // Fire cancel event
                Plugin.eventTrigger('remove');

	            SBUtil.removeClass(the.element, 'image-input-changed');
                SBUtil.addClass(the.element, 'image-input-empty');
	            SBUtil.css(the.wrapper, 'background-image', "none");
	            the.input.value = "";

                if (the.hidden) {
                    the.hidden.value = "1";
                }
            });
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            //SBUtil.triggerCustomEvent(name);
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the);
                        }
                    } else {
                        return event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Attach event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    // Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBImageInput;
}

"use strict";

// Component Definition
var SBMenu = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        // scrollable area with Perfect Scroll
        scroll: {
            rememberPosition: false
        },

        // accordion submenu mode
        accordion: {
            slideSpeed: 200, // accordion toggle slide speed in milliseconds
            autoScroll: false, // enable auto scrolling(focus) to the clicked menu item
            autoScrollSpeed: 1200,
            expandAll: true // allow having multiple expanded accordions in the menu
        },

        // dropdown submenu mode
        dropdown: {
            timeout: 500 // timeout in milliseconds to show and hide the hoverable submenu dropdown
        }
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {SBMenu}
         */
        construct: function(options) {
            if (SBUtil.data(element).has('menu')) {
                the = SBUtil.data(element).get('menu');
            } else {
                // reset menu
                Plugin.init(options);

                // reset menu
                Plugin.reset();

                // build menu
                Plugin.build();

                SBUtil.data(element).set('menu', the);
            }

            return the;
        },

        /**
         * Handles submenu click toggle
         * @returns {SBMenu}
         */
        init: function(options) {
            the.events = [];

            the.eventHandlers = {};

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            // pause menu
            the.pauseDropdownHoverTime = 0;

            the.uid = SBUtil.getUniqueID();
        },

        update: function(options) {
            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            // pause menu
            the.pauseDropdownHoverTime = 0;

             // reset menu
            Plugin.reset();

            the.eventHandlers = {};

            // build menu
            Plugin.build();

            SBUtil.data(element).set('menu', the);
        },

        reload: function() {
             // reset menu
            Plugin.reset();

            // build menu
            Plugin.build();

            // reset submenu props
            Plugin.resetSubmenuProps();
        },

        /**
         * Reset menu
         * @returns {SBMenu}
         */
        build: function() {
            // General accordion submenu toggle
            the.eventHandlers['event_1'] = SBUtil.on( element, '.menu-toggle', 'click', Plugin.handleSubmenuAccordion);

            // Dropdown mode(hoverable)
            if (Plugin.getSubmenuMode() === 'dropdown' || Plugin.isConditionalSubmenuDropdown()) {
                // dropdown submenu - hover toggle
                the.eventHandlers['event_2'] = SBUtil.on( element, '[data-menu-toggle="hover"]', 'mouseover', Plugin.handleSubmenuDrodownHoverEnter);
                the.eventHandlers['event_3'] = SBUtil.on( element, '[data-menu-toggle="hover"]', 'mouseout', Plugin.handleSubmenuDrodownHoverExit);

                // dropdown submenu - click toggle
                the.eventHandlers['event_4'] = SBUtil.on( element, '[data-menu-toggle="click"] > .menu-toggle, [data-menu-toggle="click"] > .menu-link .menu-toggle', 'click', Plugin.handleSubmenuDropdownClick);
                the.eventHandlers['event_5'] = SBUtil.on( element, '[data-menu-toggle="tab"] > .menu-toggle, [data-menu-toggle="tab"] > .menu-link .menu-toggle', 'click', Plugin.handleSubmenuDropdownTabClick);
            }

            // Handle general link click
            the.eventHandlers['event_6'] = SBUtil.on(element, '.menu-item > .menu-link:not(.menu-toggle):not(.menu-link-toggle-skip)', 'click', Plugin.handleLinkClick);

            // Init scrollable menu
            if (the.options.scroll && the.options.scroll.height) {
                Plugin.scrollInit();
            }
        },

        /**
         * Reset menu
         * @returns {SBMenu}
         */
        reset: function() {
            SBUtil.off( element, 'click', the.eventHandlers['event_1']);

            // dropdown submenu - hover toggle
            SBUtil.off( element, 'mouseover', the.eventHandlers['event_2']);
            SBUtil.off( element, 'mouseout', the.eventHandlers['event_3']);

            // dropdown submenu - click toggle
            SBUtil.off( element, 'click', the.eventHandlers['event_4']);
            SBUtil.off( element, 'click', the.eventHandlers['event_5']);

            // handle link click
            SBUtil.off(element, 'click', the.eventHandlers['event_6']);
        },

        /**
         * Init scroll menu
         *
        */
        scrollInit: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                SBUtil.scrollDestroy(element, true);
                SBUtil.scrollInit(element, {mobileNativeScroll: true, windowScroll: false, resetHeightOnDestroy: true, handleWindowResize: true, height: the.options.scroll.height, rememberPosition: the.options.scroll.rememberPosition});
            } else {
                SBUtil.scrollDestroy(element, true);
            }
        },

        /**
         * Update scroll menu
        */
        scrollUpdate: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                SBUtil.scrollUpdate(element);
            }
        },

        /**
         * Scroll top
        */
        scrollTop: function() {
            if ( the.options.scroll && the.options.scroll.height ) {
                SBUtil.scrollTop(element);
            }
        },

        /**
         * Get submenu mode for current breakpoint and menu state
         * @returns {SBMenu}
         */
        getSubmenuMode: function(el) {
            if ( SBUtil.isBreakpointUp('lg') ) {
                if (el && SBUtil.hasAttr(el, 'data-menu-toggle') && SBUtil.attr(el, 'data-menu-toggle') == 'hover') {
                    return 'dropdown';
                }

                if ( SBUtil.isset(the.options.submenu, 'desktop.state.body') ) {
                    if ( SBUtil.hasClasses(body, the.options.submenu.desktop.state.body) ) {
                        return the.options.submenu.desktop.state.mode;
                    } else {
                        return the.options.submenu.desktop.default;
                    }
                } else if ( SBUtil.isset(the.options.submenu, 'desktop') ) {
                    return the.options.submenu.desktop;
                }
            } else if ( SBUtil.isBreakpointUp('md') && SBUtil.isBreakpointDown('lg') && SBUtil.isset(the.options.submenu, 'tablet') ) {
                return the.options.submenu.tablet;
            } else if ( SBUtil.isBreakpointDown('md') && SBUtil.isset(the.options.submenu, 'mobile') ) {
                return the.options.submenu.mobile;
            } else {
                return false;
            }
        },

        /**
         * Get submenu mode for current breakpoint and menu state
         * @returns {SBMenu}
         */
        isConditionalSubmenuDropdown: function() {
            if ( SBUtil.isBreakpointUp('lg') && SBUtil.isset(the.options.submenu, 'desktop.state.body') ) {
                return true;
            } else {
                return false;
            }
        },


        /**
         * Reset submenu attributes
         * @returns {SBMenu}
         */
        resetSubmenuProps: function(e) {
            var submenus = SBUtil.findAll(element, '.menu-submenu');
            if ( submenus ) {
                for (var i = 0, len = submenus.length; i < len; i++) {
                    var submenu = submenus[0];

                    SBUtil.css(submenu, 'display', '');
                    SBUtil.css(submenu, 'overflow', '');

                    if (submenu.hasAttribute('data-hor-direction')) {
                        SBUtil.removeClass(submenu, 'menu-submenu-left');
                        SBUtil.removeClass(submenu, 'menu-submenu-right');
                        SBUtil.addClass(submenu, submenu.getAttribute('data-hor-direction'));
                    }
                }
            }
        },

        /**
         * Handles submenu hover toggle
         * @returns {SBMenu}
         */
        handleSubmenuDrodownHoverEnter: function(e) {
            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }

            if ( the.resumeDropdownHover() === false ) {
                return;
            }

            var item = this;

            if ( item.getAttribute('data-hover') == '1' ) {
                item.removeAttribute('data-hover');
                clearTimeout( item.getAttribute('data-timeout') );
                item.removeAttribute('data-timeout');
            }

            Plugin.showSubmenuDropdown(item);
        },

        /**
         * Handles submenu hover toggle
         * @returns {SBMenu}
         */
        handleSubmenuDrodownHoverExit: function(e) {
            if ( the.resumeDropdownHover() === false ) {
                return;
            }

            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }

            var item = this;
            var time = the.options.dropdown.timeout;

            var timeout = setTimeout(function() {
                if ( item.getAttribute('data-hover') == '1' ) {
                    Plugin.hideSubmenuDropdown(item, true);
                }
            }, time);

            item.setAttribute('data-hover', '1');
            item.setAttribute('data-timeout', timeout);
        },

        /**
         * Handles submenu click toggle
         * @returns {SBMenu}
         */
        handleSubmenuDropdownClick: function(e) {
            if ( Plugin.getSubmenuMode(this) === 'accordion' ) {
                return;
            }

            var item = this.closest('.menu-item');

            // Trigger click event handlers
            var result = Plugin.eventTrigger('submenuToggle', this, e);
            if (result === false) {
                return;
            }

            if ( item.getAttribute('data-menu-submenu-mode') == 'accordion' ) {
                return;
            }

            if ( SBUtil.hasClass(item, 'menu-item-hover') === false ) {
                SBUtil.addClass(item, 'menu-item-open-dropdown');
                Plugin.showSubmenuDropdown(item);
            } else {
                SBUtil.removeClass(item, 'menu-item-open-dropdown' );
                Plugin.hideSubmenuDropdown(item, true);
            }

            e.preventDefault();
        },

        /**
         * Handles tab click toggle
         * @returns {SBMenu}
         */
        handleSubmenuDropdownTabClick: function(e) {
            if (Plugin.getSubmenuMode(this) === 'accordion') {
                return;
            }
            var item = this.closest('.menu-item');

            // Trigger click event handlers
            var result = Plugin.eventTrigger('submenuToggle', this, e);
            if (result === false) {
                return;
            }

            if (item.getAttribute('data-menu-submenu-mode') == 'accordion') {
                return;
            }

            if (SBUtil.hasClass(item, 'menu-item-hover') == false) {
                SBUtil.addClass(item, 'menu-item-open-dropdown');
                Plugin.showSubmenuDropdown(item);
            }

            e.preventDefault();
        },

        /**
         * Handles link click
         * @returns {SBMenu}
         */
        handleLinkClick: function(e) {
            var submenu = this.closest('.menu-item.menu-item-submenu');

            // Trigger click event handlers
            var result = Plugin.eventTrigger('linkClick', this, e);
            if (result === false) {
                return;
            }

            if ( submenu && Plugin.getSubmenuMode(submenu) === 'dropdown' ) {
                Plugin.hideSubmenuDropdowns();
            }
        },

        /**
         * Handles submenu dropdown close on link click
         * @returns {SBMenu}
         */
        handleSubmenuDropdownClose: function(e, el) {
            // exit if its not submenu dropdown mode
            if (Plugin.getSubmenuMode(el) === 'accordion') {
                return;
            }

            var shown = element.querySelectorAll('.menu-item.menu-item-submenu.menu-item-hover:not(.menu-item-tabs)');

            // check if currently clicked link's parent item ha
            if (shown.length > 0 && SBUtil.hasClass(el, 'menu-toggle') === false && el.querySelectorAll('.menu-toggle').length === 0) {
                // close opened dropdown menus
                for (var i = 0, len = shown.length; i < len; i++) {
                    Plugin.hideSubmenuDropdown(shown[0], true);
                }
            }
        },

        /**
         * helper functions
         * @returns {SBMenu}
         */
        handleSubmenuAccordion: function(e, el) {
            var query;
            var item = el ? el : this;

            // Trigger click event handlers
            var result = Plugin.eventTrigger('submenuToggle', this, e);
            if (result === false) {
                return;
            }

            if ( Plugin.getSubmenuMode(el) === 'dropdown' && (query = item.closest('.menu-item') ) ) {
                if (query.getAttribute('data-menu-submenu-mode') != 'accordion' ) {
                    e.preventDefault();
                    return;
                }
            }

            var li = item.closest('.menu-item');
            var submenu = SBUtil.child(li, '.menu-submenu, .menu-inner');

            if (SBUtil.hasClass(item.closest('.menu-item'), 'menu-item-open-always')) {
                return;
            }

            if ( li && submenu ) {
                e.preventDefault();
                var speed = the.options.accordion.slideSpeed;
                var hasClosables = false;

                if ( SBUtil.hasClass(li, 'menu-item-open') === false ) {
                    // hide other accordions
                    if ( the.options.accordion.expandAll === false ) {
                        var subnav = item.closest('.menu-nav, .menu-subnav');
                        var closables = SBUtil.children(subnav, '.menu-item.menu-item-open.menu-item-submenu:not(.menu-item-here):not(.menu-item-open-always)');

                        if ( subnav && closables ) {
                            for (var i = 0, len = closables.length; i < len; i++) {
                                var el_ = closables[0];
                                var submenu_ = SBUtil.child(el_, '.menu-submenu');
                                if ( submenu_ ) {
                                    SBUtil.slideUp(submenu_, speed, function() {
                                        Plugin.scrollUpdate();
                                        SBUtil.removeClass(el_, 'menu-item-open');
                                    });
                                }
                            }
                        }
                    }

                    SBUtil.slideDown(submenu, speed, function() {
                        Plugin.scrollToItem(item);
                        Plugin.scrollUpdate();

                        Plugin.eventTrigger('submenuToggle', submenu, e);
                    });

                    SBUtil.addClass(li, 'menu-item-open');

                } else {
                    SBUtil.slideUp(submenu, speed, function() {
                        Plugin.scrollToItem(item);
                        Plugin.eventTrigger('submenuToggle', submenu, e);
                    });

                    SBUtil.removeClass(li, 'menu-item-open');
                }
            }
        },

        /**
         * scroll to item function
         * @returns {SBMenu}
         */
        scrollToItem: function(item) {
            // handle auto scroll for accordion submenus
            if ( SBUtil.isBreakpointUp('lg')  && the.options.accordion.autoScroll && element.getAttribute('data-menu-scroll') !== '1' ) {
                SBUtil.scrollTo(item, the.options.accordion.autoScrollSpeed);
            }
        },

        /**
         * Hide submenu dropdown
         * @returns {SBMenu}
         */
        hideSubmenuDropdown: function(item, classAlso) {
            // remove submenu activation class
            if ( classAlso ) {
                SBUtil.removeClass(item, 'menu-item-hover');
                SBUtil.removeClass(item, 'menu-item-active-tab');
            }

            // clear timeout
            item.removeAttribute('data-hover');

            if ( item.getAttribute('data-menu-toggle-class') ) {
                SBUtil.removeClass(body, item.getAttribute('data-menu-toggle-class'));
            }

            var timeout = item.getAttribute('data-timeout');
            item.removeAttribute('data-timeout');
            clearTimeout(timeout);
        },

        /**
         * Hide submenu dropdowns
         * @returns {SBMenu}
         */
        hideSubmenuDropdowns: function() {
            var items;
            if ( items = element.querySelectorAll('.menu-item-submenu.menu-item-hover:not(.menu-item-tabs):not([data-menu-toggle="tab"])') ) {
                for (var j = 0, cnt = items.length; j < cnt; j++) {
                    Plugin.hideSubmenuDropdown(items[j], true);
                }
            }
        },

        /**
         * helper functions
         * @returns {SBMenu}
         */
        showSubmenuDropdown: function(item) {
            // close active submenus
            var list = element.querySelectorAll('.menu-item-submenu.menu-item-hover, .menu-item-submenu.menu-item-active-tab');

            if ( list ) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var el = list[i];
                    if ( item !== el && el.contains(item) === false && item.contains(el) === false ) {
                        Plugin.hideSubmenuDropdown(el, true);
                    }
                }
            }

            // add submenu activation class
            SBUtil.addClass(item, 'menu-item-hover');

            // Change the alignment of submenu is offscreen.
            var submenu = SBUtil.find(item, '.menu-submenu');

            if (submenu && submenu.hasAttribute('data-hor-direction') === false) {
                if (SBUtil.hasClass(submenu, 'menu-submenu-left')) {
                    submenu.setAttribute('data-hor-direction', 'menu-submenu-left');
                } else if (SBUtil.hasClass(submenu, 'menu-submenu-right')) {
                    submenu.setAttribute('data-hor-direction', 'menu-submenu-right');
                }
            }

            if ( submenu && SBUtil.isOffscreen(submenu, 'left', 15) === true ) {
                SBUtil.removeClass(submenu, 'menu-submenu-left');
                SBUtil.addClass(submenu, 'menu-submenu-right');
            } else if ( submenu && SBUtil.isOffscreen(submenu, 'right', 15) === true ) {
                SBUtil.removeClass(submenu, 'menu-submenu-right');
                SBUtil.addClass(submenu, 'menu-submenu-left');
            }

            if ( item.getAttribute('data-menu-toggle-class') ) {
                SBUtil.addClass(body, item.getAttribute('data-menu-toggle-class'));
            }
        },

        /**
         * Handles submenu slide toggle
         * @returns {SBMenu}
         */
        createSubmenuDropdownClickDropoff: function(el) {
            var query;
            var zIndex = (query = SBUtil.child(el, '.menu-submenu') ? SBUtil.css(query, 'z-index') : 0) - 1;

            var dropoff = document.createElement('<div class="menu-dropoff" style="background: transparent; position: fixed; top: 0; bottom: 0; left: 0; right: 0; z-index: ' + zIndex + '"></div>');

            body.appendChild(dropoff);

            SBUtil.addEvent(dropoff, 'click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                SBUtil.remove(this);
                Plugin.hideSubmenuDropdown(el, true);
            });
        },

        /**
         * Handles submenu hover toggle
         * @returns {SBMenu}
         */
        pauseDropdownHover: function(time) {
            var date = new Date();

            the.pauseDropdownHoverTime = date.getTime() + time;
        },

        /**
         * Handles submenu hover toggle
         * @returns {SBMenu}
         */
        resumeDropdownHover: function() {
            var date = new Date();

            return (date.getTime() > the.pauseDropdownHoverTime ? true : false);
        },

        /**
         * Reset menu's current active item
         * @returns {SBMenu}
         */
        resetActiveItem: function(item) {
            var list;
            var parents;

            list = element.querySelectorAll('.menu-item-active');

            for (var i = 0, len = list.length; i < len; i++) {
                var el = list[0];
                SBUtil.removeClass(el, 'menu-item-active');
                SBUtil.hide( SBUtil.child(el, '.menu-submenu') );
                parents = SBUtil.parents(el, '.menu-item-submenu') || [];

                for (var i_ = 0, len_ = parents.length; i_ < len_; i_++) {
                    var el_ = parents[i];
                    SBUtil.removeClass(el_, 'menu-item-open');
                    SBUtil.hide( SBUtil.child(el_, '.menu-submenu') );
                }
            }

            // close open submenus
            if ( the.options.accordion.expandAll === false ) {
                if ( list = element.querySelectorAll('.menu-item-open') ) {
                    for (var i = 0, len = list.length; i < len; i++) {
                        SBUtil.removeClass(parents[0], 'menu-item-open');
                    }
                }
            }
        },

        /**
         * Sets menu's active item
         * @returns {SBMenu}
         */
        setActiveItem: function(item) {
            // reset current active item
            Plugin.resetActiveItem();

            var parents = SBUtil.parents(item, '.menu-item-submenu') || [];
            for (var i = 0, len = parents.length; i < len; i++) {
                SBUtil.addClass(parents[i], 'menu-item-open');
            }

            SBUtil.addClass(item, 'menu-item-active');
        },

        /**
         * Returns page breadcrumbs for the menu's active item
         * @returns {SBMenu}
         */
        getBreadcrumbs: function(item) {
            var query;
            var breadcrumbs = [];
            var link = SBUtil.child(item, '.menu-link');

            breadcrumbs.push({
                text: (query = SBUtil.child(link, '.menu-text') ? query.innerHTML : ''),
                title: link.getAttribute('title'),
                href: link.getAttribute('href')
            });

            var parents = SBUtil.parents(item, '.menu-item-submenu');
            for (var i = 0, len = parents.length; i < len; i++) {
                var submenuLink = SBUtil.child(parents[i], '.menu-link');

                breadcrumbs.push({
                    text: (query = SBUtil.child(submenuLink, '.menu-text') ? query.innerHTML : ''),
                    title: submenuLink.getAttribute('title'),
                    href: submenuLink.getAttribute('href')
                });
            }

            return  breadcrumbs.reverse();
        },

        /**
         * Returns page title for the menu's active item
         * @returns {SBMenu}
         */
        getPageTitle: function(item) {
            var query;

            return (query = SBUtil.child(item, '.menu-text') ? query.innerHTML : '');
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, target, e) {
            for (var i = 0; i < the.events.length; i++ ) {
                var event = the.events[i];
                if ( event.name == name ) {
                    if ( event.one == true ) {
                        if ( event.fired == false ) {
                            the.events[i].fired = true;
                            return event.handler.call(this, target, e);
                        }
                    } else {
                        return event.handler.call(this, target, e);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        },

        removeEvent: function(name) {
            if (the.events[name]) {
                delete the.events[name];
            }
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Update scroll
     */
    the.scrollUpdate = function() {
        return Plugin.scrollUpdate();
    };

    /**
     * Re-init scroll
     */
    the.scrollReInit = function() {
        return Plugin.scrollInit();
    };

    /**
     * Scroll top
     */
    the.scrollTop = function() {
        return Plugin.scrollTop();
    };

    /**
     * Set active menu item
     */
    the.setActiveItem = function(item) {
        return Plugin.setActiveItem(item);
    };

    the.reload = function() {
        return Plugin.reload();
    };

    the.update = function(options) {
        return Plugin.update(options);
    };

    /**
     * Set breadcrumb for menu item
     */
    the.getBreadcrumbs = function(item) {
        return Plugin.getBreadcrumbs(item);
    };

    /**
     * Set page title for menu item
     */
    the.getPageTitle = function(item) {
        return Plugin.getPageTitle(item);
    };

    /**
     * Get submenu mode
     */
    the.getSubmenuMode = function(el) {
        return Plugin.getSubmenuMode(el);
    };

    /**
     * Hide dropdown
     * @returns {Object}
     */
    the.hideDropdown = function(item) {
        Plugin.hideSubmenuDropdown(item, true);
    };

    /**
     * Hide dropdowns
     * @returns {Object}
     */
    the.hideDropdowns = function() {
        Plugin.hideSubmenuDropdowns();
    };

    /**
     * Disable menu for given time
     * @returns {Object}
     */
    the.pauseDropdownHover = function(time) {
        Plugin.pauseDropdownHover(time);
    };

    /**
     * Disable menu for given time
     * @returns {Object}
     */
    the.resumeDropdownHover = function() {
        return Plugin.resumeDropdownHover();
    };

    /**
     * Register event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    the.off = function(name) {
        return Plugin.removeEvent(name);
    };

    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    // Run plugin
    Plugin.construct.apply(the, [options]);

    // Handle plugin on window resize
    SBUtil.addResizeHandler(function() {
        if (init) {
            the.reload();
        }
    });

    // Init done
    init = true;

    // Return plugin instance
    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBMenu;
}

// Plugin global lazy initialization
document.addEventListener("click", function (e) {
    var body = SBUtil.getByTagName('body')[0];
    var query;
    if ( query = body.querySelectorAll('.menu-nav .menu-item.menu-item-submenu.menu-item-hover:not(.menu-item-tabs)[data-menu-toggle="click"]') ) {
        for (var i = 0, len = query.length; i < len; i++) {
            var element = query[i].closest('.menu-nav').parentNode;

            if ( element ) {
                var the = SBUtil.data(element).get('menu');

                if ( !the ) {
                    break;
                }

                if ( !the || the.getSubmenuMode() !== 'dropdown' ) {
                    break;
                }

                if ( e.target !== element && element.contains(e.target) === false ) {
                    the.hideDropdowns();
                }
            }
        }
    }
});

"use strict";

// Component Definition
var SBOffcanvas = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        attrCustom: ''
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        construct: function(options) {
            if (SBUtil.data(element).has('offcanvas')) {
                the = SBUtil.data(element).get('offcanvas');
            } else {
                // Reset offcanvas
                Plugin.init(options);

                // Build offcanvas
                Plugin.build();

                SBUtil.data(element).set('offcanvas', the);
            }

            return the;
        },

        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            the.classBase = the.options.baseClass;
            the.attrCustom = the.options.attrCustom;
            the.classShown = the.classBase + '-on';
            the.classOverlay = the.classBase + '-overlay';
            the.target;

            the.state = SBUtil.hasClass(element, the.classShown) ? 'shown' : 'hidden';
        },

        build: function() {
            // offcanvas toggle
            if (the.options.toggleBy) {
                if (typeof the.options.toggleBy === 'string') {
                    SBUtil.addEvent(SBUtil.getById(the.options.toggleBy), 'click', function(e) {
                        e.preventDefault();
                        the.target = this;
                        Plugin.toggle();
                    });
                } else if (the.options.toggleBy && the.options.toggleBy[0]) {
                    if (the.options.toggleBy[0].target) {
                        for (var i in the.options.toggleBy) {
                            SBUtil.addEvent(SBUtil.getById(the.options.toggleBy[i].target), 'click', function(e) {
                                e.preventDefault();
                                the.target = this;
                                Plugin.toggle();
                            });
                        }
                    } else {
                        for (var i in the.options.toggleBy) {
                            SBUtil.addEvent(SBUtil.getById(the.options.toggleBy[i]), 'click', function(e) {
                                e.preventDefault();
                                the.target = this;
                                Plugin.toggle();
                            });
                        }
                    }

                } else if (the.options.toggleBy && the.options.toggleBy.target) {
                    SBUtil.addEvent( SBUtil.getById(the.options.toggleBy.target), 'click', function(e) {
                        e.preventDefault();
                        the.target = this;
                        Plugin.toggle();
                    });
                }
            }

            // offcanvas close
            var closeBy = SBUtil.getById(the.options.closeBy);
            if (closeBy) {
                SBUtil.addEvent(closeBy, 'click', function(e) {
                    e.preventDefault();
                    the.target = this;
                    Plugin.hide();
                });
            }
        },

        isShown: function() {
            return (the.state == 'shown' ? true : false);
        },

        toggle: function() {;
            Plugin.eventTrigger('toggle');

            if (the.state == 'shown') {
                Plugin.hide();
            } else {
                Plugin.show();
            }
        },

        show: function() {
            if (the.state == 'shown') {
                return;
            }

            Plugin.eventTrigger('beforeShow');

            Plugin.toggleClass('show');

            // Offcanvas panel
            SBUtil.attr(body, 'data-offcanvas-' + the.classBase, 'on');
            SBUtil.addClass(element, the.classShown);

            if (the.attrCustom.length > 0) {
                SBUtil.attr(body, 'data-offcanvas-' + the.classCustom, 'on');
                //SBUtil.addClass(body, the.classCustom);
            }

            the.state = 'shown';

            if (the.options.overlay) {
                the.overlay = SBUtil.insertAfter(document.createElement('DIV') , element );
                SBUtil.addClass(the.overlay, the.classOverlay);

                SBUtil.addEvent(the.overlay, 'click', function(e) {
                    //e.stopPropagation();
                    e.preventDefault();
                    Plugin.hide(the.target);
                });
            }

            Plugin.eventTrigger('afterShow');
        },

        hide: function() {
            if (the.state == 'hidden') {
                return;
            }

            Plugin.eventTrigger('beforeHide');

            Plugin.toggleClass('hide');

            SBUtil.removeAttr(body, 'data-offcanvas-' + the.classBase);
            SBUtil.removeClass(element, the.classShown);

            if (the.attrCustom.length > 0) {
                SBUtil.removeAttr(body, 'data-offcanvas-' + the.attrCustom);
            }

            the.state = 'hidden';

            if (the.options.overlay && the.overlay) {
                SBUtil.remove(the.overlay);
            }

            Plugin.eventTrigger('afterHide');
        },

        toggleClass: function(mode) {
            var id = SBUtil.attr(the.target, 'id');
            var toggleBy;

            if (the.options.toggleBy && the.options.toggleBy[0] && the.options.toggleBy[0].target) {
                for (var i in the.options.toggleBy) {
                    if (the.options.toggleBy[i].target === id) {
                        toggleBy = the.options.toggleBy[i];
                    }
                }
            } else if (the.options.toggleBy && the.options.toggleBy.target) {
                toggleBy = the.options.toggleBy;
            }

            if (toggleBy) {
                var el = SBUtil.getById(toggleBy.target);

                if (mode === 'show') {
                    SBUtil.addClass(el, toggleBy.state);
                }

                if (mode === 'hide') {
                    SBUtil.removeClass(el, toggleBy.state);
                }
            }
        },

        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the, args);
                        }
                    } else {
                        return event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     * @param options
     */
    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Check if canvas is shown
     * @returns {boolean}
     */
    the.isShown = function() {
        return Plugin.isShown();
    };

    /**
     * Set to hide the canvas
     */
    the.hide = function() {
        return Plugin.hide();
    };

    /**
     * Set to show the canvas
     */
    the.show = function() {
        return Plugin.show();
    };

    /**
     * Attach event
     * @param name
     * @param handler
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     * @param name
     * @param handler
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    // Run plugin
    Plugin.construct.apply(the, [options]);

    // Init done
    init = true;

    // Return plugin instance
    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBOffcanvas;
}

"use strict";

// Component Definition
var SBScrolltop = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        offset: 300,
        speed: 6000
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Run plugin
         * @returns {mscrolltop}
         */
        construct: function(options) {
            if (SBUtil.data(element).has('scrolltop')) {
                the = SBUtil.data(element).get('scrolltop');
            } else {
                // reset scrolltop
                Plugin.init(options);

                // build scrolltop
                Plugin.build();

                SBUtil.data(element).set('scrolltop', the);
            }

            return the;
        },

        /**
         * Handles subscrolltop click toggle
         * @returns {mscrolltop}
         */
        init: function(options) {
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);
        },

        build: function() {
            var timer;

            window.addEventListener('scroll', function() {
                SBUtil.throttle(timer, function() {
                    Plugin.handle();
                }, 200);
            });

            // handle button click
            SBUtil.addEvent(element, 'click', Plugin.scroll);
        },

        /**
         * Handles scrolltop click scrollTop
         */
        handle: function() {
            var pos = SBUtil.getScrollTop(); // current vertical position

            if (pos > the.options.offset) {
                if (body.hasAttribute('data-scrolltop') === false) {
                    body.setAttribute('data-scrolltop', 'on');
                }
            } else {
                if (body.hasAttribute('data-scrolltop') === true) {
                    body.removeAttribute('data-scrolltop');
                }
            }
        },

        /**
         * Handles scrolltop click scrollTop
         */
        scroll: function(e) {
            e.preventDefault();

            SBUtil.scrollTop(0, the.options.speed);
        },


        /**
         * Trigger events
         */
        eventTrigger: function(name, args) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the, args);
                        }
                    } else {
                       return event.handler.call(this, the, args);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Get subscrolltop mode
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Set scrolltop content
     * @returns {mscrolltop}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    ///////////////////////////////
    // ** Plugin Construction ** //
    ///////////////////////////////

    // Run plugin
    Plugin.construct.apply(the, [options]);

    // Init done
    init = true;

    // Return plugin instance
    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBScrolltop;
}

"use strict";

// Component Definition
var SBToggle = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        targetToggleMode: 'class' // class|attribute
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (SBUtil.data(element).has('toggle')) {
                the = SBUtil.data(element).get('toggle');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                SBUtil.data(element).set('toggle', the);
            }

            return the;
        },

        /**
         * Handles subtoggle click toggle
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // Merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            //alert(the.options.target.tagName);
            the.target = SBUtil.getById(options.target);

            the.targetState = the.options.targetState;
            the.toggleState = the.options.toggleState;

            if (the.options.targetToggleMode == 'class') {
                the.state = SBUtil.hasClasses(the.target, the.targetState) ? 'on' : 'off';
            } else {
                the.state = SBUtil.hasAttr(the.target, 'data-' + the.targetState) ? SBUtil.attr(the.target, 'data-' + the.targetState) : 'off';
            }
        },

        /**
         * Setup toggle
         */
        build: function() {
            SBUtil.addEvent(element, 'mouseup', Plugin.toggle);
        },

        /**
         * Handles offcanvas click toggle
         */
        toggle: function(e) {
            Plugin.eventTrigger('beforeToggle');

            if (the.state == 'off') {
                Plugin.toggleOn();
            } else {
                Plugin.toggleOff();
            }

            Plugin.eventTrigger('afterToggle');

            e.preventDefault();

            return the;
        },

        /**
         * Handles toggle click toggle
         */
        toggleOn: function() {
            Plugin.eventTrigger('beforeOn');

            if (the.options.targetToggleMode == 'class') {
                SBUtil.addClass(the.target, the.targetState);
            } else {
                SBUtil.attr(the.target, 'data-' + the.targetState, 'on');
            }

            if (the.toggleState) {
                SBUtil.addClass(element, the.toggleState);
            }

            the.state = 'on';

            Plugin.eventTrigger('afterOn');

            Plugin.eventTrigger('toggle');

            return the;
        },

        /**
         * Handles toggle click toggle
         */
        toggleOff: function() {
            Plugin.eventTrigger('beforeOff');

            if (the.options.targetToggleMode == 'class') {
                SBUtil.removeClass(the.target, the.targetState);
            } else {
                SBUtil.removeAttr(the.target, 'data-' + the.targetState);
            }

            if (the.toggleState) {
                SBUtil.removeClass(element, the.toggleState);
            }

            the.state = 'off';

            Plugin.eventTrigger('afterOff');

            Plugin.eventTrigger('toggle');

            return the;
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name) {
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];

                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the);
                        }
                    } else {
                        return event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Get toggle state
     */
    the.getState = function() {
        return the.state;
    };

    /**
     * Toggle
     */
    the.toggle = function() {
        return Plugin.toggle();
    };

    /**
     * Toggle on
     */
    the.toggleOn = function() {
        return Plugin.toggleOn();
    };

    /**
     * Toggle off
     */
    the.toggleOff = function() {
        return Plugin.toggleOff();
    };

    /**
     * Attach event
     * @returns {SBToggle}
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     * @returns {SBToggle}
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    // Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBToggle;
}

"use strict";

/**
 * @class SBUtil  base utilize class that privides helper functions
 */

// Polyfills
/**
 * Element.matches() polyfill (simple version)
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches#Polyfill
 */
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

/**
 * Element.closest() polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
if (!Element.prototype.closest) {
	if (!Element.prototype.matches) {
		Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
	}
	Element.prototype.closest = function (s) {
		var el = this;
		var ancestor = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (ancestor.matches(s)) return ancestor;
			ancestor = ancestor.parentElement;
		} while (ancestor !== null);
		return null;
	};
}

/**
 * ChildNode.remove() polyfill
 * https://gomakethings.com/removing-an-element-from-the-dom-the-es6-way/
 * @author Chris Ferdinandi
 * @license MIT
 */
(function (elem) {
	for (var i = 0; i < elem.length; i++) {
		if (!window[elem[i]] || 'remove' in window[elem[i]].prototype) continue;
		window[elem[i]].prototype.remove = function () {
			this.parentNode.removeChild(this);
		};
	}
})(['Element', 'CharacterData', 'DocumentType']);


//
// requestAnimationFrame polyfill by Erik Möller.
//  With fixes from Paul Irish and Tino Zijdel
//
//  http://paulirish.com/2011/requestanimationframe-for-smart-animating/
//  http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
//
//  MIT license
//
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Source: https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
(function(arr) {
    arr.forEach(function(item) {
        if (item.hasOwnProperty('prepend')) {
            return;
        }
        Object.defineProperty(item, 'prepend', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function prepend() {
                var argArr = Array.prototype.slice.call(arguments),
                    docFrag = document.createDocumentFragment();

                argArr.forEach(function(argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                });

                this.insertBefore(docFrag, this.firstChild);
            }
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

// getAttributeNames
if (Element.prototype.getAttributeNames == undefined) {
  Element.prototype.getAttributeNames = function () {
    var attributes = this.attributes;
    var length = attributes.length;
    var result = new Array(length);
    for (var i = 0; i < length; i++) {
      result[i] = attributes[i].name;
    }
    return result;
  };
}

// Global variables
window.SBUtilElementDataStore = {};
window.SBUtilElementDataStoreID = 0;
window.SBUtilDelegatedEventHandlers = {};

var SBUtil = function() {
    var resizeHandlers = [];

    /** @type {object} breakpoints The device width breakpoints **/
    var breakpoints = {
        sm: 544, // Small screen / phone
        md: 768, // Medium screen / tablet
        lg: 992, // Large screen / desktop
        xl: 1200 // Extra large screen / wide desktop
    };

    /**
     * Handle window resize event with some
     * delay to attach event handlers upon resize complete
     */
    var _windowResizeHandler = function() {
        var _runResizeHandlers = function() {
            // reinitialize other subscribed elements
            for (var i = 0; i < resizeHandlers.length; i++) {
                var each = resizeHandlers[i];
                each.call();
            }
        };

        var timer;

        window.addEventListener('resize', function() {
            SBUtil.throttle(timer, function() {
                _runResizeHandlers();
            }, 200);
        });
    };

    return {
        /**
         * Class main initializer.
         * @param {object} settings.
         * @returns null
         */
        //main function to initiate the theme
        init: function(settings) {
            if (settings && settings.breakpoints) {
                breakpoints = settings.breakpoints;
            }

            _windowResizeHandler();
        },

        /**
         * Adds window resize event handler.
         * @param {function} callback function.
         */
        addResizeHandler: function(callback) {
            resizeHandlers.push(callback);
        },

        /**
         * Removes window resize event handler.
         * @param {function} callback function.
         */
        removeResizeHandler: function(callback) {
            for (var i = 0; i < resizeHandlers.length; i++) {
                if (callback === resizeHandlers[i]) {
                    delete resizeHandlers[i];
                }
            }
        },

        /**
         * Trigger window resize handlers.
         */
        runResizeHandlers: function() {
            _runResizeHandlers();
        },

        resize: function() {
            if (typeof(Event) === 'function') {
                // modern browsers
                window.dispatchEvent(new Event('resize'));
            } else {
                // for IE and other old browsers
                // causes deprecation warning on modern browsers
                var evt = window.document.createEvent('UIEvents');
                evt.initUIEvent('resize', true, false, window, 0);
                window.dispatchEvent(evt);
            }
        },

        /**
         * Get GET parameter value from URL.
         * @param {string} paramName Parameter name.
         * @returns {string}
         */
        getURLParam: function(paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }

            return null;
        },

        /**
         * Checks whether current device is mobile touch.
         * @returns {boolean}
         */
        isMobileDevice: function() {
            var test = (this.getViewPort().width < this.getBreakpoint('lg') ? true : false);

            if (test === false) {
                // For use within normal web clients
                test = navigator.userAgent.match(/iPad/i) != null;
            }

            return test;
        },

        /**
         * Checks whether current device is desktop.
         * @returns {boolean}
         */
        isDesktopDevice: function() {
            return SBUtil.isMobileDevice() ? false : true;
        },

        /**
         * Gets browser window viewport size. Ref:
         * http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
         * @returns {object}
         */
        getViewPort: function() {
            var e = window,
                a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }

            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        },

        /**
         * Checks whether given device mode is currently activated.
         * @param {string} mode Responsive mode name(e.g: desktop,
         *     desktop-and-tablet, tablet, tablet-and-mobile, mobile)
         * @returns {boolean}
         */
        isInResponsiveRange: function(mode) {
            var breakpoint = this.getViewPort().width;

            if (mode == 'general') {
                return true;
            } else if (mode == 'desktop' && breakpoint >= (this.getBreakpoint('lg') + 1)) {
                return true;
            } else if (mode == 'tablet' && (breakpoint >= (this.getBreakpoint('md') + 1) && breakpoint < this.getBreakpoint('lg'))) {
                return true;
            } else if (mode == 'mobile' && breakpoint <= this.getBreakpoint('md')) {
                return true;
            } else if (mode == 'desktop-and-tablet' && breakpoint >= (this.getBreakpoint('md') + 1)) {
                return true;
            } else if (mode == 'tablet-and-mobile' && breakpoint <= this.getBreakpoint('lg')) {
                return true;
            } else if (mode == 'minimal-desktop-and-below' && breakpoint <= this.getBreakpoint('xl')) {
                return true;
            }

            return false;
        },

		/**
         * Checks whether given device mode is currently activated.
         * @param {string} mode Responsive mode name(e.g: desktop,
         *     desktop-and-tablet, tablet, tablet-and-mobile, mobile)
         * @returns {boolean}
         */
        isBreakpointUp: function(mode) {
            var width = this.getViewPort().width;
			var breakpoint = this.getBreakpoint(mode);

			return (width >= breakpoint);
        },

		isBreakpointDown: function(mode) {
            var width = this.getViewPort().width;
			var breakpoint = this.getBreakpoint(mode);

			return (width < breakpoint);
        },

        /**
         * Generates unique ID for give prefix.
         * @param {string} prefix Prefix for generated ID
         * @returns {boolean}
         */
        getUniqueID: function(prefix) {
            return prefix + Math.floor(Math.random() * (new Date()).getTime());
        },

        /**
         * Gets window width for give breakpoint mode.
         * @param {string} mode Responsive mode name(e.g: xl, lg, md, sm)
         * @returns {number}
         */
        getBreakpoint: function(mode) {
            return breakpoints[mode];
        },

        /**
         * Checks whether object has property matchs given key path.
         * @param {object} obj Object contains values paired with given key path
         * @param {string} keys Keys path seperated with dots
         * @returns {object}
         */
        isset: function(obj, keys) {
            var stone;

            keys = keys || '';

            if (keys.indexOf('[') !== -1) {
                throw new Error('Unsupported object path notation.');
            }

            keys = keys.split('.');

            do {
                if (obj === undefined) {
                    return false;
                }

                stone = keys.shift();

                if (!obj.hasOwnProperty(stone)) {
                    return false;
                }

                obj = obj[stone];

            } while (keys.length);

            return true;
        },

        /**
         * Gets highest z-index of the given element parents
         * @param {object} el jQuery element object
         * @returns {number}
         */
        getHighestZindex: function(el) {
            var position, value;

            while (el && el !== document) {
                // Ignore z-index if position is set to a value where z-index is ignored by the browser
                // This makes behavior of this function consistent across browsers
                // WebKit always returns auto if the element is positioned
                position = SBUtil.css(el, 'position');

                if (position === "absolute" || position === "relative" || position === "fixed") {
                    // IE returns 0 when zIndex is not specified
                    // other browsers return a string
                    // we ignore the case of nested elements with an explicit value of 0
                    // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                    value = parseInt(SBUtil.css(el, 'z-index'));

                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }

                el = el.parentNode;
            }

            return null;
        },

        /**
         * Checks whether the element has any parent with fixed positionfreg
         * @param {object} el jQuery element object
         * @returns {boolean}
         */
        hasFixedPositionedParent: function(el) {
            var position;

            while (el && el !== document) {
                position = SBUtil.css(el, 'position');

                if (position === "fixed") {
                    return true;
                }

                el = el.parentNode;
            }

            return false;
        },

        /**
         * Simulates delay
         */
        sleep: function(milliseconds) {
            var start = new Date().getTime();
            for (var i = 0; i < 1e7; i++) {
                if ((new Date().getTime() - start) > milliseconds) {
                    break;
                }
            }
        },

        /**
         * Gets randomly generated integer value within given min and max range
         * @param {number} min Range start value
         * @param {number} max Range end value
         * @returns {number}
         */
        getRandomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * Checks whether Angular library is included
         * @returns {boolean}
         */
        isAngularVersion: function() {
            return window.Zone !== undefined ? true : false;
        },

        // jQuery Workarounds

        // Deep extend:  $.extend(true, {}, objA, objB);
        deepExtend: function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                var obj = arguments[i];

                if (!obj)
                    continue;

                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (typeof obj[key] === 'object')
                            out[key] = SBUtil.deepExtend(out[key], obj[key]);
                        else
                            out[key] = obj[key];
                    }
                }
            }

            return out;
        },

        // extend:  $.extend({}, objA, objB);
        extend: function(out) {
            out = out || {};

            for (var i = 1; i < arguments.length; i++) {
                if (!arguments[i])
                    continue;

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key))
                        out[key] = arguments[i][key];
                }
            }

            return out;
        },

        getById: function(el) {
            if (typeof el === 'string') {
                return document.getElementById(el);
            } else {
                return el;
            }
        },

        getByTag: function(query) {
            return document.getElementsByTagName(query);
        },

        getByTagName: function(query) {
            return document.getElementsByTagName(query);
        },

        getByClass: function(query) {
            return document.getElementsByClassName(query);
        },

        getBody: function() {
            return document.getElementsByTagName('body')[0];
        },

        /**
         * Checks whether the element has given classes
         * @param {object} el jQuery element object
         * @param {string} Classes string
         * @returns {boolean}
         */
        hasClasses: function(el, classes) {
            if (!el) {
                return;
            }

            var classesArr = classes.split(" ");

            for (var i = 0; i < classesArr.length; i++) {
                if (SBUtil.hasClass(el, SBUtil.trim(classesArr[i])) == false) {
                    return false;
                }
            }

            return true;
        },

        hasClass: function(el, className) {
            if (!el) {
                return;
            }

            return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
        },

        addClass: function(el, className) {
            if (!el || typeof className === 'undefined') {
                return;
            }

            var classNames = className.split(' ');

            if (el.classList) {
                for (var i = 0; i < classNames.length; i++) {
                    if (classNames[i] && classNames[i].length > 0) {
                        el.classList.add(SBUtil.trim(classNames[i]));
                    }
                }
            } else if (!SBUtil.hasClass(el, className)) {
                for (var x = 0; x < classNames.length; x++) {
                    el.className += ' ' + SBUtil.trim(classNames[x]);
                }
            }
        },

        removeClass: function(el, className) {
          if (!el || typeof className === 'undefined') {
                return;
            }

            var classNames = className.split(' ');

            if (el.classList) {
                for (var i = 0; i < classNames.length; i++) {
                    el.classList.remove(SBUtil.trim(classNames[i]));
                }
            } else if (SBUtil.hasClass(el, className)) {
                for (var x = 0; x < classNames.length; x++) {
                    el.className = el.className.replace(new RegExp('\\b' + SBUtil.trim(classNames[x]) + '\\b', 'g'), '');
                }
            }
        },

        triggerCustomEvent: function(el, eventName, data) {
            var event;
            if (window.CustomEvent) {
                event = new CustomEvent(eventName, {
                    detail: data
                });
            } else {
                event = document.createEvent('CustomEvent');
                event.initCustomEvent(eventName, true, true, data);
            }

            el.dispatchEvent(event);
        },

        triggerEvent: function(node, eventName) {
            // Make sure we use the ownerDocument from the provided node to avoid cross-window problems
            var doc;
            if (node.ownerDocument) {
                doc = node.ownerDocument;
            } else if (node.nodeType == 9) {
                // the node may be the document itself, nodeType 9 = DOCUMENT_NODE
                doc = node;
            } else {
                throw new Error("Invalid node passed to fireEvent: " + node.id);
            }

            if (node.dispatchEvent) {
                // Gecko-style approach (now the standard) takes more work
                var eventClass = "";

                // Different events have different event classes.
                // If this switch statement can't map an eventName to an eventClass,
                // the event firing is going to fail.
                switch (eventName) {
                case "click": // Dispatching of 'click' appears to not work correctly in Safari. Use 'mousedown' or 'mouseup' instead.
                case "mouseenter":
                case "mouseleave":
                case "mousedown":
                case "mouseup":
                    eventClass = "MouseEvents";
                    break;

                case "focus":
                case "change":
                case "blur":
                case "select":
                    eventClass = "HTMLEvents";
                    break;

                default:
                    throw "fireEvent: Couldn't find an event class for event '" + eventName + "'.";
                    break;
                }
                var event = doc.createEvent(eventClass);

                var bubbles = eventName == "change" ? false : true;
                event.initEvent(eventName, bubbles, true); // All events created as bubbling and cancelable.

                event.synthetic = true; // allow detection of synthetic events
                // The second parameter says go ahead with the default action
                node.dispatchEvent(event, true);
            } else if (node.fireEvent) {
                // IE-old school style
                var event = doc.createEventObject();
                event.synthetic = true; // allow detection of synthetic events
                node.fireEvent("on" + eventName, event);
            }
        },

        index: function( el ){
            var c = el.parentNode.children, i = 0;
            for(; i < c.length; i++ )
                if( c[i] == el ) return i;
        },

        trim: function(string) {
            return string.trim();
        },

        eventTriggered: function(e) {
            if (e.currentTarget.dataset.triggered) {
                return true;
            } else {
                e.currentTarget.dataset.triggered = true;

                return false;
            }
        },

        remove: function(el) {
            if (el && el.parentNode) {
                el.parentNode.removeChild(el);
            }
        },

        find: function(parent, query) {
            parent = SBUtil.getById(parent);
            if (parent) {
                return parent.querySelector(query);
            }
        },

        findAll: function(parent, query) {
            parent = SBUtil.getById(parent);
            if (parent) {
                return parent.querySelectorAll(query);
            }
        },

        insertAfter: function(el, referenceNode) {
            return referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
        },

        parents: function(elem, selector) {
            // Element.matches() polyfill
            if (!Element.prototype.matches) {
                Element.prototype.matches =
                    Element.prototype.matchesSelector ||
                    Element.prototype.mozMatchesSelector ||
                    Element.prototype.msMatchesSelector ||
                    Element.prototype.oMatchesSelector ||
                    Element.prototype.webkitMatchesSelector ||
                    function(s) {
                        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                            i = matches.length;
                        while (--i >= 0 && matches.item(i) !== this) {}
                        return i > -1;
                    };
            }

            // Set up a parent array
            var parents = [];

            // Push each parent element to the array
            for ( ; elem && elem !== document; elem = elem.parentNode ) {
                if (selector) {
                    if (elem.matches(selector)) {
                        parents.push(elem);
                    }
                    continue;
                }
                parents.push(elem);
            }

            // Return our parent array
            return parents;
        },

        children: function(el, selector, log) {
            if (!el || !el.childNodes) {
                return;
            }

            var result = [],
                i = 0,
                l = el.childNodes.length;

            for (var i; i < l; ++i) {
                if (el.childNodes[i].nodeType == 1 && SBUtil.matches(el.childNodes[i], selector, log)) {
                    result.push(el.childNodes[i]);
                }
            }

            return result;
        },

        child: function(el, selector, log) {
            var children = SBUtil.children(el, selector, log);

            return children ? children[0] : null;
        },

        matches: function(el, selector, log) {
            var p = Element.prototype;
            var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };

            if (el && el.tagName) {
                return f.call(el, selector);
            } else {
                return false;
            }
        },

        data: function(el) {
            return {
                set: function(name, data) {
                    if (!el) {
                        return;
                    }

                    if (el.customDataTag === undefined) {
                        window.SBUtilElementDataStoreID++;
                        el.customDataTag = window.SBUtilElementDataStoreID;
                    }

                    if (window.SBUtilElementDataStore[el.customDataTag] === undefined) {
                        window.SBUtilElementDataStore[el.customDataTag] = {};
                    }

                    window.SBUtilElementDataStore[el.customDataTag][name] = data;
                },

                get: function(name) {
                    if (!el) {
                        return;
                    }

                    if (el.customDataTag === undefined) {
                        return null;
                    }

                    return this.has(name) ? window.SBUtilElementDataStore[el.customDataTag][name] : null;
                },

                has: function(name) {
                    if (!el) {
                        return false;
                    }

                    if (el.customDataTag === undefined) {
                        return false;
                    }

                    return (window.SBUtilElementDataStore[el.customDataTag] && window.SBUtilElementDataStore[el.customDataTag][name]) ? true : false;
                },

                remove: function(name) {
                    if (el && this.has(name)) {
                        delete window.SBUtilElementDataStore[el.customDataTag][name];
                    }
                }
            };
        },

        outerWidth: function(el, margin) {
            var width;

            if (margin === true) {
                width = parseFloat(el.offsetWidth);
                width += parseFloat(SBUtil.css(el, 'margin-left')) + parseFloat(SBUtil.css(el, 'margin-right'));

                return parseFloat(width);
            } else {
                width = parseFloat(el.offsetWidth);

                return width;
            }
        },

        offset: function(el) {
            var rect, win;

            if ( !el ) {
                return;
            }

            // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
            // Support: IE <=11 only
            // Running getBoundingClientRect on a
            // disconnected node in IE throws an error

            if ( !el.getClientRects().length ) {
                return { top: 0, left: 0 };
            }

            // Get document-relative position by adding viewport scroll to viewport-relative gBCR
            rect = el.getBoundingClientRect();
            win = el.ownerDocument.defaultView;

            return {
                top: rect.top + win.pageYOffset,
                left: rect.left + win.pageXOffset
            };
        },

        height: function(el) {
            return SBUtil.css(el, 'height');
        },

        outerHeight: function(el, withMargic = false) {
            var height = el.offsetHeight;
            var style;

            if (withMargic) {
                style = getComputedStyle(el);
                height += parseInt(style.marginTop) + parseInt(style.marginBottom);

                return height;
            } else {
                return height;
            }
        },

        visible: function(el) {
            return !(el.offsetWidth === 0 && el.offsetHeight === 0);
        },

        attr: function(el, name, value) {
            if (el == undefined) {
                return;
            }

            if (value !== undefined) {
                el.setAttribute(name, value);
            } else {
                return el.getAttribute(name);
            }
        },

        hasAttr: function(el, name) {
            if (el == undefined) {
                return;
            }

            return el.getAttribute(name) ? true : false;
        },

        removeAttr: function(el, name) {
            if (el == undefined) {
                return;
            }

            el.removeAttribute(name);
        },

        animate: function(from, to, duration, update, easing, done) {
            /**
             * TinyAnimate.easings
             *  Adapted from jQuery Easing
             */
            var easings = {};
            var easing;

            easings.linear = function(t, b, c, d) {
                return c * t / d + b;
            };

            easing = easings.linear;

            // Early bail out if called incorrectly
            if (typeof from !== 'number' ||
                typeof to !== 'number' ||
                typeof duration !== 'number' ||
                typeof update !== 'function') {
                return;
            }

            // Create mock done() function if necessary
            if (typeof done !== 'function') {
                done = function() {};
            }

            // Pick implementation (requestAnimationFrame | setTimeout)
            var rAF = window.requestAnimationFrame || function(callback) {
                window.setTimeout(callback, 1000 / 50);
            };

            // Animation loop
            var canceled = false;
            var change = to - from;

            function loop(timestamp) {
                var time = (timestamp || +new Date()) - start;

                if (time >= 0) {
                    update(easing(time, from, change, duration));
                }
                if (time >= 0 && time >= duration) {
                    update(to);
                    done();
                } else {
                    rAF(loop);
                }
            }

            update(from);

            // Start animation loop
            var start = window.performance && window.performance.now ? window.performance.now() : +new Date();

            rAF(loop);
        },

        actualCss: function(el, prop, cache) {
            var css = '';

            if (el instanceof HTMLElement === false) {
                return;
            }

            if (!el.getAttribute('sb-hidden-' + prop) || cache === false) {
                var value;

                // the element is hidden so:
                // making the el block so we can meassure its height but still be hidden
                css = el.style.cssText;
                el.style.cssText = 'position: absolute; visibility: hidden; display: block;';

                if (prop == 'width') {
                    value = el.offsetWidth;
                } else if (prop == 'height') {
                    value = el.offsetHeight;
                }

                el.style.cssText = css;

                // store it in cache
                el.setAttribute('sb-hidden-' + prop, value);

                return parseFloat(value);
            } else {
                // store it in cache
                return parseFloat(el.getAttribute('sb-hidden-' + prop));
            }
        },

        actualHeight: function(el, cache) {
            return SBUtil.actualCss(el, 'height', cache);
        },

        actualWidth: function(el, cache) {
            return SBUtil.actualCss(el, 'width', cache);
        },

        getScroll: function(element, method) {
            // The passed in `method` value should be 'Top' or 'Left'
            method = 'scroll' + method;
            return (element == window || element == document) ? (
                self[(method == 'scrollTop') ? 'pageYOffset' : 'pageXOffset'] ||
                (browserSupportsBoxModel && document.documentElement[method]) ||
                document.body[method]
            ) : element[method];
        },

        css: function(el, styleProp, value) {
            if (!el) {
                return;
            }

            if (value !== undefined) {
                el.style[styleProp] = value;
            } else {
                var defaultView = (el.ownerDocument || document).defaultView;
                // W3C standard way:
                if (defaultView && defaultView.getComputedStyle) {
                    // sanitize property name to css notation
                    // (hyphen separated words eg. font-Size)
                    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
                    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
                } else if (el.currentStyle) { // IE
                    // sanitize property name to camelCase
                    styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
                        return letter.toUpperCase();
                    });
                    value = el.currentStyle[styleProp];
                    // convert other units to pixels on IE
                    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
                        return (function(value) {
                            var oldLeft = el.style.left,
                                oldRsLeft = el.runtimeStyle.left;
                            el.runtimeStyle.left = el.currentStyle.left;
                            el.style.left = value || 0;
                            value = el.style.pixelLeft + "px";
                            el.style.left = oldLeft;
                            el.runtimeStyle.left = oldRsLeft;
                            return value;
                        })(value);
                    }
                    return value;
                }
            }
        },

        slide: function(el, dir, speed, callback, recalcMaxHeight) {
            if (!el || (dir == 'up' && SBUtil.visible(el) === false) || (dir == 'down' && SBUtil.visible(el) === true)) {
                return;
            }

            speed = (speed ? speed : 600);
            var calcHeight = SBUtil.actualHeight(el);
            var calcPaddingTop = false;
            var calcPaddingBottom = false;

            if (SBUtil.css(el, 'padding-top') && SBUtil.data(el).has('slide-padding-top') !== true) {
                SBUtil.data(el).set('slide-padding-top', SBUtil.css(el, 'padding-top'));
            }

            if (SBUtil.css(el, 'padding-bottom') && SBUtil.data(el).has('slide-padding-bottom') !== true) {
                SBUtil.data(el).set('slide-padding-bottom', SBUtil.css(el, 'padding-bottom'));
            }

            if (SBUtil.data(el).has('slide-padding-top')) {
                calcPaddingTop = parseInt(SBUtil.data(el).get('slide-padding-top'));
            }

            if (SBUtil.data(el).has('slide-padding-bottom')) {
                calcPaddingBottom = parseInt(SBUtil.data(el).get('slide-padding-bottom'));
            }

            if (dir == 'up') { // up
                el.style.cssText = 'display: block; overflow: hidden;';

                if (calcPaddingTop) {
                    SBUtil.animate(0, calcPaddingTop, speed, function(value) {
                        el.style.paddingTop = (calcPaddingTop - value) + 'px';
                    }, 'linear');
                }

                if (calcPaddingBottom) {
                    SBUtil.animate(0, calcPaddingBottom, speed, function(value) {
                        el.style.paddingBottom = (calcPaddingBottom - value) + 'px';
                    }, 'linear');
                }

                SBUtil.animate(0, calcHeight, speed, function(value) {
                    el.style.height = (calcHeight - value) + 'px';
                }, 'linear', function() {
                    el.style.height = '';
                    el.style.display = 'none';

                    if (typeof callback === 'function') {
                        callback();
                    }
                });


            } else if (dir == 'down') { // down
                el.style.cssText = 'display: block; overflow: hidden;';

                if (calcPaddingTop) {
                    SBUtil.animate(0, calcPaddingTop, speed, function(value) {//
                        el.style.paddingTop = value + 'px';
                    }, 'linear', function() {
                        el.style.paddingTop = '';
                    });
                }

                if (calcPaddingBottom) {
                    SBUtil.animate(0, calcPaddingBottom, speed, function(value) {
                        el.style.paddingBottom = value + 'px';
                    }, 'linear', function() {
                        el.style.paddingBottom = '';
                    });
                }

                SBUtil.animate(0, calcHeight, speed, function(value) {
                    el.style.height = value + 'px';
                }, 'linear', function() {
                    el.style.height = '';
                    el.style.display = '';
                    el.style.overflow = '';

                    if (typeof callback === 'function') {
                        callback();
                    }
                });
            }
        },

        slideUp: function(el, speed, callback) {
            SBUtil.slide(el, 'up', speed, callback);
        },

        slideDown: function(el, speed, callback) {
            SBUtil.slide(el, 'down', speed, callback);
        },

        show: function(el, display) {
            if (typeof el !== 'undefined') {
                el.style.display = (display ? display : 'block');
            }
        },

        hide: function(el) {
            if (typeof el !== 'undefined') {
                el.style.display = 'none';
            }
        },

        addEvent: function(el, type, handler, one) {
            if (typeof el !== 'undefined' && el !== null) {
                el.addEventListener(type, handler);
            }
        },

        removeEvent: function(el, type, handler) {
            if (el !== null) {
                el.removeEventListener(type, handler);
            }
        },

        on: function(element, selector, event, handler) {
            if (!selector) {
                return;
            }

            var eventId = SBUtil.getUniqueID('event');

            window.SBUtilDelegatedEventHandlers[eventId] = function(e) {
                var targets = element.querySelectorAll(selector);
                var target = e.target;

                while (target && target !== element) {
                    for (var i = 0, j = targets.length; i < j; i++) {
                        if (target === targets[i]) {
                            handler.call(target, e);
                        }
                    }

                    target = target.parentNode;
                }
            }

            SBUtil.addEvent(element, event, window.SBUtilDelegatedEventHandlers[eventId]);

            return eventId;
        },

        off: function(element, event, eventId) {
            if (!element || !window.SBUtilDelegatedEventHandlers[eventId]) {
                return;
            }

            SBUtil.removeEvent(element, event, window.SBUtilDelegatedEventHandlers[eventId]);

            delete window.SBUtilDelegatedEventHandlers[eventId];
        },

        one: function onetime(el, type, callback) {
            el.addEventListener(type, function callee(e) {
                // remove event
                if (e.target && e.target.removeEventListener) {
                    e.target.removeEventListener(e.type, callee);
                }

                // need to verify from https://themeforest.net/author_dashboard#comment_23615588
                if (el && el.removeEventListener) {
				    e.currentTarget.removeEventListener(e.type, callee);
			    }

                // call handler
                return callback(e);
            });
        },

        hash: function(str) {
            var hash = 0,
                i, chr;

            if (str.length === 0) return hash;
            for (i = 0; i < str.length; i++) {
                chr = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }

            return hash;
        },

        animateClass: function(el, animationName, callback) {
            var animation;
            var animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
                msAnimation: 'msAnimationEnd',
            };

            for (var t in animations) {
                if (el.style[t] !== undefined) {
                    animation = animations[t];
                }
            }

            SBUtil.addClass(el, 'animated ' + animationName);

            SBUtil.one(el, animation, function() {
                SBUtil.removeClass(el, 'animated ' + animationName);
            });

            if (callback) {
                SBUtil.one(el, animation, callback);
            }
        },

        transitionEnd: function(el, callback) {
            var transition;
            var transitions = {
                transition: 'transitionend',
                OTransition: 'oTransitionEnd',
                MozTransition: 'mozTransitionEnd',
                WebkitTransition: 'webkitTransitionEnd',
                msTransition: 'msTransitionEnd'
            };

            for (var t in transitions) {
                if (el.style[t] !== undefined) {
                    transition = transitions[t];
                }
            }

            SBUtil.one(el, transition, callback);
        },

        animationEnd: function(el, callback) {
            var animation;
            var animations = {
                animation: 'animationend',
                OAnimation: 'oAnimationEnd',
                MozAnimation: 'mozAnimationEnd',
                WebkitAnimation: 'webkitAnimationEnd',
                msAnimation: 'msAnimationEnd'
            };

            for (var t in animations) {
                if (el.style[t] !== undefined) {
                    animation = animations[t];
                }
            }

            SBUtil.one(el, animation, callback);
        },

        animateDelay: function(el, value) {
            var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
            for (var i = 0; i < vendors.length; i++) {
                SBUtil.css(el, vendors[i] + 'animation-delay', value);
            }
        },

        animateDuration: function(el, value) {
            var vendors = ['webkit-', 'moz-', 'ms-', 'o-', ''];
            for (var i = 0; i < vendors.length; i++) {
                SBUtil.css(el, vendors[i] + 'animation-duration', value);
            }
        },

        scrollTo: function(target, offset, duration) {
            var duration = duration ? duration : 500;
            var targetPos = target ? SBUtil.offset(target).top : 0;
            var scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            var from, to;

            if (offset) {
                scrollPos += offset;
            }

            from = scrollPos;
            to = targetPos;

            SBUtil.animate(from, to, duration, function(value) {
                document.documentElement.scrollTop = value;
                document.body.parentNode.scrollTop = value;
                document.body.scrollTop = value;
            }); //, easing, done
        },

        scrollTop: function(offset, duration) {
            SBUtil.scrollTo(null, offset, duration);
        },

        isArray: function(obj) {
            return obj && Array.isArray(obj);
        },

        ready: function(callback) {
            if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
                callback();
            } else {
                document.addEventListener('DOMContentLoaded', callback);
            }
        },

        isEmpty: function(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    return false;
                }
            }

            return true;
        },

        numberString: function(nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },

        detectIE: function() {
            var ua = window.navigator.userAgent;

            // Test values; Uncomment to check result …

            // IE 10
            // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

            // IE 11
            // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

            // Edge 12 (Spartan)
            // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

            // Edge 13
            // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        },

        isRTL: function() {
            var html = SBUtil.getByTagName('html')[0];

            if (html) {
                return (SBUtil.attr(html, 'direction') == 'rtl');
            }
        },

        // Scroller
        scrollInit: function(element, options) {
            if (!element) {
                return;
            }

            // Learn more: https://github.com/mdbootstrap/perfect-scrollbar#options
            var pluginDefOptions = {
                wheelSpeed: 0.5,
                swipeEasing: true,
                wheelPropagation: false,
                minScrollbarLength: 40,
                maxScrollbarLength: 300,
                suppressScrollX: true
            };

            options = SBUtil.deepExtend({}, pluginDefOptions, options);

            // Define init function
            function init() {
                var ps;
                var height;

                // Get extra options via data attributes
                var attrs = element.getAttributeNames();
                if (attrs.length > 0) {
                    attrs.forEach(function(attrName) {
            			// more options; https://github.com/ganlanyuan/tiny-slider#options
            			if ((/^data-.*/g).test(attrName)) {
                            if (['scroll', 'height', 'mobile-height'].includes(optionName) == false) {
                                var optionName = attrName.replace('data-', '').toLowerCase().replace(/(?:[\s-])\w/g, function(match) {
                					return match.replace('-', '').toUpperCase();
                				});

                                options[optionName] = SBUtil.filterBoolean(element.getAttribute(attrName));
                            }
            			}
            		});
                }

                if (options.height instanceof Function) {
                    height = options.height.call();
                } else {
                    if (SBUtil.isMobileDevice() === true && options.mobileHeight) {
                        height = parseInt(options.mobileHeight);
                    } else {
                        height = parseInt(options.height);
                    }
                }

                if (height === false) {
                    SBUtil.scrollDestroy(element, true);

                    return;
                }

                height = parseInt(height);

                // Destroy scroll on table and mobile modes
                if ((options.mobileNativeScroll || options.disableForMobile) && SBUtil.isMobileDevice() === true) {
                    ps = SBUtil.data(element).get('ps');
                    if (ps) {
                        if (options.resetHeightOnDestroy) {
                            SBUtil.css(element, 'height', 'auto');
                        } else {
                            SBUtil.css(element, 'overflow', 'auto');
                            if (height > 0) {
                                SBUtil.css(element, 'height', height + 'px');
                            }
                        }

                        ps.destroy();
                        ps = SBUtil.data(element).remove('ps');
                    } else if (height > 0){
                        SBUtil.css(element, 'overflow', 'auto');
                        SBUtil.css(element, 'height', height + 'px');
                    }

                    return;
                }

                if (height > 0) {
                    SBUtil.css(element, 'height', height + 'px');
                }

                if (options.desktopNativeScroll) {
                    SBUtil.css(element, 'overflow', 'auto');
                    return;
                }

                // Pass options via HTML Attributes
                if (SBUtil.attr(element, 'data-window-scroll') == 'true') {
                     options.windowScroll = true;
                }

                // Init scroll
                ps = SBUtil.data(element).get('ps');

                if (ps) {
                    ps.update();
                } else {
                    SBUtil.css(element, 'overflow', 'hidden');
                    SBUtil.addClass(element, 'scroll');

                    ps = new PerfectScrollbar(element, options);

                    SBUtil.data(element).set('ps', ps);
                }

                // Remember scroll position in cookie
                var uid = SBUtil.attr(element, 'id');
                // Consider using Localstorage
                //if (options.rememberPosition === true && Cookies && uid) {
                //    if (SBCookie.getCookie(uid)) {
                //        var pos = parseInt(SBCookie.getCookie(uid));
                //
                //        if (pos > 0) {
                //            element.scrollTop = pos;
                //        }
                //    }
                //
                //    element.addEventListener('ps-scroll-y', function() {
                //        SBCookie.setCookie(uid, element.scrollTop);
                //    });
                //}
            }

            // Init
            init();

            // Handle window resize
            if (options.handleWindowResize) {
                SBUtil.addResizeHandler(function() {
                    init();
                });
            }
        },

        scrollUpdate: function(element) {
            var ps = SBUtil.data(element).get('ps');
            if (ps) {
                ps.update();
            }
        },

        scrollUpdateAll: function(parent) {
            var scrollers = SBUtil.findAll(parent, '.ps');
            for (var i = 0, len = scrollers.length; i < len; i++) {
                SBUtil.scrollUpdate(scrollers[i]);
            }
        },

        scrollDestroy: function(element, resetAll) {
            var ps = SBUtil.data(element).get('ps');

            if (ps) {
                ps.destroy();
                ps = SBUtil.data(element).remove('ps');
            }

            if (element && resetAll) {
                element.style.setProperty('overflow', '');
                element.style.setProperty('height', '');
            }
        },

        filterBoolean: function(val) {
            // Convert string boolean
			if (val === true || val === 'true') {
				return true;
			}

			if (val === false || val === 'false') {
				return false;
			}

            return val;
        },

        setHTML: function(el, html) {
            el.innerHTML = html;
        },

        getHTML: function(el) {
            if (el) {
                return el.innerHTML;
            }
        },

        getDocumentHeight: function() {
            var body = document.body;
            var html = document.documentElement;

            return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
        },

        getScrollTop: function() {
            return  (document.scrollingElement || document.documentElement).scrollTop;
        },

        colorDarken: function(color, amount) {
            var subtractLight = function(color, amount){
                var cc = parseInt(color,16) - amount;
                var c = (cc < 0) ? 0 : (cc);
                c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;

                return c;
            }

            color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
            amount = parseInt((255*amount)/100);

            return color = `#${subtractLight(color.substring(0,2), amount)}${subtractLight(color.substring(2,4), amount)}${subtractLight(color.substring(4,6), amount)}`;
        },

        colorLighten: function(color, amount) {
            var addLight = function(color, amount){
                var cc = parseInt(color,16) + amount;
                var c = (cc > 255) ? 255 : (cc);
                c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;

                return c;
            }

            color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
            amount = parseInt((255*amount)/100);

            return color = `#${addLight(color.substring(0,2), amount)}${addLight(color.substring(2,4), amount)}${addLight(color.substring(4,6), amount)}`;
        },

        // Throttle function: Input as function which needs to be throttled and delay is the time interval in milliseconds
        throttle:  function (timer, func, delay) {
        	// If setTimeout is already scheduled, no need to do anything
        	if (timer) {
        		return;
        	}

        	// Schedule a setTimeout after delay seconds
        	timer  =  setTimeout(function () {
        		func();

        		// Once setTimeout function execution is finished, timerId = undefined so that in <br>
        		// the next scroll event function execution can be scheduled by the setTimeout
        		timer  =  undefined;
        	}, delay);
        },

        // Debounce function: Input as function which needs to be debounced and delay is the debounced time in milliseconds
        debounce: function (timer, func, delay) {
        	// Cancels the setTimeout method execution
        	clearTimeout(timer)

        	// Executes the func after delay time.
        	timer  =  setTimeout(func, delay);
        },

        btnWait: function(el, cls, message, disable = true) {
            if (!el) {
                return;
            }

            if (disable) {
                SBUtil.attr(el, "disabled", true);
            }

            if (cls) {
                SBUtil.addClass(el, cls);
                SBUtil.attr(el, "wait-class", cls);
            }

            if (message) {
                var caption = SBUtil.find(el, '.btn-caption');

                if (caption) {
                    SBUtil.data(caption).set('caption', SBUtil.getHTML(caption));
                    SBUtil.setHTML(caption, message);
                } else {
                    SBUtil.data(el).set('caption', SBUtil.getHTML(el));
                    SBUtil.setHTML(el, message);
                }
            }
        },

        btnRelease: function(el) {
            if (!el) {
                return;
            }

            /// Show loading state on button
            SBUtil.removeAttr(el, "disabled");

            if (SBUtil.hasAttr(el, "wait-class")) {
                SBUtil.removeClass(el, SBUtil.attr(el, "wait-class"));
            }

            var caption = SBUtil.find(el, '.btn-caption');

            if (caption && SBUtil.data(caption).has('caption')) {
                SBUtil.setHTML(caption, SBUtil.data(caption).get('caption'));
            } else if (SBUtil.data(el).has('caption')) {
                SBUtil.setHTML(el, SBUtil.data(el).get('caption'));
            }
        },

        isOffscreen: function(el, direction, offset = 0) {
            var windowWidth = SBUtil.getViewPort().width;
            var windowHeight = SBUtil.getViewPort().height;

            var top = SBUtil.offset(el).top;
            var height = SBUtil.outerHeight(el) + offset;
            var left = SBUtil.offset(el).left;
            var width = SBUtil.outerWidth(el) + offset;

            if (direction == 'bottom') {
                if (windowHeight < top + height) {
                    return true;
                } else if (windowHeight > top + height * 1.5) {
                    return true;
                }
            }

            if (direction == 'top') {
                if (top < 0) {
                    return true;
                } else if (top > height) {
                    return true;
                }
            }

            if (direction == 'left') {
                if (left < 0) {
                    return true;
                } else if (left * 2 > width) {
                    //console.log('left 2');
                    //return true;
                }
            }

            if (direction == 'right') {
                if (windowWidth < left + width) {
                    return true;
                } else {
                    //console.log('right 2');
                    //return true;
                }
            }

            return false;
        }
    }
}();

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBUtil;
}

// Initialize SBUtil class on document ready
SBUtil.ready(function() {
	if (typeof SBAppSettings !== 'undefined') {
		SBUtil.init(SBAppSettings);
	} else {
		SBUtil.init();
	}
});

// CSS3 Transitions only after page load(.page-loading class added to body tag and remove with JS on page load)
window.onload = function() {
    var result = SBUtil.getByTagName('body');
    if (result && result[0]) {
        SBUtil.removeClass(result[0], 'page-loading');
    }
}

"use strict";

// Component Definition
var SBWizard = function(elementId, options) {
    // Main object
    var the = this;
    var init = false;

    // Get element object
    var element = SBUtil.getById(elementId);
    var body = SBUtil.getBody();

    if (!element) {
        return;
    }

    // Default options
    var defaultOptions = {
        startStep: 1,
        clickableSteps: false // to make steps clickable this set value true and add data-wizard-clickable="true" in HTML for class="wizard" element
    };

    ////////////////////////////
    // ** Private Methods  ** //
    ////////////////////////////

    var Plugin = {
        /**
         * Construct
         */

        construct: function(options) {
            if (SBUtil.data(element).has('wizard')) {
                the = SBUtil.data(element).get('wizard');
            } else {
                // reset menu
                Plugin.init(options);

                // build menu
                Plugin.build();

                SBUtil.data(element).set('wizard', the);
            }

            return the;
        },

        /**
         * Init wizard
         */
        init: function(options) {
            the.element = element;
            the.events = [];

            // merge default and user defined options
            the.options = SBUtil.deepExtend({}, defaultOptions, options);

            // Elements
            the.steps = SBUtil.findAll(element, '[data-wizard-type="step"]');

            the.btnSubmit = SBUtil.find(element, '[data-wizard-type="action-submit"]');
            the.btnNext = SBUtil.find(element, '[data-wizard-type="action-next"]');
            the.btnPrev = SBUtil.find(element, '[data-wizard-type="action-prev"]');
            the.btnLast = SBUtil.find(element, '[data-wizard-type="action-last"]');
            the.btnFirst = SBUtil.find(element, '[data-wizard-type="action-first"]');

            // Variables
            the.events = [];
            the.currentStep = 1;
            the.stopped = false;
            the.totalSteps = the.steps.length;

            // Init current step
            if (the.options.startStep > 1) {
                Plugin.goTo(the.options.startStep);
            }

            // Init UI
            Plugin.updateUI();
        },

        /**
         * Build Form Wizard
         */
        build: function() {
            // Next button event handler
            SBUtil.addEvent(the.btnNext, 'click', function(e) {
                e.preventDefault();
                Plugin.goTo(Plugin.getNextStep(), true);
            });

            // Prev button event handler
            SBUtil.addEvent(the.btnPrev, 'click', function(e) {
                e.preventDefault();
                Plugin.goTo(Plugin.getPrevStep(), true);
            });

            // First button event handler
            SBUtil.addEvent(the.btnFirst, 'click', function(e) {
                e.preventDefault();
                Plugin.goTo(Plugin.getFirstStep(), true);
            });

            // Last button event handler
            SBUtil.addEvent(the.btnLast, 'click', function(e) {
                e.preventDefault();
                Plugin.goTo(Plugin.getLastStep(), true);
            });

            if (the.options.clickableSteps === true) {
                SBUtil.on(element, '[data-wizard-type="step"]', 'click', function() {
                    var index = SBUtil.index(this) + 1;
                    if (index !== the.currentStep) {
                        Plugin.goTo(index, true);
                    }
                });
            }
        },

        /**
         * Handles wizard click wizard
         */
        goTo: function(number, eventHandle) {
            // Skip if this step is already shown
            if (number === the.currentStep || number > the.totalSteps || number < 0) {
                return;
            }

            // Validate step number
            if (number) {
                number = parseInt(number);
            } else {
                number = Plugin.getNextStep();
            }

            // Before next and prev events
            var callback;

            if (eventHandle === true) {
                if (number > the.currentStep) {
                    callback = Plugin.eventTrigger('beforeNext');
                } else {
                    callback = Plugin.eventTrigger('beforePrev');
                }
            }

            // Skip if stopped
            if (the.stopped === true) {
                the.stopped = false;
                return;
            }

            // Continue if no exit
            if (callback !== false) {
                // Before change
                if (eventHandle === true) {
                    Plugin.eventTrigger('beforeChange');
                }

                // Set current step
                the.currentStep = number;

                Plugin.updateUI();

                // Trigger change event
                if (eventHandle === true) {
                    Plugin.eventTrigger('change');
                }
            }

            // After next and prev events
            if (eventHandle === true) {
                if (number > the.startStep) {
                    Plugin.eventTrigger('afterNext');
                } else {
                    Plugin.eventTrigger('afterPrev');
                }
            }

            return the;
        },

        /**
         * Cancel
         */
        stop: function() {
            the.stopped = true;
        },

        /**
         * Resume
         */
        start: function() {
            the.stopped = false;
        },

        /**
         * Check last step
         */
        isLastStep: function() {
            return the.currentStep === the.totalSteps;
        },

        /**
         * Check first step
         */
        isFirstStep: function() {
            return the.currentStep === 1;
        },

        /**
         * Check between step
         */
        isBetweenStep: function() {
            return Plugin.isLastStep() === false && Plugin.isFirstStep() === false;
        },

        /**
         * Go to the first step
         */
        updateUI: function() {
            var stepType = '';
            var index = the.currentStep - 1;

            if (Plugin.isLastStep()) {
                stepType = 'last';
            } else if (Plugin.isFirstStep()) {
                stepType = 'first';
            } else {
                stepType = 'between';
            }

            SBUtil.attr(the.element, 'data-wizard-state', stepType);

            // Steps
            var steps = SBUtil.findAll(the.element, '[data-wizard-type="step"]');

            if (steps && steps.length > 0) {
                for (var i = 0, len = steps.length; i < len; i++) {
                    if (i == index) {
                        SBUtil.attr(steps[i], 'data-wizard-state', 'current');
                    } else {
                        if (i < index) {
                            SBUtil.attr(steps[i], 'data-wizard-state', 'done');
                        } else {
                            SBUtil.attr(steps[i], 'data-wizard-state', 'pending');
                        }
                    }
                }
            }

            // Steps Info
            var stepsInfo = SBUtil.findAll(the.element, '[data-wizard-type="step-info"]');
            if (stepsInfo &&stepsInfo.length > 0) {
                for (var i = 0, len = stepsInfo.length; i < len; i++) {
                    if (i == index) {
                        SBUtil.attr(stepsInfo[i], 'data-wizard-state', 'current');
                    } else {
                        SBUtil.removeAttr(stepsInfo[i], 'data-wizard-state');
                    }
                }
            }

            // Steps Content
            var stepsContent = SBUtil.findAll(the.element, '[data-wizard-type="step-content"]');
            if (stepsContent&& stepsContent.length > 0) {
                for (var i = 0, len = stepsContent.length; i < len; i++) {
                    if (i == index) {
                        SBUtil.attr(stepsContent[i], 'data-wizard-state', 'current');
                    } else {
                        SBUtil.removeAttr(stepsContent[i], 'data-wizard-state');
                    }
                }
            }
        },

        /**
         * Get next step
         */
        getNextStep: function() {
            if (the.totalSteps >= (the.currentStep + 1)) {
                return the.currentStep + 1;
            } else {
                return the.totalSteps;
            }
        },

        /**
         * Get prev step
         */
        getPrevStep: function() {
            if ((the.currentStep - 1) >= 1) {
                return the.currentStep - 1;
            } else {
                return 1;
            }
        },

        /**
         * Trigger events
         */
        eventTrigger: function(name, nested) {
            //SBUtil.triggerCustomEvent(name);
            for (var i = 0; i < the.events.length; i++) {
                var event = the.events[i];
                if (event.name == name) {
                    if (event.one == true) {
                        if (event.fired == false) {
                            the.events[i].fired = true;
                            return event.handler.call(this, the);
                        }
                    } else {
                        return event.handler.call(this, the);
                    }
                }
            }
        },

        addEvent: function(name, handler, one) {
            the.events.push({
                name: name,
                handler: handler,
                one: one,
                fired: false
            });

            return the;
        }
    };

    //////////////////////////
    // ** Public Methods ** //
    //////////////////////////

    /**
     * Set default options
     */

    the.setDefaults = function(options) {
        defaultOptions = options;
    };

    /**
     * Go to the next step
     */
    the.goNext = function(eventHandle) {
        return Plugin.goTo(Plugin.getNextStep(), eventHandle);
    };

    /**
     * Go to the prev step
     */
    the.goPrev = function(eventHandle) {
        return Plugin.goTo(Plugin.getPrevStep(),eventHandle);
    };

    /**
     * Go to the last step
     */
    the.goLast = function(eventHandle) {
        return Plugin.goTo(Plugin.getLastStep(), eventHandle);
    };

    /**
     * Go to the first step
     */
    the.goFirst = function(eventHandle) {
        return Plugin.goTo(Plugin.getFirstStep(), eventHandle);
    };

    /**
     * Go to a step
     */
    the.goTo = function(number, eventHandle) {
        return Plugin.goTo(number, eventHandle);
    };

    /**
     * Cancel step
     */
    the.stop = function() {
        return Plugin.stop();
    };

    /**
     * Resume step
     */
    the.start = function() {
        return Plugin.start();
    };

    /**
     * Get current step number
     */
    the.getStep = function() {
        return the.currentStep;
    };

    /**
     * Check last step
     */
    the.isLastStep = function() {
        return Plugin.isLastStep();
    };

    /**
     * Check first step
     */
    the.isFirstStep = function() {
        return Plugin.isFirstStep();
    };

    /**
     * Attach event
     */
    the.on = function(name, handler) {
        return Plugin.addEvent(name, handler);
    };

    /**
     * Attach event that will be fired once
     */
    the.one = function(name, handler) {
        return Plugin.addEvent(name, handler, true);
    };

    // Construct plugin
    Plugin.construct.apply(the, [options]);

    return the;
};

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBWizard;
}

'use strict';
(function($) {

	var pluginName = 'SBDatatable';
	var pfx = '';
	var util = SBUtil;
	var app = SBApp;

	if (typeof util === 'undefined') throw new Error('Util class is required and must be included before ' + pluginName);

	// plugin setup
	$.fn[pluginName] = function(options) {
		if ($(this).length === 0) {
			console.warn('No ' + pluginName + ' element exist.');
			return;
		}

		// global variables
		var datatable = this;

		// debug enabled?
		// 1) state will be cleared on each refresh
		// 2) enable some logs
		// 3) etc.
		datatable.debug = false;

		datatable.API = {
			record: null,
			value: null,
			params: null,
		};

		var Plugin = {
			/********************
			 ** PRIVATE METHODS
			 ********************/
			isInit: false,
			cellOffset: 110,
			iconOffset: 15,
			stateId: 'meta',
			ajaxParams: {},
			pagingObject: {},

			init: function(options) {
				var isHtmlTable = false;
				// data source option empty is normal table
				if (options.data.source === null) {
					Plugin.extractTable();
					isHtmlTable = true;
				}

				Plugin.setupBaseDOM.call();
				Plugin.setupDOM(datatable.table);

				// on event after layout had done setup, show datatable
				$(datatable).on(pfx + 'datatable-on-layout-updated', Plugin.afterRender);

				if (datatable.debug) {
					Plugin.stateRemove(Plugin.stateId);
				}

				/*var es = Plugin.stateGet(Plugin.stateId);
				var eq = {};
				if (es && es.hasOwnProperty('query')) {
					eq = es.query;
				}
				Plugin.setDataSourceQuery(Object.assign({}, eq, Plugin.getOption('data.source.read.params.query')));*/

				// set custom query from options
				Plugin.setDataSourceQuery(Plugin.getOption('data.source.read.params.query'));

				// initialize extensions
				$.each(Plugin.getOption('extensions'), function(extName, extOptions) {
					if (typeof $.fn[pluginName][extName] === 'function') {
						if (typeof extOptions !== 'object') {
							extOptions = $.extend({}, extOptions);
						}
						new $.fn[pluginName][extName](datatable, extOptions);
					}
				});

				Plugin.spinnerCallback(true);
				// get data
				if (options.data.type === 'remote' || options.data.type === 'local') {
					if (options.data.saveState === false) {
						Plugin.stateRemove(Plugin.stateId);
					}
					// get data for local datatable and local table
					if (options.data.type === 'local' && typeof options.data.source === 'object') {
						datatable.dataSet = datatable.originalDataSet = Plugin.dataMapCallback(options.data.source);
					}
					Plugin.dataRender();
				}

				// if html table, remove and setup a new header
				if (isHtmlTable) {
					$(datatable.tableHead).find('tr').remove();
					$(datatable.tableFoot).find('tr').remove();
				}

				Plugin.setHeadTitle();
				if (Plugin.getOption('layout.footer')) {
					Plugin.setHeadTitle(datatable.tableFoot);
				}

				// hide header
				if (typeof options.layout.header !== 'undefined' &&
					options.layout.header === false) {
					$(datatable.table).find('thead').remove();
				}

				// hide footer
				if (typeof options.layout.footer !== 'undefined' &&
					options.layout.footer === false) {
					$(datatable.table).find('tfoot').remove();
				}

				// for normal and local data type, run layoutUpdate
				if (options.data.type === null ||
					options.data.type === 'local') {
					Plugin.setupCellField.call();
					Plugin.setupTemplateCell.call();

					// setup nested datatable, if option enabled
					Plugin.setupSubDatatable.call();

					// setup extra system column properties
					Plugin.setupSystemColumn.call();
					Plugin.redraw();
				}

				var width;
				var initialWidth = false;
				$(window).resize(function() {
					// issue: URL Bar Resizing on mobile, https://developers.google.com/web/updates/2016/12/url-bar-resizing
					// trigger datatable resize on width change only
					if ($(this).width() !== width) {
						width = $(this).width();
						Plugin.fullRender();
					}
					// get initial width
					if (!initialWidth) {
						width = $(this).width();
						initialWidth = true;
					}
				});

				$(datatable).height('');

				var prevKeyword = '';
				$(Plugin.getOption('search.input')).on('keyup', function(e) {
					if (Plugin.getOption('search.onEnter') && e.which !== 13) return;
					var keyword = $(this).val();
					// prevent multiple search request on every button keyup
					if (prevKeyword !== keyword) {
						Plugin.search(keyword);
						prevKeyword = keyword;
					}
				});

				return datatable;
			},

			/**
			 * Extract static HTML table content into datasource
			 */
			extractTable: function() {
				var columns = [];
				var headers = $(datatable).find('tr:first-child th').get().map(function(cell, i) {
					var field = $(cell).data('field');
					var title = $(cell).data('title');
					if (typeof field === 'undefined') {
						field = $(cell).text().trim();
					}
					if (typeof title === 'undefined') {
						title = $(cell).text().trim();
					}
					var column = {field: field, title: title};
					for (var ii in options.columns) {
						if (options.columns[ii].field === field) {
							column = $.extend(true, {}, options.columns[ii], column);
						}
					}
					columns.push(column);
					return field;
				});
				// auto create columns config
				options.columns = columns;

				var rowProp = [];
				var source = [];

				$(datatable).find('tr').each(function() {
					if ($(this).find('td').length) {
						rowProp.push($(this).prop('attributes'));
					}
					var td = {};
					$(this).find('td').each(function(i, cell) {
						td[headers[i]] = cell.innerHTML.trim();
					});
					if (!util.isEmpty(td)) {
						source.push(td);
					}
				});

				options.data.attr.rowProps = rowProp;
				options.data.source = source;
			},

			/**
			 * One time layout update on init
			 */
			layoutUpdate: function() {
				// setup nested datatable, if option enabled
				Plugin.setupSubDatatable.call();

				// setup extra system column properties
				Plugin.setupSystemColumn.call();

				// setup cell hover event
				Plugin.setupHover.call();

				if (typeof options.detail === 'undefined'
					// temporary disable lock column in subtable
					&& Plugin.getDepth() === 1) {
					// lock columns handler
					Plugin.lockTable.call();
				}

				Plugin.resetScroll();

				// check if not is a locked column
				if (!Plugin.isLocked()) {
					Plugin.redraw.call();
					// check if its not a subtable and has autoHide option enabled
					if (!Plugin.isSubtable() && Plugin.getOption('rows.autoHide') === true) {
						Plugin.autoHide();
					}
					// reset row
					$(datatable.table).find('.' + pfx + 'datatable-row').css('height', '');
				}

				Plugin.columnHide.call();

				Plugin.rowEvenOdd.call();

				Plugin.sorting.call();

				Plugin.scrollbar.call();

				if (!Plugin.isInit) {
					// run once dropdown inside datatable
					Plugin.dropdownFix();
					$(datatable).trigger(pfx + 'datatable-on-init', {table: $(datatable.wrap).attr('id'), options: options});
					Plugin.isInit = true;
				}

				$(datatable).trigger(pfx + 'datatable-on-layout-updated', {table: $(datatable.wrap).attr('id')});
			},

			dropdownFix: function() {
				var dropdownMenu;
				$('body').on('show.bs.dropdown', '.' + pfx + 'datatable .' + pfx + 'datatable-body', function(e) {
					dropdownMenu = $(e.target).find('.dropdown-menu');
					$('body').append(dropdownMenu.detach());
					dropdownMenu.css('display', 'block');
					dropdownMenu.position({
						'my': 'right top',
						'at': 'right bottom',
						'of': $(e.relatedTarget),
					});
					// if datatable is inside modal
					if (datatable.closest('.modal').length) {
						// increase dropdown z-index
						dropdownMenu.css('z-index', '2000');
					}
				}).on('hide.bs.dropdown', '.' + pfx + 'datatable .' + pfx + 'datatable-body', function(e) {
					$(e.target).append(dropdownMenu.detach());
					dropdownMenu.hide();
				});

				// remove dropdown if window resize
				$(window).on('resize', function(e) {
					if (typeof dropdownMenu !== 'undefined') {
						dropdownMenu.hide();
					}
				});
			},

			lockTable: function() {
				var lock = {
					lockEnabled: false,
					init: function() {
						// check if table should be locked columns
						lock.lockEnabled = Plugin.lockEnabledColumns();
						if (lock.lockEnabled.left.length === 0 &&
							lock.lockEnabled.right.length === 0) {
							return;
						}
						lock.enable();
					},
					enable: function() {
						var enableLock = function(tablePart) {
							// check if already has lock column
							if ($(tablePart).find('.' + pfx + 'datatable-lock').length > 0) {
								Plugin.log('Locked container already exist in: ', tablePart);
								return;
							}
							// check if no rows exists
							if ($(tablePart).find('.' + pfx + 'datatable-row').length === 0) {
								Plugin.log('No row exist in: ', tablePart);
								return;
							}

							// locked div container
							var lockLeft = $('<div/>').addClass(pfx + 'datatable-lock ' + pfx + 'datatable-lock-left');
							var lockScroll = $('<div/>').addClass(pfx + 'datatable-lock ' + pfx + 'datatable-lock-scroll');
							var lockRight = $('<div/>').addClass(pfx + 'datatable-lock ' + pfx + 'datatable-lock-right');

							$(tablePart).find('.' + pfx + 'datatable-row').each(function() {
								// create new row for lock columns and pass the data
								var rowLeft = $('<tr/>').addClass(pfx + 'datatable-row').data('obj', $(this).data('obj')).appendTo(lockLeft);
								var rowScroll = $('<tr/>').addClass(pfx + 'datatable-row').data('obj', $(this).data('obj')).appendTo(lockScroll);
								var rowRight = $('<tr/>').addClass(pfx + 'datatable-row').data('obj', $(this).data('obj')).appendTo(lockRight);
								$(this).find('.' + pfx + 'datatable-cell').each(function() {
									var locked = $(this).data('locked');
									if (typeof locked !== 'undefined') {
										if (typeof locked.left !== 'undefined' || locked === true) {
											// default locked to left
											$(this).appendTo(rowLeft);
										}
										if (typeof locked.right !== 'undefined') {
											$(this).appendTo(rowRight);
										}
									} else {
										$(this).appendTo(rowScroll);
									}
								});
								// remove old row
								$(this).remove();
							});

							if (lock.lockEnabled.left.length > 0) {
								$(datatable.wrap).addClass(pfx + 'datatable-lock');
								$(lockLeft).appendTo(tablePart);
							}
							if (lock.lockEnabled.left.length > 0 || lock.lockEnabled.right.length > 0) {
								$(lockScroll).appendTo(tablePart);
							}
							if (lock.lockEnabled.right.length > 0) {
								$(datatable.wrap).addClass(pfx + 'datatable-lock');
								$(lockRight).appendTo(tablePart);
							}
						};

						$(datatable.table).find('thead,tbody,tfoot').each(function() {
							var tablePart = this;
							if ($(this).find('.' + pfx + 'datatable-lock').length === 0) {
								$(this).ready(function() {
									enableLock(tablePart);
								});
							}
						});
					},
				};
				lock.init();
				return lock;
			},

			/**
			 * Render everything for resize
			 */
			fullRender: function() {
				$(datatable.tableHead).empty();
				Plugin.setHeadTitle();
				if (Plugin.getOption('layout.footer')) {
					$(datatable.tableFoot).empty();
					Plugin.setHeadTitle(datatable.tableFoot);
				}

				Plugin.spinnerCallback(true);
				$(datatable.wrap).removeClass(pfx + 'datatable-loaded');

				Plugin.insertData();
			},

			lockEnabledColumns: function() {
				var screen = $(window).width();
				var columns = options.columns;
				var enabled = {left: [], right: []};
				$.each(columns, function(i, column) {
					if (typeof column.locked !== 'undefined') {
						if (typeof column.locked.left !== 'undefined') {
							if (util.getBreakpoint(column.locked.left) <= screen) {
								enabled['left'].push(column.locked.left);
							}
						}
						if (typeof column.locked.right !== 'undefined') {
							if (util.getBreakpoint(column.locked.right) <= screen) {
								enabled['right'].push(column.locked.right);
							}
						}
					}
				});
				return enabled;
			},

			/**
			 * After render event, called by "datatable-on-layout-updated"
			 * @param e
			 * @param args
			 */
			afterRender: function(e, args) {
				$(datatable).ready(function() {
					// redraw locked columns table
					if (Plugin.isLocked()) {
						Plugin.redraw();
					}

					$(datatable.tableBody).css('visibility', '');
					$(datatable.wrap).addClass(pfx + 'datatable-loaded');

					Plugin.spinnerCallback(false);
				});
			},

			hoverTimer: 0,
			isScrolling: false,
			setupHover: function() {
				$(window).scroll(function(e) {
					// stop hover when scrolling
					clearTimeout(Plugin.hoverTimer);
					Plugin.isScrolling = true;
				});

				$(datatable.tableBody).find('.' + pfx + 'datatable-cell').off('mouseenter', 'mouseleave').on('mouseenter', function() {
					// reset scroll timer to hover class
					Plugin.hoverTimer = setTimeout(function() {
						Plugin.isScrolling = false;
					}, 200);
					if (Plugin.isScrolling) return;

					// normal table
					var row = $(this).closest('.' + pfx + 'datatable-row').addClass(pfx + 'datatable-row-hover');
					var index = $(row).index() + 1;

					// lock table
					$(row).closest('.' + pfx + 'datatable-lock').parent().find('.' + pfx + 'datatable-row:nth-child(' + index + ')').addClass(pfx + 'datatable-row-hover');
				}).on('mouseleave', function() {
					// normal table
					var row = $(this).closest('.' + pfx + 'datatable-row').removeClass(pfx + 'datatable-row-hover');
					var index = $(row).index() + 1;

					// look table
					$(row).closest('.' + pfx + 'datatable-lock').parent().find('.' + pfx + 'datatable-row:nth-child(' + index + ')').removeClass(pfx + 'datatable-row-hover');
				});
			},

			/**
			 * Adjust width of locked table containers by resize handler
			 * @returns {number}
			 */
			adjustLockContainer: function() {
				if (!Plugin.isLocked()) return 0;

				// refer to head dimension
				var containerWidth = $(datatable.tableHead).width();
				var lockLeft = $(datatable.tableHead).find('.' + pfx + 'datatable-lock-left').width();
				var lockRight = $(datatable.tableHead).find('.' + pfx + 'datatable-lock-right').width();

				if (typeof lockLeft === 'undefined') lockLeft = 0;
				if (typeof lockRight === 'undefined') lockRight = 0;

				var lockScroll = Math.floor(containerWidth - lockLeft - lockRight);
				$(datatable.table).find('.' + pfx + 'datatable-lock-scroll').css('width', lockScroll);

				return lockScroll;
			},

			/**
			 * todo; not in use
			 */
			dragResize: function() {
				var pressed = false;
				var start = undefined;
				var startX, startWidth;
				$(datatable.tableHead).find('.' + pfx + 'datatable-cell').mousedown(function(e) {
					start = $(this);
					pressed = true;
					startX = e.pageX;
					startWidth = $(this).width();
					$(start).addClass(pfx + 'datatable-cell-resizing');

				}).mousemove(function(e) {
					if (pressed) {
						var i = $(start).index();
						var tableBody = $(datatable.tableBody);
						var ifLocked = $(start).closest('.' + pfx + 'datatable-lock');

						if (ifLocked) {
							var lockedIndex = $(ifLocked).index();
							tableBody = $(datatable.tableBody).find('.' + pfx + 'datatable-lock').eq(lockedIndex);
						}

						$(tableBody).find('.' + pfx + 'datatable-row').each(function(tri, tr) {
							$(tr).find('.' + pfx + 'datatable-cell').eq(i).width(startWidth + (e.pageX - startX)).children().width(startWidth + (e.pageX - startX));
						});

						$(start).children().css('width', startWidth + (e.pageX - startX));
					}

				}).mouseup(function() {
					$(start).removeClass(pfx + 'datatable-cell-resizing');
					pressed = false;
				});

				$(document).mouseup(function() {
					$(start).removeClass(pfx + 'datatable-cell-resizing');
					pressed = false;
				});
			},

			/**
			 * To prepare placeholder for table before content is loading
			 */
			initHeight: function() {
				if (options.layout.height && options.layout.scroll) {
					var theadHeight = $(datatable.tableHead).find('.' + pfx + 'datatable-row').outerHeight();
					var tfootHeight = $(datatable.tableFoot).find('.' + pfx + 'datatable-row').outerHeight();
					var bodyHeight = options.layout.height;
					if (theadHeight > 0) {
						bodyHeight -= theadHeight;
					}
					if (tfootHeight > 0) {
						bodyHeight -= tfootHeight;
					}

					// scrollbar offset
					bodyHeight -= 2;

					$(datatable.tableBody).css('max-height', Math.floor(parseFloat(bodyHeight)));

					// set scrollable area fixed height
					// $(datatable.tableBody).find('.' + pfx + 'datatable-lock-scroll').css('height', Math.floor(parseFloat(bodyHeight)));
				}
			},

			/**
			 * Setup base DOM (table, thead, tbody, tfoot) and create if not
			 * exist.
			 */
			setupBaseDOM: function() {
				// keep original state before datatable initialize
				datatable.initialDatatable = $(datatable).clone();

				// main element
				if ($(datatable).prop('tagName') === 'TABLE') {
					// if main init element is <table>, wrap with div
					datatable.table = $(datatable).removeClass(pfx + 'datatable').addClass(pfx + 'datatable-table');
					if ($(datatable.table).parents('.' + pfx + 'datatable').length === 0) {
						datatable.table.wrap($('<div/>').addClass(pfx + 'datatable').addClass(pfx + 'datatable-' + options.layout.theme));
						datatable.wrap = $(datatable.table).parent();
					}
				} else {
					// create table
					datatable.wrap = $(datatable).addClass(pfx + 'datatable').addClass(pfx + 'datatable-' + options.layout.theme);
					datatable.table = $('<table/>').addClass(pfx + 'datatable-table').appendTo(datatable);
				}

				if (typeof options.layout.class !== 'undefined') {
					$(datatable.wrap).addClass(options.layout.class);
				}

				$(datatable.table).removeClass(pfx + 'datatable-destroyed').css('display', 'block');

				// force disable save state
				if (typeof $(datatable).attr('id') === 'undefined') {
					Plugin.setOption('data.saveState', false);
					$(datatable.table).attr('id', util.getUniqueID(pfx + 'datatable-'));
				}

				// predefine table height
				if (Plugin.getOption('layout.minHeight'))
					$(datatable.table).css('min-height', Plugin.getOption('layout.minHeight'));

				if (Plugin.getOption('layout.height'))
					$(datatable.table).css('max-height', Plugin.getOption('layout.height'));

				// for normal table load
				if (options.data.type === null) {
					$(datatable.table).css('width', '').css('display', '');
				}

				// create table head element
				datatable.tableHead = $(datatable.table).find('thead');
				if ($(datatable.tableHead).length === 0) {
					datatable.tableHead = $('<thead/>').prependTo(datatable.table);
				}

				// create table head element
				datatable.tableBody = $(datatable.table).find('tbody');
				if ($(datatable.tableBody).length === 0) {
					datatable.tableBody = $('<tbody/>').appendTo(datatable.table);
				}

				if (typeof options.layout.footer !== 'undefined' &&
					options.layout.footer) {
					// create table foot element
					datatable.tableFoot = $(datatable.table).find('tfoot');
					if ($(datatable.tableFoot).length === 0) {
						datatable.tableFoot = $('<tfoot/>').appendTo(datatable.table);
					}
				}
			},

			/**
			 * Set column data before table manipulation.
			 */
			setupCellField: function(tableParts) {
				if (typeof tableParts === 'undefined') tableParts = $(datatable.table).children();
				var columns = options.columns;
				$.each(tableParts, function(part, tablePart) {
					$(tablePart).find('.' + pfx + 'datatable-row').each(function(tri, tr) {
						// prepare data
						$(tr).find('.' + pfx + 'datatable-cell').each(function(tdi, td) {
							if (typeof columns[tdi] !== 'undefined') {
								$(td).data(columns[tdi]);
							}
						});
					});
				});
			},

			/**
			 * Set column template callback
			 * @param tablePart
			 */
			setupTemplateCell: function(tablePart) {
				if (typeof tablePart === 'undefined') tablePart = datatable.tableBody;
				var columns = options.columns;
				$(tablePart).find('.' + pfx + 'datatable-row').each(function(tri, tr) {
					// row data object, if any
					var obj = $(tr).data('obj');
					if (typeof obj === 'undefined') {
						return;
					}

					// @deprecated in v5.0.6
					// obj['getIndex'] = function() {
					// 	return tri;
					// };
					// @deprecated in v5.0.6
					// obj['getDatatable'] = function() {
					// 	return datatable;
					// };

					// @deprecated in v5.0.6
					var rowCallback = Plugin.getOption('rows.callback');
					if (typeof rowCallback === 'function') {
						rowCallback($(tr), obj, tri);
					}
					// before template row callback
					var beforeTemplate = Plugin.getOption('rows.beforeTemplate');
					if (typeof beforeTemplate === 'function') {
						beforeTemplate($(tr), obj, tri);
					}
					// if data object is undefined, collect from table
					if (typeof obj === 'undefined') {
						obj = {};
						$(tr).find('.' + pfx + 'datatable-cell').each(function(tdi, td) {
							// get column settings by field
							var column = $.grep(columns, function(n, i) {
								return $(td).data('field') === n.field;
							})[0];
							if (typeof column !== 'undefined') {
								obj[column['field']] = $(td).text();
							}
						});
					}

					$(tr).find('.' + pfx + 'datatable-cell').each(function(tdi, td) {
						// get column settings by field
						var column = $.grep(columns, function(n, i) {
							return $(td).data('field') === n.field;
						})[0];
						if (typeof column !== 'undefined') {
							// column template
							if (typeof column.template !== 'undefined') {
								var finalValue = '';
								// template string
								if (typeof column.template === 'string') {
									finalValue = Plugin.dataPlaceholder(column.template, obj);
								}
								// template callback function
								if (typeof column.template === 'function') {
									finalValue = column.template(obj, tri, datatable);
								}

								// sanitize using DOMPurify if installed
								if (typeof DOMPurify !== 'undefined') {
									finalValue = DOMPurify.sanitize(finalValue);
								}

								var span = document.createElement('span');
								span.innerHTML = finalValue;

								// insert to cell, wrap with span
								$(td).html(span);

								// set span overflow
								if (typeof column.overflow !== 'undefined') {
									$(span).css('overflow', column.overflow);
									$(span).css('position', 'relative');
								}
							}
						}
					});

					// after template row callback
					var afterTemplate = Plugin.getOption('rows.afterTemplate');
					if (typeof afterTemplate === 'function') {
						afterTemplate($(tr), obj, tri);
					}
				});
			},

			/**
			 * Setup extra system column properties
			 * Note: selector checkbox, subtable toggle
			 */
			setupSystemColumn: function() {
				datatable.dataSet = datatable.dataSet || [];
				// no records available
				if (datatable.dataSet.length === 0) return;

				var columns = options.columns;
				$(datatable.tableBody).find('.' + pfx + 'datatable-row').each(function(tri, tr) {
					$(tr).find('.' + pfx + 'datatable-cell').each(function(tdi, td) {
						// get column settings by field
						var column = $.grep(columns, function(n, i) {
							return $(td).data('field') === n.field;
						})[0];
						if (typeof column !== 'undefined') {
							var value = $(td).text();

							// enable column selector
							if (typeof column.selector !== 'undefined' && column.selector !== false) {
								// check if checkbox exist
								if ($(td).find('.' + pfx + 'checkbox [type="checkbox"]').length > 0) return;

								$(td).addClass(pfx + 'datatable-cell-check');

								// append checkbox
								var chk = $('<label/>').
									addClass(pfx + 'checkbox ' + pfx + 'checkbox-single').
									append($('<input/>').attr('type', 'checkbox').attr('value', value).on('click', function() {
										if ($(this).is(':checked')) {
											// add checkbox active row class
											Plugin.setActive(this);
										} else {
											// add checkbox active row class
											Plugin.setInactive(this);
										}
									})).
									append('&nbsp;<span></span>');

								// checkbox selector has outline style
								if (typeof column.selector.class !== 'undefined') {
									$(chk).addClass(column.selector.class);
								}

								$(td).children().html(chk);
							}

							// enable column subtable toggle
							if (typeof column.subtable !== 'undefined' && column.subtable) {
								// check if subtable toggle exist
								if ($(td).find('.' + pfx + 'datatable-toggle-subtable').length > 0) return;
								// append subtable toggle
								$(td).
									children().
									html($('<a/>').
										addClass(pfx + 'datatable-toggle-subtable').
										attr('href', '#').
										attr('data-value', value).
										append($('<i/>').addClass(Plugin.getOption('layout.icons.rowDetail.collapse'))));
							}
						}
					});
				});

				// init checkbox for header/footer
				var initCheckbox = function(tr) {
					// get column settings by field
					var column = $.grep(columns, function(n, i) {
						return typeof n.selector !== 'undefined' && n.selector !== false;
					})[0];

					if (typeof column !== 'undefined') {
						// enable column selector
						if (typeof column.selector !== 'undefined' && column.selector !== false) {
							var td = $(tr).find('[data-field="' + column.field + '"]');
							// check if checkbox exist
							if ($(td).find('.' + pfx + 'checkbox [type="checkbox"]').length > 0) return;

							$(td).addClass(pfx + 'datatable-cell-check');

							// append checkbox
							var chk = $('<label/>').
								addClass(pfx + 'checkbox ' + pfx + 'checkbox-single ' + pfx + 'checkbox-all').
								append($('<input/>').attr('type', 'checkbox').on('click', function() {
									if ($(this).is(':checked')) {
										Plugin.setActiveAll(true);
									} else {
										Plugin.setActiveAll(false);
									}
								})).
								append('&nbsp;<span></span>');

							// checkbox selector has outline style
							if (typeof column.selector.class !== 'undefined') {
								$(chk).addClass(column.selector.class);
							}

							$(td).children().html(chk);
						}
					}
				};

				if (options.layout.header) {
					initCheckbox($(datatable.tableHead).find('.' + pfx + 'datatable-row').first());
				}
				if (options.layout.footer) {
					initCheckbox($(datatable.tableFoot).find('.' + pfx + 'datatable-row').first());
				}
			},

            maxWidthList: {},

			/**
			 * Adjust width to match container size
			 */
			adjustCellsWidth: function() {
				// get table width
				var containerWidth = $(datatable.tableBody).innerWidth() - Plugin.iconOffset;

				// get total number of columns
				var columns = $(datatable.tableBody).
					find('.' + pfx + 'datatable-row:first-child').
					find('.' + pfx + 'datatable-cell').
					// exclude expand icon
					not('.' + pfx + 'datatable-toggle-detail').
					not(':hidden').length;

				if (columns > 0) {
					//  remove reserved sort icon width
					containerWidth = containerWidth - (Plugin.iconOffset * columns);
					var minWidth = Math.floor(containerWidth / columns);

					// minimum width
					if (minWidth <= Plugin.cellOffset) {
						minWidth = Plugin.cellOffset;
					}

					$(datatable.table).find('.' + pfx + 'datatable-row').
							find('.' + pfx + 'datatable-cell').
							// exclude expand icon
							not('.' + pfx + 'datatable-toggle-detail').
							not(':hidden').each(function(tdi, td) {

						var width = minWidth;
						var dataWidth = $(td).data('width');

						if (typeof dataWidth !== 'undefined') {
							if (dataWidth === 'auto') {
								var field = $(td).data('field');
								if (Plugin.maxWidthList[field]) {
									width = Plugin.maxWidthList[field];
								}
								else {
									var cells = $(datatable.table).find('.' + pfx + 'datatable-cell[data-field="' + field + '"]');
									width = Plugin.maxWidthList[field] = Math.max.apply(null,
											$(cells).map(function() {
												return $(this).outerWidth();
											}).get());
								}
							}
							else {
								width = dataWidth;
							}
						}
						$(td).children().css('width', Math.ceil(width));
					});
				}

				return datatable;
			},

			/**
			 * Adjust height to match container size
			 */
			adjustCellsHeight: function() {
				$.each($(datatable.table).children(), function(part, tablePart) {
					var totalRows = $(tablePart).find('.' + pfx + 'datatable-row').first().parent().find('.' + pfx + 'datatable-row').length;
					for (var i = 1; i <= totalRows; i++) {
						var rows = $(tablePart).find('.' + pfx + 'datatable-row:nth-child(' + i + ')');
						if ($(rows).length > 0) {
							var maxHeight = Math.max.apply(null, $(rows).map(function() {
								return $(this).outerHeight();
							}).get());
							$(rows).css('height', Math.ceil(maxHeight));
						}
					}
				});
			},

			/**
			 * Setup table DOM and classes
			 */
			setupDOM: function(table) {
				// set table classes
				$(table).find('> thead').addClass(pfx + 'datatable-head');
				$(table).find('> tbody').addClass(pfx + 'datatable-body');
				$(table).find('> tfoot').addClass(pfx + 'datatable-foot');
				$(table).find('tr').addClass(pfx + 'datatable-row');
				$(table).find('tr > th, tr > td').addClass(pfx + 'datatable-cell');
				$(table).find('tr > th, tr > td').each(function(i, td) {
					if ($(td).find('span').length === 0) {
						$(td).wrapInner($('<span/>').css('width', Plugin.cellOffset));
					}
				});
			},

			/**
			 * Default scrollbar
			 * @returns {{tableLocked: null, init: init, onScrolling:
			 *     onScrolling}}
			 */
			scrollbar: function() {
				var scroll = {
					scrollable: null,
					tableLocked: null,
					initPosition: null,
					init: function() {
						var screen = util.getViewPort().width;
						// setup scrollable datatable
						if (options.layout.scroll) {
							// add scrollable datatable class
							$(datatable.wrap).addClass(pfx + 'datatable-scroll');

							var scrollable = $(datatable.tableBody).find('.' + pfx + 'datatable-lock-scroll');

							// check if scrollable area have rows
							if ($(scrollable).find('.' + pfx + 'datatable-row').length > 0 && $(scrollable).length > 0) {
								scroll.scrollHead = $(datatable.tableHead).find('> .' + pfx + 'datatable-lock-scroll > .' + pfx + 'datatable-row');
								scroll.scrollFoot = $(datatable.tableFoot).find('> .' + pfx + 'datatable-lock-scroll > .' + pfx + 'datatable-row');
								scroll.tableLocked = $(datatable.tableBody).find('.' + pfx + 'datatable-lock:not(.' + pfx + 'datatable-lock-scroll)');
								if (Plugin.getOption('layout.customScrollbar') && util.detectIE() != 10 && screen > util.getBreakpoint('lg')) {
									scroll.initCustomScrollbar(scrollable[0]);
								} else {
									scroll.initDefaultScrollbar(scrollable);
								}
							} else if ($(datatable.tableBody).find('.' + pfx + 'datatable-row').length > 0) {
								scroll.scrollHead = $(datatable.tableHead).find('> .' + pfx + 'datatable-row');
								scroll.scrollFoot = $(datatable.tableFoot).find('> .' + pfx + 'datatable-row');
								if (Plugin.getOption('layout.customScrollbar') && util.detectIE() != 10 && screen > util.getBreakpoint('lg')) {
									scroll.initCustomScrollbar(datatable.tableBody);
								} else {
									scroll.initDefaultScrollbar(datatable.tableBody);
								}
							}
						}
					},
					initDefaultScrollbar: function(scrollable) {
						// get initial scroll position
						scroll.initPosition = $(scrollable).scrollLeft();
						$(scrollable).css('overflow-y', 'auto').off().on('scroll', scroll.onScrolling);
						$(scrollable).css('overflow-x', 'auto');
					},
					onScrolling: function(e) {
						var left = $(this).scrollLeft();
						var top = $(this).scrollTop();
						if (util.isRTL()) {
							// deduct initial position for RTL
							left = left - scroll.initPosition;
						}
						$(scroll.scrollHead).css('left', -left);
						$(scroll.scrollFoot).css('left', -left);
						$(scroll.tableLocked).each(function(i, table) {
							if (Plugin.isLocked()) {
								// scrollbar offset
								top -= 1;
							}
							$(table).css('top', -top);
						});
					},
					initCustomScrollbar: function(scrollable) {
						scroll.scrollable = scrollable;
						// create a new instance for table body with scrollbar
						Plugin.initScrollbar(scrollable);
						// get initial scroll position
						scroll.initPosition = $(scrollable).scrollLeft();
						$(scrollable).off().on('scroll', scroll.onScrolling);
					},
				};
				scroll.init();
				return scroll;
			},

			/**
			 * Init custom scrollbar and reset position
			 * @param element
			 * @param options
			 */
			initScrollbar: function(element, options) {
				if (!element || !element.nodeName) {
					return;
				}
				$(datatable.tableBody).css('overflow', '');
				var ps = $(element).data('ps');
				if (util.hasClass(element, 'ps') && typeof ps !== 'undefined') {
					ps.update();
				} else {
					ps = new PerfectScrollbar(element, Object.assign({}, {
						wheelSpeed: 0.5,
						swipeEasing: true,
						// wheelPropagation: false,
						minScrollbarLength: 40,
						maxScrollbarLength: 300,
						suppressScrollX: Plugin.getOption('rows.autoHide') && !Plugin.isLocked()
					}, options));
					$(element).data('ps', ps);
				}

				// reset perfect scrollbar on resize
				$(window).resize(function() {
					ps.update();
				});
			},

			/**
			 * Set column title from options.columns settings
			 */
			setHeadTitle: function(tablePart) {
				if (typeof tablePart === 'undefined') tablePart = datatable.tableHead;
				tablePart = $(tablePart)[0];
				var columns = options.columns;
				var row = tablePart.getElementsByTagName('tr')[0];
				var ths = tablePart.getElementsByTagName('td');

				if (typeof row === 'undefined') {
					row = document.createElement('tr');
					tablePart.appendChild(row);
				}

				$.each(columns, function(i, column) {
					var th = ths[i];
					if (typeof th === 'undefined') {
						th = document.createElement('th');
						row.appendChild(th);
					}

					// set column title
					if (typeof column['title'] !== 'undefined') {
						th.innerHTML = column.title;
						th.setAttribute('data-field', column.field);
						util.addClass(th, column.class);
						// set disable autoHide or force enable
						if (typeof column.autoHide !== 'undefined') {
							if (column.autoHide !== true) {
								th.setAttribute('data-autohide-disabled', column.autoHide);
							} else {
								th.setAttribute('data-autohide-enabled', column.autoHide);
							}
						}
						$(th).data(column);
					}

					// set header attr option
					if (typeof column.attr !== 'undefined') {
						$.each(column.attr, function(key, val) {
							th.setAttribute(key, val);
						});
					}

					// apply text align to thead/tfoot
					if (typeof column.textAlign !== 'undefined') {
						var align = typeof datatable.textAlign[column.textAlign] !== 'undefined' ? datatable.textAlign[column.textAlign] : '';
						util.addClass(th, align);
					}
				});
				Plugin.setupDOM(tablePart);
			},

			/**
			 * Initiate to get remote or local data via ajax
			 */
			dataRender: function(action) {
				$(datatable.table).siblings('.' + pfx + 'datatable-pager').removeClass(pfx + 'datatable-paging-loaded');

				var buildMeta = function() {
					datatable.dataSet = datatable.dataSet || [];
					Plugin.localDataUpdate();
					// local pagination meta
					var meta = Plugin.getDataSourceParam('pagination');
					if (meta.perpage === 0) {
						meta.perpage = options.data.pageSize || 10;
					}
					meta.total = datatable.dataSet.length;
					var start = Math.max(meta.perpage * (meta.page - 1), 0);
					var end = Math.min(start + meta.perpage, meta.total);
					datatable.dataSet = $(datatable.dataSet).slice(start, end);
					return meta;
				};

				var afterGetData = function(result) {
					var localPagingCallback = function(ctx, meta) {
						if (!$(ctx.pager).hasClass(pfx + 'datatable-paging-loaded')) {
							$(ctx.pager).remove();
							ctx.init(meta);
						}
						$(ctx.pager).off().on(pfx + 'datatable-on-goto-page', function(e) {
							$(ctx.pager).remove();
							ctx.init(meta);
						});

						var start = Math.max(meta.perpage * (meta.page - 1), 0);
						var end = Math.min(start + meta.perpage, meta.total);

						Plugin.localDataUpdate();
						datatable.dataSet = $(datatable.dataSet).slice(start, end);

						// insert data into table content
						Plugin.insertData();
					};

					$(datatable.wrap).removeClass(pfx + 'datatable-error');
					// pagination enabled
					if (options.pagination) {
						if (options.data.serverPaging && options.data.type !== 'local') {
							// server pagination
							var serverMeta = Plugin.getObject('meta', result || null);
							if (serverMeta !== null) {
								Plugin.pagingObject = Plugin.paging(serverMeta);
							} else {
								// no meta object from server response, fallback to local pagination
								Plugin.pagingObject = Plugin.paging(buildMeta(), localPagingCallback);
							}
						} else {
							// local pagination can be used by remote data also
							Plugin.pagingObject = Plugin.paging(buildMeta(), localPagingCallback);
						}
					} else {
						// pagination is disabled
						Plugin.localDataUpdate();
					}
					// insert data into table content
					Plugin.insertData();
				};

				// get local datasource
				if (options.data.type === 'local'
					// for remote json datasource
					// || typeof options.data.source.read === 'undefined' && datatable.dataSet !== null
					// for remote datasource, server sorting is disabled and data already received from remote
					|| options.data.serverSorting === false && action === 'sort'
					|| options.data.serverFiltering === false && action === 'search'
				) {
					setTimeout(function() {
						afterGetData();
						Plugin.setAutoColumns();
					});
					return;
				}

				// getting data from remote only
				Plugin.getData().done(afterGetData);
			},

			/**
			 * Process ajax data
			 */
			insertData: function() {
				datatable.dataSet = datatable.dataSet || [];
				var params = Plugin.getDataSourceParam();

				// get row attributes
				var pagination = params.pagination;
				var start = (Math.max(pagination.page, 1) - 1) * pagination.perpage;
				var end = Math.min(pagination.page, pagination.pages) * pagination.perpage;
				var rowProps = {};
				if (typeof options.data.attr.rowProps !== 'undefined' && options.data.attr.rowProps.length) {
					rowProps = options.data.attr.rowProps.slice(start, end);
				}

				var tableBody = document.createElement('tbody');
				tableBody.style.visibility = 'hidden';
				var colLength = options.columns.length;

				$.each(datatable.dataSet, function(rowIndex, row) {
					var tr = document.createElement('tr');
					tr.setAttribute('data-row', rowIndex);
					// keep data object to row
					$(tr).data('obj', row);

					if (typeof rowProps[rowIndex] !== 'undefined') {
						$.each(rowProps[rowIndex], function() {
							tr.setAttribute(this.name, this.value);
						});
					}

					var cellIndex = 0;
					var tds = [];
					for (var a = 0; a < colLength; a += 1) {
						var column = options.columns[a];
						var classes = [];
						// add sorted class to cells
						if (Plugin.getObject('sort.field', params) === column.field) {
							classes.push(pfx + 'datatable-cell-sorted');
						}

						// apply text align
						if (typeof column.textAlign !== 'undefined') {
							var align = typeof datatable.textAlign[column.textAlign] !== 'undefined' ? datatable.textAlign[column.textAlign] : '';
							classes.push(align);
						}

						// var classAttr = '';
						if (typeof column.class !== 'undefined') {
							classes.push(column.class);
						}

						var td = document.createElement('td');
						util.addClass(td, classes.join(' '));
						td.setAttribute('data-field', column.field);
						// set disable autoHide or force enable
						if (typeof column.autoHide !== 'undefined') {
							if (column.autoHide !== true) {
								td.setAttribute('data-autohide-disabled', column.autoHide);
							} else {
								td.setAttribute('data-autohide-enabled', column.autoHide);
							}
						}
						td.innerHTML = Plugin.getObject(column.field, row);
						td.setAttribute('aria-label', Plugin.getObject(column.field, row));
						tr.appendChild(td);
					}

					tableBody.appendChild(tr);
				});

				// display no records message
				if (datatable.dataSet.length === 0) {
					var errorSpan = document.createElement('span');
					util.addClass(errorSpan, pfx + 'datatable-error');
					errorSpan.innerHTML = Plugin.getOption('translate.records.noRecords');
					tableBody.appendChild(errorSpan);
					$(datatable.wrap).addClass(pfx + 'datatable-error ' + pfx + 'datatable-loaded');
					Plugin.spinnerCallback(false);
				}

				// replace existing table body
				$(datatable.tableBody).replaceWith(tableBody);
				datatable.tableBody = tableBody;

				// layout update
				Plugin.setupDOM(datatable.table);
				Plugin.setupCellField([datatable.tableBody]);
				Plugin.setupTemplateCell(datatable.tableBody);
				Plugin.layoutUpdate();
			},

			updateTableComponents: function() {
				datatable.tableHead = $(datatable.table).children('thead').get(0);
				datatable.tableBody = $(datatable.table).children('tbody').get(0);
				datatable.tableFoot = $(datatable.table).children('tfoot').get(0);
			},

			/**
			 * Call ajax for raw JSON data
			 */
			getData: function() {
				// Plugin.spinnerCallback(true);

				var ajaxParams = {
					dataType: 'json',
					method: 'POST',
					data: {},
					timeout: Plugin.getOption('data.source.read.timeout') || 30000,
				};

				if (options.data.type === 'local') {
					ajaxParams.url = options.data.source;
				}

				if (options.data.type === 'remote') {
					var data = Plugin.getDataSourceParam();
					// remove if server params is not enabled
					if (!Plugin.getOption('data.serverPaging')) {
						delete data['pagination'];
					}
					if (!Plugin.getOption('data.serverSorting')) {
						delete data['sort'];
					}
					ajaxParams.data = $.extend({}, ajaxParams.data, Plugin.getOption('data.source.read.params'), data);
					ajaxParams = $.extend({}, ajaxParams, Plugin.getOption('data.source.read'));

					if (typeof ajaxParams.url !== 'string') ajaxParams.url = Plugin.getOption('data.source.read');
					if (typeof ajaxParams.url !== 'string') ajaxParams.url = Plugin.getOption('data.source');
					// ajaxParams.data = $.extend(ajaxParams.data, data.pagination);
				}

				return $.ajax(ajaxParams).done(function(response, textStatus, jqXHR) {
					datatable.lastResponse = response;
					// extendible data map callback for custom datasource
					datatable.dataSet = datatable.originalDataSet = Plugin.dataMapCallback(response);
					Plugin.setAutoColumns();
					$(datatable).trigger(pfx + 'datatable-on-ajax-done', [datatable.dataSet]);
				}).fail(function(jqXHR, textStatus, errorThrown) {
					$(datatable).trigger(pfx + 'datatable-on-ajax-fail', [jqXHR]);
					$(datatable.tableBody).html($('<span/>').addClass(pfx + 'datatable-error').html(Plugin.getOption('translate.records.noRecords')));
					$(datatable.wrap).addClass(pfx + 'datatable-error ' + pfx + 'datatable-loaded');
					Plugin.spinnerCallback(false);
				}).always(function() {
				});
			},

			/**
			 * Pagination object
			 * @param meta if null, local pagination, otherwise remote
			 *     pagination
			 * @param callback for update data when navigating page
			 */
			paging: function(meta, callback) {
				var pg = {
					meta: null,
					pager: null,
					paginateEvent: null,
					pagerLayout: {pagination: null, info: null},
					callback: null,
					init: function(meta) {
						pg.meta = meta;

						// parse pagination meta to integer
						pg.meta.page = parseInt(pg.meta.page);
						pg.meta.pages = parseInt(pg.meta.pages);
						pg.meta.perpage = parseInt(pg.meta.perpage);
						pg.meta.total = parseInt(pg.meta.total);

						// always recount total pages
						pg.meta.pages = Math.max(Math.ceil(pg.meta.total / pg.meta.perpage), 1);

						// current page must be not over than total pages
						if (pg.meta.page > pg.meta.pages) pg.meta.page = pg.meta.pages;

						// set unique event name between tables
						pg.paginateEvent = Plugin.getTablePrefix('paging');

						pg.pager = $(datatable.table).siblings('.' + pfx + 'datatable-pager');
						if ($(pg.pager).hasClass(pfx + 'datatable-paging-loaded')) return;

						// if class .'+pfx+'datatable-paging-loaded not exist, recreate pagination
						$(pg.pager).remove();

						// if no pages available
						if (pg.meta.pages === 0) return;

						// update datasource params
						Plugin.setDataSourceParam('pagination', {
							page: pg.meta.page,
							pages: pg.meta.pages,
							perpage: pg.meta.perpage,
							total: pg.meta.total,
						});

						// default callback function, contains remote pagination handler
						pg.callback = pg.serverCallback;
						// custom callback function
						if (typeof callback === 'function') pg.callback = callback;

						pg.addPaginateEvent();
						pg.populate();

						pg.meta.page = Math.max(pg.meta.page || 1, pg.meta.page);

						$(datatable).trigger(pg.paginateEvent, pg.meta);

						pg.pagingBreakpoint.call();
						$(window).resize(pg.pagingBreakpoint);
					},
					serverCallback: function(ctx, meta) {
						Plugin.dataRender();
					},
					populate: function() {
						datatable.dataSet = datatable.dataSet || [];
						// no records available
						if (datatable.dataSet.length === 0) return;

						var icons = Plugin.getOption('layout.icons.pagination');
						var title = Plugin.getOption('translate.toolbar.pagination.items.default');
						// pager root element
						pg.pager = $('<div/>').addClass(pfx + 'datatable-pager ' + pfx + 'datatable-paging-loaded');
						// numbering links
						var pagerNumber = $('<ul/>').addClass(pfx + 'datatable-pager-nav mb-5 mb-sm-0');
						pg.pagerLayout['pagination'] = pagerNumber;

						// pager first/previous button
						$('<li/>').
							append($('<a/>').
								attr('title', title.first).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-first').
								append($('<i/>').addClass(icons.first)).
								on('click', pg.gotoMorePage).
								attr('data-page', 1)).
							appendTo(pagerNumber);
						$('<li/>').
							append($('<a/>').
								attr('title', title.prev).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-prev').
								append($('<i/>').addClass(icons.prev)).
								on('click', pg.gotoMorePage)).
							appendTo(pagerNumber);

						// more previous pages
						$('<li/>').
							append($('<a/>').
								attr('title', title.more).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-more-prev').
								html($('<i/>').addClass(icons.more)).
								on('click', pg.gotoMorePage)).
							appendTo(pagerNumber);

						$('<li/>').append($('<input/>').attr('type', 'text').addClass(pfx + 'datatable-pager-input form-control').attr('title', title.input).on('keyup', function() {
							// on keyup update [data-page]
							$(this).attr('data-page', Math.abs($(this).val()));
						}).on('keypress', function(e) {
							// on keypressed enter button
							if (e.which === 13) pg.gotoMorePage(e);
						})).appendTo(pagerNumber);

						var pagesNumber = Plugin.getOption('toolbar.items.pagination.pages.desktop.pagesNumber');
						var end = Math.ceil(pg.meta.page / pagesNumber) * pagesNumber;
						var start = end - pagesNumber;
						if (end > pg.meta.pages) {
							end = pg.meta.pages;
						}

						// keep pagination 1 if there is no records
						if (start < 0) {
							start = 0;
						}

						for (var x = start; x < (end || 1); x++) {
							var pageNumber = x + 1;
							$('<li/>').
								append($('<a/>').
									addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-number').
									text(pageNumber).
									attr('data-page', pageNumber).
									attr('title', pageNumber).
									on('click', pg.gotoPage)).
								appendTo(pagerNumber);
						}

						// more next pages
						$('<li/>').
							append($('<a/>').
								attr('title', title.more).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-more-next').
								html($('<i/>').addClass(icons.more)).
								on('click', pg.gotoMorePage)).
							appendTo(pagerNumber);

						// pager next/last button
						$('<li/>').
							append($('<a/>').
								attr('title', title.next).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-next').
								append($('<i/>').addClass(icons.next)).
								on('click', pg.gotoMorePage)).
							appendTo(pagerNumber);
						$('<li/>').
							append($('<a/>').
								attr('title', title.last).
								addClass(pfx + 'datatable-pager-link ' + pfx + 'datatable-pager-link-last').
								append($('<i/>').addClass(icons.last)).
								on('click', pg.gotoMorePage).
								attr('data-page', pg.meta.pages)).
							appendTo(pagerNumber);

						// page info
						if (Plugin.getOption('toolbar.items.info')) {
							pg.pagerLayout['info'] = $('<div/>').addClass(pfx + 'datatable-pager-info').append($('<span/>').addClass(pfx + 'datatable-pager-detail'));
						}

						$.each(Plugin.getOption('toolbar.layout'), function(i, layout) {
							$(pg.pagerLayout[layout]).appendTo(pg.pager);
						});

						// page size select
						var pageSizeSelect = $('<select/>').
							addClass('selectpicker ' + pfx + 'datatable-pager-size').
							attr('title', Plugin.getOption('translate.toolbar.pagination.items.default.select')).
							attr('data-width', '60px').
							attr('data-container', 'body').
							val(pg.meta.perpage).
							on('change', pg.updatePerpage).
							prependTo(pg.pagerLayout['info']);

						var pageSizes = Plugin.getOption('toolbar.items.pagination.pageSizeSelect');
						// default value here, to fix override option by user
						if (pageSizes.length == 0) pageSizes = [5, 10, 20, 30, 50, 100];
						$.each(pageSizes, function(i, size) {
							var display = size;
							if (size === -1) display = Plugin.getOption('translate.toolbar.pagination.items.default.all');
							$('<option/>').attr('value', size).html(display).appendTo(pageSizeSelect);
						});

						// init selectpicker to dropdown
						$(datatable).ready(function() {
							$('.selectpicker').
								selectpicker().
								on('hide.bs.select', function() {
									// fix dropup arrow icon on hide
									$(this).closest('.bootstrap-select').removeClass('dropup');
								}).
								siblings('.dropdown-toggle').
								attr('title', Plugin.getOption('translate.toolbar.pagination.items.default.select'));
						});

						pg.paste();
					},
					paste: function() {
						// insert pagination based on placement position, top|bottom
						$.each($.unique(Plugin.getOption('toolbar.placement')),
							function(i, position) {
								if (position === 'bottom') {
									$(pg.pager).clone(true).insertAfter(datatable.table);
								}
								if (position === 'top') {
									// pager top need some extra space
									$(pg.pager).clone(true).addClass(pfx + 'datatable-pager-top').insertBefore(datatable.table);
								}
							});
					},
					gotoMorePage: function(e) {
						e.preventDefault();
						// $(this) is a link of .'+pfx+'datatable-pager-link

						if ($(this).attr('disabled') === 'disabled') return false;

						var page = $(this).attr('data-page');

						// event from text input
						if (typeof page === 'undefined') {
							page = $(e.target).attr('data-page');
						}

						pg.openPage(parseInt(page));
						return false;
					},
					gotoPage: function(e) {
						e.preventDefault();
						// prevent from click same page number
						if ($(this).hasClass(pfx + 'datatable-pager-link-active')) return;

						pg.openPage(parseInt($(this).data('page')));
					},
					openPage: function(page) {
						// currentPage is 1-based index
						pg.meta.page = parseInt(page);

						$(datatable).trigger(pg.paginateEvent, pg.meta);
						pg.callback(pg, pg.meta);

						// update page callback function
						$(pg.pager).trigger(pfx + 'datatable-on-goto-page', pg.meta);
					},
					updatePerpage: function(e) {
						e.preventDefault();
						// if (Plugin.getOption('layout.height') === null) {
						// fix white space, when perpage is set from many records to less records
						// $('html, body').animate({scrollTop: $(datatable).position().top});
						// }

						// hide dropdown after select
						$(this).selectpicker('toggle');

						pg.pager = $(datatable.table).siblings('.' + pfx + 'datatable-pager').removeClass(pfx + 'datatable-paging-loaded');

						// on change select page size
						if (e.originalEvent) {
							pg.meta.perpage = parseInt($(this).val());
						}

						$(pg.pager).find('select.' + pfx + 'datatable-pager-size').val(pg.meta.perpage).attr('data-selected', pg.meta.perpage);

						// update datasource params
						Plugin.setDataSourceParam('pagination', {
							page: pg.meta.page,
							pages: pg.meta.pages,
							perpage: pg.meta.perpage,
							total: pg.meta.total,
						});

						// update page callback function
						$(pg.pager).trigger(pfx + 'datatable-on-update-perpage', pg.meta);
						$(datatable).trigger(pg.paginateEvent, pg.meta);
						pg.callback(pg, pg.meta);

						// update pagination info
						pg.updateInfo.call();
					},
					addPaginateEvent: function(e) {
						// pagination event
						$(datatable).off(pg.paginateEvent).on(pg.paginateEvent, function(e, meta) {
							Plugin.spinnerCallback(true);

							pg.pager = $(datatable.table).siblings('.' + pfx + 'datatable-pager');
							var pagerNumber = $(pg.pager).find('.' + pfx + 'datatable-pager-nav');

							// set sync active page class
							$(pagerNumber).find('.' + pfx + 'datatable-pager-link-active').removeClass(pfx + 'datatable-pager-link-active');
							$(pagerNumber).find('.' + pfx + 'datatable-pager-link-number[data-page="' + meta.page + '"]').addClass(pfx + 'datatable-pager-link-active');

							// set next and previous link page number
							$(pagerNumber).find('.' + pfx + 'datatable-pager-link-prev').attr('data-page', Math.max(meta.page - 1, 1));
							$(pagerNumber).find('.' + pfx + 'datatable-pager-link-next').attr('data-page', Math.min(meta.page + 1, meta.pages));

							// current page input value sync
							$(pg.pager).each(function() {
								$(this).find('.' + pfx + 'datatable-pager-input[type="text"]').prop('value', meta.page);
							});

							// if only 1 page, should hide page?
							// $(pg.pager).find('.' + pfx + 'datatable-pager-nav').show();
							// if (meta.pages <= 1) {
							// 	// hide pager if has 1 page
							// 	$(pg.pager).find('.' + pfx + 'datatable-pager-nav').hide();
							// }

							// update datasource params
							Plugin.setDataSourceParam('pagination', {
								page: pg.meta.page,
								pages: pg.meta.pages,
								perpage: pg.meta.perpage,
								total: pg.meta.total,
							});

							$(pg.pager).find('select.' + pfx + 'datatable-pager-size').val(meta.perpage).attr('data-selected', meta.perpage);

							// clear active rows
							$(datatable.table).find('.' + pfx + 'checkbox > [type="checkbox"]').prop('checked', false);
							$(datatable.table).find('.' + pfx + 'datatable-row-active').removeClass(pfx + 'datatable-row-active');

							pg.updateInfo.call();
							pg.pagingBreakpoint.call();
							// Plugin.resetScroll();
						});
					},
					updateInfo: function() {
						var start = Math.max(pg.meta.perpage * (pg.meta.page - 1) + 1, 1);
						var end = Math.min(start + pg.meta.perpage - 1, pg.meta.total);
						// page info update
						$(pg.pager).find('.' + pfx + 'datatable-pager-info').find('.' + pfx + 'datatable-pager-detail').html(Plugin.dataPlaceholder(
							Plugin.getOption('translate.toolbar.pagination.items.info'), {
								// set start page 0 if the is no records. eg. Showing 0 - 0 of 0
								start: pg.meta.total === 0 ? 0 : start,
								end: pg.meta.perpage === -1 ? pg.meta.total : end,
								pageSize: pg.meta.perpage === -1 ||
								pg.meta.perpage >= pg.meta.total
									? pg.meta.total
									: pg.meta.perpage,
								total: pg.meta.total,
							}));
					},

					/**
					 * Update pagination layout breakpoint
					 */
					pagingBreakpoint: function() {
						// keep page links reference
						var pagerNumber = $(datatable.table).siblings('.' + pfx + 'datatable-pager').find('.' + pfx + 'datatable-pager-nav');
						if ($(pagerNumber).length === 0) return;

						var currentPage = Plugin.getCurrentPage();
						var pagerInput = $(pagerNumber).find('.' + pfx + 'datatable-pager-input').closest('li');

						// reset
						$(pagerNumber).find('li').show();

						// pagination update
						$.each(Plugin.getOption('toolbar.items.pagination.pages'),
							function(mode, option) {
								if (util.isInResponsiveRange(mode)) {
									switch (mode) {
										case 'desktop':
										case 'tablet':
											var end = Math.ceil(currentPage / option.pagesNumber) * option.pagesNumber;
											var start = end - option.pagesNumber;
											$(pagerInput).hide();
											pg.meta = Plugin.getDataSourceParam('pagination');
											pg.paginationUpdate();
											break;

										case 'mobile':
											$(pagerInput).show();
											$(pagerNumber).find('.' + pfx + 'datatable-pager-link-more-prev').closest('li').hide();
											$(pagerNumber).find('.' + pfx + 'datatable-pager-link-more-next').closest('li').hide();
											$(pagerNumber).find('.' + pfx + 'datatable-pager-link-number').closest('li').hide();
											break;
									}

									return false;
								}
							});
					},

					/**
					 * Update pagination number and button display
					 */
					paginationUpdate: function() {
						var pager = $(datatable.table).siblings('.' + pfx + 'datatable-pager').find('.' + pfx + 'datatable-pager-nav'),
							pagerMorePrev = $(pager).find('.' + pfx + 'datatable-pager-link-more-prev'),
							pagerMoreNext = $(pager).find('.' + pfx + 'datatable-pager-link-more-next'),
							pagerFirst = $(pager).find('.' + pfx + 'datatable-pager-link-first'),
							pagerPrev = $(pager).find('.' + pfx + 'datatable-pager-link-prev'),
							pagerNext = $(pager).find('.' + pfx + 'datatable-pager-link-next'),
							pagerLast = $(pager).find('.' + pfx + 'datatable-pager-link-last');

						// get visible page
						var pagerNumber = $(pager).find('.' + pfx + 'datatable-pager-link-number');
						// get page before of first visible
						var morePrevPage = Math.max($(pagerNumber).first().data('page') - 1, 1);
						$(pagerMorePrev).each(function(i, prev) {
							$(prev).attr('data-page', morePrevPage);
						});
						// show/hide <li>
						if (morePrevPage === 1) {
							$(pagerMorePrev).parent().hide();
						} else {
							$(pagerMorePrev).parent().show();
						}

						// get page after of last visible
						var moreNextPage = Math.min($(pagerNumber).last().data('page') + 1,
							pg.meta.pages);
						$(pagerMoreNext).each(function(i, prev) {
							$(pagerMoreNext).attr('data-page', moreNextPage).show();
						});

						// show/hide <li>
						if (moreNextPage === pg.meta.pages
							// missing dot fix when last hidden page is one left
							&& moreNextPage === $(pagerNumber).last().data('page')) {
							$(pagerMoreNext).parent().hide();
						} else {
							$(pagerMoreNext).parent().show();
						}

						// begin/end of pages
						if (pg.meta.page === 1) {
							$(pagerFirst).attr('disabled', true).addClass(pfx + 'datatable-pager-link-disabled');
							$(pagerPrev).attr('disabled', true).addClass(pfx + 'datatable-pager-link-disabled');
						} else {
							$(pagerFirst).removeAttr('disabled').removeClass(pfx + 'datatable-pager-link-disabled');
							$(pagerPrev).removeAttr('disabled').removeClass(pfx + 'datatable-pager-link-disabled');
						}
						if (pg.meta.page === pg.meta.pages) {
							$(pagerNext).attr('disabled', true).addClass(pfx + 'datatable-pager-link-disabled');
							$(pagerLast).attr('disabled', true).addClass(pfx + 'datatable-pager-link-disabled');
						} else {
							$(pagerNext).removeAttr('disabled').removeClass(pfx + 'datatable-pager-link-disabled');
							$(pagerLast).removeAttr('disabled').removeClass(pfx + 'datatable-pager-link-disabled');
						}

						// display more buttons
						var nav = Plugin.getOption('toolbar.items.pagination.navigation');
						if (!nav.first) $(pagerFirst).remove();
						if (!nav.prev) $(pagerPrev).remove();
						if (!nav.next) $(pagerNext).remove();
						if (!nav.last) $(pagerLast).remove();
						if (!nav.more) {
							$(pagerMorePrev).remove();
							$(pagerMoreNext).remove();
						}
					},
				};
				pg.init(meta);
				return pg;
			},

			/**
			 * Hide/show table cell defined by
			 * options[columns][i][responsive][visible/hidden]
			 */
			columnHide: function() {
				var screen = util.getViewPort().width;
				// foreach columns setting
				$.each(options.columns, function(i, column) {
					if (typeof column.responsive !== 'undefined' || typeof column.visible !== 'undefined') {
						var field = column.field;
						var tds = $.grep($(datatable.table).find('.' + pfx + 'datatable-cell'), function(n, i) {
							return field === $(n).data('field');
						});

						setTimeout(function () {
							// hide by force
							if (Plugin.getObject('visible', column) === false) {
								$(tds).hide();
							} else {
								// show/hide by responsive breakpoint
								if (util.getBreakpoint(Plugin.getObject('responsive.hidden', column)) >= screen) {
									$(tds).hide();
								} else {
									$(tds).show();
								}
								if (util.getBreakpoint(Plugin.getObject('responsive.visible', column)) <= screen) {
									$(tds).show();
								} else {
									$(tds).hide();
								}
							}
						});
					}
				});
			},

			/**
			 * Setup sub datatable
			 */
			setupSubDatatable: function() {
				var subTableCallback = Plugin.getOption('detail.content');
				if (typeof subTableCallback !== 'function') return;

				// subtable already exist
				if ($(datatable.table).find('.' + pfx + 'datatable-subtable').length > 0) return;

				$(datatable.wrap).addClass(pfx + 'datatable-subtable');

				options.columns[0]['subtable'] = true;

				// toggle on open sub table
				var toggleSubTable = function(e) {
					e.preventDefault();
					// get parent row of this subtable
					var parentRow = $(this).closest('.' + pfx + 'datatable-row');

					// get subtable row for sub table
					var subTableRow = $(parentRow).next('.' + pfx + 'datatable-row-subtable');
					if ($(subTableRow).length === 0) {
						// prepare DOM for sub table, each <tr> as parent and add <tr> as child table
						subTableRow = $('<tr/>').
							addClass(pfx + 'datatable-row-subtable ' + pfx + 'datatable-row-loading').
							hide().
							append($('<td/>').addClass(pfx + 'datatable-subtable').attr('colspan', Plugin.getTotalColumns()));
						$(parentRow).after(subTableRow);
						// add class to even row
						if ($(parentRow).hasClass(pfx + 'datatable-row-even')) {
							$(subTableRow).addClass(pfx + 'datatable-row-subtable-even');
						}
					}

					$(subTableRow).toggle();

					var subTable = $(subTableRow).find('.' + pfx + 'datatable-subtable');

					// get id from first column of parent row
					var primaryKey = $(this).closest('[data-field]:first-child').find('.' + pfx + 'datatable-toggle-subtable').data('value');

					var icon = $(this).find('i').removeAttr('class');

					// prevent duplicate datatable init
					if ($(parentRow).hasClass(pfx + 'datatable-row-subtable-expanded')) {
						$(icon).addClass(Plugin.getOption('layout.icons.rowDetail.collapse'));
						// remove expand class from parent row
						$(parentRow).removeClass(pfx + 'datatable-row-subtable-expanded');
						// trigger event on collapse
						$(datatable).trigger(pfx + 'datatable-on-collapse-subtable', [parentRow]);
					} else {
						// expand and run callback function
						$(icon).addClass(Plugin.getOption('layout.icons.rowDetail.expand'));
						// add expand class to parent row
						$(parentRow).addClass(pfx + 'datatable-row-subtable-expanded');
						// trigger event on expand
						$(datatable).trigger(pfx + 'datatable-on-expand-subtable', [parentRow]);
					}

					// prevent duplicate datatable init
					if ($(subTable).find('.' + pfx + 'datatable').length === 0) {
						// get data by primary id
						$.map(datatable.dataSet, function(n, i) {
							// primary id must be at the first column, otherwise e.data will be undefined
							if (primaryKey === n[options.columns[0].field]) {
								e.data = n;
								return true;
							}
							return false;
						});

						// deprecated in v5.0.6
						e.detailCell = subTable;

						e.parentRow = parentRow;
						e.subTable = subTable;

						// run callback with event
						subTableCallback(e);

						$(subTable).children('.' + pfx + 'datatable').on(pfx + 'datatable-on-init', function(e) {
							$(subTableRow).removeClass(pfx + 'datatable-row-loading');
						});
						if (Plugin.getOption('data.type') === 'local') {
							$(subTableRow).removeClass(pfx + 'datatable-row-loading');
						}
					}
				};

				var columns = options.columns;
				$(datatable.tableBody).find('.' + pfx + 'datatable-row').each(function(tri, tr) {
					$(tr).find('.' + pfx + 'datatable-cell').each(function(tdi, td) {
						// get column settings by field
						var column = $.grep(columns, function(n, i) {
							return $(td).data('field') === n.field;
						})[0];
						if (typeof column !== 'undefined') {
							var value = $(td).text();
							// enable column subtable toggle
							if (typeof column.subtable !== 'undefined' && column.subtable) {
								// check if subtable toggle exist
								if ($(td).find('.' + pfx + 'datatable-toggle-subtable').length > 0) return;
								// append subtable toggle
								$(td).
									html($('<a/>').
										addClass(pfx + 'datatable-toggle-subtable').
										attr('href', '#').
										attr('data-value', value).
										attr('title', Plugin.getOption('detail.title')).
										on('click', toggleSubTable).
										append($('<i/>').css('width', $(td).data('width')).addClass(Plugin.getOption('layout.icons.rowDetail.collapse'))));
							}
						}
					});
				});

				// $(datatable.tableHead).find('.'+pfx+'-datatable-row').first()
			},

			/**
			 * Datasource mapping callback
			 */
			dataMapCallback: function(raw) {
				// static dataset array
				var dataSet = raw;
				// dataset mapping callback
				if (typeof Plugin.getOption('data.source.read.map') === 'function') {
					return Plugin.getOption('data.source.read.map')(raw);
				} else {
					// default data mapping fallback
					if (typeof raw !== 'undefined' && typeof raw.data !== 'undefined') {
						dataSet = raw.data;
					}
				}
				return dataSet;
			},

			isSpinning: false,
			/**
			 * BlockUI spinner callback
			 * @param block
			 * @param target
			 */
			spinnerCallback: function(block, target) {
				if (typeof target === 'undefined') target = datatable;
				// get spinner options
				var spinnerOptions = Plugin.getOption('layout.spinner');
				// spinner is disabled
				if (typeof spinnerOptions === 'undefined' || !spinnerOptions) {
					return;
				}
				if (block) {
					if (!Plugin.isSpinning) {
						if (typeof spinnerOptions.message !== 'undefined' && spinnerOptions.message === true) {
							// use default spinner message from translation
							spinnerOptions.message = Plugin.getOption('translate.records.processing');
						}
						Plugin.isSpinning = true;
						if (typeof app !== 'undefined') {
							app.block(target, spinnerOptions);
						}
					}
				} else {
					Plugin.isSpinning = false;
					if (typeof app !== 'undefined') {
						app.unblock(target);
					}
				}
			},

			/**
			 * Default sort callback function
			 * @param data
			 * @param sort
			 * @param column
			 * @returns {*|Array.<T>|{sort, field}|{asc, desc}}
			 */
			sortCallback: function(data, sort, column) {
				var type = column['type'] || 'string';
				var format = column['format'] || '';
				var field = column['field'];

				return $(data).sort(function(a, b) {
					var aField = a[field];
					var bField = b[field];

					switch (type) {
						case 'date':
							if (typeof moment === 'undefined') {
								throw new Error('Moment.js is required.');
							}
							var diff = moment(aField, format).diff(moment(bField, format));
							if (sort === 'asc') {
								return diff > 0 ? 1 : diff < 0 ? -1 : 0;
							} else {
								return diff < 0 ? 1 : diff > 0 ? -1 : 0;
							}
							break;

						case 'number':
							if (isNaN(parseFloat(aField)) && aField != null) {
								aField = Number(aField.replace(/[^0-9\.-]+/g, ''));
							}
							if (isNaN(parseFloat(bField)) && bField != null) {
								bField = Number(bField.replace(/[^0-9\.-]+/g, ''));
							}
							aField = parseFloat(aField);
							bField = parseFloat(bField);
							if (sort === 'asc') {
								return aField > bField ? 1 : aField < bField ? -1 : 0;
							} else {
								return aField < bField ? 1 : aField > bField ? -1 : 0;
							}
							break;

						case 'html':
							return $(data).sort(function(a, b) {
								// get the text only from html
								aField = $(a[field]).text();
								bField = $(b[field]).text();
								// sort
								if (sort === 'asc') {
									return aField > bField ? 1 : aField < bField ? -1 : 0;
								} else {
									return aField < bField ? 1 : aField > bField ? -1 : 0;
								}
							});
							break;

						case 'string':
						default:
							if (sort === 'asc') {
								return aField > bField ? 1 : aField < bField ? -1 : 0;
							} else {
								return aField < bField ? 1 : aField > bField ? -1 : 0;
							}
							break;
					}
				});
			},

			/**
			 * Custom debug log
			 * @param text
			 * @param obj
			 */
			log: function(text, obj) {
				if (typeof obj === 'undefined') obj = '';
				if (datatable.debug) {
					console.log(text, obj);
				}
			},

			/**
			 * Auto hide columnds overflow in row
			 */
			autoHide: function() {
				var hiddenExist = false;
				// force hide enabled
				var hidDefault = $(datatable.table).find('[data-autohide-enabled]');
				if (hidDefault.length) {
					hiddenExist = true;
					hidDefault.hide();
				}

				var toggleHiddenColumns = function(e) {
					e.preventDefault();

					var row = $(this).closest('.' + pfx + 'datatable-row');
					var detailRow = $(row).next();

					if (!$(detailRow).hasClass(pfx + 'datatable-row-detail')) {
						$(this).find('i').removeClass(Plugin.getOption('layout.icons.rowDetail.collapse')).addClass(Plugin.getOption('layout.icons.rowDetail.expand'));

						var hiddenCells = $(row).find('.' + pfx + 'datatable-cell:hidden');
						var clonedCells = hiddenCells.clone().show();

						detailRow = $('<tr/>').addClass(pfx + 'datatable-row-detail').insertAfter(row);
						var detailRowTd = $('<td/>').addClass(pfx + 'datatable-detail').attr('colspan', Plugin.getTotalColumns()).appendTo(detailRow);

						var detailSubTable = $('<table/>');
						$(clonedCells).each(function() {
							var field = $(this).data('field');
							var column = $.grep(options.columns, function(n, i) {
								return field === n.field;
							})[0];
							if (typeof column === 'undefined' || column.visible !== false) {
								$(detailSubTable).
										append($('<tr class="' + pfx + 'datatable-row"></tr>').
												append($('<td class="' + pfx + 'datatable-cell"></td>').append($('<span/>').append(column.title))).
												append(this));
							}
						});
						$(detailRowTd).append(detailSubTable);

					} else {
						$(this).find('i').removeClass(Plugin.getOption('layout.icons.rowDetail.expand')).addClass(Plugin.getOption('layout.icons.rowDetail.collapse'));
						$(detailRow).remove();
					}
				};

				setTimeout(function () {
					$(datatable.table).find('.' + pfx + 'datatable-cell').show();
					$(datatable.tableBody).each(function() {
						var recursive = 0;
						while ($(this)[0].offsetWidth < $(this)[0].scrollWidth && recursive < options.columns.length) {
							$(datatable.table).find('.' + pfx + 'datatable-row').each(function(i) {
								var cell = $(this).find('.' + pfx + 'datatable-cell:not(:hidden):not([data-autohide-disabled])').last();
								$(cell).hide();
								hiddenExist = true;
							});
							recursive++;
						}
					});

					if (hiddenExist) {
						// toggle show hidden columns
						$(datatable.tableBody).find('.' + pfx + 'datatable-row').each(function() {
							// if no toggle yet
							if($(this).find('.' + pfx + 'datatable-toggle-detail').length === 0) {
								// add toggle
								$(this).prepend($('<td/>').
										addClass(pfx + 'datatable-cell ' + pfx + 'datatable-toggle-detail').
										append($('<a/>').
											addClass(pfx + 'datatable-toggle-detail').
											attr('href', '').
											on('click', toggleHiddenColumns).
											append('<i class="' + Plugin.getOption('layout.icons.rowDetail.collapse') + '"></i>')));
							}

							// check if subtable toggle exist
							if ($(datatable.tableHead).find('.' + pfx + 'datatable-toggle-detail').length === 0) {
								// add empty column to the header and footer
								$(datatable.tableHead).
									find('.' + pfx + 'datatable-row').
									first().
									prepend('<th class="' + pfx + 'datatable-cell ' + pfx + 'datatable-toggle-detail"><span></span></th>');
								$(datatable.tableFoot).
									find('.' + pfx + 'datatable-row').
									first().
									prepend('<th class="' + pfx + 'datatable-cell ' + pfx + 'datatable-toggle-detail"><span></span></th>');
							} else {
								$(datatable.tableHead).find('.' + pfx + 'datatable-toggle-detail').find('span');
							}
						});
					}
				});

				Plugin.adjustCellsWidth.call();
			},

			/**
			 * To enable auto columns features for remote data source
			 */
			setAutoColumns: function() {
				if (Plugin.getOption('data.autoColumns')) {
					$.each(datatable.dataSet[0], function(k, v) {
						var found = $.grep(options.columns, function(n, i) {
							return k === n.field;
						});
						if (found.length === 0) {
							options.columns.push({field: k, title: k});
						}
					});
					$(datatable.tableHead).find('.' + pfx + 'datatable-row').remove();
					Plugin.setHeadTitle();
					if (Plugin.getOption('layout.footer')) {
						$(datatable.tableFoot).find('.' + pfx + 'datatable-row').remove();
						Plugin.setHeadTitle(datatable.tableFoot);
					}
				}
			},

			/********************
			 ** HELPERS
			 ********************/

			/**
			 * Check if table is a locked colums table
			 */
			isLocked: function() {
				var isLocked = Plugin.lockEnabledColumns();
				return isLocked.left.length > 0 || isLocked.right.length > 0;
			},

			isSubtable: function() {
				return util.hasClass(datatable.wrap[0], pfx + 'datatable-subtable') || false;
			},

			/**
			 * Get total extra space of an element for width calculation,
			 * including padding, margin, border
			 * @param element
			 * @returns {number}
			 */
			getExtraSpace: function(element) {
				var padding = parseInt($(element).css('paddingRight')) +
					parseInt($(element).css('paddingLeft'));
				var margin = parseInt($(element).css('marginRight')) +
					parseInt($(element).css('marginLeft'));
				var border = Math.ceil(
					$(element).css('border-right-width').replace('px', ''));
				return padding + margin + border;
			},

			/**
			 * Insert data of array into {{ }} template placeholder
			 * @param template
			 * @param data
			 * @returns {*}
			 */
			dataPlaceholder: function(template, data) {
				var result = template;
				$.each(data, function(key, val) {
					result = result.replace('{{' + key + '}}', val);
				});
				return result;
			},

			/**
			 * Get table unique ID
			 * Note: table unique change each time refreshed
			 * @param suffix
			 * @returns {*}
			 */
			getTableId: function(suffix) {
				if (typeof suffix === 'undefined') suffix = '';
				var id = $(datatable).attr('id');
				if (typeof id === 'undefined') {
					id = $(datatable).attr('class').split(' ')[0];
				}
				return id + suffix;
			},

			/**
			 * Get table prefix with depth number
			 */
			getTablePrefix: function(suffix) {
				if (typeof suffix !== 'undefined') suffix = '-' + suffix;
				return Plugin.getTableId() + '-' + Plugin.getDepth() + suffix;
			},

			/**
			 * Get current table depth of sub table
			 * @returns {number}
			 */
			getDepth: function() {
				var depth = 0;
				var table = datatable.table;
				do {
					table = $(table).parents('.' + pfx + 'datatable-table');
					depth++;
				} while ($(table).length > 0);
				return depth;
			},

			/**
			 * Keep state item
			 * @param key
			 * @param value
			 */
			stateKeep: function(key, value) {
				key = Plugin.getTablePrefix(key);
				if (Plugin.getOption('data.saveState') === false) return;
				if (localStorage) {
					localStorage.setItem(key, JSON.stringify(value));
				}
			},

			/**
			 * Get state item
			 * @param key
			 * @param defValue
			 */
			stateGet: function(key, defValue) {
				key = Plugin.getTablePrefix(key);
				if (Plugin.getOption('data.saveState') === false) return;
				var value = null;
				if (localStorage) {
					value = localStorage.getItem(key);
				}
				if (typeof value !== 'undefined' && value !== null) {
					return JSON.parse(value);
				}
			},

			/**
			 * Update data in state without clear existing
			 * @param key
			 * @param value
			 */
			stateUpdate: function(key, value) {
				var ori = Plugin.stateGet(key);
				if (typeof ori === 'undefined' || ori === null) ori = {};
				Plugin.stateKeep(key, $.extend({}, ori, value));
			},

			/**
			 * Remove state item
			 * @param key
			 */
			stateRemove: function(key) {
				key = Plugin.getTablePrefix(key);
				if (localStorage) {
					localStorage.removeItem(key);
				}
			},

			/**
			 * Get total columns.
			 */
			getTotalColumns: function(tablePart) {
				if (typeof tablePart === 'undefined') tablePart = datatable.tableBody;
				return $(tablePart).find('.' + pfx + 'datatable-row').first().find('.' + pfx + 'datatable-cell').length;
			},

			/**
			 * Get table row. Useful to get row when current table is in lock
			 * mode. Can be used for both lock and normal table mode. By
			 * default, returning result will be in a list of <td>.
			 * @param tablePart
			 * @param row 1-based index
			 * @param tdOnly Optional. Default true
			 * @returns {*}
			 */
			getOneRow: function(tablePart, row, tdOnly) {
				if (typeof tdOnly === 'undefined') tdOnly = true;
				// get list of <tr>
				var result = $(tablePart).find('.' + pfx + 'datatable-row:not(.' + pfx + 'datatable-row-detail):nth-child(' + row + ')');
				if (tdOnly) {
					// get list of <td> or <th>
					result = result.find('.' + pfx + 'datatable-cell');
				}
				return result;
			},

			/**
			 * Sort table row at HTML level by column index.
			 * todo; Not in use.
			 * @param header Header sort clicked
			 * @param sort asc|desc. Optional. Default asc
			 * @param int Boolean. Optional. Comparison value parse to integer.
			 *     Default false
			 */
			sortColumn: function(header, sort, int) {
				if (typeof sort === 'undefined') sort = 'asc'; // desc
				if (typeof int === 'undefined') int = false;

				var column = $(header).index();
				var rows = $(datatable.tableBody).find('.' + pfx + 'datatable-row');
				var hIndex = $(header).closest('.' + pfx + 'datatable-lock').index();
				if (hIndex !== -1) {
					rows = $(datatable.tableBody).find('.' + pfx + 'datatable-lock:nth-child(' + (hIndex + 1) + ')').find('.' + pfx + 'datatable-row');
				}

				var container = $(rows).parent();
				$(rows).sort(function(a, b) {
					var tda = $(a).find('td:nth-child(' + column + ')').text();
					var tdb = $(b).find('td:nth-child(' + column + ')').text();

					if (int) {
						// useful for integer type sorting
						tda = parseInt(tda);
						tdb = parseInt(tdb);
					}

					if (sort === 'asc') {
						return tda > tdb ? 1 : tda < tdb ? -1 : 0;
					} else {
						return tda < tdb ? 1 : tda > tdb ? -1 : 0;
					}
				}).appendTo(container);
			},

			/**
			 * Perform sort remote and local
			 */
			sorting: function() {
				var sortObj = {
					init: function() {
						if (options.sortable) {
							$(datatable.tableHead).
								find('.' + pfx + 'datatable-cell:not(.' + pfx + 'datatable-cell-check)').
								addClass(pfx + 'datatable-cell-sort').
								off('click').
								on('click', sortObj.sortClick);
							// first init
							sortObj.setIcon();
						}
					},
					setIcon: function() {
						var meta = Plugin.getDataSourceParam('sort');
						if ($.isEmptyObject(meta)) return;

						var column = Plugin.getColumnByField(meta.field);
						// sort is disabled for this column
						if (typeof column === 'undefined') return;
						if (typeof column.sortable !== 'undefined' && column.sortable === false) return;
						if (typeof column.selector !== 'undefined' && column.selector === true) return;

						// sort icon beside column header
						var td = $(datatable.tableHead).find('.' + pfx + 'datatable-cell[data-field="' + meta.field + '"]').attr('data-sort', meta.sort);
						var sorting = $(td).find('span');
						var icon = $(sorting).find('i');

						var icons = Plugin.getOption('layout.icons.sort');
						// update sort icon; desc & asc
						if ($(icon).length > 0) {
							$(icon).removeAttr('class').addClass(icons[meta.sort]);
						} else {
							$(sorting).append($('<i/>').addClass(icons[meta.sort]));
						}

						// set sorted class to header on init
						$(td).addClass(pfx + 'datatable-cell-sorted');
					},
					sortClick: function(e) {
						var meta = Plugin.getDataSourceParam('sort');
						var field = $(this).data('field');
						var column = Plugin.getColumnByField(field);
						// sort is disabled for this column
						if (typeof column === 'undefined') return;
						if (typeof column.sortable !== 'undefined' && column.sortable === false) return;
						if (typeof column.selector !== 'undefined' && column.selector === true) return;

						// set sorted class to header
						$(datatable.tableHead).find('th').removeClass(pfx + 'datatable-cell-sorted');
						util.addClass(this, pfx + 'datatable-cell-sorted');

						$(datatable.tableHead).find('.' + pfx + 'datatable-cell > span > i').remove();

						if (options.sortable) {
							Plugin.spinnerCallback(true);

							var sort = 'desc';
							if (Plugin.getObject('field', meta) === field) {
								sort = Plugin.getObject('sort', meta);
							}

							// toggle sort
							sort = typeof sort === 'undefined' || sort === 'desc'
								? 'asc'
								: 'desc';

							// update field and sort params
							meta = {field: field, sort: sort};
							Plugin.setDataSourceParam('sort', meta);

							sortObj.setIcon();

							setTimeout(function() {
								Plugin.dataRender('sort');
								$(datatable).trigger(pfx + 'datatable-on-sort', meta);
							}, 300);
						}
					},
				};
				sortObj.init();
			},

			/**
			 * Update JSON data list linked with sort, filter and pagination.
			 * Call this method, before using dataSet variable.
			 * @returns {*|null}
			 */
			localDataUpdate: function() {
				var params = Plugin.getDataSourceParam();
				if (typeof datatable.originalDataSet === 'undefined') {
					datatable.originalDataSet = datatable.dataSet;
				}

				var field = Plugin.getObject('sort.field', params);
				var sort = Plugin.getObject('sort.sort', params);
				var column = Plugin.getColumnByField(field);
				if (typeof column !== 'undefined' && Plugin.getOption('data.serverSorting') !== true) {
					if (typeof column.sortCallback === 'function') {
						datatable.dataSet = column.sortCallback(datatable.originalDataSet, sort, column);
					} else {
						datatable.dataSet = Plugin.sortCallback(datatable.originalDataSet, sort, column);
					}
				} else {
					datatable.dataSet = datatable.originalDataSet;
				}

				// if server filter enable, don't pass local filter
				if (typeof params.query === 'object' && !Plugin.getOption('data.serverFiltering')) {
					params.query = params.query || {};

					var nestedSearch = function(obj) {
						for (var field in obj) {
							if (!obj.hasOwnProperty(field)) continue;
							if (typeof obj[field] === 'string') {
								if (obj[field].toLowerCase() == search || obj[field].toLowerCase().indexOf(search) !== -1) {
									return true;
								}
							} else if (typeof obj[field] === 'number') {
								if (obj[field] === search) {
									return true;
								}
							} else if (typeof obj[field] === 'object') {
								if (nestedSearch(obj[field])) {
									return true;
								}
							}
						}
						return false;
					};

					var search = $(Plugin.getOption('search.input')).val();
					if (typeof search !== 'undefined' && search !== '') {
						search = search.toLowerCase();
						datatable.dataSet = $.grep(datatable.dataSet, nestedSearch);
						// remove generalSearch as we don't need this for next columns filter
						delete params.query[Plugin.getGeneralSearchKey()];
					}

					// remove empty element from array
					$.each(params.query, function(k, v) {
						if (v === '') {
							delete params.query[k];
						}
					});

					// filter array by query
					datatable.dataSet = Plugin.filterArray(datatable.dataSet, params.query);

					// reset array index
					datatable.dataSet = datatable.dataSet.filter(function() {
						return true;
					});
				}

				return datatable.dataSet;
			},

			/**
			 * Utility helper to filter array by object pair of {key:value}
			 * @param list
			 * @param args
			 * @param operator
			 * @returns {*}
			 */
			filterArray: function(list, args, operator) {
				if (typeof list !== 'object') {
					return [];
				}

				if (typeof operator === 'undefined') operator = 'AND';

				if (typeof args !== 'object') {
					return list;
				}

				operator = operator.toUpperCase();

				if ($.inArray(operator, ['AND', 'OR', 'NOT']) === -1) {
					return [];
				}

				var count = Object.keys(args).length;
				var filtered = [];

				$.each(list, function(key, obj) {
					var to_match = obj;

					var matched = 0;
					$.each(args, function(m_key, m_value) {
						m_value = m_value instanceof Array ? m_value : [m_value];
						var match_property = Plugin.getObject(m_key, to_match);
						if (typeof match_property !== 'undefined' && match_property) {
							var lhs = match_property.toString().toLowerCase();
							m_value.forEach(function(item, index) {
								if (item.toString().toLowerCase() == lhs || lhs.indexOf(item.toString().toLowerCase()) !== -1) {
									matched++;
								}
							});
						}
					});

					if (('AND' == operator && matched == count) ||
						('OR' == operator && matched > 0) ||
						('NOT' == operator && 0 == matched)) {
						filtered[key] = obj;
					}
				});

				list = filtered;

				return list;
			},

			/**
			 * Reset lock column scroll to 0 when resize
			 */
			resetScroll: function() {
				if (typeof options.detail === 'undefined' && Plugin.getDepth() === 1) {
					$(datatable.table).find('.' + pfx + 'datatable-row').css('left', 0);
					$(datatable.table).find('.' + pfx + 'datatable-lock').css('top', 0);
					$(datatable.tableBody).scrollTop(0);
				}
			},

			/**
			 * Get column options by field
			 * @param field
			 * @returns {boolean}
			 */
			getColumnByField: function(field) {
				if (typeof field === 'undefined') return;
				var result;
				$.each(options.columns, function(i, column) {
					if (field === column.field) {
						result = column;
						return false;
					}
				});
				return result;
			},

			/**
			 * Get default sort column
			 */
			getDefaultSortColumn: function() {
				var result;
				$.each(options.columns, function(i, column) {
					if (typeof column.sortable !== 'undefined'
						&& $.inArray(column.sortable, ['asc', 'desc']) !== -1) {
						result = {sort: column.sortable, field: column.field};
						return false;
					}
				});
				return result;
			},

			/**
			 * Helper to get element dimensions, when the element is hidden
			 * @param element
			 * @param includeMargin
			 * @returns {{width: number, height: number, innerWidth: number,
			 *     innerHeight: number, outerWidth: number, outerHeight:
			 *     number}}
			 */
			getHiddenDimensions: function(element, includeMargin) {
				var props = {
						position: 'absolute',
						visibility: 'hidden',
						display: 'block',
					},
					dim = {
						width: 0,
						height: 0,
						innerWidth: 0,
						innerHeight: 0,
						outerWidth: 0,
						outerHeight: 0,
					},
					hiddenParents = $(element).parents().addBack().not(':visible');
				includeMargin = (typeof includeMargin === 'boolean')
					? includeMargin
					: false;

				var oldProps = [];
				hiddenParents.each(function() {
					var old = {};

					for (var name in props) {
						old[name] = this.style[name];
						this.style[name] = props[name];
					}

					oldProps.push(old);
				});

				dim.width = $(element).width();
				dim.outerWidth = $(element).outerWidth(includeMargin);
				dim.innerWidth = $(element).innerWidth();
				dim.height = $(element).height();
				dim.innerHeight = $(element).innerHeight();
				dim.outerHeight = $(element).outerHeight(includeMargin);

				hiddenParents.each(function(i) {
					var old = oldProps[i];
					for (var name in props) {
						this.style[name] = old[name];
					}
				});

				return dim;
			},

			getGeneralSearchKey: function() {
				var searchInput = $(Plugin.getOption('search.input'));
				return Plugin.getOption('search.key') || $(searchInput).prop('name');
			},

			/**
			 * Get value by dot notation path string and to prevent undefined
			 * errors
			 * @param path String Dot notation path in string
			 * @param object Object to iterate
			 * @returns {*}
			 */
			getObject: function(path, object) {
				return path.split('.').reduce(function(obj, i) {
					return obj !== null && typeof obj[i] !== 'undefined' ? obj[i] : null;
				}, object);
			},

			/**
			 * Extend object
			 * @param obj
			 * @param path
			 * @param value
			 * @returns {*}
			 */
			extendObj: function(obj, path, value) {
				var levels = path.split('.'),
					i = 0;

				function createLevel(child) {
					var name = levels[i++];
					if (typeof child[name] !== 'undefined' && child[name] !== null) {
						if (typeof child[name] !== 'object' &&
							typeof child[name] !== 'function') {
							child[name] = {};
						}
					} else {
						child[name] = {};
					}
					if (i === levels.length) {
						child[name] = value;
					} else {
						createLevel(child[name]);
					}
				}

				createLevel(obj);
				return obj;
			},

			rowEvenOdd: function() {
				// row even class
				$(datatable.tableBody).find('.' + pfx + 'datatable-row').removeClass(pfx + 'datatable-row-even');
				if ($(datatable.wrap).hasClass(pfx + 'datatable-subtable')) {
					$(datatable.tableBody).find('.' + pfx + 'datatable-row:not(.' + pfx + 'datatable-row-detail):even').addClass(pfx + 'datatable-row-even');
				} else {
					$(datatable.tableBody).find('.' + pfx + 'datatable-row:nth-child(even)').addClass(pfx + 'datatable-row-even');
				}
			},

			/********************
			 ** PUBLIC API METHODS
			 ********************/

			// delay timer
			timer: 0,

			/**
			 * Redraw datatable by recalculating its DOM elements, etc.
			 * @returns {jQuery}
			 */
			redraw: function() {
				Plugin.adjustCellsWidth.call();
				if (Plugin.isLocked()) {
					// fix hiding cell width issue
					Plugin.scrollbar();
					Plugin.resetScroll();
					Plugin.adjustCellsHeight.call();
				}
				Plugin.adjustLockContainer.call();
				Plugin.initHeight.call();
				return datatable;
			},

			/**
			 * Shortcode to reload
			 * @returns {jQuery}
			 */
			load: function() {
				Plugin.reload();
				return datatable;
			},

			/**
			 * Datasource reload
			 * @returns {jQuery}
			 */
			reload: function() {
				var delay = (function() {
					return function(callback, ms) {
						clearTimeout(Plugin.timer);
						Plugin.timer = setTimeout(callback, ms);
					};
				})();
				delay(function() {
					// local only. remote pagination will skip this block
					if (!options.data.serverFiltering) {
						Plugin.localDataUpdate();
					}
					Plugin.dataRender();
					$(datatable).trigger(pfx + 'datatable-on-reloaded');
				}, Plugin.getOption('search.delay'));
				return datatable;
			},

			/**
			 * Get record by record ID
			 * @param id
			 * @returns {jQuery}
			 */
			getRecord: function(id) {
				if (typeof datatable.tableBody === 'undefined') datatable.tableBody = $(datatable.table).children('tbody');
				$(datatable.tableBody).find('.' + pfx + 'datatable-cell:first-child').each(function(i, cell) {
					if (id == $(cell).text()) {
						var rowNumber = $(cell).closest('.' + pfx + 'datatable-row').index() + 1;
						datatable.API.record = datatable.API.value = Plugin.getOneRow(datatable.tableBody, rowNumber);
						return datatable;
					}
				});
				return datatable;
			},

			/**
			 * @deprecated in v5.0.6
			 * Get column of current record ID
			 * @param columnName
			 * @returns {jQuery}
			 */
			getColumn: function(columnName) {
				Plugin.setSelectedRecords();
				datatable.API.value = $(datatable.API.record).find('[data-field="' + columnName + '"]');
				return datatable;
			},

			/**
			 * Destroy datatable to original DOM state before datatable was
			 * initialized
			 * @returns {jQuery}
			 */
			destroy: function() {
				$(datatable).parent().find('.' + pfx + 'datatable-pager').remove();
				var initialDatatable = $(datatable.initialDatatable).addClass(pfx + 'datatable-destroyed').show();
				$(datatable).replaceWith(initialDatatable);
				datatable = initialDatatable;
				$(datatable).trigger(pfx + 'datatable-on-destroy');
				Plugin.isInit = false;

				// clean up variables
				initialDatatable = null;
				datatable.dataSet = null;
				datatable.originalDataSet = null;
				datatable.tableHead = null;
				datatable.tableBody = null;
				datatable.table = null;
				datatable.wrap = null;
				datatable.API = {
					record: null,
					value: null,
					params: null,
				};

				Plugin.ajaxParams = {};
				Plugin.pagingObject = {};
				Plugin.nodeTr = [];
				Plugin.nodeTd = [];
				Plugin.nodeCols = [];
				Plugin.recentNode = [];

				return initialDatatable;
			},

			/**
			 * Sort by column field
			 * @param field
			 * @param sort
			 */
			sort: function(field, sort) {
				// toggle sort
				sort = typeof sort === 'undefined' ? 'asc' : sort;

				Plugin.spinnerCallback(true);

				// update field and sort params
				var meta = {field: field, sort: sort};
				Plugin.setDataSourceParam('sort', meta);

				setTimeout(function() {
					Plugin.dataRender('sort');
					$(datatable).trigger(pfx + 'datatable-on-sort', meta);
					$(datatable.tableHead).find('.' + pfx + 'datatable-cell > span > i').remove();
				}, 300);

				return datatable;
			},

			/**
			 * @deprecated in v5.0.6
			 * Get current selected column value
			 * @returns {jQuery}
			 */
			getValue: function() {
				return $(datatable.API.value).text();
			},

			/**
			 * Set checkbox active
			 * @param cell JQuery selector or checkbox ID
			 */
			setActive: function(cell) {
				if (typeof cell === 'string') {
					// set by checkbox id
					cell = $(datatable.tableBody).find('.' + pfx + 'checkbox-single > [type="checkbox"][value="' + cell + '"]');
				}

				$(cell).prop('checked', true);

				var ids = [];
				$(cell).each(function(i, td) {
					// normal table
					var row = $(td).closest('tr').addClass(pfx + 'datatable-row-active');

					var id = $(td).attr('value');
					if (typeof id !== 'undefined') {
						ids.push(id);
					}
				});

				$(datatable).trigger(pfx + 'datatable-on-check', [ids]);
			},

			/**
			 * Set checkbox inactive
			 * @param cell JQuery selector or checkbox ID
			 */
			setInactive: function(cell) {
				if (typeof cell === 'string') {
					// set by checkbox id
					cell = $(datatable.tableBody).find('.' + pfx + 'checkbox-single > [type="checkbox"][value="' + cell + '"]');
				}

				$(cell).prop('checked', false);

				var ids = [];
				$(cell).each(function(i, td) {
					// normal table
					var row = $(td).closest('tr').removeClass(pfx + 'datatable-row-active');

					var id = $(td).attr('value');
					if (typeof id !== 'undefined') {
						ids.push(id);
					}
				});

				$(datatable).trigger(pfx + 'datatable-on-uncheck', [ids]);
			},

			/**
			 * Set all checkboxes active or inactive
			 * @param active
			 */
			setActiveAll: function(active) {
				var checkboxes = $(datatable.table).
					find('> tbody, > thead').
					find('tr').not('.' + pfx + 'datatable-row-subtable').
					find('.' + pfx + 'datatable-cell-check [type="checkbox"]');
				if (active) {
					Plugin.setActive(checkboxes);
				} else {
					Plugin.setInactive(checkboxes);
				}
			},

			/**
			 * @deprecated in v5.0.6
			 * Get selected rows which are active
			 * @returns {jQuery}
			 */
			setSelectedRecords: function() {
				datatable.API.record = $(datatable.tableBody).find('.' + pfx + 'datatable-row-active');
				return datatable;
			},

			/**
			 * Get selected records
			 * @returns {null}
			 */
			getSelectedRecords: function() {
				// support old method
				Plugin.setSelectedRecords();
				datatable.API.record = datatable.rows('.' + pfx + 'datatable-row-active').nodes();
				return datatable.API.record;
			},

			/**
			 * Get options by dots notation path
			 * @param path String Dot notation path in string
			 * @returns {*}
			 */
			getOption: function(path) {
				return Plugin.getObject(path, options);
			},

			/**
			 * Set global options nodes by dots notation path
			 * @param path
			 * @param object
			 */
			setOption: function(path, object) {
				options = Plugin.extendObj(options, path, object);
			},

			/**
			 * Search filter for local & remote
			 * @param value
			 * @param columns. Optional list of columns to be filtered.
			 */
			search: function(value, columns) {
				if (typeof columns !== 'undefined') columns = $.makeArray(columns);
				var delay = (function() {
					return function(callback, ms) {
						clearTimeout(Plugin.timer);
						Plugin.timer = setTimeout(callback, ms);
					};
				})();

				delay(function() {
					// get query parameters
					var query = Plugin.getDataSourceQuery();

					// search not by columns
					if (typeof columns === 'undefined' && typeof value !== 'undefined') {
						var key = Plugin.getGeneralSearchKey();
						query[key] = value;
					}

					// search by columns, support multiple columns
					if (typeof columns === 'object') {
						$.each(columns, function(k, column) {
							query[column] = value;
						});
						// remove empty element from arrays
						$.each(query, function(k, v) {
							if (v === '' || $.isEmptyObject(v)) {
								delete query[k];
							}
						});
					}

					Plugin.setDataSourceQuery(query);

					// reset pagination to 1 when doing seearching
					datatable.setDataSourceParam('pagination', Object.assign({}, datatable.getDataSourceParam('pagination'), {page: 1}));

					// local filter only. remote pagination will skip this block
					if (!options.data.serverFiltering) {
						Plugin.localDataUpdate();
					}
					Plugin.dataRender('search');
				}, Plugin.getOption('search.delay'));
			},

			/**
			 * Set datasource params extract
			 * @param param
			 * @param value
			 */
			setDataSourceParam: function(param, value) {
				datatable.API.params = $.extend({}, {
					pagination: {page: 1, perpage: Plugin.getOption('data.pageSize')},
					sort: Plugin.getDefaultSortColumn(),
					query: {},
				}, datatable.API.params, Plugin.stateGet(Plugin.stateId));

				datatable.API.params = Plugin.extendObj(datatable.API.params, param, value);

				Plugin.stateKeep(Plugin.stateId, datatable.API.params);
			},

			/**
			 * Get datasource params
			 * @param param
			 */
			getDataSourceParam: function(param) {
				datatable.API.params = $.extend({}, {
					pagination: {page: 1, perpage: Plugin.getOption('data.pageSize')},
					sort: Plugin.getDefaultSortColumn(),
					query: {},
				}, datatable.API.params, Plugin.stateGet(Plugin.stateId));

				if (typeof param === 'string') {
					return Plugin.getObject(param, datatable.API.params);
				}

				return datatable.API.params;
			},

			/**
			 * Shortcode to datatable.getDataSourceParam('query');
			 * @returns {*}
			 */
			getDataSourceQuery: function() {
				return Plugin.getDataSourceParam('query') || {};
			},

			/**
			 * Shortcode to datatable.setDataSourceParam('query', query);
			 * @param query
			 */
			setDataSourceQuery: function(query) {
				Plugin.setDataSourceParam('query', query);
			},

			/**
			 * Get current page number
			 * @returns {number}
			 */
			getCurrentPage: function() {
				return $(datatable.table).
					siblings('.' + pfx + 'datatable-pager').
					last().
					find('.' + pfx + 'datatable-pager-nav').
					find('.' + pfx + 'datatable-pager-link.' + pfx + 'datatable-pager-link-active').
					data('page') || 1;
			},

			/**
			 * Get selected dropdown page size
			 * @returns {*|number}
			 */
			getPageSize: function() {
				return $(datatable.table).siblings('.' + pfx + 'datatable-pager').last().find('select.' + pfx + 'datatable-pager-size').val() || 10;
			},

			/**
			 * Get total rows
			 */
			getTotalRows: function() {
				return datatable.API.params.pagination.total;
			},

			/**
			 * Get full dataset in grid
			 * @returns {*|null|Array}
			 */
			getDataSet: function() {
				return datatable.originalDataSet;
			},

			nodeTr: [],
			nodeTd: [],
			nodeCols: [],
			recentNode: [],

			table: function() {
				if (typeof datatable.table !== 'undefined') {
					return datatable.table;
				}
			},

			/**
			 * Select a single row from the table
			 * @param selector
			 * @returns {jQuery}
			 */
			row: function(selector) {
				Plugin.rows(selector);
				Plugin.nodeTr = Plugin.recentNode = $(Plugin.nodeTr).first();
				return datatable;
			},

			/**
			 * Select multiple rows from the table
			 * @param selector
			 * @returns {jQuery}
			 */
			rows: function(selector) {
				if (Plugin.isLocked()) {
					Plugin.nodeTr = Plugin.recentNode = $(datatable.tableBody).find(selector).filter('.' + pfx + 'datatable-lock-scroll > .' + pfx + 'datatable-row');
				} else {
					Plugin.nodeTr = Plugin.recentNode = $(datatable.tableBody).find(selector).filter('.' + pfx + 'datatable-row');
				}
				return datatable;
			},

			/**
			 * Select a single column from the table
			 * @param index zero-based index
			 * @returns {jQuery}
			 */
			column: function(index) {
				Plugin.nodeCols = Plugin.recentNode = $(datatable.tableBody).find('.' + pfx + 'datatable-cell:nth-child(' + (index + 1) + ')');
				return datatable;
			},

			/**
			 * Select multiple columns from the table
			 * @param selector
			 * @returns {jQuery}
			 */
			columns: function(selector) {
				var context = datatable.table;
				if (Plugin.nodeTr === Plugin.recentNode) {
					context = Plugin.nodeTr;
				}
				var columns = $(context).find('.' + pfx + 'datatable-cell[data-field="' + selector + '"]');
				if (columns.length > 0) {
					Plugin.nodeCols = Plugin.recentNode = columns;
				} else {
					Plugin.nodeCols = Plugin.recentNode = $(context).find(selector).filter('.' + pfx + 'datatable-cell');
				}
				return datatable;
			},

			cell: function(selector) {
				Plugin.cells(selector);
				Plugin.nodeTd = Plugin.recentNode = $(Plugin.nodeTd).first();
				return datatable;
			},

			cells: function(selector) {
				var cells = $(datatable.tableBody).find('.' + pfx + 'datatable-cell');
				if (typeof selector !== 'undefined') {
					cells = $(cells).filter(selector);
				}
				Plugin.nodeTd = Plugin.recentNode = cells;
				return datatable;
			},

			/**
			 * Delete the selected row from the table
			 * @returns {jQuery}
			 */
			remove: function() {
				if ($(Plugin.nodeTr.length) && Plugin.nodeTr === Plugin.recentNode) {
					$(Plugin.nodeTr).remove();
				}
				Plugin.layoutUpdate();
				return datatable;
			},

			/**
			 * Show or hide the columns or rows
			 */
			visible: function(bool) {
				if ($(Plugin.recentNode.length)) {
					var locked = Plugin.lockEnabledColumns();
					if (Plugin.recentNode === Plugin.nodeCols) {
						var index = Plugin.recentNode.index();

						if (Plugin.isLocked()) {
							var scrollColumns = $(Plugin.recentNode).closest('.' + pfx + 'datatable-lock-scroll').length;
							if (scrollColumns) {
								// is at center of scrollable area
								index += locked.left.length + 1;
							} else if ($(Plugin.recentNode).closest('.' + pfx + 'datatable-lock-right').length) {
								// is at the right locked table
								index += locked.left.length + scrollColumns + 1;
							}
						}
					}

					if (bool) {
						if (Plugin.recentNode === Plugin.nodeCols) {
							delete options.columns[index].visible;
						}
						$(Plugin.recentNode).show();
					} else {
						if (Plugin.recentNode === Plugin.nodeCols) {
							Plugin.setOption('columns.' + (index) + '.visible', false);
						}
						$(Plugin.recentNode).hide();
					}
					Plugin.columnHide();
					Plugin.redraw();
				}
			},

			/**
			 * Get the the DOM element for the selected rows or columns
			 * @returns {Array}
			 */
			nodes: function() {
				return Plugin.recentNode;
			},

			/**
			 * will be implemented soon
			 * @returns {jQuery}
			 */
			dataset: function() {
				return datatable;
			},

			/**
			 * Open page by number
			 * @param page number
			 */
			gotoPage: function (page) {
				if (typeof Plugin.pagingObject !== 'undefined') {
					Plugin.isInit = true;
					Plugin.pagingObject.openPage(page);
				}
			},

		};

		/**
		 * Public API methods can be used directly by datatable
		 */
		$.each(Plugin, function(funcName, func) {
			datatable[funcName] = func;
		});

		// initialize main datatable plugin
		if (typeof options !== 'undefined') {
			if (typeof options === 'string') {
				var method = options;
				datatable = $(this).data(pluginName);
				if (typeof datatable !== 'undefined') {
					options = datatable.options;
					Plugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
				}
			} else {
				if (!datatable.data(pluginName) && !$(this).hasClass(pfx + 'datatable-loaded')) {
					datatable.dataSet = null;
					datatable.textAlign = {
						left: pfx + 'datatable-cell-left',
						center: pfx + 'datatable-cell-center',
						right: pfx + 'datatable-cell-right',
					};

					// merge default and user defined options
					options = $.extend(true, {}, $.fn[pluginName].defaults, options);

					datatable.options = options;

					// init plugin process
					Plugin.init.apply(this, [options]);

					$(datatable.wrap).data(pluginName, datatable);
				}
			}
		} else {
			// get existing instance datatable
			datatable = $(this).data(pluginName);
			if (typeof datatable === 'undefined') {
				$.error(pluginName + ' not initialized');
			}
			options = datatable.options;
		}

		return datatable;
	};

	// default options
	$.fn[pluginName].defaults = {
		// datasource definition
		data: {
			type: 'local',
			source: null,
			pageSize: 10, // display records per page
			saveState: true,

			serverPaging: false,
			serverFiltering: false,
			serverSorting: false,

			autoColumns: false,
			attr: {
				rowProps: [],
			},
		},

		// layout definition
		layout: {
			theme: 'default', // datatable will support multiple themes and designs
			class: pfx + 'datatable-primary', // custom wrapper class
			scroll: false, // enable/disable datatable scroll both horizontal and vertical when needed.
			height: null, // datatable's body's fixed height
			minHeight: null,
			footer: false, // display/hide footer
			header: true, // display/hide header
			customScrollbar: true, // set false to disable custom scrollbar

			// datatable spinner
			spinner: {
				overlayColor: '#000000',
				opacity: 0,
				type: 'loader',
				state: 'primary',
				message: true,
			},

			// datatable UI icons
			icons: {
				sort: {asc: 'flaticon2-arrow-up', desc: 'flaticon2-arrow-down'},
				pagination: {
					next: 'flaticon2-next',
					prev: 'flaticon2-back',
					first: 'flaticon2-fast-back',
					last: 'flaticon2-fast-next',
					more: 'flaticon-more-1',
				},
				rowDetail: {expand: 'fa fa-caret-down', collapse: 'fa fa-caret-right'},
			},
		},

		// column sorting
		sortable: true,

		// resize column size with mouse drag coming soon)
		resizable: false,

		// column based filtering (coming soon)
		filterable: false,

		pagination: true,

		// inline and bactch editing (cooming soon)
		editable: false,

		// columns definition
		columns: [],

		search: {
			// enable trigger search by keyup enter
			onEnter: false,
			// input text for search
			input: null,
			// search delay in milliseconds
			delay: 400,
			//	remote server search key value
			key: null
		},

		rows: {
			// deprecated
			callback: function() {
			},
			// call before row template
			beforeTemplate: function() {
			},
			// call after row template
			afterTemplate: function() {
			},
			autoHide: true,
		},

		// toolbar
		toolbar: {
			// place pagination and displayInfo blocks according to the array order
			layout: ['pagination', 'info'],

			// toolbar placement can be at top or bottom or both top and bottom repeated
			placement: ['bottom'],  //'top', 'bottom'

			// toolbar items
			items: {
				// pagination
				pagination: {
					// pagination type(default or scroll)
					type: 'default',

					// number of pages to display by breakpoints
					pages: {
						desktop: {
							layout: 'default',
							pagesNumber: 5,
						},
						tablet: {
							layout: 'default',
							pagesNumber: 3,
						},
						mobile: {
							layout: 'compact',
						},
					},

					// navigation buttons
					navigation: {
						prev: true, // display prev button
						next: true, // display next button
						first: true, // display first button
						last: true, // display last button
						more: false // display more button
					},

					// page size select
					pageSizeSelect: [], // display dropdown to select pagination size. -1 is used for "ALl" option
				},

				// records info
				info: true,
			},
		},

		// here we will keep all strings and message used by datatable UI so developer can easiliy translate to any language.
		// By default the stirngs will be in the plugin source and here can override it
		translate: {
			records: {
				processing: 'Please wait...',
				noRecords: 'No records found',
			},
			toolbar: {
				pagination: {
					items: {
						default: {
							first: 'First',
							prev: 'Previous',
							next: 'Next',
							last: 'Last',
							more: 'More pages',
							input: 'Page number',
							select: 'Select page size',
							all: 'all',
						},
						info: 'Showing {{start}} - {{end}} of {{total}}',
					},
				},
			},
		},

		extensions: {},
	};

}(jQuery));

"use strict";
(function($) {

	var pluginName = 'SBDatatable';
	var pfx = '';

	$.fn[pluginName] = $.fn[pluginName] || {};

	/**
	 * @param datatable Main datatable plugin instance
	 * @param options Extension options
	 * @returns {*}
	 */
	$.fn[pluginName].checkbox = function(datatable, options) {
		var Extension = {
			selectedAllRows: false,
			selectedRows: [],
			unselectedRows: [],

			init: function() {
				if (Extension.selectorEnabled()) {
					// reset
					datatable.setDataSourceParam(options.vars.selectedAllRows, false);
					datatable.stateRemove('checkbox');

					// requestIds is not null
					if (options.vars.requestIds) {
						// request ids in response
						datatable.setDataSourceParam(options.vars.requestIds, true);
					}

					// remove selected checkbox on datatable reload
					$(datatable).on(pfx + 'datatable-on-reloaded', function() {
						datatable.stateRemove('checkbox');
						datatable.setDataSourceParam(options.vars.selectedAllRows, false);
						Extension.selectedAllRows = false;
						Extension.selectedRows = [];
						Extension.unselectedRows = [];
					});

					// select all on extension init
					Extension.selectedAllRows = datatable.getDataSourceParam(options.vars.selectedAllRows);

					$(datatable).on(pfx + 'datatable-on-layout-updated', function(e, args) {
						if (args.table != $(datatable.wrap).attr('id')) {
							return;
						}
						datatable.ready(function() {
							Extension.initVars();
							Extension.initEvent();
							Extension.initSelect();
						});
					});

					$(datatable).on(pfx + 'datatable-on-check', function(e, ids) {
						ids.forEach(function(id) {
							Extension.selectedRows.push(id);
							// // remove from unselected rows
							Extension.unselectedRows = Extension.remove(Extension.unselectedRows, id);
						});
						var storage = {};
						storage['selectedRows'] = $.unique(Extension.selectedRows);
						storage['unselectedRows'] = $.unique(Extension.unselectedRows);
						datatable.stateKeep('checkbox', storage);
					});
					$(datatable).on(pfx + 'datatable-on-uncheck', function(e, ids) {
						ids.forEach(function(id) {
							Extension.unselectedRows.push(id);
							// // remove from selected rows
							Extension.selectedRows = Extension.remove(Extension.selectedRows, id);
						});
						var storage = {};
						storage['selectedRows'] = $.unique(Extension.selectedRows);
						storage['unselectedRows'] = $.unique(Extension.unselectedRows);
						datatable.stateKeep('checkbox', storage);
					});
				}
			},

			/**
			 * Init checkbox clicks event
			 */
			initEvent: function() {
				// select all checkbox click
				$(datatable.tableHead).find('.' + pfx + 'checkbox-all > [type="checkbox"]').click(function(e) {
					// clear selected and unselected rows
					Extension.selectedRows = Extension.unselectedRows = [];
					datatable.stateRemove('checkbox');

					// select all rows
					Extension.selectedAllRows = !!$(this).is(':checked');

					// local select all current page rows
					if (!options.vars.requestIds) {
						if ($(this).is(':checked')) {
							Extension.selectedRows = $.makeArray($(datatable.tableBody).find('.' + pfx + 'checkbox-single > [type="checkbox"]').map(function(i, chk) {
								return $(chk).val();
							}));
						}
						var storage = {};
						storage['selectedRows'] = $.unique(Extension.selectedRows);
						datatable.stateKeep('checkbox', storage);
					}

					// keep selectedAllRows in datasource params
					datatable.setDataSourceParam(options.vars.selectedAllRows, Extension.selectedAllRows);

					$(datatable).trigger(pfx + 'datatable-on-click-checkbox', [$(this)]);
				});

				// single row checkbox click
				$(datatable.tableBody).find('.' + pfx + 'checkbox-single > [type="checkbox"]').click(function(e) {
					var id = $(this).val();
					if ($(this).is(':checked')) {
						Extension.selectedRows.push(id);
						// remove from unselected rows
						Extension.unselectedRows = Extension.remove(Extension.unselectedRows, id);
					}
					else {
						Extension.unselectedRows.push(id);
						// remove from selected rows
						Extension.selectedRows = Extension.remove(Extension.selectedRows, id);
					}

					// local checkbox header check
					if (!options.vars.requestIds && Extension.selectedRows.length < 1) {
						// remove select all checkbox, if there is no checked checkbox left
						$(datatable.tableHead).find('.' + pfx + 'checkbox-all > [type="checkbox"]').prop('checked', false);
					}

					var storage = {};
					storage['selectedRows'] = Extension.selectedRows.filter(Extension.unique);
					storage['unselectedRows'] = Extension.unselectedRows.filter(Extension.unique);
					datatable.stateKeep('checkbox', storage);

					$(datatable).trigger(pfx + 'datatable-on-click-checkbox', [$(this)]);
				});
			},

			unique: function(value, index, self) {
				return self.indexOf(value) === index;
			},

			initSelect: function() {
				// selected all rows from server
				if (Extension.selectedAllRows && options.vars.requestIds) {
					if (!datatable.hasClass(pfx + 'datatable-error')) {
						// set header select all checkbox checked
						$(datatable.tableHead).find('.' + pfx + 'checkbox-all > [type="checkbox"]').prop('checked', true);
					}

					// set all checkbox in table body
					datatable.setActiveAll(true);

					// remove unselected rows
					Extension.unselectedRows.forEach(function(id) {
						datatable.setInactive(id);
					});

				}
				else {
					// single check for server and local
					Extension.selectedRows.forEach(function(id) {
						datatable.setActive(id);
					});

					// local checkbox; check if all checkboxes of currect page are checked
					if (!datatable.hasClass(pfx + 'datatable-error') && $(datatable.tableBody).find('.' + pfx + 'checkbox-single > [type="checkbox"]').not(':checked').length < 1) {
						// set header select all checkbox checked
						$(datatable.tableHead).find('.' + pfx + 'checkbox-all > [type="checkbox"]').prop('checked', true);
					}
				}
			},

			/**
			 * Check if selector is enabled from options
			 */
			selectorEnabled: function() {
				return $.grep(datatable.options.columns, function(n, i) {
					return n.selector || false;
				})[0];
			},

			initVars: function() {
				// get single select/unselect from localstorage
				var storage = datatable.stateGet('checkbox');
				if (typeof storage !== 'undefined') {
					Extension.selectedRows = storage['selectedRows'] || [];
					Extension.unselectedRows = storage['unselectedRows'] || [];
				}
			},

			getSelectedId: function(path) {
				Extension.initVars();

				// server selected all rows
				if (Extension.selectedAllRows && options.vars.requestIds) {
					if (typeof path === 'undefined') {
						path = options.vars.rowIds;
					}

					// if selected all rows, return id from response meta
					var selectedAllRows = datatable.getObject(path, datatable.lastResponse) || [];

					if (selectedAllRows.length > 0) {
						// remove single unselected rows from selectedAllRows ids from server response emta
						Extension.unselectedRows.forEach(function(id) {
							selectedAllRows = Extension.remove(selectedAllRows, parseInt(id));
						});
					}
					return $.unique(selectedAllRows);
				}

				// else return single checked selected rows
				return Extension.selectedRows;
			},

			remove: function(array, element) {
				return array.filter(function(e) {
					return e !== element;
				});
			},
		};

		// make the extension accessible from datatable init
		datatable.checkbox = function() {
			return Extension;
		};

		if (typeof options === 'object') {
			options = $.extend(true, {}, $.fn[pluginName].checkbox.default, options);
			Extension.init.apply(this, [options]);
		}

		return datatable;
	};

	$.fn[pluginName].checkbox.default = {
		vars: {
			// select all rows flag to be sent to the server
			selectedAllRows: 'selectedAllRows',
			// request id parameter's name
			requestIds: 'requestIds',
			// response path to all rows id
			rowIds: 'meta.rowIds',
		},
	};

}(jQuery));

var defaults = {
	layout: {
		icons: {
			pagination: {
				next: 'flaticon2-next',
				prev: 'flaticon2-back',
				first: 'flaticon2-fast-back',
				last: 'flaticon2-fast-next',
				more: 'flaticon-more-1',
			},
			rowDetail: {expand: 'fa fa-caret-down', collapse: 'fa fa-caret-right'},
		}
	}
};

if (SBUtil.isRTL()) {
	defaults = {
		layout: {
			icons: {
				pagination: {
					next: 'flaticon2-back',
					prev: 'flaticon2-next',
					first: 'flaticon2-fast-next',
					last: 'flaticon2-fast-back',
				},
				rowDetail: {collapse: 'fa fa-caret-down', expand: 'fa fa-caret-right'},
			}
		}
	}
}

$.extend(true, $.fn.SBDatatable.defaults, defaults);

"use strict";

// Initialization
SBUtil.ready(function() {
    ////////////////////////////////////////////////////
    // Layout Base Partials(mandatory for core layout)//
    ////////////////////////////////////////////////////

    // Init Desktop & Mobile Headers
    SBLayoutHeader.init('Sb_header', 'Sb_header_mobile');

    // Init Header Menu
    SBLayoutHeaderMenu.init('Sb_header_menu', 'Sb_header_navs');
    SBLayoutHeaderMenu.init('Sb_header_menu_1', 'Sb_header_navs');

    // Init Header Topbar For Mobile Mode
    SBLayoutHeaderTopbar.init('Sb_header_mobile_topbar_toggle');

    // Init Aside
    SBLayoutAside.init('Sb_aside');

    // Init Aside Menu
    SBLayoutAsideMenu.init('Sb_aside_menu');

    // Init Subheader
    SBLayoutSubheader.init('Sb_subheader');

    // Init Content
    SBLayoutContent.init('Sb_content');

    // Init Footer
    SBLayoutFooter.init('Sb_footer');

    //////////////////////////////////////////////
    // Layout Extended Partials(optional to use)//
    //////////////////////////////////////////////


    // Init Scrolltop
    SBLayoutScrolltop.init('Sb_scrolltop');

    // Init Sticky Card
    SBLayoutStickyCard.init('Sb_page_sticky_card');

    // Init Stretched Card
    SBLayoutStretchedCard.init('Sb_page_stretched_card');

    // Init Code Highlighter & Preview Blocks(used to demonstrate the theme features)
	SBLayoutExamples.init();

    // Init Demo Selection Panel
	SBLayoutDemoPanel.init('Sb_demo_panel');

    // Init Chat App(quick modal chat)
    SBLayoutChat.init();

    // Init Quick Actions Offcanvas Panel
    SBLayoutQuickActions.init('Sb_quick_actions');

    // Init Quick Notifications Offcanvas Panel
    SBLayoutQuickNotifications.init('Sb_quick_notifications');

    // Init Quick Offcanvas Panel
    SBLayoutQuickPanel.init('Sb_quick_panel');

    // Init Quick Search Panel
    SBLayoutQuickSearch.init('Sb_quick_search');

    // Init Quick User Panel
    SBLayoutQuickUser.init('Sb_quick_user');

    // Init Search For Quick Search Dropdown
    SBLayoutSearch().init('Sb_quick_search_dropdown');

    // Init Search For Quick Search Offcanvas Panel
    SBLayoutSearchOffcanvas().init('Sb_quick_search_offcanvas');
});

"use strict";

// Class definition
var SBLayoutChat = function () {
	// Private functions
	var _init = function (element) {
		var scrollEl = SBUtil.find(element, '.scroll');
		var cardBodyEl = SBUtil.find(element, '.card-body');
		var cardHeaderEl = SBUtil.find(element, '.card-header');
		var cardFooterEl = SBUtil.find(element, '.card-footer');

		if (!scrollEl) {
			return;
		}

		// initialize perfect scrollbar(see:  https://github.com/utatti/perfect-scrollbar)
		SBUtil.scrollInit(scrollEl, {
			windowScroll: false, // allow browser scroll when the scroll reaches the end of the side
			mobileNativeScroll: true,  // enable native scroll for mobile
			desktopNativeScroll: false, // disable native scroll and use custom scroll for desktop
			resetHeightOnDestroy: true,  // reset css height on scroll feature destroyed
			handleWindowResize: true, // recalculate hight on window resize
			rememberPosition: true, // remember scroll position in cookie
			height: function() {  // calculate height
				var height;

				if (SBUtil.isBreakpointDown('lg')) { // Mobile mode
					return SBUtil.hasAttr(scrollEl, 'data-mobile-height') ? parseInt(SBUtil.attr(scrollEl, 'data-mobile-height')) : 400;
				} else if (SBUtil.isBreakpointUp('lg') && SBUtil.hasAttr(scrollEl, 'data-height')) { // Desktop Mode
					return parseInt(SBUtil.attr(scrollEl, 'data-height'));
				} else {
					height = SBLayoutContent.getHeight();

					if (scrollEl) {
						height = height - parseInt(SBUtil.css(scrollEl, 'margin-top')) - parseInt(SBUtil.css(scrollEl, 'margin-bottom'));
					}

					if (cardHeaderEl) {
						height = height - parseInt(SBUtil.css(cardHeaderEl, 'height'));
						height = height - parseInt(SBUtil.css(cardHeaderEl, 'margin-top')) - parseInt(SBUtil.css(cardHeaderEl, 'margin-bottom'));
					}

					if (cardBodyEl) {
						height = height - parseInt(SBUtil.css(cardBodyEl, 'padding-top')) - parseInt(SBUtil.css(cardBodyEl, 'padding-bottom'));
					}

					if (cardFooterEl) {
						height = height - parseInt(SBUtil.css(cardFooterEl, 'height'));
						height = height - parseInt(SBUtil.css(cardFooterEl, 'margin-top')) - parseInt(SBUtil.css(cardFooterEl, 'margin-bottom'));
					}
				}

				// Remove additional space
				height = height - 2;

				return height;
			}
		});

		// attach events
		SBUtil.on(element, '.card-footer textarea', 'keydown', function(e) {
			if (e.keyCode == 13) {
				_handeMessaging(element);
				e.preventDefault();

				return false;
			}
		});

		SBUtil.on(element, '.card-footer .chat-send', 'click', function(e) {
			_handeMessaging(element);
		});
	}

	var _handeMessaging = function(element) {
		var messagesEl = SBUtil.find(element, '.messages');
		var scrollEl = SBUtil.find(element, '.scroll');
        var textarea = SBUtil.find(element, 'textarea');

        if (textarea.value.length === 0 ) {
            return;
        }

		var node = document.createElement("DIV");
		SBUtil.addClass(node, 'd-flex flex-column mb-5 align-items-end');

		var html = '';
		html += '<div class="d-flex align-items-center">';
		html += '	<div>';
		html += '		<span class="text-muted font-size-sm">2 Hours</span>';
		html += '		<a href="#" class="text-dark-75 text-hover-primary font-weight-bold font-size-h6">You</a>';
		html += '	</div>';
		html += '	<div class="symbol symbol-circle symbol-40 ml-3">';
		html += '		<img alt="Pic" src="assets/media/users/300_12.jpg"/>';
		html += '	</div>';
		html += '</div>';
		html += '<div class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px">' + textarea.value + '</div>';

		SBUtil.setHTML(node, html);
		messagesEl.appendChild(node);
		textarea.value = '';
		scrollEl.scrollTop = parseInt(SBUtil.css(messagesEl, 'height'));

		var ps;
		if (ps = SBUtil.data(scrollEl).get('ps')) {
			ps.update();
		}

		setTimeout(function() {
			var node = document.createElement("DIV");
			SBUtil.addClass(node, 'd-flex flex-column mb-5 align-items-start');

			var html = '';
			html += '<div class="d-flex align-items-center">';
			html += '	<div class="symbol symbol-circle symbol-40 mr-3">';
			html += '		<img alt="Pic" src="assets/media/users/300_12.jpg"/>';
			html += '	</div>';
			html += '	<div>';
			html += '		<a href="#" class="text-dark-75 text-hover-primary font-weight-bold font-size-h6">Matt Pears</a>';
			html += '		<span class="text-muted font-size-sm">Just now</span>';
			html += '	</div>';
			html += '</div>';
			html += '<div class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px">';
			html += 'Right before vacation season we have the next Big Deal for you.';
			html += '</div>';

			SBUtil.setHTML(node, html);
			messagesEl.appendChild(node);
			textarea.value = '';
			scrollEl.scrollTop = parseInt(SBUtil.css(messagesEl, 'height'));

			var ps;
			if (ps = SBUtil.data(scrollEl).get('ps')) {
				ps.update();
			}
		}, 2000);
	}

	// Public methods
	return {
		init: function() {
			// init modal chat example
			_init(SBUtil.getById('Sb_chat_modal'));

			// trigger click to show popup modal chat on page load
			if (encodeURI(window.location.hostname) == 'keenthemes.com' || encodeURI(window.location.hostname) == 'www.keenthemes.com') {
				setTimeout(function() {
		            if (!SBCookie.getCookie('Sb_app_chat_shown')) {
		                var expires = new Date(new Date().getTime() + 60 * 60 * 1000); // expire in 60 minutes from now

						SBCookie.setCookie('Sb_app_chat_shown', 1, { expires: expires });

						if (SBUtil.getById('Sb_app_chat_launch_btn')) {
							SBUtil.getById('Sb_app_chat_launch_btn').click();
						}
		            }
		        }, 2000);
	        }
        },

        setup: function(element) {
            _init(element);
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutChat;
}

"use strict";

var SBLayoutDemoPanel = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_demo_panel_close',
            toggleBy: 'Sb_demo_panel_toggle'
        });

        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');
        var wrapper = SBUtil.find(_element, '.offcanvas-wrapper');
        var footer = SBUtil.find(_element, '.offcanvas-footer');

        SBUtil.scrollInit(wrapper, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                if (wrapper) {
                    height = height - parseInt(SBUtil.css(wrapper, 'marginTop'));
                    height = height - parseInt(SBUtil.css(wrapper, 'marginBottom'));
                }

                if (footer) {
                    height = height - parseInt(SBUtil.actualHeight(footer));
                    height = height - parseInt(SBUtil.css(footer, 'marginTop'));
                    height = height - parseInt(SBUtil.css(footer, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });

        if (typeof offcanvas !== 'undefined' && offcanvas.length === 0) {
            offcanvas.on('hide', function() {
                var expires = new Date(new Date().getTime() + 60 * 60 * 1000); // expire in 60 minutes from now
                SBCookie.setCookie('Sb_demo_panel_shown', 1, {expires: expires});
            });
        }
    }

    var _remind = function() {
        if (!(encodeURI(window.location.hostname) == 'keenthemes.com' || encodeURI(window.location.hostname) == 'www.keenthemes.com')) {
            return;
        }

        setTimeout(function() {
            if (!SBCookie.getCookie('Sb_demo_panel_shown')) {
                var expires = new Date(new Date().getTime() + 15 * 60 * 1000); // expire in 15 minutes from now
                SBCookie.setCookie('Sb_demo_panel_shown', 1, { expires: expires });
                if (typeof _offcanvasObject !== 'undefined') {
                    _offcanvasObject.show();
                }
            }
        }, 4000);
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();

            // Remind
            _remind();
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutDemoPanel;
}

"use strict";

var SBLayoutExamples = function() {

    var initDefaultMode = function(element) {
        var elements = element;
        if (typeof elements === 'undefined') {
            elements = document.querySelectorAll('.example:not(.example-compact):not(.example-hover):not(.example-basic)');
        }

        for (var i = 0; i < elements.length; ++i) {
            var example = elements[i];
            var copy = SBUtil.find(example, '.example-copy');

            var clipboard = new ClipboardJS(copy, {
                target: function(trigger) {
                    var example = trigger.closest('.example');
                    var el = SBUtil.find(example, '.example-code .tab-pane.active');

                    if (!el) {
                        el = SBUtil.find(example, '.example-code');
                    }

                    return el;
                }
            });

            clipboard.on('success', function(e) {
                SBUtil.addClass(e.trigger, 'example-copied');
                e.clearSelection();

                setTimeout(function() {
                    SBUtil.removeClass(e.trigger, 'example-copied');
                }, 2000);
            });
        }
    }

    var initCompactMode = function(element) {
        var example,code,toggle,copy, clipboard;
        var elements = element;
        if (typeof elements === 'undefined') {
            var elements = document.querySelectorAll('.example.example-compact');
        }

        for (var i = 0; i < elements.length; ++i) {
            var example = elements[i];
            var toggle = SBUtil.find(example, '.example-toggle');
            var copy = SBUtil.find(example, '.example-copy');

            // Handle toggle
            SBUtil.addEvent(toggle, 'click', function() {
                var example = this.closest('.example');
                var code =  SBUtil.find(example, '.example-code');
                var the = this;

                if (SBUtil.hasClass(this, 'example-toggled')) {
                    SBUtil.slideUp(code, 300, function() {
                        SBUtil.removeClass(the, 'example-toggled');
                        SBUtil.removeClass(code, 'example-code-on');
                        SBUtil.hide(code);
                    });
                } else {
                    SBUtil.addClass(code, 'example-code-on');
                    SBUtil.addClass(this, 'example-toggled');
                    SBUtil.slideDown(code, 300, function() {
                        SBUtil.show(code);
                    });
                }
            });

            // Handle copy
            var clipboard = new ClipboardJS(copy, {
                target: function(trigger) {
                    var example = trigger.closest('.example');
                    var el = SBUtil.find(example, '.example-code .tab-pane.active');

                    if (!el) {
                        el = SBUtil.find(example, '.example-code');
                    }

                    return el;
                }
            });

            clipboard.on('success', function(e) {
                SBUtil.addClass(e.trigger, 'example-copied');
                e.clearSelection();

                setTimeout(function() {
                    SBUtil.removeClass(e.trigger, 'example-copied');
                }, 2000);
            });
        }
    }

    return {
        init: function(element, options) {
            initDefaultMode(element);
            initCompactMode(element);
        }
    };
}();

// webpack support
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = SBLayoutExamples;
}

"use strict";

var SBLayoutQuickActions = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');

        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_actions_close',
            toggleBy: 'Sb_quick_actions_toggle'
        });

        SBUtil.scrollInit(content, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        getElement: function() {
            return _element;
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickActions;
}

"use strict";

var SBLayoutQuickCartPanel = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_cart_close',
            toggleBy: 'Sb_quick_cart_toggle'
        });

        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');
        var wrapper = SBUtil.find(_element, '.offcanvas-wrapper');
        var footer = SBUtil.find(_element, '.offcanvas-footer');

        SBUtil.scrollInit(wrapper, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                if (wrapper) {
                    height = height - parseInt(SBUtil.css(wrapper, 'marginTop'));
                    height = height - parseInt(SBUtil.css(wrapper, 'marginBottom'));
                }

                if (footer) {
                    height = height - parseInt(SBUtil.actualHeight(footer));
                    height = height - parseInt(SBUtil.css(footer, 'marginTop'));
                    height = height - parseInt(SBUtil.css(footer, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickCartPanel;
}

"use strict";

var SBLayoutQuickNotifications = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');

        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_notifications_close',
            toggleBy: 'Sb_quick_notifications_toggle'
        });

        SBUtil.scrollInit(content, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        getElement: function() {
            return _element;
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickNotifications;
}

"use strict";

var SBLayoutQuickPanel = function() {
    // Private properties
    var _element;
    var _offcanvasObject;
    var _notificationsElement;
    var _logsElement;
    var _settingsElement;

    // Private functions
    var _getContentHeight = function() {
        var height;

        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');

        var height = parseInt(SBUtil.getViewPort().height);

        if (header) {
            height = height - parseInt(SBUtil.actualHeight(header));
            height = height - parseInt(SBUtil.css(header, 'marginTop'));
            height = height - parseInt(SBUtil.css(header, 'marginBottom'));
        }

        if (content) {
            height = height - parseInt(SBUtil.css(content, 'marginTop'));
            height = height - parseInt(SBUtil.css(content, 'marginBottom'));
        }

        height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
        height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

        height = height - 2;

        return height;
    }

    var _init = function() {
        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_panel_close',
            toggleBy: 'Sb_quick_panel_toggle'
        });
    }

    var _initNotifications = function() {
        SBUtil.scrollInit(_notificationsElement, {
            mobileNativeScroll: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                return _getContentHeight();
            }
        });
    }

    var _initLogs = function() {
        SBUtil.scrollInit(_logsElement, {
            mobileNativeScroll: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                return _getContentHeight();
            }
        });
    }

    var _initSettings = function() {
        SBUtil.scrollInit(_settingsElement, {
            mobileNativeScroll: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                return _getContentHeight();
            }
        });
    }

    var _updateScrollbars = function() {
        $(_element).find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            SBUtil.scrollUpdate(_notificationsElement);
            SBUtil.scrollUpdate(_logsElement);
            SBUtil.scrollUpdate(_settingsElement);
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);
            _notificationsElement = SBUtil.getById('Sb_quick_panel_notifications');
            _logsElement = SBUtil.getById('Sb_quick_panel_logs');
            _settingsElement = SBUtil.getById('Sb_quick_panel_settings');

            _init();
            _initNotifications();
            _initLogs();
            _initSettings();

            _updateScrollbars();
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickPanel;
}

"use strict";

var SBLayoutQuickSearch = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');
        var form = SBUtil.find(_element, '.quick-search-form');
        var results = SBUtil.find(_element, '.quick-search-wrapper');

        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_search_close',
            toggleBy: 'Sb_quick_search_toggle'
        });

        SBUtil.scrollInit(results, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                if (results) {
                    height = height - parseInt(SBUtil.actualHeight(form));
                    height = height - parseInt(SBUtil.css(form, 'marginTop'));
                    height = height - parseInt(SBUtil.css(form, 'marginBottom'));

                    height = height - parseInt(SBUtil.css(results, 'marginTop'));
                    height = height - parseInt(SBUtil.css(results, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        getElement: function() {
            return _element;
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickSearch;
}

"use strict";

var SBLayoutQuickUser = function() {
    // Private properties
    var _element;
    var _offcanvasObject;

    // Private functions
    var _init = function() {
        var header = SBUtil.find(_element, '.offcanvas-header');
        var content = SBUtil.find(_element, '.offcanvas-content');

        _offcanvasObject = new SBOffcanvas(_element, {
            overlay: true,
            baseClass: 'offcanvas',
            placement: 'right',
            closeBy: 'Sb_quick_user_close',
            toggleBy: 'Sb_quick_user_toggle'
        });

        SBUtil.scrollInit(content, {
            disableForMobile: true,
            resetHeightOnDestroy: true,
            handleWindowResize: true,
            height: function() {
                var height = parseInt(SBUtil.getViewPort().height);

                if (header) {
                    height = height - parseInt(SBUtil.actualHeight(header));
                    height = height - parseInt(SBUtil.css(header, 'marginTop'));
                    height = height - parseInt(SBUtil.css(header, 'marginBottom'));
                }

                if (content) {
                    height = height - parseInt(SBUtil.css(content, 'marginTop'));
                    height = height - parseInt(SBUtil.css(content, 'marginBottom'));
                }

                height = height - parseInt(SBUtil.css(_element, 'paddingTop'));
                height = height - parseInt(SBUtil.css(_element, 'paddingBottom'));

                height = height - 2;

                return height;
            }
        });
    }

    // Public methods
    return {
        init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        getElement: function() {
            return _element;
        }
    };
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutQuickUser;
}

"use strict";

var SBLayoutScrolltop = function() {
    // Private properties
    var _element;
    var _object;

    // Private functions
    var _init = function() {
        _object = new SBScrolltop(_element, {
          offset: 300,
          speed: 600,
        });
    }

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
            _init();
		},

        getElement: function() {
            return _element;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutScrolltop;
}

"use strict";
//
// Handle User Quick Search For Dropdown, Inline and Offcanvas Search Panels
//

var SBLayoutSearch = function() {
    // Private properties
    var _target;
    var _form;
    var _input;
    var _closeIcon;
    var _resultWrapper;
    var _resultDropdown;
    var _resultDropdownToggle;
    var _closeIconContainer;
    var _inputGroup;
    var _query = '';

    var _hasResult = false;
    var _timeout = false;
    var _isProcessing = false;
    var _requestTimeout = 200; // ajax request fire timeout in milliseconds
    var _spinnerClass = 'spinner spinner-sm spinner-primary';
    var _resultClass = 'quick-search-has-result';
    var _minLength = 2;

    // Private functions
    var _showProgress = function() {
        _isProcessing = true;
        SBUtil.addClass(_closeIconContainer, _spinnerClass);

        if (_closeIcon) {
            SBUtil.hide(_closeIcon);
        }
    }

    var _hideProgress = function() {
        _isProcessing = false;
        SBUtil.removeClass(_closeIconContainer, _spinnerClass);

        if (_closeIcon) {
            if (_input.value.length < _minLength) {
                SBUtil.hide(_closeIcon);
            } else {
                SBUtil.show(_closeIcon, 'flex');
            }
        }
    }

    var _showDropdown = function() {
        if (_resultDropdownToggle && !SBUtil.hasClass(_resultDropdown, 'show')) {
            $(_resultDropdownToggle).dropdown('toggle');
            $(_resultDropdownToggle).dropdown('update');
        }
    }

    var _hideDropdown = function() {
        if (_resultDropdownToggle && SBUtil.hasClass(_resultDropdown, 'show')) {
            $(_resultDropdownToggle).dropdown('toggle');
        }
    }

    var _processSearch = function() {
        if (_hasResult && _query === _input.value) {
            _hideProgress();
            SBUtil.addClass(_target, _resultClass);
            _showDropdown();
            SBUtil.scrollUpdate(_resultWrapper);

            return;
        }

        _query = _input.value;

        SBUtil.removeClass(_target, _resultClass);
        _showProgress();
        _hideDropdown();

        setTimeout(function() {
            $.ajax({
                url: HOST_URL + '/api/quick_search.php',
                data: {
                    query: _query
                },
                dataType: 'html',
                success: function(res) {
                    _hasResult = true;
                    _hideProgress();
                    SBUtil.addClass(_target, _resultClass);
                    SBUtil.setHTML(_resultWrapper, res);
                    _showDropdown();
                    SBUtil.scrollUpdate(_resultWrapper);
                },
                error: function(res) {
                    _hasResult = false;
                    _hideProgress();
                    SBUtil.addClass(_target, _resultClass);
                    SBUtil.setHTML(_resultWrapper, '<span class="font-weight-bold text-muted">Connection error. Please try again later..</div>');
                    _showDropdown();
                    SBUtil.scrollUpdate(_resultWrapper);
                }
            });
        }, 1000);
    }

    var _handleCancel = function(e) {
        _input.value = '';
        _query = '';
        _hasResult = false;
        SBUtil.hide(_closeIcon);
        SBUtil.removeClass(_target, _resultClass);
        _hideDropdown();
    }

    var _handleSearch = function() {
        if (_input.value.length < _minLength) {
            _hideProgress();
            _hideDropdown();

            return;
        }

        if (_isProcessing == true) {
            return;
        }

        if (_timeout) {
            clearTimeout(_timeout);
        }

        _timeout = setTimeout(function() {
            _processSearch();
        }, _requestTimeout);
    }

    // Public methods
    return {
        init: function(id) {
            _target = SBUtil.getById(id);

            if (!_target) {
                return;
            }

            _form = SBUtil.find(_target, '.quick-search-form');
            _input = SBUtil.find(_target, '.form-control');
            _closeIcon = SBUtil.find(_target, '.quick-search-close');
            _resultWrapper = SBUtil.find(_target, '.quick-search-wrapper');
            _resultDropdown = SBUtil.find(_target, '.dropdown-menu');
            _resultDropdownToggle = SBUtil.find(_target, '[data-toggle="dropdown"]');
            _inputGroup = SBUtil.find(_target, '.input-group');
            _closeIconContainer = SBUtil.find(_target, '.input-group .input-group-append');

            // Attach input keyup handler
            SBUtil.addEvent(_input, 'keyup', _handleSearch);
            SBUtil.addEvent(_input, 'focus', _handleSearch);

            // Prevent enter click
            _form.onkeypress = function(e) {
                var key = e.charCode || e.keyCode || 0;
                if (key == 13) {
                    e.preventDefault();
                }
            }

            SBUtil.addEvent(_closeIcon, 'click', _handleCancel);
        }
    };
};

// Webpack support
if (typeof module !== 'undefined') {
    module.exports = SBLayoutSearch;
}

var SBLayoutSearchInline = SBLayoutSearch;
var SBLayoutSearchOffcanvas = SBLayoutSearch;

"use strict";

var SBLayoutAsideMenu = function() {
    // Private properties
    var _element;
    var _menuObject;

	// Initialize
	var _init = function() {
		var menuDesktopMode = (SBUtil.attr(_element, 'data-menu-dropdown') === '1' ? 'dropdown' : 'accordion');
        var scroll;

		if (SBUtil.isBreakpointDown('lg') && SBUtil.attr(_element, 'data-menu-scroll') === '1') {
			scroll = {
				rememberPosition: true, // remember position on page reload
				height: function() { // calculate available scrollable area height
					var height = parseInt(SBUtil.getViewPort().height);

					height = height - (parseInt(SBUtil.css(_element, 'marginBottom')) + parseInt(SBUtil.css(_element, 'marginTop')));

					return height;
				}
			};
		}

		_menuObject = new SBMenu(_element, {
			// Vertical scroll
			scroll: scroll,

			// Submenu setup
			submenu: {
				desktop: menuDesktopMode,
				tablet: 'accordion', // menu set to accordion in tablet mode
				mobile: 'accordion' // menu set to accordion in mobile mode
			},

			// Accordion setup
			accordion: {
				expandAll: false // allow having multiple expanded accordions in the menu
			}
		});
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize menu
            _init();
		},

		getElement: function() {
			return _element;
		},

        getMenu: function() {
			return _menuObject;
		},

        pauseDropdownHover: function(time) {
			if (_menuObject) {
				_menuObject.pauseDropdownHover(time);
			}
		},

		closeMobileOffcanvas: function() {
			if (_menuObject && SBUtil.isMobileDevice()) {
				_menuObject.hide();
			}
		}
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutAsideMenu;
}

"use strict";

var SBLayoutAside = function() {
    // Private properties
    var _body;
    var _element;
    var _offcanvasObject;

    // Private functions
	// Initialize
	var _init = function() {
		var offcanvasClass = SBUtil.hasClass(_element, 'aside-offcanvas-default') ? 'aside-offcanvas-default' : 'aside';

        // Initialize mobile aside offcanvas
		_offcanvasObject = new SBOffcanvas(_element, {
			baseClass: offcanvasClass,
			overlay: true,
			closeBy: 'Sb_aside_close_btn',
			toggleBy: {
				target: 'Sb_aside_mobile_toggle',
				state: 'mobile-toggle-active'
			}
		});
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);
            _body = SBUtil.getBody();

            if (!_element) {
                return;
            }

            // Initialize
            _init();
        },

        getElement: function() {
            return _element;
        },

        getOffcanvas: function() {
            return _offcanvasObject;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutAside;
}

"use strict";

var SBLayoutContent = function() {
    // Private properties
    var _element;

	// Private functions
	var _getHeight = function() {
		var height;

		height = SBUtil.getViewPort().height;

        if (_element) {
            height = height - parseInt(SBUtil.css(_element, 'paddingTop')) - parseInt(SBUtil.css(_element, 'paddingBottom'));
        }

        height = height - SBLayoutHeader.getHeight();
        height = height - SBLayoutSubheader.getHeight();
        height = height - SBLayoutFooter.getHeight();

		return height;
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);
		},

		getHeight: function() {
			return _getHeight();
		},

        getElement: function() {
            return _element;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutContent;
}

"use strict";

var SBLayoutFooter = function() {
    // Private properties
    var _element;

	// Private functions
	var _getHeight = function() {
		var height = 0;

        if (_element) {
            height = SBUtil.actualHeight(_element);
        }

		return height;
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);
		},

		getHeight: function() {
			return _getHeight();
		},

        getElement: function() {
            return _element;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutFooter;
}

"use strict";

var SBLayoutHeaderMenu = function() {
    // Private properties
	var _menuElement;
    var _menuObject;
    var _offcanvasElement;
    var _offcanvasObject;
	var _mobileTabPanes;

    // Private functions
	var _init = function() {
		_offcanvasObject = new SBOffcanvas(_offcanvasElement, {
			overlay: true,
			baseClass: 'header-navs',
			closeBy: 'Sb_header_mobile_close',
			toggleBy: {
				target: 'Sb_header_mobile_toggle',
				state: 'burge-icon-active'
			}
		});

		_menuObject = new SBMenu(_menuElement, {
			submenu: {
				desktop: 'dropdown',
				tablet: 'accordion',
				mobile: 'accordion'
			},
			accordion: {
				slideSpeed: 200, // accordion toggle slide speed in milliseconds
				expandAll: false // allow having multiple expanded accordions in the menu
			}
		});
	}

	var _initTabPanesForMobile = function() {
		if ( _mobileTabPanes ) {
			for (var i = 0, len = _mobileTabPanes.length; i < len; i++) {
				var mobileTabPane = _mobileTabPanes[i];
				var tabs = SBUtil.find(_offcanvasElement, '.header-tabs');

				SBUtil.scrollInit(mobileTabPane, {
		            disableForMobile: true,
		            resetHeightOnDestroy: true,
		            handleWindowResize: true,
		            height: function() {
						// Destroy for tablet and mobile modes
						if (SBUtil.isBreakpointUp('lg')) {
							return false;
						}

		                var height = parseInt(SBUtil.getViewPort().height);

		                if (tabs) {
		                    height = height - parseInt(SBUtil.actualHeight(tabs));
		                    height = height - parseInt(SBUtil.css(tabs, 'marginTop'));
		                    height = height - parseInt(SBUtil.css(tabs, 'marginBottom'));
		                }

		                if (mobileTabPane) {
		                    height = height - parseInt(SBUtil.css(mobileTabPane, 'marginTop'));
		                    height = height - parseInt(SBUtil.css(mobileTabPane, 'marginBottom'));
		                }

		                height = height - parseInt(SBUtil.css(_offcanvasElement, 'paddingTop'));
		                height = height - parseInt(SBUtil.css(_offcanvasElement, 'paddingBottom'));

		                height = height - 2;

		                return height;
		            }
		        });

				$(_offcanvasElement).find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
					// Tablet & Mobile Modes Only
					if (SBUtil.isBreakpointUp('lg')) {
						SBUtil.scrollUpdate(mobileTabPane);
					}
		        });
			}
		}
	}

    // Public methods
	return {
        init: function(menuId, offcanvasId) {
            _menuElement = SBUtil.getById(menuId);
            _offcanvasElement = SBUtil.getById(offcanvasId);
			_mobileTabPanes = SBUtil.findAll(_offcanvasElement, '.tab-pane');

            if (!_menuElement) {
                return;
            }

            // Initialize menu
            _init();
			_initTabPanesForMobile();
		},

		getMenuElement: function() {
			return _menuElement;
		},

        getOffcanvasElement: function() {
			return _offcanvasElement;
		},

        getMenu: function() {
			return _menuObject;
		},

		pauseDropdownHover: function(time) {
			if (_menuObject) {
				_menuObject.pauseDropdownHover(time);
			}
		},

        getOffcanvas: function() {
			return _offcanvasObject;
		},

		closeMobileOffcanvas: function() {
			if (_menuObject && SBUtil.isMobileDevice()) {
				_offcanvasObject.hide();
			}
		}
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutHeaderMenu;
}

"use strict";

var SBLayoutHeaderTopbar = function() {
    // Private properties
	var _toggleElement;
    var _toggleObject;

    // Private functions
    var _init = function() {
		_toggleObject = new SBToggle(_toggleElement, {
			target: SBUtil.getBody(),
			targetState: 'topbar-mobile-on',
			toggleState: 'active'
		});
    }

    // Public methods
	return {
		init: function(id) {
            _toggleElement = SBUtil.getById(id);

			if (!_toggleElement) {
                return;
            }

            // Initialize
            _init();
		},

        getToggleElement: function() {
            return _toggleElement;
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutHeaderTopbar;
}

"use strict";

var SBLayoutHeader = function() {
    // Private properties
    var _element;
    var _elementForMobile;
    var _object;

    // Get height
    var _getHeight = function() {
        var height = 0;

        if (_element) {
            height = SBUtil.actualHeight(_element) + 1;
        }

        return height;
    }

    // Get height
    var _getHeightForMobile = function() {
        var height;

        height = SBUtil.actualHeight(_elementForMobile);

        return height;
    }

    // Public methods
	return {
		init: function(id, idForMobile) {
            _element = SBUtil.getById(id);
            _elementForMobile = SBUtil.getById(idForMobile);

            if (!_element) {
                return;
            }
		},

        isFixed: function() {
            return SBUtil.hasClass(SBUtil.getBody(), 'header-fixed')
        },

        isFixedForMobile: function() {
            return SBUtil.hasClass(SBUtil.getBody(), 'header-mobile-fixed')
        },

        getElement: function() {
            return _element;
        },

        getElementForMobile: function() {
            return _elementForMobile;
        },

        getHeader: function() {
            return _object;
        },

        getHeight: function() {
            return _getHeight();
        },

        getHeightForMobile: function() {
            return _getHeightForMobile();
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutHeader;
}

"use strict";

var SBLayoutStickyCard = function() {
    // Private properties
	var _element;
    var _object;

	// Private functions
	var _init = function() {
		var offset = 300;

		if (typeof SBLayoutHeader !== 'undefined') {
			offset = SBLayoutHeader.getHeight();
		}

        _object = new SBCard(_element, {
			sticky: {
				offset: offset,
				zIndex: 90,
				position: {
					top: function() {
						var pos = 0;
                        var body = SBUtil.getBody();

						if (SBUtil.isBreakpointUp('lg')) {
							if (typeof SBLayoutHeader !== 'undefined' && SBLayoutHeader.isFixed()) {
								pos = pos + SBLayoutHeader.getHeight();
							}

							if (typeof SBLayoutSubheader !== 'undefined' && SBLayoutSubheader.isFixed()) {
								pos = pos + SBLayoutSubheader.getHeight();
							}
						} else {
							if (typeof SBLayoutHeader !== 'undefined' && SBLayoutHeader.isFixedForMobile()) {
								pos = pos + SBLayoutHeader.getHeightForMobile();
							}
						}

						pos = pos - 1; // remove header border width

						return pos;
					},
					left: function(card) {
						return SBUtil.offset(_element).left;
					},
					right: function(card) {
						var body = SBUtil.getBody();

						var cardWidth = parseInt(SBUtil.css(_element, 'width'));
						var bodyWidth = parseInt(SBUtil.css(body, 'width'));
						var cardOffsetLeft = SBUtil.offset(_element).left;

						return bodyWidth - cardWidth - cardOffsetLeft;
					}
				}
			}
		});

		_object.initSticky();

		SBUtil.addResizeHandler(function() {
			_object.updateSticky();
		});
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
			_init();
		},

		update: function() {
			if (_object) {
				_object.updateSticky();
			}
		}
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutStickyCard;
}

"use strict";

var SBLayoutStretchedCard = function() {
    // Private properties
	var _element;

	// Private functions
	var _init = function() {
		var scroll = SBUtil.find(_element, '.card-scroll');
		var cardBody = SBUtil.find(_element, '.card-body');
		var cardHeader = SBUtil.find(_element, '.card-header');

		var height = SBLayoutContent.getHeight();

		height = height - parseInt(SBUtil.actualHeight(cardHeader));

		height = height - parseInt(SBUtil.css(_element, 'marginTop')) - parseInt(SBUtil.css(_element, 'marginBottom'));
		height = height - parseInt(SBUtil.css(_element, 'paddingTop')) - parseInt(SBUtil.css(_element, 'paddingBottom'));

		height = height - parseInt(SBUtil.css(cardBody, 'paddingTop')) - parseInt(SBUtil.css(cardBody, 'paddingBottom'));
		height = height - parseInt(SBUtil.css(cardBody, 'marginTop')) - parseInt(SBUtil.css(cardBody, 'marginBottom'));

		height = height - 3;

		SBUtil.css(scroll, 'height', height + 'px');
	}

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }

            // Initialize
			_init();

            // Re-calculate on window resize
            SBUtil.addResizeHandler(function() {
				_init();
			});
		},

		update: function() {
			_init();
		}
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutStretchedCard;
}

"use strict";

var SBLayoutSubheader = function() {
    // Private properties
    var _element;

    // Private functions
    var _getHeight = function() {
        var height = 0;

        if (_element) {
            height = SBUtil.actualHeight(_element);
        }

        return height;
    }

    // Public methods
	return {
		init: function(id) {
            _element = SBUtil.getById(id);

            if (!_element) {
                return;
            }
		},

        isFixed: function() {
            return SBUtil.hasClass(SBUtil.getBody(), 'subheader-fixed');
        },

        getElement: function() {
            return _element;
        },

        getHeight: function() {
            return _getHeight();
        }
	};
}();

// Webpack support
if (typeof module !== 'undefined') {
	module.exports = SBLayoutSubheader;
}
