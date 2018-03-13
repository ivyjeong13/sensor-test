var express = require('express');
var app = express();
var server = require('http').Server(app);
var spawn = require('child_process').spawn;
var client = spawn('python', ['test.py']);
var io = require('socket.io')(server);
var users = [];
var sockets = {};

// env fields
var ENV_TABLE = process.env.TABLE;
var ENV_REGION = process.env.REGION;
var ENDPOINT = process.env.ENDPOINT; // make sure this is localdb

// Amazon Web Services stuff.
var AWS = require('aws-sdk');
AWS.config.update({
  region: ENV_REGION
});

if(ENDPOINT){
  AWS.config.update({
    endpoint: ENDPOINT
  });
}

var docClient = new AWS.DynamoDB.DocumentClient();

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

function emitToSockets(data){
  Object.keys(users).forEach(function(id){
    var user = users[id];
    user.socket.emit('file', data);
  });
}

function sendToLocalDB(dataset){
  dataset.forEach(function(data){
    var params = {
      TableName: ENV_TABLE,
      Item: {
        'timestamp': data.x.getTime(),
        'amps': data.y
      }
    };

    console.log(params);

    docClient.put(params, function(err, data){
      if(err){
        console.log('dynamoDB failed: ' + err);
      } else {
        console.log('put succeeded');
      }
    });
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
          x: new Date(parseInt(set[1])),
          y: parseFloat(set[0])
        };
      });
    }

    return {
      data: dataset
    };
}

client.stdout.on('data', function(message){
  console.log(message.toString());
  var convert = convertDataset(message.toString());
  //sendToLocalDB(convert.data);
  emitToSockets(convert);
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

app.set('port', (process.env.PORT || 8080));

app.use(express.static(__dirname + '/app'));

var routes = require('./api/routes/awsRoutes');
routes(app);

server.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
