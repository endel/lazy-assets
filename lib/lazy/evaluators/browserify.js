var fs = require('fs'),
    path = require('path'),
    sh = require('execSync');

module.exports = {
  contentType: "text/javascript",

  evaluate: function(res, url, content, options) {
    var args = "",
        extension = path.extname(url),
        transforms = [];

    args += '--extension="' + extension + '" ';

    if (options.transform || options.transforms) {
      transforms = (options.transform || options.transforms).split(",");
    }

    if (extension == ".coffee") {
      transforms.push("coffeeify");
    }

    for(var i=0;i<transforms.length;i++) {
      args += "-t " + transforms[i] + " ";
    }

    // Embed sourceMap
    if (!options.optimize) {
      args += "--debug ";
    }

    res.setHeader("Content-type", this.contentType);

    // TODO: use browserify nodejs API instead of commandline
    return sh.exec('browserify ' + args + options.path + url).stdout;
  }
}
