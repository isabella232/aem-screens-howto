/*
 *
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
/* eslint max-nested-callbacks: [2, 10] */
/* global describe, it, expect, beforeEach, afterEach, sinon */

(function($, ns) {
    'use strict';

    describe('Granite.author.screens', function() {

        describe('#fetchDialogConfig', function() {

            var mockEditable;

            beforeEach(function() {
                mockEditable = {
                    type: 'foo/bar',
                    path: '/baz/qux'
                };
            });

            it('returns a promise', function() {
                expect(ns.fetchDialogConfig(mockEditable)).to.be.an.instanceof(Promise);
            });

            it('fetches the editable dialog', function() {
                ns.fetchDialogConfig(mockEditable);
                expect($.ajax).to.be.calledWith('/mnt/overlay/foo/bar/cq:dialog.html/baz/qux');
            });

            it('returns a successful promise if the ajax call succeeded', function() {
                $.ajax.yieldsTo('success');
                return ns.fetchDialogConfig(mockEditable);
            });

            it('returns an failed promise if the ajax call fails', function(done) {
                $.ajax.yieldsTo('error');
                ns.fetchDialogConfig(mockEditable).catch(function() {
                    done();
                });
            });

        });

        describe('#getSelectOptions', function() {

            it('returns an array', function() {
                var result = ns.getSelectOptions();
                expect(result).to.be.instanceof(Array);
            });

            it('returns an empty array if the field does not exist', function() {
                var html = '';
                var result = ns.getSelectOptions(html, 'foo');
                expect(result.length).to.equal(0);
            });

            it('returns an empty array if the field does not exist', function() {
                var html = '<div>' +
                    '<coral-select name="foo">' +
                    '</coral-select>' +
                '</div>';
                var result = ns.getSelectOptions(html, 'foo');
                expect(result.length).to.equal(0);
            });

            it('returns an empty array if the field has no options', function() {
                var html = '<div>' +
                    '<coral-select name="foo">' +
                    '</coral-select>' +
                '</div>';
                var result = ns.getSelectOptions(html, 'foo');
                expect(result.length).to.equal(0);
            });

            it('returns an array of buttons corresponding to the field options', function() {
                var html = '<div>' +
                    '<coral-select name="foo">' +
                        '<coral-select-item value="bar">BAR</coral-select-item>' +
                        '<coral-select-item value="baz" disabled>BAZ</coral-select-item>' +
                        '<coral-select-item value="qux">QUX</coral-select-item>' +
                    '</coral-select>' +
                '</div>';
                var result = ns.getSelectOptions(html, 'foo');
                expect(result.length).to.equal(3);

                expect(result[0].value).to.equal('bar');
                expect(result[0].text).to.equal('BAR');
                expect(result[0].disabled).to.be.false;

                expect(result[1].value).to.equal('baz');
                expect(result[1].text).to.equal('BAZ');
                expect(result[1].disabled).to.be.true;

                expect(result[2].value).to.equal('qux');
                expect(result[2].text).to.equal('QUX');
                expect(result[2].disabled).to.be.false;
            });

        });

        describe('#populatePopoverAction', function() {

            var mockPopover;

            beforeEach(function() {
                mockPopover = document.createElement('div');
                mockPopover.hide = function() {};

                sinon.spy(mockPopover, 'hide');
                sinon.spy(mockPopover, 'remove');

                var mockPopoverContent = document.createElement('div');
                mockPopover.content = mockPopoverContent;
                mockPopover.appendChild(mockPopoverContent);
            });

            afterEach(function() {
                mockPopover.remove.restore();
            });

            it('returns the popover', function() {
                var result = ns.populatePopoverAction(mockPopover, null, null, null);
                expect(result).to.equal(mockPopover);
            });

            it('adds a buttonlist to the popover', function() {
                var result = ns.populatePopoverAction(mockPopover, null, null, null);
                expect(result.content.childNodes[0].nodeName).to.equal('CORAL-BUTTONLIST');
            });

            it('appends the given CSS class to the popover', function() {
                var result = ns.populatePopoverAction(mockPopover, 'foo', null, null);
                expect(result.classList.contains('foo')).to.be.true;
            });

            it('appends the specified buttons to the popover', function() {
                var mockButtons = [
                    $('<button>foo</button>').get(0),
                    $('<button>bar</button>').get(0)
                ];

                var result = ns.populatePopoverAction(mockPopover, null, mockButtons, null);

                var buttons = result.content.querySelectorAll('button');
                expect(buttons.length).to.equal(2);
                expect(buttons[0].textContent).to.equal('foo');
                expect(buttons[1].textContent).to.equal('bar');
            });

            it('calls the click handler when a button is clicked', function() {
                var mockButtons = [
                    $('<button>foo</button>').get(0),
                    $('<button>bar</button>').get(0)
                ];

                var mockHandler = sinon.spy();

                ns.populatePopoverAction(mockPopover, null, mockButtons, mockHandler);

                $(mockButtons[0]).trigger('click');
                expect(mockHandler).to.be.calledWith(sinon.match({
                    currentTarget: mockButtons[0]
                }));

                $(mockButtons[1]).trigger('click');
                expect(mockHandler).to.be.calledWith(sinon.match({
                    currentTarget: mockButtons[0]
                }));
            });

            it('destroys the popover after a click on a button', function() {
                var mockButtons = [
                    $('<button>foo</button>').get(0),
                    $('<button>bar</button>').get(0)
                ];

                var mockHandler = sinon.spy();

                ns.populatePopoverAction(mockPopover, null, mockButtons, mockHandler);

                $(mockButtons[0]).trigger('click');
                expect(mockPopover.hide).to.be.calledOnce;
                expect(mockPopover.remove).to.be.calledOnce;
            });

            it('destroys the popover when the coral overlay is closed', function() {
                ns.populatePopoverAction(mockPopover, null, null, null);

                $(mockPopover).trigger('coral-overlay:close');

                expect(mockPopover.hide).to.be.calledOnce;
                expect(mockPopover.remove).to.be.calledOnce;
            });

        });

        describe('responsive', function() {

            describe('#setResponsiveProperty', function() {

                it('returns a promise', function() {
                    expect(ns.responsive.setResponsiveProperty()).to.be.an.instanceof(Promise);
                });

                it('returns a successful promise if the ajax call succeeds', function() {
                    $.ajax.yieldsTo('success');
                    return ns.responsive.setResponsiveProperty();
                });

                it('returns a failed promise if the ajax call fails', function(done) {
                    $.ajax.yieldsTo('error');
                    ns.responsive.setResponsiveProperty().catch(function(err) {
                        done();
                    });
                });

                it('sends an ajax request to the specified breakpoint to set the property and value', function() {
                    $.ajax.yieldsTo('success');
                    ns.responsive.setResponsiveProperty('/foo', 'bar', 'baz', 'qux');
                    expect($.ajax).to.be.calledWith('/foo/cq:responsive/bar', sinon.match({
                        data: {
                            baz: 'qux'
                        }
                    }));
                });

                it('sends an ajax request to the "default" breakpoint by default', function() {
                    $.ajax.yieldsTo('success');
                    ns.responsive.setResponsiveProperty('/foo');
                    expect($.ajax).to.be.calledWith('/foo/cq:responsive/default');
                });

            });

        });
    });

}(Granite.$, Granite.author.screens));
