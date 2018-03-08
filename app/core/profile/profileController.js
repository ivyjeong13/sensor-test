(function () {
  'use strict';

  angular.module('mainApp').controller('profileController', function(
	  jsonService,
    $timeout,
    $constants
	){
    var $ctrl = this;
    $ctrl.$onInit = function(){
      console.log('profileController');
    };
  });
})();