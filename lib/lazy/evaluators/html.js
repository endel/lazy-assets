var path = require('path'),
    glob = require('glob'),
    utils = require('../utils');

module.exports = {
  ASSETS_GROUP_REGEXP: /<assets>([\s\S]*?)<\/assets>/im,

  getAttributesFromTag: function(asset) {
    var attr, attrs = {},
        matches = asset.match(/(\w+)=([^\s]+)/g);
    for (var i=0; i < matches.length; i++) {
      attr = matches[i].match(/(\w+)=['|"]([^\s]+)['|"]/im);
      attrs[ attr[1] ] = attr[2];
    }
    return attrs;
  },

  getAssets: function(asset) {
    var extension = path.extname(asset.href).substr(1),
        href = asset.href,
        isBower = (asset.source === "bower" || extension === ""),
        assetUrls = [];

    // Fix href if it starts with '/'
    if (href.indexOf('/') === 0) { href = href.substr(1); }

    if (isBower) {
      if (!utils.bower.exists(href)) {
        utils.bower.install(href);
      }

      var mainFiles = utils.bower.getMain(asset);
      for (var i=0; i < mainFiles.length; i++) {
        assetUrls = assetUrls.concat( this.getAssets({href: mainFiles[i]}) );
      }

    } else {
      delete asset.href;

      var queryString = [],
      files = glob.sync(href, {cwd: utils.bower.getBasePath()});

      // Append options on query string resource
      for (attr in asset) {
        queryString.push(attr + '=' + asset[attr]);
      }

      for (var i = files.length - 1; i >= 0; i--){
        if (queryString.length > 0) {
          // append options to final asset url
          files[i] += "?" + queryString.join("&");
        }

        assetUrls.push( files[i] );
      }
    }

    return assetUrls;
  },

  getAssetTag: function(href) {
    var tag, extension = path.extname(href).substr(1);

    // remove query string from extension
    if (extension.indexOf('?') >= 0) { extension = extension.replace(/\?.+/, ""); }

    if (utils.extensions.javascript.indexOf(extension) !== -1) {
      tag = '<script type="text/javascript" src="' + href + '"></script>' + "\n";

    } else if (utils.extensions.stylesheet.indexOf(extension) !== -1) {
      tag = '<link rel="stylesheet" type="text/css" href="'+ href +'">' + "\n";

      // } else if (utils.extensions.font.indexOf(extension) !== -1) {
    }

    return tag;
  },

  parseHTML: function(html) {
    var assetGroups = html.match(this.ASSETS_GROUP_REGEXP),
        assets = assetGroups && assetGroups[1].match(/<asset([\s\S]*?)\/>/ig) || [],
        files = [];

    for (var i=0; i < assets.length; i++) {
      files = files.concat( this.getAssets( this.getAttributesFromTag(assets[i]) ) );
    }

    return files;
  },

  replaceAssets: function(content, definitions) {
    return content.replace(this.ASSETS_GROUP_REGEXP, definitions);
  },

  evaluate: function(res, url, content) { // , options
    var assetsReplacement = "",
        assets = this.parseHTML(content);

    for (var i=0; i < assets.length; i++) {
      var assetTag = this.getAssetTag(assets[i]);

      // append asset if identified
      if (assetTag) {
        assetsReplacement += assetTag;
      }
    }

    return this.replaceAssets(content, assetsReplacement);
  }
};
