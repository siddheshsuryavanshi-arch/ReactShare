'use strict';

var server = require('server');
server.extend(module.superModule);
var Logger = require('dw/system/Logger');

server.replace('Show', function (req, res, next) {
    try {
        var pid = req.querystring.pid;
        if (!pid) {
            res.setStatusCode(400);
            res.print('Product ID missing');
            return next();
        }

        Logger.info('[ReactPDP] Rendering React PDP for PID: {0}', pid);

        res.render('custom/pdp/reactPDP', {
            productID: pid
        });
    } catch (e) {
        Logger.error('ReactPDP error: {0}', e.message);
        res.setStatusCode(500);
        res.print('PDP React failed');
    }

    return next();
});

module.exports = server.exports();
