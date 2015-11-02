

var Promise = require('../index.js');

var p1 = new Promise(function (s) {
	setTimeout(function () { s(1) }, 1000);
});
var p2 = new Promise(function (s) {
	setTimeout(function () { s(2) }, 100);
});
var p3 = new Promise(function (s, f) {
	setTimeout(function () { f(new Error('aaaa')) }, 500);
});

// new Promise().race(p1, p2, p3)
// .then(function (v) {
// 	console.log(v);
// });
new Promise({ x : 1 }).whenOneResolved(2, [p1, p2, p3])
.then(function (v, opts) {
	console.log(v, opts);
})
.catch(function (v, opts) {
	console.log(arguments);
});