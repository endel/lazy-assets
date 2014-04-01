var fs = require('fs'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../.bowerrc'));

console.log("Hello from browserify: ", config);
