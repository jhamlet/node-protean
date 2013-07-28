/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean'),
    classify = utils.classify;

describe('Protean', function () {
    
    describe('.getKeyOfCaller(obj, [caller])', function () {
        it('should return the calling function\'s \'property\' name', function () {
            var obj = {
                    foo: function () {
                        return utils.getKeyOfCaller(this);
                    },
                    bar: function () {
                        return this.foo();
                    }
                };
            
            obj.bar().should.equal('bar');
        });

        it('should not return the calling function\'s name', function () {
            var obj = {
                    foo: function () {
                        return utils.getKeyOfCaller(this);
                    },
                    bar: function doBar () {
                        return this.foo();
                    }
                };
            
            obj.bar().should.not.equal('doBar');
        });
    });
    
    describe('.getPrototypeChainFor(obj, key)', function () {
        it('should return the correct object order', function () {
            var a = { foo: 'foo' },
                b = Object.create(a),
                c = Object.create(b, {foo: {value: 'bar'}}),
                d = Object.create(c),
                e = Object.create(d, {foo: {value: 'baz'}}),
                chain = utils.getPrototypeChainFor(e, 'foo');
            
            chain.length.should.equal(3);
            chain[0].should.equal(e);
            chain[1].should.equal(c);
            chain[2].should.equal(a);
            
            chain.
                map(function (obj) {
                    return obj.foo;
                }).
                join(',').
                should.equal('baz,bar,foo');
        });
    });
    
    describe('classify', function () {
        describe('.linkSupers(obj, name)', function () {
            it('should correctly link super functions', function () {
                var a = { foo: function () { return 'foo'; } },
                    b = Object.create(a),
                    c = Object.create(b, {
                        foo: { value: function () {} }
                    }),
                    d = Object.create(c),
                    e = Object.create(d, {
                        foo: { value: function () {} }
                    });
                
                classify.linkSupers(e, 'foo');
                e.foo.__super__.should.equal(c.foo);
                c.foo.__super__.should.equal(a.foo);
            });

            it('should correctly link super getter/setters', function () {
                var a = { get foo () { return 'foo'; } },
                    b = Object.create(a),
                    c = Object.create(b, {
                        foo: { get: function () {} }
                    }),
                    d = Object.create(c),
                    e = Object.create(d, {
                        foo: { get: function () {} }
                    });

                classify.linkSupers(e, 'foo');
                
                e.__lookupGetter__('foo').__super__.
                    should.equal(c.__lookupGetter__('foo'));

                c.__lookupGetter__('foo').__super__.
                    should.equal(a.__lookupGetter__('foo'));
            });
        });
        
        describe('._super([...rest])', function () {
            it('should correctly call super functions', function () {
                var a = { foo: function () { return 'foo'; } },
                    b = Object.create(a),
                    c = Object.create(b, {
                        foo: { value: function () { return this._super(); } }
                    }),
                    d = Object.create(c),
                    e = Object.create(d, {
                        foo: { value: function () { return this._super(); } }
                    });
                
                a._super = classify._super;
                a.foo().should.equal('foo');
            });

            it('should pass initial arguments', function () {
                var a = { foo: function (arg) { return 'foo-' + (arg || ''); } },
                    b = Object.create(a),
                    c = Object.create(b, {
                        foo: { value: function (arg) { return this._super(); } }
                    }),
                    d = Object.create(c),
                    e = Object.create(d, {
                        foo: { value: function (arg) { return this._super(); } }
                    });
                
                a._super = classify._super;
                a.foo().should.equal('foo-');
                a.foo('bar').should.equal('foo-bar');
            });

            it('should override initial arguments if arguments provided', function () {
                var a = { foo: function (arg) { return 'foo-' + (arg || ''); } },
                    b = Object.create(a),
                    c = Object.create(b, {
                        foo: { value: function (arg) { return this._super('baz'); } }
                    }),
                    d = Object.create(c),
                    e = Object.create(d, {
                        foo: { value: function (arg) { return this._super(); } }
                    });
                
                a._super = classify._super;
                e.foo().should.equal('foo-baz');
                e.foo('bar').should.equal('foo-baz');
            });
        });
    });
    
});