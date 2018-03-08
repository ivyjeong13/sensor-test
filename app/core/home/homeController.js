var tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady(){
  player = new YT.Player('youTubePlayer', {
    height: '100%',
    width: '100%', 
    playerVars: {
      'showinfo': 0,
      'autoplay': 1,
      'controls': 0
    },
    videoId: 'xYFeu4Yx15M',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event){
  loopStart();
  player.mute();
  player.setPlaybackQuality('highres');
  player.playVideo(0);
}

function loopStart(){
  player.seekTo(100);
}

function onPlayerStateChange(event){
  if(event.data === YT.PlayerState.PLAYING){
    setTimeout(loopStart, 24000);
  }
}

(function () {
  'use strict';

  angular.module('mainApp').controller('homeController', function(
	  jsonService,
    $timeout,
    $constants, 
    $window
	){
    var $ctrl = this;
    $ctrl.blackout = true;

    var DELAY = 1000;
    var index = 0;
    var data,
      options, 
      graph2d, 
      strategy, 
      container, 
      dataset;

    function renderStep() {
      // move the window (you can think of different strategies).
      var now = vis.moment();
      var range = graph2d.getWindow();
      var interval = range.end - range.start;
      switch (strategy.value) {
        case 'continuous':
          // continuously move the window
          graph2d.setWindow(now - interval, now, {animation: false});
          requestAnimationFrame(renderStep);
          break;

        case 'discrete':
          graph2d.setWindow(now - interval, now, {animation: false});
          setTimeout(renderStep, DELAY);
          break;

        default: // 'static'
          // move the window 90% to the left when now is larger than the end of the window
          if (now > range.end) {
            graph2d.setWindow(now - 0.1 * interval, now + 0.9 * interval);
          }
          setTimeout(renderStep, DELAY);
          break;
      }
    }

    /**
     * Add a new datapoint to the graph
     */
    function addDataPoint() {
      // add a new data point to the dataset
      var now = vis.moment();
      dataset.add({
        x: now,
        y: data[index].watts
      });
      index++;

      // remove all data points which are no longer visible
      var range = graph2d.getWindow();
      var interval = range.end - range.start;
      var oldIds = dataset.getIds({
        filter: function (item) {
          return item.x < range.start - interval;
        }
      });
      dataset.remove(oldIds);

      setTimeout(addDataPoint, DELAY);
    }

    function y(x){
      return (Math.sin(x/2) + Math.cos(x/4)) * 5;
    }

    function init(){
      strategy = 'static';
      dataset = new vis.DataSet();
      options = {
        start: vis.moment().add(-30, 'seconds'),
        end: vis.moment(),
        dataAxis: {
          left: {
            range: {
              min: 0, max: 40
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
      container = document.getElementById('visualization');
      graph2d = new vis.Graph2d(container, dataset, options);

      renderStep();
      addDataPoint();
    }

    $ctrl.$onInit = function(){
      $ctrl.title = $constants.PROJECT_NAME;
      $ctrl.blurb = true;

      jsonService.getData().then(function(response){
        data = response.sort(function(a, b){
          return a.date > b.date;
        });
        init();
      });

      $timeout(function(){
        $ctrl.blackout = false;
      }, 1500);

      if(player){
        onYouTubeIframeAPIReady();
      }

      angular.element($window).bind('scroll', function(){
        $ctrl.st = window.pageYOffset;
        if($ctrl.st > window.innerHeight / 3 && !$ctrl.fade){
          $timeout(function(){
            $ctrl.fade = true;
          });
        } else if ($ctrl.st <= window.innerHeight / 3 && $ctrl.fade){
          $timeout(function(){
            $ctrl.fade = false;
          });
        }

        if($ctrl.st > window.innerHeight && $ctrl.blurb){
          $timeout(function(){
            $ctrl.blurb = false;
          });
        } else if($ctrl.st <= window.innerHeight && !$ctrl.blurb){
          $timeout(function(){
            $ctrl.blurb = true;
          });
        }
      });
    };

    $ctrl.$onDestroy = function(){
      graph2d.destroy();
    };
  });
})();