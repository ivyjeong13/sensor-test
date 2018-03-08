(function () {
  'use strict';

  angular.module('mainApp').controller('headerController', function(
  		$window,
  		$timeout,
      $constants,
      $stateParams,
      $location,
      $anchorScroll
  	){
    var $ctrl = this;

    $ctrl.goTo = function(linkId){
      $location.hash(linkId);
      $anchorScroll.yOffset = 75;
      $anchorScroll();
    };

    $ctrl.goToLogin = function(){
      $location.path('/login');
    };

    $ctrl.$onInit = function(){
      $ctrl.title = $constants.PROJECT_NAME;
      $ctrl.links = $stateParams.links ? $constants[$stateParams.links] : [];

	    $ctrl.direction = 'down';
	    $ctrl.lastScrollTop = 0;
    	angular.element($window).bind('scroll', function(){
    		$ctrl.st = window.pageYOffset;
    		if($ctrl.st > $ctrl.lastScrollTop){
    			if($ctrl.direction !== 'up'){
    				$timeout(function(){ 
    					$ctrl.direction = 'up';
    				});
    			}
    		} else {
    			if($ctrl.direction !=='down'){
    				$timeout(function(){ 
    					$ctrl.direction = 'down';
    				});
    			}
    		}

    		$ctrl.lastScrollTop = $ctrl.st;
    	});
    };
  });
})();
