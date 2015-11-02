
var Promise = require('../index.js');

var p1 = new Promise(function (s) {
	setTimeout(function () { s(1) }, 1000);
});
var p2 = new Promise(function (s) {
	setTimeout(function () { s(2) }, 1000);
});
var p3 = new Promise(function (s, f) {
	setTimeout(function () { f('fail') }, 1000);
});

var p4 = new Promise()
.when(p1, p2, p3)
.then(function (v) {
	console.log(v);
});