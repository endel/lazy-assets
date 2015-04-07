var fs = require('fs'),
    sh = require('shelljs');

module.exports = {
  extensions: ['sass', 'scss'],
  contentType: "text/css",
  evaluate: function(res, url, content, options) {
    var args = "--compass ",
        result = sh.exec('sass ' + args + options.path + url + ' /dev/stdout');

    if (result.code !== 0) {
      //
      // Something went wrong!
      //
      // - gem missing?
      // - syntax error?
      //
    }

    res.setHeader("Content-type", this.contentType);
    return result.output;
  }
}
