'use strict';

var server = require('server');
server.extend(module.superModule);
var Logger = require('dw/system/Logger');

server.replace('Show', function (req, res, next) {
    var pid = req.querystring.pid;

    Logger.info('[ReactPDP] Rendering React PDP for PID: {0}', pid);

    if (!pid) {
        res.setStatusCode(400);
        res.print('Product ID missing');
        return next();
    }

    // Render React template instead of native PDP
    res.render('custom/pdp/reactPDP', {
        productID: pid
    });

    return next();
});

module.exports = server.exports();
