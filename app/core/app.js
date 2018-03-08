(function () {
	'use strict';
	var appModule = angular.module('mainApp', ['ui.bootstrap', 'ui.router']);
	appModule.config(function($stateProvider, $urlRouterProvider){
		$urlRouterProvider.otherwise('/home');
		$stateProvider
			.state('home', {
				url: '/home',
				params: {
					links: 'HOME_NAVIGATION'
				},
				views: {
					'content': {
						templateUrl: 'core/home/home.html',
						controller: 'homeController',
						controllerAs: '$ctrl'
					},
					'header': {
						templateUrl: 'core/navigation/header.html',
						controller: 'headerController',
						controllerAs: '$ctrl'
					},
					'footer': {
						templateUrl: 'core/navigation/footer.html',
						controller: 'footerController',
						controllerAs: '$ctrl'
					}
				}
			})
			.state('profile', {
				url: '/profile',
				views: {
					'content': {
						templateUrl: 'core/profile/profile.html',
						controller: 'profileController',
						controllerAs: '$ctrl'
					},
					'header': {
						templateUrl: 'core/navigation/header.html',
						controller: 'headerController',
						controllerAs: '$ctrl'
					},
					'footer': {
						templateUrl: 'core/navigation/footer.html',
						controller: 'footerController',
						controllerAs: '$ctrl'
					}
				}
			})
			.state('login', {
				url: '/login',
				views: {
					'content': {
						templateUrl: 'core/login/login.html',
						controller: 'loginController',
						controllerAs: '$ctrl'
					},
					'header': {
						templateUrl: 'core/navigation/header.html',
						controller: 'headerController',
						controllerAs: '$ctrl'
					},
					'footer': {
						templateUrl: 'core/navigation/footer.html',
						controller: 'footerController',
						controllerAs: '$ctrl'
					}
				}
			});
	});
})();
