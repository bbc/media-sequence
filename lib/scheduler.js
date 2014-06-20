'use strict';

module.exports = function(sequence, onTimeupdate){
  return (function () {
    // backward compatibility
    if (typeof sequence === 'number'){
      sequence = { start: null, end: sequence };
    }

    var currentSequence = sequence;
    var endTime = sequence.end;

    var Scheduler = function Scheduler (event){
      var result = onTimeupdate.call(this, event.detail ? event.detail.currentTime : event.target.currentTime);

      if (result === true){
        event.target.removeEventListener('timeupdate', this);
      }
    };

    Scheduler.getEndTime = function getSchedulerEndTime(){
      return endTime;
    };

    Scheduler.getSequence = function getSchedulerSequence(){
      return currentSequence;
    };

    Scheduler.postponeTo = function postponeTo(newEndTime){
      endTime = newEndTime;
    };

    Scheduler.postponeToSequenceStart = function postponeToSequenceStart(sequence){
      currentSequence = sequence;
      this.postponeTo(sequence.start);
    };

    Scheduler.postponeToSequenceEnd = function postponeToSequenceEnd(sequence){
      currentSequence = sequence;
      this.postponeTo(sequence.end);
    };

    return Scheduler;
  })();
};