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

    output = path.resolve(output);

    // remove previous compiled files and re-generate them
    var oldFiles = glob.sync(output + "/assets/*.{js,css}").concat(
      glob.sync(output + "/**/**/**.html") ).concat(
      glob.sync(output + "/assets/images/**/**/**.{" + utils.extensions.font.join(',') + "}") );
    for (var i=0; i < oldFiles.length; i++) {
      fs.unlinkSync(oldFiles[i]);
    }
    mkdirp.sync(output + "/assets");

    for (var i=0; i < htmls.length; i++) {
      // skip html files from bower dependencies
      if (htmls[i].indexOf('bower_components') >= 0) { continue; }

      var javascripts = "", stylesheets = "",
          output = htmls[i].replace(input, output),
          outputDir = path.dirname(output),
          html = fs.readFileSync(htmls[i]).toString(),
          assetFiles = htmlEvaluator.parseHTML(html);

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

        if (assetFiles[y].indexOf('.coffee') >= 0) {
          console.log(assetFiles[y], response);
        }

        if (utils.extensions.javascript.indexOf(extension) !== -1) {
          javascripts += response;

        } else if (utils.extensions.stylesheet.indexOf(extension) !== -1) {
          stylesheets += response;

        } else if (extension == "html") {
          // fs.writeFileSync(fileOutput, );
        }

      }

      // Optimize Javascript
      var optimizedJs = UglifyJS.minify(javascripts, { fromString: true });
      javascripts = optimizedJs.code;

      // Optimize CSS
      stylesheets = new CleanCSS({
        // keepSpecialComments: false,
        // processImport: true
        // root: ,
        // relativeTo: ,
      }).minify(stylesheets);

      var javascriptOutput = "assets/javascripts-" + crypto.createHash('md5').update(javascripts).digest('hex').substr(0, 8) + ".js",
          stylesheetOutput = "assets/stylesheets-" + crypto.createHash('md5').update(stylesheets).digest('hex').substr(0, 8) + ".css";

      fs.writeFileSync(outputDir + "/" + javascriptOutput, javascripts);
      fs.writeFileSync(outputDir + "/" + stylesheetOutput, stylesheets);

      var assetDefinitions = '<script type="text/javascript" src="'+ javascriptOutput +'"></script>' + "\n" +
        '<link rel="stylesheet" type="text/css" href="' + stylesheetOutput + '" />' + "\n";

      fs.writeFileSync(output, htmlEvaluator.replaceAssets(html, assetDefinitions));
    }
  }
}
