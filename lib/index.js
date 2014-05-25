var createServer = require('./lazy/server');
module.exports = createServer;

// Command-line Interface
if (!module.parent) {
  var server, argv = require('yargs').argv,
      path = argv._[0] || "./",
      port = argv.port || 3000;

  createServer({ path: path }).listen(port);
  console.log("Serving '" + path + "' at http://localhost:" + port + '/');
}
