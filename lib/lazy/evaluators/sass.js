var fs = require('fs'),
    sh = require('execSync');

module.exports = {
  evaluate: function(res, url, content, options) {
    res.setHeader("Content-type", "text/css");
    return sh.exec('sass --compass ' + options.path + url + ' /dev/stdout').stdout;
  }
}
