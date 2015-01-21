var fs = require('fs'),
    http = require('http'),
    express = require('express'),
    tamper = require('tamper'),
    watcher = require('./watcher'),
    evaluator = require('./evaluator'),
    bower = require('./bower'),
    crypto = require('crypto');

exports = module.exports = function createServer(options) {
  var app = express(),
      server = http.createServer(app);

  app.use(tamper(function(req, res) {
    // Set 'nocache' headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "nocache");
    res.setHeader("Expires", "0");

    /**
     * Don't intercept some kind of resources:
     * - bower components
     * - images
     */
    if (
      res.getHeader('Content-Type').indexOf('image') !== -1 ||
      res.getHeader('Content-Type').indexOf('video') !== -1 ||
      req.path.indexOf('bower_components') !== -1
    ) {
      return false;
    }

    return function(body) {
      var response, url = req.path;
      options.query = req.query;

      // let body be null on error 404.
      if (body.indexOf('Cannot GET') !== -1) { body = null; }
      if (url.match(/\/$/)) { url += "index.html"; }

      response = evaluator.evaluate(res, url, body, options);

      if (response === null) {
        // search not found module on bower components.
        bower.search(res, url, body, options);
      }

      return response;
    };
  }));

  // watch for file changes
  watcher.setup(app, server, options.path);

  app.use(express.static(options.path));

  return server;
};
