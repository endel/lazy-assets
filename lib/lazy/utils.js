var fs = require('fs'),
    bower = require('bower'),
    sh = require('execSync');

module.exports = {
  bower: {
    setBasePath: function(path) {
      fs.writeFileSync('.bowerrc', JSON.stringify({
        directory: path + "/bower_components"
      }));
      this.basePath = path;
    },

    getPath: function(name) {
      return bower.config.cwd + "/" + bower.config.directory + "/" + name;
    },

    getBasePath: function() {
      return this.basePath;
    },

    exists: function(name) {
      try {
        var stat = fs.statSync(this.getPath(name));
        return stat.isDirectory();
      } catch (e) {
        return false;
      }
    },

    install: function(name) {
      sh.exec('bower install -S ' + name);
    },

    getMain: function(name) {
      var files = [],
          path = this.getPath(name)
          jsonPath = path + '/bower.json';

      if (fs.existsSync(jsonPath)) {
        var json = JSON.parse(fs.readFileSync(jsonPath).toString());
        if (json.main) {
          if (typeof(json.main)==="string") {
            json.main = [json.main];
          }
          files = files.concat(json.main);
        }
      }

      // Try another main file from alternative patterns
      if (files.length === 0) {
      }

      var directory = bower.config.directory.replace(this.basePath, "");
      for (var i=0; i < files.length; i++) {
        files[i] = directory + "/" + name + "/" + files[i];
      }

      return files;
    },

    tryMain: function(name, file) {
    }

  },

  extensions: {
    javascript : ['coffee', 'js', 'jsx'],
    stylesheet : ['less', 'css', 'scss', 'sass', 'styl'],
    font : ['svg', 'eot', 'woff', 'ttf']
  }
};
