/*
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
(function($, ns, $doc, window) {
    'use strict';

    var EXCLUDE_LAYERS = ['Preview'];

    /**
     * Sets the height of the specified responsive grid container according to
     * the CSS class it has.
     *
     * @param {Editable[]} editables The editables for the responsive grid container
     */
    function positionAndSizeResponsiveContainer(editables) {
        editables
            .filter(function(e) {
                return e.dom[0].className.match(/responsivegrid.*aem-GridRow/);
            })
            .forEach(function(editable) {
                var el = editable.dom[0];
                if (el.style.height) {
                    return;
                }

                // Retrieve the height from the CSS definition
                // When the parent node is hidden, jQuery falls back to the
                // percentage height defined in the CSS
                $(el.parentNode).hide();
                var cssHeight = $(el).height();
                var cssMarginTop = parseInt($(el).css('top'), 10);
                $(el.parentNode).show();

                var parentHeight = Math.min(el.parentNode.clientHeight, window.outerHeight);
                if (cssHeight) {
                    el.style.height = (cssHeight / 100 * parentHeight) + 'px';
                }
                if (cssMarginTop) {
                    el.style.marginTop = (cssMarginTop / 100 * parentHeight) + 'px';
                }
            });
    }

    $doc.one('cq-editor-loaded', function() {
        var editables = ns.ContentFrame.getEditables();

        // Resize containers on initial load if in of the supported layers
        if (EXCLUDE_LAYERS.indexOf(ns.layerManager.getCurrentLayer()) === -1) {
            positionAndSizeResponsiveContainer(editables);
        }

        // Resize containers when switching mode
        $doc.on('cq-layer-activated', function(ev) { // eslint-disable-line max-nested-callbacks
            if (EXCLUDE_LAYERS.indexOf(ev.layer) === -1) {
                positionAndSizeResponsiveContainer(editables);
            }
        });

        // Force reload after editing a responsivegrid
        $doc.on('cq-inspectable-added', function(ev) { // eslint-disable-line max-nested-callbacks
            function isResponsiveGridWithoutHeight(editable) {
                return editable.dom[0].className.match(/section.*responsivegrid/)
                    && !editable.dom[0].className.match(/aem-GridRow--default/);
            }
            var needsReload = editables.some(isResponsiveGridWithoutHeight);
            if (needsReload) {
                Granite.author.ContentFrame.reload();
            }
        });
    });

}(window.Granite.$, window.Granite.author, window.Granite.$(document), window));
