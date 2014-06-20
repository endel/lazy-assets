module.exports = {
  evaluate: function(res, url, content, options) {
    res.setHeader('Content-type', 'text/plain');

    // force status 200, why it's resulting in 404 here?
    res.status(200);

    return content;
  }
}

