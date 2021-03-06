var path = require('path'),
    coffee = require('coffee-script');

module.exports = {
  extensions: ['coffee'],
  contentType: "text/javascript",

  evaluate: function(res, url, content, options) {
    var response = "";

    if (options.query.sourceMap) {
      res.setHeader("Content-type", "application/json");

      var map = coffee.compile(content, {
        generatedFile: url,
        sourceFiles: [ url + "?compile=plain" ],
        sourceMap: true
      } );
      response = map.v3SourceMap;

    } else {
      res.setHeader("Content-type", this.contentType);
      response += coffee.compile(content);

      // Append sourceMap url
      if (!options.optimize) {
        response += "//# sourceMappingURL=" + url + "?sourceMap=1";
      }
    }

    return response
  }
}

