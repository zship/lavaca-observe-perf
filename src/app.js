define(function(require) {

	'use strict';


	var Benchmark = require('Benchmark');
	var Model = require('lavaca/mvc/Model');
	var Collection = require('lavaca/mvc/Collection');
	var currencyFormat = require('mout/number/currencyFormat');


	var ITERATIONS = 1000;

	var item = {
		test: '',
		test2: 0
	};


	var definedChanges = [];
	var definedItem = {
		_data: {
			test: '',
			test2: 0
		},
		get test() {
			return this._data.test;
		},
		set test(val) {
			if (val !== this._data.test) {
				definedChanges.push({
					prop: 'test',
					val: val
				});
			}
			this._data.test = val;
		},
		get test2() {
			return this._data.test2;
		},
		set test2(val) {
			if (val !== this._data.test2) {
				definedChanges.push({
					prop: 'test2',
					val: val
				});
			}
			this._data.test2 = val;
		}
	};


	var observedItem = {
		test: '',
		test2: 0
	};

	var observeChanges = [];
	var observer = new ObjectObserver(observedItem);
	observer.open(function(added, removed, changed, getOldValueFn) {
		observeChanges.push({
			added: added,
			removed: removed,
			changed: changed
		});
	});


	var observedItem2 = {
		test: '',
		test2: 0
	};

	var observeChanges2 = [];
	var observer2 = new ObjectObserver(observedItem2);
	observer2.open(function(added, removed, changed, getOldValueFn) {
		observeChanges2.push({
			added: added,
			removed: removed,
			changed: changed
		});
	});


	var modelChanges = [];
	var model = new Model({
		test: '',
		test2: 0
	});
	model.on('change', function(e) {
		modelChanges.push(e);
	});


	var suite = new Benchmark.Suite();
	suite
		.add('Plain Object (no observing)', function() {
			item.test = 'test';
			item.test2 += 1;
		}, {maxTime: 1})
		.add('Object properties', function() {
			definedItem.test = 'test';
			definedItem.test2 += 1;
		}, {maxTime: 1})
		.add('ObjectObserver', function() {
			observedItem.test = 'test';
			observedItem.test2 += 1;
		}, {maxTime: 1})
		.add('ObjectObserver (excessive dirty checking)', function() {
			observedItem2.test = 'test';
			observedItem2.test2 += 1;
			Platform.performMicrotaskCheckpoint();
		}, {maxTime: 1})
		.add('lavaca/mvc/Model', function() {
			model.set('test', 'test');
			model.set('test2', model.get('test2') + 1);
		}, {maxTime: 1})
		.on('complete', function() {
			this.forEach(function(b) {
				var t = (1/b.hz) * 1000 * 1000;
				console.log(b.name, currencyFormat(b.hz.toFixed(0), 0) + 'hz', currencyFormat(t.toFixed(0), 0) + 'µs');
			});
			console.log('Changes reported', definedChanges.length, observeChanges.length, observeChanges2.length, modelChanges.length);
			setTimeout(function() {
				console.log('Changes reported (async)', definedChanges.length, observeChanges.length, observeChanges2.length, modelChanges.length);
			}, 0);
		});

	suite.run();

});
