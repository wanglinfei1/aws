;
(function(factory) {

    var isWindow = (typeof window !== 'undefined' ? true : false);
    var global = (isWindow ? window : this);

    var instance = function() { return factory(isWindow, global); };

    // AMD / RequireJS
    if (typeof define !== 'undefined' && define.amd) {
        define('IDValidator', [], instance);
    }
    // CMD / Seajs 
    else if (typeof define === "function" && define.cmd) {
        define(function(require, exports, module) {
            module.exports = factory(isWindow, global);
        });
    }
    // CommonJS
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(isWindow, global);
    } else {
        global.IDValidator = factory(isWindow, global);
    }

})(function(isWindow, global) {
    var vcity = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外"
    };
    var vcity_arr = (function() {
        var arr = [];
        for (var key in vcity) {
            arr.push(key)
        }
        return arr;
    })();
    var sex_txt, area_txt, birthday_txt;
    var _IDValidator = function(obj, area_json, leng) {
        area_json = area_json || window._AREAJSON_;
        // 生成一个随机身份证号
        if (obj == 'makeID') {
            var len = typeof(area_json) === 'number' && area_json == 15 ? 15 : (leng == 15 ? 15 : 18);
            return makeID(len, area_json);
        }

        //校验长度，类型
        if (isCardNo(obj) === false) {
            return false;
        }
        //检查省份
        if (checkArea(obj, area_json) === false) {
            return false;
        }
        //校验生日
        if (checkBirthday(obj) === false) {
            return false;
        }
        //检验位的检测
        if (checkParity(obj) === false) {
            return false;
        }
        //[sex_txt, area_txt, birthday_txt]
        return {
            "sex": sex_txt,
            "area": area_txt,
            "birthday": birthday_txt
        };
    };
    //检查号码是否符合规范，包括长度，类型
    var isCardNo = function(obj) {
        //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
        var reg = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/;
        if (reg.test(obj) === false) {
            return false;
        }
        return true;
    };
    //取身份证前两位,校验省份
    var checkArea = function(obj, area_json) {
        var area = obj.substr(0, 2);
        if (vcity[area] == undefined) {
            return false;
        } else {
            area_txt = vcity[area]
        }
        if (!!area_json && area != 71 && area != 81 && area != 82 && area != 91) {
            var _area_ = obj.substr(0, 6);
            if (area_json[_area_] == undefined) {
                return false;
            } else {
                area_txt = area_json[_area_]
            }
        }
        return true;
    };
    //检查生日是否正确
    var checkBirthday = function(obj) {
        var len = obj.length;
        //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
        if (len == '15') {
            var re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
            var arr_data = obj.match(re_fifteen);
            var year = arr_data[2];
            var month = arr_data[3];
            var day = arr_data[4];
            var birthday = new Date('19' + year + '/' + month + '/' + day);
            return verifyBirthday('19' + year, month, day, birthday);
        }
        //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
        if (len == '18') {
            var re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
            var arr_data = obj.match(re_eighteen);
            var year = arr_data[2];
            var month = arr_data[3];
            var day = arr_data[4];
            var birthday = new Date(year + '/' + month + '/' + day);
            return verifyBirthday(year, month, day, birthday);
        }
        return false;
    };
    //校验日期
    var verifyBirthday = function(year, month, day, birthday) {
        var now = new Date();
        var now_year = now.getFullYear();
        birthday_txt = year + '年' + month + '月' + day + '日'
            //年月日是否合理
        if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
            //判断年份的范围（3岁到100岁之间)
            var time = now_year - year;
            if (time >= 0 && time <= 130) {
                return true;
            }
            return false;
        }
        return false;
    };
    //校验性别
    var verifySex = function(obj) {
        var sex_num = obj.substr(16, 1);
        if (sex_num % 2 == 1) {
            sex_txt = '男'
            return true;
        } else if (sex_num % 2 == 0) {
            sex_txt = '女'
            return true;
        }
        return false;
    };
    // 获取校验位
    var valnumFn = function(obj) {
        var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
        var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
        var cardTemp = 0,
            i, valnum;
        for (i = 0; i < 17; i++) {
            cardTemp += obj.substr(i, 1) * arrInt[i];
        }
        valnum = arrCh[cardTemp % 11];
        return valnum;
    };
    //校验位的检测
    var checkParity = function(obj) {
        //15位转18位
        obj = changeFivteenToEighteen(obj);
        var len = obj.length;
        if (len == '18' && verifySex(obj)) {
            var valnum = valnumFn(obj);
            if (valnum == obj.substr(17, 1).toUpperCase()) {
                return true;
            }
            return false;
        }
        return false;
    };
    //15位转18位身份证号
    var changeFivteenToEighteen = function(obj) {
        if (obj.length == '15') {
            obj = obj.substr(0, 6) + '19' + obj.substr(6, obj.length - 6);
            var valnum = valnumFn(obj);
            obj += valnum;
            return obj;
        }
        return obj;
    };
    //随机整数
    var rand = function(max, min) {
        min = min || 1;
        return Math.round(Math.random() * (max - min)) + min;
    };
    //数字补位
    var str_pad = function(str, len, chr, right) {
        str = str.toString();
        len = len || 2;
        chr = chr || '0';
        right = right || false;
        if (str.length >= len) {
            return str;
        } else {
            for (var i = 0, j = len - str.length; i < j; i++) {
                if (right) {
                    str = str + chr;
                } else {
                    str = chr + str;
                }
            }
            return str;
        }
    };
    var makeID = function(len, area_json) {
        var addrFn = function() {
            var prov = vcity_arr[rand(vcity_arr.length, 0) || '11'];
            var addr = null;
            if (area_json && typeof(area_json) == 'object' && !Array.isArray(area_json)) {
                var loopCnt = 0;
                while (addr === null) {
                    //防止死循环
                    if (loopCnt > 40) {
                        addr = prov + '0101';
                        break;
                    }
                    loopCnt++;
                    var city = str_pad(rand(10), 2, '0');
                    var area = str_pad(rand(20), 2, '0');
                    var addrTest = [prov, city, area].join('');
                    if (area_json[addrTest]) {
                        addr = addrTest;
                        break;
                    }
                }
            } else if (area_json && typeof(area_json) == 'object' && Array.isArray(area_json)) {
                addr = area_json[rand(area_json.length, 0) || '110101'];;
            } else {
                addr = prov + '0101'
            }
            return addr;
        }
        var idnumFn = function() {
            //出生年
            var yr = str_pad(rand(99, 50), 2, '0');
            var mo = str_pad(rand(12, 1), 2, '0');
            var da = str_pad(rand(28, 1), 2, '0');
            if (len == 15) {
                return addrFn() + yr + mo + da + str_pad(rand(999, 1), 3, '1');
            } else {
                var fullYear = new Date().getFullYear().toString().substr(2);
                var yr2 = str_pad(rand(parseInt(fullYear) - 1, 0), 2, '0');
                var yrr = Math.random() > 0.5 ? '19' + yr : '20' + yr2;
                var obj = addrFn() + yrr + mo + da + str_pad(rand(999, 1), 3, '1');
                var valnum = valnumFn(obj)
                obj += valnum;
                return obj;
            }
        }
        return idnumFn();
    };
    return _IDValidator;

});