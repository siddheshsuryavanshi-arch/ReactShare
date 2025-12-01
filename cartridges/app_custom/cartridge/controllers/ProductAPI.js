'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var Logger = require('dw/system/Logger');



/**
 * Helper: extract attribute values for a variant (color, size, width, etc.)
 */
function getVariantAttributes(variant) {
    var variantInfo = {};
    var variationModel = variant.getVariationModel();
    var variationAttributes = variationModel.getProductVariationAttributes();

    variationAttributes.toArray().forEach(function (attr) {
        var value = variationModel.getVariationValue(variant, attr);
        variantInfo[attr.ID] = value ? value.displayValue : null;
    });

    return variantInfo;
}


/**
 * Helper: collect available variation options (display dropdown on PDP)
 */
function getVariationOptions(product) {
    var variationOptions = {};
    var model = product.getVariationModel();
    var attributes = model.getProductVariationAttributes();

    attributes.toArray().forEach(function (attr) {
        var values = model.getAllValues(attr).toArray();
        variationOptions[attr.ID] = values.map(function (v) {
            return v.displayValue || v.value;
        });
    });

    return variationOptions;
}


/**
 * PDP Json API:
 * URL → /CategoryAPI-ProductDetails?productID=XYZ
 */
server.get('ProductDetails', function (req, res, next) {

    var productID = req.querystring.productID;

    if (!productID) {
        res.json({
            error: true,
            message: "Missing parameter: productID"
        });
        return next();
    }

    var product = ProductMgr.getProduct(productID);

    if (!product) {
        res.json({
            error: true,
            message: "Product not found"
        });
        return next();
    }

    // Get product image (priority: large > medium > small)
    var image = product.getImage('large', 0) ||
                product.getImage('medium', 0) ||
                product.getImage('small', 0);

    var availabilityModel = product.availabilityModel;

        var systemAttrs = {
        id: product.ID,
        name: product.name,
        brand: product.brand,
        online: product.online,
        taxClassID: product.taxClassID,
        searchable: product.searchable
    };

    var customAttrs = {};
    Object.keys(product.custom).forEach(function (key) {
        var value = product.custom[key];
        customAttrs[key] = value ? value.toString() : null;
    });

    var response = {
        action: "CategoryAPI-ProductDetails",
        id: product.ID,
        name: product.name || null,
        shortDescription: product.shortDescription ? product.shortDescription.toString() : null,
        longDescription: product.longDescription ? product.longDescription.toString() : null,
        price: product.priceModel && product.priceModel.price ? product.priceModel.price.value : null,
        image: image ? image.getAbsURL().toString() : null,
        availability: availabilityModel ? availabilityModel.availabilityStatus.toString() : null,
        stock: availabilityModel && availabilityModel.inventoryRecord ? availabilityModel.inventoryRecord.ATS.value : null,
        attributes: {systemAttrs,customAttrs},
        variationOptions: {},
        variants: []
    };

    // If master product → add variations section
    if (!product.isVariant()) {
        response.variationOptions = getVariationOptions(product);

        var allVariants = product.getVariationModel().getVariants().toArray();

        response.variants = allVariants.map(function (v) {
            return {
                id: v.ID,
                name: v.name,
                attributes: getVariantAttributes(v),
                image: v.getImage('small', 0) ? v.getImage('small', 0).getAbsURL().toString() : null,
                price: v.priceModel && v.priceModel.price ? v.priceModel.price.value : null
            };
        });
    }

    res.json(response);
    return next();
});


module.exports = server.exports();
