var AWS = require('aws-sdk');

// env fields
var TABLE2 = process.env.TABLE2;
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

exports.getDay = function(req, res){
	var queryParams = {
      TableName: TABLE2,
      KeyConditionExpression: '#Day = :ddmmyyyy',
      ExpressionAttributeNames: {
        '#Day': 'Day'
      },
      ExpressionAttributeValues: {
        ':ddmmyyyy': req.params.date
      }
    };

    docClient.query(queryParams, function(err, data){
      if(err){
        res.status(200);
        res.json({});
        console.log(err);
      } else {
        res.status(200);
        if(!data.Items.length){
          res.json({});
        } else {
          res.json(data.Items[0]);
        }
      }
    });
};

exports.getToday = function(req, res){
  res.status(200);
	res.json({ test: 'today' });
};