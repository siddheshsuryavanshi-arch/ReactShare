'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var pid = req.querystring.productID;

    if (!pid) {
        res.setStatusCode(400);
        res.print('Missing productID');
        return next();
    }

    res.render('custom/pdp/reactPDP', {
        productID: pid
    });

    return next();
});

module.exports = server.exports();
