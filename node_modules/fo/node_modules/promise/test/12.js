var Promise = require('../index.js');

var factory = Promise.factory;
var f1 = factory();

f1.waterFall([
	function (v) {
		console.log(v);
		var f = factory();
		setTimeout(function () {
			f.resolve(10);
		}, 1000);
		return f;
	},

	function (v) {
		console.log(v);
		var f = factory();
		setTimeout(function () {
			f.resolve(20);
		}, 1);
		return f;
	},

	function (v) {
		console.log(v);
		var f = factory();
		setTimeout(function () {
			f.resolve(30);
		}, 1000);
		return f;
	}
])
.then(function (v) {
	console.log('++++++++', v);
});

f1.resolve(1);