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
  module.exports = function repeatString(i, repeated) {
  	var ret = '';
  	i = ~~i;
  	if (i <= 0 || typeof repeated !== 'string')
  		return ret;

  	while (i--) ret += repeated;
  	return ret;
  };

};

ninja["1"] = function (module, exports, __require__) {
  var fs = __require__('-1');
  var readFile = fs.readFile;
  var writeFile = fs.writeFile;
  var path = __require__('-1');
  var repeatString = __require__('0');
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

};

ninja["2"] = function (module, exports, __require__) {
  var utils = module.exports;

  var rtag = utils.rtag = /<(\/)?([\w]+)([^>]+|)?>/;
  var rtag_g = utils.rtag_g = /<[^>]+>/g;

  var singleTags = utils.singleTags = 'link br hr meta input img base param'.split(' ');
  var isSingle = utils.isSingle = function (tag, tagName) {
  	return tag[tag.length - 2] === '/' ||
  		( (tagName ||
  			(tagName = (rtag.exec(tag) || [])[2]) ) &&
  			singleTags.indexOf(tagName) >= 0 );
  };

  var rattr = utils.rattr = /[\s\t]+([\w\:-]+)(?:=\"([^\"]+)\"|=\'([^\']+)\'|)?/g;
  var makeAttributes = utils.makeAttributes = function (str) {
  	var one;
  	var node = {};
  	while ((one = rattr.exec(str))) {
  		node[one[1]] = one[2] || true;
  	}
  	return node;
  };

  var isTag = utils.isTag = function (tag) {
  	return rtag.test(tag);
  };
  var matchTag = utils.matchTag = function (tag) {
  	return isTag(tag) && tag.match(rtag);
  };
  var isTagEnd = utils.isTagEnd = function (tag) {
  	return isTag(tag) && tag[1] === '/';
  };

  var rtrim = utils.rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  utils.trim = function (text) {
  	return text == null
  		? ""
  		: ( text + "" ).replace( rtrim, "" );
  };

  utils.rdoc = /^<[!?]?(doctype|xml)[^>]+>/i;
  utils.rxmlHead = /<\?[^>]*?\?>/ig;

  utils.rscript = /(<script[^>]*(?!\/)>)([\s\S]+?(?=\<\/script\>)|)?(<\/script>)/g;
  utils.rscriptCommentLine = /\/\/([^\n]*?\n)/g;
  utils.rscriptCommentAll = /\/\*([\s\S]+?(?=\*\/)|)?\*\utils.rcomment = /<!--([\s\S]+?(?=\-\-\>)|)?-->/g;

  var rbody = utils.rbody = /<body[^>]*>[\s\S]+<\/body>/;
  utils.getBody = function (str) {
  	return getMain(rbody, str);
  };

  var rhead = utils.rhead = /<head[^>]*>[\s\S]+<\/head>/;
  utils.getHead = function (str) {
  	return getMain(rhead, str);
  };

  function getMain(reg, str) {
  	return (str.match(reg) || [''])[0];
  }

  utils.regParts = regParts;
  function regParts(reg, str) {
  	var one;
  	var ret = [];
  	while (one = reg.exec(str)) ret.push(one);
  	ret.str = str;
  	return ret;
  }

  var oescape = {
  	'&' : '&amp;',
  	'<' : '&lt;',
  	'>' : '&gt;',
  	'"' : '&quot;',
  	"'" : '&#x27;',
  	'/' : '&#x2F;'
  };

  var rescape = /[&<>"'\/]/g;

  function _escape(one) {
  	return oescape[one];
  }

  var ounescape = {
  	'&amp;'  : '&',
  	'&lt;'   : '<',
  	'&gt;'   : '>',
  	'&quot;' : '"',
  	'&#x27;' : "'",
  	'&#x2F;' : '/'
  };

  var runescape = /(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;)/g;

  function _unescape(one) {
  	return ounescape[one];
  }

  utils.escape = escapeString;
  function escapeString(str) {
  	return str.replace(rescape, _escape);
  }

  utils.unescape = escapeString;
  function unescapeString(str) {
  	return str.replace(runescape, _unescape);
  }

  utils.escapeBad = escapeBad;
  function escapeBad(str, bad) {
  	return str.slice(0, bad.index)
  		+ escapeString(bad[0])
  		+ str.slice(bad.index + bad[0].length);
  }

  utils.handleParts = handleParts;
  function handleParts(rhead, rtail, str) {
  	var head = Array.isArray(rhead) ? rhead : regParts(rhead, str);
  	var tail = Array.isArray(rtail) ? rtail : regParts(rtail, str);
  	if (head.length !== tail.length) {
  		var bad;
  		while (head.length !== tail.length) {
  			bad = head.length > tail.length ? head.shift() : tail.pop();
  			str = escapeBad(str, bad);
  		}
  		head = regParts(rhead, str);
  		tail = regParts(rtail, str);
  	}

  	var ret = [], endIndex = 0, startIndex = 0, start, end, index;
  	while (start = head.shift()) {
  		startIndex = start.index;

  		if (endIndex < startIndex)
  			ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex, startIndex) });

  		end = tail.shift();
  		endIndex = end.index;
  		while (endIndex > start.index && (start = head[0]) && endIndex > start.index) {
  			start = head.shift();
  			end = tail.shift();
  		}

  		if ((endIndex = end.index + end[0].length) > startIndex)
  			ret.push({ isPart : true, index : startIndex, str : str.slice(startIndex, endIndex) });
  	}

  	if (endIndex < str.length)
  		ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex) });

  	ret.str = str;
  	return ret;
  }

  var rcommentHead = utils.rcommentHead = /<!--/ig;
  var rcommentTail = utils.rcommentTail = /-->/ig;
  utils.handleComments = function(str) {
  	return handleParts(rcommentHead, rcommentTail, str);
  };

  var rscriptHead = utils.rscriptHead = /<script[^>]*>/ig;
  var rscriptTail = utils.rscriptTail = /<\/script>/ig;
  utils.handleScripts = function(str) {
  	str = escapeQuoteTag(str);
  	return handleParts(rscriptHead, rscriptTail, str);
  };

  var rquote = /(?:('[^']*?')|("[^"]*?"))/g;
  utils.escapeQuoteTag = escapeQuoteTag;
  function escapeQuoteTag(str) {
  	return str.replace(rquote, function (all) {
  		return rtag.test(all) ? escapeString(all) : all;
  	});
  }

};

ninja["3"] = function (module, exports, __require__) {
  var utils = __require__('2');

  module.exports = function parseString(str) {
  	str = utils.trim(str);
  	var tags = str.match(utils.rtag_g);
  	var texts = str.split(utils.rtag_g);
  	texts.pop();
  	texts.shift();

  	if (texts.length + 1 !== tags.length) {
  		throw new Error('parseString: not standard input str');
  	}

  	var tagName;
  	var stack = [];
  	var tag;
  	var startTagName;
  	var match;
  	var ret = [];
  	ret.tagNames = [];

  	for (var i = 0, l = tags.length; i < l; i++) {
  		tag = tags[i];
  		ret.push(tag, texts[i]);

  		match = utils.rtag.exec(tag);
  		tagName = match[2];
  		if (!match[1] && !~ret.tagNames.indexOf(tagName))
  			ret.tagNames.push(tagName);

  		if (!utils.isSingle(tag, tagName)) {
  			stack.push(tagName);
  			if (match[1]) {
  				stack.pop();
  				startTagName = stack.pop();
  				if (startTagName !== tagName) {
  					console.log(startTagName, tagName, i, stack);
  					throw new Error('parseString: startTagName !== endTagName');
  				}
  			}
  		}
  	}
  	ret.pop();

  	if (stack.length) {
  		console.log(stack);
  		throw new Error('parseString: stack no empty');
  	}

  	return ret;
  }

};

