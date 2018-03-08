var express = require('express');
var app = express();
var server = require('http').Server(app);
var spawn = require('child_process').spawn;
var client = spawn('python', ['test.py']);
var io = require('socket.io')(server);
var users = [];
var sockets = {};

io.on('connection', function(socket){
  console.log('someone connected');
  var userId;
  socket.on('new user', function(id){
    console.log('new user: ' + id);
    userId = id;
    users.push({
      id: userId,
      socket: socket
    });
  });

  socket.on('disconnect', function(){
    console.log('someone disconnected');
  });
});

function emitToSockets(message){
  Object.keys(users).forEach(function(id){
    var user = users[id];
    var convert = convertDataset(message);
    console.log('emit to user: ' + user.id);
    console.log(convert);
    user.socket.emit('file', convert);
  });
}

function convertDataset(text, userId){
    var lines = text.split('\n');
    if(lines.length){
      lines = lines.filter(function(line){
        return line.indexOf(',') > -1;
      });
      dataset = lines.map(function( line ){
        var set = line.split(',');
        return {
          x: new Date(parseInt(set[0])),
          y: parseFloat(set[1])
        };
      });
    }

    return {
      data: dataset
    };
}

client.stdout.on('data', function(message){
  console.log(message.toString());

  emitToSockets(message.toString());
});

client.stderr.on('data', function(message){
  console.log(message.toString());
});

client.on('close', function(){
  console.log('close');
});

client.on('exit', function(){
  console.log('exit');
});

client.on('disconnect', function(){
  console.log('disconnect');
});

app.set('port', (process.env.PORT || 8000));

app.use(express.static(__dirname + '/app'));

server.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
