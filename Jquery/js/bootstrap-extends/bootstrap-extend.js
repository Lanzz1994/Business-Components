//MapPanel
(function ($) {
    var defaultOpts = {
        show: true,
        dragtarget: null,//依赖 draggabilly类库,设置触发拖动的的 Dom class或id
        closetarget: null,//关闭触发 Dom class或id
        onShow: null,
        onClose: null
    };

    //对外公开的方法
    var methods = {
        show: function (jq, args) {
            args = args || {};
            return jq.each(function () {
                var opts = $.data(this, 'MapPanel').options;
                $(this).fadeIn(300);
                if ((typeof args.x == 'number') && (typeof args.y == 'number')) {
                    PositionMethod.move(args.x, args.y);
                }
                if (opts.onShow) { opts.onShow(); }
            });
        },
        showAsync: function () { },
        hide: function (jq,args) {
            return jq.each(function () {
                var opts = $.data(this, 'MapPanel').options;
                $(this).fadeOut(200);
                if (opts.onClose) { opts.onClose(args); }
            });
        }
    };

    $.fn.MapPanel = function (opts, args) {
        //分为方法调用 和 控件初始化
        if (typeof opts == "string") {//调用方法
            var method = methods[opts];
            if (method) {
                return method(this, args);
            } else {
                console.log(opts + ' method is undefined');
            }
        } else {//初始化
            opts = opts || {};
            return this.each(function () {
                var data = $.data(this, "MapPanel");
                if (data) {
                    $.extend(data.options, opts);
                } else {
                    data = $.data(this, "MapPanel", { options: $.extend({}, defaultOpts, opts) });
                }
                opts = data.options;
                var $this = $(this);

                //关闭
                if (opts.closetarget) {
                    $this.on('click', opts.closetarget, function (e) {
                        methods.hide($(e.delegateTarget));
                        e.stopPropagation();
                    });
                }

                //拖动
                if (opts.dragtarget) {
                    $(opts.dragtarget).addClass('dragtarget');
                    $this.draggabilly({
                        handle: opts.dragtarget,
                        containment: 'body'
                    });
                }
                //隐藏
                if (!opts.show) { $this.hide(); }
            });
        }

        var PositionMethod = {
            //弹框偏移到合适的弹框位置
            move: function (target, top, left, reviseL, reviseT) {
                reviseL = reviseL || 30, reviseT = reviseT || -50;
                var win = $(window);
                var winW = win.width(), winH = win.height(),
                    targetW = target.width(), targetH = target.height();
                var lor = left < winW / 2, tob = top < winH / 2;
                var position = { left: 0, top: 0 };

                if (lor) {
                    position.left = left + reviseL;
                    if (position.left + targetW > winW) { position.left = winW - targetW - reviseL; }
                } else {
                    position.left = left - targetW - reviseL;
                    if (position.left < 0) { position.left = 0; }
                }
                if (tob) {
                    position.top = top + reviseT;
                    if (position.top + targetH > winH) { position.bottom = 0; position.top = 'unset'; }
                } else {
                    position.top = top - targetH - reviseT;
                    if (position.top < 0) { position.top = 0; }
                }
                return position;
            }
        }
    }
}(jQuery));

