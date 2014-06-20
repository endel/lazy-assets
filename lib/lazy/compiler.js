var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    glob = require('glob'),
    evaluator = require('./evaluator'),
    utils = require('./utils'),
    qs = require('querystring'),
    htmlEvaluator = require('./evaluators/html'),
    CleanCSS = require("clean-css"),
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
          outputDir = path.dirname(output),
          html = fs.readFileSync(htmls[i]).toString();

      mkdirp.sync(outputDir);

      // remove previous generated assets
      var oldAssets = glob.sync(outputDir + "/*.{js,css,html}" );
      for (var i=0; i < oldAssets.length; i++) {
        fs.unlinkSync(oldAssets[i]);
      }

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

        var content = fs.readFileSync(input + "/" + assetFiles[y], {encoding: 'utf-8'});
        var response = evaluator(fakeRequest, assetFiles[y], content, {
          path: path.resolve(input) + "/",
          optimize: true,
          query: qs.parse(querystring)
        });

        if (utils.extensions.javascript.indexOf(extension) !== -1) {
          javascripts += response;

        } else if (utils.extensions.stylesheet.indexOf(extension) !== -1) {
          stylesheets += response;

        } else if (extension == "html") {
          // fs.writeFileSync(fileOutput, );
        }

      }

      // Optimize Javascript
      var optimizedJs = UglifyJS.minify(javascripts, {fromString: true});
      javascripts = optimizedJs.code;

      // Optimize CSS
      stylesheets = new CleanCSS().minify(stylesheets);

      var javascriptOutput = "javascripts-" + crypto.createHash('md5').update(javascripts).digest('hex') + ".js",
          stylesheetOutput = "stylesheets-" + crypto.createHash('md5').update(stylesheets).digest('hex') + ".css";

      fs.writeFileSync(outputDir + "/" + javascriptOutput, javascripts);
      fs.writeFileSync(outputDir + "/" + stylesheetOutput, stylesheets);

      var assetDefinitions = '<script type="text/javascript" src="'+ javascriptOutput +'"></script>' + "\n" +
        '<link rel="stylesheet" type="text/css" href="' + stylesheetOutput + '" />' + "\n";

      fs.writeFileSync(output, htmlEvaluator.replaceAssets(html, assetDefinitions));
    }
  }
}
