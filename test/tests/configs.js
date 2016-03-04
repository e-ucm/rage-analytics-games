'use strict';

var should = require('should');

var config;
var configValues;
var testConfig;

describe('Config files  validations', function () {

    it('should return a correct config-values file', function (done) {
        configValues = require('../../config-values.js');
        var keys = Object.keys(configValues);
        should(keys.length).equal(2);
        should(keys).containDeep(['defaultValues', 'testValues']);

        var defaultKeys = Object.keys(configValues.defaultValues);
        var testKeys = Object.keys(configValues.testValues);
        should(defaultKeys.length).equal(testKeys.length);
        should(defaultKeys).containDeep(testKeys);

        done();
    });

    it('should have generated correctly the config files', function (done) {
        config = require('../../config.js');
        testConfig = require('../../config-test.js');

        var configKeys = Object.keys(config);
        var testConfigKeys = Object.keys(testConfig);

        should(configKeys.length).equal(testConfigKeys.length);
        should(configKeys).containDeep(testConfigKeys);

        var toType = function (obj) {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        };

        configKeys.forEach(function (configKey) {
            should(toType(configKeys[configKey])).equal(toType(testConfigKeys[configKey]));
        });

        var defaultKeys = Object.keys(configValues.defaultValues);
        var testKeys = Object.keys(configValues.testValues);
        should(defaultKeys.length).equal(testKeys.length);
        should(defaultKeys).containDeep(testKeys);

        done();
    });


    it('should have a correct content (config files)', function (done) {
        /**
         *   Exports.port = process.env.PORT || '3450';
         *   exports.secretKey = 'testkey';
         *   exports.companyName = 'e-UCM Research Group';
         *   exports.projectName = 'Rage Analytics Games';
         */

        should(config.port).be.a.String();
        should(config.secretKey).be.a.String();
        should(config.companyName).be.a.String();
        should(config.projectName).be.a.String();

        should(testConfig.port).be.a.String();
        should(testConfig.secretKey).be.a.String();
        should(testConfig.companyName).be.a.String();
        should(testConfig.projectName).be.a.String();

        done();
    });
});
