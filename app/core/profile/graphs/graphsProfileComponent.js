(function (angular){
  'use strict';

  angular.module('mainApp')
    .component('graphsProfile', {
      controller: graphProfileController,
      templateUrl: '/core/profile/graphs/graphsProfile.html'
    });

  function graphProfileController(jsonService, $constants, $http, $timeout){
    var $ctrl = this;
    var socket;
    var unmodifiedGraph,
      diffGraph,
      histoGraph, 
      liveGraph;
    var liveData;
    var strategy = 'static';
    var DELAY = 1000;
    var FUDGE_AMT = 2.5;
    var userId;
    var chosenDate;

    /**
    * Calling /day/DDMMYYYY will bring back json
    * with DAY and dataset parameters
    */
    $ctrl.$onInit = function(){
      $ctrl.isToday = true;
      $ctrl.hasData = true;
      var today = new Date();
      chosenDate = today;
      $ctrl.dateLabel = getChosenDateLabel();

      socket = io.connect($constants.HOST + ':' + $constants.SERVER_PORT);
      console.log('trying connect');
      socket.on('connect',function(){
        userId = '_' + Math.random().toString(36).substr(2, 9);
        socket.emit('new user', userId);
      });

      getDataAndSetTables();

      // socket.on('file', function(response){
      //   var updated = response.data.map(function(item){
      //     return {
      //       x: item.x,
      //       y: item.y * FUDGE_AMT
      //     };
      //   });
      //   liveData.add(updated);
      // });
    };

    $ctrl.$onDestroy = function(){
      destroyGraphs();
      socket.close();
      //histoGraph.destroy();
    };

    $ctrl.goNext = function(){
      chosenDate.setDate(chosenDate.getDate() + 1);
      updateDate();
    };

    $ctrl.goPrev = function(){
      chosenDate.setDate(chosenDate.getDate() - 1);
      updateDate();
    };

    $ctrl.selectDate = function($event){
      $event.stopPropagation();
      chosenDate = $ctrl.chosenDate;
      $ctrl.dateDialog = false;
      updateDate();
    };

    function updateDate(){
      $ctrl.dateLabel = getChosenDateLabel();
      $ctrl.isToday = isToday() ? true : false;
      getDataAndSetTables();
    }

    function getChosenDateLabel(){
      var month = chosenDate.getMonth() + 1;
      var date = chosenDate.getDate();
      var year = chosenDate.getFullYear();

      var monthStr = month < 10 ? '0' + month.toString() : month.toString();
      var dateStr = date < 10 ? '0' + date.toString() : date.toString();
      return monthStr + '/' + dateStr + '/' + year;
    }

    function isToday(){
      var today = new Date();
      if(today.getMonth() === chosenDate.getMonth() &&
        today.getDate() === chosenDate.getDate() &&
        today.getFullYear() === chosenDate.getFullYear()){
        return true;
      }
      return false;
    }

    function getDataAndSetTables(){
      destroyGraphs();

      $ctrl.isLoading = true;
      $ctrl.hasData = true;
      $http.get('/api/day/' + getChosenDateLabel().split('/').join('')).then(function(response){
        var data = response.data;
        $ctrl.isLoading = false;
        if(data.dataset){
          console.log(convertXY(data.dataset));
          if(isToday()){
            buildLiveGraph(convertXY(data.dataset));
          } else {
            buildGraphs(convertXY(data.dataset));
          }
        } else {
          $ctrl.hasData = false;

          if(isToday()){
            buildLiveGraph([]);
          }
        }
      }, function(response){
        console.log('error occurred: ' + JSON.stringify(response));
      });
    }

    function convertXY(dataset){
      var formatted = dataset.map(function(point){
        return [ parseInt(point.timestamp), parseFloat(point.amps) * FUDGE_AMT ];
      });

      formatted.sort(function(a, b){
        return a[0] - b[0];
      });

      return formatted;

      // return dataset.map(function(point){
      //   // vis.js:
      //   var date = new Date(parseInt(point.timestamp));
      //   return {
      //     x: date,
      //     y: parseFloat(point.amps)
      //   };

      //   // highcharts.js:
      //   return [ parseInt(point.timestamp), parseFloat(point.amps) ];
      // });
    }

    function destroyGraphs(){
      if(unmodifiedGraph){
        try{ 
          unmodifiedGraph.destroy();
        } 
        catch(err){
          console.log(err);
        }      
      }
      if(diffGraph){
        diffGraph.destroy();
      }
      if(histoGraph){
        histoGraph.destroy();
      }
    }

    function buildGraphs(data){
      buildDefaultGraph(data);
      //buildDiffGraph(data);
      //buildHistoGraph(data);
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

    function buildLiveGraph(data){
      var lastTen = data.slice(-10);
      Highcharts.chart('profile-live-visualization', {
        chart: {
          zoomType: 'x',
          type: 'spline',
          animation: Highcharts.svg,
          events: {
            load: function () {
              var chart = this;
              var series = chart.series[0];
              socket.on('file', function(response){
                var updated = response.data.map(function(item){
                  return [new Date(item.x).getTime(), item.y * FUDGE_AMT];
                });

                updated.forEach(function(item){
                  series.addPoint(item, true, true);
                });
              });
            }
          },
        },
        title: {
          text: 'Amps RMS Over Time'
        },
        xAxis: {
          type: 'datetime',
        },
        yAxis: {
          title: {
            text: 'amps RMS'
          }
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'amps RMS',
          data: lastTen
        }],
        time: {
          useUTC: false
        }
      }); 
      // var stepTimer = setTimeout(renderStep, DELAY);
      // strategy = 'static';
      // liveData = new vis.DataSet();
      // var options = {
      //   start: vis.moment().add(-30, 'seconds'),
      //   end: vis.moment(),
      //   dataAxis: {
      //     left: {
      //       range: {
      //         min: 0
      //       },
      //       title: {
      //         text: 'amps RMS'
      //       }
      //     }
      //   },
      //   drawPoints: {
      //     style: 'circle'
      //   },
      //   shaded: {
      //     orientation: 'bottom'
      //   }
      // };
      // var container = document.getElementById('profile-live-visualization');
      // liveGraph = new vis.Graph2d(container, liveData, options);
    }

    function buildDefaultGraph(data){
      // viz.js:
      // var container = document.getElementById('profile-time-visualization');
      // var options = {
      //   dataAxis: {
      //     left: {
      //       range: {
      //         min:0, max: 15
      //       },
      //       title: {
      //         text: 'Amps'
      //       }
      //     }
      //   }, 
      //   drawPoints: false
      // };
      // unmodifiedGraph = new vis.Graph2d(container, data, options);
      // unmodifiedGraph.on('changed', function(){
      //   console.log('finished');
      //   $timeout(function(){ $ctrl.isLoading = false; });
      // });

      // Highcharts
      unmodifiedGraph = Highcharts.chart('profile-time-visualization', {
        chart: {
          zoomType: 'x'
        },
        title: {
          text: 'Amps RMS Usage Over Time'
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: 'amps RMS'
          }
        },
        legend: {
          enabled: false
        },
        series: [{
          type: 'line',
          name: 'amps RMS',
          data: data
        }],
        time: {
          useUTC: false
        }
      });
    }

    function buildDiffGraph(data){
      var container = document.getElementById('profile-diff-visualization');
      var options = {
        dataAxis: {
          left: {
            range: {
              min:-15, max: 15
            }
          }
        }, 
        drawPoints: false,
        start: startDate,
        end: endDate
      };

      var prevValue = 0;
      var upt_data;
      if(data){
        upt_data = data.map(function(set){
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

    function buildHistoGraph(data){
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
  }
})(angular);