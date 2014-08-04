var path = require('path'),
    glob = require('glob');

module.exports = {
  getForUrl: function(url, query) {
    if (typeof(query) == "undefined") { query = {}; }
    var extension = path.extname(url).substr(1);

    /**
     * Map exensions to evaluators
     * TODO: refactor this
     */
    if (extension=="scss") {
      extension = "sass";
    }
    if (require('./evaluators/image').extensions.indexOf(extension)!==-1) {
      extension = "image";
    }

    var evaluator = query.compile || extension;
    if (evaluator && evaluator.length > 0) {
      try {
        return require('./evaluators/' + evaluator);
      } catch (e) {
        console.log(url, extension, "=>", e);
      }
    }

    return false;
  },

  evaluate: function (res, url, content, options) {
    var evaluator = this.getForUrl(url, options.query);
    return evaluator && evaluator.evaluate(res, url, content, options) || content;
  }
}
