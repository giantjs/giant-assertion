/*global giant */
(function () {
    "use strict";

    module('assert');

    test("General assertion", function () {
        equal(giant.assert(true), giant, "Assertion success returns namespace");

        raises(function () {
            giant.assert(false);
        }, "Failed assertion raises exception");
    });

    test("Custom handler", function () {
        expect(6);

        giant.customHandler(function (expr, message) {
            ok(true, "Custom handler called");
            equal(message, "foo", "Message passed to custom handler");
        });
        raises(function () {
            giant.assert(false, "foo");
        }, "Assertion with custom handler");

        giant.customHandler(function () {
            ok(true, "Custom handler prevents exception");
            return false;
        });
        giant.assert(false, "foo");

        giant.customHandler(function (expr, arg1, arg2) {
            equal(arg1, "foo", "Multi-part message");
            equal(arg2, "bar", "Multi-part message");
            return false;
        });
        giant.assert(false, "foo", "bar");

        giant.customHandler(undefined);
    });

    test("Type addition", function () {
        raises(function () {
            giant.addType('assert', function () {});
        }, "Attempting to replace core function");

        ok(!giant.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        raises(function () {
            giant.addType(1, function () {});
        }, "Invalid method name argument raises exception");

        raises(function () {
            giant.addType('test', 'foo');
        }, "Invalid validator argument raises exception");

        function validator(expr) {
            // returning a boolean expression to be passed to `.assert`
            return expr === 'test';
        }

        giant.addType('test', validator);

        ok(giant.hasOwnProperty('test'), "New property added to namespace");

        raises(function () {
            giant.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        equal(giant.addType('test', validator), giant, "Adding the same validator again (silently)");

        equal(giant.test('test'), giant, "Custom assertion passed");

        raises(function () {
            giant.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete giant.validators.test;
        delete giant.test;
    });

    test("Type addition with override", function () {
        giant.addType('test', function () {});

        raises(function () {
            giant.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        giant.addType(
            'test',
            function (expr) {return expr === 'overwritten';},
            true
        );

        equal(giant.test('overwritten'), giant, "Custom assertion passed");

        // removing custom handler
        delete giant.validators.test;
        delete giant.test;
    });

    test("Assertion messages", function () {
        expect(2);

        function testValidator(expr) {
            return expr === 'test';
        }

        giant.addType('testTypeWithMessage', testValidator);

        var backup = giant.assert;
        giant.assert = function (expr, message) {
            strictEqual(expr, testValidator, "Validator passed");
            deepEqual(
                Array.prototype.slice.call(arguments, 1),
                [
                    'foo',
                    "Assertion failed",
                    1
                ],
                "Composite multi-part assertion message"
            );
        };

        giant.testTypeWithMessage('foo', "Assertion failed", 1);

        giant.assert = backup;

        // removing custom handler
        delete giant.validators.testTypeWithMessage;
        delete giant.testTypeWithMessage;
    });

    test("Multiple type addition", function () {
        ok(!giant.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        giant.addTypes({
            test: function (expr) {
                // returning a boolean expression to be passed to `.assert`
                return expr === 'test';
            }
        });

        equal(giant.test('test'), giant, "Custom assertion passed");

        raises(function () {
            giant.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete giant.validators.test;
        delete giant.test;
    });
}());
