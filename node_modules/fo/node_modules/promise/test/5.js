
var Promise = require('../index.js');

var p1 = new Promise(function (s) {
	setTimeout(function () { s(1) }, 1000);
});
var p2 = new Promise(function (s) {
	setTimeout(function () { s(new Error('p2: fail')) }, 1000);
});
var p3 = new Promise(function (s, f) {
	setTimeout(function () { f(new Error('p3: fail')) }, 1000);
});

var p4 = new Promise().whenAnyResolved(p1, p2, p3)
.done(function (v) {
	console.log(v);
});

p4.catch(Promise.whenFail);/**/