//LzzNav
(function ($) {
    var nav = null;

    var defaultOpts = {
        direction: 'row',
        autoWidth: false,
        navItem: '<li class="nav-item {active}" role="presentation"><div class="nav-target animate" href="#{id}" aria-controls="{id}" role="tab" data-toggle="tab">{title}</div></li>',//导航选项模板，模板的占位符 和 navs 的字符配合使用
        navs: [],
        onClick: function () {

        },
        stopPropagationTarget: 'span'
    };

    //对外公开的方法
    var methods = {
        //添加一个导航
        AddNavItem: function (jq, opts, navItem) {
            return jq.each(function () {
                $this = $(this);
                var navOpts = $this.data('LzzNav').options;
                NavItems.addItem($this, navItem, opts);
                if (navOpts.autoWidth) {
                    NavItems.resetNavItemWidth($this);
                }
            });
        },
        AddNavItems: function (jq, navs, navItem) {
            return jq.each(function () {
                $this = $(this);
                var opts = $this.data('LzzNav').options;
                var $nav = $('.nav:first', $this);

                NavItems.addItems($nav, navs, opts, navItem);
                if (opts.autoWidth) {
                    NavItems.resetNavItemWidth($this);
                }
            });
        },
        //删除一个导航
        RemoveNavItem: function (jq, navItem) {
            return jq.each(function () {
                var $this = $(this);
                var opts = $this.data('LzzNav').options;
                if (typeof navItem == "string") { navItem = $(navItem, $this); }
                if (navItem.length > 0) {
                    NavItems.removeItem($this, navItem);
                }
                if (opts.autoWidth) {
                    NavItems.resetNavItemWidth($this);
                }
            });
        },
        //清除导航选项
        ClearNavIems: function (jq) {
            return jq.each(function () {
                $('.nav>.nav-item', jq).remove();
                jq.data('LzzNav').options.navs = [];
            });
        },
    };

    $.fn.LzzNav = function (opts, args) {
        //分为方法调用 和 控件初始化
        if (typeof opts == "string") {//调用方法
            var method = methods[opts];
            if (method) {
                return method(this, args);
            } else {
                console.log(opts + ' method is undefined');
            }
        } else {//初始化
            opts = opts || {};
            return this.each(function () {
                var data = $.data(this, "LzzNav");
                if (data) {
                    $.extend(data.options, opts);
                } else {
                    data = $.data(this, "LzzNav", { options: $.extend({}, defaultOpts, opts) });
                }
                NavItems.init($(this));
            });
        }
    }

    //导航选项
    var NavItems = {
        init: function (target) {
            var data = $.data(target[0], "LzzNav");
            var opts = data.options;

            target.addClass('nav-' + (opts.direction || 'row'));

            var $nav = $('.nav', target), navs = opts.navs;
            //添加导航选项
            if (navs.length > 0) {
                NavItems.addItems($nav, navs, opts);
            }
            target.on('click', '.nav-item', function (e) {
                var opts = $.data(target[0], "LzzNav").options, navItem = $(e.currentTarget);
                if (opts.sign) {
                    NavItems.active($(e.delegateTarget), navItem, opts.sign);
                }
                if (typeof opts.onClick == "function") {
                    var itemOpts = $.data(navItem[0], 'options');
                    opts.onClick(navItem, itemOpts);
                }
            });

            NavSign.init(target, opts.sign);

            //激活导航选项
            if (NavSign.signs[opts.sign] && navs.length > 0) {
                NavItems.active(target, $('.nav-item:first', $nav), opts.sign);
            }

            if (opts.autoWidth) {
                NavItems.resetNavItemWidth(target);
            }
        },
        active: function (jq, target, sign) {
            if (typeof target == "string") { target = $('.nav-target[href="#' + target + '"]:first', jq).parent() }
            if (NavSign.signs[sign]) {
                NavSign.signs[sign].active(jq, target);
            }
        },
        addItems: function (nav, navs, opts, navItem) {
            opts.navs = opts.navs.concat(navs);
            var $itemHtml = $(DataToHtmlFilter(navs, navItem || opts.navItem, 'g', null, '', null, function (record) { return record.inited ? true : false }));
            $itemHtml.appendTo(nav);
            $itemHtml.each(function (i, v) {
                $(this).data('options', navs[i]);
            });
        },
        addItem: function (jq, navItem, opts) {
            var navOpst = jq.data('LzzNav').options;
            navOpst.navs.push(opts);
            var $itemHtml = $(ReplactHtml(opts, navItem || navOpst.navItem, 'g', null, '-'));
            $itemHtml.appendTo($('.nav:first', jq));
            $itemHtml.data('options', opts);
        },
        removeItem: function (jq, navItem) {
            var index = navItem.index();
            var navOpst = jq.data('LzzNav').options;
            navOpst.navs.splice(index, 1);
            navItem.remove();
        },
        resetNavItemWidth: function (jq) {
            var $navs = $('.nav-item', jq);
            var navWidth = $('.nav', jq).width();
            var percent = $navs.length ? 100 / $navs.length : 100;
            $navs.css('width', percent.toString() + '%');
        }
    };

    //导航选择标识
    var NavSign = {
        init: function (jq, sign) {
            var signInit = NavSign.signs[sign];
            if (signInit) { signInit.init(jq) }
        },
        signs: {
            'lineBlock': {
                html: '<div class="nav-sign line-block" style="background-color:{lineColor}"><div class="sign-block {position} animate"></div></div>',
                attrs: {
                    position: 'middle',//middle,top,bottom
                },
                init: function (jq) {
                    var opts = $.data(jq[0], 'LzzNav').options;
                    var lineBlock = NavSign.signs['lineBlock'];
                    var attrs = $.extend(lineBlock.attrs, opts.signAttr || {});
                    var signHtml = ReplactHtml(attrs, lineBlock.html, null, null, '');
                    jq.append(signHtml);
                },
                active: function (jq, target) {
                    var opts = $.data(jq[0], 'LzzNav').options;
                    var css = {};
                    if (opts.direction == "row") {
                        css.width = target.css('width');
                        css.left = target.position().left;
                    }

                    if (opts.direction == "col") {
                        css.height = target.css('height');
                        css.top = target.position().top;
                    }
                    $('.line-block .sign-block:first', jq).css(css);
                }
            }
        },
    };
}(jQuery));

