var fs = require('fs'),
    express = require('express'),
    tamper = require('tamper'),
    evaluator = require('./evaluator'),
    bower = require('./bower'),
    crypto = require('crypto');

exports = module.exports = function createServer(options) {
  var app = express();

  app.use(tamper(function(req, res) {
    // Set 'nocache' headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "nocache");
    res.setHeader("Expires", "0");

    if (req.path.indexOf('bower_components') !== -1) {
      // Serve bower_components as static files.
      return false;
    }

    return function(body) {
      var response, url = req.path;
      if (url.match(/\/$/)) { url += "index.html"; }
      options.query = req.query;

      response = evaluator(res, url, body, options);
      if (response.indexOf('Cannot GET') !== -1) {
        bower.search(res, url, body, options);
      }
      return response;
    };
  }));

  app.use(express.static(options.path));
  return app;
};
