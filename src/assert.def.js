/*global $assertion */
(function () {
    "use strict";

    /**
     * @type function
     */
    var customHandler;

    /**
     * Namespace for custom validators
     * @namespace
     */
    $assertion.validators = {};

    /**
     * Asserts an expression.
     * @param {boolean|function} expr Boolean expression or validator function.
     * @returns {$assertion}
     */
    $assertion.assert = function (expr) {
        var args,
            throwException,
            message;

        if (typeof expr === 'function') {
            // expression is a validator
            args = Array.prototype.slice.call(arguments, 1);
            expr = expr.apply(this.validators, args);
        }

        if (!expr) {
            if (typeof customHandler === 'function') {
                // passing control to custom handler
                throwException = customHandler.apply(this, arguments);
            }

            if (throwException !== false) {
                // args may already be calculated
                args = args || Array.prototype.slice.call(arguments, 1);

                // joining message parts together
                message = args.join(' ');
                throw new Error("Assertion failed: " + message);
            }
        }

        return this;
    };

    /**
     * Setter for global handler.
     * @param {function|undefined} value
     * @returns {$assertion}
     */
    $assertion.customHandler = function (value) {
        customHandler = value;
        return this;
    };

    /**
     * Adds a new validator.
     * @param {string} methodName Name of new method
     * @param {function} validator Function validating a given type.
     * In it, `this` will refer to the `validators` namespace containing
     * all available validators. Expected to return boolean.
     * @param {boolean} [allowOverride] Whether to allow overriding existing validators.
     * @returns {$assertion}
     */
    $assertion.addType = function (methodName, validator, allowOverride) {
        this
            .assert(typeof methodName === 'string', "Invalid method name")
            .assert(typeof validator === 'function', "Invalid validator function");

        var that = this,
            validators = this.validators;

        if (!this.hasOwnProperty(methodName) || // doesn't match built-in nor custom methods
            (allowOverride && validators.hasOwnProperty(methodName)) // or matches validator only
            ) {
            // adding validator to validator pool
            validators[methodName] = validator;

            /**
             * Wrapping and adding validator to main namespace
             * @returns {$assertion}
             */
            this[methodName] = function () {
                var success = validator.apply(validators, arguments),
                    args;

                if (!success) {
                    // validation has failed
                    args = Array.prototype.slice.call(arguments);
                    args.unshift(validator);

                    // calling assert with prepared arguments
                    that.assert.apply(that, args);
                }

                // making sure method returns namespace
                return that;
            };
        } else if (validators[methodName] !== validator) {
            this.assert(false, "Custom assertion name ('" + methodName + "') already taken.");
        }

        return this;
    };

    /**
     * Adds new validator(s).
     * In a validator function, `this` will refer to the `$assertion` namespace.
     * Expected to return boolean.
     * IMPORTANT: `.addTypes()` is preferable to `.addType()`, for IDE integration reasons,
     * even when adding a single type.
     * @param {object} methods
     * @param {boolean} [allowOverride] Whether to allow overriding existing validators.
     * @returns {$assertion}
     */
    $assertion.addTypes = function (methods, allowOverride) {
        this.assert(methods instanceof Object, "Invalid methods object");

        var methodName,
            validator;

        for (methodName in methods) {
            if (methods.hasOwnProperty(methodName)) {
                validator = methods[methodName];
                this.addType(methodName, validator, allowOverride);
            }
        }

        return this;
    };
}());
