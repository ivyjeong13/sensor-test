(function (angular){
  'use strict';

  angular.module('mainApp')
    .component('graphsProfile', {
      controller: graphProfileController,
      templateUrl: '/core/profile/graphs/graphsProfile.html'
    });

  function graphProfileController(jsonService){
    var $ctrl = this;
    var socket;
    var unmodifiedGraph,
      diffGraph,
      histoGraph, 
      liveGraph;
    var data = [];
    var liveData;
    var strategy = 'static';
    var DELAY = 1000;
    var userId;

    $ctrl.$onInit = function(){
      buildGraphs();

      socket = io.connect('http://localhost:8000');
      console.log('trying connect');
      socket.on('connect',function(){
        userId = '_' + Math.random().toString(36).substr(2, 9);
        socket.emit('new user', userId);
      });

      socket.on('file', function(response){
        liveData.add(response.data);
      });
    };

    function buildGraphs(){
      buildLiveGraph();
      buildDefaultGraph();
      buildDiffGraph();
      //buildHistoGraph();
    }

    function renderStep(){
      var now = vis.moment();
      var range = liveGraph.getWindow();
      var interval = range.end - range.start;
      
      if (now > range.end) {
        liveGraph.setWindow(now - 0.1 * interval, now + 0.9 * interval);
      }
      setTimeout(renderStep, DELAY);
    }

    function buildLiveGraph(){
      var stepTimer = setTimeout(renderStep, DELAY);
      strategy = 'static';
      liveData = new vis.DataSet();
      var options = {
        start: vis.moment().add(-30, 'seconds'),
        end: vis.moment(),
        dataAxis: {
          left: {
            range: {
              min: 0, max: 100
            }
          }
        },
        drawPoints: {
          style: 'circle'
        },
        shaded: {
          orientation: 'bottom'
        }
      };
      var container = document.getElementById('profile-live-visualization');
      liveGraph = new vis.Graph2d(container, liveData, options);
    }

    function buildDefaultGraph(){
      var container = document.getElementById('profile-time-visualization');
      var options = {
        dataAxis: {
          left: {
            range: {
              min:0, max: 100
            }
          }
        }, 
        drawPoints: {
          style: 'circle'
        },
        shaded: {
          orientation: 'bottom'
        }
      };
      unmodifiedGraph = new vis.Graph2d(container, data, options);
    }

    function buildDiffGraph(){
      var container = document.getElementById('profile-diff-visualization');
      var options = {
        dataAxis: {
          left: {
            range: {
              min:-100, max: 100
            }
          }
        }, 
        drawPoints: {
          style: 'circle'
        },
        shaded: {
          orientation: 'bottom'
        }
      };

      var prevValue = 0;
      var upt_data = [];
      if(data){
        data.map(function(set){
          var newYValue = set.y - prevValue;
          prevValue = set.y;
          return {
            x: set.x,
            y: newYValue
          };
        });
      }

      diffGraph = new vis.Graph2d(container, upt_data, options);
    }

    function buildHistoGraph(){
      var numberOfBuckets = 10; 
      var maxBucketValue = 120; 
      var buckets = createBuckets(numberOfBuckets, maxBucketValue);
      console.log(buckets);

      var copy = data;
      var interval = (60/5)*15;
      var avg;
      while(copy.length > interval){
        var cut = copy.splice(0, interval);
        avg = getAverage(cut);
      }
      if(copy.length > 0){
        avg = getAverage(copy);
      }

      // var container = document.getElementById('profile-histogram-visualization');
      // histoGraph = new vis.Graph2d(container, upt_data, options);
    }

    function createBuckets(numberOfBuckets, maxBucketValue){
      var buckets = [];
      var incr = maxBucketValue / numberOfBuckets;
      for(var i = 0; i < incr - 1; i++){
        buckets.push({
          min: incr * i,
          max: incr * (i+1) - 1,
          label: (incr * i) + ' - ' + (incr * (i+1) - 1)
        });
      }
      return buckets;
    }

    function getAverage(arr){
      var total = 0;
      arr.forEach(function(item){
        total += item.y;
      });
      return total / arr.length;
    }

    $ctrl.$onDestroy = function(){
      liveGraph.destroy();
      unmodifiedGraph.destroy();
      diffGraph.destroy();
      socket.close();
      //histoGraph.destroy();
    };
  }
})(angular);