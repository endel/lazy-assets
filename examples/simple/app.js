var fs = require('fs'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../../.bowerrc'));

console.log("Hello from browserify: ", config);

$(function() {
  $('body').on('click', function() {
    console.log("You just clicked on body element.");
  });

  $('body').on('click', '.btn.btn-lg.btn-success', function() {
    console.log("You just clicked on signup element.");
  })
});
