var spawn = require('child_process').spawn;
var client = spawn('python', ['test.py']);

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = [];

var URL = 'stream';

var sockets = {};

io.of('/data').on('connection', function(socket){
  var userId;
	socket.on('new user', function(id){
		console.log('new user: ' + id);
    userId = id;
		users.push({
			id: userId,
			socket: socket
		});
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

app.use(express.static(__dirname + '/' + URL));
http.listen(8080, function(){
	console.log('listening on *:8080');
});