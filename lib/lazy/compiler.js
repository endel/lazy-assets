var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    glob = require('glob'),
    evaluator = require('./evaluator'),
    utils = require('./utils'),
    qs = require('querystring'),
    htmlEvaluator = require('./evaluators/html');

module.exports = {
  compile: function(input, output) {
    var javascripts = "", stylesheets = "",
        htmls = glob.sync(input + "/**/**/**/**.html"), // , {cwd: '.'}
        fakeRequest = {setHeader: function(){}};

    for (var i=0; i < htmls.length; i++) {
      var fileOutput = htmls[i].replace(input, output);
      mkdirp.sync( path.dirname(fileOutput) );

      var assetFiles = htmlEvaluator.parseHTML( fs.readFileSync(htmls[i]).toString() );

      for (var y=0; y < assetFiles.length; y++) {
        var querystring = "", extension = path.extname(assetFiles[y]),
            idxQueryString = extension.indexOf('?');

        // remove query string from extension
        if (idxQueryString >= 0) {
          querystring = extension.substr(idxQueryString+1);
          assetFiles[y] = assetFiles[y].replace(/\?.+/, "");
          extension = extension.replace(/\?.+/, "");
        }

        var response = evaluator(fakeRequest, assetFiles[y], fs.readFileSync(input + "/" + assetFiles[y]).toString(), {
          path: path.resolve(input) + "/",
          query: qs.parse(querystring)
        });

        if (utils.extensions.javascript.indexOf(extension)) {
          javascripts += response;

        } else if (utils.extensions.javascript.indexOf(extension)) {
          stylesheets += response;

        } else if (extension == "html") {
          // fs.writeFileSync(fileOutput, );
        }

      }
    }
  }
}
