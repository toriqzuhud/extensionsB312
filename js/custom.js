$(function() {
    var n = '<?xml version="1.0" encoding="UTF-8"?><request>',
        e = function(n) {
            return $.ajax({
                url: n,
                dataType: "xml",
                timeout: 5e3
            })
        },
        t = function(n, e, t) {
            return $.ajax({
                type: "POST",
                url: n,
                headers: {
                    __RequestVerificationToken: t
                },
                data: e,
                contentType: "text/xml",
                dataType: "xml",
                timeout: 5e3
            })
        },
        r = function() {
            return e("http://192.168.8.1/api/device/signal")
        },
        o = function() {
            return e("http://192.168.8.1/api/device/antenna_type")
        },
        a = function() {
            return e("http://192.168.8.1/api/webserver/token")
        },
        i = function(n, e) {
            return $(n).find(e).first().text()
        },
        s = function(n, e) {
            var t = 0;
            switch (n) {
                case "rsrp":
                    t = d(e);
                    break;
                case "rsrq":
                    t = f(e);
                    break;
                case "sinr":
                    t = p(e)
            }
            return t
        },
        c = function(n, e, t, r) {
            var o = 100 * (n - e) / (t - e);
            return o > 100 ? void 0 !== r ? (o = 100 * (r - n) / (r - t)) < 0 && (o = 0) : o = 100 : o < 0 && (o = 0), o
        },
        u = function(n, e) {
            e = e.replace(/[<=>]/g, "");
            var t = parseInt(e),
                r = 0;
            switch (n) {
                case "rsrp":
                    r = c(t, -120, -75);
                    break;
                case "rsrq":
                    r = c(t, -16, 0);
                    break;
                case "sinr":
                    r = c(t, 0, 20)
            }
            return r
        },
        l = function() {
            return e("http://192.168.8.1/api/user/heartbeat")
        },
        d = function(n) {
            var e = parseInt(n);
            return e >= -84 ? 3 : e >= -94 && e <= -85 ? 2 : e >= -111 && e <= -95 ? 1 : 0
        },
        f = function(n) {
            var e = parseInt(n);
            return e >= -4 ? 3 : e >= -9 && e <= -5 ? 2 : e >= -13 && e <= -10 ? 1 : 0
        },
        p = function(n) {
            var e = parseInt(n);
            return e >= 13 ? 3 : e >= 10 && e <= 12 ? 2 : e >= 7 && e <= 9 ? 1 : 0
        };

    function h() {
        r().success(function(n) {
            var e = i(n, "band"),
                t = i(n, "dlbandwidth"),
                r = i(n, "pci"),
                o = i(n, "cell_id"),
                a = i(n, "rsrq"),
                s = i(n, "rsrp"),
                c = i(n, "sinr");
            $("#band").text(e), $("#bandwidth").text(t), $("#pci").text(r), $("#cellid").text(o), v("rsrp", s), v("rsrq", a), v("sinr", c)
        }).error(function() {
            console.log("Error when updating status.")
        })
    }

    function b() {
        o().success(function(n) {
            var e = 0 == i(n, "antennatype") ? "Internal" : "External";
            $("#antenna").text(e)
        }).error(function() {
            console.log("Error when fetching antenna status.")
        })
    }

    function g() {
        l().success(function(n) {
            var e = i(n, "userlevel"),
                t = $("#connection #router"),
                r = $("#connection  #user");
            t.attr("class", "online"), t.children("title").html("Connected"), e > 0 ? (r.attr("class", "online"), r.children("title").html("Logged-in")) : (r.attr("class", "offline"), r.children("title").html("Logged-out"))
        }).error(function() {
            console.log("Not Connected.")
        })
    }

    function v(n, e) {
        var t, r = "#" + n,
            o = "",
            a = u(n, e) + "%";
        switch (s(n, e)) {
            case 3:
                o = "Excellent";
                break;
            case 2:
                o = "Good";
                break;
            case 1:
                o = "Average";
                break;
            case 0:
                o = "Poor";
                break;
            default:
                o = "Unknown", a = "0px"
        }
        t = "bar-" + o.toLowerCase(), $(r + " .progress-bar").removeClass(function(n, e) {
            return (e.match(/(^|\s)bar-\S+/g) || []).join(" ")
        }), $(r + " .progress-bar").width(a), $(r + " .progress-bar").addClass(t), $(r + " .txt-rate").text(o), $(r + " .grade").text(e)
    }
    $("#form-band button").click(function(e) {
        e.preventDefault();
        var r = $(this),
            o = $("#form-band button"),
            i = r.val();
        o.prop("disabled", !0), $("#form-band .loader").show(), a().success(function(e) {
            var r = $(e).find("token").first().text();
            (function(e, r) {
                return t("http://192.168.8.1/api/net/net-mode", n + "<NetworkMode>03</NetworkMode><NetworkBand>100000000C680380</NetworkBand><LTEBand>" + e + "</LTEBand></request>", r)
            })(i, r).success(function(n) {
                console.log("Band updated")
            }).error(function() {
                console.log("Error when updating band.")
            }).done(function() {
                $("#form-band .loader").hide(), o.prop("disabled", !1), h()
            })
        }).error(function() {
            console.log("Error when getting token.")
        })
    }), $("#form-antenna button").click(function(e) {
        e.preventDefault();
        var r = $(this),
            o = $("#form-antenna button"),
            i = r.val();
        o.prop("disabled", !0), $("#form-antenna .loader").show(), a().success(function(e) {
            var r = $(e).find("token").first().text();
            (function(e, r) {
                return t("http://192.168.8.1/api/device/antenna_set_type", n + "<antennasettype>" + e + "</antennasettype></request>", r)
            })(i, r).success(function(n) {
                $("#form-antenna .loader").hide(), o.prop("disabled", !1), b()
            }).error(function() {
                console.log("Error when updating antenna.")
            })
        }).error(function() {
            console.log("Error when getting token.")
        })
    }), b(), h(), g(), setInterval(function() {
        h(), g()
    }, 1e4)
});