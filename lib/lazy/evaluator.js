var path = require('path'),
    glob = require('glob');

function getForExtension(extension) {
  try {
    return require('./evaluators/' + extension);
  } catch (e) {
    console.log(extension, "=>", e);
    return false;
  }
}

module.exports = function evaluator(res, url, content, options) {
  var extension = path.extname(url).substr(1),
      evaluator = getForExtension(extension);
  return evaluator && evaluator(res, url, content, options) || content;
}
