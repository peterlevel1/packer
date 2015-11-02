module.exports = ElementNode;

var util = require('util');

function Node(opts) {
	this.textContent = '';
	this.nodeType = 0;
	this.parentNode = null;
	this.children = null;
}

// 1	Element	代表元素	Element, Text, Comment, ProcessingInstruction, CDATASection, EntityReference
// 2	Attr	代表属性	Text, EntityReference
// 3	Text	代表元素或属性中的文本内容。	None
// 4	CDATASection	代表文档中的 CDATA 部分（不会由解析器解析的文本）。	None
// 5	EntityReference	代表实体引用。	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
// 6	Entity	代表实体。	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
// 7	ProcessingInstruction	代表处理指令。	None
// 8	Comment	代表注释。	None
// 9	Document	代表整个文档（DOM 树的根节点）。	Element, ProcessingInstruction, Comment, DocumentType
// 10	DocumentType	向为文档定义的实体提供接口	None
// 11	DocumentFragment	代表轻量级的 Document 对象，能够容纳文档的某个部分	Element, ProcessingInstruction, Comment, Text, CDATASection, EntityReference
// 12	Notation	代表 DTD 中声明的符号。	None
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

// DocumentElementNode.prototype.createElement = function () {};
// DocumentElementNode.prototype.createTextNode = function () {};
// DocumentElementNode.prototype.getElementById = function () {};