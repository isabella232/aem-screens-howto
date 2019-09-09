/**
 * ADOBE CONFIDENTIAL
 * __________________
 *
 *  Copyright 2019 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

/**
 * @module store.audiencefeatures
 * This module is used to collect all features provided by various machine-learing modells.
 * The features should describe properties of the audience in front of the screen.
 * All features are given an appropriate name and are then saved as items in ContextHub using a PersistendStore.
 */

(function(window, document, ContextHub, screens, $) {
    'use strict';

    // interval (in ms) in which the sources are read
    var READ_INTERVAL = 1000;

    // number of samples used to average numerical numbers
    var SAMPLE_COUNT = 3;

    var _featureSource = {};

    /**
     * An AverageFeature holds the value of one Feature and averages it, based on the updates.
     * It can only handle numbers.
     *
     * @constructor
     */
    function AverageFeature() {
        this._value = 0;
        this._sample_count = 0;

        /**
         * The reset method sets all values back to zero.
        */
        this.reset = function() {
            this._value = 0;
            this._sample_count = 0;
        };

        /**
         * The update method takes the next value of a feature and averages it with the previously given values.
         *
         * @param       {number} nextValue next value of the feature
        */
        this.update = function(nextValue) {
            this._value *= this._sample_count;
            this._value += nextValue;
            this._sample_count++;
            this._value /= this._sample_count;
        };

        this.getValue = function() {
            return this._value;
        };
    }

    /**
     *  The flatten function is a wrapper of the _flatten function, which emulates a default parameter (prevKey = '').
     *
     * @param {any} arg The array or object to be flattened
     * @returns {Object} flattened Object
     */
    function flatten(arg) {
        return _flatten(arg, '');
    }

    /**
     * The _flatten function makes a deep-merge copy of the passen argument (handling objects and arrays) and gives appropriate names to the properties.
     * The function calls itself recursively and passes to itself the prevKey.
     * Doesn't copy private properties.
     *
     * The new property names include the nested structure of the arg. The diffrent levels are seperated by underscores (_).
     * e.g. arg = {obj1: {arr1: [2, 3]}, val1: 5} -> flattened = {obj1_arr1_0: 2, obj1_arr1_1: 3, val1: 5}
     *
     * @param       {any} arg The array or object to be flattened
     * @param       {String} prevKey Should be '' (empty) when calling function
     * @returns     {Object} flattened Object
     */
    function _flatten(arg, prevKey) {
        var flattened = {};
        if (typeof arg !== 'object' || typeof arg === 'string') {
            var wrapped = {};
            wrapped[prevKey] = arg;
            return wrapped;
        } else if (Array.isArray(arg)) {
            for (var i = 0; i < arg.length; i++) {
                var newKey = (prevKey === '') ? i : prevKey + '_' + i;
                Object.assign(flattened, _flatten(arg[i], newKey));
            }
        } else {
            for (var key in arg) {
                if (key.startsWith('_')) { // ignore privat properties
                    continue;
                }
                var newKey2 = (prevKey === '') ? key : prevKey + '_' + key;
                if (arg.hasOwnProperty(key)) {
                    Object.assign(flattened, _flatten(arg[key], newKey2));
                }
            }
        }
        return flattened;
    }

    screens.audiencefeatures = {};

    // sourceName = string; featureReadFunc = promise

    /**
     * The screens.audiencefeature.registerSource function is exposed by the CQ.screens variable.
     * It should be used to register the source of feature provided by the ML-modells.
     * To register a source a name has to be specified and a promise which executes the ML-modell and returns the outputs.
     * The promise will be executed every READ_INTERVAL.
     *
     * @param       {String} sourceName name of the source (arbitrary)
     * @param       {promise} featureReadPromise promise which runs ML-modell and returns outputs
     */
    screens.audiencefeatures.registerSource = function(sourceName, featureReadPromise) {
        console.log('[audiencefeatures] ' + sourceName + ' has been registered as store source');
        _featureSource[sourceName] = {};
        _featureSource[sourceName].name = sourceName;
        _featureSource[sourceName].read = featureReadPromise;
        _featureSource[sourceName].features = {};
    };

    var read_count = 0;

    /**
     * The function readFeatures is called every READ_INTERVAL. It calls the promise given when registering a source.
     * It then handels the returned outputs and either creates an AverageFeature (for numbers) or just saves the feature (any other type).
     */
    function readFeatures() {
        for (var key in _featureSource) {
            var source = _featureSource[key];
            source.read().then(function(result) {
                var flattened = flatten(result);

                for (var featureKey in source.features) {
                    if (!flattened.hasOwnProperty(featureKey) || flattened[featureKey] === null)
                    {
                        source.features[featureKey] = null;
                        continue;
                    }
                }

                for (var key2 in flattened) {
                    if (typeof flattened[key2] === 'number') {
                        if (!(source.features[key2] instanceof AverageFeature)) {
                            source.features[key2] = new AverageFeature();
                        }
                        source.features[key2].update(flattened[key2]);
                    } else {
                        source.features[key2] = flattened[key2];
                    }
                }
            });
        }
    }

    /**
     * The AudienceFeature store is a PersistedStore holding all features provided by the registered sources.
     *
     * @param       {String} name   The name of the store.
     * @param       {Object} config An object that contains configuration properties for the store
     * @constructor
     */
    function AudienceFeaturesStore(name, config) {
        this.config = {};
        if (config) {
            Object.keys(config).forEach(function(k) {
                this.config[k] = config[k];
            }.bind(this));
        }
        this.init(name, this.config);

        $(function() {
            setTimeout(run);
        });

        /**
         * function loop which runs all methods to update the store.
         * Calls readFeatures every READ_INTERVAL and writeItems every (SAMPLE_COUNT * READ_INTERVAL)
         */
        function run() {
            readFeatures();
            if (read_count === SAMPLE_COUNT) {
                writeItems();
                read_count = 0;
            }
            read_count++;
            setTimeout(run, READ_INTERVAL);
        }

        // reads features using face-api and stores them in flattened object of 'AverageFeatures'

        /**
         * The function writeItems writes all saved features (numbers are averaged) to the audiencefeatures store.
         * It then resets the features.
         * The store items are named after following rule: '/' + sourceName + '/' + flattenedFeatureName
         */
        function writeItems() {
            for (var sourceKey in _featureSource) {
                var source = _featureSource[sourceKey];
                for (var featureKey in _featureSource[sourceKey].features) {
                    if (featureKey === '') {
                        continue;
                    }
                    var feature = source.features[featureKey];
                    var itemName = '/' + name + '/' + source.name + '/' + featureKey;
                    if (feature === null) {
                        ContextHub.setItem(itemName, null);
                    } else if (typeof feature === 'object') {
                        ContextHub.setItem(itemName, feature.getValue());
                        feature.reset();
                    } else {
                        ContextHub.setItem(itemName, feature);
                    }
                }

            }
        }

    }

    // Extend the default ContextHub.Store.PersistedStore
    ContextHub.Utils.inheritance.inherit(AudienceFeaturesStore, ContextHub.Store.PersistedStore);

    // Register the store
    ContextHub.Utils.storeCandidates.registerStoreCandidate(AudienceFeaturesStore, 'screens.audiencefeatures', 0);

}(window, document, window.ContextHub, typeof window.CQ !== 'undefined' ? window.CQ.screens : {}, window.ContextHubJQ));
