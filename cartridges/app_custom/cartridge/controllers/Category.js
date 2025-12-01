'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');

server.get('ProductDetails', function (req, res, next) {
    var pid = req.querystring.pid;

    if (!pid) {
        res.json({ error: true, message: 'Missing product ID' });
        return next();
    }

    var product = ProductMgr.getProduct(pid);

    if (!product) {
        res.json({ error: true, message: 'Product not found' });
        return next();
    }

    var priceModel = product.getPriceModel();
    var imageObj = product.getImage('large', 0);

    res.json({
        id: product.ID,
        name: product.name,
        price: priceModel && priceModel.price ? priceModel.price.value : null,
        image: imageObj ? imageObj.URL.toString() : null
    });

    return next();
});

module.exports = server.exports();
