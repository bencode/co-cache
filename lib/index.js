var assert = require('assert');
var co = require('co');


/**
 * Create an instance for cache a group of generator
 */
module.exports = function() {
    var cache = {};

    /**
     * try get item from cache or generator
     *
     * @param {String|Number} key
     * @param {Generator|GeneratorFunction|Function} obj
     *
     * @return {Object}
     */
    return function*(key, obj) {
        var item = cache[key];
        if (item) {
            if (isPromise(item)) {
                item = cache[key] = yield item;
            }
            return item;
        }

        assert(obj, 'obj required');

        item = cache[key] = toPromise.call(this, obj);
        item = cache[key] = yield item;
        return item;
    };
};


function toPromise(obj) {
    if (isGeneratorFunction(obj) || isGenerator(obj)) {
        return co.call(this, obj);
    }

    if (typeof obj === 'function') {
        obj = obj.call(this);
        if (isPromise(obj)) {
            return obj;
        } else {
            throw new TypeError('function should return a promise object');
        }
    }

    throw new TypeError('You may only cache generator, ' +
            'but the following object was passed: ' + String(obj));
}


function isPromise(obj) {
    return typeof obj.then === 'function';
}


function isGenerator(obj) {
    return typeof obj.next === 'function' &&
            typeof obj.throw === 'function';
}


function isGeneratorFunction(obj) {
    var constructor = obj.constructor;
    if (!constructor) {
        return false;
    }
    if (constructor.name === 'GeneratorFunction' ||
            constructor.displayName === 'GeneratorFunction') {
        return true;
    }
    return isGenerator(constructor.prototype);
}