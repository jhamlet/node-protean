/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean'),
    classify = utils.classify;

function benchmark (times, fn) {
    var start = Date.now();
    
    while (times--) {
        fn();
    }
    
    return (Date.now() - start) + 'ms';
}

describe('protean._super performance', function () {
    var iterations = 10000;
    
    describe('directed function calls', function () {
        
        it('should be fast', function () {
            var a = { foo: function () { return 'foo'; } },
                b = Object.create(a, {
                    foo: { value: function () {
                        return a.foo.apply(this, arguments);
                    } }
                }),
                c = Object.create(a, {
                    foo: { value: function () {
                        return b.foo.apply(this, arguments);
                    } }
                }),
                d = Object.create(a, {
                    foo: { value: function () {
                        return c.foo.apply(this, arguments);
                    } }
                }),
                e = Object.create(a, {
                    foo: { value: function () {
                        return d.foo.apply(this, arguments);
                    } }
                }),
                f = Object.create(e);
            
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
        
    });
    
    describe('_super() bound between each function', function () {
        
        function inherit (superobj, props) {
            var subobj = Object.create(superobj),
                key;
            
            for (key in props) {
                if (superobj[key]) {
                    subobj[key] = function () {
                        var ret;
                        
                        this._super = superobj[key];
                        ret = props[key].apply(this, arguments);
                        delete this._super;
                        
                        return ret;
                    }
                }
                else {
                    subobj[key] = props[key];
                }
            }
            
            return subobj;
        }
        
        it('should be a little slower', function () {
            var a = { foo: function () { return 'foo' } },
                b = inherit(a, {
                        foo: function () {
                            return this._super();
                        }
                    }),
                c = inherit(b, {
                        foo: function () {
                            return this._super();
                        }
                    }),
                d = inherit(c, {
                        foo: function () {
                            return this._super();
                        }
                    }),
                e = inherit(d, {
                    foo: function () {
                        return this._super();
                    }
                }),
                f = Object.create(e);
            
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
        
    });
    
    describe('protean._super()', function () {
        
        it('should be slow, but not that slow...', function () {
            var a = { foo: function () { return 'foo'; } },
                b = Object.create(a, {
                    foo: { value: function () {
                        return this._super();
                    } }
                }),
                c = Object.create(a, {
                    foo: { value: function () {
                        return this._super();
                    } }
                }),
                d = Object.create(a, {
                    foo: { value: function () {
                        return this._super();
                    } }
                }),
                e = Object.create(a, {
                    foo: { value: function () {
                        return this._super();
                    } }
                }),
                f = Object.create(e);
            
            a._super = utils._super;
            
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
        
    });
});