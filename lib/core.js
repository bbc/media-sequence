'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

/**
 *
 * @param el
 * @param sequences
 * @constructor
 */
function MediaSequence (el, sequences) {
  if ((el instanceof HTMLMediaElement) === false) {
    throw new TypeError('The element argument should be an instance of HTMLMediaElement.');
  }

  this.mediaElement = el;

  this.sequences = [];

  this.add(sequences || []);
}

inherits(MediaSequence, EventEmitter);

/**
 *
 * @param sequences
 */
MediaSequence.prototype.add = function (sequences) {
  if (!Array.isArray(sequences)) {
    throw new TypeError('The sequences argument should be an array of {start, end} objects.')
  }

  this.sequences = this.sequences
    .concat(sequences)
    .sort(function ascByStartTimeAndLength(a, b){
      return a.start - b.start && b.end - a.end ? -1 : 0;
    })
    .sort(function(a, b){
      return a.start - b.start;
    });

  return this;
};

/**
 * Returns the next sequence in time after the current one.
 *
 * @param referenceTime {Number}
 * @returns {Object|null}
 */
MediaSequence.prototype.getNext = function getNextSequence(referenceTime){
  var sequences = this.sequences.filter(function unionFilter(sequence){
    return sequence.start > referenceTime;
  });

  return sequences[0] || null;
};

MediaSequence.prototype.getPrevious = function getPreviousSequence(referenceTime){

};

/**
 * Mostly here to enables stubbing.
 *
 * @api
 * @returns {Number}
 */
MediaSequence.prototype.getMediaDuration = function getMediaDuration () {
  return this.mediaElement.duration;
};

MediaSequence.prototype.seek = function seekMediaPosition(time){
  this.mediaElement.currentTime = time;

  return this;
};

/**
 *
 * @returns {MediaSequence}
 */
MediaSequence.prototype.play = function play () {
  this.mediaElement.play();

  return this;
};

/**
 *
 * @returns {MediaSequence}
 */
MediaSequence.prototype.pause = function pause () {
  this.mediaElement.pause();

  return this;
};

MediaSequence.prototype.getCurrentTime = function getCurrentTime(){
  return this.mediaElement.currentTime;
};

/**
 *
 * @returns {MediaSequence}
 */
MediaSequence.prototype.playAll = function playAll () {
  var selfie = this;

  this.on('playfrom.end', function (endTime, preventDefault) {
    var nextSegment = selfie.getNextSegment(endTime);

    if (nextSegment === null) {
      return;
    }

    // if segments are overlapping this will start at the beginning of the segment
    // we rather want to call something like postponeTo(nextSegment.endTime) to address the issue.
    selfie.playNext(nextSegment.start);
  });

  this.seek(0);
  return this.playNext();
};

/**
 * Starts a playback from `startTime` and ends at `endTime`
 *
 * @param startTime {Number}
 * @param endTime {Number=}
 * @returns {MediaSequence}
 */
MediaSequence.prototype.playFrom = function playFrom (startTime, endTime) {
  var selfie = this;
  endTime = endTime || this.getMediaDuration();

  if ((startTime >= 0) === false) {
    throw new TypeError('startTime should be a valid HTMLMediaElement time value.');
  }

  if (startTime >= this.getMediaDuration()) {
    throw new RangeError('startTime value should be lower than its duration.');
  }

  if (endTime <= startTime) {
    throw new RangeError('endTime should be further in time that the startTime value.');
  }

  var stopPlayback = (function () {
    var isPrevented = false;

    var stopPlayback = function stopPlayback (callback) {
      if (isPrevented === false) {
        callback.apply(null);
      }
    };

    stopPlayback.preventDefault = function preventDefaultPlayback () {
      isPrevented = true;
    };

    stopPlayback.isPrevented = function () {
      return isPrevented;
    };

    return stopPlayback;
  })();

  this.seek(startTime);

  /*
   When we reach the end of the playback, we hook
   */
  this.once('playfrom.end', stopPlayback.bind(null, this.pause.bind(this)));

  this.mediaElement.addEventListener('timeupdate', function playFromTimeWatcher () {
    if (selfie.getCurrentTime() >= endTime) {
      selfie.emit('playfrom.end', endTime, stopPlayback.preventDefault);

      // cancels the listener once its done
      return true;
    }
  });

  return this.play();
};


/**
 *
 * @param referenceTime
 * @returns {MediaSequence}
 */
MediaSequence.prototype.playNext = function playNext (referenceTime) {
  var nextSequence = this.getNext(referenceTime || this.getCurrentTime());

  if (nextSequence) {
    this.playFrom(nextSequence.start, nextSequence.end);
  }

  return this;
};

module.exports = MediaSequence;