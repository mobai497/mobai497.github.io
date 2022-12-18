var GetAreaUrl;
var ReportIsAppGPS;//是否开启第三方app定位
$(function () {
    ReportIsGPS = $("#ReportIsGPS").val() == "1";
    GetAreaUrl = $("#GetAreaUrl").val()
    Index.init(); 
    if (ReportIsGPS == false) { 
        var geolocation = new BMap.Geolocation();
        // 开启SDK辅助定位
        geolocation.enableSDKLocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                $.ajax({
                    url: 'https://api.map.baidu.com/reverse_geocoding/v3/?ak=Wh4HAAtaSKPMYpyyOqpxR04BwyTsc5SP&output=json&location=' + r.point.lat + ',' + r.point.lng,
                    crossDomain: true,
                    jsonp: 'callback',
                    type: 'POST',
                    dataType: 'jsonp',
                    success: function (data) {
                        var cityValue;
                        var proValue;
                        var cityID = data.result.addressComponent.adcode;
                        if (isNaN(cityID)) {//判断是否国外  是
                            proValue = "990000";
                            cityValue = "990100";
                        } else {
                            proValue = cityID.substring(2, 0) + "0000";
                            cityValue = cityID.substring(4, 0) + "00";
                        }
                        $("select[name='Province']").val(proValue);
                        $("select[name='City']").attr("data-defaultvalue", cityValue);
                        BindCurrentLocation();
                    },
                    error: function () {
                        BindCurrentLocation();
                    }
                });
            }
            else {
                BindCurrentLocation();
            }
        });
    }
    //家庭所在地址
    ProvinceChange($("select[name='FaProvince']"), true);
    //清空默认值（家庭住址）
    $("select[name='FaProvince']").removeAttr("data-defaultvalue")
    $("select[name='FaCity']").removeAttr("data-defaultvalue")
    $("select[name='FaCounty']").removeAttr("data-defaultvalue")
});

//绑定当前位置信息
function BindCurrentLocation() {
    $("select[name='County']").removeAttr("data-defaultvalue")
    ProvinceChange($("select[name='Province']"), true);
    $("select[name='Province']").removeAttr("data-defaultvalue")
    $("select[name='City']").removeAttr("data-defaultvalue")
}

var Index = {
    init: function () {
        Index.verifyRepeatability();
        Index.laydate();
    },
    verifyRepeatability: function () {
        options = {
            Newrule: function (t, vtype, text, value) {
                var validaresult = true;
                return validaresult;
            },
            callback: function () {
                $('.save_form').attr('disabled', "disabled");
                $(".save_form").text("提交中...");
                HandleFormData();
                $("#form1").submit();
                return false;
            }
        };
        $("#form1").validation(options);

    },
    laydate: function () {
        var wd = $(window).width();
        if (wd > 1080) {
            $(".laydate").attr("type", "text")
            lay('.laydate').each(function () {
                laydate.render({
                    elem: this,
                    trigger: 'click',
                    format: 'yyyy-MM-dd',
                    type: 'date',
                });
            });
        }
    }
}

////判定是否显示隐藏域input 
function ChangeInputBoxStatus(elm) {
    var firstElm = $(elm)[0];
    if (firstElm) {
        if (firstElm.checked) {
            if (firstElm.type == "radio") {
                $(elm).parents(".radio_list").children(".next_inputbox").hide()
            }
            $(elm).parent(".item").next(".next_inputbox").show();
        }
        else {
            $(elm).parent(".item").next(".next_inputbox").hide();
            $(elm).parent(".item").next(".next_inputbox").find("input[type=text]").val("")
        }
        if (firstElm.type == "radio") {
            $(elm).parents(".th_right").find("input[type='text']").val("")
        }
    }
}



function ProvinceChange(elm, bindCity) {
    $(elm).nextAll("select")
    var City = $(elm).nextAll("select")[0];
    var County = $(elm).nextAll("select")[1];

    $(City).empty();
    $(County).empty();
    var Code = $(elm).val();
    if (!Code) {
        return;
    }
    var data = { pcode: Code, level: "2" }
    $.ajax({
        type: "get",
        datatype: "JSON",
        data: data,
        url: GetAreaUrl,
        async: false,
        success: function (json) {
            var defaultValue = $(City).attr("data-defaultValue");
            $(City).append("<option value=''></option>");
            for (var i = 0; i < json.length; i++) {
                if (defaultValue == json[i].AreaCode) {
                    $(City).append("<option  selected='selected' value='" + json[i].AreaCode + "'>" + json[i].AreaName + "</option>");
                }
                else {
                    $(City).append("<option value='" + json[i].AreaCode + "'>" + json[i].AreaName + "</option>");
                }
            }
            if (json.length == 0) {
                $(City).removeClass("validate");
                $(County).removeClass("validate");
            } else {
                if (!$(City).hasClass("validate")) {
                    $(City).addClass("validate");
                }
            }
            if (bindCity) {
                CityChange(City);
            }
        },
        error: function (res) {
            layer.msg(res.responseJSON.msg || "操作失败，请与管理员联系", { time: 2000, icon: 2 });
        }
    });
}
function CityChange(elm) {
    var County = $(elm).nextAll("select")[0];
    $(County).empty();
    var Code = $(elm).val();
    if (!Code) {
        return;
    }

    var data = { pcode: Code, level: "3" }
    $.ajax({
        type: "get",
        datatype: "JSON",
        data: data,
        url: GetAreaUrl,
        async: false,
        success: function (json) {
            var defaultValue = $(County).attr("data-defaultValue");
            $(County).append("<option value=''></option>");
            for (var i = 0; i < json.length; i++) {
                if (defaultValue == json[i].AreaCode) {
                    $(County).append("<option  selected='selected' value='" + json[i].AreaCode + "'>" + json[i].AreaName + "</option>");
                }
                else {
                    $(County).append("<option value='" + json[i].AreaCode + "'>" + json[i].AreaName + "</option>");
                }
            }
            if (json.length == 0) {
                $(County).removeClass("validate");
            } else {
                if (!$(County).hasClass("validate")) {
                    $(County).addClass("validate");
                }
            }
        },
        error: function (res) {
            layer.msg(res.responseJSON.msg || "操作失败，请与管理员联系", { time: 2000, icon: 2 });
        }
    });
}

function CKTY() {
    if (document.getElementById("ckCLS").checked) {
        $('.save_form').removeAttr('disabled');
        $('.save_form').removeClass('btnDisabled');
    }
    else {
        $('.save_form').attr('disabled', "disabled");
        $('.save_form').addClass('btnDisabled');
    }
}

function HandleFormData() {
    $("#FaProvinceName")="福建省";
    $("#FaCityName")="厦门市";
    $("#FaCountyName")="集美区";
}