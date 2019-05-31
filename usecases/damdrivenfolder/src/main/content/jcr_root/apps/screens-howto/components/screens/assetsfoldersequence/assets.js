/**
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */
/* global use, resource, properties, com */
/**
 * Image component JS Use-api script
 */
use([], function() {
    'use strict';

    var assets = [];

    // Load assets from the DAM folder
    var assetFolderPath = properties.path;
    var assetFolder = assetFolderPath ? resource.resourceResolver.getResource(assetFolderPath) : null;
    var children = assetFolder ? resource.resourceResolver.listChildren(assetFolder) : null;

    // Render them as video or image depending on the mime type
    while (children && children.hasNext()) {
        var child = children.next();
        var asset = child.adaptTo(com.day.cq.dam.api.Asset);
        if (asset) {
            var mimeType = asset.getMimeType();
            if (/image\/.*/.test(mimeType)) {
                assets.push({
                    'sling:resourceType': 'screens/core/components/content/image',
                    resourceName: asset.getName(),
                    fileReference: asset.getPath()
                });
            }
            else if (/video\/.*/.test(mimeType)) {
                assets.push({
                    'sling:resourceType': 'screens/core/components/content/video',
                    resourceName: asset.getName(),
                    asset: asset.getPath()
                });
            }
        }
    }

    return {
        list: assets.sort(function(r1, r2) {
            return r1.resourceName.compareTo(r2.resourceName);
        })
    };

});
