var Handlebars = require('handlebars'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');

module.exports = {
  extensions: ['hbs', 'handlebars'],
  contentType: 'text/html',

  evaluate: function(res, url, content, options) {
    var i,
        partials = glob.sync("**/**.{html,hbs,handlebars}", {
          cwd: options.path
        }),
        template = Handlebars.compile(content);

    for (i=0; i<partials.length; i++) {
      var partial = partials[i].substr(0, partials[i].lastIndexOf('.'));
      Handlebars.registerPartial(partial, fs.readFileSync(options.path + "/" + partials[i], {encoding: 'utf-8'}));
    }

    res.setHeader('Content-type', this.contentType);
    return template({});
  }
}
