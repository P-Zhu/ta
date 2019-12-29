define(function(require, exports, module) {
    window.$ = window.jQuery = $ = require("jquery");
    var layer = require("layer");
    var plugin = require("plugin");
    var template = require("art-template");
    var API = require("API");
    template.helper("getComment", function(content) {
        if (content == null) { return "点击添加评语..." }
        content = content.replace(/^\s+|\s+$/g, "");
        if (content == "") { return "点击添加评语..." }
        return content
    });
    template.helper("setpercent", function(num) { return (num * 100).toFixed(2) });
    template.helper("setpercents", function(num) { return (num * 100).toFixed(0) });
    var hre = {};
    var words = "";
    var rcount = "";

    function lists() { setTimeout(getLists, 200) }
    window.document.lists = lists;

    function showBlank() {
        $(".empty-box").show();
        $(".no-name").hide()
    }

    function hideBlank() {
        $(".empty-box").hide();
        $(".no-name").show()
    }

    function needSort(str) { if (str == "") { return false } if (str.indexOf("--") != -1 || str.indexOf("未交") != -1 || str == "-1") { return false } return true }
    var resizeTop = 0;
    $(document).on("click", ".groupwhich a", function() {
        var id = $(this).data("id");
        $(this).addClass("active").siblings("a").removeClass("active");
        lists()
    });

    function setReviewWrap(grade, sim, state, groupid, share, callback) {
        var homeworkid = $("#return-course").attr("data-homeworkid");
        var courseid = $("#return-course").attr("data-id");
        API.reviewApi_lists(homeworkid, grade, sim, state, words, rcount, groupid, share, function(data) {
            hre.data = data;
            hre.fullscore = parseInt(data.fullscore);
            if (data.studentCount == 0) { showBlank() } else { hideBlank() }
            if (data.lists == null) { plugin.closeLoading(); return } else {
                if (data.isCheckRepeat == 1) { hre.data.isthish = true } else { hre.data.isthish = false }
                hre.data.isvip = true;
                if (data.useCount == 1) { hre.data.yisim = true } else { hre.data.yisim = false }
                API.GroupApi_listGroups(courseid, function(data2) {
                    hre.data.groupdata = data2;
                    if (data2.data == null || data2.data.length == 0) { hre.data.hasgroup = false } else { hre.data.hasgroup = true }
                    var html = template("tpl-reviewwrap", hre.data);
                    $(".reviewwrap").html(html);
                    callback();
                    data.lists.map(function(item, index, arr) {
                        item.createtime1 = item.createtime;
                        item.createtime = plugin.time_format_year_month_day_hour_min(item.createtime);
                        if (item.deltime != null) { item.deltime = plugin.time_format_year_month_day_hour_min(item.deltime) }
                        item.homeworkid = homeworkid
                    });
                    var yj = [],
                        wj = [];
                    data.lists.filter(function(item) { if (item.grade == "未交") { wj.push(item) } else { yj.push(item) } });
                    data.yjcount = yj.length;
                    Array.prototype.push.apply(yj, wj);
                    data.lists = yj;
                    if (groupid != "") {
                        API.GroupApi_getGroupStudents(groupid, function(data2) {
                            if (data2.data.length == 0) { data.nulltext = "该分组内暂无成员" } else { data.nulltext = "无符合条件的记录" }
                            var html = template("tpl-lists", hre.data);
                            $("#gList").html(html);
                            $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                            $("#nrCount").html("未批（" + data.nrCount + "）");
                            $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）");
                            $(".work-tips-info").html("已筛选出 <span>" + data.currentCount + "</span>人 （全班共" + data.studentCount + "人）");
                            plugin.closeLoading()
                        })
                    } else {
                        data.nulltext = "无符合条件的记录";
                        var html = template("tpl-lists", hre.data);
                        $("#gList").html(html);
                        $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                        $("#nrCount").html("未批（" + data.nrCount + "）");
                        $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）");
                        $(".work-tips-info").html("已筛选出 <span>" + data.currentCount + "</span>人 （全班共" + data.studentCount + "人）");
                        plugin.closeLoading();
                        resizeTop = $(".sortTable div.sortHead").get(0).offsetTop
                    }
                    $("#submitState").click()
                })
            }
        })
    }

    function getLists(callback) {
        var homeworkid = $("#return-course").attr("data-homeworkid");
        var grade = "";
        if ($("#grade-classify").find("li").hasClass("cur")) { grade = "" } else {
            $("#grade-classify dd").each(function(index) {
                if ($(this).hasClass("cur")) {
                    grade += (index + 1).toString();
                    grade += "|"
                }
            })
        }
        var sim = "";
        if ($("#sim-classify").find("li").hasClass("cur")) { sim = "" } else {
            $("#sim-classify dd").each(function(index) {
                if ($(this).hasClass("cur")) {
                    sim += (index + 1).toString();
                    sim += "|"
                }
            })
        }
        var state = "";
        if ($("#state-classify").find("li").hasClass("cur")) { state = "" } else {
            $("#state-classify dd").each(function(index) {
                if ($(this).hasClass("cur")) {
                    state += (index + 1).toString();
                    state += "|"
                }
            })
        }
        var sharestate = "";
        if ($("#share-classify").find("li").hasClass("cur")) { sharestate = "" } else {
            $("#share-classify dd").each(function(index) {
                if ($(this).hasClass("cur")) {
                    sharestate += (index + 1).toString();
                    sharestate += "|"
                }
            })
        }
        var groupid = "";
        if ($(".groupwhich").find("a").hasClass("active")) { groupid = $(".groupwhich a.active").data("id") }
        plugin.loading();
        API.reviewApi_lists(homeworkid, grade, sim, state, words, rcount, groupid, sharestate, function(data) {
            hre.fullscore = parseInt(data.fullscore);
            if (data.studentCount == 0) { showBlank() } else { hideBlank() }
            if (data.lists == null) { plugin.closeLoading(); return }
            if (data.isCheckRepeat == 1) { data.isthish = true } else { data.isthish = false }
            data.isvip = true
            if (data.useCount == 1) { data.yisim = true } else { data.yisim = false }
            data.lists.map(function(item, index, arr) {
                item.createtime1 = item.createtime;
                item.createtime = plugin.time_format_year_month_day_hour_min(item.createtime);
                if (item.deltime != null) { item.deltime = plugin.time_format_year_month_day_hour_min(item.deltime) }
                item.homeworkid = homeworkid
            });
            var yj = [],
                wj = [];
            data.lists.filter(function(item) { if (item.grade == "未交") { wj.push(item) } else { yj.push(item) } });
            data.yjcount = yj.length;
            Array.prototype.push.apply(yj, wj);
            data.lists = yj;
            if (data.lists.length == 0) { $(".select-group").hide() } else { $(".select-group").show() }
            if (groupid != "") {
                API.GroupApi_getGroupStudents(groupid, function(data2) {
                    if (data2.data.length == 0) { data.nulltext = "该分组内暂无成员" } else { data.nulltext = "无符合条件的记录" }
                    var html = template("tpl-lists", data);
                    $("#gList").html(html);
                    $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                    $("#nrCount").html("未批（" + data.nrCount + "）");
                    $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）");
                    $(".work-tips-info").html("已筛选出 <span>" + data.currentCount + "</span>人 （全班共" + data.studentCount + "人）");
                    if (callback != null) { callback() }
                    plugin.closeLoading()
                })
            } else {
                data.nulltext = "无符合条件的记录";
                var html = template("tpl-lists", data);
                $("#gList").html(html);
                $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                $("#nrCount").html("未批（" + data.nrCount + "）");
                $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）");
                $(".work-tips-info").html("已筛选出 <span>" + data.currentCount + "</span>人 （全班共" + data.studentCount + "人）");
                if (callback != null) { callback() }
                plugin.closeLoading()
            }
        })
    }
    window.document.getLists = getLists;

    function getSelectStudents() {
        var studentids = "";
        $(".sortBody dl").each(function(index) {
            if ($(this).find(".sequence .radio").hasClass("active")) {
                studentids += $(this).attr("data-id");
                studentids += "|"
            }
        });
        return studentids
    }

    function getSelectStudentsCount() {
        var selectCount = 0;
        $(".sortBody dl").each(function(index) { if ($(this).find(".sequence .radio").hasClass("active")) { selectCount = selectCount + 1 } });
        return selectCount
    }

    function giveScore(studentid, score) {
        var homeworkid = $("#return-course").attr("data-homeworkid");
        API.gradeApi_giveScore(homeworkid, studentid, score, function(data) {
            plugin.openMsg("成绩已经更改", 0);
            $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
            $("#nrCount").html("未批（" + data.nrCount + "）");
            $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）")
        })
    }

    function search(txt) {
        var homeworkid = $("#return-course").attr("data-homeworkid");
        if (getgroupindextype()) {
            var n = $(".work-group-type a.active").index();
            if (n == 0) { n = "" }
            API.ReviewGroupApi_lists(homeworkid, txt, n, function(data) {
                if (data.lists == null) { return }
                var i = 0;
                data.lists.map(function(item) { item.deltime = plugin.time_format_year_month_day_hour_min(item.deltime); if (item.isdelay == null || item.mstatus == 3) { i++ } });
                if (data.lists.length == i) { data.noradio = true }
                var xtml = template("tpl-groupitem", data);
                $("#g-WorkList").html(xtml)
            })
        } else {
            API.reviewApi_search(homeworkid, txt, function(data) {
                if (data.studentCount == 0) { showBlank() } else { hideBlank() }
                if (data.lists == null) { plugin.closeLoading(); return }
                data.lists.map(function(item, index, arr) {
                    item.createtime1 = item.createtime;
                    item.createtime = plugin.time_format_year_month_day_hour_min(item.createtime);
                    if (item.deltime != null) { item.deltime = plugin.time_format_year_month_day_hour_min(item.deltime) }
                    item.homeworkid = homeworkid
                });
                var yj = [],
                    wj = [];
                data.lists.filter(function(item) { if (item.grade == "未交") { wj.push(item) } else { yj.push(item) } });
                data.yjcount = yj.length;
                Array.prototype.push.apply(yj, wj);
                data.lists = yj;
                if (data.lists.length == 0) { $(".select-group").hide() } else { $(".select-group").show() }
                data.isvip = true;
                data.yisim = hre.data.yisim;
                data.isthish = hre.data.isthish;
                data.fullscore = hre.data.fullscore;
                data.nulltext = "无符合条件的记录";
                var html = template("tpl-lists", data);
                $("#gList").html(html);
                $(".work-tips-info").html("已筛选出 <span>" + data.currentCount + "</span>人 （全班共" + data.studentCount + "人）")
            })
        }
    }

    function sortStr(index, dataType) {
        return function(a, b) {
            var aText = $(a).find("dd:nth-child(" + index + ")").attr("data-val");
            var bText = $(b).find("dd:nth-child(" + index + ")").attr("data-val");
            if (dataType != "subState" && dataType != "text") {
                aText = Parse(aText, dataType);
                bText = Parse(bText, dataType);
                return aText > bText ? -1 : bText > aText ? 1 : 0
            } else return aText.localeCompare(bText)
        }
    }

    function Parse(data, dataType) {
        switch (dataType) {
            case "num":
                return parseFloat(data) || 0;
            case "date":
                return Date.parse(data) || 0;
            case "text":
                return data || 0;
            default:
                return splitStr(data)
        }
    }

    function splitStr(data) {
        var re = /^[\$a-zA-z\u4e00-\u9fa5 ]*(.*?)[a-zA-z\u4e00-\u9fa5 ]*$/;
        data = data.replace(re, "$1");
        return parseFloat(data)
    }

    function stopEvent() { var e = arguments.callee.caller.arguments[0] || event; if (e && e.stopPropagation) { e.stopPropagation() } else if (window.event) { window.event.cancelBubble = true } }

    function getgroupindextype() { if (location.pathname.indexOf("/Review/groupindex/homeworkid/") != -1) { return true } else { return false } }

    function setIfBtn(obj) { if (obj.hasClass("disabled")) { if (getgroupindextype()) { plugin.openMsg("请选择小组后，进行操作", 1) } else { plugin.openMsg("请选择学生后，进行操作", 1) } return } }
    exports.common = function() {
        $(document).on("click", "#download", function() { setIfBtn($(this)) });
        $(document).on("click", "#download:not('.disabled')", function() { $(this).next(".downloadbox").show() });
        $(document).on("click", ".downloadbox a,.giveScoreBox a", function() { $(this).parent().hide() });
        $(document).on("click", function(event) { if ($(".downloadbox").is(":visible")) { $(".downloadbox").hide() } if ($(".giveScoreBox").is(":visible")) { $(".giveScoreBox").hide() } });
        $(document).delegate("#download", "click", function(event) { event.stopPropagation() });
        $(document).on("mouseenter", "[data-tipinfo]", function(e) {
            if ($(".tipinfo").size() > 0) return;
            var info = $(this).data("tipinfo");
            var type = $(this).data("tiptype");
            var html = $('<div class="tipinfo ' + type + '"><p>' + info + "</p></div>");
            var l = $(this).offset().left,
                t = $(this).offset().top,
                w = $(this).width(),
                h = $(this).height();
            if (type == "bottom") { $(this).append(html) }
            if (type == "right") { $("body").append(html) }
            var w2 = $(html).width(),
                h2 = $(html).height();
            if (type == "bottom") { $(html).css({ width: "180px", left: -40 + "px", top: h + 20 + "px" }) }
            if (type == "right") { $(html).css({ left: l + w + 20 + "px", top: t - 8 + "px" }) }
        }).on("mouseleave", "[data-tipinfo]", function(e) { $(".tipinfo").remove() });
        $("#search-txt").keyup(function(event) { var txt = $("#search-txt").val(); var theEvent = window.event || event; var key = theEvent.keyCode ? theEvent.keyCode : theEvent.which; if (key == 13) { search(txt); return false } else if (txt == "") { search(txt); return false } });
        $("#search-txt").keydown(function(event) {
            var theEvent = window.event || event;
            var key = theEvent.keyCode ? theEvent.keyCode : theEvent.which;
            if (key == 13) {
                var txt = $("#search-txt").val();
                search(txt);
                return false
            }
        });
        $(document).on("click", ".search-bar-a", function() {
            var txt = $("#search-txt").val();
            search(txt);
            return false
        });
        $(document).on("focus", "#search-txt", function() { $(".search-bar").css("border-color", "#4d90fe") }).on("blur", "#search-txt", function() { $(".search-bar").css("border-color", "#c8c8c8") });
        $(document).on("click", ".togsh .hs-box a", function() {
            var state = $(this).attr("data-state");
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var self = this;
            API.setScoreDisplay(homeworkid, state, function(data) {
                $(self).addClass("active").siblings("a").removeClass("active");
                $(self).parent().prev("span").html($(self).html())
            })
        });
        $(document).on("click", ".togsh .hs-opt span", function() { $(this).next().show(); return false });
        $(document).on("click", function() { $(".togsh .hs-opt .hs-box").hide() });
        $(document).on("click", "a.cancel", function() { layer.closeAll() });
        $(document).on("click", ".generate-final-grade", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            plugin.cursorconfirm({
                title: "生成为期末成绩",
                info: "将本次作业成绩生成期末成绩",
                canel: "取消",
                sure: "确认生成",
                sureCallback: function() {
                    API.ReviewApi_generateFinalGrade(homeworkid, function(tData) {
                        var courseid = tData.courseid;
                        plugin.cursorconfirm({
                            title: "生成成功",
                            info: "期末考成绩已经生成成功，点击前往查看",
                            canel: "关闭",
                            sure: "前往查看",
                            sureCallback: function() {
                                var href = "/Grade/index/courseid/" + courseid + ".html?type=4";
                                location.href = href
                            }
                        })
                    })
                }
            })
        })
    };
    exports.grouphomework = function() {
        exports.common();

        function setTypeActive() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var type = plugin.getQuery("type");
            var index;
            switch (type) {
                case "yp":
                    index = 1;
                    break;
                case "wp":
                    index = 2;
                    break;
                case "wj":
                    index = 3;
                    break;
                default:
                    index = 0;
                    break
            }
            setGroupsLists(index);
            $(".work-group-type a").eq(index).addClass("active").siblings().removeClass("active")
        }
        window.document.setTypeActive = setTypeActive;

        function setGroupsLists(n) {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            if (n == 0) { n = "" }
            API.ReviewGroupApi_lists(homeworkid, "", n, function(data) {
                if (data.lists == null) { return }
                var i = 0;
                data.lists.map(function(item) {
                    item.createtime = plugin.time_format_year_month_day_hour_min(item.createtime);
                    item.deltime = plugin.time_format_year_month_day_hour_min(item.deltime);
                    if (item.isdelay == null || item.mstatus == 3) { i++ }
                });
                if (data.lists.length == i) { data.noradio = true }
                var cs = [],
                    zs = [],
                    yp = [],
                    wj = [],
                    dh = [];
                data.lists.map(function(item) { if (item.mstatus == 1 && item.isdelay == 2) { cs.push(item) } else if (item.mstatus == 1 && item.isdelay == 1) { zs.push(item) } else if (item.mstatus == 2) { yp.push(item) } else if (item.mstatus == 3) { dh.push(item) } else if (item.mstatus == null && item.isdelay == null) { wj.push(item) } });
                var newarr = cs.concat(zs).concat(yp);
                newarr.sort(function(x, y) { if (x.createtime < y.createtime) { return 1 } if (x.createtime > y.createtime) { return -1 } return 0 });
                dh.sort(function(x, y) { if (x.deltime < y.deltime) { return 1 } if (x.deltime > y.deltime) { return -1 } return 0 });
                data.lists = newarr.concat(dh).concat(wj);
                void 0;
                var html = template("tpl-groupslists", data);
                $(".work-group-m").html(html);
                var xtml = template("tpl-groupitem", data);
                $("#g-WorkList").html(xtml);
                $(".work-group-type a").eq(n).addClass("active").siblings().removeClass("active")
            })
        }
        setTypeActive();
        window.document.setGroupsLists = setGroupsLists;
        hideBlank();
        $(document).on("click", ".work-group-type a", function() {
            var index = $(this).index();
            $(this).addClass("active").siblings().removeClass("active");
            setGroupsLists(index)
        });
        $(document).on("click", ".cuijiaog", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var gid = $(this).parents(".g-workitem").attr("id");
            plugin.alerttips({ info: "是否要进行作业催交？", sure: "立即催交", cancle: "不催了", sureCallback: function() { API.ReviewApi_expeditorGroupHomework(homeworkid, gid, function(data) { if (data.status == 1) { plugin.openMsg("催交成功", 0) } }) } })
        });
        $(document).on("click", ".cuijiaoga", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var lis = $(".cuijiaoga");
            var gid = [];
            for (var i = 0; i < lis.length; i++) { gid.push($(lis[i]).parents(".g-workitem").attr("id")) }
            plugin.alerttips({ info: "是否要进行作业催交？", sure: "立即催交", cancle: "不催了", sureCallback: function() { API.ReviewApi_expeditorGroupHomework(homeworkid, gid, function(data) { if (data.status == 1) { plugin.openMsg("催交成功", 0) } }) } })
        });
        var circle = 0;
        $(document).on("click", ".sortBody .g-checktitle .radio", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                circle--;
                if (circle < $(".sortBody .g-checktitle .radio").length) { $(".sortHead .g-checktitle .radio").removeClass("active") }
            } else {
                $(this).addClass("active");
                circle++;
                if (circle == $(".sortBody .g-checktitle .radio").length) { $(".sortHead .g-checktitle .radio").addClass("active") }
            }
            if (circle > 0) { $(".sortHead .tool-btn").removeClass("disabled") } else { $(".sortHead .tool-btn").addClass("disabled") }
            $(".sortTable .sortHead .g-checktitle span b").html(circle);
            return false
        });
        $(document).on("click", ".sortHead .g-checktitle .radio", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(".sortBody .g-checktitle .radio").removeClass("active");
                circle = 0;
                $(".sortHead .tool-btn").addClass("disabled")
            } else {
                $(this).addClass("active");
                if ($(".sortBody .g-checktitle .radio").length > 0) {
                    $(".sortBody .g-checktitle .radio").addClass("active");
                    circle = $(".sortBody .g-checktitle .radio").length;
                    $(".sortHead .tool-btn").removeClass("disabled")
                }
            }
            $(".sortTable .sortHead .g-checktitle span b").html(circle)
        });
        $(document).on("focus", ".g-workitem li input.inputnum", function() { var val = $(this).val(); if (val == "未批") { $(this).val("") } }).on("blur", ".g-workitem li input.inputnum", function() {
            var val = plugin.trim($(this).val());
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var groupid = $(this).parents(".g-workitem").attr("data-groupid");
            var studentid = $(this).parent().attr("data-uid");
            if (val == "") {
                $(this).val("未批");
                val = "未批"
            } else if (val == "未批" || val == "已阅") {} else if (isNaN(val)) {
                plugin.openMsg("请输入『分数』或『已阅』", 1);
                $(this).val("").focus();
                return
            }
            API.ReviewGroupApi_giveScore(homeworkid, groupid, studentid, val, function(data) {
                plugin.openMsg("成绩已修改", 0);
                setCurrGroupTypeCount(data)
            })
        });

        function setCurrGroupTypeCount(data) {
            $(".work-group-type a").eq(1).text("已批小组（" + data.reviewedCount + "）");
            $(".work-group-type a").eq(2).text("未批小组（" + data.nrCount + "）");
            $(".work-group-type a").eq(3).text("未交小组（" + data.nSubmitCount + "）")
        }
        window.document.setCurrGroupTypeCount = setCurrGroupTypeCount;

        function getSelectGroups() {
            var groupids = "";
            $(".sortBody .g-workitem").each(function(index) {
                if ($(this).find(".g-checktitle .radio").hasClass("active")) {
                    groupids += $(this).attr("data-groupid");
                    groupids += "|"
                }
            });
            return groupids
        }
        var gdahuib;
        $(document).on("click", "#callBack", function() {
            setIfBtn($(this));
            var groupids = getSelectGroups();
            if (groupids == "") { return false }
            gdahuib = layer.open({
                type: 1,
                title: ["确定要打回选中小组作业？", "font-size:18px; height:66px; line-height:66px; background:#FFF; color:#a9a9a9; padding-left:28px; border-bottom:1px solid #fff"],
                closeBtn: false,
                area: ["347px", "270px"],
                content: $("#callBack-w"),
                success: function(layerContent) {
                    $("#callBack-w .sure").addClass("active");
                    $("#callBack-w input").focus().val("")
                },
                shift: 7,
                moveType: 1
            })
        });
        $("#callBack-w input").off("keyup");
        Array.prototype.indexOf = function(val) { for (var i = 0; i < this.length; i++) { if (this[i] == val) return i } return -1 };
        Array.prototype.remove = function(val) { var index = this.indexOf(val); if (index > -1) { this.splice(index, 1) } };
        $(document).on("click", "#callBack-w .sure.active", function() {
            var groupids = getSelectGroups();
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var reason = plugin.trim($("#callBack-w .callback-input").val());
            API.ReviewGroupApi_rebackHomework(homeworkid, groupids, reason, function(data) {
                plugin.openMsg("已成功打回", 0);
                setTypeActive();
                $(".sortHead button").addClass("disabled");
                layer.close(gdahuib)
            })
        });
        $(document).on("click", "#downloadall", function() {
            setIfBtn($(this));
            var groupids = getSelectGroups();
            if (groupids == "") { return false }
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var uid = $("#return-course").attr("data-uid");
            var packageurl = $("#return-course").attr("data-packageurl");
            var url = packageurl + "/Package/downloadGroupsView/groupids/" + groupids + "/homeworkid/" + homeworkid + "/uid/" + uid;
            plugin.openNewWindows(url, homeworkid);
            return false
        });
        $(document).on("click", "#downloadbb", function() {
            setIfBtn($(this));
            var groupids = getSelectGroups();
            if (groupids == "") { return false }
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var uid = $("#return-course").attr("data-uid");
            var url = "/export/groupHomeworkGradeByGroups/homeworkid/" + homeworkid + "/groupids/" + groupids;
            plugin.openNewWindows(url, homeworkid);
            return false
        });
        $(document).on("click", "#downloadallbb", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var url = "/export/groupHomeworkGrade/homeworkid/" + homeworkid;
            plugin.openNewWindows(url, homeworkid);
            return false
        });
        $(document).on("click", ".g-workitem .g-piyue", function(e) {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var groupid = $(this).parents(".g-workitem").attr("data-groupid");
            var tabgrouparr = [];
            $(".g-workitem .g-checktitle i.radio").each(function(index) {
                var a = $(this).parents(".g-workitem").attr("data-groupid");
                tabgrouparr.push(a)
            });
            if (localStorage) { localStorage.tabgroupjson = JSON.stringify(tabgrouparr) }
            var url = "/Review/groupfile/homeworkid/" + homeworkid + "/groupid/" + groupid + ".html";
            window.document.currlocation = window.location.href;
            window.open(url, "newgroup")
        });
        $(document).on("click", ".g-workitem .weijiao", function(e) {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var groupid = $(this).parents(".g-workitem").attr("data-groupid");
            var groupname = $(this).parents(".g-workitem").find(".groupspanname").text();
            var info = groupname + " “未提交” 电子档作业，是否将其变更为 “已提交”？";
            var _this = this;
            var giveScoreHtml = "";
            plugin.alerttips({
                info: info,
                sure: "变更为已提交",
                cancle: "取消",
                sureCallback: function() {
                    API.ReviewGroupApi_changeGroupHandupState(homeworkid, groupid, function(tData) {
                        if (tData.status == 1) {
                            API.ReviewGroupApi_getSingleGroupHomework(homeworkid, groupid, function(gGroupData) {
                                var tpl = template("tpl-sigle-group", { value: gGroupData.data });
                                void 0;
                                $(_this).parents(".g-workitem").replaceWith(tpl)
                            });
                            plugin.openMsg("已变更为提交状态", 0)
                        } else { plugin.openMsg(data.info, 1) }
                    })
                }
            })
        })
    };

    function introstart() {
        var introtype = 3;
        var courseid = $("#return-course").attr("data-id");
        API.TourApi_isTour(courseid, introtype, function(data) {
            if (data.isTour == 0) {
                require.async(["intro", "/Public/Common/js/lib/intro/introjs.css"], function() {
                    $(".work-tips").attr({ "data-step": 1, "data-intro": "老师可依据此作业属性来筛选出所要批阅的学生", "data-position": "bottom" });
                    $(".typehead").attr({ "data-step": 2, "data-intro": "点击每个属性可以对学生作业进行相应的排序", "data-position": "top" });
                    $(".sortTable div.sortHead").attr({ "data-step": 3, "data-intro": "选中某些学生后可以批量进行操作，如：给成绩、打回等", "data-position": "top" });
                    $(".sortTable .sortBody dl .batscore").eq(0).attr({ "data-step": 4, "data-intro": "在此处，老师可以直接修改学生作业成绩", "data-position": "top" });
                    $(".sortTable .sortBody dl").eq(0).attr({ "data-step": 5, "data-intro": "鼠标移入此行，点击此处的“批阅作业”可以对查看学生作业详情，并进行批注等操作", "data-position": "top" });
                    $(".head-title .togsh .hs-opt span").attr({ "data-step": 6, "data-intro": "老师可以选择批阅学生作业后，是否对每个学生显示此作业成绩", "data-position": "left" });
                    var intros = introJs().setOptions({ prevLabel: "〈 上一步", nextLabel: "下一步 〉", skipLabel: "跳过", doneLabel: "完成" }).start();
                    intros.oncomplete(function() { API.TourApi_setTourFinish(introtype, function() {}) })
                })
            }
        })
    }

    function setCurrType(callback) {
        var grade2 = plugin.getQuery("type"),
            grade = "";
        if (grade2) { if (grade2 == "yp") { grade = 1 } if (grade2 == "wp") { grade = 2 } if (grade2 == "wj") { grade = 3 } }
        setReviewWrap(grade, "", "", "", "", function() {
            if (grade != "") {
                $("#grade-classify li#unlimited").removeClass("cur");
                $("#grade-classify").find("dd").eq(grade - 1).addClass("cur")
            }
            introstart()
        })
    }
    exports.all = function() {
        plugin.loading();
        exports.common();
        setCurrType();
        $(document).on("click", ".classify a,.thead dt a", function() { return false });
        var setcheck;
        $(document).on("click", ".checkrepeatsetting", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            API.homeworkApi_getHomework(homeworkid, function(data) {
                setcheck = layer.open({
                    type: 1,
                    title: ["查重设置", "font-size:16px; height:60px; line-height:60px; background:#FFF; color:#a9a9a9; padding-left:28px; border-bottom:1px solid #fff"],
                    area: "660px",
                    closeBtn: false,
                    content: template("tpl-checksetting", data.data),
                    success: function(layerContent) {
                        if (data.data.checkrepeat == 1) {
                            plugin.setSlideswitch("needcheckswitch", true, function(s) {
                                if (s) {
                                    $(".checkwarnline input").removeAttr("disabled");
                                    $(".mycheckbox").removeClass("noclick");
                                    $(".checkwarnlineinput").focus()
                                } else {
                                    $(".mycheckbox").addClass("noclick");
                                    $(".mycheckbox").removeClass("checked");
                                    $(".checkwarnline input").attr("disabled", "disabled")
                                }
                            });
                            $(".checkwarnline input").removeAttr("disabled");
                            $(".mycheckbox").removeClass("noclick");
                            if (data.data.autorebackrate != "-1") { $(".mycheckbox").addClass("checked") }
                        } else {
                            plugin.setSlideswitch("needcheckswitch", false, function(s) {
                                if (s) {
                                    $(".checkwarnline input").removeAttr("disabled");
                                    $(".mycheckbox").removeClass("noclick");
                                    $(".checkwarnlineinput").focus()
                                } else {
                                    $(".mycheckbox").addClass("noclick");
                                    $(".mycheckbox").removeClass("checked");
                                    $(".checkwarnline input").attr("disabled", "disabled")
                                }
                            })
                        }
                        $(".mycheckbox").on("click", function() {
                            if ($(this).hasClass("noclick")) { return false }
                            $(this).toggleClass("checked")
                        });
                        $(".cancelsetting").on("click", function() { layer.close(setcheck) });
                        $(".suresetting").on("click", function() {
                            var needcheckstr = $(this).parents(".checksettingbox").find("#needcheckswitch").attr("switch");
                            var checkwarn = $(this).parents(".checksettingbox").find(".checkwarnlineinput").val();
                            var checkback = $(this).parents(".checksettingbox").find(".autosendback").val();
                            var autoback = 0;
                            if ($(this).parents(".checksettingbox").find(".mycheckbox").hasClass("checked")) { autoback = 1 }
                            var needcheck = 0;
                            if (needcheckstr == "on") {
                                needcheck = 1;
                                checkwarn = Number(checkwarn) / 100;
                                checkback = Number(checkback) / 100;
                                if (autoback == 0) { checkback = -1 }
                            } else {
                                checkwarn = 0;
                                checkback = -1
                            }
                            API.HomeworkApi_updateCheckRepeatSetting(homeworkid, needcheck, checkback, checkwarn, function(data) {
                                if (data.status == 1) { plugin.openMsg("修改成功", 0) }
                                layer.close(setcheck);
                                location.reload()
                            })
                        })
                    },
                    shift: 7,
                    moveType: 1
                })
            })
        });
        var unpaid = $(".sortBody dl dd");
        unpaid.each(function() {
            if ($(this).is(".unpaid")) {
                $(this).css({ color: "#ff0000" });
                $(this).parent().addClass("noStyle");
                $(this).siblings().find("i").hide();
                $(this).siblings(".similarity,.ontime,.timeout,.homeworkNumber").html('<span class="noCol">--</span>');
                $(this).siblings(".ontime,.timeout").find("span").show();
                $(this).parent().find(".fn-show").remove()
            }
        });
        $(document).on("click", ".similarity", function() { stopEvent() });
        $(document).on("click", ".classify dd", function() {
            $(this).toggleClass("cur").siblings("li#unlimited").removeClass("cur");
            if ($(this).parent().find("dd.cur").length == $(this).parent().find("dd").length || $(this).parent().find("dd.cur").length == 0) {
                $(this).removeClass("cur");
                $(this).siblings("dd").removeClass("cur");
                $(this).siblings("li").addClass("cur")
            }
            lists()
        });
        $(document).on("click", ".classify li#unlimited", function() {
            if ($(this).hasClass("cur")) return;
            $(this).addClass("cur").siblings().removeClass("cur");
            if ($(this).parent().siblings().is(".unselect")) { $(this).parent().siblings("dl").removeClass("unselect") }
            lists()
        });
        $(document).on("click", ".classify li#unlimited.cur", function() { return });
        $(document).on("click", "i.close-icon", function() {
            $(this).parent().siblings(".input-dd").show();
            $(this).parent().siblings(".input-dd").find("input").val("");
            $(this).parent().siblings(".curBtn").show();
            if ($(this).parents("dl").hasClass("addhomeWork")) { words = "" } else if ($(this).parents("dl").hasClass("addpigaiNum")) { rcount = "" }
            $(this).parent().prev("span").remove();
            $(this).parent().remove();
            lists()
        });
        $(document).on("click", ".addnumber", function() {
            var h = $(this).prev(".input-dd");
            var regn = /^[0-9]\d{0,4}$/;
            var nst = h.find("input.nStart").val();
            var ned = h.find("input.nEnd").val();
            if (nst == "" || ned == "" || !regn.test(nst) || !regn.test(ned)) { plugin.openMsg("请输五位以内的正整数", 1); return false } else {
                $(this).hide();
                $(this).prev(".input-dd").hide();
                $(".addhomeWork dt").after('<p class="hipNum"><span>' + nst + " — " + ned + '</span><i class="close-icon"></i></p>');
                words = nst + "|" + ned;
                lists()
            }
        });
        $(document).on("click", ".addpigai", function() {
            var h = $(this).prev(".input-dd");
            var regn = /^[0-9]\d{0,4}$/;
            var nst = h.find("input.nStart").val();
            var ned = h.find("input.nEnd").val();
            if (nst == "" || ned == "" || !regn.test(nst) || !regn.test(ned)) { plugin.openMsg("请输五位以内的正整数", 1); return false } else {
                $(this).hide();
                $(this).prev(".input-dd").hide();
                $(".addpigaiNum dt").after('<p class="hipNum"><span>' + nst + " — " + ned + '</span><i class="close-icon"></i></p>');
                rcount = nst + "|" + ned;
                lists()
            }
        });
        $(document).on("click", ".slidedown", function() {
            $(this).text($(".hide-classify").is(":hidden") ? "收起" : "展开全部");
            $(".hide-classify").toggle()
        });
        var circle = 0;
        $(document).on("click", ".sortBody dd .radio", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                circle--;
                if (circle < $(".sortBody dd .radio").length) { $(".sortHead li .radio").removeClass("active") }
            } else {
                $(this).addClass("active");
                circle++;
                if (circle == $(".sortBody dd .radio").length) { $(".sortHead li .radio").addClass("active") }
            }
            if (circle > 0) { $(".tool-btn").removeClass("disabled") } else { $(".tool-btn").addClass("disabled") }
            $(".sortTable .sortHead li.selectnum span").html(circle);
            return false
        });
        $(document).on("click", ".sortHead li .radio", function() {
            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(".sortBody dd .radio").removeClass("active");
                circle = 0;
                $(".tool-btn").addClass("disabled")
            } else {
                $(this).addClass("active");
                if ($(".sortBody dd .radio").length > 0) {
                    $(".sortBody dd .radio").addClass("active");
                    circle = $(".sortBody dd .radio").length;
                    $(".tool-btn").removeClass("disabled")
                }
            }
            $(".sortTable .sortHead li.selectnum span").html(circle)
        });
        $(document).on("click", ".fn-show-ul li", function() { stopEvent() });
        $(document).on("click", "#callBack", function() {
            setIfBtn($(this));
            var studentids = getSelectStudents();
            if (studentids == "") { return false }
            layer.open({
                type: 1,
                title: ["确定要打回选中学生作业？", "font-size:18px; height:66px; line-height:66px; background:#FFF; color:#a9a9a9; padding-left:28px; border-bottom:1px solid #fff"],
                closeBtn: false,
                area: ["347px", "270px"],
                content: $("#callBack-w"),
                success: function() {
                    $("#callBack-w .sure").addClass("active");
                    $("#callBack-w .txt1").focus().val("")
                },
                shift: 7,
                moveType: 1
            })
        });
        $("#callBack-w input").off("keyup");
        Array.prototype.indexOf = function(val) { for (var i = 0; i < this.length; i++) { if (this[i] == val) return i } return -1 };
        Array.prototype.remove = function(val) { var index = this.indexOf(val); if (index > -1) { this.splice(index, 1) } };
        $(document).on("click", "#callBack-w .sure.active", function() {
            var studentids = getSelectStudents();
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var reason = $("#callBack-w .callback-input").val();
            API.reviewApi_rebackHomeworkBat(homeworkid, studentids, reason, function(data) {
                $(".sortBody dl").each(function(index) { if ($(this).find(".sequence .radio").hasClass("active")) { $(this).remove() } });
                plugin.openMsg("已成功打回", 0);
                if (localStorage && localStorage.getItem("tabjson")) {
                    var tabjson = JSON.parse(localStorage.getItem("tabjson"));
                    tabjson.map(function(item, index, arr) { if (studentids.indexOf(item) != -1) { tabjson.remove(item) } });
                    localStorage.tabjson = JSON.stringify(tabjson)
                }
                lists();
                setTabType(document, $(".typehead li.select"));
                setTabType(document, $(".typehead li.select"));
                $(".select-group button").addClass("disabled");
                layer.closeAll();
                $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                $("#nrCount").html("未批（" + data.nrCount + "）");
                $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）")
            })
        });
        $(document).on("click", "#givePoints", function() { setIfBtn($(this)) });
        $(document).on("click", "#givePoints:not('.disabled')", function() {
            var studentids = getSelectStudents();
            if (studentids == "") { return false }
            $(this).next(".giveScoreBox").show();
            return false
        });
        $(document).on("click", "#givePointAllSame", function() {
            layer.open({
                type: 1,
                title: ["批量给分选中学生", "font-size:18px; height:66px; line-height:66px; background:#FFF; color:#a9a9a9; padding-left:28px; border-bottom:1px solid #ececec"],
                closeBtn: false,
                area: ["266px", "200px"],
                content: $("#givePoints-w"),
                success: function() {
                    $("#callBack-w .sure").removeClass("active hover click");
                    $("#callBack-w .txt1").focus().val("")
                },
                shift: 7,
                moveType: 1
            });
            $("#givePoints-w input.txt1").focus()
        });
        $(document).on("click", "#givePointByRand", function() {
            var tpl = template("give-score-bat-by-rand", []);
            layer.open({
                type: 1,
                title: ["按“分数区间”随机给分", "font-size:18px; height:66px; line-height:66px; background:#FFF; color:#a9a9a9; padding-left:28px; border-bottom:1px solid #ececec"],
                closeBtn: false,
                area: ["266px", "200px"],
                content: tpl,
                success: function(content) {
                    $(content).find("#num1").focus().val("");
                    $(content).find(".txt1").on("keyup", function() { $(this).val($(this).val().replace(/[^0-9.]/g, "")) });
                    $(content).find(".sure.active").on("click", function() {
                        var num1 = $(content).find("#num1").val();
                        var num2 = $(content).find("#num2").val();
                        if (num1 == "") {
                            plugin.openMsg("区间1的分数不能为空 ", 1);
                            $(content).find("#num1").val("").focus();
                            return
                        }
                        if (num2 == "") {
                            plugin.openMsg("区间2的分数不能为空 ", 1);
                            $(content).find("#num2").val("").focus();
                            return
                        }
                        num1 = parseFloat(num1);
                        num2 = parseFloat(num2);
                        if (num1 > hre.fullscore) {
                            plugin.openMsg("分数不能超过最大分值 " + hre.fullscore, 1);
                            $(content).find("#num1").val("").focus();
                            return
                        }
                        if (num2 > hre.fullscore) {
                            plugin.openMsg("分数不能超过最大分值 " + hre.fullscore, 1);
                            $(content).find("#num2").val("").focus();
                            return
                        }
                        if (num1 > num2) {
                            plugin.openMsg("区间1的分值不能大于区间2", 1);
                            $(content).find("#num1").val("").focus();
                            return
                        }
                        var studentids = getSelectStudents();
                        var homeworkid = $("#return-course").attr("data-homeworkid");
                        API.reviewApi_giveScoreBatByRand(homeworkid, studentids, num1, num2, function(data) {
                            $(".sortBody dl").each(function(index) {
                                if ($(this).find(".sequence .radio").hasClass("active")) {
                                    var score = data.grades[index];
                                    $(this).find(".batscore span").html(score);
                                    $(this).find(".batscore").attr("data-val", score)
                                }
                            });
                            layer.closeAll();
                            plugin.openMsg("成绩已经批量更改", 0);
                            $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                            $("#nrCount").html("未批（" + data.nrCount + "）");
                            $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）")
                        })
                    })
                },
                shift: 7,
                moveType: 1
            })
        });
        $(document).on("click", "#downloadall", function() {
            var studentids = getSelectStudents();
            if (studentids == "") { return false }
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var uid = $("#return-course").attr("data-uid");
            var packageurl = $("#return-course").attr("data-packageurl");
            var selectCount = getSelectStudentsCount();
            var url = packageurl + "/Package/downloadStudentsView/students/" + studentids + "/homeworkid/" + homeworkid + "/uid/" + uid;
            if (selectCount > 5) {
                plugin.openNewUrlByDialog(url, homeworkid, { info: "点击下方的“开始下载”按钮，即可进入打包下载", sure: "开始下载" })
            }
            return false
        });
        $(document).on("click", "#downloadbb", function() {
            var studentids = getSelectStudents();
            if (studentids == "") { return false }
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var uid = $("#return-course").attr("data-uid");
            var url = "/export/gradesByStudents/homeworkid/" + homeworkid + "/studentids/" + studentids;
            plugin.loading();
            API.LongUrlLogApi_addLog(url, studentids, function(tData) {
                plugin.closeLoading();
                var newurl = "/export/gradesByStudents/homeworkid/" + homeworkid + "/newid/" + tData.newid;
                plugin.openNewUrlByDialog(newurl, homeworkid, { info: "点击下方的“开始下载”按钮，即可进入下载", sure: "开始下载" })
            });
            return false
        });
        $(document).on("click", "#downloadallbb", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var url = "/export/grade/homeworkid/" + homeworkid;
            plugin.openNewUrlByDialog(url, homeworkid, { info: "点击下方的“开始下载”按钮，即可进入下载", sure: "开始下载" });
            return false
        });
        $(document).on("mouseover", ".sortTable .sortBody dl", function() { $(this).addClass("shadow") });
        $(document).on("mouseout", ".sortTable .sortBody dl", function() { $(this).removeClass("shadow") });
        $(document).on("keyup", "#isnum", function() {
            $(this).val($(this).val().replace(/[^0-9.]/g, ""));
            $("a.btn-hasread").removeClass("focusin")
        });
        $(document).on("click", "#isnum", function() { if ($(this).val() == "") { $(this).parents("#givePoints-w").find(".sure").remove("active") } });
        $(document).on("click", "a.btn-hasread", function() {
            if ($(this).is(".focusin")) {
                $(this).removeClass("focusin");
                $(".btns .sure").removeClass("active")
            } else {
                $(this).addClass("focusin");
                $(".btns .sure").addClass("active")
            }
            $("#isnum").val($(this).val().replace(/[^0-9.]/g, ""));
            stopEvent()
        });
        $(document).on("click", "li[dataType]", function() { setTabType(document, $(this)) });

        function setTabType(doc, obj) {
            $(doc).find(".fn-show").hide();
            var dataType = obj.attr("dataType");
            var index = obj.index();
            var arr = [];
            var notSort = [];
            if (obj.hasClass("dt-name")) { var row = $(doc).find("div.sortBody dl") } else { var row = $(doc).find('div.sortBody dl:not(".noStyle")') }
            row.css({ marginTop: "0px", marginBottom: "-1px", boxShadow: "none" });
            $.each(row, function(i, item) { var current = $(item).find("dd:nth-child(" + (index + 2) + ")").attr("data-val"); if (needSort(current) == true) { arr.push(row[i]) } else { notSort.push(row[i]) } });
            if (obj.hasClass("select") && obj.find("a").hasClass("down")) {
                arr.sort(sortStr(index + 2, dataType));
                arr.reverse();
                obj.find("a").addClass("focus").removeClass("down")
            } else {
                arr.sort(sortStr(index + 2, dataType));
                obj.find("a").addClass("focus").addClass("down");
                $(doc).find(".typehead .select").removeClass("select");
                $(doc).find(".sortBody dl").each(function(item) { $(this).find("dd").removeClass("select").eq(index + 1).addClass("select") })
            }
            obj.siblings().find("a").removeAttr("class");
            obj.addClass("select");
            if (obj.hasClass("dt-name")) { arr = notSort.concat(arr) } else { arr = arr.concat(notSort) }
            var fragment = document.createDocumentFragment();
            $.each(arr, function(i) { fragment.appendChild(arr[i]) });
            $(doc).find("div.sortBody").prepend(fragment)
        }
        window.document.setTabType = setTabType;
        var txt;
        $(document).on("click", ".fraction span,.notapproved span,.readed span", function() {
            txt = $(this).text();
            if (txt == "未交") { return }
            if (txt == "未批") { txt = "" }
            var inputs = $("<input type='text' class='fraction-input' value='" + txt + "'/>");
            txt = $(this).text();
            $(this).html(inputs);
            $("input", this).click(function() { return false });
            stopEvent();
            inputs.on("focus", function() { $(this).parent().css({ "border-bottom": "2px solid #4d90fe", height: "23px" }) });
            inputs.trigger("focus");
            plugin.moveEnd(inputs.get(0));
            inputs.blur(function() {
                var newtxt = $(this).val();
                var studentid = $(this).parents("dl").attr("data-id");
                if (newtxt == "") {
                    txt = "未批";
                    $(this).parents("dd").attr("data-val", -3).find("span").text(txt).removeAttr("style");
                    giveScore(studentid, txt);
                    return
                }
                if (newtxt == txt) { $(this).parents("dd").find("span").text(txt).removeAttr("style"); return }
                if (newtxt == "") {
                    txt = "未批";
                    $(this).parents("dd").attr("data-val", -3).find("span").text("未批").removeAttr("style");
                    giveScore(studentid, txt)
                } else if (newtxt == "未批") {
                    $(this).parent().parent().addClass("notapproved").removeClass("fraction readed");
                    $(this).parents("dd").attr("data-val", -3).find("span").text(newtxt).removeAttr("style");
                    giveScore(studentid, newtxt)
                } else if (newtxt == "已阅") {
                    $(this).parent().parent().addClass("fraction").removeClass("readed notapproved");
                    $(this).parents("dd").attr("data-val", -2).find("span").text(newtxt).removeAttr("style");
                    giveScore(studentid, newtxt)
                } else if (!isNaN(newtxt)) {
                    if (newtxt < 1) {
                        newtxt = 0;
                        $(this).val(0)
                    }
                    if (newtxt > hre.fullscore) {
                        plugin.openMsg("分数不能超过最大分值 " + hre.fullscore, 1);
                        $(this).val("").focus();
                        return
                    }
                    $(this).parent().parent().addClass("fraction").removeClass("notapproved readed");
                    $(this).parents("dd").attr("data-val", newtxt).find("span").text(newtxt).removeAttr("style");
                    giveScore(studentid, newtxt)
                } else if (newtxt != "未批" && newtxt != "已阅") {
                    if (isNaN(newtxt)) {
                        plugin.openMsg("请输入『分数』或『已阅』", 1);
                        $(this).parents("dd").find("span").text(txt).removeAttr("style")
                    }
                    $(this).parents("dd").attr("data-val", txt).find("span").text(txt).removeAttr("style")
                }
            })
        });
        $(document).on("click", ".sortBody dd.piyue a", function(e) {
            e.preventDefault();
            var tabarr = [];
            $(".sortBody dl:not('.noStyle')").each(function(item) { tabarr.push($(this).attr("data-id")) });
            if (localStorage) {
                localStorage.tabjson = JSON.stringify(tabarr);
                var url = $(this).attr("href");
                window.document.currlocation = window.location.href;
                window.open(url, "newwindow")
            }
        });
        $(document).on("click", "#givePoints-w .btn-hasread", function() { $("#isnum").val("") });
        $(document).on("click", "#givePoints-w .sure.active", function() {
            var score = "";
            if ($("#isnum").val() == "") { score = "已阅" } else { score = $("#isnum").val() }
            if (score > hre.fullscore) {
                plugin.openMsg("分数不能超过最大分值 " + hre.fullscore, 1);
                $("#isnum").val("").focus();
                return
            }
            var studentids = getSelectStudents();
            var homeworkid = $("#return-course").attr("data-homeworkid");
            API.reviewApi_giveScoreBat(homeworkid, studentids, score, function(data) {
                $(".sortBody dl").each(function(index) {
                    if ($(this).find(".sequence .radio").hasClass("active")) {
                        $(this).find(".batscore span").html(score);
                        $(this).find(".batscore").attr("data-val", score)
                    }
                });
                layer.closeAll();
                plugin.openMsg("成绩已经批量更改", 0);
                $("#reviewedCount").html("已批（" + data.reviewedCount + "）");
                $("#nrCount").html("未批（" + data.nrCount + "）");
                $("#nSubmitCount").html("未交（" + data.nSubmitCount + "）")
            })
        });
        $(document).on("click", ".vip-check .not-vip", function() {
            var html = template("tpl-review-check", hre.data);
            $(".check-pop").html(html);
            layer.open({
                area: ["600px", "400px"],
                type: 1,
                title: false,
                closeBtn: false,
                content: $(".check-pop"),
                shift: 7,
                moveType: 1,
                success: function(content) {
                    content.find(".get-check").on("click", function() {
                        var homeworkid = $("#return-course").attr("data-homeworkid");
                        API.reviewApi_useCheckRepeat(homeworkid, function(data) {
                            layer.closeAll();
                            setCurrType()
                        })
                    });
                    content.find(".get-vip").on("click", function() { plugin.openNewWindows("/VipActivity/vipaction", "viplinkpop") })
                }
            })
        });
        $(document).on("click", ".check-pop .close", function() { layer.closeAll() });
        $(document).on("click", ".colaa .nohandup", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var studentid = $(this).parents("dl").attr("data-id");
            var studentName = $(this).parents("dl").find(".stu-name").text();
            var info = studentName + " “未提交” 电子档作业，是否将其变更为 “已提交”？";
            var _this = this;
            var fullscore = $(".sortTable").attr("data-fullscore");
            var giveScoreHtml = '<dd class="colaa batscore notapproved" data-val="-3" style="text-align:left"><span>未批</span>/' + fullscore + "</dd>";
            plugin.alerttips({
                info: info,
                sure: "变更为已提交",
                cancle: "取消",
                sureCallback: function() {
                    API.reviewApi_changeHandupState(homeworkid, studentid, function(tData) {
                        if (tData.status == 1) {
                            $(_this).parent().replaceWith(giveScoreHtml);
                            plugin.openMsg("已变更为提交状态", 0)
                        } else { plugin.openMsg(data.info, 1) }
                    })
                }
            })
        });
        $(document).on("click", ".similarity", function() { if ($(this).data("val") == "-1") { return false } var url = $(this).attr("data-url") + "?pop=1"; if (url != null && url != "") { layer.open({ type: 2, title: false, closeBtn: true, area: ["90%", "90%"], shade: .3, shadeClose: true, scrollbar: false, content: url, success: function(content) {}, end: function() {} }) } });
        $(document).on("click", ".hastenAll", function() {
            var cuijiaoList = $("#gList .sortBody dl .cuijiaoBox .cuijiao");
            if (cuijiaoList.length > 0) {
                var homeworkid = $("#return-course").attr("data-homeworkid");
                plugin.alerttips({
                    info: "是否要催交全部未交学生的作业？",
                    sure: "立即催交",
                    cancle: "不催了",
                    sureCallback: function() {
                        plugin.loading();
                        API.reviewApi_expeditorHomeworkAll(homeworkid, function(data) {
                            if (data.status == 1) {
                                for (var i = 0; i < cuijiaoList.length; i++) {
                                    var _this = cuijiaoList.eq(i);
                                    var num = _this.data("count");
                                    if (isNaN(num)) { num = 0 }
                                    var newNum = parseInt(num) + 1;
                                    var text = "已催" + newNum + "次";
                                    _this.html(text);
                                    _this.data("count", newNum)
                                }
                                plugin.openMsg("催交提醒已发送给学生", 0);
                                plugin.closeLoading()
                            }
                        })
                    }
                })
            }
        });
        $(document).on("click", ".cuijiaoBox .cuijiao", function() {
            var homeworkid = $("#return-course").attr("data-homeworkid");
            var studentid = $(this).parents("dl").attr("data-id");
            var _this = this;
            var par = null;
            if ($(this).parent().find(".cuijiaoed").size() > 0) {
                var expeditorCount = $(this).parent().find(".cuijiaoed").attr("data-count");
                plugin.alerttips({
                    info: "是否要再次催交此学生作业？",
                    sure: "立即催交",
                    cancle: "不催了",
                    sureCallback: function() {
                        if ($(_this).index() == 0) {
                            par = $(_this).parent();
                            API.reviewApi_expeditorHomework(homeworkid, studentid, function(data) {
                                var newCount = parseInt(expeditorCount) + 1;
                                var text = "已催" + newCount + "次";
                                par.find(".cuijiaoed").text(text);
                                par.find(".cuijiaoed").attr("data-count", newCount);
                                plugin.openMsg("催交提醒已发送给学生", 0)
                            })
                        }
                    }
                });
                return
            }
            plugin.alerttips({
                info: "是否要进行作业催交？",
                sure: "立即催交",
                cancle: "不催了",
                sureCallback: function() {
                    if ($(_this).index() == 0) {
                        par = $(_this).parent();
                        API.reviewApi_expeditorHomework(homeworkid, studentid, function(data) {
                            par.find(".cuijiao").addClass("cuijiaoed").text("已催1次").next(".cuijiaoAll").remove();
                            $(_this).attr("data-count", "1");
                            plugin.openMsg("催交提醒已发送给学生", 0)
                        })
                    } else {
                        par = $(_this).parents(".sortBody");
                        API.reviewApi_expeditorHomeworkAll(homeworkid, function(data) {
                            par.find(".cuijiao").addClass("cuijiaoed").text("已催交").next(".cuijiaoAll").remove();
                            plugin.openMsg("催交提醒已发送给学生", 0)
                        })
                    }
                    setCJlayer()
                }
            })
        });

        function setCJlayer() {
            if (localStorage.ctlayer) return;
            var info = '<div class="cuijiaotxt">催交信息已发送,催交作业提醒将会以<br /><span>微信推送</span>及<span>站内通知</span>两种方式发送给学生</div>';
            var cjlayer = layer.alert(info, { type: 1, skin: "layer-ext-ding03", title: false, closeBtn: false, area: ["400px"], btn: ["我知道了"], success: function() {}, shift: 7, moveType: 1 }, function(index) {
                localStorage.ctlayer = true;
                layer.close(index)
            })
        }
    }
});