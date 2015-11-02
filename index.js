var fs = require('fs');
var path = require('path');
var util = require('util');

var t = require('t');
var fo = require('fo');
var async = fo._;

var rCommonjsRequire = /require\s*\(\s*(["'])([^'"\s]+)\1\s*\)/g;
var pSlice = Array.prototype.slice;

function __getAbsUrl(url) {
	return path.isAbsolute(url)
		? url
		: path.join(__dirname, url);
}

function error(err) {
	throw err;
}

function noop() {}

var packer = {};
module.exports = packer;

packer.isPacking = false;

packer.box = [];

packer.setDesc = function (config) {
	if (packer.isPacking) {
		return;
	}
	packer.config = config;

	packer.desc = {
		filenames : [],
		dirnames : [],
		files : [],
		// set paths map
		paths : {},
		// set baseUrl
		baseUrl : '',
	};

	packer.rootNode = null;
	packer.nodes = {};
	packer.arrNodes = [];
};

packer.isRelative = function (url) {
	return /^[.]+\//.test(url);
};

packer.getStat = function (url, callback) {
	fs.stat(url, function (err, stat) {
		if (err == null) {
			return callback(null, url, stat);
		}

		if (/\.(js|json|node)$/.test(url)) {
			return callback(new Error('getStat: wrong url: ' + url));
		}

		fs.stat(url + '.js', function (err, stat) {
			if (err == null) {
				return callback(null, url + '.js', stat);
			}

			fs.stat(path.join(url, 'index.js'), function (err, stat) {
				if (err == null) {
					return callback(null, path.join(url, 'index.js'), stat);
				}

				return callback(new Error('getStat: wrong url: ' + url));
			});
		});
	});
};

packer.pack = function (opts) {
	if (!opts.target) {
		throw new Error('no target: ' + opts);
	}

	if (packer.isPacking) {
		packer.box.push(opts);
		return;
	}
	packer.setDesc(opts);
	packer.isPacking = true;

	var target = path.isAbsolute(opts.target)
		? opts.target
		: path.join(process.cwd(), target);

	packer.getStat(target, function (err, url, stat) {
		if (err) {
			throw err;
		}

		// hen first? egg first?
		// I choose hen!
		// as only hen -> egg -> hen || cock
		// if egg -> cock, cock can't make eggs;
		if (stat.isDirectory()) {
			packDir(url);
		} else {
			console.log('packer.pack: not a dir');
			console.log('if egg -> cock, cock can\'t make eggs;');
		}
	});
};

function packDir(url) {
	var desc = packer.desc;

	function onFile(file, next) {
		var dirNode = packer.nodes[path.dirname(file)];
		if (!dirNode) {
			throw new Error(file + ': file no parent:\n ' + packer.nodes + '');
		}
		dirNode.filenames.push(file);
		desc.filenames.push(file);
		desc.files.push(file);

		fo.readFile([file, 'utf8'])
		.then(function (str) {
			var fileNode = new File({
				filename : file,
				textContent : str
			});
			packer.nodes[file] = fileNode;
			dirNode.appendChild(fileNode);
			next();
		}, next);
	}

	function onDir(dir) {
		var dirNode = new Dir({
			dirname : dir
		});
		packer.nodes[dir] = dirNode;
		desc.dirnames.push(dir);
		desc.files.push(dir);

		if (!packer.rootNode) {
			packer.rootNode = dirNode;
			packer.rootNode.parentNode = null;
		} else {
			var parentNode = packer.nodes[path.dirname(dir)];
			if (!parentNode) {
				throw new Error(dir + ': dir no parent:\n ' + packer.nodes + '');
			}
			parentNode.appendChild(dirNode);
		}
	}

	function onDone(err) {
		if (err) {
			throw err;
		}

		initNodes(desc);
	}

	fo.walkdir(url, onFile, onDir, onDone);
}

