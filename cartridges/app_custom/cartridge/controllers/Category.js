'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var Logger = require('dw/system/Logger');

/**
 * Helper: extract attributes from a single variant (color, size, etc)
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
 * Helper: collect available variation options
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
 * PDP JSON API
 * @route Category-ProductDetails
 */
server.get('ProductDetails', function (req, res, next) {
    var pid = req.querystring.pid;

    if (!pid) {
        res.json({
            error: true,
            message: 'Missing parameter: pid'
        });
        return next();
    }

    var product = ProductMgr.getProduct(pid);

    if (!product) {
        Logger.warn('[ReactPDP] Product not found: {0}', pid);
        res.json({
            error: true,
            message: 'Product not found'
        });
        return next();
    }

    Logger.info('[ReactPDP] API hit for PID: {0}', pid);

    /** --------- MULTIPLE IMAGES BLOCK ----------- **/
    var images = [];
    try {
        var largeImgs = product.getImages('large').toArray();
        if (largeImgs.length) {
            images = largeImgs.map(function (img) {
                return img.getAbsURL().toString();
            });
        }
    } catch (e) {
        Logger.error('[ReactPDP] Could not read product images: ' + e);
    }

    /** fallback if no large images */
    if (!images.length) {
        var fallbackImg = product.getImage('medium', 0) || product.getImage('small', 0);
        if (fallbackImg) {
            images.push(fallbackImg.getAbsURL().toString());
        }
    }

    var availabilityModel = product.availabilityModel;

    /** Basic product info */
    var baseData = {
        id: product.ID,
        name: product.name,
        shortDescription: product.shortDescription ? product.shortDescription.toString() : null,
        longDescription: product.longDescription ? product.longDescription.toString() : null,
        price: product.priceModel && product.priceModel.price ? product.priceModel.price.value : null,

        /** 🟢 CHANGES: return multiple images */
        images: images,
        featuredImage: images.length ? images[0] : null,

        availability: availabilityModel ? availabilityModel.availabilityStatus.toString() : null,
        stock: availabilityModel && availabilityModel.inventoryRecord ? availabilityModel.inventoryRecord.ATS.value : null,
    };

    /** Extract all system attributes */
    var systemAttrs = {
        brand: product.brand,
        type: product.online ? 'ONLINE' : 'OFFLINE',
        searchable: product.searchable,
        taxClassID: product.taxClassID
    };

    /** Extract custom attributes (convert to string) */
    var customAttrs = {};
    Object.keys(product.custom).forEach(function (key) {
        var value = product.custom[key];
        customAttrs[key] = value ? value.toString() : null;
    });

    /** Main response structure */
    var response = {
        action: 'Category-ProductDetails',
        product: baseData,
        attributes: {
            system: systemAttrs,
            custom: customAttrs
        },
        variationOptions: {},
        variants: []
    };

    /**
     * If master product: return all variation options + children
     */
    if (!product.isVariant()) {
        response.variationOptions = getVariationOptions(product);

        var allVariants = product.getVariationModel().getVariants().toArray();

        response.variants = allVariants.map(function (v) {

            /** collect variant thumbnail images */
            var vImgs = [];
            try {
                var vLarge = v.getImages('large').toArray();
                vImgs = vLarge.map(function (img) {
                    return img.getAbsURL().toString();
                });
            } catch (e) {}

            return {
                id: v.ID,
                name: v.name,
                attributes: getVariantAttributes(v),
                images: vImgs,
                featuredImage: vImgs.length ? vImgs[0] : null,
                price: v.priceModel && v.priceModel.price ? v.priceModel.price.value : null
            };
        });
    }

    res.json(response);
    return next();
});

module.exports = server.exports();
