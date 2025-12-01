'use strict';

var server = require('server');

/**
 * Custom React PDP view renderer
 */
server.get('Show', function (req, res, next) {
    var pid = req.querystring.productID;

    if (!pid) {
        res.setStatusCode(400);
        res.print('Missing required productID parameter');
        return next();
    }

    res.render('custom/pdp/reactPDP', {
        productID: pid
    });

    return next();
});

module.exports = server.exports();
