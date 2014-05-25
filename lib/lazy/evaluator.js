var path = require('path'),
    glob = require('glob');

function getForExtension(extension) {
  console.log("Extension: ", extension);
  try {
    return require('./evaluators/' + extension);
  } catch (e) {
    return false;
  }
}

module.exports = function evaluator(url, content) {
  var extension = path.extname(url).substr(1),
      evaluator = getForExtension(extension);
  return evaluator && evaluator(url, content) || content;
}