ninja["4"] = function (module, exports, __require__) {
  module.exports = ElementNode;

  var util = __require__('-1');

  function Node(opts) {
  	this.textContent = '';
  	this.nodeType = 0;
  	this.parentNode = null;
  	this.children = null;
  }

  Node.ELEMENT_NODE = 1;
  Node.ATTRIBUTE_NODE = 2;
  Node.TEXT_NODE = 3;
  Node.CDATA_SECTION_NODE = 4;
  Node.ENTITY_REFERENCE_NODE = 5;
  Node.ENTITY_NODE = 6;
  Node.PROCESSING_INSTRUCTION_NODE = 7;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9;
  Node.DOCUMENT_TYPE_NODE = 10;
  Node.DOCUMENT_FRAGMENT_NODE = 11;
  Node.NOTATION_NODE = 12;

  Node.createElement = function (tagName) {};
  Node.createTextNode = function (str) {};

  Node.prototype.helloWorld = function () {
  	console.log('helloWorld, I am: ' + this.tagName + ', attr: ' + this._attr);
  };

  function ElementNode(opts) {
  	Node.call(this, opts);

  	this.istackEnd = opts.istackEnd || null;
  	this.tagName = opts.tagName || '';
  	this.parentIndex = opts.parentIndex || false;
  	this.tagString = opts.tagString || '';

  	this.istackStart = opts.istackStart || null;
  	this._attr = opts._attr || '';
  	this.single = opts.single || false;
  	this.depth = opts.depth || 0;

  	this.textContent = opts.textContent || '';
  	this.attributes = opts.attributes || {};
  	this.children = opts.children || [];
  	this.parentNode = opts.parentNode || null;
  	this.nodeType = Node.ELEMENT_NODE;

  	this.innerHTML = '';
  	this.nodeName = '';
  	this.nodeValue = '';
  	this.style = {};
  }

  util.inherits(ElementNode, Node);
  ElementNode.prototype.addEventListener = function () {};
  ElementNode.prototype.removeEventListener = function () {};
  ElementNode.prototype.querySelector = function () {};
  ElementNode.prototype.querySelectorAll = function () {};
  ElementNode.prototype.contains = function () {};
  ElementNode.prototype.matches = function () {};
  ElementNode.prototype.replaceChild = function () {};
  ElementNode.prototype.insertBefore = function () {};
  ElementNode.prototype.appendChild = function () {};
  ElementNode.prototype.removeChild = function () {};
  ElementNode.prototype.getElementsByTagName = function () {};
  ElementNode.prototype.createAttribute = function () {};
  ElementNode.prototype.getAttribute = function () {};
  ElementNode.prototype.setAttribute = function () {};
  ElementNode.prototype.removeAttribute = function () {};
  ElementNode.prototype.compareDocumentPosition = function () {};


};

ninja["5"] = function (module, exports, __require__) {
  var utils = module.exports;

  var rtag = utils.rtag = /<(\/)?([\w]+)([^>]+|)?>/;
  var rtag_g = utils.rtag_g = /<[^>]+>/g;

  var singleTags = utils.singleTags = 'link br hr meta input img base param'.split(' ');
  var isSingle = utils.isSingle = function (tag, tagName) {
  	return tag[tag.length - 2] === '/' ||
  		( (tagName ||
  			(tagName = (rtag.exec(tag) || [])[2]) ) &&
  			singleTags.indexOf(tagName) >= 0 );
  };

  var rattr = utils.rattr = /[\s\t]+([\w\:-]+)(?:=\"([^\"]+)\"|=\'([^\']+)\'|)?/g;
  var makeAttributes = utils.makeAttributes = function (str) {
  	var one;
  	var node = {};
  	while ((one = rattr.exec(str))) {
  		node[one[1]] = one[2] || true;
  	}
  	return node;
  };

  var isTag = utils.isTag = function (tag) {
  	return rtag.test(tag);
  };
  var matchTag = utils.matchTag = function (tag) {
  	return isTag(tag) && tag.match(rtag);
  };
  var isTagEnd = utils.isTagEnd = function (tag) {
  	return isTag(tag) && tag[1] === '/';
  };

  var rtrim = utils.rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  utils.trim = function (text) {
  	return text == null
  		? ""
  		: ( text + "" ).replace( rtrim, "" );
  };

  utils.rdoc = /^<[!?]?(doctype|xml)[^>]+>/i;
  utils.rxmlHead = /<\?[^>]*?\?>/ig;

  utils.rscript = /(<script[^>]*(?!\/)>)([\s\S]+?(?=\<\/script\>)|)?(<\/script>)/g;
  utils.rscriptCommentLine = /\/\/([^\n]*?\n)/g;
  utils.rscriptCommentAll = /\/\*([\s\S]+?(?=\*\/)|)?\*\utils.rcomment = /<!--([\s\S]+?(?=\-\-\>)|)?-->/g;

  var rbody = utils.rbody = /<body[^>]*>[\s\S]+<\/body>/;
  utils.getBody = function (str) {
  	return getMain(rbody, str);
  };

  var rhead = utils.rhead = /<head[^>]*>[\s\S]+<\/head>/;
  utils.getHead = function (str) {
  	return getMain(rhead, str);
  };

  function getMain(reg, str) {
  	return (str.match(reg) || [''])[0];
  }

  utils.regParts = regParts;
  function regParts(reg, str) {
  	var one;
  	var ret = [];
  	while (one = reg.exec(str)) ret.push(one);
  	ret.str = str;
  	return ret;
  }

  var oescape = {
  	'&' : '&amp;',
  	'<' : '&lt;',
  	'>' : '&gt;',
  	'"' : '&quot;',
  	"'" : '&#x27;',
  	'/' : '&#x2F;'
  };

  var rescape = /[&<>"'\/]/g;

  function _escape(one) {
  	return oescape[one];
  }

  var ounescape = {
  	'&amp;'  : '&',
  	'&lt;'   : '<',
  	'&gt;'   : '>',
  	'&quot;' : '"',
  	'&#x27;' : "'",
  	'&#x2F;' : '/'
  };

  var runescape = /(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;)/g;

  function _unescape(one) {
  	return ounescape[one];
  }

  utils.escape = escapeString;
  function escapeString(str) {
  	return str.replace(rescape, _escape);
  }

  utils.unescape = escapeString;
  function unescapeString(str) {
  	return str.replace(runescape, _unescape);
  }

  utils.escapeBad = escapeBad;
  function escapeBad(str, bad) {
  	return str.slice(0, bad.index)
  		+ escapeString(bad[0])
  		+ str.slice(bad.index + bad[0].length);
  }

  utils.handleParts = handleParts;
  function handleParts(rhead, rtail, str) {
  	var head = Array.isArray(rhead) ? rhead : regParts(rhead, str);
  	var tail = Array.isArray(rtail) ? rtail : regParts(rtail, str);
  	if (head.length !== tail.length) {
  		var bad;
  		while (head.length !== tail.length) {
  			bad = head.length > tail.length ? head.shift() : tail.pop();
  			str = escapeBad(str, bad);
  		}
  		head = regParts(rhead, str);
  		tail = regParts(rtail, str);
  	}

  	var ret = [], endIndex = 0, startIndex = 0, start, end, index;
  	while (start = head.shift()) {
  		startIndex = start.index;

  		if (endIndex < startIndex)
  			ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex, startIndex) });

  		end = tail.shift();
  		endIndex = end.index;
  		while (endIndex > start.index && (start = head[0]) && endIndex > start.index) {
  			start = head.shift();
  			end = tail.shift();
  		}

  		if ((endIndex = end.index + end[0].length) > startIndex)
  			ret.push({ isPart : true, index : startIndex, str : str.slice(startIndex, endIndex) });
  	}

  	if (endIndex < str.length)
  		ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex) });

  	ret.str = str;
  	return ret;
  }

  var rcommentHead = utils.rcommentHead = /<!--/ig;
  var rcommentTail = utils.rcommentTail = /-->/ig;
  utils.handleComments = function(str) {
  	return handleParts(rcommentHead, rcommentTail, str);
  };

  var rscriptHead = utils.rscriptHead = /<script[^>]*>/ig;
  var rscriptTail = utils.rscriptTail = /<\/script>/ig;
  utils.handleScripts = function(str) {
  	str = escapeQuoteTag(str);
  	return handleParts(rscriptHead, rscriptTail, str);
  };

  var rquote = /(?:('[^']*?')|("[^"]*?"))/g;
  utils.escapeQuoteTag = escapeQuoteTag;
  function escapeQuoteTag(str) {
  	return str.replace(rquote, function (all) {
  		return rtag.test(all) ? escapeString(all) : all;
  	});
  }

};

