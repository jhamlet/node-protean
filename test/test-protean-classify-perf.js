/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean'),
    classify = utils.classify;

function benchmark (times, fn) {
    var start = Date.now(),
        i = times;
    
    while (i--) {
        fn();
    }
    
    return (Date.now() - start) + 'ms';
}

describe('Protean - classify - performance', function () {
    var times = 10000;
    
    describe('prototype function calls', function () {
        var a = { foo: function () { return 'foo'; }},
            b = Object.create(a, {
                    foo: { value: function () {
                        return a.foo.call(this);
                    }}
                }),
            c = Object.create(b, {
                    foo: { value: function () {
                        return b.foo.call(this);
                    }}
                }),
            d = Object.create(c, {
                    foo: { value: function () {
                        return c.foo.call(this);
                    } }
                }),
            e = Object.create(d, {
                    foo: { value: function () {
                        return d.foo.call(this);
                    } }
                }),
            f = Object.create(e);
            
        it('should be fast', function () {
            var result = benchmark(times, function () {
                f.foo();
            });
            console.log(result);
        });
    });
    
    describe('_super function calls', function () {
        var a = { foo: function () { return 'foo'; }},
            b = Object.create(a, {
                    foo: { value: function () {
                        return b.foo._super.apply(this);
                    }}
                }),
            c = Object.create(b, {
                    foo: { value: function () {
                        return c.foo._super.apply(this);
                    }}
                }),
            d = Object.create(c, {
                    foo: { value: function () {
                        return d.foo._super.apply(this);
                    } }
                }),
            e = Object.create(d, {
                    foo: { value: function () {
                        return e.foo._super.apply(this);
                    } }
                }),
            f = Object.create(e);
        
        a._super = classify._super;
        
        it('should be slower', function () {
            var result;
            classify.linkSupers(f, 'foo');
            result = benchmark(times, function () {
                f.foo();
            });
            console.log(result);
        });
    });
});
