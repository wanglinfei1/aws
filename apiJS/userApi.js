var dbHandler = require('./../common/dbhandler');
var express = require('express');
var router = express.Router();
var UUID = require('./../common/uuid-v4');
var path = require('path');
var tabName = 'user';

//用户注册
router.post('/userApi/register', (req, res) => {
  if (!req.body.mobile) {
    res.send({ code: 2011, data: null, msg: '手机号码错误' });
    return;
  }
  function savAccount() {
    var newAccount = {
      id: UUID(),
      time: new Date(),
      name: req.body.name,
      mobile: req.body.mobile,
      pass: req.body.pass
    };
    dbHandler('add', tabName, newAccount).then((data) => {
      res.send({ code: 0, data: null, msg: '你的信息注册成功' })
    })
  }
  dbHandler('find', tabName, { mobile: req.body.mobile }).then((data) => {
    if (data.length) {
      res.send({ code: 2011, data: null, msg: '你的信息已存在，请去登录' })
    } else {
      savAccount()
    }
  });
});
//用户快速注册
router.post('/userApi/fastRegister', (req, res) => {
  if (!req.body.mobile) {
    res.send({ code: 2011, data: null, msg: '手机号码错误' });
    return;
  }
  function savAccount() {
    var newAccount = {
      id: UUID(),
      time: new Date(),
      name: req.body.name,
      mobile: req.body.mobile,
      pass: '123456'
    };
    dbHandler('add', tabName, newAccount).then((data) => {
      res.send({ code: 0, data: null, msg: '你的信息注册成功' })
    })
  }
  dbHandler('find', tabName, { mobile: req.body.mobile }).then((data) => {
    if (data.length) {
      res.send({ code: 2011, data: null, msg: '你的信息已存在，请去登录' })
    } else {
      savAccount()
    }
  });
});
//用户登录
router.post('/userApi/login', (req, res) => {
  var findLogin = function (obj, callback) {
    dbHandler('find', tabName, obj).then((data) => {
      callback && callback(data);
    });
  }
  findLogin({ mobile: req.body.mobile }, function (data) {
    if (!data.length) {
      res.send({ code: 2012, data: null, msg: '你信息不存在请去注册' })
    } else {
      findLogin({ mobile: req.body.mobile, pass: req.body.pass }, function (data) {
        if (!data.length) {
          res.send({ code: 2014, data: null, msg: '用户名或密码错误登录失败' })
        } else {
          res.send({ code: 0, data: data[0], msg: '登录成功' })
        }
      })
    }
  })
});
//删除用户
router.post('/userApi/remove', (req, res) => {
  dbHandler('delete', tabName, { id: req.body.id }).then(data => {
    res.send({ code: 0, data: null, msg: '删除成功' })
  });
});
//修改密码
router.post('/userApi/update', (req, res) => {
  dbHandler('update', tabName, [{ id: req.body.id, mobile: req.body.mobile }, { $set: { pass: req.body.pass } }]).then((data) => {
    if (data.nModified) {
      res.send({ code: 0, data: data, msg: '更新成功' })
    } else {
      res.send({ code: 2018, data: data, msg: '你的密码和原密码一至' })
    }
  });
});
/*分页查询用户列表*/
router.post('/userApi/list', (req, res) => {
  var name = req.body.name;
  console.log(req.body)
  var queryList;
  if (name) {
    queryList = { name: name }
  } else {
    queryList = {}
  }
  var sort = req.body.sort || 1;
  var limit = parseInt(req.body.pageSize || 10); //页数
  var skip = (parseInt(req.body.pageNum || 1) - 1) * limit; //页码
  var json = {};
  if (sort) {
    json['time'] = sort;
  }
  var total
  dbHandler('find', tabName, queryList).then(data => {
    total = data.length;
    dbHandler('findList', tabName, [queryList, skip, limit, json]).then(data => {
      res.send({ code: 0, data: data, msg: '请求成功', total: total })
    })
  });
});
module.exports = router;
