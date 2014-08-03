var stylus = require('stylus'),
    path = require('path');

module.exports = {
  contentType: "text/css",

  evaluate: function(res, url, content, options) {
    res.setHeader("Content-type", this.contentType);

    stylus.render(content, {
      //
      // TODO:
      // support source maps:
      // https://github.com/LearnBoost/stylus/pull/1427
      //
      // options:
      // paths: [],
      // filename: 'nesting.css'
    }, function(err, css){
      if (err) throw err;
      content = css;
    });

    return content;
  }
}

