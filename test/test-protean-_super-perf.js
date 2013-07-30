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
    var iterations = 10000,
        a, b, c, d, e, f;
    
    function createChain () {
        a = { foo: function () { return 'foo'; } };
        b = Object.create(a, {
            foo: { value: function () {
                return a.foo.apply(this, arguments);
            } }
        });
        c = Object.create(a, {
            foo: { value: function () {
                return b.foo.apply(this, arguments);
            } }
        });
        d = Object.create(a, {
            foo: { value: function () {
                return c.foo.apply(this, arguments);
            } }
        });
        e = Object.create(a, {
            foo: { value: function () {
                return d.foo.apply(this, arguments);
            } }
        });
        f = Object.create(e);
    }
    
    describe('direct function calls', function () {
        it('create and then call', function () {
            createChain();
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });

        it.skip('create and call each time', function () {
            console.log(benchmark(iterations, function () {
                createChain();
                f.foo().should.equal('foo');
            }));
        });
    });
    
    describe('original _super() implementation', function () {
        var a, b, c, d, e, f;
        
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
        
        function createChain () {
            a = { foo: function () { return 'foo' } };
            b = inherit(a, {
                foo: function () {
                    return this._super();
                }
            });
            c = inherit(b, {
                foo: function () {
                    return this._super();
                }
            });
            d = inherit(c, {
                foo: function () {
                    return this._super();
                }
            });
            e = inherit(d, {
                foo: function () {
                    return this._super();
                }
            });
            f = Object.create(e);
        }
        
        it('create and then call', function () {
            createChain();
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
        
        it.skip('create and call each time', function () {
            console.log(benchmark(iterations, function () {
                createChain();
                f.foo().should.equal('foo');
            }));
        });
        
    });
    
    describe('protean._super()', function () {
        var a, b, c, d, e, f;
        
        function createChain () {
            a = { foo: function () { return 'foo'; } };
            b = Object.create(a, {
                foo: { value: function () {
                    return this._super();
                } }
            });
            c = Object.create(b, {
                foo: { value: function () {
                    return this._super();
                } }
            });
            d = Object.create(c, {
                foo: { value: function () {
                    return this._super();
                } }
            });
            e = Object.create(d, {
                foo: { value: function () {
                    return this._super();
                } }
            });
            f = Object.create(e);
            
            Object.defineProperty(a, '_super', { get: utils.getSuper });
            // utils.linkSuperChain(f, 'foo');
        }
        
        it('create and then call', function () {
            createChain();
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
        
        it.skip('create and and call each time', function () {
            console.log(benchmark(iterations, function () {
                createChain();
                f.foo().should.equal('foo');
            }));
        });
    });
});
