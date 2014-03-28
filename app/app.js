var fs = require('fs'),
    config = JSON.parse(fs.readFileSync(__dirname + '/../.dl-config'));

console.log(config);
