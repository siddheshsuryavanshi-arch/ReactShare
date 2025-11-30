'use strict';

var server = require('server');
server.extend(module.superModule);

var Logger = require('dw/system/Logger');

/**
 * PDP Override — When native Product-Show is called,
 * redirect user to React-based PDP.
 */
server.append('Show', function (req, res, next) {
    try {
        var pid = req.querystring.pid;
        Logger.info('[ReactPDP] Product-Show hit for product: {0}', pid);

        if (!pid) {
            Logger.warn('[ReactPDP] Missing pid parameter');
            return next();
        }

        // Redirect into our custom PDP route
        res.redirect('PDPReact-Show', 'productID', pid);
        return next();
    } catch (e) {
        Logger.error('[ReactPDP] Error in override: {0}', e.message);
        return next();
    }
});

module.exports = server.exports();
