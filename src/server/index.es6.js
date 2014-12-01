var matrixServer = require('matrix/server');

var http = require('http');
var express = require('express');
var path = require('path');
var app = express();
var server = http.createServer(app);
var io = matrixServer.IOSingleton.initIO(server);
var ServerMatrixWanderingSound = require('./WanderingSoundServerMatrix');

app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', function(req, res) {
  res.render('player', {title: 'The Matrix'});
});

app.get('/env', function(req, res) {
  res.render('env', {title: 'The Matrix — Environment'});
});

server.listen(app.get('port'), function () {
  console.log('Server listening on port', app.get('port'));
});

var wanderingSound = new ServerMatrixWanderingSound({ "X": 3, "Y": 2 });