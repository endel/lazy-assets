var fs = require('fs'),
    ws = require('ws'),
    chokidar = require('chokidar'),
    evaluator = require('./evaluator');

var basepath = null, socket = null;

module.exports = {
  trigger: function(message) {
    return socket.send(JSON.stringify(message));
  },

  setup: function(app, server, path) {
    var that = this,
        wss = new ws.Server({ server: server });

    wss.on('connection', function(ws) { socket = ws; });

    app.get('/watch', function(req, res) {
      res.header('Content-Type', 'text/javascript');
      res.send(fs.readFileSync(__dirname + "/../client/watch.js"));
    });

    basepath = path;
    this.watch(basepath);
  },

  getClientScript: function() {
    return '<script type="text/javascript" src="/watch"></script>';
  },

  watch: function(path) {
    var that = this,
        watcher = chokidar.watch(path, { ignored: /[\/\\]\./, persistent: true });

    watcher
      .on('add', function() { that.onAddFile.apply(that, arguments) })
      .on('addDir', function() { that.onAddDir.apply(that, arguments) })
      .on('change', function() { that.onChangeFile.apply(that, arguments) })
      .on('unlink', function() { that.onUnlinkFile.apply(that, arguments) })
      .on('unlinkDir', function() { that.onUnlinkDir.apply(that, arguments) })
      .on('error', function() { that.onError.apply(that, arguments) })
  },

  onAddFile: function(path) {
    // console.log('File', path, 'has been added');
  },

  onAddDir: function(path) {
    // console.log('Directory', path, 'has been added');
  },

  onChangeFile: function(path) {
    var ev = evaluator.getForUrl(path),
        fileUrl = path.replace(basepath, "");

    if (ev.contentType == "text/css") {
      this.trigger({type: "stylesheet", path: fileUrl});

    } else if (path.match(/\.html$/)) {
      var htmlSource = fs.readFileSync(path).toString(),
          htmlEvaluated = ev.evaluate(null, null, htmlSource, {});
      this.trigger({ type: "html", path: fileUrl, html: htmlEvaluated });
    }

    // console.log('File', path, 'has been changed');
  },

  onUnlinkFile: function(path) {
    // console.log('File', path, 'has been removed');
  },

  onUnlinkDir: function(path) {
    // console.log('Directory', path, 'has been removed');
  },

  onError: function(error) {
    // console.error('Error happened', error);
  }

}
