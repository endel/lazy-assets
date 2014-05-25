var path = require('path'),
    utils = require('../utils');

function getAttributesFromTag(asset) {
  var attr, attrs = {},
      matches = asset.match(/(\w+)=([^\s]+)/g);
  for (var i=0; i < matches.length; i++) {
    attr = matches[i].match(/(\w+)=['|"]([^\s]+)['|"]/im);
    attrs[ attr[1] ] = attr[2];
  }
  console.log(attrs);
  return attrs;
}

function getAssetTag(asset) {
  var queryString = [],
      extension = path.extname(asset.href).substr(1),
      href = asset.href,
      isBower = (asset.source === "bower" || extension === "");

  delete asset.href;

  if (isBower) {
    if (!utils.bower.exists(href)) {
      utils.bower.install(href);
    }

    var mainFiles = utils.bower.getMain(href);
    var assetTags = "";
    console.log(mainFiles);
    for (var i=0; i < mainFiles.length; i++) {
      console.log(mainFiles[i]);
      assetTags += getAssetTag({href: mainFiles[i]});
    }
    return assetTags;

  } else {

    // Append options on query string resource
    for (attr in asset) { queryString.push(attr + '=' + asset[attr]); }
    if (queryString.length > 0) { href += "?" + queryString.join("&"); }

    if (utils.extensions.javascript.indexOf(extension) !== -1) {
      return '<script type="text/javascript" src="' + href + '"></script>' + "\n";

    } else if (utils.extensions.stylesheet.indexOf(extension) !== -1) {
      return '<link rel="stylesheet" type="text/css" href="'+ href +'">' + "\n";

    // } else if (utils.extensions.font.indexOf(extension) !== -1) {
    }

  }

  return "";
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
