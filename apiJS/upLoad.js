const COS = require('cos-nodejs-sdk-v5');
var express = require('express');
var router = express.Router();
const request = require('request');
const formidable = require("formidable");
var config = require('../common/config.js');
const fs = require('fs');
config = config.osconfig;
const cos = new COS({
    SecretId: config.SecretId,
    SecretKey: config.SecretKey,
});
const checkFile = (key, cb) => {
    cos.headObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key //查询key
    }, cb);
};
const osPut = (files, query, key, res, buffer, resArr) => {
    cos.putObject({
        Bucket: config.Bucket,
        Region: config.Region,
        Key: key,
        'ContentLength': files.size,
        Body: buffer,
    }, function(err, data) {
        fs.unlink(files.path)
        if (err) {
            if (resArr.length < query.lg - 1) {
                resArr.push(err)
            } else {
                resArr.push(err)
                res.send(resArr)
            }
        } else {
            if (data.statusCode === 200) {
                data.url = config.osHost + key;
                if (resArr.length < query.lg - 1) {
                    resArr.push(data)
                } else {
                    resArr.push(data)
                    res.send(resArr)
                }
            } else {
                if (resArr.length < query.lg - 1) {
                    resArr.push(data)
                } else {
                    resArr.push(data)
                    res.send(resArr)
                }
            }
        }
    })
}
var upLoad = function(files, query, res, buffer, resArr) {
    var path = query.path || config.path;
    if ((path.indexOf('http://') > -1 || path.indexOf('https://') > -1)) {
        path = path.replace(/http[s]?:\/\/ftp\.wzytop\.top/g, '') || '/'
    }
    var replace = query.replace || '';
    var key = path + files.name
    if (replace && replace == 'true') {
        osPut(files, query, key, res, buffer, resArr)
    } else {
        checkFile(key, function(err, data) {
            if (err) {
                if (err.statusCode == 404) {
                    osPut(files, query, key, res, buffer, resArr)
                } else {
                    fs.unlink(files.path)
                    if (resArr.length < query.lg - 1) {
                        resArr.push(err)
                    } else {
                        resArr.push(err)
                        res.send(resArr)
                    }
                }
            } else {
                if (data.statusCode == 200) {
                    data.msg = '文件已存在'
                    data.url = config.osHost + key;
                    fs.unlink(files.path)
                    if (resArr.length < query.lg - 1) {
                        resArr.push(data)
                    } else {
                        resArr.push(data)
                        res.send(resArr)
                    }
                } else {
                    osPut(files, query, key, res, buffer, resArr);
                }
            }
        })
    }
};
router.post('/upload', function(req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = "./dir";
    form.keepExtensions = true;
    var resArr = [];
    var filesArr = [];
    var query = req.query;
    form.parse(req, function(err, fields, files) {
        if (!query['lg']) {
            for (var k in files) {
                if (files[k]) {
                    filesArr.push(files[k])
                }
            }
            query['lg'] = filesArr.length;
        }
        for (var k in files) {
            if (files[k]) {
                try {
                    var buffer = fs.createReadStream(files[k].path)
                    upLoad(files[k], query, res, buffer, resArr)
                } catch (err) {
                    console.log(err)
                }
            }
        }
    });
});
module.exports = router;