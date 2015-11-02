var packer = require('../index.js');
var path = require('path');
packer.pack({
	target : path.resolve('../../t'),
	out : path.resolve('ninja-1-2.js')
})