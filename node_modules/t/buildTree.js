var parseString = require('./parseString.js');
var ElementNode = require('./element.js');
var utils = require('./utils.js');
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