//LzzSidebar
(function ($) {
    var defaultOpts = {
        headerH: 50,
        reviseH: 0,
        scrollBar: true,
        panelWidth: 400,
        moveDistance: 400,
        position: 'right',//left or right
        sidebarAppear: true,
        sidebarExtend: false,
        sdiebarScroll: true,
        appearTarget: '',
        //回调
        onAppear: null,
        onExtend: null,
        onExtendBefore:null
    };

    $.fn.LzzSidebar = function (opts, args) {
        //分为方法调用 和 控件初始化
        if (typeof opts == "string") {//调用方法
            var method = methods[opts];
            if (method) {
                return method(this, args);
            } else {
                console.log('this method is undefined');
            }
        } else {//初始化
            opts = opts || {};
            return this.each(function () {
                var data = $.data(this, "LzzSidebar");
                if (data) {
                    $.extend(data.options, opts);
                } else {
                    data = $.data(this, "LzzSidebar", { options: $.extend({}, defaultOpts, opts) });
                }
                opts = data.options;
                SidebarWaperMethod.init($(this), opts);
            });
        }
    }

    var methods = {
        addSideContent: function () { },
        activeSideContent: function () { },
        //隐藏 或 显示 面板
        toggleAppear: function (sidebar, state) {
            var opts = sidebar.data('LzzSidebar').options;
            if (typeof state != 'undefined') {
                if (state) {
                    SidebarWaperMethod.show(sidebar);
                } else {
                    SidebarWaperMethod.hide(sidebar);
                }
            } else {
                if (opts.sidebarAppear) {
                    SidebarWaperMethod.hide(sidebar);
                } else {
                    SidebarWaperMethod.show(sidebar);
                }
            }
            $(opts.appearTarget).toggleClass('in-close', !opts.sidebarAppear);
            if (opts.onAppear) { opts.onAppear(opts.sidebarAppear); }
        },
        //扩展 或 收缩 面板
        toggleExtend: function (sidebar, args) {
            args = args || {};
            var opts = sidebar.data('LzzSidebar').options;
            var extend = null;
            if (args.state == undefined) {
                extend = !opts.sidebarExtend;
            } else {
                extend = args.state;
            }

            if (extend) {
                var width = args.width || opts.panelWidth;
                SidebarWaperMethod.extend(sidebar, width);
            } else {
                SidebarWaperMethod.reset(sidebar);
            }

            if (opts.onExtend) { opts.onExtend(opts.sidebarExtend); }
        },
        //开启 或 禁用 滚动条
        toggleScroll: function (sidebar, state) {
            if (typeof state != 'undefined') {
                var opts = sidebar.data('LzzSidebar').options;
                if (state) {
                    SideBarScorllMethod.start(sidebar);
                } else {
                    SideBarScorllMethod.disable(sidebar);
                }
            } else {
                if (opts.sdiebarScroll) {
                    SideBarScorllMethod.disable(sidebar);
                } else {
                    SideBarScorllMethod.start(sidebar);
                }
            }
        }
    };

    //更新整体布局（body 根据 header 高度 自适应）
    function updateLayout(sidebar, headerH,reviseH) {
        var sidebarH = sidebar.height();
        $('.sidebar-header', sidebar).height(headerH);
        $('.sidebar-body', sidebar).height(sidebarH - headerH - reviseH);
    }

    //一般是先实现效果，然后要加上各种逻辑判断
    //侧边栏 外壳 操作
    var SidebarWaperMethod = {
        init: function (sidebar, opts) {
            sidebar.css({
                width: opts.panelWidth,
                right: opts.position === "right" ? '0' : 'unset',
                left: opts.position === "left" ? '0' : 'unset',
            });

            //更新布局
            if ($('.sidebar-header', sidebar).length > 0) {
                if (typeof opts.headerH === "number") {
                    updateLayout(sidebar, opts.headerH, opts.reviseH);
                }
            }

            //滚动条
            if (opts.scrollBar) {
                var scrollbar = $('.sidebar-body:first', sidebar);
                scrollbar.addClass('optiscroll').optiscroll();
            }

            //触发隐藏面板的对象
            if (opts.appearTarget) {
                sidebar.on('click', opts.appearTarget, function (e) {
                    methods.toggleAppear($(e.delegateTarget));
                });
            }

            //隐藏面板
            if (!opts.sidebarAppear) {
                SidebarWaperMethod.move(sidebar, opts.moveDistance);
                $(opts.appearTarget).toggleClass('in-close', !opts.sidebarAppear);
            }
        },
        hide: function (sidebar) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            SidebarWaperMethod.move(sidebar, opts.moveDistance);
            opts.sidebarAppear = false;
        },
        show: function (sidebar) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            SidebarWaperMethod.move(sidebar, 0);
            opts.sidebarAppear = true;
        },
        move: function (sidebar, distance) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            distance = opts.position === "right" ? distance : -distance;
            sidebar.css('transform', 'translateX(' + distance + 'px)');
        },
        extend: function (sidebar, width) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            sidebar.width(width);
            opts.moveDistance = width;
            opts.sidebarExtend = true;
        },
        reset: function (sidebar) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            sidebar.width(opts.panelWidth);
            opts.moveDistance = opts.panelWidth;
            opts.sidebarExtend = false;
        }
    };

    //侧边栏 滚动条 操作
    var SideBarScorllMethod = {
        disable: function (sidebar) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            //这种销毁加载操作要注意，子集有相同的控件，导致加载错乱
            $('.sidebar-body:first', sidebar).optiscroll('destroy');
            opts.sdiebarScroll = false;
        },
        start: function (sidebar) {
            var opts = $.data(sidebar[0], 'LzzSidebar').options;
            $('.sidebar-body:first', sidebar).optiscroll();
            opts.sdiebarScroll = true;
        }
    };
})(jQuery);

