/* Jonathan Snook - MIT License - https://github.com/snookca/prepareTransition */
(function(a) {
    a.fn.prepareTransition = function() {
        return this.each(function() {
            var b = a(this);
            b.one("TransitionEnd webkitTransitionEnd transitionend oTransitionEnd", function() {
                b.removeClass("is-transitioning")
            });
            var c = ["transition-duration", "-moz-transition-duration", "-webkit-transition-duration", "-o-transition-duration"];
            var d = 0;
            a.each(c, function(a, c) {
                d = parseFloat(b.css(c)) || d
            });
            if (d != 0) {
                b.addClass("is-transitioning");
                b[0].offsetWidth
            }
        })
    }
})(jQuery);

/* replaceUrlParam - http://stackoverflow.com/questions/7171099/how-to-replace-url-parameter-with-javascript-jquery */
function replaceUrlParam(e, r, a) {
    var n = new RegExp("(" + r + "=).*?(&|$)"),
        c = e;
    return c = e.search(n) >= 0 ? e.replace(n, "$1" + a + "$2") : c + (c.indexOf("?") > 0 ? "&" : "?") + r + "=" + a
};

/*============================================================================
  Money Format
  - Haravan.format money is defined in option_selection.js.
    If that file is not included, it is redefined here.
==============================================================================*/
if ((typeof Haravan) === 'undefined') {
    Haravan = {};
}


// Timber functions
window.timber = window.timber || {};

timber.cacheSelectors = function() {
    timber.cache = {
        // General
        $html: $('html'),
        $body: $('body'),

        // Navigation
        $navigation: $('#AccessibleNav'),
        $mobileSubNavToggle: $('.mobile-nav__toggle'),

        // Collection Pages
        $changeView: $('.change-view'),

        // Product Page
        //$productImage            : $('#ProductPhotoImg'),
        //$thumbImages             : $('#ProductThumbs').find('a.product-single__thumbnail'),
        //$inputVariants					 : $('.swatch-element.color input'),

        // Customer Pages
        //$recoverPasswordLink     : $('#RecoverPassword'),
        //$hideRecoverPasswordLink : $('#HideRecoverPasswordLink'),
        //$recoverPasswordForm     : $('#RecoverPasswordForm'),
        //$customerLoginForm       : $('#CustomerLoginForm'),
        //$passwordResetSuccess    : $('#ResetSuccess')
    };
};

timber.init = function() {
    //FastClick.attach(document.body);
    timber.cacheSelectors();
    timber.accessibleNav();
    timber.drawersInit();
    timber.mobileNavToggle();
    //timber.productImageSwitch();
    //timber.responsiveVideos();
    // timber.collectionViews();
    //timber.loginForms();
};

timber.accessibleNav = function() {
    var $nav = timber.cache.$navigation,
        $allLinks = $nav.find('a'),
        $topLevel = $nav.children('li').find('a'),
        $parents = $nav.find('.site-nav--has-dropdown'),
        $subMenuLinks = $nav.find('.site-nav__dropdown').find('a'),
        activeClass = 'nav-hover',
        focusClass = 'nav-focus';

    // Mouseenter
    $parents.on('mouseenter touchstart', function(evt) {
        var $el = $(this);

        if (!$el.hasClass(activeClass)) {
            evt.preventDefault();
        }

        showDropdown($el);
    });

    // Mouseout
    $parents.on('mouseleave', function() {
        hideDropdown($(this));
    });

    $subMenuLinks.on('touchstart', function(evt) {
        // Prevent touchstart on body from firing instead of link
        evt.stopImmediatePropagation();
    });

    $allLinks.focus(function() {
        handleFocus($(this));
    });

    $allLinks.blur(function() {
        removeFocus($topLevel);
    });

    // accessibleNav private methods
    function handleFocus($el) {
        var $subMenu = $el.next('ul'),
            hasSubMenu = $subMenu.hasClass('sub-nav') ? true : false,
            isSubItem = $('.site-nav__dropdown').has($el).length,
            $newFocus = null;

        // Add focus class for top level items, or keep menu shown
        if (!isSubItem) {
            removeFocus($topLevel);
            addFocus($el);
        } else {
            $newFocus = $el.closest('.site-nav--has-dropdown').find('a');
            addFocus($newFocus);
        }
    }

    function showDropdown($el) {
        $el.addClass(activeClass);

        setTimeout(function() {
            timber.cache.$body.on('touchstart', function() {
                hideDropdown($el);
            });
        }, 250);
    }

    function hideDropdown($el) {
        $el.removeClass(activeClass);
        timber.cache.$body.off('touchstart');
    }

    function addFocus($el) {
        $el.addClass(focusClass);
    }

    function removeFocus($el) {
        $el.removeClass(focusClass);
    }
};

