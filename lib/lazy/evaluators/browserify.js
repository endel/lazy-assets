var fs = require('fs'),
    // browserify = require('browserify'),
    path = require('path'),
    sh = require('execSync');

module.exports = {
  contentType: "text/javascript",

  evaluate: function(res, url, content, options) {
    var args = "",
        extension = path.extname(url);

    if (extension == ".coffee") {
      args += "-t coffeeify ";
    }
    args += "-t brfs " + '--extension="' + extension + '" ';

    // Embed sourceMap
    if (!options.optimize) {
      args += "--debug ";
    }

    res.setHeader("Content-type", this.contentType);

    // TODO: use browserify nodejs API instead of commandline
    return sh.exec('browserify ' + args + options.path + url).stdout;
  }
}
