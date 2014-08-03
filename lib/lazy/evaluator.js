var path = require('path'),
    glob = require('glob');

module.exports = {
  getForUrl: function(url, query) {
    if (typeof(query) == "undefined") { query = {}; }
    var extension = path.extname(url).substr(1);

    // extension aliases
    if (extension=="scss") {
      extension = "sass";
    }

    try {
      return require('./evaluators/' + (query.compile || extension));
    } catch (e) {
      console.log(extension, "=>", e);
      return false;
    }
  },

  evaluate: function (res, url, content, options) {
    var evaluator = this.getForUrl(url, options.query);
    return evaluator && evaluator.evaluate(res, url, content, options) || content;
  }
}
