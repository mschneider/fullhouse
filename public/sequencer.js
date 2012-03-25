var Sequencer;

Sequencer = (function() {

  function Sequencer(context, output, checkFn, tempo, cb) {
    var _this = this;
    this.context = context;
    this.output = output;
    this.checkFn = checkFn;
    this.tempo = tempo;
    this.nextStepTime = 0.0;
    this.stepIndex = -1;
    loadSound('kick', function(response) {
      return _this.context.decodeAudioData(response, function(buffer) {
        _this.kick = buffer;
        return loadSound('clap', function(response) {
          return _this.context.decodeAudioData(response, function(buffer) {
            _this.clap = buffer;
            return typeof cb === "function" ? cb() : void 0;
          });
        });
      });
    });
  }

  Sequencer.prototype.play = function(sample, time) {
    var source;
    source = this.context.createBufferSource();
    source.buffer = sample;
    source.connect(this.context.destination);
    return source.noteOn(time);
  };

  Sequencer.prototype.run = function() {
    var time,
      _this = this;
    time = this.context.currentTime - this.startTime;
    while (this.nextStepTime < time + 0.04) {
      this.scheduleStep(this.startTime + time);
      this.nextStepTime += this.stepDifference();
    }
    return setTimeout((function() {
      return _this.run();
    }), 0);
  };

  Sequencer.prototype.scheduleStep = function(time) {
    var source;
    this.stepIndex += 1;
    if ((this.stepIndex % 4) === 0) {
      source = this.context.createBufferSource();
      source.buffer = this.kick;
      source.connect(this.context.destination);
      source.noteOn(time);
    }
    return this.checkFn(function(states) {
      var state, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = states.length; _i < _len; _i++) {
        state = states[_i];
        state.sound.play(state.note, time);
        _results.push(console.log(state.note));
      }
      return _results;
    });
  };

  Sequencer.prototype.stepDifference = function() {
    var secondsPerBeat;
    return secondsPerBeat = 60.0 / (4 * this.tempo);
  };

  Sequencer.prototype.start = function() {
    this.startTime = this.context.currentTime;
    return this.run();
  };

  return Sequencer;

})();
