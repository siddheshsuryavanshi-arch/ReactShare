'use strict';

var server = require('server');
var ContentMgr = require('dw/content/ContentMgr');
var Logger = require('dw/system/Logger');

server.get('Get', function (req, res, next) {

    try {
        var cid = req.querystring.cid;

        // Missing CID input
        if (!cid) {
            res.json({
                success: false,
                error: 'MissingParameter',
                message: 'Content ID (cid) is required'
            });
            return next();
        }

        // Fetch content asset
        var content = ContentMgr.getContent(cid);

        // Content not found
        if (!content) {
            res.json({
                success: false,
                error: 'NotFound',
                message: 'Content not found',
                contentID: cid
            });
            return next();
        }

        // Extract dynamic attributes safely
        var dynamicAttributes = {};
        var attributeDefs = content.describe().getAttributeDefinitions();
        var iterator = attributeDefs.iterator();

        while (iterator.hasNext()) {
            var attr = iterator.next();
            var attrID = attr.getID();
            var value = null;

            try {
                // Access standard or custom attribute
                if (Object.prototype.hasOwnProperty.call(content, attrID)) {
                    value = content[attrID];
                } else if (content.custom && Object.prototype.hasOwnProperty.call(content.custom, attrID)) {
                    value = content.custom[attrID];
                }

                // Convert to readable format if possible
                if (value && typeof value.toString === 'function') {
                    value = value.toString();
                }

            } catch (attrErr) {
                Logger.error('Error reading attribute "' + attrID + '": ' + attrErr);
                value = null; // prevents breakage
            }

            dynamicAttributes[attrID] = value;
        }

        // Success response
        res.json({
            success: true,
            contentID: content.ID,
            locale: request.locale || 'default',
            attributes: dynamicAttributes
        });

        return next();

    } catch (err) {
        Logger.error('ContentAPI Fatal Error: ' + err);

        res.json({
            success: false,
            error: 'InternalServerError',
            message: 'An unexpected error occurred while processing the request'
        });

        return next();
    }
});

module.exports = server.exports();
