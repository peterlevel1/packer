var Promise = require('../index.js');

var factory = Promise.factory;

factory().race([
	function (v) {
		var f = factory();
		setTimeout(function () {
			f.resolve(10);
		}, 1000);
		return f;
	},

	function (v) {
		var f = factory();
		setTimeout(function () {
			f.resolve(20);
		}, 10);
		return f;
	},

	function (v) {
		var f = factory();
		setTimeout(function () {
			f.resolve(30);
		}, 100);
		return f;
	}
])
.then(function (v) {
	console.log('++++++++', v);
});