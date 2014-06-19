'use strict';

module.exports = function(endTime, onComplete){
  return (function () {
    var isPrevented = false;
    var Scheduler = function Scheduler () {

    };

    Scheduler.onPlaybackEnd = onComplete || function(){};

    Scheduler.postponeTo = function postponeTo(newEndTime){
      endTime = newEndTime;
      isPrevented = false;
    };

    Scheduler.preventDefault = function preventDefaultPlayback () {
      isPrevented = true;
    };

    Scheduler.isPrevented = function () {
      return isPrevented;
    };

    return Scheduler;
  })();
};