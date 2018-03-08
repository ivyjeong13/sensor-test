angular.module('mainApp')
	.constant('$constants',{
		PROJECT_NAME: 'Project Name',
		HOME_NAVIGATION: [
			{name: 'Our Goals', id: 'home_section_1'}, 
			{name: 'Technology', id: 'home_section_2'}, 
			{name: 'Flexibility', id: 'home_section_3'}
		],
		HOST: 'localhost'
	});