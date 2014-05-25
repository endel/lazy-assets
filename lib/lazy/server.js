exports = module.exports = function createServer(options) {
  var express = require('express'),
      tamper = require('tamper'),
      app = express();

  app.use(tamper(function(req, res) {
    // Set 'nocache' headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "nocache");
    res.setHeader("Expires", "0");

    if (res.statusCode === 404) {
      console.log("You just got 404. " + req.path);
    }

    return function(body) {
      return body;
    };
  }));

  app.use(express.static(options.path));
  return app;
};
