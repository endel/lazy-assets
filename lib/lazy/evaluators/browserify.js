var fs = require('fs'),
    // browserify = require('browserify'),
    path = require('path'),
    sh = require('execSync');

module.exports = function(res, url, content, options) {
  var args = "",
      extension = path.extname(url);

  if (extension == ".coffee") {
    args += "-t coffeeify ";
  }
  args += "-t brfs " + '--extension="' + extension + '" ';

  res.setHeader("Content-type", "text/javascript");

  // TODO: use browserify nodejs API instead of commandline
  return sh.exec('browserify ' + args + options.path + url).stdout;
}
