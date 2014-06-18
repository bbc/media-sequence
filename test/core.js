'use strict';

var MediaSequence = require('../index.js');
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
      ms.on('playfrom.end', function(endTime, preventDefault){
        expect(endTime).to.equal(12);
        expect(preventDefault.toString()).to.match(/isPrevented = true/);

        done();
      });

      ms.playFrom(10, 12);

      sandbox.stub(ms, 'getCurrentTime').returns(12);
      ms.mediaElement.dispatchEvent(new Event('timeupdate'));
    });

    it('should pause the playback by default when the endTime is reached', function(done){
      var pauseStub = sandbox.stub(ms, 'pause');
      ms.playFrom(10, 12);

      // yield a time update
      sandbox.stub(ms, 'getCurrentTime').returns(12);
      ms.mediaElement.dispatchEvent(new Event('timeupdate'));

      setTimeout(function(){
        expect(pauseStub).to.have.been.calledOnce;
        done();
      }, 0);
    });
  });

  describe('getNext', function(){
    beforeEach(function(){
      ms.add([
        { start: 12, end: 18 },
        { start: 20, end: 25 },
        { start: 12, end: 14 },
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
});

