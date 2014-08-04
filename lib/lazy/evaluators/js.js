module.exports = {
  extensions: ['js'],
  contentType: 'text/javascript',
  evaluate: function(res, url, content, options) {
    res.setHeader('Content-type', this.contentType);
    return content;
  }
}

