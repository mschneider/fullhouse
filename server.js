var express = require('express');
var app = express.createServer();


app.use(express.static('public'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});