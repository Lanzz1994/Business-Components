(function ($) {
    // 1.插件名称
    var PluginName = "MyPlugin";

    // 2.插件默认属性
    var defaultOpts = {
    };

    // 3.对外公开的方法，$(selector).MyPlugin('method',args);
    var methods = {
        method: function (args) {
            //封装代码逻辑
            //...
        }
    };

    // 4.构造函数，$(selector).MyPlugin(args);
    $.fn.MapPanel = function (opts, args) {
        // 4.1 分为方法调用 和 控件初始化
        if (typeof opts == "string") {//调用方法
            var method = methods[opts];
            if (method) {
                return method(this, args);
            } else {
                console.log(opts + ' method is undefined');
            }
        } else {// 4.2 初始化
            opts = opts || {};
            return this.each(function () {
                // 4.2.1 获取或者读取缓存在dom上的数据
                var data = $.data(this, PluginName);
                if (data) {
                    $.extend(data.options, opts);
                } else {
                    data = $.data(this, PluginName, { options: $.extend({}, defaultOpts, opts) });
                }
                opts = data.options;
                var $this = $(this);

                // 4.2.2 初始化插件
                //...

            });
        }
    }

    // 5.封装插件内部逻辑
    //...

}(jQuery));