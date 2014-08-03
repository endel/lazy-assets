var fs = require('fs'),
    ws = require('ws'),
    chokidar = require('chokidar'),
    evaluator = require('./evaluator');

module.exports = {
  socket: null,

  setup: function(app, server, path) {
    var that = this,
        wss = new ws.Server({ server: server });

    wss.on('connection', function(ws) {
      that.socket = ws;
    });

    app.get('/watch', function(req, res) {
      res.header('Content-Type', 'text/javascript');
      res.send(fs.readFileSync(__dirname + "/../client/watch.js"));
    });

    this.watch(path);
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
    if (!this.socket) { return; }
    console.log('File', path, 'has been added');
  },

  onAddDir: function(path) {
    if (!this.socket) { return; }
    console.log('Directory', path, 'has been added');
  },

  onChangeFile: function(path) {
    if (!this.socket) { return; }
    var ev = evaluator.getForUrl(path);

    if (ev.contentType == "text/css") {
      this.socket.send("stylesheet");
    // } else {
    //   this.socket.send("reload");
    }

    // console.log('File', path, 'has been changed');
  },

  onUnlinkFile: function(path) {
    if (!this.socket) { return; }
    // console.log('File', path, 'has been removed');
  },

  onUnlinkDir: function(path) {
    if (!this.socket) { return; }
    // console.log('Directory', path, 'has been removed');
  },

  onError: function(error) {
    if (!this.socket) { return; }
    // console.error('Error happened', error);
  }

}
