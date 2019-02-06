/// <reference path="unit.js" />
//扩展 Object对象，和Jquery $.extend 一样，没有依赖Jquery时可以使用
function extendObj(dest, src, merge) {
    for (var key in src) {
        if (!src.hasOwnProperty(key) || dest[key] !== undefined && merge) {
            continue;
        }
        dest[key] = src[key];
    }
    return dest;
}

//======== html 模板操作 开始 ===========
//数组转成html
function DataToHtml(data, templete, regSetting, specialDeal, emptyStr) {
    var html = "";
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        html += ReplactHtml(obj, templete, regSetting, specialDeal, emptyStr);
    }
    return html;
}
//数组转成html，符合过滤条件的跳过该记录拼接
function DataToHtmlFilter(data, templete, regSetting, specialDeal, emptyStr, expendProps, filter) {
    var html = "";
    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        if (expendProps) {
            if (typeof expendProps == "function") {
                obj = extendObj(obj, expendProps(obj) || {});
            } else {
                obj = extendObj(obj, expendProps);
            }
        }
        if (filter(obj)) {
            continue;
        }
        html += ReplactHtml(obj, templete, regSetting, specialDeal, emptyStr);
    }
    return html;
}
//对象转成html
function ObjsToHtml(Objs, templete, regSetting, specialDeal, emptyStr) {
    var html = "";
    for (var i in Objs) {
        var obj = Objs[i];
        html += ReplactHtml(obj, templete, regSetting, specialDeal, emptyStr);
    }
    return html;
}
//跟进字段替换html模板里的占位符
function ReplactHtml(obj, templete, regSetting, specialDeal, emptyStr) {
    for (var field in obj) {
        var value = obj[field];
        if (specialDeal != null) {
            if (specialDeal[field] != undefined) {
                value = specialDeal[field](value);
            }
        }
        if (IsEmptyOrWhiteSpace(value)) {
            value = emptyStr === undefined ? '' : emptyStr;
        };
        if (regSetting) {
            var reg = new RegExp('{' + field + '}', regSetting);
            templete = templete.replace(reg, value);
        } else {
            templete = templete.replace('{' + field + '}', value);
        }
    }
    return templete;
}

//======== Html 模板操作 结束 ===========
//判断是否未空或空字符串
function IsEmptyOrWhiteSpace(obj) {
    return (obj === null || obj === undefined || obj === "");
}

//快捷异步操作
function GetAjaxData(url, data, fn, random) {
    if (random) { url += '&r=' + Math.random() }
    if (data) {
        $.post(url, data).done(function (data) {
            data = TryJSONParse(data);
            fn(data);
        });
    } else {
        $.get(url).done(function (data) {
            data = TryJSONParse(data);
            fn(data);
        });
    }
}
//数据对象操作
//把数组转换成keyvalue形式的对象
function ParseDataToObj(data, formatter) {
    var result = {};
    if (data) {
        data.map(function (v, i) {
            formatter(result, v);
        });
    }
    return result;
}

function TryJSONParse(data, empty) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        console.log(e);
        data = empty || {};
    }
    return data;
}

var LzzDate = function (dateStr, format, empty) {
    var result = empty || '';
    if (!IsEmptyOrWhiteSpace(dateStr)) {
        result = new Date(dateStr).Format(format || 'yyyy-MM-dd hh:mm:ss');
    }
    return result;
}

//日期对象（Date）扩展
Date.prototype.Format = function (fmt,empty) {
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (this.toString() == "Invalid Date") {
        fmt = empty || '';
    } else {
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return fmt;
}

//日期操作
Date.prototype.addDays = function (d) {
    this.setDate(this.getDate() + d);
    return this;
};

Date.prototype.addWeeks = function (w) {
    this.addDays(w * 7);
    return this;
};

Date.prototype.addMonths = function (m) {
    var d = this.getDate();
    this.setMonth(this.getMonth() + m);
    if (this.getDate() < d)
        this.setDate(0);
    return this;
};

Date.prototype.addYears = function (y) {
    var m = this.getMonth();
    this.setFullYear(this.getFullYear() + y);
    if (m < this.getMonth()) {
        this.setDate(0);
    }
    return this;
};

var TimeHandle = {
    //获取 指定天数范围里 的起始时间字符串
    getDayRange: function (day, format) {
        var date = new Date();
        format = format || 'yyyy-MM-dd hh:mm:ss';
        time1 = date.Format(format);
        time2 = date.addDays(day).Format(format);
        if (day > 0) {
            return { btime: time1, etime: time2 }
        } else {
            return { btime: time2, etime: time1 }
        }
    }
};

function mapObj(obj, fn) {
    for (var k in obj) {
        if (fn(obj[k], k) === false) {
            break;
        }
    }
}

function getCHENStrLength(str) {
    var length = 0;
    try {
        length = str.replace(/[^\x00-\xff]/g, "aa").length;
    } catch (e) {
        return 0;
    }
    return length;
}

function subCHENStr(str, start, length) {
    var result = '', cnL = length * 2;
    for (var i = 0; i < str.length; i++) {
        if (!str[start + i]) { break; }
        result += str[start + i];
        if (getCHENStrLength(result) > cnL)
            break;
    }
    return result;
}