function trimComments(str) {
	return str.replace(/\/\/[^\n]+?\n/g, '').replace(/\/\*[\s\S]+?\*\//g, '');
}

function getBuffers(node, bufs) {
	var isFirst = !bufs;
	bufs = bufs || [];

	if (node.requireArgs) {
		node.requireArgs.forEach(function (url) {
			var innerNode = packer.nodes[url];
			if (!innerNode) {
				return;
			}
			if (innerNode.requireArgs) {
				getBuffers(innerNode, bufs);
			}
			bufs.push(innerNode);
		});
	}

	if (isFirst) {
		bufs.push(node);
	}

	return bufs;
}

function getMainNode(target) {
	target = target || 'index';
	var mainNode;

	if (packer.arrNodes[0].isDirectory) {
		packer.arrNodes[0].children.forEach(function (node) {
			if (!node.isFile) {
				return;
			}
			if (!mainNode) {
				if (node.name === target) {
					mainNode = node;
				} else if (node.name === 'package' && node.suffix === 'json') {
					var json;

					try {
						json = JSON.parse(node.textContent);
					} catch (err) { return; }

					if (typeof json.main !== 'string') {
						return;
					}

					json.main = !path.isAbsolute(json.main)
						? path.join(node.baseUrl, json.main)
						: json.main;

					if (packer.nodes[json.main]) {
						mainNode = packer.nodes[json.main];
					}
				}
			}
		});
	}

	return mainNode;
}

function initNodes(desc) {
	var keys = Object.keys(packer.nodes);
	packer.arrNodes = keys
		.map(function (key) {
			var node = packer.nodes[key];
			if (node.isFile) {
				node.setRequireArgs();
			}
			return node;
		});

	var mainNode = getMainNode();
	if (!mainNode) {
		throw new Error('no mainNode')
		return;
	}

	var bufs = getBuffers(mainNode);
	if (!bufs.length) {
		throw new Error('no bufs.length');
	}

	createModule(bufs);
}

function createModule(bufs) {

	var	keys = bufs.slice().map(function (node) {
			return node.filename;
		}),
		body = [], main = bufs.length - 1, node, i = 0;

	while (node = bufs.shift()) {
		body.push(
			 'ninja["' + i++ + '"] = '
		 + packHelper.modFnHead + '\n'
		 + '  '
		 + trimComments(node.textContent)
		 	 	.replace(rCommonjsRequire, function (all, quote, filename) {
		 			return '__require__(' + quote + keys.indexOf(filename) + quote + ')';
		 		})
		 	 .split("\n")
		 	 .join('\n  ')
		 + '  \n'
		 + packHelper.modFnTail
		);
	}

	body = body.join(';\n\n');
	body = packHelper.closureHead + '\n\n'
		+ packHelper.varNinja + '\n'
		+ packHelper.requireStr + '\n\n'
		+ body + ';\n'
		+ packHelper.setAll + '\n'
	  + packHelper.setNinja(main) + '\n'
		+ packHelper.ensureNinja + '\n'
		+ packHelper.closureTail + '\n';
	// body = body.replace(/\\/g, '\\\\');

	if (packer.config.out) {
		var out = path.isAbsolute(packer.config.out)
			? packer.config.out
			: path.join(process.cwd(), packer.config.out);
		fs.writeFileSync(out, body);
	}

	console.log('done');
}

var packHelper = {
	closureHead : '(function(global) {',
	closureTail : '})(this);',
	varNinja    : 'var ninja = {};\nvar $loadings = [];\nvar $factory = {};\nvar _ninja = { exports : {} };\n',
	ensureNinja : 'if (typeof module !== "undefined" && module.exports) {\n'
							+ '  module.exports = _ninja;\n'
							+ '}\n'
							+ 'else if (typeof require !== "undefined" && require.amd) {\n'
							+ '  define(function () { return _ninja; });\n'
							+ '}\n'
							+ 'else if (global.window && global.window === global) {\n'
							+ '  global._ninja = _ninja;\n'
							+ '}\n',
	modFnHead   : 'function (module, exports, __require__) {',
	modFnTail   : '}',
	setAll      : setAll.toString()
									.replace(/^function[^{]+{/, '')
									.replace(/\}$/, ''),
	setNinja    : function (main) {
		return '_ninja.exports = ninja["' + main + '"].exports;\n';
	},
	requireStr  : __require__.toString(),
	isEmptyStr  : isEmpty.toString()
};

function __require__(url) {
	if (!ninja[url] || typeof ninja[url] !== 'object') {
		return;
	}
	if (ninja[url].loaded) {
		return ninja[url].exports;
	}
	if (~$loadings.indexOf(url)) {
		return;
	}
	$loadings.push(url);

	var factory = $factory[url];
	var module = ninja[url];
	factory(module, module.exports, __require__);
	$loadings.splice($loadings.indexOf(url), 1);
	module.loaded = true;
}

function isEmpty(obj) {
	if (!obj || typeof obj !== 'object') {
		return true;
	}
	for (var prop in obj) {
		return false;
	}
	return true;
}

function setAll() {
for (var prop in ninja) {
	var factory = $factory[prop] = ninja[prop];
	var mod = ninja[prop] = {};
	mod.exports = {};
	mod.loaded = false;
	factory(mod, mod.exports, __require__);
	mod.loaded = true;
}
}

function Node(opts) {
	t.extend(this, opts);
	this.parentNode = null;
	this.loading = true;
	this.loaded = false;
	this.nodes = {};
}

Node.prototype.appendChild = function (node) {
	if (!this.children || node.parentNode) {
		return;
	}
	this.children.push(node);
	node.parentNode = this;
	var url = node.isFile
		? node.filename
		: node.dirname;
	this.nodes[url] = node;
}

Node.NODE_DIR = 88;
Node.NODE_FILE = 66;

function Dir(opts) {
	Node.call(this, opts);
	this.nodeType = Node.NODE_DIR;
	this.baseUrl = this.dirname;
	this.filenames = [];
	this.children = [];
	this.isDirectory = true;
	this.isFile = false;
	this.name = getSuffix(this.dirname);
}
util.inherits(Dir, Node);

function File(opts) {
	Node.call(this, opts);
	this.nodeType = Node.NODE_FILE;
	this.baseUrl = path.dirname(this.filename);
	this.requireArgs = null;
	this.isDirectory = false;
	this.isFile = true;
	this.name = getSuffix(this.filename).replace(/([\s\S]+?)\.(?:[^.]+)$/, '$1');
	this.suffix = (/\.([^.]+)$/.exec(this.filename) || ['', ''])[1];
	this.textContent = this.textContent.slice(-1) !== '\n'
		? this.textContent + '\n'
		: this.textContent;
}
util.inherits(File, Node);

function getSuffix(url) {
	return url.replace(/[\s\S]+?[\/\\]([^\/\\]+)$/, '$1') || '';
}

File.prototype.ifRequireOnlyName = function (url, target) {
	if (!this.parentNode) {
		return;
	}
	target = target || 'index';
	var parentNode, node, node2;

	do {
		if (!parentNode) {
			var key, keys = Object.keys(this.parentNode.nodes);
			while (key = keys.shift()) {
				node = this.parentNode.nodes[key];
				if (node.isDirectory && node.name === 'node_modules') {
					parentNode = node;
					break;
				}
			}
			if (!parentNode) {
				parentNode = this.parentNode;
			}
		}

		if (parentNode.name === 'node_modules') {
			for (var prop in parentNode.nodes) {
				node = parentNode.nodes[prop];
				if (node.isDirectory && node.name === url) {
					for (var prop2 in node.nodes) {
						node2 = node.nodes[prop2];
						if (node2.isFile) {
							if (node2.name === target) {
								return node2.filename;
							} else if (node2.name === 'package' && node2.suffix === 'json') {
								var json;
								try {
									json = JSON.parse(node2.textContent);
								} catch (err) { continue; }

								if (typeof json.main !== 'string') {
									continue;
								}

								json.main = !path.isAbsolute(json.main)
									? path.join(node2.baseUrl, json.main)
									: json.main;

								if (packer.nodes[json.main]) {
									return packer.nodes[json.main].filename;
								} else {
									break;
								}
							}
						}
					}
				}
			}
		}
	} while (parentNode = parentNode.parentNode);
};

File._special = 'fs path util _process process'.split(' ');

File.prototype.setRequireArgs = function () {
	var requireArgs = getRequireArgs(this.textContent);
	if (!requireArgs.length) {
		return;
	}
	this.__requireArgs = [];

	var baseUrl = this.baseUrl;
	var self = this;

	requireArgs = requireArgs.map(function (one) {
		var url = one[2];
		self.__requireArgs.push([one[1], url]);

		if (path.isAbsolute(url)) {
			return url;
		} else if (/^[.]+\//.test(url) || /\//.test(url)) {
			url = !/\.(js|json|node)$/.test(url)
				? url + '.js'
				: url;
			return path.join(baseUrl, url);
		} else if (~!File._special.indexOf(url)) {
			return self.ifRequireOnlyName(url);
		} else {
			return 'undefined';
		}
	});

	this.requireArgs = requireArgs;

	var i = 0;
	this.textContent = trimComments(this.textContent)
		.replace(rCommonjsRequire, function (all, quote, url) {
			return 'require(' + quote + requireArgs[i++] + quote + ')';
		});
}

function getRequireArgs(str) {
	str = (str + '')
		.replace(/\/\/[^\n]+\n/g, '')
		.replace(/\/\*[\s\S]+?\*\//g, '');
	if (/\/\//.test(str)) {
		console.log('====getRequireArgs====');
		console.log(/\n$/.test(str));
		// console.log(str);
		console.log('======wrong============');
	}
	return t.utils.regParts(rCommonjsRequire, str);
}