timber.drawersInit = function() {
    timber.LeftDrawer = new timber.Drawers('NavDrawer', 'left');
    timber.RightDrawer = new timber.Drawers('CartDrawer', 'right', {

    });
};

timber.mobileNavToggle = function() {
    timber.cache.$mobileSubNavToggle.on('click', function() {
        $(this).parent().toggleClass('mobile-nav--expanded');
    });
};

timber.getHash = function() {
    return window.location.hash;
};

/*============================================================================
  Drawer modules
  - Docs http://haravan.github.io/Timber/#drawers
==============================================================================*/
timber.Drawers = (function() {
    var Drawer = function(id, position, options) {
        var defaults = {
            close: '.js-drawer-close',
            open: '.js-drawer-open-' + position,
            openClass: 'js-drawer-open',
            dirOpenClass: 'js-drawer-open-' + position
        };

        this.$nodes = {
            parent: $('body, html'),
            page: $('#PageContainer'),
            moved: $('.is-moved-by-drawer')
        };

        this.config = $.extend(defaults, options);
        this.position = position;

        this.$drawer = $('#' + id);

        if (!this.$drawer.length) {
            return false;
        }

        this.drawerIsOpen = false;
        this.init();
    };

    Drawer.prototype.init = function() {
        $(this.config.open).on('click', $.proxy(this.open, this));
        this.$drawer.find(this.config.close).on('click', $.proxy(this.close, this));
    };

    Drawer.prototype.open = function(evt) {
        // Keep track if drawer was opened from a click, or called by another function
        var externalCall = false;

        // Prevent following href if link is clicked
        if (evt) {
            evt.preventDefault();
        } else {
            externalCall = true;
        }

        // Without this, the drawer opens, the click event bubbles up to $nodes.page
        // which closes the drawer.
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
            // save the source of the click, we'll focus to this on close
            this.$activeSource = $(evt.currentTarget);
        }

        if (this.drawerIsOpen && !externalCall) {
            return this.close();
        }

        // Add is-transitioning class to moved elements on open so drawer can have
        // transition for close animation
        this.$nodes.moved.addClass('is-transitioning');
        this.$drawer.prepareTransition();

        this.$nodes.parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
        this.drawerIsOpen = true;

        // Set focus on drawer
        this.trapFocus(this.$drawer, 'drawer_focus');

        // Run function when draw opens if set
        if (this.config.onDrawerOpen && typeof(this.config.onDrawerOpen) == 'function') {
            if (!externalCall) {
                this.config.onDrawerOpen();
            }
        }

        if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
            this.$activeSource.attr('aria-expanded', 'true');
        }

        // Lock scrolling on mobile
        this.$nodes.page.on('touchmove.drawer', function() {
            return false;
        });

        this.$nodes.page.on('click.drawer', $.proxy(function() {
            this.close();
            return false;
        }, this));
    };

    Drawer.prototype.close = function() {
        if (!this.drawerIsOpen) { // don't close a closed drawer
            return;
        }

        // deselect any focused form elements
        $(document.activeElement).trigger('blur');

        // Ensure closing transition is applied to moved elements, like the nav
        this.$nodes.moved.prepareTransition({
            disableExisting: true
        });
        this.$drawer.prepareTransition({
            disableExisting: true
        });

        this.$nodes.parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);

        this.drawerIsOpen = false;

        // Remove focus on drawer
        this.removeTrapFocus(this.$drawer, 'drawer_focus');

        this.$nodes.page.off('.drawer');
    };

    Drawer.prototype.trapFocus = function($container, eventNamespace) {
        var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

        $container.attr('tabindex', '-1');

        $container.focus();

        $(document).on(eventName, function(evt) {
            if ($container[0] !== evt.target && !$container.has(evt.target).length) {
                $container.focus();
            }
        });
    };

    Drawer.prototype.removeTrapFocus = function($container, eventNamespace) {
        var eventName = eventNamespace ? 'focusin.' + eventNamespace : 'focusin';

        $container.removeAttr('tabindex');
        $(document).off(eventName);
    };

    return Drawer;
})();

// Initialize Timber's JS on docready
$(timber.init);