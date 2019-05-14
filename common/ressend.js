const ressend = function(req, res, data) {
    var callback = req.query.callback;
    if (callback) {
        var resData = "try{" + callback + "(" + JSON.stringify(data) + ");}catch(e){};"
        res.type('text/javascript;charset=utf-8');
        res.send(resData);
    } else {
        res.send(data);
    }
}

module.exports = ressend;