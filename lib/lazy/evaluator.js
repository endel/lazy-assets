var path = require('path'),
    glob = require('glob');

function getForExtension(extension, query) {
  try {
    return require('./evaluators/' + query.compile || extension);
  } catch (e) {
    console.log(extension, "=>", e);
    return false;
  }
}

module.exports = function evaluator(res, url, content, options) {
  var extension = path.extname(url).substr(1),
      evaluator = getForExtension(extension, options.query);
  return evaluator && evaluator(res, url, content, options) || content;
}
