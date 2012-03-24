var Sequencer;

Sequencer = (function() {

  function Sequencer(context) {
    var _this = this;
    this.context = context;
    this.nextStepTime = 0.0;
    this.stepIndex = 0;
    this.tempo = 120.0;
    loadSound('c2', function(response) {
      return _this.context.decodeAudioData(response, function(buffer) {
        return _this.buffer = buffer;
      });
    });
  }

  Sequencer.prototype.run = function() {
    var time;
    var _this = this;
    time = this.context.currentTime - this.startTime;
    while (this.nextStepTime < time + 0.04) {
      this.scheduleStep();
      this.nextStepTime += this.stepDifference();
    }
    return setTimeout((function() {
      return _this.run();
    }), 0);
  };

  Sequencer.prototype.scheduleStep = function() {
    var idealPlaytime, source;
    this.stepIndex += 1;
    source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.connect(this.context.destination);
    idealPlaytime = this.startTime + this.stepIndex * this.stepDifference();
    return source.noteOn(this.idealPlaytime);
  };

  Sequencer.prototype.stepDifference = function() {
    var secondsPerBeat;
    return secondsPerBeat = 60.0 / this.tempo;
  };

  Sequencer.prototype.start = function() {
    this.startTime = this.context.currentTime;
    return this.run();
  };

  return Sequencer;

})();
