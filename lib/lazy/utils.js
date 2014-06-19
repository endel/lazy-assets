var fs = require('fs'),
    bower = require('bower'),
    glob = require('glob'),
    path = require('path'),
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

    getMain: function(asset) {
      var files = (asset.main && asset.main.split(",")) || [],
          path = this.getPath(asset.href)
          jsonPath = path + '/bower.json';

      if (files.length === 0 && fs.existsSync(jsonPath)) {
        var json = JSON.parse(fs.readFileSync(jsonPath).toString());
        if (json.main) {
          if (typeof(json.main)==="string") {
            json.main = [json.main];
          }
          files = files.concat(json.main);
        }
      }

      var directory = bower.config.directory.replace(this.basePath, "");

      // Try another main file from alternative patterns
      if (files.length === 0) {
        var dependency_root = directory.substr(1) + "/" + asset.href;
        var found, patterns = [
          dependency_root + '/' + asset.href + '.{js,css}',
          dependency_root + '/' + asset.href + '.min.{js,css}',
          dependency_root + '/jquery.' + asset.href + '.{js,css}',
          dependency_root + '/jquery.' + asset.href + '.min.{js,css}',
          dependency_root + '/{css,dist,build}/' + asset.href + '.{js,css}',
          dependency_root + '/{css,dist,build}/' + asset.href + '.min.{js,css}',
          dependency_root + '/{css,dist,build}/jquery.' + asset.href + '.{js,css}',
          dependency_root + '/{css,dist,build}/jquery.' + asset.href + '.min.{js,css}',
        ];

        for (var i=0; i < patterns.length; i++) {
          found = glob.sync(patterns[i], {cwd: this.getBasePath()});
          if (found.length > 0) {
            for (var j=0; j < found.length; j++) {
              files.push(found[j].replace(dependency_root, ""));
            }
            break;
          }
        }
      }

      for (var i=0; i < files.length; i++) {
        files[i] = directory + "/" + asset.href + "/" + files[i];
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
