'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');

server.get('GetCustomAttribute', function (req, res, next) {
    var pid = req.querystring.pid
 // Product ID passed as query param
    var product = ProductMgr.getProduct(pid);

    if (!product) {
        res.json({
            error: true,
            message: 'Product not found'
        });
        return next();
    }

    // Fetch custom attribute (example: custom.myCustomAttribute)
    var customAttributeValue = product.custom.new_custom_attribute;

    res.json({
        error: false,
        productID: product.ID,
        customAttribute: customAttributeValue
    });

    return next();
});

module.exports = server.exports();
