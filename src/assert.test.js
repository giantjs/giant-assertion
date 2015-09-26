(function () {
    "use strict";

    module('assert');

    test("General assertion", function () {
        equal($assertion.assert(true), $assertion, "Assertion success returns namespace");

        throws(function () {
            $assertion.assert(false);
        }, "Failed assertion throws exception");
    });

    test("Custom handler", function () {
        expect(6);

        $assertion.customHandler(function (expr, message) {
            ok(true, "Custom handler called");
            equal(message, "foo", "Message passed to custom handler");
        });
        throws(function () {
            $assertion.assert(false, "foo");
        }, "Assertion with custom handler");

        $assertion.customHandler(function () {
            ok(true, "Custom handler prevents exception");
            return false;
        });
        $assertion.assert(false, "foo");

        $assertion.customHandler(function (expr, arg1, arg2) {
            equal(arg1, "foo", "Multi-part message");
            equal(arg2, "bar", "Multi-part message");
            return false;
        });
        $assertion.assert(false, "foo", "bar");

        $assertion.customHandler(undefined);
    });

    test("Type addition", function () {
        throws(function () {
            $assertion.addType('assert', function () {});
        }, "Attempting to replace core function");

        ok(!$assertion.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        throws(function () {
            $assertion.addType(1, function () {});
        }, "Invalid method name argument throws exception");

        throws(function () {
            $assertion.addType('test', 'foo');
        }, "Invalid validator argument throws exception");

        function validator(expr) {
            // returning a boolean expression to be passed to `.assert`
            return expr === 'test';
        }

        $assertion.addType('test', validator);

        ok($assertion.hasOwnProperty('test'), "New property added to namespace");

        throws(function () {
            $assertion.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        equal($assertion.addType('test', validator), $assertion, "Adding the same validator again (silently)");

        equal($assertion.test('test'), $assertion, "Custom assertion passed");

        throws(function () {
            $assertion.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete $assertion.validators.test;
        delete $assertion.test;
    });

    test("Type addition with override", function () {
        $assertion.addType('test', function () {});

        throws(function () {
            $assertion.addType('test', function () {});
        }, "Attempting to overwrite custom validator");

        $assertion.addType(
            'test',
            function (expr) {return expr === 'overwritten';},
            true
        );

        equal($assertion.test('overwritten'), $assertion, "Custom assertion passed");

        // removing custom handler
        delete $assertion.validators.test;
        delete $assertion.test;
    });

    test("Assertion messages", function () {
        expect(2);

        function testValidator(expr) {
            return expr === 'test';
        }

        $assertion.addType('testTypeWithMessage', testValidator);

        var backup = $assertion.assert;
        $assertion.assert = function (expr, message) {
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

        $assertion.testTypeWithMessage('foo', "Assertion failed", 1);

        $assertion.assert = backup;

        // removing custom handler
        delete $assertion.validators.testTypeWithMessage;
        delete $assertion.testTypeWithMessage;
    });

    test("Multiple type addition", function () {
        ok(!$assertion.hasOwnProperty('test'), "New type is not pre-existing (sanity check)");

        $assertion.addTypes({
            test: function (expr) {
                // returning a boolean expression to be passed to `.assert`
                return expr === 'test';
            }
        });

        equal($assertion.test('test'), $assertion, "Custom assertion passed");

        throws(function () {
            $assertion.test('foo');
        }, "Custom assertion failed");

        // removing custom handler
        delete $assertion.validators.test;
        delete $assertion.test;
    });
}());
