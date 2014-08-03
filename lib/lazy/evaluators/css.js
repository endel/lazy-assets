module.exports = {
  contentType: 'text/css',

  evaluate: function(res, url, content, options) {
    res.setHeader('Content-type', this.contentType);
    return content;
  }
}
