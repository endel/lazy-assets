var less = require('less'),
    fs = require('fs'),
    Sync = require('sync');

module.exports = function(res, url, content, options) {
  res.setHeader("Content-type", "text/css");

  less.render(fs.readFileSync(options.path + url).toString(), function(e, css) {
    content = css;
  });

  return content;
}
