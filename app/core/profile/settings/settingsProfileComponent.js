(function (angular){
  'use strict';

  angular.module('mainApp')
    .component('settingsProfile', {
      controller: settingsProfileController,
      templateUrl: '/core/profile/settings/settingsProfile.html'
    });

  function settingsProfileController(){
    var $ctrl = this;
  }
})(angular);