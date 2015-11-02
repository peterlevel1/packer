var Promise = require('../index.js');

var factory = Promise.factory;

var p4 = new Promise({x : 4});
p4.resolve(1);

factory('aaa').waterFall([
	factory(function (s) {
		setTimeout(function () {
			s(1, '= p1 =');
		}, 1000);
	})
	.progress(function (v) {
		console.log(v, '{}{}');
		return v + 1;
	}),

	factory(function (s) {
		setTimeout(function () {
			s(2, '= p1 =');
		}, 1000);
	})
	.progress(function (v) {
		console.log(v);
		return v + 1;
	}),

	factory(function (s) {
		setTimeout(function () {
			s(3, '= p2 =');
		}, 200);
	})
	.progress(function (v) {
		console.log(v);
		return v + 1;
	})
])
.then(function (v) {
	console.log(v, 'finally');
});

Promise.getPromise('aaa').resolve(10);
// p4.done(function (v) {
// 	console.log(v, '+++');
// 	return 'p5: haha';
// })
// .catch(Promise.logError);


// p4.reject(1);

// setTimeout(function () {
// 	console.log('done');
// }, 2000);