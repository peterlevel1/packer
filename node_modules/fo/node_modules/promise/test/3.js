var Promise = require('../index.js');

var p1 = new Promise({
	x : 1
});

p1.then(function (v, opt) {
	console.log(v, opt);
	throw new Error('-------------');
})
.catch(function (e) {
	console.log(e);
});

setTimeout(function () {
	p1.resolve('333333333333');
	console.log(p1.isResolved(), 'sss');
	setTimeout(function () {
		console.log(p1.value());
	}, 1000);
	// p1.reject(new Error('heihei'));
}, 1000);