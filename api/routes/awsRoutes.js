'use strict';
module.exports = function(app){
	var dataController = require('../controllers/awsController');

	app.route('/api/day')
		.get(dataController.getToday);
		
	app.route('/api/day/:date')
		.get(dataController.getDay);
};