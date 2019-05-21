const ressend = function(req, res, data) {
    try {
        data = data || {};
        // console.log(req.headers)
        var callback = req.query.callback;
        if (callback) {
            var resData = "try{" + callback + "(" + JSON.stringify(data) + ");}catch(e){};"
            res.type('text/javascript;charset=utf-8');
            res.send(resData);
        } else {
            res.send(data);
        }
    } catch (e) {
        res.send(e);
    }
}

module.exports = ressend;