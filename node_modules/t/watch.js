var fs = require('fs');
var path = require('path');
//
var INTERVAL = 200;
var watchList = [];

/**
 * Watch for changes on path
 */
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
	      // File doesn't exist anymore. Keep watching.
	      if (curr.mtime.getTime() === 0) {
	        return;
	      }
	      // istanbul ignore if
	      if (curr.mtime.getTime() === prev.mtime.getTime()) {
	        return;
	      }
	      fn(url, base);
	    };
	  fs.watchFile(url, opts, callback);
	};
};