/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean');

describe('Protean', function () {
    
    describe('.hashify()', function () {
        
        it('should return an object with keys and values equal to arguments', function () {
            var obj = utils.hashify('A', 'B', 'C');
            obj.should.have.property('A', 'A');
            obj.should.have.property('B', 'B');
            obj.should.have.property('C', 'C');
        });
        
    });
    
    describe('.enumerate()', function () {
        
        it('should return an object with keys from arguments and values enumerated', function () {
            var obj = utils.enumerate('A', 'B', 'C');
            obj.should.have.property('A', 1);
            obj.should.have.property('B', 2);
            obj.should.have.property('C', 3);
        });
    });
    
    describe('.alias()', function () {
        
        it('should forward to the named function', function () {
            var obj = {
                    foo: function (arg) {
                        return arg;
                    },
                    bar: utils.alias('foo')
                };
                
            obj.bar('foo').should.equal('foo');
        });
        
        it('different aliases should be their own functions', function () {
            var obj = {
                    foo: function (arg) {
                        return arg + ':foo';
                    },
                    bar: utils.alias('foo'),
                    buz: function (arg) {
                        return arg + ':buz';
                    },
                    baz: utils.alias('buz')
                };
            
            obj.bar('bar').should.equal('bar:foo');
            obj.baz('baz').should.equal('baz:buz');
            obj.bar('bar').should.equal('bar:foo');
        });
        
    });
    
    describe('classify', function () {
        
        it('should prototype link two functions', function () {
            function Foo () {};
            function Bar () {};
            
            Bar = utils.classify(Foo);
            
            Object.getPrototypeOf(Bar.prototype).
                should.equal(Foo.prototype);
            
            (new Bar()).should.be.an.instanceof(Bar);
            (new Bar()).should.be.an.instanceof(Foo);
        });
        
        it('should return a function if not given one', function () {
            var Bar;
            
            function Foo () {};
            
            Bar = utils.classify(Foo);
            
            Bar.should.be.a('function');
            Object.getPrototypeOf(Bar.prototype).
                should.equal(Foo.prototype);
            (new Bar()).should.be.an.instanceof(Bar);
            (new Bar()).should.be.an.instanceof(Foo);
        });

        it('should automatically call superclass constructor', function () {
            var Bar;
            
            function Foo (arg) { this.foo = arg };
            
            Bar = utils.classify(Foo);
            
            (new Bar('foo')).should.have.property('foo', 'foo');
        });

        it(
            'sublcass._super property should point to superclass.prototype',
            function () {
                var Bar;
            
                function Foo () {};
            
                Bar = utils.classify(Foo);
                Bar._super.should.equal(Foo);
            }
        );
        
        it(
            'instance#_super() method should call method from superclass',
            function () {
                var Foo = utils.classify(Object, {
                        foo: function () {
                            return 'foo';
                        }
                    }),
                    Bar = utils.classify(Foo, {
                        foo: function () {
                            return this._super();
                        }
                    }),
                    Baz = utils.classify(Bar, {
                        foo: function () {
                            return this._super();
                        }
                    }),
                    baz = new Baz();
                
                baz.foo().should.equal('foo');
            }
        );

        it(
            'instance#_super() method should call method from superclass with original arguments',
            function () {
                var Foo = utils.classify(Object, {
                        foo: function (arg) {
                            return arg + '-foo';
                        }
                    }),
                    Bar = utils.classify(Foo, {
                        foo: function (arg) {
                            return this._super();
                        }
                    }),
                    Baz = utils.classify(Bar, {
                        foo: function (arg) {
                            return this._super();
                        }
                    }),
                    baz = new Baz();
                
                baz.foo('foo').should.equal('foo-foo');
            }
        );

        it(
            'instance#_super() method should call method from superclass with passed arguments',
            function () {
                var Foo = utils.classify(Object, {
                        foo: function (arg) {
                            return arg + '-foo';
                        }
                    }),
                    Bar = utils.classify(Foo, {
                        foo: function (arg) {
                            return this._super('baz');
                        }
                    }),
                    Baz = utils.classify(Bar, {
                        foo: function (arg) {
                            return this._super();
                        }
                    }),
                    baz = new Baz();
                
                baz.foo('foo').should.equal('baz-foo');
            }
        );
        
        it(
            'instance#_super does not interfere with instance properties',
            function () {
                var Bar, Baz, obj, other;
                
                function Foo (arg) { this.foo = arg; }
                Foo.prototype = {
                    method: function (arg) {
                        return this.foo + (arg ? arg.toString() : '');
                    }
                };
                
                Bar = utils.classify(Foo, {
                    method: function (arg) {
                        var ret = this._super();
                        ret += arg && arg.method ? arg.method() : '';
                        return ret;
                    }
                });
                
                Baz = utils.classify(Bar, {
                    method: function (arg) {
                        return this._super();
                    },
                    toString: function () {
                        return this.foo;
                    }
                });
                
                obj = new Baz('foo');
                other = new Baz('fuz');
                
                obj.method('foo').should.equal('foofoo');
                other.method('fuz').should.equal('fuzfuz');
                obj.method(other).should.equal('foofuzfuz');
            }
        );
        
        it('_super calls getters/setters', function () {
            var Bar, obj;
            
            function Foo () { this.foo = 'foo'; };
            Foo.prototype = {
                get f () {
                    return this.foo;
                },
                set f (v) {
                    this.foo = v;
                }
            };
            
            Bar = utils.classify(Foo, null, {
                f: {
                    get: function () {
                        return this._super();
                    },
                    set: function (v) {
                        this._super();
                    }
                }
            });
            
            obj = new Bar();
            obj.f.should.equal('foo');
            obj.f = 'baz';
            obj.f.should.equal('baz');
        });
    });
    
    describe('.instantiate()', function () {
        it(
            'should create a new object from constructor function and passed arguments',
            function () {
                var obj;
                
                function Ctor (arg) {
                    this.foo = arg;
                }
                
                obj = utils.instantiate(Ctor, ['foo']);
                obj.should.be.an.instanceof(Ctor);
                obj.should.have.property('foo', 'foo');
            }
        );
    });
    
    describe('.lazily()', function () {
        var obj;
        
        beforeEach(function () {
            obj = {};
            
            utils.lazily(obj, 'foo', function () {
                return 'foo';
            });
        });
        
        it('should define a getter on the supplied object', function () {
            Object.getOwnPropertyDescriptor(obj, 'foo').
                should.have.property('get');
            
            Object.getOwnPropertyDescriptor(obj, 'foo').get.
                should.be.a('function');
        });

        it('when accessed it should return the value', function () {
            obj.foo.should.equal('foo');
        });

        it('after being accessed it should be a plain value', function () {
            var f = obj.foo;
            Object.getOwnPropertyDescriptor(obj, 'foo').
                should.not.have.property('get');
        });
    });
    
});