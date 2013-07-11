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
    
});