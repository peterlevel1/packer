var utils = require('./utils.js');

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