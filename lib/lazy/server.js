var fs = require('fs'),
    express = require('express'),
    tamper = require('tamper'),
    utils = require('./utils'),
    evaluator = require('./evaluator');

exports = module.exports = function createServer(options) {
  var app = express();

  // Set bower_components directory
  utils.bower.setBasePath(options.path);

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

  app.use(express.static(options.path));
  return app;
};
