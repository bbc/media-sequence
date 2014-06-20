'use strict';

var MediaSequence = require('../index.js');
var Scheduler = require('../lib/scheduler.js');
var sinon = require('sinon');

describe('MediaSequence', function(){
  var ms, sandbox, playStub, seekStub;

  beforeEach(function(done){
    var mediaElement = new Audio('base/test/fixture.ogg');
    mediaElement.preload = 'auto';
    mediaElement.muted = true;

    sandbox = sinon.sandbox.create();
    ms = new MediaSequence(mediaElement);

    playStub = sandbox.stub(ms, 'play');
    seekStub = sandbox.stub(ms, 'seek');

    mediaElement.addEventListener('canplaythrough', function(){
      sandbox.stub(ms, 'getMediaDuration').returns(30);

      done();
    });
  });

  afterEach(function(){
    sandbox.restore();
  });

  describe('playFrom', function(){
    it('should raise an error if the end time is further than the duration', function(){
      expect(function(){
        ms.playFrom(10000000, 12000000);
      }).to.throw(RangeError);
    });

    it('should raise an error if the startTime is not a valid time value', function (){
      expect(function(){
        ms.playFrom(NaN);
      }).to.throw(TypeError);
    });

    it('should raise an error if the startTime is not a valid time value', function (){
      expect(function(){
        ms.playFrom(7, 5);
      }).to.throw(/^endTime/);
    });

    it('should request to change the playback to the requested position', function (){
      ms.playFrom(10, 12);

      expect(seekStub).to.have.been.calledWithExactly(10);
    });

    it('should also start the playback', function (){
      ms.playFrom(10, 12);

      expect(playStub).to.have.been.calledOnce;
    });

    it('should trigger a playfrom.end when the endTime is reached', function(done){
      ms.on('playfrom.end', function(endTime, instance){
        expect(endTime).to.equal(12);

        done();
      });

      ms.playFrom(10, 12);
      ms.mediaElement.dispatchEvent(new CustomEvent('timeupdate', { detail: { currentTime: 12 } }));
    });

    it('should pause the playback by default when the endTime is reached', function(done){
      var pauseStub = sandbox.stub(ms, 'pause');
      ms.playFrom(10, 12);

      ms.mediaElement.dispatchEvent(new CustomEvent('timeupdate', { detail: { currentTime: 12 } }));

      setTimeout(function(){
        expect(pauseStub).to.have.been.calledOnce;
        done();
      }, 0);
    });
  });

  describe('getNext', function(){
    beforeEach(function(){
      ms.add([
        { start: 20, end: 25 },
        { start: 12, end: 14 },
        { start: 12, end: 18 },
        { start: 10, end: 15 }
      ]);
    });

    it('should select a sequence starting at 10 if the reference time is 0', function(){
      expect(ms.getNext(0)).to.have.property('start', 10);
    });

    it('should select the next sequence starting at 12 if the reference time coincides with the beginning of a sequence starting at 10', function(){
      expect(ms.getNext(10)).to.have.property('start', 12);
    });

    it('should select the next sequence starting at 12 if the reference time is included in a sequence starting at 10', function(){
      expect(ms.getNext(11)).to.have.property('start', 12);
    });

    it('should select the farther ending sequence for an equal start time of 12', function(){
      expect(ms.getNext(11)).to.have.property('end', 18);
    });

    it('should not return any sequence for a start time greater or equal to 20', function(){
      expect(ms.getNext(20)).to.be.a('null');
    });
  });

  describe('playAll', function(){
    var scheduler;

    beforeEach(function(){
      scheduler = new Scheduler();
      ms.add([
        { start: 10, end: 15 },
        { start: 12, end: 14 },
        { start: 12, end: 18 },
        { start: 20, end: 25 }
      ]);
    });

    it('should play the first sequence starting at 10', function(){
      var spy = sandbox.spy(ms, 'playFrom');

      ms.playAll();

      expect(spy).to.be.calledWith(10, 15);
    });

    it('should then postpone from 15 to 18, as of the next ending segment', function(done){
      var spy = sandbox.spy(scheduler, 'postponeTo');

      ms.playAll();
      ms.emit('playfrom.end', ms.sequences[0], scheduler);

      process.nextTick(function(){
        expect(spy).to.be.calledWith(18);

        done();
      });
    });

    it('should then play the sequence starting at 20', function(done){
      var spy = sandbox.spy(ms, 'playFrom');

      ms.playAll();
      ms.emit('playfrom.end', ms.sequences[1], scheduler);

      process.nextTick(function(){
        expect(spy.lastCall).to.be.calledWith(20, 25);

        done();
      });
    });

    it('should then not try to play any other sequence once reached 25', function(done){
      var spy = sinon.spy();
      var scheduler = new Scheduler(0, spy);

      ms.playAll();
      ms.emit('playfrom.end', ms.sequences[3], scheduler);

      process.nextTick(function(){
        expect(spy).to.be.calledOnce;

        done();
      });
    });

    it('should also stop the playback once reached 25', function(done){
      var spy = sandbox.spy(ms, 'pause');

      ms.playAll();
      ms.emit('playfrom.end', ms.sequences[3], scheduler);

      process.nextTick(function(){
        expect(spy).to.be.calledOnce;

        done();
      });
    });
  });
});

