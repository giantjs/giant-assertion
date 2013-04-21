/*global dessert, module, test, expect, raises, equal, deepEqual, ok */
(function () {
    "use strict";

    module('dessert');

    test("General assertion", function () {
        equal(dessert.assert(true), dessert, "Assertion success returns namespace");

        raises(function () {
            dessert.assert(false);
        }, "Failed assertion raises exception");
    });

    test("Custom handler", function () {
        expect(5);

        dessert.customHandler(function (message) {
            ok(true, "Custom handler called");
            equal(message, "foo", "Message passed to custom handler");
        });
        raises(function () {
            dessert.assert(false, "foo");
        }, "Assertion with custom handler");

        dessert.customHandler(function (message) {
            ok(true, "Custom handler prevents exception");
            return false;
        });
        dessert.assert(false, "foo");

        dessert.customHandler(function (message) {
            equal(message, "foo bar", "Multi-part message");
            return false;
        });
        dessert.assert(false, "foo", "bar");

        dessert.customHandler(undefined);
    });

    test("Type addition", function () {
        raises(function () {
            dessert.addType('assert', function () {});
        }, "Attempting to replace core function");

        ok(!dessert.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        raises(function () {
            dessert.addType(1, function () {});
        }, "Invalid method name argument raises exception");

        raises(function () {
            dessert.addType('test', 'foo');
        }, "Invalid validator argument raises exception");

        function validator(expr) {
            // returning a boolean expression to be passed to `.assert`
            return expr === 'test';
        }

        dessert.addType('test', validator);

        ok(dessert.hasOwnProperty('test'), "New property added to namespace");

        raises(function () {
            dessert.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        equal(dessert.addType('test', validator), dessert, "Adding the same validator again (silently)");

        equal(dessert.test('test'), dessert, "Custom assertion passed");

        raises(function () {
            dessert.test('foo');
        }, "Custom assertion failed");
    });

    test("Assertion messages", function () {
        expect(2);

        dessert.addType('testTypeWithMessage', function (expr) {
            return expr === 'test';
        });

        var backup = dessert.assert;
        dessert.assert = function (expr, message) {
            equal(expr, false, "Assertion failed");
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

        dessert.testTypeWithMessage('foo', "Assertion failed", 1);

        dessert.assert = backup;
    });

    test("Multiple type addition", function () {
        ok(!dessert.hasOwnProperty('test1'), "New type is not pre-existing (sanity check)");

        dessert.addTypes({
            test1: function (expr) {
                // returning a boolean expression to be passed to `.assert`
                return expr === 'test';
            }
        });

        equal(dessert.test1('test'), dessert, "Custom assertion passed");

        raises(function () {
            dessert.test1('foo');
        }, "Custom assertion failed");
    });
}());
