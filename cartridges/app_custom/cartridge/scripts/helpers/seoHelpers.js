'use strict';

var base = module.superModule;
var URLUtils = require('dw/web/URLUtils');

base.getUrlFromProduct = function(product) {
    return URLUtils.url('PDPReact-Show', 'productID', product.ID).toString();
};

module.exports = base;
