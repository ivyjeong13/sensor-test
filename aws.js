var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-2'
});

var dynamodb = new AWS.DynamoDB();
var docClient = new AWS.DynamoDB.DocumentClient();

var params = {
  TableName: 'sensor',
  Item: {
    'timestamp': Math.floor(Date.now()),
    'amps': 20
  }
};

docClient.put(params, function(err, data){
  if(err){
    console.log(err);
  } else {
    console.log('put succeeded: ');
    console.log(params);
  }
});