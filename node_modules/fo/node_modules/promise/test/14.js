
var Promise = require('../index.js');
var p3 = new Promise({x : 3, name : 'x3'});
p3.then(function (v) {
	console.log(v);
});
var p4 = new Promise({x : 4, name : 'x4'});
p4.then(function (v, opts) {
	console.log(v, opts);
});

Promise.resolveAll([p3, 3], [p4, 4]);

Promise.reset('x4');
Promise.getPromise('x4')
.then(function (v, opts) {
	console.log(v, opts);
});

Promise.getPromise('x4').resolve(1);