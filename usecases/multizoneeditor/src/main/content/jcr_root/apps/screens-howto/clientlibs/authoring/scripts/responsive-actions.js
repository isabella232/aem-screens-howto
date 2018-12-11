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
(function($, ns, $doc, i18n) {
    'use strict';

    var SET_RESPONSIVE_CONTAINER_HEIGHT_ACTION_NAME = 'SET_RESPONSIVE_CONTAINER_HEIGHT';
    var SET_RESPONSIVE_CONTAINER_VOFFSET_ACTION_NAME = 'SET_RESPONSIVE_CONTAINER_VOFFSET';
    var LAYER = 'Layouting';
    var RESOURCE_TYPE = 'screens-howto/components/screens/content/responsivegrid';

    var adjustHeightAction = new ns.ui.ToolbarAction({
        name: SET_RESPONSIVE_CONTAINER_HEIGHT_ACTION_NAME,
        icon: 'chevronUpDown',
        text: i18n.get('Set Height'),
        index: 0,
        condition: function(editable) {
            return editable.type === RESOURCE_TYPE && editable.depth > 1;
        },
        execute: function(editable, selectableParents, target) {
            var currentValue = editable.dom[0].className.match(/aem-GridRow--default--(\d+)/);
            currentValue = currentValue ? currentValue[1] : null;
            ns.screens.fetchDialogConfig(editable)
                .then(function(html) {
                    return ns.screens.getSelectOptions(html, './cq:responsive/default/height')
                        .map(function(option) {
                            var item = new Coral.ButtonList.Item();
                            item.content.innerText = i18n.get(option.text);
                            item.disabled = option.disabled || option.group;
                            item.value = option.value || '';
                            if (item.value === currentValue) {
                                item.classList.add('is-focused');
                            }
                            return item;
                        });
                })
                .then(function(buttons) {
                    var popover = new Coral.Popover().set({
                        alignAt: Coral.Overlay.align.RIGHT_BOTTOM,
                        alignMy: Coral.Overlay.align.RIGHT_TOP,
                        target: target[0],
                        open: true
                    });
                    ns.screens.populatePopoverAction(popover, 'cq-responsive-height-list', buttons, getButtonClickHandler(target[0], 'height'));
                    $(popover).appendTo(document.body);
                });
            return false;
        }
    });

    var adjustVOffsetAction = new ns.ui.ToolbarAction({
        name: SET_RESPONSIVE_CONTAINER_VOFFSET_ACTION_NAME,
        icon: 'chevronUp',
        text: i18n.get('Offset Up'),
        index: 1,
        condition: function(editable) {
            return editable.type === RESOURCE_TYPE && editable.depth > 1;
        },
        execute: function(editable, selectableParents, target) {
            var currentValue = editable.dom[0].className.match(/aem-GridRow--voffset--default--(\d+)/);
            currentValue = currentValue ? currentValue[1] : null;
            ns.screens.fetchDialogConfig(editable)
                .then(function(html) {
                    return ns.screens.getSelectOptions(html, './cq:responsive/default/height')
                        .map(function(option) {
                            var item = new Coral.ButtonList.Item();
                            item.content.innerText = i18n.get(option.text);
                            item.disabled = option.disabled || option.group;
                            item.value = option.value || '';
                            if (item.value === currentValue) {
                                item.classList.add('is-focused');
                            }
                            return item;
                        });
                })
                .then(function(buttons) {
                    var popover = new Coral.Popover().set({
                        alignAt: Coral.Overlay.align.RIGHT_BOTTOM,
                        alignMy: Coral.Overlay.align.RIGHT_TOP,
                        target: target[0],
                        open: true
                    });
                    ns.screens.populatePopoverAction(popover, 'cq-responsive-height-list', buttons, getButtonClickHandler(target[0], 'voffset'));
                    $(popover).appendTo(document.body);
                });
            return false;
        }
    });

    function getButtonClickHandler(target, property) {
        return function(ev) {
            ns.screens.responsive.setResponsiveProperty(target.dataset.path, 'default', property, ev.currentTarget.value)
                .then(function() {
                    ns.ContentFrame.reload();
                })
                ['catch'](function(e) {
                    console.error(e);
                });
        };
    }

    /* authoring layer activation event */
    $doc.one('cq-editor-loaded', function() {
        if (ns.layerManager.getCurrentLayer() === LAYER) {
            ns.EditorFrame.editableToolbar.registerAction(SET_RESPONSIVE_CONTAINER_HEIGHT_ACTION_NAME, adjustHeightAction);
            ns.EditorFrame.editableToolbar.registerAction(SET_RESPONSIVE_CONTAINER_VOFFSET_ACTION_NAME, adjustVOffsetAction);
        }
        $doc.on('cq-layer-activated', function(ev) {
            if (ev.layer === LAYER) {
                ns.EditorFrame.editableToolbar.registerAction(SET_RESPONSIVE_CONTAINER_HEIGHT_ACTION_NAME, adjustHeightAction);
                ns.EditorFrame.editableToolbar.registerAction(SET_RESPONSIVE_CONTAINER_VOFFSET_ACTION_NAME, adjustVOffsetAction);
            }
        });
    });

}(window.Granite.$, window.Granite.author, window.Granite.$(document), window.Granite.I18n));
