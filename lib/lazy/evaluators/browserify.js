var fs = require('fs'),
    // browserify = require('browserify'),
    sh = require('execSync');

module.exports = function(res, url, content, options) {
  res.setHeader("Content-type", "text/javascript");

  // TODO: use browserify nodejs API instead of commandline
  return sh.exec('browserify -t brfs ' + options.path + url).stdout;
}
