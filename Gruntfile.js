/*jshint node:true */
module.exports = function (grunt) {
    "use strict";

    var params = {
        files: [
            'src/namespace.js',
            'src/dessert.js',
            'src/common.js',
            'src/exports.js'
        ],

        test: 'src/jsTestDriver.conf',

        globals: {}
    };

    // invoking common grunt process
    require('common-gruntfile')(grunt, params);
};
