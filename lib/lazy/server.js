var express = require('express'),
    tamper = require('tamper'),
    evaluator = require('./evaluator'),
    lessMiddleware = require('less-middleware'),
    coffeeMiddleware = require('coffee-middleware');

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
      options.query = req.query;
      return evaluator(res, url, body, options);
    };
  }));

  app.use(lessMiddleware(options.path));
  app.use(express.static(options.path));
  return app;
};
