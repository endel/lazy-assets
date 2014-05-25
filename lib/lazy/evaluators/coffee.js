var coffee = require('coffee');

module.exports = function(res, url, content, options) {
  res.setHeader("Content-type", "text/javascript");
  return content;

  var parser = new(less.parser)({ filename: url });
  console.log(parser);
  return parser.toCSS();
}

