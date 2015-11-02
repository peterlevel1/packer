var Promise = require('../index.js');

// var fs = require('fs');

// readFile = Promise.nodeify(fs.readFile);

// readFile('./1.js', function (v) {
// 	console.log(v + '');
// });


var factory = Promise.factory;
var p4 = new Promise()
	.setOptions({
		timeout : 2,
		timeoutCallback : function (v) {
			console.log('{{{{{' + v + '}}}}}');
		}
	})
	.when([factory(function (s, f) {
			setTimeout(function () {
				f(new Error('p1: failed'));
			}, 1000);
		}),
		factory(function (s) {
			setTimeout(function () {
				s(2);
			}, 20);
		})
	])
	.done(function (v) {
		console.log(v, '------------');
		return 'aaaaaa';
	})
	.fail(function (v) {
		console.log(v, '++++++++++++');
		return 'error, ++++';
	})
	.ready()
	.then(function (v) {
		console.log(v, '|||');
	})
	.catch(Promise.logError);

// p4.resolve(1);