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

    // Invalid params.
    if (output == path.resolve(input)) {
      throw new Error("'output' directory can't be the same as 'input'.");
    }

    // remove previous compiled files and re-generate them
    var oldFiles = glob.sync(output + "/assets/*.{js,css}").concat(
      glob.sync(output + "/**/**/**.{html,appcache}") ).concat(
      glob.sync(output + "/assets/images/**/**/**.{" + utils.extensions.font.join(',') + "}") );
    for (var i=0; i < oldFiles.length; i++) {
      fs.unlinkSync(oldFiles[i]);
    }
    mkdirp.sync(output + "/assets");

    for (var i=0; i < htmls.length; i++) {
      // skip html files from bower dependencies
      if (htmls[i].indexOf('bower_components') >= 0) { continue; }

      var javascripts = "", stylesheets = "",
          outputFile = htmls[i].replace(input, output),
          outputDir = path.dirname(outputFile),
          html = fs.readFileSync(htmls[i]).toString(),
          assetFiles = htmlEvaluator.parseHTML(html);

      mkdirp.sync(outputDir);

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

      var filesToCache = [], assetDefinitions = "";

      // Optimize Javascript
      if (javascripts.length > 0) {
        javascripts = UglifyJS.minify(javascripts, { fromString: true }).code;
        var javascriptOutput = "assets/javascripts-" + crypto.createHash('md5').update(javascripts).digest('hex').substr(0, 8) + ".js";
        fs.writeFileSync(outputDir + "/" + javascriptOutput, javascripts);
        filesToCache.push(javascriptOutput);
        assetDefinitions += '<script type="text/javascript" src="'+ javascriptOutput +'"></script>' + "\n";
      }

      // Optimize CSS
      if (stylesheets.length > 0) {
        stylesheets = new CleanCSS({
          // keepSpecialComments: false,
          // processImport: true
          // root: ,
          // relativeTo: ,
        }).minify(stylesheets);
        var stylesheetOutput = "assets/stylesheets-" + crypto.createHash('md5').update(stylesheets).digest('hex').substr(0, 8) + ".css";
        fs.writeFileSync(outputDir + "/" + stylesheetOutput, stylesheets);
        filesToCache.push(stylesheetOutput);
        assetDefinitions += '<link rel="stylesheet" type="text/css" href="' + stylesheetOutput + '" />' + "\n";
      }

      // Replace asset tags and manifest
      var htmlOutput = htmlEvaluator.replaceAssets(html, assetDefinitions);

      // Write cache manifest
      // if (filesToCache.length > 0) {
      //   var manifest = this.getCacheManifest(filesToCache),
      //       manifestFile = "manifest-" + crypto.createHash('md5').update(manifest).digest('hex').substr(0, 8) + ".appcache";
      //   fs.writeFileSync(outputDir + "/" + manifestFile, manifest);
      //   htmlOutput = htmlOutput.replace(/<html([^>]+)?/im, "<html manifest=\"" + manifestFile + "\"$1");
      // }

      fs.writeFileSync(outputFile, htmlOutput);
    }
  },

  searchBowerAssets: function() {
  },

  getCacheManifest: function(files) {
    var manifest = "CACHE MANIFEST\n";

    // timestamp
    manifest += "# "+ (new Date()).toString() +"\n";
    manifest += "\n";
    manifest += "CACHE:\n";
    for (var i=0; i < files.length; i++) {
      manifest += files[i] + "\n";
    }
    manifest += "\n";
    manifest += "# Resources that require the user to be online.\n";
    manifest += "# NETWORK:\n";
    manifest += "\n";
    manifest += "# static.html will be served if main.py is inaccessible\n";
    manifest += "# offline.jpg will be served in place of all images in images/large/\n";
    manifest += "# offline.html will be displayed if the user is offline\n";
    manifest += "FALLBACK:\n";
    manifest += "# /main.py /static.html\n";
    manifest += "# images/large/ images/offline.jpg\n";
    manifest += "# / /offline.html\n";

    return manifest;
  }

}
