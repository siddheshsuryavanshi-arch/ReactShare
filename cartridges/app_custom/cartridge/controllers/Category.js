'use strict';


var server = require('server');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');


server.get('Products', function (req, res, next) {
    
    var categoryID = req.querystring.categoryID;

    if (!categoryID) {
        res.json({ error: true, message: 'categoryID is required' });
        return next();
    }

   
    var category = CatalogMgr.getCategory(categoryID);
    
    if (!category) {
        res.json({ error: true, message: 'Category not found' });
        return next();
    }

  
    var productIterator = category.getProducts().iterator();
    var products = [];

    while (productIterator.hasNext()) {
        var product = productIterator.next();

        
        var productObj = ProductMgr.getProduct(product.ID);

        products.push({
            id: productObj.ID,
            name: productObj.name,
            price: productObj.priceModel.price.value
        });
    }

    
    res.json({
        category: category.displayName || categoryID,
        category_id: categoryID,
        totalProducts: products.length,
        products: products
    });

    return next();
});

module.exports = server.exports();