//LzzCurdBox
(function ($) {

    var defaultOpts = {
        panes: [],
        paneItem: '<div role="tabpanel" class="tab-pane fade in {active}" id="{id}">{content}</div>'
    };

    $.fn.LzzCurdBox = function (opts, args) {

        if (typeof opts == "string") {//调用方法
            var method = methods[opts];
            if (method) {
                return method(this, args);
            } else {
                console.log('this method is undefined');
            }
        } else {//初始化
            opts = opts || {};
            return this.each(function () {
                var data = $.data(this, "LzzCurdBox");
                if (data) {
                    $.extend(data.options, opts);
                } else {
                    data = $.data(this, "LzzCurdBox", { options: $.extend({}, defaultOpts, opts) });
                }
                CurdBoxMethod.init($(this), opts);

            });
        }
    }

    var methods = {
        addBox: function (curdboxs, options, paneItem) {
            return curdboxs.each(function () {
                var opts = $.data(this, 'LzzCurdBox').options;
                CurdBoxMethod.add($(this), paneItem || opts.paneItem, options);
            });
        },
        activeBox: function (curdboxs, target) {
            curdboxs.each(function(){
                CurdBoxMethod.active($(this), target);
            });
        },
        dropBox: function (curdboxs, args) {
            return curdboxs.each(function(){
                CurdBoxMethod.drop($(this), args);
            });
        },  
    };

    var CurdBoxMethod = {
        add: function (curdbox, paneItem, opts) {
            var $content = $(ReplactHtml(opts, paneItem, 'g', '')).appendTo($('.tab-content:first', curdbox));
            $content.data('options', opts);
            if (opts.scrollBar) { curdbox.addClass('optiscroll').optiscroll(); }
            if (opts.active) { CurdBoxMethod.active(curdbox, $content); }
        },

        drop: function (curdbox, args) {
            $('#' + args.id, curdbox).remove();
            if (args.active) { CurdBoxMethod.active(curdbox, args.active); }
        },

        update: function () { },
        get: function () { },

        init: function (curdbox, opts) {
            if (opts.panes.length > 0) {
                var paneHtml = DataToHtml(opts.panes, opts.paneItem, 'g', null, '', function (record) { return !record.init });
                $('.tab-content:first', curdbox).append(paneHtml);
                $('.tab-content:first>.tab-pane',curdbox).map(function (i, v) {
                    var paneOpts=opts.panes[i];
                    $this=$(this);
                    $this.data("options", opts.panes[i]);
                    if(paneOpts.scrollBar){$this.addClass('optiscroll').optiscroll();}
                });
            }
        },
        active: function (curdbox, target) {
            if (target) {
                $('.tab-content:first>.tab-pane.active', curdbox).removeClass('active')
                if (typeof target == "string") { target = $('#' + target, curdbox); }
                target.addClass('active');
            }
        }
    };

})(jQuery);