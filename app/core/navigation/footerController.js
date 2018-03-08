(function () {
  'use strict';

  angular.module('mainApp').controller('footerController', function(
    $constants
  ){
    var $ctrl = this;
    $ctrl.title = $constants.PROJECT_NAME;
  });
})();
