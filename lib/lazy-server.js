var express = require('express');
var tamper = require('tamper');
var app = express();

app.use(tamper(function(req, res) {
  // Set 'nocache' headers
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "nocache");
  res.setHeader("Expires", "0");

  return function(body) {
    return "Changing! " + body;
  };
}));
app.use(express.static(process.argv[2]));
app.listen(8080);

console.log('Listening on :8080');
