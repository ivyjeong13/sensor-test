(function () {
  'use strict';

  angular.module('mainApp').controller('loginController', function(
    $location
  ){
    var $ctrl = this;
    $ctrl.$onInit = function(){
      console.log('loginController');
    };

    $ctrl.login = function(){
      $location.path('/profile');
    };
  });
})();

