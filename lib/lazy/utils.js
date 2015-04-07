var fs = require('fs'),
    bower = require('bower'),
    glob = require('glob'),
    path = require('path'),
    sh = require('shelljs');

module.exports = {
  bower: {
    setBasePath: function(dir) {
      fs.writeFileSync('.bowerrc', JSON.stringify({
        cwd: dir,
        directory: "bower_components"
      }));

      // create bower.json to save dependencies
      var bowerFile = dir + '/bower.json'
      if (!fs.existsSync(bowerFile)) {
        fs.writeFileSync(bowerFile, JSON.stringify({name: "app"}));
      }

      this.cwd = dir;
    },

    getPath: function(name) {
      // bower.config.directory
      return this.getBasePath() + "/bower_components/" + path.basename(name);
    },

    getBasePath: function() {
      return this.cwd;
    },

    exists: function(name) {
      try {
        var stat = fs.statSync(this.getPath(name));
        return stat.isDirectory();
      } catch (e) {
        return false;
      }
    },

    install: function(name, version) {
      var shell = 'bower install --save ' + name + ' --config.interactive=false';
      if (version) { shell += "#" + version; }

      console.warn("Installing '" + name + "' from bower...");
      var response = sh.exec(shell);
      if (response.code == 1) {
        console.error(response.output)
      }
      return response;
    },

    getMain: function(asset) {
      var files = (asset.main && asset.main.split(",")) || [],
          fullDir = this.getPath(asset.href)
          dir = path.basename(fullDir),
          jsonPath = fullDir + '/bower.json';

      if (files.length === 0 && fs.existsSync(jsonPath)) {
        var json = JSON.parse(fs.readFileSync(jsonPath).toString());
        if (json.main) {
          if (typeof(json.main)==="string") {
            json.main = [json.main];
          }
          files = files.concat(json.main);
        }
      }

      var directory = bower.config.directory.replace(this.getBasePath(), "");

      // Try another main file from alternative patterns
      if (files.length === 0) {
        var dependency_root = directory + "/" + dir;

        // it 'seems' we need recursivity here. lazy programming
        var found, patterns = [
          dependency_root + '/' + dir,
          dependency_root + '/' + dir + '.min.{js,css}',
          dependency_root + '/' + dir + '.{js,css}',
          dependency_root + '/' + dir + '.min.{js,css}',
          dependency_root + '/jquery.' + dir,
          dependency_root + '/jquery.' + dir + '.{js,css}',
          dependency_root + '/jquery.' + dir + '.min.{js,css}',
          dependency_root + '/{css,dist,build}/' + dir,
          dependency_root + '/{css,dist,build}/' + dir + '.{js,css}',
          dependency_root + '/{css,dist,build}/' + dir + '.min.{js,css}',
          dependency_root + '/{css,dist,build}/jquery.' + dir,
          dependency_root + '/{css,dist,build}/jquery.' + dir + '.{js,css}',
          dependency_root + '/{css,dist,build}/jquery.' + dir + '.min.{js,css}',
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
        files[i] = directory + "/" + dir + "/" + files[i];
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
