'use strict';

var server = require('server');
server.extend(module.superModule);
var Logger = require('dw/system/Logger');

server.replace('Show', function (req, res, next) {
    var pid = req.querystring.pid;

    Logger.info('[ReactPDP] Redirect from Product-Show to PDPReact: {0}', pid);

    if (!pid) {
        Logger.warn('[ReactPDP] Missing PID param');
        res.setStatusCode(400);
        res.print('Product ID missing');
        return next();
    }

    res.redirect('PDPReact-Show', 'productID', pid);

    return next();
});

module.exports = server.exports();
