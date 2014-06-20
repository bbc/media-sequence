'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var Scheduler = require('./scheduler.js');

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
      return a.start - b.start && b.end - a.end ? -1 : 1;
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
MediaSequence.prototype.getNext = function getNextSequence(referenceTime, options){
  options = options || {};

  var sequences = this.sequences.filter(function unionFilter(sequence){
    return sequence.start > referenceTime || (Boolean(options.overlap) && sequence.end > referenceTime);
  });

  return sequences[0] || null;
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

/**
 *
 * @returns {MediaSequence}
 */
MediaSequence.prototype.playAll = function playAll () {
  var selfie = this;
  var firstSequence = this.getNext(0);

  if (!firstSequence) {
    throw new RangeError('There is no sequence to play.');
  }

  var scheduler = new Scheduler(firstSequence, function onTimeupdate(currentTime){
    // the current sequence is not over yet, skip the beat.
    if (currentTime < this.getSequence().end) {
      return;
    }

    var nextSequence = selfie.getNext(currentTime, { overlap: true });

    if (nextSequence === null){
      selfie.pause();
      selfie.emit('playall.end', selfie);

      return true;
    }

    // the actual sequence is over but the next sequence overlaps with it
    // we want to postpone the scheduler to the end of the next sequence
    if (nextSequence.start <= this.getEndTime()){
      selfie.emit('playall.postpone', nextSequence);
      scheduler.postponeToSequenceEnd(nextSequence);
      return;
    }

    // otherwise we jump to the beginning of the next sequence
    // and schedule a new end time
    selfie.emit('playall.sequence', nextSequence);
    scheduler.postponeToSequenceStart(nextSequence);
    selfie.seek(firstSequence.start);
  });

  this.mediaElement.addEventListener('timeupdate', scheduler.bind(scheduler));

  this.seek(firstSequence.start);
  return this.play();
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

  var scheduler = new Scheduler(endTime, function onTimeupdate(currentTime){
    if (currentTime >= this.getEndTime()) {
      selfie.pause();
      selfie.emit('playfrom.end', this.getEndTime(), selfie);

      return true;
    }
  });

  this.seek(startTime);

  this.mediaElement.addEventListener('timeupdate', scheduler.bind(scheduler));

  return this.play();
};


/**
 *
 * @param referenceTime
 * @returns {MediaSequence}
 */
MediaSequence.prototype.playNext = function playNext () {
  var nextSequence = this.getNext(this.mediaElement.currentTime);

  if (nextSequence) {
    this.playFrom(nextSequence.start, nextSequence.end);
  }

  return this;
};

module.exports = MediaSequence;