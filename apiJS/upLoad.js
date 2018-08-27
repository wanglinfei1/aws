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
var upLoad=function (files,req,res,buffer){
  console.log(req.query)
  var key = config.path+'/'+files.file.name
  cos.putObject({
    Bucket: config.Bucket,
    Region: config.Region,
    Key: key,
    'ContentLength':files.file.size,
    Body: buffer,
  }, function(err, data) {
    fs.unlink(files.file.path)
    if (err) {
      res.send(err)
    } else {
      res.send(data)
    }
  })
};
router.post('/upload',function (req, res) {
  var form = new formidable.IncomingForm();
  form.uploadDir = "./dir";
  form.keepExtensions = true;
  form.parse(req, function(err, fields, files) {
    var buffer = fs.createReadStream(files.file.path)
    upLoad(files,req,res,buffer)
  });
});
module.exports = router;
