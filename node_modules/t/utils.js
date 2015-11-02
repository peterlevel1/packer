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

//not greedy match, inner script tag: two script tag should exist together
utils.rscript = /(<script[^>]*(?!\/)>)([\s\S]+?(?=\<\/script\>)|)?(<\/script>)/g;
utils.rscriptCommentLine = /\/\/([^\n]*?\n)/g;
utils.rscriptCommentAll = /\/\*([\s\S]+?(?=\*\/)|)?\*\//g;
utils.rcomment = /<!--([\s\S]+?(?=\-\-\>)|)?-->/g;

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