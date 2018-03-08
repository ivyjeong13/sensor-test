(function (angular){
  'use strict';

  angular.module('mainApp')
    .component('settingsProfile', {
      controller: settingsProfileController,
      templateUrl: '/core/profile/graphs/graphsProfile.html'
    });

  function settingsProfileController(){
    var $ctrl = this;
  }
})(angular);