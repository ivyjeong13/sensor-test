(function () {
  'use strict';

  angular.module('mainApp')
    .factory('jsonService', jsonService);

  jsonService.$inject = ['$http', '$log', '$q'];

  function jsonService($http, $log, $q) {
    return {
      getData: getData,
      getTextData: getTextData
    };

    function getData() {
      return $http.get('assets/data/data.json')
        .then(getDataComplete)
        .catch(getDataFailed);

      function getDataComplete(response) {
        return response.data;
      }

      function getDataFailed(e) {
        var newMessage = 'XHR Failed for getData.';
        $log.error(newMessage);
        return $q.reject(e);
      }
    }

    function getTextData(time) {
      return $http.get('assets/data/text/'+time+'.txt')
        .then(compileTextToData)
        .catch(getTextFailed);

      function compileTextToData(response){
        var text = response.data;
        var lines = text.split('\n');
        var dataset = [];
        var headers = [];
        if(lines.length){
          headers = lines[0].split(',');
          lines = lines.filter(function(line){
            return line.length > 0 && line.indexOf(',') > -1;
          });
          lines.shift();
          dataset = lines.map(function( line ){
            var set = line.split(',');
            return {
              x: new Date(set[0]),
              y: parseFloat(set[1])
            };
          });

          dataset.sort(function(a, b){
            return a.x - b.x;
          });
        }

        return {
          headers: headers,
          data: dataset
        };
      }

      function getTextFailed(e){
        var newMessage = 'Failed to get text file in getText.';
        $log.error(newMessage);
        return $q.reject(e);
      }
    }
  }
})();
