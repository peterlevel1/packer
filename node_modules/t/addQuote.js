var fs = require('fs');
var readFile = fs.readFile;
var writeFile = fs.writeFile;
var path = require('path');
var repeatString = require('./repeatString.js');
var rline = /\n/g;
var rquote = /'/g;

module.exports = addQuote;

function addQuote(opts, callback) {
	var input = opts.input && path.resolve(opts.input + '');
	if (!input)
		return callback(new Error('addQuote: input -> output, must both exists'));

	var output = opts.output && path.resolve(opts.output + '');
	var tab = opts.itab != null
			? repeatString(opts.itab, '\t')
			: '';

	readFile(input, 'utf8', function (err, str) {
		if (err)
			return callback(err);

		str = str.split(rline)
			.map(function (one) {
				return tab
					+	"'"
					+ one.replace(rquote, '\\\'')
					+ "'";
			})
			.join(' +\n');

		if (!output)
			return callback(null, str);

		writeFile(output, str, function (err) {
			if (err)
				return callback(err);
			callback(null, str);
		});
	});
};

var amdHead = "define(function (require) {\n\treturn '' +\n";
var amdTail = ';\n});';
var rinclude = /<%-[\s\t]*include(\([^)]+\));?[\s\t]*%>/g;

addQuote.amd = function (opts, callback) {
	var output = opts.output && path.resolve(opts.output + '');
	opts = {
		input : opts.input,
		itab : opts.itab
	};
	addQuote(opts, function (err, str) {
		if (err)
			return callback(err);

		str = amdHead + str.replace(rinclude, '\' + require$1 + \'') + amdTail;

		if (!output)
			return callback(null, str);

		writeFile(output, str, function (err) {
			if (err)
				return callback(err);
			callback(null, str);
		});
	});
};