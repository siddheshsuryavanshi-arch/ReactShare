'use strict';

var server = require('server');

server.get('Show', function(req, res, next) {
    res.render('pdp/reactPDP');
    return next();
});

module.exports = server.exports();
