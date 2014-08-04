var path = require('path'),
    Imagemin = require('imagemin');

module.exports = {
  extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  evaluate: function(res, url, content, options) {
    var extension = path.extname(url).substr(1);

    if (!options.optimize) {
    }

    return false;
  }
}

