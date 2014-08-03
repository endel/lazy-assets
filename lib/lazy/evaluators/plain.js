module.exports = {
  contentType: 'text/plain',

  evaluate: function(res, url, content, options) {
    res.setHeader('Content-type', this.contentType);

    // force status 200, why it's resulting in 404 here?
    res.status(200);

    return content;
  }
}

