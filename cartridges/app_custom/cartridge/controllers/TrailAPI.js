'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');

server.get('Details', function (req, res, next) {

    var productID = req.querystring.pid || req.querystring.productID;
    var product = ProductMgr.getProduct(productID);

    if (!product) {
        res.json({
            success: false,
            message: 'Product Not Found'
        });
        return next();
    }

    // ---------------- SYSTEM ATTRIBUTES ----------------
    var systemAttrs = {
        id: product.ID,
        name: product.name,
        brand: product.brand,
        online: product.online,
        taxClassID: product.taxClassID,
        searchable: product.searchable
    };

    // ---------------- CUSTOM ATTRIBUTES ----------------
    var customAttrs = {};
    Object.keys(product.custom).forEach(function (key) {
        var value = product.custom[key];
        customAttrs[key] = value ? value.toString() : null;
    });

    // ---------------- RESPONSE ----------------
    res.json({
        success: true,
        productID: product.ID,
        name: product.name,
        price: product.priceModel && product.priceModel.price
            ? product.priceModel.price.value
            : null,
        stock: product.availabilityModel.inventoryRecord
            ? product.availabilityModel.inventoryRecord.ATS.value
            : null,
        image: product.getImage('large', 0)
            ? product.getImage('large', 0).getAbsURL().toString()
            : null,

        attributes: {
            system: systemAttrs,
            custom: customAttrs
        }
    });

    return next();
});

module.exports = server.exports();
