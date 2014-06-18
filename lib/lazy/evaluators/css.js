module.exports = {
  evaluate: function(res, url, content, options) {
    res.setHeader('Content-type', 'text/css');
    return content;
  }
}
