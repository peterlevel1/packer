module.exports = function repeatString(i, repeated) {
	var ret = '';
	i = ~~i;
	if (i <= 0 || typeof repeated !== 'string')
		return ret;

	while (i--) ret += repeated;
	return ret;
};