ninja["6"] = function (module, exports, __require__) {
  var parseString = __require__('3');
  var ElementNode = __require__('4');
  var utils = __require__('2');
  module.exports = buildTree;

  function setSingleNode(node, map, tag, match) {
  	node.single = true;
  	node.istackStart = node.istackEnd;
  	node.attributes = utils.makeAttributes(tag);
  	node.children = null;
  	node._attr = (match[3] || '').replace(/\/$/, '');
  	map[node.istackStart] = node;
  }

  function setNode(node, map, startTag, stack) {
  	node.attributes = startTag.attributes;
  	node.istackStart = startTag.index;
  	node.textContent = stack.slice(node.istackStart + 1, node.istackEnd).join('');
  	node.parentIndex = node.istackStart === 0 ? false : startTag.parentIndex || 0;
  	node.tagString = startTag.tagString + '{{ninja}}' + node.tagString;
  	node._attr = startTag._attr || '';
  	map[node.istackStart] = node;
  }

  function getNewElementNode(opts) {
  	return new ElementNode(opts);
  }

  function getStack(str) {
  	return typeof str === 'string' ? parseString(str) :
  		Array.isArray(str) && str.tagNames ? str :
  		null;
  }

  function buildStructure(stack, tracker, parentIndex, map) {
  	return function (memo, tag, index) {
  		if (tag[0] !== '<' || !utils.rtag.test(tag))
  			return memo;

  		var match = utils.rtag.exec(tag);
  		var tagName = (match || [])[2];
  		if (!match || !tagName)
  			throw new Error('buildTree: miss match tag: ' + tag);

  		var node = getNewElementNode({
  			istackEnd: index,
  			tagName: tagName,
  			parentIndex: parentIndex,
  			tagString: tag
  		});

  		if (utils.isSingle(tag, tagName)) {
  			setSingleNode(node, map, tag, match);
  			memo.push(node);
  			return memo;
  		}

  		var isEnd = !!match[1];
  		tracker.push({
  			tagName : tagName,
  			index : index,
  			parentIndex : parentIndex,
  			attributes : !isEnd && utils.makeAttributes(tag),
  			tagString : tag,
  			_attr : match[3] || ''
  		});
  		if (!isEnd) {
  			parentIndex = index;
  			return memo;
  		}

  		var endTag = tracker.pop();
  		var startTag = tracker.pop();
  		if (endTag.tagName !== startTag.tagName)
  			throw new Error('buildTree: ' + endTag.tagName + ' !== ' + startTag.tagName);

  		setNode(node, map, startTag, stack);
  		parentIndex = startTag.parentIndex;
  		memo.push(node);
  		return memo;
  	};
  }

  function sortNodesOrder(a, b) {
  	return a.istackStart - b.istackStart;
  }

  function setNodesRelation(map) {
  	return function (node, index) {
  		if (index > 0) {
  			node.parentNode = map[node.parentIndex];
  			node.parentNode.children.push(node);
  			node.depth = node.parentNode.depth + 1;
  		}
  		return node;
  	};
  }

  function buildTree(str) {
  	var stack = getStack(str);
  	if (!stack)
  		throw new Error('buildTree: not standard input arg');

  	var tracker = [], parentIndex = false, map = {},
  		_1 = buildStructure(stack, tracker, parentIndex, map),
  		_2 = setNodesRelation(map),
  		tree = stack.reduce(_1, []).sort(sortNodesOrder).map(_2);

  	if (tracker.length)
  		throw new Error('buildTree: tracker not empty: ' + tracker.join(''));

  	_1 = null;
  	_2 = null;

  	tree.stack = stack;
  	tree.indexMap = map;
  	tree.renderStack = stack.slice();

  	return tree;
  }

};

