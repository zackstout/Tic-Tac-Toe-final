
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = [];
var numOfGames = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

});
