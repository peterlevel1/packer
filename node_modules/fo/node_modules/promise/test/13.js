var Promise = require('../index.js');

var factory = Promise.factory;

var p1 = new Promise({x : 1})
p1.then(function (v) {
	console.log(v);
});
var p2 = new Promise({x : 2});
p2.then(function (v) {
	console.log(v);
});
var p3 = new Promise({x : 3});
p3.then(function (v) {
	console.log(v);
});
var p4 = new Promise({x : 4});
p4.then(function (v, opts) {
	console.log(v, opts);
});

Promise.resolveAll([p1, 1], [p2, 2], [p3, 3], [p4, 4]);
