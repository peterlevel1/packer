
var Promise = require('../index.js');

new Promise(function (s, f) {
	setTimeout(function () {
		s(1);
	})
})
.then(function (v) {
	console.log(v);
	return new Promise(function (s, f) {
		setTimeout(function () {
			s(2);
		}, 1000)
	})
})
.then(function (v) {
	console.log(v);
	return new Promise(function (s, f) {
		setTimeout(function () {
			f(3);
		})
	})
})
.catch(function (v) {
	console.log('fail', v);
	new Promise(function (s, f) {
		setTimeout(function () {
			s(4);
		})
	})
	.then(function (v) {
		console.log(v);
	})
})
.then(function (v) {
	console.log(v);
})