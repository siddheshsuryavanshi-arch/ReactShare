/*
'use strict';
//server → creates API routes.
//CatalogMgr → used to get category data from Business Manager.
//ProductMgr → used to get full product details.

var server = require('server');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');

// ---------------- PRODUCT DETAIL METHOD (PDP) ----------------
//This function takes a productID and returns JSON 
function getProductDetails(productID) {
    //Fetch the product
    var product = ProductMgr.getProduct(productID);

    if (!product) {
        return null;
    }

    // Get Product Image
    var image = product.getImage('small', 0);
    var imageURL = image ? image.getAbsURL().toString() : null;

    return {
        id: product.ID,
        name: product.name,
        price: product.priceModel.price.value,
        image: imageURL
    };
}

// ---------------- PRODUCT LIST METHOD (PLP) ----------------
//Product List API (PLP Endpoint)
server.get('Products', function (req, res, next) {
    
    var categoryID = req.querystring.categoryID;

    if (!categoryID) {
        res.json({ error: true, message: 'categoryID is required' });
        return next();
    }
    //Read the categoryID from the URL.
    var category = CatalogMgr.getCategory(categoryID);

    if (!category) {
        res.json({ error: true, message: 'Category not found' });
        return next();
    }
    //Loop through all assigned products
    var productIterator = category.getProducts().iterator();
    var products = [];

    while (productIterator.hasNext()) {
        var product = productIterator.next();
        
        // Reuse ProductDetail method
        var productData = getProductDetails(product.ID);

        if (productData) {
            products.push(productData);
        }
    }

    res.json({
        category: category.displayName || categoryID,
        category_id: categoryID,
        totalProducts: products.length,
        products: products
    });

    return next();
});


// ---------------- PRODUCT DETAIL ROUTE (PDP) ----------------
server.get('ProductDetails', function (req, res, next) {
    var productID = req.querystring.productID;

    if (!productID) {
        res.json({ error: true, message: 'productID is required' });
        return next();
    }

    var productData = getProductDetails(productID);

    if (!productData) {
        res.json({ error: true, message: 'Product not found' });
        return next();
    }

    res.json(productData);
    return next();
});

module.exports = server.exports();

*/
