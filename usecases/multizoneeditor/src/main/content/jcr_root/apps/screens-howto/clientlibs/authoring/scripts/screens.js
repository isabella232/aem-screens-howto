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
(function($, ns, i18n, http) {
    'use strict';

    /**
     * Retrieve the dialog configuration for the given editable.
     *
     * @param  {Editable} editable The editable we want the dialog for
     *
     * @returns {Promise} a Promise that the dialog config was fetched
     */
    ns.fetchDialogConfig = function(editable) {
        return new Promise(function(resolve, reject) {
            $.ajax(http.externalize('/mnt/overlay/' + editable.type + '/cq:dialog.html' + editable.path), {
                success: resolve,
                error: function(xhr) {
                    reject(xhr.statusText);
                }
            });
        });
    };

    /**
     * Gets the options in a select component.
     *
     * @param  {String} html      the html markup to look in
     * @param  {String} fieldName the select component field name to target
     *
     * @returns {Object[]} the list of options
     */
    ns.getSelectOptions = function(html, fieldName) {
        return $(html).find('coral-select[name="' + fieldName + '"] coral-select-item').get()
            .map(function(el) {
                var $el = $(el);
                return {
                    text: $el.text(),
                    disabled: !!$el.attr('disabled'),
                    value: $el.attr('value')
                };
            });
    };

    /**
     * Populates the popover with the given option buttons.
     *
     * @param  {HTMLElement}         popover      the popover to populate
     * @param  {String}              cssClass     a CSS class to add to the popover
     * @param  {HTMLButtonElement[]} options      the buttons to use as options
     * @param  {Function}            clickHandler the event handler for clicks on the buttons
     *
     * @returns {HTMLElement} the populate popover
     */
    ns.populatePopoverAction = function(popover, cssClass, options, clickHandler) {
        if (cssClass) {
            popover.classList.add(cssClass);
        }
        $(popover).on('coral-overlay:close', function() {
            popover.hide();
            popover.remove();
        });

        var $optionsRoot = $(document.createElement('coral-buttonlist'));
        $optionsRoot.appendTo(popover.content);
        $optionsRoot.append(options);

        $optionsRoot.on('click', 'button', function(ev) {
            clickHandler(ev);
            $optionsRoot.off('click');
            popover.hide();
            popover.remove();
        });

        return popover;
    };

    ns.responsive = {};

    /**
     * Sets the the specified property on the reponsive container for the given breakpoint
     *
     * @param  {String} containerPath the container resource path
     * @param  {String} breakpoint    the breakpoint name (defaults to 'default')
     * @param  {String} property      the name of the property to set
     * @param  {Object} value         the value of the property to set
     *
     * @returns {Promise} a Promise that the property was set on the specified container
     */
    ns.responsive.setResponsiveProperty = function(containerPath, breakpoint, property, value) {
        var data = {};
        data[property] = value;
        return new Promise(function(resolve, reject) {
            $.ajax(http.externalize(containerPath + '/cq:responsive/' + (breakpoint || 'default')), {
                type: 'POST',
                data: data,
                success: resolve,
                error: function(xhr) {
                    reject(xhr.statusText);
                }
            });
        });
    };

}(window.Granite.$, window.Granite.author.screens, window.Granite.I18n, window.Granite.HTTP));
