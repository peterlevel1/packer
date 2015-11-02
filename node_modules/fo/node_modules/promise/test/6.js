
var Promise = require('../index.js');

// console.log(Object.create({}, { x : function () { console.log(1); } }));

var p1 = new Promise({
	x : 1
});

p1.progress(function (v) {
	console.log(v);
})
.done(function (v, opts) {
	console.log(v, opts);
})
.then();

p1.then();
p1.then();
p1.then();
p1.then();

// p1.notify(1);

// setTimeout(function () {
// 	p1.resolve(10);
// }, 1000);