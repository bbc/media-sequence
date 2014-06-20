'use strict';

module.exports = function(endTime, onTimeupdate){
  return (function () {
    var Scheduler = function Scheduler (event){
      var result = onTimeupdate.call(this, event.detail ? event.detail.currentTime : event.target.currentTime);

      if (result === true){
        event.target.removeEventListener('timeupdate', this);
      }
    };

    Scheduler.getEndTime = function getSchedulerEndTime(){
      return endTime;
    };

    Scheduler.postponeTo = function postponeTo(newEndTime){
      endTime = newEndTime;
    };

    return Scheduler;
  })();
};