define(function (require, exports, module) {
	var a = require('./a');
	console.log(exports);
	console.log(module);
	return {
		a : a,
		b : {
			x : 2
		}
	}
})