'use strict';

var server = require('server');
var SearchMgr = require('dw/catalog/SearchMgr');

server.get('Products', function (req, res, next) {
    var categoryID = req.querystring.categoryID;

    if (!categoryID) {
        res.json({ error: true, message: 'categoryID required' });
        return next();
    }

    var searchModel = SearchMgr.getProductSearchModel();
    searchModel.setCategoryID(categoryID);
    searchModel.search();

    var hits = searchModel.getProductSearchHits();
    var products = [];

    while (hits.hasNext()) {
        var product = hits.next().getProduct();
        products.push({
            id: product.ID,
            name: product.name,
            price: product.priceModel.price.value
        });
    }

    res.json({
        category: categoryID,
        count: products.length,
        products: products
    });

    return next();
});

module.exports = server.exports();
