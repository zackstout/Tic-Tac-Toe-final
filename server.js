
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
  // does it need an argument? Apparently not
  socket.on('logon', function() {
    userIds.push(socket.id);
    // Send a response to client or other users (update list of all online users):
    io.emit('ids', userIds);
  });

  socket.on('makeMove', function(move) {
    console.log(move);
    for (var i=0; i < numOfGames; i++) {
      var game = games[i];
      // match the move with its game (if there are multiple games occurring):
      if (game.id == move.gameId) {
        if (move.player == game.p1) {
          game.vals[move.clickedCell] = 'X';
        } else {
          game.vals[move.clickedCell] = 'o';
        }
        // keep track of whose move it is (will be true iff p1 is to move):
        game.mover = !game.mover;
        // remember which one was just clicked for drawing to the other client:
        game.justMoved = move.clickedCell;
        io.emit('makeMove', game);
      }
    }
  });

  socket.on('invite', function(inv) {
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
      mover: true
    };
    games.push(game);
    io.emit('startGame', game);

    numOfGames ++;
  });

  // Update list of online users:
  socket.on('disconnect', function(){
    // console.log('user disconnected', socket.id);
    userIds.splice(userIds.indexOf(socket.id), 1);
    io.emit('ids', userIds);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
