var express = require('express'),
    tamper = require('tamper'),
    evaluator = require('./evaluator'),

exports = module.exports = function createServer(options) {
  var app = express();

  app.use(tamper(function(req, res) {
    // Set 'nocache' headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "nocache");
    res.setHeader("Expires", "0");

    return function(body) {
      var url = req.path;
      if (url.match(/\/$/)) { url += "index.html"; }
      return evaluator(url, body);
    };
  }));

  app.use(express.static(options.path));
  return app;
};
