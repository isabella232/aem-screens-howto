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
 * @module face-api-detector
 * This module uses the face-api (machine learning API) to analyse face features of the audience.
 * These include: gender, age and face expressions.
 * Then registers as source to the audiencefeatures store.
 */
(function(window, document, screens, ContextHub, $) {
    'use strict';

    // html element for reading videocapture device
    var videoCaptureElement;

    /**
     * Setups the video capture device and loads the ML-modells.
     * The path where the modells are loaded from can be specified in the UI: channel properties -> channel -> path to model files
     */
    $(function setup() {
        // inject video element into html and set the source
        videoCaptureElement = document.createElement('video');
        videoCaptureElement.setAttribute('id', 'videocapture');
        videoCaptureElement.setAttribute('autoplay', true);
        videoCaptureElement.setAttribute('muted', true);
        videoCaptureElement.setAttribute('hidden', true);

        navigator.mediaDevices.getUserMedia({
            video: {}
        })
            // eslint-disable-next-line max-nested-callbacks
            .then(function(stream) {
                videoCaptureElement.srcObject = stream;
            });

        // load faceapi models
        var modelPath = $('meta[name=mlmodelpath]').attr('content');
        console.log('[audiencefeatures] modelpath is: ' + modelPath);
        window.faceapi.nets.ssdMobilenetv1.load(modelPath);
        window.faceapi.loadFaceLandmarkModel(modelPath);
        window.faceapi.nets.ageGenderNet.load(modelPath);
        window.faceapi.nets.faceExpressionNet.load(modelPath);
        window.faceapi.nets.faceRecognitionNet.load(modelPath);

    });

    /**
     * Returns promise which will be used to register as source to the audiencefeature store.
     * Promise returns all features detected by the modell.
     *
     * @returns {promise} the promise which returns the features
     */
    function _readFace() {
        return window.faceapi.detectSingleFace(videoCaptureElement)
            .withFaceLandmarks()
            .withAgeAndGender()
            .withFaceExpressions();
    }

    /**
     * Registers this detector as source to the audiencefeature store.
     */
    $(function() {
        if (Object.keys(screens).length !== 0) {
            screens.audiencefeatures.registerSource('face-api', _readFace);
        }
    });

}(window, document, typeof window.CQ !== 'undefined' ? window.CQ.screens : {}, window.ContextHub, window.ContextHubJQ));
