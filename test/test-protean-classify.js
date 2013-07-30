/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean'),
    classify = utils.classify;

describe('protean', function () {
    var Foo;
    
    before(function () {
        Foo = classify({
                constructor: function (arg) {
                    this.foo = arg;
                }
            });
    });

    describe('.inherit(superclass, [subclass], [props], [properties])', function () {
        it('should correctly inherit from superclass', function () {
            var Bar = utils.inherit(Foo);
            Bar._proto.should.equal(Foo.prototype);
            (new Bar()).should.be.an.instanceof(Foo);
        });
        
        it('getters/setters should be preserved', function () {
            var Bar = utils.inherit(Foo, {
                    constructor: function (arg) {
                        Bar._super.call(this, arg);
                    },
                    get bar () {
                        return this.foo;
                    },
                    set bar (v) {
                        this.foo = v;
                    }
                }),
                obj;
            
            Bar.prototype.__lookupGetter__('bar').should.be.a('function');
            Bar.prototype.__lookupSetter__('bar').should.be.a('function');
            
            obj = new Bar('bar');
            obj.bar.should.equal('bar');
            obj.bar = 'buz';
            obj.foo.should.equal('buz');
        });
        
        it('should extend non-protean classes', function () {
            var EM = require('events').EventEmitter,
                Foo, obj;
            
            Foo = utils.inherit(EM, {
                constructor: function Foo () {
                    this._super();
                }
            });
            
            obj = new Foo();
            
            obj.should.be.an.instanceof(EM);
            obj.should.have.property('domain', null);
            obj.should.have.property('_events');
            obj.should.have.property('_maxListeners', 10);
        });
    });
    
    describe('.classify(props, [properties])', function () {
        it('should return a constructor function', function () {
            Foo.should.be.a('function');
            (new Foo()).should.be.an.instanceof(Foo);
        });
        
        it('should correctly call the constructor function', function () {
            (new Foo('foo')).foo.should.equal('foo');
        });
        
        it('should have an \'extend\' method', function () {
            Foo.extend.should.be.a('function');
        });

        it(
            'should have a \'_proto\' property that points to the superclass\'s prototype',
            function () {
                Foo._proto.should.equal(Object.prototype);
            }
        );
        
        it('extending a class should be an instance of the superclass', function () {
            var Bar = Foo.extend({});
            Bar._proto.should.equal(Foo.prototype);
            (new Bar()).should.be.an.instanceof(Bar);
            (new Bar()).should.be.an.instanceof(Foo);
        });
    });
    
    describe('.getKeyForCaller(obj, [caller])', function () {
        it('should return the calling functions object key', function () {
            var obj = Object.create({
                    foo: function () {
                        return utils.getKeyForCaller(this);
                    },
                    bar: function () {
                        return this.foo();
                    },
                    baz: function () {
                        return utils.getKeyForCaller(this, this.baz.caller);
                    },
                    buz: function () {
                        return this.baz();
                    }
                });

            obj.bar().should.equal('bar');
            obj.buz().should.equal('buz');
        });
        
        it('should correctly get a bound function key', function () {
            var obj = Object.create({
                    foo: function () {
                        return utils.getKeyForCaller(this);
                    },
                    bar: function () {
                        return this.foo();
                    }
                });
                
            obj.bar = obj.bar.bind(obj);
            obj.bar().should.equal('bar');
        });
    });
    
    describe('.getPrototypeChainForKey(obj, key)', function () {
        it('should return an array objects with specified key', function () {
            var a = { foo: function () {} },
                b = Object.create(a),
                c = Object.create(b, { foo: { value: function () {} } }),
                d = Object.create(c),
                e = Object.create(d, { foo: { value: function () {} } }),
                f = Object.create(e),
                chain = utils.getPrototypeChainForKey(f, 'foo');
            
            chain.length.should.equal(3);
            chain[0].should.equal(e);
            chain[1].should.equal(c);
            chain[2].should.equal(a);
        });
    });
    
    describe('.linkSuperChain(obj, key)', function () {
        it('should place \'_super\' properties on functions that point to the next function in the prototype chain', function () {
            var a = { foo: function () {} },
                b = Object.create(a),
                c = Object.create(b, { foo: { value: function () {} } }),
                d = Object.create(c),
                e = Object.create(d, { foo: { value: function () {} } }),
                f = Object.create(e);

            utils.linkSuperChain(f, 'foo');

            e.foo._super.should.equal(c.foo);
            c.foo._super.should.equal(a.foo);
            should.not.exist(a.foo._super);
        });
        
        it('should do the same for getters/setters', function () {
            var a = {
                    get foo () {},
                    set foo (v) {}
                },
                b = Object.create(a),
                c = Object.create(b, {
                    foo: {
                        get: function () {},
                        set: function () {}
                    }
                }),
                d = Object.create(c),
                e = Object.create(d, {
                    foo: {
                        get: function () {},
                        set: function () {}
                    }
                }),
                f = Object.create(e);
            
            utils.linkSuperChain(f, 'foo');
            
            should.exist(e.__lookupGetter__('foo')._super);
            e.__lookupGetter__('foo')._super.should.equal(c.__lookupGetter__('foo'));
            should.exist(e.__lookupSetter__('foo')._super);
            e.__lookupSetter__('foo')._super.should.equal(c.__lookupSetter__('foo'));
            
            should.exist(c.__lookupGetter__('foo')._super);
            c.__lookupGetter__('foo')._super.should.equal(a.__lookupGetter__('foo'));
            should.exist(c.__lookupSetter__('foo')._super);
            c.__lookupSetter__('foo')._super.should.equal(a.__lookupSetter__('foo'));
        });
    });
    
    describe('._super([...rest])', function () {
        it('should call the next method in the prototype chain', function () {
            var a = { foo: function () { return 'foo'; } },
                b = Object.create(a),
                c = Object.create(b, {
                    foo: { value: function () {
                        // c
                        return this._super();
                    } }
                }),
                d = Object.create(c),
                e = Object.create(d, {
                    foo: { value: function () {
                        // d
                        return this._super();
                    } }
                }),
                f = Object.create(e);
            
            a._super = utils._super;
            // Object.defineProperty(a, '_super', { get: utils.getSuper });
            
            f.foo().should.equal('foo');
        });

        it('should propagate initial arguments', function () {
            var a = { foo: function (arg) { return 'foo-' + arg; } },
                b = Object.create(a),
                c = Object.create(b, {
                    foo: { value: function (arg) {
                        return this._super();
                    } }
                }),
                d = Object.create(c),
                e = Object.create(d, {
                    foo: { value: function (arg) {
                        return this._super();
                    } }
                }),
                f = Object.create(e);
            
            a._super = utils._super;
            // Object.defineProperty(a, '_super', { get: utils.getSuper });
            
            f.foo('foo').should.equal('foo-foo');
        });

        it('if arguments are given they should override initial arguments', function () {
            var a = { foo: function (arg) { return 'foo-' + arg; } },
                b = Object.create(a),
                c = Object.create(b, {
                    foo: { value: function (arg) {
                        // c
                        return this._super('bar');
                    } }
                }),
                d = Object.create(c),
                e = Object.create(d, {
                    foo: { value: function (arg) {
                        // d
                        return this._super();
                    } }
                }),
                f = Object.create(e);
            
            a._super = utils._super;
            // Object.defineProperty(a, '_super', { get: utils.getSuper });
            
            f.foo('foo').should.equal('foo-bar');
        });
    });
});
