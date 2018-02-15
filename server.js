
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = [];
var numOfGames = 0;
var userIds = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  // does it need an argument?
  socket.on('logon', function() {
    userIds.push(socket.id);
    // Send a response to client or other users:
    io.emit('logon', socket.id);
    io.emit('ids', userIds);
  });

  socket.on('makeMove', function(move) {
    console.log(move);
    for (var i=0; i < numOfGames; i++) {
      if (games[i].id == move.gameId) {
        if (move.player == 1) {
          games[i].vals[move.clickedCell] = 'X';
        } else {
          games[i].vals[move.clickedCell] = 'o';
        }
        io.emit('makeMove', games[i]);
      }
    }
  });

  socket.on('invite', function(inv) {
    // console.log(inv);
    console.log(inv.from == socket.id);
    socket.broadcast.to(inv.to).emit('msg', inv.from);
  });

  socket.on('startGame', function(players) {
    var p1 = players.p1;
    var p2 = players.p2;
    var game = {
      id: numOfGames,
      p1: p1,
      p2: p2,
      vals: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      mover: p1
    };
    games.push(game);
    io.emit('startGame', game);

    numOfGames ++;
  });

  socket.on('disconnect', function(){
    console.log('user disconnected', socket.id);
    userIds.splice(userIds.indexOf(socket.id), 1);
    io.emit('ids', userIds);
  });


});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
