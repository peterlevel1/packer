var packer = require('../index.js');
var path = require('path');
packer.pack({
	target : path.resolve('./aaa-2'),
	out : path.resolve('./aaa-2-test.js')
});