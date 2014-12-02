var matrixServer = require('matrix/server');
var WanderingSoundServerSetup = require('./WanderingSoundServerSetup');
var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var httpServer = http.createServer(app);

matrixServer.ioServer.init(httpServer);

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', function(req, res) {
  res.render('player', {title: 'The Matrix'});
});

app.get('/env', function(req, res) {
  res.render('env', {title: 'The Matrix — Environment'});
});

httpServer.listen(app.get('port'), function () {
  console.log('Server listening on port', app.get('port'));
});

var setup = new WanderingSoundServerSetup({ "X": 3, "Y": 2 });
