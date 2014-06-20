var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    glob = require('glob'),
    evaluator = require('./evaluator'),
    utils = require('./utils'),
    qs = require('querystring'),
    htmlEvaluator = require('./evaluators/html'),
    UglifyJS = require("uglify-js");

module.exports = {
  compile: function(input, output) {
    var htmls = glob.sync(input + "/**/**/**/**.html"), // , {cwd: '.'}
        fakeRequest = {setHeader: function(){}};

    for (var i=0; i < htmls.length; i++) {
      // skip html files from bower dependencies
      if (htmls[i].indexOf('bower_components') >= 0) { continue; }

      var javascripts = "", stylesheets = "",
          output = htmls[i].replace(input, output),
          html = fs.readFileSync(htmls[i]).toString();

      mkdirp.sync( path.dirname(output) );

      var assetFiles = htmlEvaluator.parseHTML(html);

      for (var y=0; y < assetFiles.length; y++) {
        var querystring = "",
            extension = path.extname(assetFiles[y]).substr(1),
            idxQueryString = extension.indexOf('?');

        // remove query string from extension
        if (idxQueryString >= 0) {
          querystring = extension.substr(idxQueryString+1);
          assetFiles[y] = assetFiles[y].replace(/\?.+/, "");
          extension = extension.replace(/\?.+/, "");
        }

        console.log(assetFiles[y]);

        var response = evaluator(fakeRequest, assetFiles[y], fs.readFileSync(input + "/" + assetFiles[y]).toString(), {
          path: path.resolve(input) + "/",
          optimize: true,
          query: qs.parse(querystring)
        });

        if (utils.extensions.javascript.indexOf(extension) !== -1) {
          javascripts += response;

        } else if (utils.extensions.javascript.indexOf(extension) !== -1) {
          stylesheets += response;

        } else if (extension == "html") {
          // fs.writeFileSync(fileOutput, );
        }

      }

      // Optimize javascripts and stylesheets
      var optimizedJs = UglifyJS.minify(javascripts, {fromString: true});
      javascripts = '<script type="text/javascript">' + optimizedJs.code + '</script>' + "\n";

      stylesheets = '<style type="text/css">' + stylesheets.replace("\n", "") + '</style>' + "\n";

      fs.writeFileSync(output, htmlEvaluator.replaceAssets(html, javascripts + stylesheets));
    }
  }
}
