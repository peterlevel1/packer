# packer
pack common js files into a single file

var packer = require('packer');

pack the dir
take js files to single file
and the exports is this dirname's index.js or package.json.main

packer.pack({
	target : 'a dirname which is better to be absolute',
	out : 'a filename which is better to be absolute'
});