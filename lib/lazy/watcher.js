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

    app.get('/watch.js', function(req, res) {
      res.header('Content-Type', 'text/javascript');
      res.send(fs.readFileSync(__dirname + "/../client/watch.js"));
    });

    basepath = path;

    this.watch(basepath, {
      persistent: true,
      ignoreInitial: true
    });
  },

  getClientScript: function() {
    return '<script type="text/javascript" src="/watch.js"></script>';
  },

  watch: function(path, options) {
    if (typeof(options)==="undefined") { options = {}; }
    options.ignored = /[\/\\]\./;

    var that = this,
        watcher = chokidar.watch(path, options);

    watcher
      .on('add', function() { that.onAddFile.apply(that, arguments) })
      .on('addDir', function() { that.onAddDir.apply(that, arguments) })
      .on('change', function() { that.onChangeFile.apply(that, arguments) })
      .on('unlink', function() { that.onUnlinkFile.apply(that, arguments) })
      .on('unlinkDir', function() { that.onUnlinkDir.apply(that, arguments) })
      .on('error', function() { that.onError.apply(that, arguments) })
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

  onAddFile: function(path) { },
  onAddDir: function(path) { },
  onUnlinkFile: function(path) { },
  onUnlinkDir: function(path) { },
  onError: function(error) { }

}
