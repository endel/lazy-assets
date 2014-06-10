var path = require('path'),
    glob = require('glob'),
    utils = require('../utils');

function getAttributesFromTag(asset) {
  var attr, attrs = {},
      matches = asset.match(/(\w+)=([^\s]+)/g);
  for (var i=0; i < matches.length; i++) {
    attr = matches[i].match(/(\w+)=['|"]([^\s]+)['|"]/im);
    attrs[ attr[1] ] = attr[2];
  }
  // console.log("attributes: ", attrs);
  return attrs;
}

function getAssetTag(asset) {
  var extension = path.extname(asset.href).substr(1),
      href = asset.href,
      isBower = (asset.source === "bower" || extension === ""),
      assetTags = "";

  delete asset.href;

  // Fix href if it starts with '/'
  if (href.indexOf('/') === 0) { href = href.substr(1); }

  if (isBower) {
    if (!utils.bower.exists(href)) {
      utils.bower.install(href);
    }


    var mainFiles = utils.bower.getMain(href);
    // console.log("Main files: ", mainFiles);
    for (var i=0; i < mainFiles.length; i++) {
      assetTags += getAssetTag({href: mainFiles[i]});
    }

  } else {

    // console.log("getAssetTag:", href, glob.sync(href, {cwd: utils.bower.getBasePath()}));

    var queryString = [],
        files = glob.sync(href, {cwd: utils.bower.getBasePath()});

    // Append options on query string resource
    for (attr in asset) { queryString.push(attr + '=' + asset[attr]); }

    for (var i = files.length - 1; i >= 0; i--){
      if (queryString.length > 0) { files[i] += "?" + queryString.join("&"); }

      if (utils.extensions.javascript.indexOf(extension) !== -1) {
        assetTags += '<script type="text/javascript" src="' + files[i] + '"></script>' + "\n";

      } else if (utils.extensions.stylesheet.indexOf(extension) !== -1) {
        assetTags += '<link rel="stylesheet" type="text/css" href="'+ files[i] +'">' + "\n";

        // } else if (utils.extensions.font.indexOf(extension) !== -1) {
      }
    }
  }

  return assetTags;
}

module.exports = function(res, url, content, options) {
  var attrs,
      assetGroupRegexp = /<assets>([\s\S]*?)<\/assets>/im,
      assetGroups = content.match(assetGroupRegexp),
      assets = assetGroups[1].match(/<asset([\s\S]*?)\/>/ig),
      assetsReplacement = "";

  if (typeof(options)==="undefined") {
    options = {};
  }

  for (var i=0; i < assets.length; i++) {
    assetsReplacement += getAssetTag( getAttributesFromTag(assets[i]) );
  }

  return content.replace(assetGroupRegexp, assetsReplacement);
};
