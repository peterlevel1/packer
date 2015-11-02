(function(global) {

var ninja = {};
var $loadings = [];
var $factory = {};
var _ninja = { exports : {} };

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

ninja["0"] = function (module, exports, __require__) {
  module.exports = { ccc : true }

};

ninja["1"] = function (module, exports, __require__) {
  module.exports = {
  	b : __require__('0')
  }

};

ninja["2"] = function (module, exports, __require__) {
  var a = module.exports = {
  	a : true
  };

  a.b = __require__('1');

};

for (var prop in ninja) {
	var factory = $factory[prop] = ninja[prop];
	var mod = ninja[prop] = {};
	mod.exports = {};
	mod.loaded = false;
	factory(mod, mod.exports, __require__);
	mod.loaded = true;
}

_ninja.exports = ninja["2"].exports;

if (typeof module !== "undefined" && module.exports) {
  module.exports = _ninja;
}
else if (typeof require !== "undefined" && require.amd) {
  define(function () { return _ninja; });
}
else if (global.window && global.window === global) {
  global._ninja = _ninja;
}

})(this);
