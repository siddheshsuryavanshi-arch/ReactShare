'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var Logger = require('dw/system/Logger');


/**
 * Extract variant attributes for each variant
 */
function extractVariantInfo(variant) {
    var result = {
        id: variant.ID,
        name: variant.name,
        //sku: variant.custom && variant.custom.sku ? variant.custom.sku : null,
        price: variant.priceModel && variant.priceModel.price ? variant.priceModel.price.value : null,
        attributes: {}
    };

    try {
        var variationModel = variant.getVariationModel();
        var variationAttributes = variationModel.getProductVariationAttributes();
        
        variationAttributes.toArray().forEach(function (attr) {
            var val = variationModel.getVariationValue(variant, attr);
            result.attributes[attr.getID()] = val ? (val.displayValue || val.value) : null;
        });

    } catch (e) {
        Logger.error("Error reading variant attributes: " + e);
    }

    return result;
}


/**
 * GET endpoint → /ProductVariantsAPI-GetVariants?pid=MASTERID
 */
server.get('GetVariants', function (req, res, next) {

    var productID = req.querystring.pid;

    if (!productID) {
        res.json({ error: true, message: "Parameter 'pid' is required" });
        return next();
    }

    var product = ProductMgr.getProduct(productID);

    if (!product) {
        res.json({ error: true, message: "Product not found" });
        return next();
    }

    // Must be a master product to have variants
    if (!product.isMaster()) {
        res.json({
            productID: product.ID,
            message: "This product is not a master product; so it has no variants."
        });
        return next();
    }

    var variationModel = product.getVariationModel();
    var variants = variationModel.getVariants().toArray();

    var response = {
        productID: product.ID,
        totalVariants: variants.length,
        variants: variants.map(extractVariantInfo)
    };

    res.json(response);
    return next();
});


module.exports = server.exports();
