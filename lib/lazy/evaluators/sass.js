var fs = require('fs'),
    sh = require('execSync');

module.exports = {
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

    res.setHeader("Content-type", "text/css");
    return result.stdout;
  }
}
