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
/* global jQuery, sinon */
(function(window, $) {
    'use strict';

    // This is a fake implementation of the `Granite.$.ajax` Service
    // which is used for testing instead of the real implementation.
    window.Granite = {
        $: $,
        author: {
            ContentFrame: {
                currentLocation: sinon.stub(),
                setHeight: sinon.stub(),
                load: sinon.stub()
            },
            pageInfo: {},
            ui: {
                ToolbarAction: sinon.stub()
            }
        },
        HTTP: {
            // Usually this util would be implicitly loaded in the testing
            // environment and not know by the test. But since Granite is not
            // available.. we need to mock it. That's actually a flaw because
            // now the test environment knows implementation details.
            externalize: function(string) {
                return string;
            },
            getPath: function(string) {
                return string.replace(/\.[^/]*$/, '');
            }
        },
        URITemplate: {
            expand: function(path, options) {
                return path;
            }
        },
        I18n: {
            get: function(msg) {
                return msg;
            }
        }
    };

    var ajaxStub = sinon.stub(window.Granite.$, 'ajax');
    ajaxStub.returns({
        done: function(cb) { cb(); },
        fail: function(cb) { cb(); },
        always: function(cb) { cb(); }
    });

    // mocking foundation adaptor
    var adaptToStub = sinon.stub(window.Granite.$, 'adaptTo');
    adaptToStub.withArgs('foundation-registry').returns({
        register: function() {}
    });


}(window, jQuery));
