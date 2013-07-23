/*globals describe, it, before, after, beforeEach, afterEach */

var should = require('should'),
    utils = require('protean'),
    LinkedList = utils.LinkedList,
    ListItem = LinkedList.Item;

describe('LinkedList.Item', function () {
    var item;
    
    beforeEach(function () {
        var p = new ListItem('prev'),
            n = new ListItem('next');
        
        item = new ListItem('current', p, n);
    });
    
    it('should have data, next, and prev properties', function () {
        item.data.should.equal('current');
        item.next.data.should.equal('next');
        item.prev.data.should.equal('prev');
    });
    
    describe('#swap()', function () {
        it('should swap prev and next', function () {
            item.swap();
            item.next.data.should.equal('prev');
            item.prev.data.should.equal('next');
        });
    });

    describe('#insert()', function () {
        it('should insert the item as next', function () {
            var n = new ListItem('foo');
            item.insert(n);
            item.data.should.equal('current');
            item.next.data.should.equal('foo');
            item.next.next.data.should.equal('next');
        });
    });

    describe('#insertBefore()', function () {
        it('should insert the item as prev', function () {
            var n = new ListItem('foo');
            item.insertBefore(n);
            item.data.should.equal('current');
            item.prev.data.should.equal('foo');
            item.prev.prev.data.should.equal('prev');
        });
    });

    describe.skip('#destroy()', function () {
        
    });

});

describe.skip('LinkedList.Cursor', function () {
    
});

