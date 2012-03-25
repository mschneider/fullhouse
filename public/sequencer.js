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
        return loadSound('clap2', function(response) {
          return _this.context.decodeAudioData(response, function(buffer) {
            _this.clap = buffer;
            return loadSound('hhc', function(response) {
              return _this.context.decodeAudioData(response, function(buffer) {
                _this.closedHiHat = buffer;
                return typeof cb === "function" ? cb() : void 0;
              });
            });
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
    var time;
    var _this = this;
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
    var _ref;
    this.stepIndex += 1;
    if ((this.stepIndex % 4) === 0) this.play(this.kick, time);
    if ((this.stepIndex % 8) === 4) this.play(this.clap, time);
    if ((_ref = this.stepIndex % 64) === 27 || _ref === 30) {
      this.play(this.closedHiHat, time);
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