ninja["7"] = function (module, exports, __require__) {
  var encode = encodeURIComponent;
  var decode = decodeURIComponent;

  var serialize = function(name, val, opt){
      opt = opt || {};
      var enc = opt.encode || encode;
      var pairs = [name + '=' + enc(val)];

      if (null != opt.maxAge) {
          var maxAge = opt.maxAge - 0;
          if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
          pairs.push('Max-Age=' + maxAge);
      }

      if (opt.domain) pairs.push('Domain=' + opt.domain);
      if (opt.path) pairs.push('Path=' + opt.path);
      if (opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
      if (opt.httpOnly) pairs.push('HttpOnly');
      if (opt.secure) pairs.push('Secure');

      return pairs.join('; ');
  };

  var parse = function(str, opt) {
      opt = opt || {};
      var obj = {}
      var pairs = str.split(/; */);
      var dec = opt.decode || decode;

      pairs.forEach(function(pair) {
          var eq_idx = pair.indexOf('=')

                  if (eq_idx < 0) {
              return;
          }

          var key = pair.substr(0, eq_idx).trim()
          var val = pair.substr(++eq_idx, pair.length).trim();

                  if ('"' == val[0]) {
              val = val.slice(1, -1);
          }

                  if (undefined == obj[key]) {
              try {
                  obj[key] = dec(val);
              } catch (e) {
                  obj[key] = val;
              }
          }
      });

      return obj;
  };

  module.exports.serialize = serialize;
  module.exports.parse = parse;

};

ninja["8"] = function (module, exports, __require__) {
  var utils = (function (exports) {




  	'use strict';

  	var regExpChars = /[|\\{}()[\]^$+*?.]/g;


  	exports.escapeRegExpChars = function (string) {
  	  	  if (!string) {
  	    return '';
  	  }
  	  return String(string).replace(regExpChars, '\\$&');
  	};

  	var _ENCODE_HTML_RULES = {
  	      '&': '&amp;'
  	    , '<': '&lt;'
  	    , '>': '&gt;'
  	    , '"': '&#34;'
  	    , "'": '&#39;'
  	    }
  	  , _MATCH_HTML = /[&<>\'"]/g;

  	function encode_char(c) {
  	  return _ENCODE_HTML_RULES[c] || c;
  	};



  	var escapeFuncStr =
  	  'var _ENCODE_HTML_RULES = {\n'
  	+ '      "&": "&amp;"\n'
  	+ '    , "<": "&lt;"\n'
  	+ '    , ">": "&gt;"\n'
  	+ '    , \'"\': "&#34;"\n'
  	+ '    , "\'": "&#39;"\n'
  	+ '    }\n'
  	+ '  , _MATCH_HTML = /[&<>\'"]/g;\n'
  	+ 'function encode_char(c) {\n'
  	+ '  return _ENCODE_HTML_RULES[c] || c;\n'
  	+ '};\n';



  	exports.escapeXML = function (markup) {
  	  return markup == undefined
  	    ? ''
  	    : String(markup)
  	        .replace(_MATCH_HTML, encode_char);
  	};
  	exports.escapeXML.toString = function () {
  	  return Function.prototype.toString.call(this) + ';\n' + escapeFuncStr
  	};


  	exports.shallowCopy = function (to, from) {
  	  from = from || {};
  	  for (var p in from) {
  	    to[p] = from[p];
  	  }
  	  return to;
  	};


  	exports.cache = {
  	  _data: {},
  	  set: function (key, val) {
  	    this._data[key] = val;
  	  },
  	  get: function (key) {
  	    return this._data[key];
  	  },
  	  reset: function () {
  	    this._data = {};
  	  }
  	};

  	return exports;
  })({});

  var pjson = (function () {
    return {
      "name": "ejs",
      "description": "Embedded JavaScript templates",
      "keywords": [
        "template",
        "engine",
        "ejs"
      ],
      "version": "2.3.4",
      "author": {
        "name": "Matthew Eernisse",
        "email": "mde@fleegix.org",
        "url": "http:    },
      "contributors": [
        {
          "name": "Timothy Gu",
          "email": "timothygu99@gmail.com",
          "url": "https:      }
      ],
      "license": "Apache-2.0",
      "main": "./lib/ejs.js",
      "repository": {
        "type": "git",
        "url": "git:    },
      "bugs": {
        "url": "https:    },
      "homepage": "https:    "dependencies": {},
      "devDependencies": {
        "browserify": "^8.0.3",
        "istanbul": "~0.3.5",
        "jake": "^8.0.0",
        "jsdoc": "^3.3.0-beta1",
        "lru-cache": "^2.5.0",
        "mocha": "^2.1.0",
        "rimraf": "^2.2.8",
        "uglify-js": "^2.4.16"
      },
      "engines": {
        "node": ">=0.10.0"
      },
      "scripts": {
        "test": "mocha",
        "coverage": "istanbul cover node_modules/mocha/bin/_mocha",
        "doc": "rimraf out && jsdoc -c jsdoc.json lib

  'use strict';







  var fs = __require__('-1')
      , scopeOptionWarned = false
      , _VERSION_STRING = pjson.version
    , _DEFAULT_DELIMITER = '%'
    , _DEFAULT_LOCALS_NAME = 'locals'
    , _REGEX_STRING = '(<%%|<%=|<%-|<%_|<%#|<%|%>|-%>|_%>)'
    , _OPTS = [ 'cache', 'filename', 'delimiter', 'scope', 'context'
              , 'debug', 'compileDebug', 'client', '_with', 'rmWhitespace'
              ]
    , _TRAILING_SEMCOL = /;\s*$/
    , _BOM = /^\uFEFF/;



  exports.cache = utils.cache;



  exports.localsName = _DEFAULT_LOCALS_NAME;



  exports.resolveInclude = function(name, filename) {
    var path = __require__('-1')
      , dirname = path.dirname
      , extname = path.extname
      , resolve = path.resolve
      , includePath = resolve(dirname(filename), name)
      , ext = extname(name);
    if (!ext) {
      includePath += '.ejs';
    }
    return includePath;
  };



  function handleCache(options, template) {
    var fn
      , path = options.filename
      , hasTemplate = arguments.length > 1;

    if (options.cache) {
      if (!path) {
        throw new Error('cache option requires a filename');
      }
      fn = exports.cache.get(path);
      if (fn) {
        return fn;
      }
      if (!hasTemplate) {
        template = fs.readFileSync(path).toString().replace(_BOM, '');
      }
    }
    else if (!hasTemplate) {
          if (!path) {
        throw new Error('Internal EJS error: no file name or template '
                      + 'provided');
      }
      template = fs.readFileSync(path).toString().replace(_BOM, '');
    }
    fn = exports.compile(template, options);
    if (options.cache) {
      exports.cache.set(path, fn);
    }
    return fn;
  }



  function includeFile(path, options) {
    var opts = utils.shallowCopy({}, options);
    if (!opts.filename) {
      throw new Error('`include` requires the \'filename\' option.');
    }
    opts.filename = exports.resolveInclude(path, opts.filename);
    return handleCache(opts);
  }



  function includeSource(path, options) {
    var opts = utils.shallowCopy({}, options)
      , includePath
      , template;
    if (!opts.filename) {
      throw new Error('`include` requires the \'filename\' option.');
    }
    includePath = exports.resolveInclude(path, opts.filename);
    template = fs.readFileSync(includePath).toString().replace(_BOM, '');

    opts.filename = includePath;
    var templ = new Template(template, opts);
    templ.generateSource();
    return templ.source;
  }



  function rethrow(err, str, filename, lineno){
    var lines = str.split('\n')
      , start = Math.max(lineno - 3, 0)
      , end = Math.min(lines.length, lineno + 3);

      var context = lines.slice(start, end).map(function (line, i){
      var curr = i + start + 1;
      return (curr == lineno ? ' >> ' : '    ')
        + curr
        + '| '
        + line;
    }).join('\n');

      err.path = filename;
    err.message = (filename || 'ejs') + ':'
      + lineno + '\n'
      + context + '\n\n'
      + err.message;

    throw err;
  }



  function cpOptsInData(data, opts) {
    _OPTS.forEach(function (p) {
      if (typeof data[p] != 'undefined') {
        opts[p] = data[p];
      }
    });
  }



  exports.compile = function compile(template, opts) {
    var templ;

          if (opts && opts.scope) {
      if (!scopeOptionWarned){
        console.warn('`scope` option is deprecated and will be removed in EJS 3');
        scopeOptionWarned = true;
      }
      if (!opts.context) {
        opts.context = opts.scope;
      }
      delete opts.scope;
    }
    templ = new Template(template, opts);
    return templ.compile();
  };



  exports.render = function (template, data, opts) {
    data = data || {};
    opts = opts || {};
    var fn;

        if (arguments.length == 2) {
      cpOptsInData(data, opts);
    }

    return handleCache(opts, template)(data);
  };



  exports.renderFile = function () {
    var args = Array.prototype.slice.call(arguments)
      , path = args.shift()
      , cb = args.pop()
      , data = args.shift() || {}
      , opts = args.pop() || {}
      , result;

      opts = utils.shallowCopy({}, opts);

        if (arguments.length == 3) {
      cpOptsInData(data, opts);
    }
    opts.filename = path;

    try {
      result = handleCache(opts)(data);
    }
    catch(err) {
      return cb(err);
    }
    return cb(null, result);
  };



  exports.clearCache = function () {
    exports.cache.reset();
  };

  function Template(text, opts) {
    opts = opts || {};
    var options = {};
    this.templateText = text;
    this.mode = null;
    this.truncate = false;
    this.currentLine = 1;
    this.source = '';
    this.dependencies = [];
    options.client = opts.client || false;
    options.escapeFunction = opts.escape || utils.escapeXML;
    options.compileDebug = opts.compileDebug !== false;
    options.debug = !!opts.debug;
    options.filename = opts.filename;
    options.delimiter = opts.delimiter || exports.delimiter || _DEFAULT_DELIMITER;
    options._with = typeof opts._with != 'undefined' ? opts._with : true;
    options.context = opts.context;
    options.cache = opts.cache || false;
    options.rmWhitespace = opts.rmWhitespace;
    this.opts = options;

    this.regex = this.createRegex();
  }

  Template.modes = {
    EVAL: 'eval'
  , ESCAPED: 'escaped'
  , RAW: 'raw'
  , COMMENT: 'comment'
  , LITERAL: 'literal'
  };

  Template.prototype = {
    createRegex: function () {
      var str = _REGEX_STRING
        , delim = utils.escapeRegExpChars(this.opts.delimiter);
      str = str.replace(/%/g, delim);
      return new RegExp(str);
    }

  , compile: function () {
      var src
        , fn
        , opts = this.opts
        , prepended = ''
        , appended = ''
        , escape = opts.escapeFunction;

      if (opts.rmWhitespace) {
                    this.templateText =
          this.templateText.replace(/\r/g, '').replace(/^\s+|\s+$/gm, '');
      }

          this.templateText =
        this.templateText.replace(/[ \t]*<%_/gm, '<%_').replace(/_%>[ \t]*/gm, '_%>');

      if (!this.source) {
        this.generateSource();
        prepended += '  var __output = [], __append = __output.push.bind(__output);' + '\n';
        if (opts._with !== false) {
          prepended +=  '  with (' + exports.localsName + ' || {}) {' + '\n';
          appended += '  }' + '\n';
        }
        appended += '  return __output.join("");' + '\n';
        this.source = prepended + this.source + appended;
      }

      if (opts.compileDebug) {
        src = 'var __line = 1' + '\n'
            + '  , __lines = ' + JSON.stringify(this.templateText) + '\n'
            + '  , __filename = ' + (opts.filename ?
                  JSON.stringify(opts.filename) : 'undefined') + ';' + '\n'
            + 'try {' + '\n'
            + this.source
            + '} catch (e) {' + '\n'
            + '  rethrow(e, __lines, __filename, __line);' + '\n'
            + '}' + '\n';
      }
      else {
        src = this.source;
      }

      if (opts.debug) {
        console.log(src);
      }

      if (opts.client) {
        src = 'escape = escape || ' + escape.toString() + ';' + '\n' + src;
        if (opts.compileDebug) {
          src = 'rethrow = rethrow || ' + rethrow.toString() + ';' + '\n' + src;
        }
      }

      try {
        fn = new Function(exports.localsName + ', escape, include, rethrow', src);
      }
      catch(e) {
              if (e instanceof SyntaxError) {
          if (opts.filename) {
            e.message += ' in ' + opts.filename;
          }
          e.message += ' while compiling ejs';
        }
        throw e;
      }

      if (opts.client) {
        fn.dependencies = this.dependencies;
        return fn;
      }

                  var returnedFn = function (data) {
        var include = function (path, includeData) {
          var d = utils.shallowCopy({}, data);
          if (includeData) {
            d = utils.shallowCopy(d, includeData);
          }
          return includeFile(path, opts)(d);
        };
        return fn.apply(opts.context, [data || {}, escape, include, rethrow]);
      };
      returnedFn.dependencies = this.dependencies;
      return returnedFn;
    }

  , generateSource: function () {
      var self = this
        , matches = this.parseTemplateText()
        , d = this.opts.delimiter;

      if (matches && matches.length) {
        matches.forEach(function (line, index) {
          var opening
            , closing
            , include
            , includeOpts
            , includeSrc;
                                          if ( line.indexOf('<' + d) === 0                  && line.indexOf('<' + d + d) !== 0) {           closing = matches[index + 2];
            if (!(closing == d + '>' || closing == '-' + d + '>' || closing == '_' + d + '>')) {
              throw new Error('Could not find matching close tag for "' + line + '".');
            }
          }
                  if ((include = line.match(/^\s*include\s+(\S+)/))) {
            opening = matches[index - 1];
                      if (opening && (opening == '<' + d || opening == '<' + d + '-' || opening == '<' + d + '_')) {
              includeOpts = utils.shallowCopy({}, self.opts);
              includeSrc = includeSource(include[1], includeOpts);
              includeSrc = '    ; (function(){' + '\n' + includeSrc +
                  '    ; })()' + '\n';
              self.source += includeSrc;
              self.dependencies.push(exports.resolveInclude(include[1],
                  includeOpts.filename));
              return;
            }
          }
          self.scanLine(line);
        });
      }

    }

  , parseTemplateText: function () {
      var str = this.templateText
        , pat = this.regex
        , result = pat.exec(str)
        , arr = []
        , firstPos
        , lastPos;

      while (result) {
        firstPos = result.index;
        lastPos = pat.lastIndex;

        if (firstPos !== 0) {
          arr.push(str.substring(0, firstPos));
          str = str.slice(firstPos);
        }

        arr.push(result[0]);
        str = str.slice(result[0].length);
        result = pat.exec(str);
      }

      if (str) {
        arr.push(str);
      }

      return arr;
    }

  , scanLine: function (line) {
      var self = this
        , d = this.opts.delimiter
        , newLineCount = 0;

      function _addOutput() {
        if (self.truncate) {
          line = line.replace('\n', '');
          self.truncate = false;
        }
        else if (self.opts.rmWhitespace) {
                                  line = line.replace(/^\n/, '');
        }
        if (!line) {
          return;
        }

              line = line.replace(/\\/g, '\\\\');

              line = line.replace(/\n/g, '\\n');
        line = line.replace(/\r/g, '\\r');

                    line = line.replace(/"/g, '\\"');
        self.source += '    ; __append("' + line + '")' + '\n';
      }

      newLineCount = (line.split('\n').length - 1);

      switch (line) {
        case '<' + d:
        case '<' + d + '_':
          this.mode = Template.modes.EVAL;
          break;
        case '<' + d + '=':
          this.mode = Template.modes.ESCAPED;
          break;
        case '<' + d + '-':
          this.mode = Template.modes.RAW;
          break;
        case '<' + d + '#':
          this.mode = Template.modes.COMMENT;
          break;
        case '<' + d + d:
          this.mode = Template.modes.LITERAL;
          this.source += '    ; __append("' + line.replace('<' + d + d, '<' + d) + '")' + '\n';
          break;
        case d + '>':
        case '-' + d + '>':
        case '_' + d + '>':
          if (this.mode == Template.modes.LITERAL) {
            _addOutput();
          }

          this.mode = null;
          this.truncate = line.indexOf('-') === 0 || line.indexOf('_') === 0;
          break;
        default:
                  if (this.mode) {
                      switch (this.mode) {
              case Template.modes.EVAL:
              case Template.modes.ESCAPED:
              case Template.modes.RAW:
                if (line.lastIndexOf('                line += '\n';
                }
            }
            switch (this.mode) {
                          case Template.modes.EVAL:
                this.source += '    ; ' + line + '\n';
                break;
                          case Template.modes.ESCAPED:
                this.source += '    ; __append(escape(' +
                  line.replace(_TRAILING_SEMCOL, '').trim() + '))' + '\n';
                break;
                          case Template.modes.RAW:
                this.source += '    ; __append(' +
                  line.replace(_TRAILING_SEMCOL, '').trim() + ')' + '\n';
                break;
              case Template.modes.COMMENT:
                              break;
                          case Template.modes.LITERAL:
                _addOutput();
                break;
            }
          }
                  else {
            _addOutput();
          }
      }

      if (self.opts.compileDebug && newLineCount) {
        this.currentLine += newLineCount;
        this.source += '    ; __line = ' + this.currentLine + '\n';
      }
    }
  };



  exports.__express = exports.renderFile;


  if (require.extensions) {
    require.extensions['.ejs'] = function (module, filename) {
      filename = filename ||  module.filename;
      var options = {
            filename: filename
          , client: true
          }
        , template = fs.readFileSync(filename).toString()
        , fn = exports.compile(template, options);
      module._compile('module.exports = ' + fn.toString() + ';', filename);
    };
  }



  exports.VERSION = _VERSION_STRING;



    return exports;
  })({});

};

ninja["9"] = function (module, exports, __require__) {
  module.exports = ElementNode;

  var util = __require__('-1');

  function Node(opts) {
  	this.textContent = '';
  	this.nodeType = 0;
  	this.parentNode = null;
  	this.children = null;
  }

  Node.ELEMENT_NODE = 1;
  Node.ATTRIBUTE_NODE = 2;
  Node.TEXT_NODE = 3;
  Node.CDATA_SECTION_NODE = 4;
  Node.ENTITY_REFERENCE_NODE = 5;
  Node.ENTITY_NODE = 6;
  Node.PROCESSING_INSTRUCTION_NODE = 7;
  Node.COMMENT_NODE = 8;
  Node.DOCUMENT_NODE = 9;
  Node.DOCUMENT_TYPE_NODE = 10;
  Node.DOCUMENT_FRAGMENT_NODE = 11;
  Node.NOTATION_NODE = 12;

  Node.createElement = function (tagName) {};
  Node.createTextNode = function (str) {};

  Node.prototype.helloWorld = function () {
  	console.log('helloWorld, I am: ' + this.tagName + ', attr: ' + this._attr);
  };

  function ElementNode(opts) {
  	Node.call(this, opts);

  	this.istackEnd = opts.istackEnd || null;
  	this.tagName = opts.tagName || '';
  	this.parentIndex = opts.parentIndex || false;
  	this.tagString = opts.tagString || '';

  	this.istackStart = opts.istackStart || null;
  	this._attr = opts._attr || '';
  	this.single = opts.single || false;
  	this.depth = opts.depth || 0;

  	this.textContent = opts.textContent || '';
  	this.attributes = opts.attributes || {};
  	this.children = opts.children || [];
  	this.parentNode = opts.parentNode || null;
  	this.nodeType = Node.ELEMENT_NODE;

  	this.innerHTML = '';
  	this.nodeName = '';
  	this.nodeValue = '';
  	this.style = {};
  }

  util.inherits(ElementNode, Node);
  ElementNode.prototype.addEventListener = function () {};
  ElementNode.prototype.removeEventListener = function () {};
  ElementNode.prototype.querySelector = function () {};
  ElementNode.prototype.querySelectorAll = function () {};
  ElementNode.prototype.contains = function () {};
  ElementNode.prototype.matches = function () {};
  ElementNode.prototype.replaceChild = function () {};
  ElementNode.prototype.insertBefore = function () {};
  ElementNode.prototype.appendChild = function () {};
  ElementNode.prototype.removeChild = function () {};
  ElementNode.prototype.getElementsByTagName = function () {};
  ElementNode.prototype.createAttribute = function () {};
  ElementNode.prototype.getAttribute = function () {};
  ElementNode.prototype.setAttribute = function () {};
  ElementNode.prototype.removeAttribute = function () {};
  ElementNode.prototype.compareDocumentPosition = function () {};


};

ninja["10"] = function (module, exports, __require__) {
  ;(function (global) {
  	var toString = Object.prototype.toString;
  	var pSlice = Array.prototype.slice;

  	function isObject(obj, isPlain) {
  		return obj == null ? false :
  			typeof obj !== 'object' ? false :
  			!isPlain ? true : toString.call(obj) === '[object Object]' &&
  				obj.constructor === Object;
  	}

  	function isArrayLike(obj) {
  		if (Array.isArray(obj)) {
  			return true;
  		} else if (!obj ||
  							obj.length === void 0 ||
  							typeof obj === 'function' ||
  							(obj.window !== void 0 && obj.window === obj) ||
  							(obj.nodeType === 1 && typeof obj.length !== 'number') ) {
  			return false;
  		}

  		var length = obj.length;

  		return length === 0 ||
  			(typeof length === 'number' &&
  			length > 0 &&
  			(length - 1) in obj);
  	}

  	function isPlainObject(obj) {
  		return isObject(obj, true) &&
  			obj.nodeType === void 0 &&
  			obj.window === void 0;
  	}

  	function extend() {
  		var deep = arguments[0] === true;
  		var index = 1;
  		var target = typeof arguments[0] === 'boolean'
  			? ++index && arguments[1]
  			: arguments[0];
  		target = isObject(target) || typeof target === 'function'
  			? target
  			: {};
  		target = arguments.length > 1
  			? target
  			: !(index = 0) && this;

  		return arguments.length === 0
  			? target
  			: extendData(target, deep, arguments, index);
  	}

  	function extendData(target, deep, args, i) {
  		var arrayLike = isArrayLike(target),
  			obj, keys, key, value, data;

  		for (var ii = args.length; i < ii; i++) {
  			obj = args[i];

  			if (obj == null || !isObject(obj) || !(isPlainObject(obj) || isArrayLike(obj))) {
  				continue;
  			}

  			keys = Object.keys(obj);
  			for (var k = 0, kk = keys.length; k < kk; k++) {
  				key = keys[k];
  				value = obj[key];

  				if (value === void 0 || value === target) {
  					continue;
  				}

  				if (!deep || !isObject(value)) {
  					if (arrayLike) {
  						target[target.length] = value;
  					} else {
  						target[key] = value;
  					}
  				} else {
  					data =
  						isArrayLike(value) ?
  							(isArrayLike(target[key]) ? target[key] : []) :
  						isPlainObject(value) ?
  							(isPlainObject(target[key]) ? target[key] : {}) :
  						{};
  					target[key] = extend(true, data, value);
  				}
  			}
  		}

  		return target;
  	}

  	extend.isObject = isObject;
  	extend.isPlainObject = isPlainObject;
  	extend.isArrayLike = isArrayLike;
  	extend.isCommon = function (obj) {
  		return !isObject(obj);
  	};

  	if (typeof define !== 'undefined' && define.amd) {
  		define(function () { return extend; });
  	} else if (typeof module !== 'undefined' && module.exports) {
  		module.exports = extend;
  	} else if (global.window) {
  		global.extend = extend;
  	}
  })(this);

};

ninja["11"] = function (module, exports, __require__) {
  var utils = module.exports;

  var rtag = utils.rtag = /<(\/)?([\w]+)([^>]+|)?>/;
  var rtag_g = utils.rtag_g = /<[^>]+>/g;

  var singleTags = utils.singleTags = 'link br hr meta input img base param'.split(' ');
  var isSingle = utils.isSingle = function (tag, tagName) {
  	return tag[tag.length - 2] === '/' ||
  		( (tagName ||
  			(tagName = (rtag.exec(tag) || [])[2]) ) &&
  			singleTags.indexOf(tagName) >= 0 );
  };

  var rattr = utils.rattr = /[\s\t]+([\w\:-]+)(?:=\"([^\"]+)\"|=\'([^\']+)\'|)?/g;
  var makeAttributes = utils.makeAttributes = function (str) {
  	var one;
  	var node = {};
  	while ((one = rattr.exec(str))) {
  		node[one[1]] = one[2] || true;
  	}
  	return node;
  };

  var isTag = utils.isTag = function (tag) {
  	return rtag.test(tag);
  };
  var matchTag = utils.matchTag = function (tag) {
  	return isTag(tag) && tag.match(rtag);
  };
  var isTagEnd = utils.isTagEnd = function (tag) {
  	return isTag(tag) && tag[1] === '/';
  };

  var rtrim = utils.rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  utils.trim = function (text) {
  	return text == null
  		? ""
  		: ( text + "" ).replace( rtrim, "" );
  };

  utils.rdoc = /^<[!?]?(doctype|xml)[^>]+>/i;
  utils.rxmlHead = /<\?[^>]*?\?>/ig;

  utils.rscript = /(<script[^>]*(?!\/)>)([\s\S]+?(?=\<\/script\>)|)?(<\/script>)/g;
  utils.rscriptCommentLine = /\/\/([^\n]*?\n)/g;
  utils.rscriptCommentAll = /\/\*([\s\S]+?(?=\*\/)|)?\*\utils.rcomment = /<!--([\s\S]+?(?=\-\-\>)|)?-->/g;

  var rbody = utils.rbody = /<body[^>]*>[\s\S]+<\/body>/;
  utils.getBody = function (str) {
  	return getMain(rbody, str);
  };

  var rhead = utils.rhead = /<head[^>]*>[\s\S]+<\/head>/;
  utils.getHead = function (str) {
  	return getMain(rhead, str);
  };

  function getMain(reg, str) {
  	return (str.match(reg) || [''])[0];
  }

  utils.regParts = regParts;
  function regParts(reg, str) {
  	var one;
  	var ret = [];
  	while (one = reg.exec(str)) ret.push(one);
  	ret.str = str;
  	return ret;
  }

  var oescape = {
  	'&' : '&amp;',
  	'<' : '&lt;',
  	'>' : '&gt;',
  	'"' : '&quot;',
  	"'" : '&#x27;',
  	'/' : '&#x2F;'
  };

  var rescape = /[&<>"'\/]/g;

  function _escape(one) {
  	return oescape[one];
  }

  var ounescape = {
  	'&amp;'  : '&',
  	'&lt;'   : '<',
  	'&gt;'   : '>',
  	'&quot;' : '"',
  	'&#x27;' : "'",
  	'&#x2F;' : '/'
  };

  var runescape = /(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;)/g;

  function _unescape(one) {
  	return ounescape[one];
  }

  utils.escape = escapeString;
  function escapeString(str) {
  	return str.replace(rescape, _escape);
  }

  utils.unescape = escapeString;
  function unescapeString(str) {
  	return str.replace(runescape, _unescape);
  }

  utils.escapeBad = escapeBad;
  function escapeBad(str, bad) {
  	return str.slice(0, bad.index)
  		+ escapeString(bad[0])
  		+ str.slice(bad.index + bad[0].length);
  }

  utils.handleParts = handleParts;
  function handleParts(rhead, rtail, str) {
  	var head = Array.isArray(rhead) ? rhead : regParts(rhead, str);
  	var tail = Array.isArray(rtail) ? rtail : regParts(rtail, str);
  	if (head.length !== tail.length) {
  		var bad;
  		while (head.length !== tail.length) {
  			bad = head.length > tail.length ? head.shift() : tail.pop();
  			str = escapeBad(str, bad);
  		}
  		head = regParts(rhead, str);
  		tail = regParts(rtail, str);
  	}

  	var ret = [], endIndex = 0, startIndex = 0, start, end, index;
  	while (start = head.shift()) {
  		startIndex = start.index;

  		if (endIndex < startIndex)
  			ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex, startIndex) });

  		end = tail.shift();
  		endIndex = end.index;
  		while (endIndex > start.index && (start = head[0]) && endIndex > start.index) {
  			start = head.shift();
  			end = tail.shift();
  		}

  		if ((endIndex = end.index + end[0].length) > startIndex)
  			ret.push({ isPart : true, index : startIndex, str : str.slice(startIndex, endIndex) });
  	}

  	if (endIndex < str.length)
  		ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex) });

  	ret.str = str;
  	return ret;
  }

  var rcommentHead = utils.rcommentHead = /<!--/ig;
  var rcommentTail = utils.rcommentTail = /-->/ig;
  utils.handleComments = function(str) {
  	return handleParts(rcommentHead, rcommentTail, str);
  };

  var rscriptHead = utils.rscriptHead = /<script[^>]*>/ig;
  var rscriptTail = utils.rscriptTail = /<\/script>/ig;
  utils.handleScripts = function(str) {
  	str = escapeQuoteTag(str);
  	return handleParts(rscriptHead, rscriptTail, str);
  };

  var rquote = /(?:('[^']*?')|("[^"]*?"))/g;
  utils.escapeQuoteTag = escapeQuoteTag;
  function escapeQuoteTag(str) {
  	return str.replace(rquote, function (all) {
  		return rtag.test(all) ? escapeString(all) : all;
  	});
  }

};

ninja["12"] = function (module, exports, __require__) {
  var utils = __require__('2');

  module.exports = function parseString(str) {
  	str = utils.trim(str);
  	var tags = str.match(utils.rtag_g);
  	var texts = str.split(utils.rtag_g);
  	texts.pop();
  	texts.shift();

  	if (texts.length + 1 !== tags.length) {
  		throw new Error('parseString: not standard input str');
  	}

  	var tagName;
  	var stack = [];
  	var tag;
  	var startTagName;
  	var match;
  	var ret = [];
  	ret.tagNames = [];

  	for (var i = 0, l = tags.length; i < l; i++) {
  		tag = tags[i];
  		ret.push(tag, texts[i]);

  		match = utils.rtag.exec(tag);
  		tagName = match[2];
  		if (!match[1] && !~ret.tagNames.indexOf(tagName))
  			ret.tagNames.push(tagName);

  		if (!utils.isSingle(tag, tagName)) {
  			stack.push(tagName);
  			if (match[1]) {
  				stack.pop();
  				startTagName = stack.pop();
  				if (startTagName !== tagName) {
  					console.log(startTagName, tagName, i, stack);
  					throw new Error('parseString: startTagName !== endTagName');
  				}
  			}
  		}
  	}
  	ret.pop();

  	if (stack.length) {
  		console.log(stack);
  		throw new Error('parseString: stack no empty');
  	}

  	return ret;
  }

};

ninja["13"] = function (module, exports, __require__) {
  module.exports = function repeatString(i, repeated) {
  	var ret = '';
  	i = ~~i;
  	if (i <= 0 || typeof repeated !== 'string')
  		return ret;

  	while (i--) ret += repeated;
  	return ret;
  };

};

ninja["14"] = function (module, exports, __require__) {
  (function (factory) {
  	if (typeof module === 'object' && module.exports)
  		module.exports = factory();
  	else if (typeof define === 'function' && define.amd)
  		define(function () { return factory(); });
  	else
  		throw new Error('no define or module');
  })(function () {
  	var isObject = function (obj) {
  		return obj != null && typeof obj === 'object';
  	};

  	var treeWalker = function (tree, callback, prop, y, x) {
  		prop = prop || 'children';
  		y = y || 0;
  		x = x || 0;

  		callback(tree, y++, x);

  		var children = tree[prop]
  			, i = -1
  			, len = !isObject(children) ? 0 : +children.length
  			, node = null
  			, ret = null;

  		while (++i < len) {
  			node = children[i];

  			ret = node && node[prop] != null
  				? treeWalker(node, callback, prop, y, i)
  				: callback(node, y, i);

  			if (ret === false) {
  				break;
  			}
  		}
  	};

  	return treeWalker;
  });

};

ninja["15"] = function (module, exports, __require__) {
  var utils = module.exports;

  var rtag = utils.rtag = /<(\/)?([\w]+)([^>]+|)?>/;
  var rtag_g = utils.rtag_g = /<[^>]+>/g;

  var singleTags = utils.singleTags = 'link br hr meta input img base param'.split(' ');
  var isSingle = utils.isSingle = function (tag, tagName) {
  	return tag[tag.length - 2] === '/' ||
  		( (tagName ||
  			(tagName = (rtag.exec(tag) || [])[2]) ) &&
  			singleTags.indexOf(tagName) >= 0 );
  };

  var rattr = utils.rattr = /[\s\t]+([\w\:-]+)(?:=\"([^\"]+)\"|=\'([^\']+)\'|)?/g;
  var makeAttributes = utils.makeAttributes = function (str) {
  	var one;
  	var node = {};
  	while ((one = rattr.exec(str))) {
  		node[one[1]] = one[2] || true;
  	}
  	return node;
  };

  var isTag = utils.isTag = function (tag) {
  	return rtag.test(tag);
  };
  var matchTag = utils.matchTag = function (tag) {
  	return isTag(tag) && tag.match(rtag);
  };
  var isTagEnd = utils.isTagEnd = function (tag) {
  	return isTag(tag) && tag[1] === '/';
  };

  var rtrim = utils.rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
  utils.trim = function (text) {
  	return text == null
  		? ""
  		: ( text + "" ).replace( rtrim, "" );
  };

  utils.rdoc = /^<[!?]?(doctype|xml)[^>]+>/i;
  utils.rxmlHead = /<\?[^>]*?\?>/ig;

  utils.rscript = /(<script[^>]*(?!\/)>)([\s\S]+?(?=\<\/script\>)|)?(<\/script>)/g;
  utils.rscriptCommentLine = /\/\/([^\n]*?\n)/g;
  utils.rscriptCommentAll = /\/\*([\s\S]+?(?=\*\/)|)?\*\utils.rcomment = /<!--([\s\S]+?(?=\-\-\>)|)?-->/g;

  var rbody = utils.rbody = /<body[^>]*>[\s\S]+<\/body>/;
  utils.getBody = function (str) {
  	return getMain(rbody, str);
  };

  var rhead = utils.rhead = /<head[^>]*>[\s\S]+<\/head>/;
  utils.getHead = function (str) {
  	return getMain(rhead, str);
  };

  function getMain(reg, str) {
  	return (str.match(reg) || [''])[0];
  }

  utils.regParts = regParts;
  function regParts(reg, str) {
  	var one;
  	var ret = [];
  	while (one = reg.exec(str)) ret.push(one);
  	ret.str = str;
  	return ret;
  }

  var oescape = {
  	'&' : '&amp;',
  	'<' : '&lt;',
  	'>' : '&gt;',
  	'"' : '&quot;',
  	"'" : '&#x27;',
  	'/' : '&#x2F;'
  };

  var rescape = /[&<>"'\/]/g;

  function _escape(one) {
  	return oescape[one];
  }

  var ounescape = {
  	'&amp;'  : '&',
  	'&lt;'   : '<',
  	'&gt;'   : '>',
  	'&quot;' : '"',
  	'&#x27;' : "'",
  	'&#x2F;' : '/'
  };

  var runescape = /(?:&amp;|&lt;|&gt;|&quot;|&#x27;|&#x2F;)/g;

  function _unescape(one) {
  	return ounescape[one];
  }

  utils.escape = escapeString;
  function escapeString(str) {
  	return str.replace(rescape, _escape);
  }

  utils.unescape = escapeString;
  function unescapeString(str) {
  	return str.replace(runescape, _unescape);
  }

  utils.escapeBad = escapeBad;
  function escapeBad(str, bad) {
  	return str.slice(0, bad.index)
  		+ escapeString(bad[0])
  		+ str.slice(bad.index + bad[0].length);
  }

  utils.handleParts = handleParts;
  function handleParts(rhead, rtail, str) {
  	var head = Array.isArray(rhead) ? rhead : regParts(rhead, str);
  	var tail = Array.isArray(rtail) ? rtail : regParts(rtail, str);
  	if (head.length !== tail.length) {
  		var bad;
  		while (head.length !== tail.length) {
  			bad = head.length > tail.length ? head.shift() : tail.pop();
  			str = escapeBad(str, bad);
  		}
  		head = regParts(rhead, str);
  		tail = regParts(rtail, str);
  	}

  	var ret = [], endIndex = 0, startIndex = 0, start, end, index;
  	while (start = head.shift()) {
  		startIndex = start.index;

  		if (endIndex < startIndex)
  			ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex, startIndex) });

  		end = tail.shift();
  		endIndex = end.index;
  		while (endIndex > start.index && (start = head[0]) && endIndex > start.index) {
  			start = head.shift();
  			end = tail.shift();
  		}

  		if ((endIndex = end.index + end[0].length) > startIndex)
  			ret.push({ isPart : true, index : startIndex, str : str.slice(startIndex, endIndex) });
  	}

  	if (endIndex < str.length)
  		ret.push({ isPart : false, index : endIndex, str : str.slice(endIndex) });

  	ret.str = str;
  	return ret;
  }

  var rcommentHead = utils.rcommentHead = /<!--/ig;
  var rcommentTail = utils.rcommentTail = /-->/ig;
  utils.handleComments = function(str) {
  	return handleParts(rcommentHead, rcommentTail, str);
  };

  var rscriptHead = utils.rscriptHead = /<script[^>]*>/ig;
  var rscriptTail = utils.rscriptTail = /<\/script>/ig;
  utils.handleScripts = function(str) {
  	str = escapeQuoteTag(str);
  	return handleParts(rscriptHead, rscriptTail, str);
  };

  var rquote = /(?:('[^']*?')|("[^"]*?"))/g;
  utils.escapeQuoteTag = escapeQuoteTag;
  function escapeQuoteTag(str) {
  	return str.replace(rquote, function (all) {
  		return rtag.test(all) ? escapeString(all) : all;
  	});
  }

};

ninja["16"] = function (module, exports, __require__) {
  var fs = __require__('-1');
  var path = __require__('-1');
  //
  var INTERVAL = 200;
  var watchList = [];


  module.exports = function watch(fn) {
  	return function (url, base) {
  	  url = path.normalize(url);

  	  if (watchList.indexOf(url) !== -1) {
  	    return;
  	  }
  	  watchList.push(url);

  	  console.log("  \033[90mwatching \033[36m%s\033[0m", url);

  	  var opts = {
  	      persistent: true,
  	      interval: 200
  	    },
  	    callback = function (curr, prev) {
  	      	      if (curr.mtime.getTime() === 0) {
  	        return;
  	      }
  	      	      if (curr.mtime.getTime() === prev.mtime.getTime()) {
  	        return;
  	      }
  	      fn(url, base);
  	    };
  	  fs.watchFile(url, opts, callback);
  	};
  };

};

ninja["17"] = function (module, exports, __require__) {
  exports.addQuote = __require__('1');
  exports.buildTree = __require__('6');
  exports.cookies = __require__('7');
  exports.ejs = __require__('8');
  exports.element = __require__('4');
  exports.extend = __require__('10');
  exports.parseString = __require__('3');
  exports.repeatString = __require__('0');
  exports.treeWalker = __require__('14');
  exports.utils = __require__('2');
  exports.watch = __require__('16');

};

for (var prop in ninja) {
	var factory = $factory[prop] = ninja[prop];
	var mod = ninja[prop] = {};
	mod.exports = {};
	mod.loaded = false;
	factory(mod, mod.exports, __require__);
	mod.loaded = true;
}

_ninja.exports = ninja["17"].exports;

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