describe('Linked List', function () {
    var list;
    
    beforeEach(function () {
        list = new LinkedList();
    });
    
    describe('#get()', function () {
        it('should return the correct item for the given index', function () {
            list.push('foo', 'bar', 'baz').should.equal(3);
            list.get(0).should.equal('foo');
            list.get(1).should.equal('bar');
            list.get(2).should.equal('baz');
        });
        
        it(
            'should retrieve from the end of the list if given a negative index',
            function () {
                list.push('foo', 'bar', 'baz').should.equal(3);
                list.get(-1).should.equal('baz');
                list.get(-2).should.equal('bar');
                list.get(-3).should.equal('foo');
            }
        )
    });
    
    describe.skip('#set()', function () {
        
    });
    
    describe.skip('#insert()', function () {
        
    });

    describe.skip('#insertBefore()', function () {
        
    });

    describe.skip('#remove()', function () {
        
    });
    
    describe('#push()', function () {
        it('should return the length of the list', function () {
            list.push('foo').should.equal(1);
            list.push('bar').should.equal(2);
            list.push('baz').should.equal(3);
        });
        
        it('should push all arguments', function () {
            list.push('foo', 'bar', 'baz').should.equal(3);
            list.get(0).should.equal('foo');
            list.get(1).should.equal('bar');
            list.get(2).should.equal('baz');
        });
    });

    describe('#pop()', function () {
        it('should decrement the length of the list', function () {
            list.push('foo', 'bar', 'baz').should.equal(3);
            list.pop().should.equal('baz');
            list.length.should.equal(2);
            list.pop().should.equal('bar');
            list.length.should.equal(1);
            list.pop().should.equal('foo');
            list.length.should.equal(0);
        });
    });

    describe('#unshift()', function () {
        it('should return the length of the list', function () {
            list.unshift('foo').should.equal(1);
            list.unshift('bar').should.equal(2);
            list.unshift('baz').should.equal(3);
        });
        
        it('should push all arguments', function () {
            list.unshift('foo', 'bar', 'baz').should.equal(3);
            list.get(2).should.equal('foo');
            list.get(1).should.equal('bar');
            list.get(0).should.equal('baz');
        });
    });

    describe('#shift()', function () {
        it('should decrement the length of the list', function () {
            list.unshift('foo', 'bar', 'baz').should.equal(3);
            list.shift().should.equal('baz');
            list.length.should.equal(2);
            list.shift().should.equal('bar');
            list.length.should.equal(1);
            list.shift().should.equal('foo');
            list.length.should.equal(0);
        });
    });
    
    describe('#reverse()', function () {
        it('should reverse the list', function () {
            list.push('foo', 'bar', 'baz').should.equal(3);
            list.reverse();
            list.get(0).should.equal('baz');
            list.get(1).should.equal('bar');
            list.get(2).should.equal('foo');
        });
    });

    describe('#slice()', function () {
        it('should return a LinkedList', function () {
            list.slice().should.be.an.instanceof(LinkedList);
        });
        
        it('should return a subset of the list', function () {
            var sublist;
            
            list.push(1, 2, 3, 4, 5).should.equal(5);
            sublist = list.slice(1, 4);
            
            sublist.get(0).should.equal(2);
            sublist.get(1).should.equal(3);
            sublist.get(2).should.equal(4);
            should.not.exist(sublist.get(3));
        });
    });

    ['forEach', 'each'].
        forEach(function (name) {
            describe('#' + name + '()', function () {
                it('should iterate over every item', function () {
                    var count = 0;
                    
                    list.push(1, 2, 3, 4, 5).should.equal(5);

                    list[name](function (item, idx) {
                        item.should.equal(idx + 1);
                        count++;
                    });
                    
                    count.should.equal(list.length);
                });
            });
        });
    
    describe('#map()', function () {
        it('should return a LinkedList', function () {
            list.map().should.be.an.instanceof(LinkedList);
        });
        
        it('should return a LinkedList with the product of the iterator', function () {
            var mapped;
            
            list.push(1, 2, 3, 4, 5).should.equal(5);
            mapped = list.
                map(function (item, idx, list) {
                    return item % 2;
                });
            
            mapped.get(0).should.equal(1);
            mapped.get(1).should.equal(0);
            mapped.get(2).should.equal(1);
            mapped.get(3).should.equal(0);
            mapped.get(4).should.equal(1);
        });
        
        it('should call the iterator function in the correct scope', function () {
            var scope = { foo: 1 },
                mapped;
            
            list.push(1, 2, 3, 4, 5).should.equal(5);
            mapped = list.
                map(function (item, idx, list) {
                    return item + this.foo;
                }, scope);

            mapped.get(0).should.equal(2);
            mapped.get(1).should.equal(3);
            mapped.get(2).should.equal(4);
            mapped.get(3).should.equal(5);
            mapped.get(4).should.equal(6);
        });
    });
    
    describe('#some()', function () {
        it('should return true if predicate returns true', function () {
            list.push(1, 2, 3, 4, 5);
            list.
                some(function () { return true; }).
                should.equal(true);
        });

        it('should return false if predicate returns false', function () {
            list.push(1, 2, 3, 4, 5);
            list.
                some(function () { return true; }).
                should.equal(true);
        });
        
        it('should stop iterating on first true value', function () {
            var lastIdx;
            
            list.push(1, 2, 3, 4, 5);
            list.
                some(function (item, idx) {
                    lastIdx = idx;
                    return item < 3;
                });
            
            lastIdx.should.equal(2);
        });
    });

    describe('#every()', function () {
        it('should return true if predicate returns true', function () {
            list.push(1, 2, 3, 4, 5);
            list.
                every(function () { return true; }).
                should.equal(true);
        });

        it('should return false if predicate returns false', function () {
            list.push(1, 2, 3, 4, 5);
            list.
                every(function () { return true; }).
                should.equal(true);
        });
        
        it('should stop iterating on first false value', function () {
            var lastIdx;
            
            list.push(1, 2, 3, 4, 5);
            list.
                every(function (item, idx) {
                    lastIdx = idx;
                    return item < 3;
                });
            
            lastIdx.should.equal(2);
        });
    });
    
    describe.skip('#reduce()', function () {
        
    });
    
    describe.skip('#join()', function () {
        
    });
    
    describe.skip('#toArray()', function () {
        
    });
    
});