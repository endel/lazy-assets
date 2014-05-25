var fs = require('fs'),
    coffee = require('coffee-script');

module.exports = function(res, url, content, options) {
  res.setHeader("Content-type", "text/javascript");
  return coffee.compile(fs.readFileSync(options.path + url).toString());
}

