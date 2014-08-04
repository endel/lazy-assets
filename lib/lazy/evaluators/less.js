var less = require('less'),
    Sync = require('sync');

module.exports = {
  extensions: ['less'],
  contentType: "text/css",

  evaluate: function(res, url, content, options) {
    res.setHeader("Content-type", this.contentType);

    less.render(content, {
      sourceMap: true,
      outputSourceFiles: [ url + "?compile=plain" ], // this isn't working as expected

      //
      // Available source map options: (https://github.com/less/less.js/blob/f615fcb53e23e55efdcb702f27f9c7d35b27dba8/lib/less/source-map-output.js#L8-L11)
      //
      // sourceMapFilename: url + "?compile=plain",
      // writeSourceMap: ,
      // sourceMapURL: url + "?compile=plain",
      // sourceMapOutputFilename: ,
      // sourceMapBasepath: ,
      // sourceMapRootpath: ,
      // sourceMapGenerator: ,
    }, function(e, css) {
      content = css;
    });

    return content;
  }
}
