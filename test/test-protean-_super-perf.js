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
            
            a._super = utils._super;
        }
        
        it('create and then call', function () {
            createChain();
            console.log(benchmark(iterations, function () {
                f.foo().should.equal('foo');
            }));
        });
    });
    
    describe('protean class chain -- _super', function () {
        var instance;
        
        before(function () {
            var a = utils.classify({
                    constructor: function (arg) {
                        this._foo = arg;
                    },
                    foo: function () {
                        return this._foo;
                    }
                }),
                b = a.extend({
                    foo: function () {
                        return this._super();
                    }
                }),
                c = b.extend({
                    constructor: function () {
                        this._super('bar');
                    },
                    foo: function () {
                        return this._super();
                    }
                }),
                d = c.extend({
                    foo: function () {
                        return this._super();
                    }
                }),
                e = d.extend({
                    foo: function () {
                        return this._super();
                    }
                });
                
            instance = new e();
        });
        
        it('should take some time', function () {
            console.log(benchmark(iterations, function () {
                instance.foo().should.equal('bar');
            }));
        });
    });

    describe('protean class chain -- Class.superproto.method.apply()', function () {
        var instance;
        
        before(function () {
            var a = utils.classify({
                    constructor: function (arg) {
                        this._foo = arg;
                    },
                    foo: function () {
                        return this._foo;
                    }
                }),
                b = a.extend({
                    foo: function () {
                        return b.superproto.foo.apply(this);
                    }
                }),
                c = b.extend({
                    constructor: function () {
                        return c.superclass.apply(this, ['bar']);
                    },
                    foo: function () {
                        return c.superproto.foo.apply(this);
                    }
                }),
                d = c.extend({
                    foo: function () {
                        return d.superproto.foo.apply(this);
                    }
                }),
                e = d.extend({
                    foo: function () {
                        return e.superproto.foo.apply(this);
                    }
                });
                
            instance = new e();
        });
        
        it('should take some time', function () {
            console.log(benchmark(iterations, function () {
                instance.foo().should.equal('bar');
            }));
        });
    });
});
