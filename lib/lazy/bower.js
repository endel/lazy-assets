var glob = require('glob'),
    path = require('path'),
    utils = require('./utils');

module.exports = {
  search: function(res, url, body, options) {
    var found = glob.sync( utils.bower.getPath('*') + "/" + url)[0];

    //
    // Redirect to real dependency resource
    //
    if (found) {
      res.status(303);
      res.setHeader('Location', found.replace(path.resolve(utils.bower.getBasePath()), ""))
      return "";

    } else {
      res.status(404);
      return "";
    }
  }
}
